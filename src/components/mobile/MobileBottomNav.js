import { wishlist, cart, currentUser, ui } from "../../services/store.js";
import { attr, icon } from "../../utils/helpers.js";

export function renderMobileBottomNav() {
  const currentTab = ui.page;
  const wishlistSize = wishlist.size;

  const accountLink = currentUser ? "#/account" : "#/auth";

  const isAccountActive = ["account", "auth", "admin-dashboard"].includes(currentTab);

  return `
    <nav class="mobile-bottom-nav" aria-label="Mobile bottom navigation">
      <a href="#/" class="mobile-nav-item ${currentTab === "home" ? "active" : ""}">
        <span class="mobile-nav-icon-container">
          ${icon("home", 20)}
        </span>
        <span class="mobile-nav-label">Home</span>
      </a>
      
      <a href="#/catalog" class="mobile-nav-item ${currentTab === "catalog" ? "active" : ""}">
        <span class="mobile-nav-icon-container">
          ${icon("grid", 20)}
        </span>
        <span class="mobile-nav-label">Catalog</span>
      </a>
      
      <a href="#/custom-order" class="mobile-nav-item ${currentTab === "custom-order" ? "active" : ""}">
        <span class="mobile-nav-icon-container">
          ${icon("sparkles", 20)}
        </span>
        <span class="mobile-nav-label">Custom</span>
      </a>
      
      <a href="#/wishlist" class="mobile-nav-item ${currentTab === "wishlist" ? "active" : ""}">
        <span class="mobile-nav-icon-container" style="position: relative;">
          ${icon("heart", 20)}
          ${wishlistSize > 0 ? `<span class="mobile-nav-badge">${wishlistSize}</span>` : ""}
        </span>
        <span class="mobile-nav-label">Saved</span>
      </a>
      
      <a href="${accountLink}" class="mobile-nav-item ${isAccountActive ? "active" : ""}">
        <span class="mobile-nav-icon-container">
          ${icon("user", 20)}
        </span>
        <span class="mobile-nav-label">Account</span>
      </a>
    </nav>
  `;
}
