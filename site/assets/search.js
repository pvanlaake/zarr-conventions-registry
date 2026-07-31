// ── State ──────────────────────────────────────────────────────────────────
let catalog = [];
let fuse = null;
let nameIndex = {};

// ── Config per page ────────────────────────────────────────────────────────
const CONFIG = {
  registered: {
    catalog: "catalog.json",
    emptyText: "No conventions match your search.",
    statsLabel: (entry) =>
      `${entry} convention${entry !== 1 ? "s" : ""} registered`,
    showSearch: true,
    showPrLink: false,
  },
  staged: {
    catalog: "staged.json",
    emptyText: "No conventions are currently staged for review.",
    statsLabel: (entry) =>
      `${entry} convention${entry !== 1 ? "s" : ""} under review`,
    showSearch: false,
    showPrLink: true,
  },
  deprecated: {
    catalog: "deprecated.json",
    emptyText: "No deprecated conventions.",
    statsLabel: (entry) =>
      `${entry} deprecated convention${entry !== 1 ? "s" : ""}`,
    showSearch: false,
    showPrLink: false,
  },
};

const config = CONFIG[PAGE] || CONFIG.registered;

// ── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await loadCatalog();
  if (config.showSearch) {
    buildTagFilter();
    bindSearchEvents();
  }
  renderAll(catalog);
  bindModalEvents();
});

// ── Data ───────────────────────────────────────────────────────────────────
async function loadCatalog() {
  const results = document.getElementById("results");
  try {
    const res = await fetch(config.catalog);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    catalog = await res.json();
    catalog.forEach((e) => {
      nameIndex[e.uuid] = e.name;
    });

    if (config.showSearch && typeof Fuse !== "undefined") {
      fuse = new Fuse(catalog, {
        keys: [
          { name: "name", weight: 3 },
          { name: "namespace.key", weight: 3 },
          { name: "title", weight: 2 },
          { name: "tags", weight: 2 },
          { name: "description", weight: 1 },
          { name: "maintainers", weight: 1 },
        ],
        threshold: 0.35,
      });
    }
  } catch (err) {
    results.innerHTML = `<p class="empty">Could not load catalog: ${err.message}</p>`;
  }
}

// ── Filters ────────────────────────────────────────────────────────────────
function buildTagFilter() {
  const tags = new Set();
  catalog.forEach((e) => (e.tags || []).forEach((t) => tags.add(t)));
  const select = document.getElementById("filter-tag");
  if (!select) return;
  [...tags].sort().forEach((tag) => {
    const opt = document.createElement("option");
    opt.value = tag;
    opt.textContent = tag;
    select.appendChild(opt);
  });
}

function applyFilters() {
  const query = document.getElementById("search-input")?.value.trim() || "";
  const maturity = document.getElementById("filter-maturity")?.value || "";
  const tag = document.getElementById("filter-tag")?.value || "";

  let results = catalog;

  if (query && fuse) {
    results = fuse.search(query).map((r) => r.item);
  }

  if (maturity) results = results.filter((e) => e.maturity === maturity);
  if (tag) results = results.filter((e) => (e.tags || []).includes(tag));

  renderAll(results);
}

// ── Rendering ──────────────────────────────────────────────────────────────
function renderAll(entries) {
  const stats = document.getElementById("stats");
  const results = document.getElementById("results");

  if (stats) {
    const total = catalog.length;
    const shown = entries.length;
    stats.textContent =
      shown === total
        ? config.statsLabel(total)
        : `Showing ${shown} of ${config.statsLabel(total)}`;
  }

  if (entries.length === 0) {
    results.innerHTML = `<p class="empty">${config.emptyText}</p>`;
    return;
  }

  results.innerHTML = "";
  entries.forEach((entry) => results.appendChild(renderCard(entry)));
}

