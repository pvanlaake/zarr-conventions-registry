const fs = require("fs");
const path = require("path");

function loadDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

// ── Registry entries ──────────────────────────────────────────────────────
const all = loadDir("registry");

const usedBy = {};
all.forEach((e) => {
  (e.composes || []).forEach((uuid) => {
    if (!usedBy[uuid]) usedBy[uuid] = [];
    usedBy[uuid].push(e.uuid);
  });
});

const registered = all
  .filter((e) => e.maturity !== "deprecated")
  .map((e) => ({ ...e, used_by: usedBy[e.uuid] || [] }))
  .sort((a, b) => (a.registered || "").localeCompare(b.registered || ""));

const deprecated = all
  .filter((e) => e.maturity === "deprecated")
  .map((e) => ({ ...e, used_by: usedBy[e.uuid] || [] }))
  .sort((a, b) =>
    (a.status_changed || "").localeCompare(b.status_changed || ""),
  );

// ── Staged entries ────────────────────────────────────────────────────────
const today = new Date().toISOString().split("T")[0];
const staged = loadDir("submissions")
  .map((e) => ({ ...e, submitted: e.submitted || today }))
  .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

// ── Write outputs ─────────────────────────────────────────────────────────
fs.writeFileSync("site/catalog.json", JSON.stringify(registered, null, 2));
fs.writeFileSync("site/deprecated.json", JSON.stringify(deprecated, null, 2));
fs.writeFileSync("site/staged.json", JSON.stringify(staged, null, 2));

// ── Search index ──────────────────────────────────────────────────────────
const index = registered.map((e) => ({
  uuid: e.uuid,
  name: e.name,
  namespace_key: e.namespace ? e.namespace.key : "",
  title: e.title || "",
  description: e.description,
  tags: (e.tags || []).join(" "),
  maturity: e.maturity || "",
  maintainers: (e.maintainers || []).join(" "),
}));
fs.writeFileSync(
  "site/assets/search-index.json",
  JSON.stringify(index, null, 2),
);

console.log(`catalog.json:      ${registered.length} entries`);
console.log(`deprecated.json:   ${deprecated.length} entries`);
console.log(`staged.json:       ${staged.length} entries`);
console.log(`search-index.json: ${index.length} entries`);
