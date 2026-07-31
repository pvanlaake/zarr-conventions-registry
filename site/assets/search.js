// ── State ──────────────────────────────────────────────────────────────────
let catalog = [];
let fuse = null;
let nameIndex = {}; // uuid → name, for resolving composes/used_by

// ── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await loadCatalog();
  buildTagFilter();
  renderAll(catalog);
  bindEvents();
});

async function loadCatalog() {
  const results = document.getElementById("results");
  try {
    const res = await fetch("catalog.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    catalog = await res.json();

    // Build UUID → name lookup
    catalog.forEach((e) => {
      nameIndex[e.uuid] = e.name;
    });

    // Initialise Fuse for fuzzy search
    fuse = new Fuse(catalog, {
      keys: [
        { name: "name", weight: 3 },
        { name: "namespace", weight: 3 },
        { name: "title", weight: 2 },
        { name: "tags", weight: 2 },
        { name: "description", weight: 1 },
        { name: "maintainers", weight: 1 },
      ],
      threshold: 0.35,
      includeScore: true,
    });
  } catch (err) {
    results.innerHTML = `<p class="empty">Could not load catalog: ${err.message}</p>`;
  }
}

// ── Filters ────────────────────────────────────────────────────────────────
function buildTagFilter() {
  const tags = new Set();
  catalog.forEach((e) => (e.tags || []).forEach((t) => tags.add(t)));
  const select = document.getElementById("filter-tag");
  [...tags].sort().forEach((tag) => {
    const opt = document.createElement("option");
    opt.value = tag;
    opt.textContent = tag;
    select.appendChild(opt);
  });
}

function currentFilters() {
  return {
    query: document.getElementById("search-input").value.trim(),
    maturity: document.getElementById("filter-maturity").value,
    tag: document.getElementById("filter-tag").value,
  };
}

function applyFilters() {
  const { query, maturity, tag } = currentFilters();

  let results = catalog;

  if (query && fuse) {
    results = fuse.search(query).map((r) => r.item);
  }

  if (maturity) {
    results = results.filter((e) => e.maturity === maturity);
  }

  if (tag) {
    results = results.filter((e) => (e.tags || []).includes(tag));
  }

  renderAll(results);
}

// ── Rendering ──────────────────────────────────────────────────────────────
function renderAll(entries) {
  const stats = document.getElementById("stats");
  const results = document.getElementById("results");

  const total = catalog.length;
  const shown = entries.length;
  stats.textContent =
    shown === total
      ? `${total} convention${total !== 1 ? "s" : ""} registered`
      : `Showing ${shown} of ${total} conventions`;

  if (entries.length === 0) {
    results.innerHTML =
      '<p class="empty">No conventions match your search.</p>';
    return;
  }

  results.innerHTML = "";
  entries.forEach((entry) => {
    results.appendChild(renderCard(entry));
  });
}

function renderCard(entry) {
  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", `View details for ${entry.name}`);

  const maturityBadge = entry.maturity
    ? `<span class="badge badge-maturity-${entry.maturity}">${entry.maturity}</span>`
    : "";

  const tagBadges = (entry.tags || [])
    .map((t) => `<span class="badge badge-tag">${t}</span>`)
    .join("");

  card.innerHTML = `
    <div class="card-header">
      <span class="card-name">${esc(entry.name)}</span>
      <span class="card-namespace">${esc(entry.namespace)}:</span>
      ${entry.title ? `<span class="card-title">${esc(entry.title)}</span>` : ""}
    </div>
    <p class="card-description">${esc(entry.description)}</p>
    <div class="card-footer">
      ${maturityBadge}
      ${tagBadges}
    </div>
  `;

  card.addEventListener("click", () => openModal(entry));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") openModal(entry);
  });

  return card;
}

