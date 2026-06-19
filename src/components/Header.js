import { site, cart, wishlist, currentUser } from "../services/store.js";
import { escapeHtml, attr, icon } from "../utils/helpers.js";

function cartCount() {
  return cart.reduce((total, item) => total + item.qty, 0);
}

export function renderHeader() {
  const isAdmin = currentUser && currentUser.role === "admin";
  const adminIcon = isAdmin ? "shield-check" : "user-round";
  const userProfileLink = currentUser
    ? (isAdmin ? "#/admin-dashboard" : "#/account")
    : "#/auth";
  const count = cartCount();

  return `
    <header class="site-header" id="siteHeader">

      <!-- Brand -->
      <a class="brand-lockup" href="#/" aria-label="${attr(site.brand.name)} home">
        <span class="brand-name">${escapeHtml(site.brand.name.split(" ")[0] || site.brand.name)}</span>
        <span class="brand-sub">${escapeHtml(site.brand.name.split(" ").slice(1).join(" ") || "Designer")}</span>
        <span class="brand-tagline">${escapeHtml(site.brand.tagline)}</span>
      </a>

      <!-- Primary Navigation — 5 focused links only -->
      <nav class="main-nav" aria-label="Main navigation">
        <a href="#/catalog" class="nav-link nav-link--page">Design Library</a>
        <a href="#/catalog?collection=bridal" class="nav-link nav-link--page">Collections</a>
        <a href="#/custom-order" class="nav-link nav-link--page">Custom Order</a>
        <button type="button" class="nav-link" data-action="scroll-to" data-target="stories">About</button>
        <button type="button" class="nav-link" data-action="scroll-to" data-target="footer">Contact</button>
      </nav>

      <!-- Action Icons -->
      <div class="header-actions">
        <button type="button" class="icon-button" data-action="open-search" aria-label="Search designs">
          ${icon("search", 20)}
        </button>
        <a href="${userProfileLink}" class="icon-button header-profile-btn" aria-label="${currentUser ? "My account" : "Sign in"}">
          ${icon(adminIcon, 20)}
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
