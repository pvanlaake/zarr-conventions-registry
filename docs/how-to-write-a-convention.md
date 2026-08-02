# How to write a Zarr convention

This page provides guidance on designing a Zarr convention that is clear,
composable, and suitable for registration. It does not replace the
[zarr-conventions-spec](https://github.com/zarr-conventions/zarr-conventions-spec),
which is the authoritative reference for convention format requirements.

## Core principles

**Be specific.** A convention should encode one coherent thing. Coordinate
reference systems, multiscale image pyramids, and time metadata are each
their own convention — not one combined specification. Focused conventions
are easier to implement, easier to compose, and easier to version independently.

**Be composable.** Design your convention to work alongside others rather
than absorbing their responsibilities. If your convention needs CRS information,
compose with an existing CRS convention rather than re-specifying CRS encoding.
Declare your dependencies in the `composes` field of your registry entry.

**Be explicit.** Avoid inference where possible. If an attribute is required,
say so in the schema. If an attribute has a controlled vocabulary, enumerate it.
Implicit conventions create implementation divergence.

**Be persistent.** Your specification document and JSON schema must be at
stable, publicly accessible URLs. Use a tagged release on GitHub, a DOI
repository, or an institutional URL — not a branch that may change.

## Namespace

Every convention must declare how it exposes attributes in a Zarr store.
Two patterns are in use:

**Prefixed** — attributes use a namespace prefix and colon separator.
The prefix including the colon is the `namespace.key`:

```json
"namespace": { "style": "prefixed", "key": "proj:" }
```

Attributes are then named `proj:crs`, `proj:wkt`, etc. This pattern is
well-suited to conventions that add a moderate number of attributes alongside
those of other conventions.

**Nested** — attributes are grouped under a single top-level key:

```json
"namespace": { "style": "nested", "key": "cs" }
```

The convention's attributes live under the `cs` key as a nested object.
This pattern is well-suited to conventions that define a rich internal
structure with many interrelated attributes.

Choose the pattern that best fits your attribute structure. Avoid mixing
the two within a single convention.

## JSON Schema

Your convention must have a JSON schema. The schema should validate the
convention's attributes as they appear in a Zarr store's metadata — not
the registry entry format, which is a separate schema.

Any JSON Schema draft version is acceptable. Use whichever draft is best
supported by the tooling your community uses. Common choices are:

- Draft 7 — widest tooling support
- Draft 2019-09 — adds `$vocabulary` and other useful features
- Draft 2020-12 — current standard, best for new conventions

Document the draft version in your specification and declare it in the
schema's `$schema` field.

## Versioning

Use semantic versioning (`MAJOR.MINOR.PATCH`):

- `PATCH` — backwards-compatible fixes, clarifications, editorial changes
- `MINOR` — backwards-compatible additions, new optional attributes
- `MAJOR` — breaking changes; requires a new registry entry with a new UUID

If your convention is not yet stable enough for versioning, set `version`
to `null` in the registry entry and add a version once the specification
is sufficiently settled.

## Composition

If your convention builds on others, declare them in the `composes` field
using their registry UUIDs. This serves two purposes:

- It signals to implementers what else they need to support
- It allows the registry to compute and display the reverse relationship
  ("used by") automatically

Composition is directional: if `cs` composes `proj`, then `cs` depends on
`proj` — not the other way around. Do not add reverse references. A
convention may not be registered until all conventions that it composes are
registered. Simultaneous submission and review, however, is allowed.