// ── Modal ──────────────────────────────────────────────────────────────────
function openModal(entry) {
  const overlay = document.getElementById("modal-overlay");
  const body = document.getElementById("modal-body");

  const composesHTML =
    (entry.composes || []).length > 0
      ? (entry.composes || [])
          .map((uuid) => {
            const name = nameIndex[uuid] || uuid;
            return `<span class="badge badge-tag">${esc(name)}</span>`;
          })
          .join(" ")
      : '<span style="color:var(--color-muted)">none</span>';

  const usedByHTML =
    (entry.used_by || []).length > 0
      ? (entry.used_by || [])
          .map((uuid) => {
            const name = nameIndex[uuid] || uuid;
            return `<span class="badge badge-tag">${esc(name)}</span>`;
          })
          .join(" ")
      : '<span style="color:var(--color-muted)">none</span>';

  const maintainersHTML = (entry.maintainers || [])
    .map((m) => {
      // render GitHub handles as links, everything else as plain text
      if (m.startsWith("@")) {
        const handle = m.slice(1);
        return `<a href="https://github.com/${handle}" target="_blank" rel="noopener">${esc(m)}</a>`;
      }
      return esc(m);
    })
    .join(", ");

  const versionHTML = entry.version
    ? esc(entry.version)
    : '<span style="color:var(--color-muted)">unversioned</span>';

  const doiHTML = entry.doi
    ? `<a href="https://doi.org/${entry.doi}" target="_blank" rel="noopener">${esc(entry.doi)}</a>`
    : '<span style="color:var(--color-muted)">not yet archived</span>';

  const registeredHTML = entry.registered || "—";

  body.innerHTML = `
    <h2>${esc(entry.name)}${entry.title ? " — " + esc(entry.title) : ""}</h2>
    <p class="modal-namespace">namespace: <code>${esc(entry.namespace)}</code></p>

    <div class="modal-section">
      <h3>Description</h3>
      <p>${esc(entry.description)}</p>
    </div>

    <div class="modal-section">
      <h3>Maturity</h3>
      <p>${
        entry.maturity
          ? `<span class="badge badge-maturity-${entry.maturity}">${entry.maturity}</span>`
          : "—"
      }</p>
    </div>

    <div class="modal-section">
      <h3>Composes</h3>
      <p>${composesHTML}</p>
    </div>

    <div class="modal-section">
      <h3>Used by</h3>
      <p>${usedByHTML}</p>
    </div>

    <div class="modal-section">
      <h3>Maintainers</h3>
      <p>${maintainersHTML}</p>
    </div>

    <div class="modal-section">
      <h3>Version</h3>
      <p>${versionHTML}</p>
    </div>

    <div class="modal-section">
      <h3>Links</h3>
      <div class="modal-links">
        <a href="${esc(entry.spec_url)}" target="_blank" rel="noopener">Specification</a>
        <a href="${esc(entry.schema_url)}" target="_blank" rel="noopener">JSON Schema</a>
        ${entry.doi ? doiHTML : ""}
      </div>
    </div>

    ${
      (entry.implementations || []).length > 0
        ? `
    <div class="modal-section">
      <h3>Implementations</h3>
      <div class="modal-links">
        ${(entry.implementations || [])
          .map(
            (impl) =>
              `<a href="${esc(impl.url)}" target="_blank" rel="noopener">${esc(impl.name)}${impl.language ? " (" + esc(impl.language) + ")" : ""}</a>`,
          )
          .join("")}
      </div>
    </div>`
        : ""
    }

    ${
      (entry.tags || []).length > 0
        ? `
    <div class="modal-section">
      <h3>Tags</h3>
      <p>${(entry.tags || []).map((t) => `<span class="badge badge-tag">${esc(t)}</span>`).join(" ")}</p>
    </div>`
        : ""
    }

    <p class="modal-uuid">UUID: ${esc(entry.uuid)}<br>Registered: ${registeredHTML}</p>
  `;

  overlay.hidden = false;
  document.getElementById("modal-close").focus();
}

function closeModal() {
  document.getElementById("modal-overlay").hidden = true;
}

// ── Events ─────────────────────────────────────────────────────────────────
function bindEvents() {
  document
    .getElementById("search-input")
    .addEventListener("input", applyFilters);

  document
    .getElementById("filter-maturity")
    .addEventListener("change", applyFilters);

  document
    .getElementById("filter-tag")
    .addEventListener("change", applyFilters);

  document.getElementById("modal-close").addEventListener("click", closeModal);

  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

// ── Utilities ──────────────────────────────────────────────────────────────
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