function renderCard(entry) {
  const card = document.createElement("div");
  card.className = "card";
  if (PAGE === "deprecated") card.classList.add("card-deprecated");
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", `View details for ${entry.name}`);

  const maturityBadge = entry.maturity
    ? `<span class="badge badge-maturity-${entry.maturity}">${entry.maturity}</span>`
    : "";

  const tagBadges = (entry.tags || [])
    .map((t) => `<span class="badge badge-tag">${esc(t)}</span>`)
    .join("");

  const nsKey =
    entry.namespace && entry.namespace.key
      ? `<span class="card-namespace">${esc(entry.namespace.key)}</span>`
      : "";

  const prLink = config.showPrLink
    ? `<a class="card-pr-link"
          href="https://github.com/pvanlaake/zarr-conventions-registry/pulls?q=is%3Apr+is%3Aopen+${esc(entry.uuid)}"
          target="_blank" rel="noopener"
          onclick="event.stopPropagation()">
          Review on GitHub →
       </a>`
    : "";

  const supersededBy = entry.supersedes
    ? `<span class="badge badge-superseded">supersedes ${esc(nameIndex[entry.supersedes] || entry.supersedes)}</span>`
    : "";

  card.innerHTML = `
    <div class="card-header">
      <span class="card-name">${esc(entry.name)}</span>
      ${nsKey}
      ${entry.title ? `<span class="card-title">${esc(entry.title)}</span>` : ""}
    </div>
    <p class="card-description">${esc(entry.description)}</p>
    <div class="card-footer">
      ${maturityBadge}
      ${tagBadges}
      ${supersededBy}
      ${prLink}
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
      ? entry.composes
          .map(
            (uuid) =>
              `<span class="badge badge-tag">${esc(nameIndex[uuid] || uuid)}</span>`,
          )
          .join(" ")
      : '<span class="muted">none</span>';

  const usedByHTML =
    (entry.used_by || []).length > 0
      ? entry.used_by
          .map(
            (uuid) =>
              `<span class="badge badge-tag">${esc(nameIndex[uuid] || uuid)}</span>`,
          )
          .join(" ")
      : '<span class="muted">none</span>';

  const maintainersHTML = (entry.maintainers || [])
    .map((m) =>
      m.startsWith("@")
        ? `<a href="https://github.com/${m.slice(1)}" target="_blank" rel="noopener">${esc(m)}</a>`
        : esc(m),
    )
    .join(", ");

  const nsHTML =
    entry.namespace && entry.namespace.key
      ? `<p class="modal-namespace">
         ${entry.namespace.style === "prefixed" ? "Prefixed" : "Nested"} namespace:
         <code>${esc(entry.namespace.key)}</code>
       </p>`
      : "";

  const supersedesHTML = entry.supersedes
    ? `<div class="modal-section">
         <h3>Supersedes</h3>
         <p><span class="badge badge-tag">${esc(nameIndex[entry.supersedes] || entry.supersedes)}</span></p>
       </div>`
    : "";

  const prLinkHTML = config.showPrLink
    ? `<div class="modal-section">
         <h3>Community review</h3>
         <p>
           <a href="https://github.com/pvanlaake/zarr-conventions-registry/pulls?q=is%3Apr+is%3Aopen+${esc(entry.uuid)}"
              target="_blank" rel="noopener">
             View PR and leave comments on GitHub →
           </a>
         </p>
       </div>`
    : "";

  const reviewNote =
    PAGE === "deprecated"
      ? `<div class="modal-section">
         <h3>Note</h3>
         <p class="muted">This convention is deprecated but remains permanently in the registry
         to support existing datasets.</p>
       </div>`
      : "";

  body.innerHTML = `
    <h2 id="modal-title">${esc(entry.name)}${entry.title ? " — " + esc(entry.title) : ""}</h2>
    ${nsHTML}

    <div class="modal-section">
      <h3>Description</h3>
      <p>${esc(entry.description)}</p>
    </div>

    ${
      entry.maturity
        ? `
    <div class="modal-section">
      <h3>Maturity</h3>
      <p><span class="badge badge-maturity-${entry.maturity}">${entry.maturity}</span></p>
    </div>`
        : ""
    }

    <div class="modal-section">
      <h3>Composes</h3>
      <p>${composesHTML}</p>
    </div>

    <div class="modal-section">
      <h3>Used by</h3>
      <p>${usedByHTML}</p>
    </div>

    ${supersedesHTML}

    <div class="modal-section">
      <h3>Maintainers</h3>
      <p>${maintainersHTML}</p>
    </div>

    ${
      entry.version
        ? `
    <div class="modal-section">
      <h3>Version</h3>
      <p>${esc(entry.version)}</p>
    </div>`
        : ""
    }

    <div class="modal-section">
      <h3>Links</h3>
      <div class="modal-links">
        <a href="${esc(entry.spec_url)}" target="_blank" rel="noopener">Specification</a>
        <a href="${esc(entry.schema_url)}" target="_blank" rel="noopener">JSON Schema</a>
        ${
          entry.doi
            ? `<a href="https://doi.org/${esc(entry.doi)}" target="_blank" rel="noopener">DOI: ${esc(entry.doi)}</a>`
            : ""
        }
      </div>
    </div>

    ${
      (entry.implementations || []).length > 0
        ? `
    <div class="modal-section">
      <h3>Implementations</h3>
      <div class="modal-links">
        ${entry.implementations
          .map(
            (impl) =>
              `<a href="${esc(impl.url)}" target="_blank" rel="noopener">
             ${esc(impl.name)}${impl.language ? " (" + esc(impl.language) + ")" : ""}
           </a>`,
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
      <p>${entry.tags.map((t) => `<span class="badge badge-tag">${esc(t)}</span>`).join(" ")}</p>
    </div>`
        : ""
    }

    ${prLinkHTML}
    ${reviewNote}

    <p class="modal-uuid">
      UUID: ${esc(entry.uuid)}
      ${entry.registered ? `<br>Registered: ${esc(entry.registered)}` : ""}
      ${entry.status_changed ? `<br>Status changed: ${esc(entry.status_changed)}` : ""}
    </p>
  `;

  overlay.hidden = false;
  document.getElementById("modal-close").focus();
}

function closeModal() {
  document.getElementById("modal-overlay").hidden = true;
}

// ── Events ─────────────────────────────────────────────────────────────────
function bindSearchEvents() {
  document
    .getElementById("search-input")
    ?.addEventListener("input", applyFilters);
  document
    .getElementById("filter-maturity")
    ?.addEventListener("change", applyFilters);
  document
    .getElementById("filter-tag")
    ?.addEventListener("change", applyFilters);
}

function bindModalEvents() {
  document.getElementById("modal-close")?.addEventListener("click", closeModal);
  document.getElementById("modal-overlay")?.addEventListener("click", (e) => {
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
