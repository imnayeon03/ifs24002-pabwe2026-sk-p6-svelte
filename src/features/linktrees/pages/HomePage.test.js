import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as routerModule from "../../../router";
import { linkTreesStore } from "../states/linkTreesStore";

describe("HomePage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockTrees = [
    {
      id: 1,
      user_id: 1,
      title: "Pribadi Tree",
      type: "private",
      description: "Desc Pribadi",
      cover: "https://example.com/cover1.jpg",
      total_links: 3,
      created_at: "2024-02-26T02:34:26.000000Z",
      updated_at: "2024-02-26T02:44:47.000000Z",
      author: { name: "Abdullah" },
    },
    {
      id: 2,
      user_id: 2,
      title: "Publik Tree",
      type: "public",
      description: "Desc Publik",
      cover: null,
      total_links: null,
      created_at: "2024-02-26T02:34:26.000000Z",
      updated_at: "2024-02-26T02:44:47.000000Z",
      author: null,
    },
    {
      id: 3,
      user_id: 3,
      title: "Unlisted Tree",
      type: "unlisted",
      description: "Desc Unlisted",
      cover: null,
      total_links: 2,
      created_at: "2024-02-26T02:34:26.000000Z",
      updated_at: "2024-02-26T02:44:47.000000Z",
      author: { name: "Other" },
    },
    {
      id: 4,
      user_id: 4,
      title: null,
      type: "public",
      description: null,
      cover: null,
      total_links: 0,
      created_at: "2024-02-26T02:34:26.000000Z",
      updated_at: "2024-02-26T02:44:47.000000Z",
      author: { name: null },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockImplementation(() =>
      Promise.resolve()
    );
  });

  it("should not render anything if profile is missing", () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: null,
      },
    });

    expect(wrapper.text()).toBe("");
  });

  it("should render link trees, stats, badges, and empty search states", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.text()).toContain("Daftar Link Tree");
    expect(wrapper.text()).toContain("Pribadi Tree");
    expect(wrapper.text()).toContain("Publik Tree");
    expect(wrapper.text()).toContain("Unlisted Tree");

    // Check stats
    expect(wrapper.text()).toContain("Total Link Tree");
    expect(wrapper.text()).toContain("Milik Saya");
    expect(wrapper.text()).toContain("Total Tautan");

    // Search input
    const searchInput = wrapper.find(
      '[data-testid="search-linktree-input"]'
    );
    await searchInput.setValue("Pribadi");
    expect(wrapper.text()).toContain("Pribadi Tree");
    expect(wrapper.text()).not.toContain("Publik Tree");

    // Search by description
    await searchInput.setValue("Desc Publik");
    expect(wrapper.text()).toContain("Publik Tree");

    // Search with non-matching term
    await searchInput.setValue("NonExistentXYZ");
    expect(wrapper.text()).toContain("Belum ada data link tree yang cocok.");

    // Clear search
    await searchInput.setValue("");
    expect(wrapper.text()).toContain("Publik Tree");
  });

  it("should display loading indicator while loading link trees", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: [],
      },
    });

    vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockReturnValue(
      new Promise(() => {})
    );
    const filterMyBtn = wrapper.find('[data-testid="filter-my-btn"]');
    await filterMyBtn.trigger("click");

    expect(wrapper.text()).toContain("Memuat daftar link tree...");
  });

  it("should handle filter tabs (Semua vs Milik Saya)", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const setTreesSpy = vi
      .spyOn(linkTreesStore, "asyncSetLinkTrees")
      .mockImplementation(() => Promise.resolve());

    const myBtn = wrapper.find('[data-testid="filter-my-btn"]');
    await myBtn.trigger("click");
    expect(setTreesSpy).toHaveBeenCalledWith("1");

    const allBtn = wrapper.find('[data-testid="filter-all-btn"]');
    await allBtn.trigger("click");
    expect(setTreesSpy).toHaveBeenCalledWith("");
  });

  it("should open AddModal when add button is clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const addBtn = wrapper.find('[data-testid="add-linktree-btn"]');
    await addBtn.trigger("click");

    expect(wrapper.find('[data-testid="add-linktree-modal"]').exists()).toBe(
      true
    );

    const closeAddBtn = wrapper.find('[data-testid="close-add-modal-btn"]');
    await closeAddBtn.trigger("click");
    expect(wrapper.find('[data-testid="add-linktree-modal"]').exists()).toBe(
      false
    );
  });

  it("should navigate to detail page when view button is clicked", async () => {
    const navSpy = vi
      .spyOn(routerModule, "navigate")
      .mockImplementation(() => {});

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const viewBtn = wrapper.find('[data-testid="view-linktree-1"]');
    await viewBtn.trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/link-trees/1");
  });

  it("should open ChangeModal when edit button is clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const editBtn = wrapper.find('[data-testid="edit-linktree-1"]');
    await editBtn.trigger("click");

    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(
      true
    );

    const closeEditBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeEditBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(
      false
    );
  });

  it("should delete link tree when confirm dialog is accepted", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: true,
    });

    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockImplementation(() => {});

    const deleteBtn = wrapper.find('[data-testid="delete-linktree-1"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should not delete link tree when confirm dialog is cancelled", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: false,
    });

    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockImplementation(() => {});

    const deleteBtn = wrapper.find('[data-testid="delete-linktree-1"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should delete all link trees when delete-all button confirmed", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: true,
    });

    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const deleteAllSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDeleteAll")
      .mockImplementation(() => {});

    const deleteAllBtn = wrapper.find('[data-testid="delete-all-btn"]');
    await deleteAllBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteAllSpy).toHaveBeenCalled();
  });

  it("should not delete all when cancel is clicked in confirm dialog", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: false,
    });

    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const deleteAllSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDeleteAll")
      .mockImplementation(() => {});

    const deleteAllBtn = wrapper.find('[data-testid="delete-all-btn"]');
    await deleteAllBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteAllSpy).not.toHaveBeenCalled();
  });

  it("should reload list when isLinkTreeDeleted becomes true", async () => {
    const { linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
        isLinkTreeDeleted: false,
      },
    });

    const setTreesSpy = vi
      .spyOn(linkTreesStore, "asyncSetLinkTrees")
      .mockImplementation(() => Promise.resolve());

    linkTreesStore.setIsLinkTreeDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(setTreesSpy).toHaveBeenCalled();
  });

  it("should reload list when isLinkTreeDeletedAll becomes true", async () => {
    const { linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
        isLinkTreeDeletedAll: false,
      },
    });

    const setTreesSpy = vi
      .spyOn(linkTreesStore, "asyncSetLinkTrees")
      .mockImplementation(() => Promise.resolve());

    linkTreesStore.setIsLinkTreeDeletedAll(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(setTreesSpy).toHaveBeenCalled();
  });

  it("should handle state when linkTrees in store is null", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: null,
      },
    });

    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.text()).toContain("Daftar Link Tree");
    expect(wrapper.text()).toContain("Belum ada data link tree yang cocok.");
  });

  it("should show loading indicator while link trees are being fetched", async () => {
    let resolveLoad;
    const pendingPromise = new Promise((resolve) => {
      resolveLoad = resolve;
    });

    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: [],
      },
    });

    vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockReturnValue(pendingPromise);

    const filterSelect = wrapper.find('[data-testid="filter-select"]');
    await filterSelect.setValue("public");

    expect(wrapper.text()).toContain("Memuat daftar link tree...");

    resolveLoad();
    await pendingPromise;
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).not.toContain("Memuat daftar link tree...");
  });
});
