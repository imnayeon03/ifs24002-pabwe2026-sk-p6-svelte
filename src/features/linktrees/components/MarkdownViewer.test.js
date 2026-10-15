import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/svelte";
import MarkdownViewer from "./MarkdownViewer.svelte";

const mockSetMarkdown = vi.fn();
const mockDestroy = vi.fn();

vi.mock("@toast-ui/editor/dist/toastui-editor-viewer", () => {
  return {
    default: vi.fn().mockImplementation(function (options) {
      this.options = options;
      this.setMarkdown = mockSetMarkdown;
      this.destroy = mockDestroy;
    }),
  };
});

describe("MarkdownViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize viewer with initial content and update on content prop change", async () => {
    const { container, rerender, unmount } = render(MarkdownViewer, {
      props: {
        content: "Halo Dunia",
      },
    });

    expect(container.querySelector('[data-testid="markdown-viewer"]')).toBeTruthy();

    // Viewer dimuat secara lazy (dynamic import), tunggu sampai terinisialisasi
    const ViewerMock = (await import("@toast-ui/editor/dist/toastui-editor-viewer")).default;
    await waitFor(() => expect(ViewerMock).toHaveBeenCalled());

    await rerender({ content: "Perubahan Markdown" });
    expect(mockSetMarkdown).toHaveBeenCalledWith("Perubahan Markdown");

    await rerender({ content: "" });
    expect(mockSetMarkdown).toHaveBeenCalledWith("");

    unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });

  it("should initialize viewer with default empty content", () => {
    const { container } = render(MarkdownViewer);
    expect(container.querySelector('[data-testid="markdown-viewer"]')).toBeTruthy();
  });

  it("should handle unmount when viewer fails to initialize", async () => {
    const ViewerMock = (await import("@toast-ui/editor/dist/toastui-editor-viewer")).default;
    ViewerMock.mockImplementationOnce(function () {
      throw new Error("Viewer initialization failed");
    });
    const { unmount } = render(MarkdownViewer, { props: { content: "test" } });
    await waitFor(() => expect(ViewerMock).toHaveBeenCalled());
    unmount();
  });

  it("should not create the Viewer when unmounted before the lazy import resolves", async () => {
    const ViewerMock = (await import("@toast-ui/editor/dist/toastui-editor-viewer")).default;
    ViewerMock.mockClear();

    const { unmount } = render(MarkdownViewer, { props: { content: "x" } });
    unmount();
    await new Promise((r) => setTimeout(r, 50));

    expect(ViewerMock).not.toHaveBeenCalled();
  });
});
