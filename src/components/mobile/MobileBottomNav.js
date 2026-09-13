import { site, wishlist, cart, currentUser, ui, isProductUnlocked } from "../../services/store.js";
import { attr, icon, money, escapeHtml } from "../../utils/helpers.js";

export function renderMobileBottomNav() {
  const currentTab = ui.page;

  // On product detail page, transform bottom nav into sticky buy/download action bar
  if (currentTab === "product-detail") {
    const slug = ui.pageParams?.slug;
    const product = site.products.find((p) => p.slug === slug || p.id === ui.pageParams?.id);
    if (product) {
      const isUnlocked = isProductUnlocked(product.id);
      const isSaved = wishlist.has(product.id);
      const displayPrice = product.price;

      return `
        <div class="mobile-sticky-buy-bar" aria-label="Product actions">
          <div class="mobile-buy-bar-inner">
            <button type="button" class="mobile-buy-bar-wishlist ${isSaved ? "active" : ""}" data-action="toggle-wishlist" data-id="${attr(product.id)}" aria-label="${isSaved ? "Remove from wishlist" : "Add to wishlist"}">
              ${icon("heart", 18)}
            </button>
            <div class="mobile-buy-bar-price-wrap">
              <span class="mobile-buy-bar-price">${money(displayPrice)}</span>
              <span class="mobile-buy-bar-code">${escapeHtml(product.code || "DST + PES")}</span>
            </div>
            ${isUnlocked ? `
              <div class="mobile-buy-bar-download-btns">
                <button type="button" class="button mobile-buy-btn unlocked" data-action="download-machine-file" data-id="${attr(product.id)}" data-format="DST" style="background: #237804; color: #fff;">
                  ${icon("download", 14)}
                  <span>.DST</span>
                </button>
                <button type="button" class="button mobile-buy-btn unlocked" data-action="download-machine-file" data-id="${attr(product.id)}" data-format="PES" style="background: #237804; color: #fff;">
                  ${icon("download", 14)}
                  <span>.PES</span>
                </button>
              </div>
            ` : `
              <div class="mobile-buy-bar-action-btns">
                <button type="button" class="button button-secondary mobile-cart-btn-compact" data-action="add-cart" data-id="${attr(product.id)}" data-format="DST" aria-label="Add to Studio Cart">
                  ${icon("shopping-bag", 16)}
                </button>
                <button type="button" class="button button-primary mobile-buy-btn" data-action="buy-now" data-id="${attr(product.id)}" style="background: var(--navy); color: #fff;">
                  ${icon("zap", 15)}
                  <span>Buy Now</span>
                </button>
              </div>
            `}
          </div>
        </div>
      `;
    }
  }

  const wishlistSize = wishlist.size;
  const accountLink = currentUser ? "#/account" : "#/auth";
  const isAccountActive = ["account", "auth", "purchases", "purchase-detail", "order-tracking", "payment-pending", "payment-success"].includes(currentTab);

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

