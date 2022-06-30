# Acme Upload

A Solid app that can be used as a dropzone for a container.

# Install

```
npm install
npm run dev
```

# Usage

### Logged in pod controller

A logged in user can upload files to any Solid container under its control.
Fill out the container URL and drop in the files. Use `Public?` to make
all uploaded files public readable. Use `Overwrite?` upload the files and
give them the same name as the local file (overwriting any existing files).
By switching off `Overwrite?` every uploaded file will get a new name on the
Solid Pod.

The URL of the Acme Uploader is structured as:

```
http://acmeuploader.patrickhochstenbach.net/?resource={container}&overwrite={true|false}
```

This URL can be send to another user to invite them to upload files. External
users need to have `write` access to the container to be able to do `Overwrite`
and `append` access to the container to be able to upload files without having
`Overwrite`.

Agents that don't controll the Pod don't have the option to swith access rights
(the uploaded files inherit the access rights from the default Container access settings).

