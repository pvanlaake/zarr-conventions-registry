# Convention composability

Zarr conventions are designed to be combined. A single Zarr store may
declare multiple conventions, each responsible for a different aspect of
the metadata. This page explains how composability works in practice and
how to reason about convention interactions.

## The `zarr_conventions` attribute

A Zarr array or group declares its conventions using the `zarr_conventions`
attribute. Each entry identifies a convention by at least one of its three
identifiers: UUID, spec URL, or schema URL. Using the UUID is recommended
for registered conventions since it is the most stable identifier:

```json
{
  "zarr_conventions": [
    { "uuid": "uuid-of-cs" },
    { "uuid": "uuid-of-proj" },
    { "uuid": "uuid-of-multiscales" }
  ]
}
```

A reader encountering this attribute can look up each UUID in the registry
to find the specification and understand what metadata to expect.

## Dependency vs co-occurrence

The `composes` field in a registry entry expresses a **dependency**:
convention A composes convention B means that A requires B to be present
and meaningful. A reader implementing A must also implement B.

Co-occurrence without dependency is also valid and requires no declaration:
two conventions may both be present in a store without either depending on
the other. A store that uses both `multiscales` and `spatial` may declare both
without either convention referencing the other, if they operate on
independent aspects of the data.

## Attribute namespaces and conflicts

Conventions avoid attribute name conflicts through namespacing. A prefixed
convention like `proj:` owns all attributes beginning with `proj:`. A nested
convention like `cs` owns the `cs` key. Conventions are designed so that
their attribute namespaces do not overlap.

The registry enforces namespace uniqueness at registration time: two
registered conventions may not share a namespace key unless one supersedes
the other. This prevents ambiguity for implementers.

## Discovering relationships

The registry computes two relationship views automatically:

**Composes** — conventions that this convention depends on, declared
explicitly in the registry entry. Displayed on each convention's detail page.

**Used by** — conventions that declare a dependency on this convention,
derived automatically from all `composes` declarations across the registry.
Not stored in any registry entry — computed at catalog build time.

These two views together allow a reader to navigate the convention graph
in both directions: from a high-level convention down to its dependencies,
and from a foundational convention up to everything that builds on it.

## Handling unknown conventions

A reader that encounters a `zarr_conventions` entry it does not recognise
should not fail. The recommended behaviour is:

1. Process the conventions it does recognise
2. Ignore unknown conventions
3. Optionally warn the user that some conventions were not understood

This forward-compatibility principle allows new conventions to be added to
existing stores without breaking existing readers.

## Versioning and compatibility

When a convention declares a version, semantic versioning rules apply:

- A reader implementing version `1.2.0` of a convention can safely read
  data written with any `1.x.y` version
- A reader implementing version `1.x.y` cannot safely read data written
  with version `2.0.0` — a major version change is a breaking change

Data producers should include the convention version in the
`zarr_conventions` attribute where precision matters:

```json
{
  "zarr_conventions": [{ "uuid": "uuid-of-convention", "version": "1.2.0" }]
}
```

Readers can use this to verify compatibility before processing.
