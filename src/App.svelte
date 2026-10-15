<script>
  import { currentRoute } from "./router.js";
  import NotFoundPage from "./features/common/pages/NotFoundPage.svelte";

  // Setiap route punya layout dan halaman sendiri (code splitting).
  const routeLoaders = {
    login: {
      layout: () => import("./features/auth/layouts/AuthLayout.svelte"),
      page: () => import("./features/auth/pages/LoginPage.svelte"),
    },
    register: {
      layout: () => import("./features/auth/layouts/AuthLayout.svelte"),
      page: () => import("./features/auth/pages/RegisterPage.svelte"),
    },
    home: {
      layout: () => import("./features/linktrees/layouts/LinkTreeLayout.svelte"),
      page: () => import("./features/linktrees/pages/HomePage.svelte"),
    },
    "linktree-detail": {
      layout: () => import("./features/linktrees/layouts/LinkTreeLayout.svelte"),
      page: () => import("./features/linktrees/pages/DetailPage.svelte"),
    },
    users: {
      layout: () => import("./features/linktrees/layouts/LinkTreeLayout.svelte"),
      page: () => import("./features/users/pages/UsersPage.svelte"),
    },
    profile: {
      layout: () => import("./features/linktrees/layouts/LinkTreeLayout.svelte"),
      page: () => import("./features/users/pages/ProfilePage.svelte"),
    },
  };

  let Layout = null;
  let Page = null;
  let pageProps = {};
  let loadId = 0;

  // Layout dan halaman diunduh BERSAMAAN (tidak berantai) dan baru dipasang
  // BERSAMAAN juga. Sebelumnya layout tampil lebih dulu dengan slot kosong,
  // lalu halaman menyusul sehingga kartu/form "melompat" (layout shift).
  async function loadRoute(route) {
    const id = ++loadId;
    const loader = routeLoaders[route.name];

    if (!loader) {
      Layout = null;
      Page = NotFoundPage;
      pageProps = {};
      return;
    }

    const [layoutModule, pageModule] = await Promise.all([
      loader.layout(),
      loader.page(),
    ]);

    // Abaikan hasil lama jika pengguna sudah pindah route saat mengunduh.
    if (id !== loadId) return;

    Layout = layoutModule.default;
    Page = pageModule.default;
    pageProps =
      route.name === "linktree-detail"
        ? { linkTreeId: route.params.linkTreeId }
        : {};
  }

  $: loadRoute($currentRoute);
</script>

{#if Page}
  {#if Layout}
    <Layout>
      <Page {...pageProps} />
    </Layout>
  {:else}
    <Page {...pageProps} />
  {/if}
{/if}