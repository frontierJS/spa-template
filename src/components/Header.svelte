<script>
  import { auth, currentUser } from "@frontierjs/frontend";
  import Brand from "$c/Brand.svelte";
  import Nav from "$c/Nav.svelte";
  import { isActive, url, goto } from "$router";
</script>

<header class="">
  {#if $currentUser}
    <div class="grid columns _y p">
      <span class="">
        <span class="dn d@md">Logged in:</span>
        {$currentUser.email}
      </span>
      <div class="-r v-">
        <button class="link" on:click={() => $auth.logout()}>Logout</button>
        <button class="link" on:click={() => $auth.logout()}>More</button>
      </div>
    </div>
    <nav class="">
      <a class="" href={$url('/')}>Home</a>
      <a class="" href={$url('/examples')}>Examples</a>
      <a class="" href={$url('/styles')}>Style Guide</a>
      <a class="" href={$url('/responsive')}>Responsive</a>
    </nav>
  {:else}
    <article class="stretch row">
      <Brand />
      <h1 class="grow py">Header.svelte</h1>
    </article>
  {/if}
</header>
