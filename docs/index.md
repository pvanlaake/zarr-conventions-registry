# Zarr Conventions Registry

The Zarr Conventions Registry is a community-maintained index of conventions
for Zarr arrays and groups. It provides data producers and consumers with a
stable, searchable, citable reference for available conventions, governed by
the [ZEP0011](https://zarr.dev/zeps/active/ZEP0011.html) framework.

## What is a Zarr convention?

A Zarr convention is a specification that defines how metadata attributes are
used in a Zarr store to encode information beyond what the Zarr format itself
specifies. Conventions may define data properties, units of measure,coordinate
systems, domain vocabularies, provenance, use suggestions or limitations, or
any other metadata structure that a community of practice agrees to follow.

Conventions are identified by a UUID and optionally by a spec URL or schema URL.
A Zarr array or group declares which conventions it follows using the
`zarr_conventions` attribute, which contains one or more convention identifiers.

## Registry structure

The registry has three sections:

**[Registered](https://pvanlaake.github.io/zarr-conventions-registry/index.html)**
— conventions that have completed the community review process and are
accepted for use. These are stable references that data producers can rely on.

**[Staged](https://pvanlaake.github.io/zarr-conventions-registry/staged.html)**
— conventions currently under community review. The review period is 14 days
from submission. Anyone can comment on a staged submission via its GitHub PR.

**[Deprecated](https://pvanlaake.github.io/zarr-conventions-registry/deprecated.html)**
— conventions that are no longer recommended but remain permanently in the
registry to support existing datasets. Deprecated conventions include a
reference to their successor where one exists.

## Governance

The registry is an Affiliated Software Project under ZEP0011. Registration
decisions are made by the registry CDG (Core Development Group) following a
community review period. The registry is a discovery tool, not a gatekeeper:
conventions are accepted if they are technically sound, complete and abiding
by Zarr standards and governance.

Convention specifications and schemas may use any JSON Schema draft version.
The registry itself validates entry format only, not the conventions' own schemas.

## Persistence

Conventions registered at Stable maturity are required to have a DOI from any
recognised repository (Zenodo, Figshare, OSF, or institutional equivalent),
providing a stable, platform-independent reference that will remain resolvable
independently of GitHub.

The machine-readable catalog is available at:
[catalog.json](https://pvanlaake.github.io/zarr-conventions-registry/catalog.json)
