<script>
    import { auth, currentUser } from '@frontierjs/frontend'
</script>

<svelte:head>
    <title>FrontierJS</title>
</svelte:head>

<style>

    h1 {
      font-size: 9.6rem;
      margin: 0 0 3.2rem;
      line-height: 1;
      font-weight: 500;
      color: #000;
    }

    @media (prefers-color-scheme: dark) {
        h1 {
            color: #FFF;
        }
    }

    .o-container-home {
        margin: 8rem auto;
        max-width: 128rem;
    }
    
    .text {
        position: relative;
        z-index: 2;
    }

</style>

<div class="o-container-vertical">
    <div class="o-container-home">
        Logged in: {$currentUser.email}
    </div>
</div>
