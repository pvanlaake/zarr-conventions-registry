## Convention registration — PR checklist

Select the type of PR by deleting the sections that do not apply.

---

## 🆕 New convention submission

**Convention name:**
**Namespace key:**
**Spec URL:**

### Checklist

- [ ] I have generated a UUID with `uuidgen` and used it as both the filename and the `uuid` field
- [ ] The file is in `submissions/` and named `{uuid}.json`
- [ ] The file validates against `schema/convention.schema.json`
- [ ] `spec_url` and `schema_url` point to publicly accessible, stable URLs
- [ ] `namespace.key` does not conflict with any existing registered convention
- [ ] I have not set `registered` or `status_changed` (these are set by the CDG on merge)
- [ ] I have read the [registration guidelines](../submissions/README.md)

### Evidence of readiness

_Describe the current state of the convention: implementations, datasets using it,
community discussion, or other signals that it is ready for review._

### Relationship to existing conventions

_Does this convention compose with, extend, or supersede any existing registered conventions?
If it supersedes an existing convention, include the UUID in the `supersedes` field._

---

## ✏️ Modification to existing registration

**Convention name:**
**UUID:**
**Fields being modified:**

### Checklist

- [ ] Only permitted fields are modified: `maintainers`, `tags`, `implementations`, `doi`, `version` (minor/patch only), `maturity`, `supersedes`
- [ ] If modifying `maintainers`, at least one maintainer remains
- [ ] If modifying `version`, the major version is unchanged
- [ ] The file still validates against `schema/convention.schema.json`

### Reason for modification

_Briefly explain what is being changed and why._

---

## 🗑️ Deprecation request

**Convention name:**
**UUID:**
**Successor convention UUID (if any):**

### Checklist

- [ ] `maturity` is set to `deprecated`
- [ ] If a successor exists, `supersedes` is set on the successor entry (not this one)
- [ ] The reason for deprecation is documented below

### Reason for deprecation

_Explain why this convention is being deprecated and what data producers using it should do._
