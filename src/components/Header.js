import { site, cart, wishlist, currentUser } from "../services/store.js";
import { escapeHtml, attr, icon } from "../utils/helpers.js";

function cartCount() {
  return cart.reduce((total, item) => total + item.qty, 0);
}

export function renderHeader(isMobile) {
  const count = cartCount();

  if (isMobile) {
    return `
      <header class="site-header" id="siteHeader">
        <!-- Hamburger Menu for Mobile -->
        <button type="button" class="mobile-menu-btn" data-action="toggle-mobile-menu" aria-label="Open menu">
          ${icon("menu", 24)}
        </button>

        <!-- Brand Logo (Centered on Mobile) -->
        <a class="brand-lockup" href="#/" title="Godavari Designers logo" aria-label="Godavari Designers logo - Home">
          <span class="brand-name">${escapeHtml(site.brand.name.split(" ")[0] || site.brand.name)}</span>
          <span class="brand-sub">${escapeHtml(site.brand.name.split(" ").slice(1).join(" ") || "Designer")}</span>
          <span class="brand-tagline">${escapeHtml(site.brand.tagline)}</span>
        </a>

        <!-- Mobile Header Actions -->
        <div class="header-actions">
          <button type="button" class="icon-button mobile-search-btn" data-action="open-search" aria-label="Search designs">
            ${icon("search", 20)}
          </button>
          <button type="button" class="icon-button cart-button" data-action="open-cart" aria-label="Cart (${count} items)">
            ${icon("shopping-bag", 20)}
            <span class="header-badge${count === 0 ? " header-badge--empty" : ""}">${count}</span>
          </button>
        </div>
      </header>
    `;
  }

  // Desktop Header
  const isAdmin = currentUser && currentUser.role === "admin";
  const userProfileLink = currentUser ? "#/account" : "#/auth";

  return `
    <header class="site-header" id="siteHeader">
      <!-- Brand -->
      <a class="brand-lockup" href="#/" title="Godavari Designers logo" aria-label="Godavari Designers logo - Home">
        <span class="brand-name">${escapeHtml(site.brand.name.split(" ")[0] || site.brand.name)}</span>
        <span class="brand-sub">${escapeHtml(site.brand.name.split(" ").slice(1).join(" ") || "Designer")}</span>
        <span class="brand-tagline">${escapeHtml(site.brand.tagline)}</span>
      </a>

      <!-- Primary Navigation — 5 focused links only -->
      <nav class="main-nav" aria-label="Main navigation">
        <a href="#/catalog" class="nav-link nav-link--page">Design Library</a>
        <button type="button" class="nav-link" data-action="scroll-to" data-target="collections">Collections</button>
        <a href="#/custom-order" class="nav-link nav-link--page">Custom Order</a>
        <button type="button" class="nav-link" data-action="scroll-to" data-target="stories">About</button>
        <button type="button" class="nav-link" data-action="scroll-to" data-target="footer">Contact</button>
      </nav>

      <!-- Action Icons -->
      <div class="header-actions">
        ${isAdmin ? `
          <a href="#/admin-dashboard" class="admin-portal-badge" style="
            display: inline-flex; 
            align-items: center; 
            gap: 6px; 
            padding: 6px 14px; 
            border: 1px solid var(--gold); 
            border-radius: 4px; 
            background: transparent; 
            color: var(--gold); 
            font-size: 11px; 
            font-weight: 700; 
            text-transform: uppercase; 
            letter-spacing: 0.05em; 
            text-decoration: none; 
            transition: all 200ms;
            margin-right: 8px;
          " onmouseover="this.style.background='rgba(200, 161, 90, 0.08)'" onmouseout="this.style.background='transparent'">
            <span style="display: flex;">${icon("shield-check", 13)}</span>
            <span>Admin Portal</span>
          </a>
        ` : ""}
        <button type="button" class="icon-button" data-action="open-search" aria-label="Search designs">
          ${icon("search", 20)}
        </button>
        <a href="${userProfileLink}" class="icon-button header-profile-btn" aria-label="${currentUser ? "My account" : "Sign in"}">
          ${icon("user-round", 20)}
        </a>
        <a href="#/wishlist" class="icon-button wishlist-button" aria-label="Saved designs (${wishlist.size})">
          ${icon("heart", 20)}
          ${wishlist.size > 0 ? `<span class="header-badge">${wishlist.size}</span>` : ""}
        </a>
        <button type="button" class="icon-button cart-button" data-action="open-cart" aria-label="Cart (${count} items)">
          ${icon("shopping-bag", 20)}
          <span class="header-badge${count === 0 ? " header-badge--empty" : ""}">${count}</span>
        </button>
      </div>
    </header>
  `;
}
