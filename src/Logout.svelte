<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { logout } from '@inrupt/solid-client-authn-browser';
    export let profile: any;

    const dispatch = createEventDispatcher();

    function handleLogout() {
        console.log(`Logout : ${profile.webId}`);
        
        logout();
        profile = undefined;

        dispatch('logout', { });
    }
</script>

{#if typeof(profile) != "undefined" }
    {#if profile.image}
        <img src="{profile.image}" 
            class="img-circle" 
            width="50" 
            height="50" 
            alt="{profile.name}" 
            title="{profile.webId}"
            on:click={handleLogout}  
            />
    {:else}
        <img src="images/unknown.jpeg" 
            class="img-circle" 
            width="50" 
            height="50" 
            alt="{profile.name}" 
            title="{profile.webId}"
            on:click={handleLogout} 
            />
    {/if}
{/if}