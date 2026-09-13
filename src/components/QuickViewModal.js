import { site, wishlist, addToCart, toggleWishlist, closePanels } from "../services/store.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

export function renderQuickViewModal(productId) {
  const product = site.products.find((p) => p.id === productId);
  if (!product) return "";

  const isSaved = wishlist.has(product.id);
  const formatsList = product.machineFormats.join(", ");
  const fabricsList = product.recommendedFabrics.join(", ");

  return `
    <div class="overlay-panel quickview-overlay" role="dialog" aria-modal="true" aria-label="Quick view ${attr(product.title)}">
      <div class="overlay-scrim" data-action="close-panels"></div>
      <section class="quickview-modal">
        <button type="button" class="icon-button modal-close" data-action="close-panels" aria-label="Close details">${icon("x", 22)}</button>
        
        <div class="quickview-grid">
          <!-- Left: Gallery -->
          <div class="quickview-gallery">
            <div class="main-image-wrapper">
              <img id="quickviewMainImg" src="${attr(mediaUrl(product.image))}" alt="${attr(product.title)}" />
            </div>
            ${
              product.gallery && product.gallery.length > 1
                ? `<div class="gallery-thumbs">
                    ${product.gallery
                      .map(
                        (thumbId) => `
                          <button type="button" class="thumb-btn" data-action="swap-qv-image" data-src="${attr(mediaUrl(thumbId))}">
                            <img src="${attr(mediaUrl(thumbId))}" alt="Thumbnail" />
                          </button>
                        `
                      )
                      .join("")}
                  </div>`
                : ""
            }
          </div>

          <!-- Right: Specs and Info -->
          <div class="quickview-info">
            <span class="product-label">${escapeHtml(product.label)}</span>
            <h2 class="product-title">${escapeHtml(product.title)}</h2>
            <div class="product-meta-row">
              <span>Category: <strong>${escapeHtml(product.category)}</strong></span>
              <span>Collection: <strong>${escapeHtml(product.collection)}</strong></span>
            </div>
            <p class="product-price">${money(product.price)}</p>
            <p class="product-desc">${escapeHtml(product.description)}</p>
            
            <div class="specs-table">
              <div class="specs-row">
                <span>Stitch Breakdown</span>
                <strong>${product.totalStitchCount.toLocaleString()} total (${product.backStitchCount.toLocaleString()} back, ${product.handStitchCount.toLocaleString()} hand)</strong>
              </div>
              <div class="specs-row">
                <span>Dimensions (W x H)</span>
                <strong>${product.width}mm x ${product.height}mm (${escapeHtml(product.dimensions)})</strong>
              </div>
              <div class="specs-row">
                <span>Machine Speed & Time</span>
                <strong>${product.rpm} RPM &bull; ~${product.estimatedEmbroideryTime} mins</strong>
              </div>
              <div class="specs-row">
                <span>Thread Colors & Difficulty</span>
                <strong>${product.threadColors} colors &bull; ${escapeHtml(product.difficultyLevel)}</strong>
              </div>
              <div class="specs-row">
                <span>Recommended Fabrics</span>
                <strong>${escapeHtml(fabricsList)}</strong>
              </div>
              <div class="specs-row">
                <span>Formats & Machines</span>
                <strong id="qvFormatsDetails">${escapeHtml(formatsList)}</strong>
              </div>
            </div>

            <!-- Format Selector -->
            <label class="format-select-label">
              <span>Select File Format & View Compatibility</span>
              <select id="qvFileFormat" class="format-dropdown" data-action="qv-change-format" data-id="${attr(product.id)}">
                ${product.formats
                  .map(
                    (f) => `
                      <option value="${attr(f.format)}">
                        ${escapeHtml(f.format)} (${escapeHtml(f.machineBrand)} ${escapeHtml(f.machineModel)} &bull; Hoop: ${escapeHtml(f.hoopSize)})
                      </option>
                    `
                  )
                  .join("")}
              </select>
            </label>

            <!-- Actions -->
            <div class="quickview-actions" style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
              <div style="display: flex; gap: 10px; width: 100%;">
                <button type="button" class="button button-primary" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;" data-action="qv-add-cart" data-id="${attr(product.id)}">
                  <span>Add to Studio Cart</span>
                  ${icon("shopping-bag", 18)}
                </button>
                
                <button type="button" class="icon-button heart-button ${isSaved ? "active" : ""}" data-action="toggle-wishlist" data-id="${attr(product.id)}" aria-label="Add to Wishlist" style="flex-shrink: 0; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border); border-radius: 4px; background: none; cursor: pointer;">
                  ${icon("heart", 18)}
                </button>
              </div>
              
              <a href="#/product/${attr(product.slug)}" class="button button-secondary" style="text-decoration: none; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;" data-action="close-panels">
                <span>View Full Details</span>
                ${icon("arrow-right", 18)}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}
