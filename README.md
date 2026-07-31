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

```
https://pvanlaake.github.io/zarr-conventions-registry/catalog.json
```

The catalog includes all registered, non-deprecated conventions with
`used_by` relationships computed automatically from `composes` declarations.
Separate feeds are available for
[staged](https://pvanlaake.github.io/zarr-conventions-registry/staged.json) and
[deprecated](https://pvanlaake.github.io/zarr-conventions-registry/deprecated.json)
conventions.

## Documentation

| Document                                                       | Description                          |
| -------------------------------------------------------------- | ------------------------------------ |
| [How to register](docs/how-to-register.md)                     | Registration process and guidance    |
| [How to write a convention](docs/how-to-write-a-convention.md) | Design principles and worked example |
| [Composability](docs/composability.md)                         | How conventions interact             |
| [Registry internals](registry/README.md)                       | How the registry directory works     |

## Repository structure

```
zarr-conventions-registry/
├── schema/                  # JSON schema for registry entries
├── submissions/             # Conventions awaiting review (PRs land here)
├── registry/                # Accepted conventions (permanent, append-only)
├── docs/                    # Documentation
└── site/                    # GitHub Pages site (generated)
```

## Governance

The registry is an Affiliated Software Project under
[ZEP0011](https://zarr.dev/zeps/active/ZEP0011.html), coordinated with but
not subordinate to any domain-specific effort such as GeoZarr. Domain-specific
projects may maintain their own curated views of the registry without affecting
registration or deprecation decisions.

The registry is a discovery tool, not a gatekeeper. Conventions are not
refused on grounds of overlapping with existing ones.

## Related

- [zarr-conventions-spec](https://github.com/zarr-conventions/zarr-conventions-spec) — the convention specification format
- [ZEP0011](https://zarr.dev/zeps/active/ZEP0011.html) — Zarr governance framework
- [zarr.dev/conventions](https://zarr.dev/conventions) — Zarr conventions overview
- [Zarr](https://zarr.dev) — the Zarr project
