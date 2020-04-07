<script>
  import { auth, currentUser } from "@frontierjs/frontend";
  import Brand from "$c/Brand.svelte";
  import Nav from "$c/Nav.svelte";
  import { isActive, url, goto } from "$router";
</script>

<header class="w-full">
  {#if $currentUser}
    <article class="m row fx-stretch-all">
      <span class="">
        <span class="show-md">Logged in:</span>
        {$currentUser.email}
      </span>
      <small class="cursor-pointer" on:click={() => $auth.logout()}>
        Logout
      </small>
    </article>
    <article class="row space-around">
      <a class="lm" href={$url('/')}>Home</a>
      <a class="lm" href={$url('/examples')}>Examples</a>
    </article>
  {:else}
    <article class="stretch row">
      <Brand />
      <h1 class="grow py">Header.svelte</h1>
    </article>
  {/if}
</header>
