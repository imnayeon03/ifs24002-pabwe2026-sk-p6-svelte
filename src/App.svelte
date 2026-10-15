<script>
  import { currentRoute } from "./router.js";
  import NotFoundPage from "./features/common/pages/NotFoundPage.svelte";
</script>

<!--
  Layout dan halaman dimuat per route (code splitting), jadi pengguna yang
  membuka halaman login tidak ikut mengunduh kode halaman lain.
-->
{#if $currentRoute.layout === 'auth'}
  {#await import("./features/auth/layouts/AuthLayout.svelte") then { default: AuthLayout }}
    <AuthLayout>
      {#if $currentRoute.name === 'login'}
        {#await import("./features/auth/pages/LoginPage.svelte") then { default: LoginPage }}
          <LoginPage />
        {/await}
      {:else}
        {#await import("./features/auth/pages/RegisterPage.svelte") then { default: RegisterPage }}
          <RegisterPage />
        {/await}
      {/if}
    </AuthLayout>
  {/await}
{:else if $currentRoute.layout === 'linktree'}
  {#await import("./features/linktrees/layouts/LinkTreeLayout.svelte") then { default: LinkTreeLayout }}
    <LinkTreeLayout>
      {#if $currentRoute.name === 'home'}
        {#await import("./features/linktrees/pages/HomePage.svelte") then { default: HomePage }}
          <HomePage />
        {/await}
      {:else if $currentRoute.name === 'linktree-detail'}
        {#await import("./features/linktrees/pages/DetailPage.svelte") then { default: DetailPage }}
          <DetailPage linkTreeId={$currentRoute.params.linkTreeId} />
        {/await}
      {:else if $currentRoute.name === 'users'}
        {#await import("./features/users/pages/UsersPage.svelte") then { default: UsersPage }}
          <UsersPage />
        {/await}
      {:else}
        {#await import("./features/users/pages/ProfilePage.svelte") then { default: ProfilePage }}
          <ProfilePage />
        {/await}
      {/if}
    </LinkTreeLayout>
  {/await}
{:else}
  <NotFoundPage />
{/if}
