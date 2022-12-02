<script lang="ts">
	import Login from './Login.svelte';
	import Logout from './Logout.svelte';
	import Upload from './Upload.svelte';
	import Container from './Container.svelte';
	import { onSessionRestore , onLogout } from '@inrupt/solid-client-authn-browser';

	export let name: string;

	let profile: any;
	let container: string;
	let isPublic: boolean = true;
	let isOverwrite: boolean = true;

	$: if (profile) {
		if (!container) {
			if (window.location.href.includes('resource=http')) {
				setResource(window.location.href);
			}
			else if (profile.storage) {
				container = profile.storage;
			}
			else {
				// Nothing set..
			}
		}
	}
	
	onSessionRestore( (url) => setResource(url) );
	onLogout( () => handleLogout() );

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

		if (! container) {
			console.log(`oops no container set`);
		}

		const overwrite = urlParams.get('overwrite');

		if (overwrite) {
			isOverwrite = overwrite === 'true' ? true : false;
		}
	}

	function handleLogout() {
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
			<Logout bind:profile={profile}/>
		</li>
	  </ul>
	</div>
</nav>

<Login bind:profile={profile}/>

<main>
<div class="row">
  <div class="col-sm-4">
    <Container bind:resource={container}/>
  </div>
  <div class="col-sm-8">
    <Upload {profile} {isPublic} {isOverwrite}
		bind:container={container} 
	/>
  </div>
</div>
</main>