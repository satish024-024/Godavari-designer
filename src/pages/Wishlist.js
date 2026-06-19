import { site, wishlist, addToCart, toggleWishlist, showToast } from "../services/store.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

function getProduct(id) {
  return site.products.find((product) => product.id === id);
}

export function renderWishlist() {
  const savedIds = Array.from(wishlist);
  const savedProducts = savedIds
    .map(id => getProduct(id))
    .filter(p => p !== undefined);

  if (savedProducts.length === 0) {
    return `
      <section class="content-section wishlist-empty-section" style="padding: 120px 24px; text-align: center; background: var(--ivory); min-height: 70vh; display: flex; align-items: center; justify-content: center;">
        <div style="max-width: 440px; margin: 0 auto; display: grid; gap: 16px; justify-items: center;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: #fff; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--navy); margin-bottom: 8px;">
            ${icon("heart", 30)}
          </div>
          <h1 style="font-family: var(--font-serif); font-size: 32px; color: var(--navy); font-weight: 700; margin: 0;">No Saved Designs Yet</h1>
          <p style="color: var(--ink-soft); font-size: 14px; line-height: 1.6; margin: 0;">
            Explore our embroidery collection and save designs for later.
          </p>
          <a href="#/catalog" class="button button-primary" style="margin-top: 12px; display: inline-flex; align-items: center; gap: 8px; font-weight: 700;">
            <span>Browse Designs</span>
            ${icon("arrow-right", 18)}
          </a>
        </div>
      </section>
    `;
  }

  const gridCardsHtml = savedProducts.map((product) => {
    const defaultFormat = product.formats && product.formats[0] ? product.formats[0].format : "DST";
    const totalStitches = product.totalStitchCount;
    const colors = product.threadColors;
    const formatsList = (product.formats || []).map(f => f.format).join(", ") || "DST";

    return `
      <article class="wishlist-item-card" style="border: 1px solid var(--border); border-radius: 6px; background: #fff; display: flex; flex-direction: column; overflow: hidden; position: relative; transition: all 0.3s ease;">
        <!-- Remove button (top right corner) -->
        <button type="button" data-action="wishlist-remove" data-id="${attr(product.id)}" aria-label="Remove saved design" class="wishlist-card-remove" style="position: absolute; top: 12px; right: 12px; z-index: 10; width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--border); background: rgba(255, 255, 255, 0.9); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink-soft); transition: all 0.2s;">
          ${icon("x", 16)}
        </button>

        <!-- Product Image -->
        <div style="position: relative; width: 100%; padding-top: 100%; overflow: hidden; background: var(--surface); border-bottom: 1px solid var(--border);">
          <img src="${attr(mediaUrl(product.image))}" alt="${attr(product.title)}" loading="lazy" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;" />
        </div>

        <!-- Product Details -->
        <div style="padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <div>
            <span style="font-size: 10px; text-transform: uppercase; color: var(--gold); font-weight: 700; letter-spacing: 0.5px;">${escapeHtml(product.collection || "Placements")} &bull; ${escapeHtml(product.category)}</span>
            <h3 style="font-family: var(--font-serif); font-size: 16px; color: var(--navy); font-weight: 700; margin: 4px 0 2px;">${escapeHtml(product.title)}</h3>
            <span style="font-size: 10px; color: var(--ink-soft);">Code: ${escapeHtml(product.code)}</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; color: var(--ink-soft); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 8px 0; margin-top: 4px;">
            <span>🧵 Stitches: <strong style="color: var(--navy);">${totalStitches.toLocaleString()}</strong></span>
            <span>🎨 Colors: <strong style="color: var(--navy);">${colors}</strong></span>
            <span style="grid-column: 1 / -1;">💻 Formats: <strong style="color: var(--navy);">${escapeHtml(formatsList)}</strong></span>
          </div>

          <div style="margin-top: auto; padding-top: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 12px; color: var(--ink-soft);">Starting Price</span>
              <strong style="font-size: 16px; color: var(--navy); font-weight: 700;">${money(product.price)}</strong>
            </div>

            <!-- Action buttons stack -->
            <div style="display: grid; gap: 8px;">
              <!-- Add to Cart (Primary action, minimum 48px touch target) -->
              <button type="button" data-action="wishlist-to-cart" data-id="${attr(product.id)}" data-format="${attr(defaultFormat)}" class="button button-primary" style="width: 100%; min-height: 48px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; border: none; cursor: pointer;">
                <span>Add to Cart</span>
                ${icon("shopping-bag", 16)}
              </button>

              <!-- View Details (Secondary action, minimum 48px touch target) -->
              <a href="#/product/${attr(product.slug)}" class="button button-secondary" style="width: 100%; min-height: 48px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; text-decoration: none; cursor: pointer;">
                <span>View Details</span>
                ${icon("arrow-right", 16)}
              </a>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");

  return `
    <section class="content-section wishlist-page-section" style="padding-top: var(--header-height); background: var(--ivory); min-height: 90vh;">
      <div style="width: min(100%, 1280px); margin: 0 auto; padding: 32px 24px 80px;">
        
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="font-family: var(--font-serif); font-size: clamp(36px, 4.5vw, 54px); color: var(--navy); font-weight: 700; margin: 0 0 8px;">Saved Designs</h1>
            <p style="color: var(--ink-soft); font-size: 15px; margin: 0;">Curate your embroidery collection before ordering.</p>
          </div>
          <a href="#/catalog" class="text-action" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; padding-bottom: 6px;">
            ${icon("arrow-left", 16)}
            <span>Continue Shopping</span>
          </a>
        </div>

        <!-- Wishlist design grid -->
        <div class="wishlist-grid" style="margin-bottom: 60px;">
          ${gridCardsHtml}
        </div>

        <hr style="border: 0; border-top: 1px solid var(--border); margin: 60px 0 40px;" />

        <!-- Related Actions Banner: Need Something Custom? -->
        <div class="custom-promo-banner" style="border: 1px solid var(--border); border-radius: 8px; padding: 40px; background: #fff; text-align: center; display: grid; gap: 12px; justify-items: center; max-width: 800px; margin: 0 auto;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--gold); letter-spacing: 0.5px;">Need Something Custom?</span>
          <h2 style="font-family: var(--font-serif); font-size: 28px; color: var(--navy); font-weight: 700; margin: 0;">Request Custom Embroidery Digitizing</h2>
          <p style="color: var(--ink-soft); font-size: 14px; max-width: 580px; margin: 0 auto 12px; line-height: 1.6;">
            Upload your logo, sketch, blouse photo, or saree border design and receive a professional production-ready embroidery quote.
          </p>
          <a href="#/custom-order" class="button button-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 700;">
            <span>Request Custom Digitizing</span>
            ${icon("sparkles", 18)}
          </a>
        </div>

      </div>
    </section>
  `;
}
