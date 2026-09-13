import { site, cart } from "../../services/store.js";
import { escapeHtml, attr, icon } from "../../utils/helpers.js";

function cartCount() {
  return cart.reduce((total, item) => total + item.qty, 0);
}

export function renderMobileHeader() {
  const count = cartCount();
  return `
    <header class="mobile-header" id="mobileHeader">
      <!-- Left: Hamburger Menu Button -->
      <button type="button" class="mobile-menu-btn" data-action="toggle-mobile-menu" aria-label="Open menu">
        ${icon("menu", 22)}
      </button>

      <!-- Center: Brand Logo (Centered on Mobile) -->
      <a class="mobile-brand-lockup" href="#/" aria-label="${attr(site.brand.name)} home">
        <span class="mobile-brand-name">${escapeHtml(site.brand.name.split(" ")[0] || site.brand.name)}</span>
        <span class="mobile-brand-sub">${escapeHtml(site.brand.name.split(" ").slice(1).join(" ") || "Designer")}</span>
      </a>

      <!-- Right: Action Buttons (Search & Cart) -->
      <div class="mobile-header-actions" style="display: flex; align-items: center; gap: 2px;">
        <button type="button" class="mobile-search-btn" data-action="open-search" aria-label="Search designs" style="background: transparent; border: none; color: var(--navy); width: 42px; height: 42px; display: grid; place-items: center; cursor: pointer; padding: 0;">
          ${icon("search", 20)}
        </button>
        <button type="button" class="mobile-cart-btn" data-action="open-cart" aria-label="Cart (${count} items)" style="background: transparent; border: none; color: var(--navy); width: 42px; height: 42px; display: grid; place-items: center; cursor: pointer; padding: 0; position: relative;">
          ${icon("shopping-bag", 20)}
          <span class="mobile-cart-badge${count === 0 ? " mobile-cart-badge--empty" : ""}">${count}</span>
        </button>
      </div>
    </header>
  `;
}
