import { getSolidDataset , getContainedResourceUrlAll } from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';

export type FileInfo = {
    url: string ,
    name?: string ,
    isDir?: boolean ,
};

export async function getContainerList(url: string) : Promise<FileInfo[] | undefined> {
    let containerDataset = null;

    if (! url) {
        return undefined;
    }
    
    try {
        let files : FileInfo[] = [];
        containerDataset = await getSolidDataset(url, { fetch: fetch });

        if (! containerDataset ) {
            return [];
        }

        let containedURIs = getContainedResourceUrlAll(containerDataset);

        for (let uri of containedURIs) {
            if (uri.endsWith('/')) {
                let name = uri.replace(/\/$/g,'').replace(/.*\//g,'');
                files.push({
                    url: uri,
                    name: name,
                    isDir: true
                });
            }
            else {
                let name = uri.replace(/.*\//g,'');
                files.push({
                    url: uri,
                    name: name,
                    isDir: false
                });
            }
        }

        return files.sort( (a,b) => {
            if (a.name > b.name) {
                return 1;
            }
            else if (a.name < b.name) {
                return -1;
            }
            else {
                return 0;
            }
        });
    }
    catch (e) {
        console.error(`failed to access ${url} : %O`, e);
        return undefined;
    }
}