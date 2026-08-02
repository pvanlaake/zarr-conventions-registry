# How to register a convention

Registration is open to anyone. There is no affiliation requirement.
The full process is documented in [submissions/README.md](../submissions/README.md),
which is the authoritative guide for submitters. This page provides context
and background.

## When to register

Register a convention when:

- You have a specification document that is publicly accessible
- You have a JSON schema for the convention's metadata
- At least one implementation exists or is in active development
- You want the convention to be discoverable by others

You do not need to wait until the convention is stable. Conventions at
`proposed` maturity are welcome — the registry records the maturity level
and the community review process provides feedback.

## The review process

A new submission opens a 14-day community review period. During this time
anyone can comment on the GitHub PR. The CDG reviews the submission and any
comments made on the PR and then either merges it (accepted) or closes it
with a reason (rejected).

When comments require a significant change in the convention, the review
period may be extended.

Rejections are typically for technical reasons such as an inaccessible spec
URL or a malformed JSON entry, not for design disagreements.

## Versioning

Conventions are encouraged to use semantic versioning. The registry enforces
one rule: a major version bump requires a new UUID. Minor and patch version
changes may be applied to an existing registry entry via a modification PR.

The rationale is that a major version change represents a breaking change
that existing implementers cannot safely upgrade to without review. A new
UUID gives the new major version its own identity and allows both versions
to coexist in the registry.

Versioning is required for a convention to reach Candidate maturity level. A
Stable maturity level requires the version to be at least "v.1".

## Superseding a convention

If your convention replaces an existing registered convention, add a
`supersedes` field containing the UUID of the convention being replaced.
This exempts your submission from the namespace uniqueness check and
signals that the older convention should eventually be deprecated.

The older convention is not automatically deprecated — that requires a
separate modification PR setting its `maturity` to `deprecated`.

The new convention may inherit the maturity level of the superseded
convention if evidence is presented that the new convention has been
implemented or that efforts to do so are close to publication. Otherwise
the new convention will be subject to the same maturity process as other
submitted conventions.

## Modifying an existing registration

Minor updates — maintainer changes, new implementations, tag adjustments,
DOI additions, minor/patch version bumps — are handled by a modification PR
directly against the file in `registry/`. These go through a lighter review:
automated checks only, auto-merge after 7 days with no objection or
immediately on CDG approval.

Material changes — name, namespace, spec URL, schema URL, description,
or composition relationships — require a new convention entry with a new UUID.
