import { site, ui } from "../services/store.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

export function renderSearchOverlay() {
  const query = ui.searchQuery.toLowerCase().trim();
  const results = [
    ...site.collections.map((item) => ({ ...item, kind: "Collection" })),
    ...site.products.map((item) => ({ ...item, description: `${item.label} - ${money(item.price)}`, kind: "Design" }))
  ].filter((item) => {
    if (!query) return true;
    return `${item.title} ${item.description || ""} ${item.kind}`.toLowerCase().includes(query);
  });

  return `
    <div class="overlay-panel search-overlay" role="dialog" aria-modal="true" aria-label="Search designs">
      <div class="overlay-scrim" data-action="close-panels"></div>
      <section class="search-modal">
        <div class="modal-header">
          <h2>Design Library</h2>
          <button type="button" class="icon-button" data-action="close-panels" aria-label="Close search">${icon("x", 22)}</button>
        </div>
        <label class="search-field">
          ${icon("search", 22)}
          <input id="searchInput" value="${attr(ui.searchQuery)}" placeholder="Search collections, motifs, borders..." />
        </label>
        <div class="search-results">
          ${results
            .map(
              (item) => `
                <article>
                  <img src="${attr(mediaUrl(item.image))}" alt="${attr(item.title)}" />
                  <div>
                    <span>${escapeHtml(item.kind)}</span>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.description || "")}</p>
                  </div>
                  <button type="button" class="gold-circle" data-action="${item.kind === "Design" ? "add-cart" : "open-collection"}" data-id="${attr(item.id || "")}" data-label="${attr(item.title)}">
                    ${icon(item.kind === "Design" ? "shopping-bag" : "arrow-right", 17)}
                  </button>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}
