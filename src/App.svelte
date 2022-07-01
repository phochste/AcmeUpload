<script lang="ts">
	import Login from './Login.svelte';
	import Logout from './Logout.svelte';
	import Upload from './Upload.svelte';
	import { onSessionRestore } from '@inrupt/solid-client-authn-browser';

	export let name: string;

	let profile: any;
	let container: string;
	let isPublic: boolean = true;
	let isOverwrite: boolean = true;

	$: if (profile) {
		container = profile.storage ? profile.storage : "";
	}
	else {
		setResource(window.location.href);
	}
	
	onSessionRestore( (url) => setResource(url) );

	function setResource(url: string) {
        let queryString = url.replace(/.*\?/,'');
        console.log(`queryString: %s`, queryString);
        const urlParams = new URLSearchParams(queryString);
        console.log(`urlParams: %O`, urlParams);
        const newResource = urlParams.get('resource');

        if (newResource && ( ! container || (container && newResource != container))) {
            console.log(`resource: ${newResource}`);
            container = newResource;
        }

		const overwrite = urlParams.get('overwrite');

		if (overwrite) {
			isOverwrite = overwrite === 'true' ? true : false;
		}
	}

	function handleLogout() {
		console.log(`logout`);
		container = "";
		isPublic = true;
		isOverwrite = true;
	}
</script>

<nav class="navbar navbar-default">
	<div class="container-fluid">
	  <div class="navbar-header">
		<span class="navbar-brand">{name}</span>
	  </div>
	  <ul class="nav navbar-nav">
		<li>
			<Logout bind:profile={profile} on:logout={handleLogout}/>
		</li>
	  </ul>
	</div>
</nav>

<Login bind:profile={profile}/>

<Upload {profile} {container} {isPublic} {isOverwrite}/>