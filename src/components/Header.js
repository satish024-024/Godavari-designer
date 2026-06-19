import { site, cart, wishlist, currentUser } from "../services/store.js";
import { escapeHtml, attr, icon } from "../utils/helpers.js";

function cartCount() {
  return cart.reduce((total, item) => total + item.qty, 0);
}

export function renderHeader() {
  const adminIcon = currentUser && currentUser.role === "admin" ? "shield-check" : "user-round";
  const userProfileLink = currentUser 
    ? (currentUser.role === "admin" ? "#/admin-dashboard" : "#/account")
    : "#/auth";
  const authLabel = currentUser ? "Account" : "Login";
  
  return `
    <header class="site-header" id="siteHeader">
      <a class="brand-lockup" href="#/" aria-label="${attr(site.brand.name)} home">
        <span class="brand-name">${escapeHtml(site.brand.name.split(" ")[0] || site.brand.name)}</span>
        <span class="brand-sub">${escapeHtml(site.brand.name.split(" ").slice(1).join(" ") || "Designer")}</span>
        <span class="brand-tagline">${escapeHtml(site.brand.tagline)}</span>
      </a>
      <nav class="main-nav" aria-label="Main navigation">
        ${site.navigation
          .map(
            (item) => `
              <button type="button" class="nav-link" data-action="scroll-to" data-target="${attr(item.target)}">
                ${escapeHtml(item.label)}
              </button>
            `
          )
          .join("")}
        <a href="#/catalog" class="nav-link-anchor" style="text-decoration:none; color:var(--navy); font-size:14px; font-weight:600;">Library</a>
        <a href="#/custom-order" class="nav-link-anchor" style="text-decoration:none; color:var(--navy); font-size:14px; font-weight:600;">Custom Digitizing</a>
        <a href="#/track-order" class="nav-link-anchor" style="text-decoration:none; color:var(--navy); font-size:14px; font-weight:600;">Track Order</a>
      </nav>
      <div class="header-actions">
        <button type="button" class="icon-button" data-action="open-search" aria-label="Search">
          ${icon("search", 21)}
        </button>
        <a href="${userProfileLink}" class="icon-button header-profile-btn" aria-label="User profile" style="color: inherit; text-decoration: none; display: flex; align-items: center;">
          ${icon(adminIcon, 21)}
        </a>
        <a href="#/wishlist" class="icon-button wishlist-button" aria-label="Wishlist" style="text-decoration: none; color: inherit;">
          ${icon("heart", 21)}
          ${wishlist.size > 0 ? `<span>${wishlist.size}</span>` : ""}
        </a>
        <button type="button" class="icon-button cart-button" data-action="open-cart" aria-label="Cart">
          ${icon("shopping-bag", 21)}
          <span>${cartCount()}</span>
        </button>
      </div>
    </header>
  `;
}
