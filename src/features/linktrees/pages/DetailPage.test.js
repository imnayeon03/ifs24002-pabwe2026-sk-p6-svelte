import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as routerModule from "../../../router";
import { linkTreesStore } from "../states/linkTreesStore";

describe("DetailPage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockTree = {
    id: 10,
    title: "Detail Tree Title",
    type: "public",
    description: "Detailed description here",
    cover: "https://example.com/cover.jpg",
    created_at: "2024-02-26T02:34:26.000000Z",
    updated_at: "2024-02-26T02:44:47.000000Z",
    author: { name: "Author Name" },
    items: [
      {
        id: 101,
        link_tree_id: 10,
        title: "Tautan Satu",
        url: "https://example1.com",
      },
      {
        id: 102,
        link_tree_id: 10,
        title: "Tautan Dua",
        url: "https://example2.com",
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() =>
      Promise.resolve()
    );
  });

  it("should render loading spinner if profile or linkTree is null", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: null,
      },
    });

    expect(wrapper.find(".animate-spin").exists()).toBe(true);
  });

  it("should render full link tree details and items", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    expect(wrapper.text()).toContain("Detail Tree Title");
    expect(wrapper.text()).toContain("Author Name");
    expect(wrapper.text()).toContain("Detailed description here");
    expect(wrapper.text()).toContain("Tautan Satu");
    expect(wrapper.text()).toContain("Tautan Dua");

    const img = wrapper.find('img[alt="Detail Tree Title"]');
    expect(img.exists()).toBe(true);
  });

  it("should render empty items state when items array is empty", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: { ...mockTree, items: [] },
      },
    });

    expect(wrapper.text()).toContain(
      "Belum ada tautan yang ditambahkan ke link tree ini."
    );
  });

  it("should render fallback text when description is missing and handle unlisted and private types", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockTree,
          description: null,
          author: null,
          cover: null,
          type: "unlisted",
        },
      },
    });

    expect(wrapper.text()).toContain(
      "Tidak ada deskripsi rinci untuk link tree ini."
    );
    expect(wrapper.text()).toContain("Tak Terdaftar");
  });

  it("should render private badge for private type", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockTree,
          type: "private",
        },
      },
    });

    expect(wrapper.text()).toContain("Pribadi");
  });

  it("should navigate back to / when back link clicked", async () => {
    const navSpy = vi
      .spyOn(routerModule, "navigate")
      .mockImplementation(() => {});

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    const backLink = wrapper.find('[data-testid="back-to-linktrees-link"]');
    await backLink.trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should open cover modal when edit cover button clicked", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    const btn = wrapper.find('[data-testid="edit-cover-btn"]');
    await btn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(
      true
    );

    const closeBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(
      false
    );
  });

  it("should open edit data modal when edit data button clicked", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    const btn = wrapper.find('[data-testid="edit-detail-linktree-btn"]');
    await btn.trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(
      true
    );

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(
      false
    );
  });

  it("should delete link tree when delete button confirmed", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: true,
    });

    const { wrapper, linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockImplementation(() => {});

    const deleteBtn = wrapper.find(
      '[data-testid="delete-detail-linktree-btn"]'
    );
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteSpy).toHaveBeenCalledWith(10);
  });

  it("should not delete link tree when delete button cancelled", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: false,
    });

    const { wrapper, linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockImplementation(() => {});

    const deleteBtn = wrapper.find(
      '[data-testid="delete-detail-linktree-btn"]'
    );
    await deleteBtn.trigger("click");

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should open add item modal when add item button clicked", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    const addBtn = wrapper.find('[data-testid="add-item-btn"]');
    await addBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Tambah Tautan Baru");

    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);
  });

  it("should open edit item modal when edit item button clicked", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    const editItemBtn = wrapper.find('[data-testid="edit-item-101"]');
    await editItemBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Ubah Tautan");

    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);
  });

  it("should delete item when delete item button confirmed", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: true,
    });

    const { wrapper, linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    const deleteItemSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsItemDelete")
      .mockImplementation(() => {});

    const deleteItemBtn = wrapper.find('[data-testid="delete-item-101"]');
    await deleteItemBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteItemSpy).toHaveBeenCalledWith(10, 101);
  });

  it("should not delete item when delete item button cancelled", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: false,
    });

    const { wrapper, linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    const deleteItemSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsItemDelete")
      .mockImplementation(() => {});

    const deleteItemBtn = wrapper.find('[data-testid="delete-item-101"]');
    await deleteItemBtn.trigger("click");

    expect(deleteItemSpy).not.toHaveBeenCalled();
  });

  it("should navigate to / if isLinkTree is true and linkTree is null", async () => {
    const navSpy = vi
      .spyOn(routerModule, "navigate")
      .mockImplementation(() => {});

    const { linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: null,
        isLinkTree: false,
      },
    });

    navSpy.mockClear();

    linkTreesStore.setIsLinkTree(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should navigate to / if isLinkTreeDeleted becomes true", async () => {
    const navSpy = vi
      .spyOn(routerModule, "navigate")
      .mockImplementation(() => {});

    const { linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
        isLinkTreeDeleted: false,
      },
    });

    navSpy.mockClear();

    linkTreesStore.setIsLinkTreeDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should reload link tree when isItemDeleted becomes true", async () => {
    const { linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
        isItemDeleted: false,
      },
    });

    const getTreeSpy = vi
      .spyOn(linkTreesStore, "asyncSetLinkTree")
      .mockImplementation(() => Promise.resolve());

    linkTreesStore.setIsItemDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(getTreeSpy).toHaveBeenCalledWith(10);
  });

  it("should not navigate when isLinkTree is true but linkTree is present", async () => {
    const navSpy = vi
      .spyOn(routerModule, "navigate")
      .mockImplementation(() => {});

    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() =>
      Promise.resolve()
    );

    const { linkTreesStore: store } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
        isLinkTree: false,
      },
    });

    navSpy.mockClear();

    store.setIsLinkTree(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navSpy).not.toHaveBeenCalled();
  });

  it("should render fallback when linkTree items is null", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: {
        profile: mockProfile,
        linkTree: { ...mockTree, items: null },
      },
    });

    expect(wrapper.text()).toContain(
      "Belum ada tautan yang ditambahkan ke link tree ini."
    );
  });
});
