import { site, ui } from "../services/store.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

export function renderSearchOverlay() {
  const raw = ui.searchQuery.trim();
  const query = raw.toLowerCase();

  // Only filter when user has typed something
  const allItems = [
    ...site.collections.map((item) => ({ ...item, kind: "Collection" })),
    ...site.products.map((item) => ({
      ...item,
      description: item.category ? `${item.category} · ${money(item.price)}` : money(item.price),
      kind: "Design"
    }))
  ];

  const results = query
    ? allItems.filter((item) =>
        `${item.title} ${item.description || ""} ${item.category || ""} ${item.code || ""}`.toLowerCase().includes(query)
      ).slice(0, 12)
    : [];

  const hasResults = results.length > 0;
  const showEmpty = query && !hasResults;

  return `
    <div class="overlay-panel search-overlay" role="dialog" aria-modal="true" aria-label="Search designs">
      <div class="overlay-scrim" data-action="close-panels"></div>
      <section class="search-modal">

        <!-- Header -->
        <div class="modal-header">
          <h2 style="font-family: var(--font-serif); font-size: 28px; margin: 0; font-weight: 700; color: var(--navy);">Search Designs</h2>
          <button type="button" class="icon-button" data-action="close-panels" aria-label="Close search">
            ${icon("x", 20)}
          </button>
        </div>

        <!-- Search Field -->
        <form class="search-field-wrap" id="searchForm" data-action="search-submit" style="display:flex; align-items:center; gap:0; margin: 20px 24px 0; border: 1.5px solid rgba(17,29,66,0.15); border-radius: 12px; overflow: hidden; background: #fff; transition: border-color 200ms;">
          <span style="padding: 0 14px; color: var(--ink-soft); display:flex; align-items:center; flex-shrink:0;">
            ${icon("search", 18)}
          </span>
          <input
            id="searchInput"
            type="search"
            value="${attr(ui.searchQuery)}"
            placeholder="Search by name, category, stitch count..."
            autocomplete="off"
            spellcheck="false"
            style="flex:1; height:52px; border:none; background:transparent; color:var(--navy); font-size:15px; font-weight:500; outline:none; padding:0;"
          />
          ${raw ? `
            <button type="button" id="searchClearBtn" data-action="search-clear" aria-label="Clear search"
              style="padding: 0 12px; border:none; background:transparent; color:var(--ink-soft); cursor:pointer; display:flex; align-items:center;">
              ${icon("x-circle", 16)}
            </button>
          ` : ""}
          <button type="submit" data-action="search-submit" aria-label="Search"
            style="height:52px; padding: 0 20px; background:var(--navy); color:#fff; border:none; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px; white-space:nowrap; transition: background 200ms;">
            ${icon("arrow-right", 16)}
            <span>Search</span>
          </button>
        </form>

        <!-- Results -->
        <div class="search-results" style="display:flex; flex-direction:column; gap:0; max-height:56vh; overflow-y:auto; padding: 16px 24px 24px;">

          ${!query ? `
            <!-- Prompt state -->
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; text-align:center; gap:10px; color:var(--ink-soft);">
              ${icon("search", 32)}
              <p style="margin:0; font-size:14px; font-weight:500;">Type to search designs, collections, or categories</p>
            </div>
          ` : showEmpty ? `
            <!-- Empty state -->
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; text-align:center; gap:10px;">
              ${icon("search-x", 32)}
              <p style="margin:0; font-size:15px; font-weight:600; color:var(--navy);">No results for "${escapeHtml(raw)}"</p>
              <p style="margin:0; font-size:13px; color:var(--ink-soft);">Try a different keyword or browse all designs below.</p>
              <a href="#/catalog" data-action="close-panels"
                style="margin-top:8px; display:inline-flex; align-items:center; gap:6px; color:var(--gold); font-size:13px; font-weight:700; text-decoration:none;">
                ${icon("layout-grid", 15)} Browse all designs
              </a>
            </div>
          ` : `
            <!-- Result count label -->
            <p style="margin:0 0 12px; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink-soft);">
              ${results.length} result${results.length !== 1 ? "s" : ""} for "${escapeHtml(raw)}"
            </p>

            <!-- Result items -->
            ${results.map((item) => `
              <a href="${item.kind === "Design" ? `#/product/${item.slug}` : `#/catalog?collection=${item.slug}`}"
                data-action="close-panels"
                style="display:grid; grid-template-columns:72px 1fr auto; gap:14px; align-items:center; padding:12px; border-radius:10px; text-decoration:none; color:inherit; transition: background 180ms; margin-bottom:6px; background:rgba(248,246,242,0.6); border: 1px solid rgba(230,222,209,0.6);">
                <img
                  src="${attr(mediaUrl(item.image))}"
                  alt="${attr(item.title)}"
                  style="width:72px; height:68px; object-fit:cover; border-radius:6px; background:var(--surface);"
                  loading="lazy"
                />
                <div style="min-width:0;">
                  <span style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--gold);">${escapeHtml(item.kind)}</span>
                  <h3 style="font-family:var(--font-serif); font-size:17px; font-weight:700; margin:2px 0 3px; color:var(--navy); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(item.title)}</h3>
                  <p style="margin:0; font-size:12px; color:var(--ink-soft); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(item.description || "")}</p>
                </div>
                <span style="flex-shrink:0; color:var(--ink-soft);">${icon("chevron-right", 16)}</span>
              </a>
            `).join("")}

            <!-- View all results link -->
            <a href="#/catalog?search=${encodeURIComponent(raw)}" data-action="close-panels"
              style="display:flex; align-items:center; justify-content:center; gap:8px; margin-top:8px; padding:12px; border:1px dashed rgba(17,29,66,0.15); border-radius:10px; color:var(--navy); font-size:13px; font-weight:700; text-decoration:none; transition: border-color 200ms, color 200ms;">
              ${icon("layout-grid", 15)}
              View all results in catalog
              ${icon("arrow-right", 14)}
            </a>
          `}

        </div>
      </section>
    </div>
  `;
}
