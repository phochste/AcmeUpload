<script lang="ts">
    import Dropzone from "svelte-file-dropzone";
    import { setAcl, type ACLType } from "./acl";
    import { fetch } from '@inrupt/solid-client-authn-browser';
    import { 
        overwriteFile, 
        saveFileInContainer, 
        getSourceUrl, 
        getContentType
    } from '@inrupt/solid-client';

    export let isPublic : boolean = true;
    export let isOverwrite : boolean = true;
    export let container : string = "";

    let files = {
      accepted: [],
      rejected: [],
      failed: [],
    };

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

                    console.log(`setting permissions to ${isPublic ? "public" : "private"}`);
                    handlePermissions(resource,isPublic ? "public" : "private");

                    files.accepted = files.accepted.concat({
                        file: file ,
                        name: file.name ,
                        url: getSourceUrl(savedFile),
                        contentType: getContentType(savedFile),
                        time: (new Date()).toISOString() ,
                        public: isPublic
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
            history.pushState({},undefined, location.protocol + '//' + location.host + location.pathname + '?resource=' + container);
		}
		else {
			alert(`${value} doesn't look like a container`);
		}
	}
</script>

<p>
    Container: <input type="text" size="80" on:change={handleContainer} value={container}/>
    Public?: <input type="checkbox" bind:checked={isPublic}/>
    Overwrite?: <input type="checkbox" bind:checked={isOverwrite}/>
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
          <li>{item.time} <a href="{item.url}">{item.url}</a> - <i>{item.public ? "public" : "private"}</i></li>
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