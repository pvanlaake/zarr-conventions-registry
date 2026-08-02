# Registering a convention

This directory holds convention submissions that are awaiting CDG review.
Once accepted, entries are moved to `registry/` and become permanent.

## Who can submit

Anyone can submit a convention for registration. There is no affiliation requirement.

## What makes a good submission

A submission is likely to be accepted if:

- The convention has a publicly accessible, stable specification document
- The convention has a JSON schema
- The namespace key does not conflict with an existing registered convention
  (unless the submission supersedes it, in which case add a `supersedes` field)
- At least one implementation exists or is in active development
- The submitter is reachable as a maintainer

A submission may be rejected if the specification is inaccessible, the JSON is
malformed, or the convention duplicates an existing one without meaningful
differentiation and without a `supersedes` relationship.

The registry is a discovery tool, not a gatekeeper. Submissions are reviewed on the
basis of their additional functionality compared to the existing set of conventions.
While conventions are not generally refused on grounds of overlapping with existing
conventions such overlaps will attract critical comments so you are advised to review
the registered conventions and elaborate on what your convention contributes and why
any overlap is unavoidable or non-obtrusive.

## Step-by-step

### 1. Generate a UUID

Use your favorite tool to generate a UUID, with all letters in lower case. A random
UUID (version 4) is preferred. In Unix-like systems you can use this:

```bash
uuidgen | tr '[:upper:]' '[:lower:]'
```

Keep this UUID — it is the permanent identifier for your convention.

### 2. Create the submission file

Create a file named `{your-uuid}.json` in this directory (`submissions/`).
Use the template below, filling in all mandatory fields.

```json
{
  "uuid": "your-uuid-here",
  "name": "my-convention",
  "namespace": {
    "style": "prefixed" | "nested",
    "key": "myconv:" | "myconv"
  },
  "title": "My Convention — Full Human-Readable Title",
  "description": "One paragraph describing what this convention encodes and why it exists.",
  "spec_url": "https://github.com/your-org/your-repo/blob/main/spec.md",
  "schema_url": "https://raw.githubusercontent.com/your-org/your-repo/main/schema.json",
  "maintainers": [
    "@your-github-handle"
  ],
  "maturity": "proposed",
  "tags": [
    "meaning_full_tag",
    "domain_tag"
  ],
  "version": null,
  "composes": [],
  "implementations": []
}
```

**Mandatory fields:** `uuid`, `name`, `namespace`, `description`, `spec_url`,
`schema_url`, `maintainers`.

**Do not set** `registered` or `status_changed` — these are added by the CDG on merge.

If your convention uses other conventions, enter the UUIDs of those other conventions
in the `composes` field as a comma-separated list of double-quoted UUIDs.

If your convention already has some implementations (tools or publicly accessible
data sets) enter them under `implementations` using a comma-sparated list of code blocks
like so:

```json
{
  "name": "my-library",
  "description": "Library for managing large data stores for my application domain",
  "url": "https://github.com/account/my-library",
  "language": "Python"
}
```

### 3. Validate locally

If you have `ajv-cli` installed:

```bash
npm install -g ajv-cli ajv-formats
ajv validate -s schema/convention.schema.json -d submissions/{your-uuid}.json -c ajv-formats --strict=false
```

Or open the file in VS Code — if the workspace is configured correctly, schema
violations will be underlined in red automatically - or your favorite IDE for
ease of editing and validation.

### 4. Open a pull request

Open a PR against `main`. Use the PR template and fill in the **New convention
submission** section. Delete the other sections.

The validation workflow will run automatically. If it passes, the PR will be
labelled `staged` and a comment will be posted with the review period end date.

### 5. Community review

The review period is **14 days** from submission. During this time, anyone can
leave comments on the PR. The CDG will review and either merge or close the PR
with a reason after the review period ends.

You may be asked to revise the submission during the review period. To do so,
push changes to your branch — the validation workflow will re-run automatically.
If such changes are significant - and your revision takes time to implement -
the review period may be extended.

## Namespace

The `namespace` field describes how your convention exposes attributes in a Zarr
array or group.

**Prefixed style** — attributes use a namespace prefix and colon separator:

```json
"namespace": {
  "style": "prefixed",
  "key": "proj:"
}
```

Attributes would be named `proj:crs`, `proj:wkt`, etc.

**Nested style** — attributes are grouped under a single top-level key:

```json
"namespace": {
  "style": "nested",
  "key": "cs"
}
```

The convention's attributes live under the `cs` key as a nested object.

## Superseding an existing convention

If your convention supersedes an existing registered convention — meaning it updates
the convention and existing users are advised to migrate — add a `supersedes` field
containing the UUID of the convention being superseded:

```json
"supersedes": "uuid-of-existing-convention"
```

This exempts your submission from the namespace uniqueness check and signals to
the registry that the older convention should eventually be deprecated.

You should only propose to supersede an existing convention if you own the
convention being superseded.

## Modifying an existing registration

To update an existing registry entry, open a PR modifying the relevant file
in `registry/` directly. Only the following fields may be modified:

| Field             | Notes                                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| `maintainers`     | Minimum one maintainer must remain                                     |
| `tags`            | Free to update                                                         |
| `implementations` | Add or remove implementation links                                     |
| `doi`             | Add or update persistent identifier                                    |
| `version`         | Minor and patch increments only — major version requires a new UUID    |
| `maturity`        | With appropriate evidence; deprecation requires `maturity: deprecated` |
| `supersedes`      | UUID of the convention this one supersedes                             |

Changes to `uuid`, `name`, `namespace`, `spec_url`, `schema_url`, `description`,
or `composes` are considered material changes and require a new convention entry
with a new UUID.

## Questions

Open an issue in this repository or join the discussion at
[zarr-conventions/zarr-conventions-spec](https://github.com/zarr-conventions/zarr-conventions-spec).
