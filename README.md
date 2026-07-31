# Zarr Conventions Registry

A community registry of conventions for Zarr arrays and groups, governed by
the [ZEP0011](https://zarr.dev/zeps/active/ZEP0011.html) framework.

🌐 **[Browse the registry](https://pvanlaake.github.io/zarr-conventions-registry)**

## What is this?

Zarr conventions are specifications that define how metadata attributes are
used in a Zarr store to encode information beyond what the Zarr format itself
specifies — coordinate systems, projections, domain vocabularies, multiscale
image pyramids, and more.

This registry provides:

- A stable, searchable index of available conventions
- A community review process for new submissions
- A machine-readable catalog for tooling
- A persistence guarantee: registered conventions are never removed

## Browse

| Page                                                                                | Description            |
| ----------------------------------------------------------------------------------- | ---------------------- |
| [Registered](https://pvanlaake.github.io/zarr-conventions-registry/index.html)      | Accepted conventions   |
| [Staged](https://pvanlaake.github.io/zarr-conventions-registry/staged.html)         | Under community review |
| [Deprecated](https://pvanlaake.github.io/zarr-conventions-registry/deprecated.html) | No longer recommended  |

## Register a convention

Anyone can submit a convention for registration. See
[submissions/README.md](submissions/README.md) for the full guide.

In brief:

1. Generate a UUID: `uuidgen | tr '[:upper:]' '[:lower:]'`
2. Create `submissions/{uuid}.json` using the schema in `schema/convention.schema.json`
3. Open a pull request — automated validation runs immediately
4. Community review period: 14 days
5. CDG merges or closes with a reason

## Machine-readable catalog

The registry is available as a JSON feed for use in tooling:
