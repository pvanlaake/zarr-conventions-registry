# Registry

This directory contains the permanent record of all accepted Zarr conventions.

## Do not edit files in this directory manually

Files are added here automatically by the build workflow when a submission
PR is merged. The workflow sets the `registered` and `status_changed` fields
at acceptance time.

The only permitted manual changes are modification PRs that update allowed
fields in an existing entry. See
[submissions/README.md](../submissions/README.md#modifying-an-existing-registration)
for the list of permitted fields and the modification PR process.

## Structure

Each file is named `{uuid}.json` where the UUID matches the `uuid` field
inside the file. Once a file is created here it is never deleted — only
the `maturity` field may be set to `deprecated`. This is the persistence
guarantee of the registry: a convention registered here remains resolvable
for as long as the registry exists.

## Browsing

The human-readable view of the registry is at:
[pvanlaake.github.io/zarr-conventions-registry](https://pvanlaake.github.io/zarr-conventions-registry)

The machine-readable catalog is at:
[pvanlaake.github.io/zarr-conventions-registry/catalog.json](https://pvanlaake.github.io/zarr-conventions-registry/catalog.json)
