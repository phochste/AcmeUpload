<script lang="ts">
    import Dropzone from "svelte-file-dropzone";
    import { getAcl, setAcl , type ACLType } from "./acl";
    import { fetch } from '@inrupt/solid-client-authn-browser';
    import { 
        overwriteFile, 
        saveFileInContainer, 
        getSourceUrl, 
        getContentType
    } from '@inrupt/solid-client';
    import { lastUpdate } from './stores';

    export let isPublic : boolean = true;
    export let isOverwrite : boolean = true;
    export let isOwner : boolean = false;
    export let container : string = "";
    export let profile;

    let files = {
        accepted: [],
        rejected: [],
        failed: [],
    };

    $: if (container) {
        if (profile) {
            handleCheckOwner(container); 
            updateUrl();
        }
        else {
            isOwner = false;
        }
    }
    else {
        isOwner = false;
    }

    console.log(`public?: ${isPublic} ; overwrite?: ${isOverwrite}`);

    async function handleCheckOwner(resource) {
        // You are the owner when you can read acls...
        const acls = await getAcl(resource);
        
        if (acls) {
            console.log(`You are the controller of ${container}`);
            isOwner = true;
        }
        else {
            console.log(`You are not a controller of ${container}`);
            isOwner = false;
        }
    } 

    async function handlePermissions(resource,access) {
        let acl : ACLType;

        if (access === "public") {
            acl = {
                agent: '#public' ,
                id: undefined,
                default: false,
                read: true,
                write: false,
                append: false,
                control: false 
            };
        }
        else {
            acl = {
                agent: '#public' ,
                id: undefined,
                default: false,
                read: false,
                write: false,
                append: false,
                control: false 
            };
        }

        try {
            await setAcl(resource,acl);
        }
        catch (e) {
            console.log(`failed to set ${access} permission for ${resource}`);
            console.error(e);
        }
    }

    async function handleFilesSelect(e){
        // https://developer.mozilla.org/en-US/docs/Web/API/FileList
        const { acceptedFiles, fileRejections } = e.detail;
       
        files.rejected = [...files.rejected, ...fileRejections];

        if (acceptedFiles.length) {
            for (let i = 0 ; i < acceptedFiles.length ; i++) {
                let file = acceptedFiles[i];
                let resource = `${container}${file.name}`;

                try {

                    console.log(`overwriting ${resource}`);

                    let savedFile;

                    if (isOverwrite) {
                        savedFile = await overwriteFile(
                            resource,
                            file ,
                            { contentType: file.type, fetch: fetch }
                        );
                    }
                    else {
                        savedFile = await saveFileInContainer(
                            container,
                            file,
                            { contentType: file.type, fetch: fetch }
                        );
                    }

                    console.log(`uploaded ${file.name} as ${file.type}`);

                    lastUpdate.update( () => { return savedFile } );

                    if (isOwner) {
                        console.log(`setting permissions to ${isPublic ? "public" : "private"}`);
                        handlePermissions(resource,isPublic ? "public" : "private");
                    }

                    let url  = getSourceUrl(savedFile);
                    let acls = await getAcl(url);
                    let acl = acls?.find(a => a.agent === '#public');

                    files.accepted = files.accepted.concat({
                        file: file ,
                        name: file.name ,
                        url: url,
                        contentType: getContentType(savedFile),
                        time: (new Date()).toISOString() ,
                        public: acl?.read 
                    });
                }
                catch (e) {
                    console.log(`failed to upload ${file.name}`);
                    console.error(e);
                    files.failed = files.failed.concat({
                        file: file ,
                        name: file.name ,
                        url: resource ,
                        time: (new Date()).toISOString() ,
                        public: isPublic
                    });
                }
            }
        }
    }

	function handleContainer(e) {
		let value = e.target.value;

		if (value.endsWith('/')) {
			container = value;
            updateUrl();
		}
		else {
			alert(`${value} doesn't look like a container`);
		}
	}

    function handlePublic() {
        isPublic = ! isPublic;
        updateUrl();
    }

    function handleOverwrite() {
        isOverwrite = ! isOverwrite ;
        updateUrl();
    }

    function updateUrl() {
        console.log('updating url...');
        const baseUrl = 
                location.protocol + 
                '//' + 
                location.host + 
                ( location.pathname ? location.pathname : "");

        history.pushState(
                {},
                undefined, 
                baseUrl + '?' + 
                'resource=' + encodeURI(container) + '&' +
                'overwrite=' + encodeURI(isOverwrite.toString())
        );
    }
</script>

<p>
    <input type="text" size="100" on:change={handleContainer} value={container}/>
</p>
<p>
    {#if isOwner}
    Public?: 
        <input type="checkbox" 
                on:change={handlePublic}
                checked={isPublic}/>
    Overwrite?: 
        <input type="checkbox" 
                name="isOverwrite"
                on:change={handleOverwrite}
                checked={isOverwrite}/>
    {/if}
</p>

{#if container}

<Dropzone on:drop={handleFilesSelect} >
    <p><b>{container}</b></p>
    <button>Choose files to upload</button>

    <p>or</p>
    <p>Drag and drop them here</p>
</Dropzone>


<div id="results">
{#if files.accepted.length} 
    <p>Uploaded:</p>
    <ol>
        {#each files.accepted as item}
          <li>
            {item.time} <a href="{item.url}">{item.url}</a> 
            {#if item.public != null}
            - <i>{item.public ? "public" : "private"}</i>
            {/if}
           </li>
        {/each}
    </ol>
{/if}

{#if files.failed.length} 
    <p>Failed:</p>
    <ol>
        {#each files.failed as item}
            <li>{item.time} {item.name}</li>
        {/each}
    </ol>
{/if}
</div>

{/if}

<style>
    #results {
        margin-top: 20px;
    }
</style>