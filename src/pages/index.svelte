<script>
  import { auth, currentUser } from "@frontierjs/frontend";
</script>

<svelte:head>
  <title>FrontierJS</title>
</svelte:head>

<section class="mt-auto p">
  <article>
    <div class="mt-auto">Logged in: {$currentUser.email}</div>
  </article>
</section>
