<script>
  import { auth, currentUser } from "@frontierjs/frontend";
  import Brand from "$c/Brand.svelte";
  import Nav from "$c/Nav.svelte";
  import { isActive, url, goto } from "$router";
</script>

<section class="">
  {#if $currentUser}
    <header class="">
      <article class="m">
        <span class="stretch">
          <span class="show-md">Logged in:</span>
          {$currentUser.email}
        </span>
      </article>
      <article class="row space-around">
        <a class="lm" href={$url('/')}>Home</a>
        <a class="lm" href={$url('/examples')}>Examples</a>
      </article>
    </header>
  {:else}
    <header>
      <h1>FrontierJS</h1>
    </header>
  {/if}
</section>
