import { wishlist, cart, currentUser, ui } from "../services/store.js";
import { escapeHtml, attr, icon } from "../utils/helpers.js";

export function renderBottomNavigation() {
  const currentTab = ui.page;
  const isAdmin = currentUser && currentUser.role === "admin";
  const accountLink = currentUser ? "#/account" : "#/auth";

  // Match active state for account tabs
  const isAccountActive = ["account", "auth", "admin-dashboard"].includes(currentTab);

  return `
    <nav class="bottom-nav" aria-label="Mobile bottom navigation">
      <a href="#/" class="bottom-nav-item ${currentTab === "home" ? "active" : ""}">
        <span class="bottom-nav-icon">${icon("home", 22)}</span>
        <span class="bottom-nav-label">Home</span>
      </a>
      
      <a href="#/catalog" class="bottom-nav-item ${currentTab === "catalog" ? "active" : ""}">
        <span class="bottom-nav-icon">${icon("grid", 22)}</span>
        <span class="bottom-nav-label">Collections</span>
      </a>
      
      <!-- Elevated center action button -->
      <a href="#/custom-order" class="bottom-nav-upload ${currentTab === "custom-order" ? "active" : ""}" aria-label="Upload Design">
        <span class="upload-icon-wrapper">
          ${icon("upload-cloud", 24)}
        </span>
        <span class="bottom-nav-label upload-label">Upload</span>
      </a>
      
      <a href="#/track-order" class="bottom-nav-item ${currentTab === "track-order" ? "active" : ""}">
        <span class="bottom-nav-icon">${icon("file-text", 22)}</span>
        <span class="bottom-nav-label">Quotes</span>
      </a>
      
      <a href="${accountLink}" class="bottom-nav-item ${isAccountActive ? "active" : ""}">
        <span class="bottom-nav-icon">${icon("user", 22)}</span>
        <span class="bottom-nav-label">Account</span>
      </a>
    </nav>
  `;
}
