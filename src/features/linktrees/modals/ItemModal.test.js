import { describe, it, expect, vi, beforeEach } from "vitest";
import ItemModal from "./ItemModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ItemModal", () => {
  const mockItem = {
    id: 10,
    title: "My GitHub",
    url: "https://github.com/myuser",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: false, linkTreeId: 1 },
    });
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);
  });

  it("should render add mode when item is null", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null },
    });
    expect(wrapper.text()).toContain("Tambah Tautan Baru");
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe(
      ""
    );
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe(
      ""
    );
  });

  it("should render edit mode when item is provided", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem },
    });
    expect(wrapper.text()).toContain("Ubah Tautan");
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe(
      "My GitHub"
    );
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe(
      "https://github.com/myuser"
    );
  });

  it("should handle item with null title and url", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: {
        show: true,
        linkTreeId: 1,
        item: { id: 11, title: null, url: null },
      },
    });
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe(
      ""
    );
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe(
      ""
    );
  });

  it("should validate empty title, empty url, and invalid url format", async () => {
    const errorSpy = vi
      .spyOn(toolsHelper, "showErrorDialog")
      .mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul tautan tidak boleh kosong");

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    await titleInput.setValue("Valid Title");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("URL tautan tidak boleh kosong");

    const urlInput = wrapper.find('[data-testid="item-url-input"]');
    await urlInput.setValue("invalid-url-without-protocol");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith(
      "URL harus diawali dengan http:// atau https://"
    );
  });

  it("should dispatch asyncSetIsItemAdd on valid submit in add mode and close on success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null, onClose: closeSpy },
      preloadedState: {
        isItemAdd: false,
        isItemAdded: false,
      },
    });

    const addSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsItemAdd")
      .mockReturnValue(Promise.resolve());

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    const urlInput = wrapper.find('[data-testid="item-url-input"]');

    await titleInput.setValue("Website");
    await urlInput.setValue("https://example.com");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(addSpy).toHaveBeenCalledWith(1, "Website", "https://example.com");

    linkTreesStore.setIsItemAdd(true);
    linkTreesStore.setIsItemAdded(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should dispatch asyncSetIsItemChange on valid submit in edit mode and close on success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem, onClose: closeSpy },
      preloadedState: {
        isItemChange: false,
        isItemChanged: false,
      },
    });

    const changeSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsItemChange")
      .mockReturnValue(Promise.resolve());

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    await titleInput.setValue("Updated Title");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(
      1,
      10,
      "Updated Title",
      "https://github.com/myuser"
    );

    linkTreesStore.setIsItemChange(true);
    linkTreesStore.setIsItemChanged(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle isItemAdd true when isItemAdded is false", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
      preloadedState: {
        isItemAdd: false,
        isItemAdded: false,
      },
    });

    linkTreesStore.setIsItemAdd(true);
    linkTreesStore.setIsItemAdded(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
  });

  it("should handle isItemChange true when isItemChanged is false", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem },
      preloadedState: {
        isItemChange: false,
        isItemChanged: false,
      },
    });

    linkTreesStore.setIsItemChange(true);
    linkTreesStore.setIsItemChanged(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
  });

  it("should close on close and cancel button clicks", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });

    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(1);

    const cancelBtn = wrapper.find('[data-testid="cancel-item-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle close without onClose callback", async () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
    });

    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.exists()).toBe(true);
  });
});
