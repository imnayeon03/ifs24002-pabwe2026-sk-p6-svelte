<script>
  import { onMount } from "svelte";
  import { navigate } from "../../../router.js";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ItemModal from "../modals/ItemModal.svelte";
  import MarkdownViewer from "../components/MarkdownViewer.svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import {
    ArrowLeft,
    ImagePlus,
    PenLine,
    Trash2,
    Calendar,
    Globe,
    Lock,
    Plus,
    ExternalLink,
    Pencil,
    Link2,
    User,
  } from "lucide-svelte";

  export let linkTreeId;

  $: profile = $usersStore.profile;
  $: linkTree = $linkTreesStore.linkTree;

  let showCoverModal = false;
  let showEditModal = false;
  let showItemModal = false;
  let selectedItem = null;

  onMount(() => {
    linkTreesStore.asyncSetLinkTree(linkTreeId);
  });

  $: if ($linkTreesStore.isLinkTree) {
    linkTreesStore.setIsLinkTree(false);
    if (!linkTree) {
      navigate("/");
    }
  }

  $: if ($linkTreesStore.isLinkTreeDeleted) {
    linkTreesStore.setIsLinkTreeDeleted(false);
    navigate("/");
  }

  $: if ($linkTreesStore.isItemDeleted) {
    linkTreesStore.setIsItemDeleted(false);
    linkTreesStore.asyncSetLinkTree(linkTreeId);
  }

  async function handleDelete() {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus link tree ini?"
    );
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsLinkTreeDelete(linkTree.id);
    }
  }

  function handleAddItem() {
    selectedItem = null;
    showItemModal = true;
  }

  function handleEditItem(item) {
    selectedItem = item;
    showItemModal = true;
  }

  async function handleDeleteItem(itemId) {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus tautan ini?"
    );
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsItemDelete(linkTree.id, itemId);
    }
  }
</script>

{#if !profile || !linkTree}
  <h1 class="sr-only" aria-label="Detail Link Tree"></h1>
  <div class="flex flex-col items-center justify-center py-20">
    <div
      class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"
    ></div>
  </div>
{:else}
  <div class="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
    <!-- Back button & Action buttons -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <a
        href="/"
        data-testid="back-to-linktrees-link"
        on:click|preventDefault={() => navigate("/")}
        class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={18} />
        Kembali ke Link Tree
      </a>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-testid="edit-cover-btn"
          on:click={() => (showCoverModal = true)}
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors"
        >
          <ImagePlus size={16} />
          Ubah Cover
        </button>
        <button
          type="button"
          data-testid="edit-detail-linktree-btn"
          on:click={() => (showEditModal = true)}
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
        >
          <PenLine size={16} />
          Ubah Data
        </button>
        <button
          type="button"
          data-testid="delete-detail-linktree-btn"
          on:click={handleDelete}
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
        >
          <Trash2 size={16} />
          Hapus
        </button>
      </div>
    </div>

    <!-- Main Detail Card -->
    <div
      class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden"
    >
      {#if linkTree.cover}
        <div class="relative w-full h-64 sm:h-80 bg-slate-900 overflow-hidden">
          <img
            src={linkTree.cover}
            alt={linkTree.title}
            class="w-full h-full object-cover"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"
          ></div>
        </div>
      {/if}

      <div class="p-6 sm:p-8 space-y-6">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <span class="font-mono text-xs font-bold text-slate-600">
              {"#" + linkTree.id}
            </span>
            {#if linkTree.type === "public"}
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                <Globe size={14} />
                Publik
              </span>
            {:else if linkTree.type === "unlisted"}
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
              >
                Tak Terdaftar
              </span>
            {:else}
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
              >
                <Lock size={14} />
                Pribadi
              </span>
            {/if}
          </div>

          <h1
            class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
          >
            {linkTree.title}
          </h1>

          <div
            class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600"
          >
            {#if linkTree.author}
              <div class="flex items-center gap-1.5">
                <User size={14} class="shrink-0" />
                <span
                  >Pembuat: <strong class="text-slate-700"
                    >{linkTree.author.name}</strong
                  ></span
                >
              </div>
            {/if}
            <div class="flex items-center gap-1.5">
              <Calendar size={14} class="shrink-0" />
              <span
                >Dibuat: <strong class="text-slate-700"
                  >{formatDate(linkTree.created_at)}</strong
                ></span
              >
            </div>
            <div class="flex items-center gap-1.5">
              <Calendar size={14} class="shrink-0" />
              <span
                >Diperbarui: <strong class="text-slate-700"
                  >{formatDate(linkTree.updated_at)}</strong
                ></span
              >
            </div>
          </div>
        </div>

        <div
          data-testid="linktree-detail-description"
          class="prose max-w-none text-slate-600 bg-slate-50/60 p-6 rounded-2xl border border-slate-100 leading-relaxed"
        >
          {#if linkTree.description}
            <MarkdownViewer content={linkTree.description} />
          {:else}
            <p class="italic text-slate-600">
              Tidak ada deskripsi rinci untuk link tree ini.
            </p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Links / Items Section -->
    <div
      class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"
          >
            <Link2 size={22} />
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-800">Daftar Tautan</h2>
            <p class="text-xs text-slate-600">
              Tautan yang tersedia di halaman ini ({linkTree.items?.length || 0})
            </p>
          </div>
        </div>

        <button
          type="button"
          data-testid="add-item-btn"
          on:click={handleAddItem}
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Tambah Tautan</span>
        </button>
      </div>

      {#if !linkTree.items || linkTree.items.length === 0}
        <div class="py-10 text-center text-slate-600">
          <Link2 size={32} class="mx-auto text-slate-300 mb-2" />
          <p class="text-sm font-medium">
            Belum ada tautan yang ditambahkan ke link tree ini.
          </p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each linkTree.items as item (item.id)}
            <div
              data-testid={`item-row-${item.id}`}
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-xs bg-slate-50/40 transition-all"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0"
                >
                  <ExternalLink size={16} />
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-slate-800 text-sm truncate">
                    {item.title}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`item-link-${item.id}`}
                    class="text-xs text-indigo-600 hover:underline truncate block"
                  >
                    {item.url}
                  </a>
                </div>
              </div>

              <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  data-testid={`edit-item-${item.id}`}
                  on:click={() => handleEditItem(item)}
                  class="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  title="Ubah Tautan"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  data-testid={`delete-item-${item.id}`}
                  on:click={() => handleDeleteItem(item.id)}
                  class="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus Tautan"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Modals -->
    <ChangeCoverModal
      show={showCoverModal}
      {linkTree}
      on:close={() => (showCoverModal = false)}
    />

    <ChangeModal
      show={showEditModal}
      linkTreeId={linkTree.id}
      on:close={() => (showEditModal = false)}
    />

    <ItemModal
      show={showItemModal}
      linkTreeId={linkTree.id}
      item={selectedItem}
      on:close={() => {
        showItemModal = false;
        selectedItem = null;
      }}
    />
  </div>
{/if}
