import { site } from "../services/store.js";
import { escapeHtml, attr, icon, mediaUrl } from "../utils/helpers.js";

export function renderStoryModal() {
  return `
    <div class="overlay-panel" role="dialog" aria-modal="true" aria-label="Customer story">
      <div class="overlay-scrim" data-action="close-panels"></div>
      <section class="story-modal">
        <button type="button" class="icon-button modal-close" data-action="close-panels" aria-label="Close story">${icon("x", 22)}</button>
        <img src="${attr(mediaUrl(site.hero.posterImage))}" alt="${attr(site.brand.name)} studio" />
        <div>
          <span>${escapeHtml(site.brand.tagline)}</span>
          <h2>${escapeHtml(site.hero.heading)}</h2>
          <p>${escapeHtml(site.hero.note)}</p>
          <div class="story-stats">
            <strong>2,500+</strong><span>Fashion brands</span>
            <strong>24h</strong><span>Quote window</span>
            <strong>4K</strong><span>Visual-first catalog</span>
          </div>
        </div>
      </section>
    </div>
  `;
}
