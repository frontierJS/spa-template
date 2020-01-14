<script>
    import { auth, currentUser } from 'frontier-frontend'
    import { goto, isActive } from '@sveltech/routify';

    import Header from '$c/Header.svelte';
    import Footer from '$c/Footer.svelte';
  
    // Handling Auth
    //console.log($auth)
    let loginRoute = '/login'
    if(! $currentUser.email && ! $isActive(loginRoute))
    $auth.logout(loginRoute, $goto)
    // Handling Auth

</script>

<Header />
<slot />
<Footer />