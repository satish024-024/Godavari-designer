import { site, wishlist, addToCart, toggleWishlist, showToast, triggerRender, currentUser, getUnlockedDesigns, downloadMachineFile } from "../services/store.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

// Local tab state: 'saved' | 'downloads'
let activeWishlistTab = "saved";

function getProduct(id) {
  return (site.products || []).find((product) => product.id === id);
}

export function renderWishlist() {
  // Check URL parameter if navigated with ?tab=downloads
  const routeParams = window.location.hash.split("?")[1] || "";
  const tabParam = new URLSearchParams(routeParams).get("tab");
  if (tabParam === "downloads" || tabParam === "saved") {
    activeWishlistTab = tabParam;
  }

  const savedIds = Array.from(wishlist);
  const savedProducts = savedIds
    .map(id => getProduct(id))
    .filter(p => p !== undefined);

  const unlockedList = getUnlockedDesigns();

  return `
    <section class="content-section wishlist-page-section" style="padding-top: calc(var(--header-height) + 16px); background: var(--ivory); min-height: 90vh;">
      <div style="width: min(100%, 1280px); margin: 0 auto; padding: 24px 24px 80px;">
        
        <!-- Header & Breadcrumb -->
        <div style="margin-bottom: 24px;">
          <h1 style="font-family: var(--font-serif); font-size: clamp(32px, 4.5vw, 48px); color: var(--navy); font-weight: 700; margin: 0 0 6px;">Saved & Downloads</h1>
          <p style="color: var(--ink-soft); font-size: 14.5px; margin: 0;">Access your favorited embroidery designs and 1-tap download purchased machine stitch files.</p>
        </div>

        <!-- Dual Tabs Bar (Sheet 4) -->
        <div class="saved-dual-tabs" style="display: flex; gap: 10px; margin-bottom: 32px; border-bottom: 1.5px solid var(--border); padding-bottom: 12px;">
          <button type="button" class="filter-pill ${activeWishlistTab === 'saved' ? 'active' : ''}" data-action="set-saved-tab" data-tab="saved" style="border-radius: 99px; font-weight: 700; padding: 10px 24px; font-size: 14px; display: inline-flex; align-items: center; gap: 8px;">
            ${icon("heart", 16)}
            <span>Saved Designs (${savedProducts.length})</span>
          </button>
          
          <button type="button" class="filter-pill ${activeWishlistTab === 'downloads' ? 'active' : ''}" data-action="set-saved-tab" data-tab="downloads" style="border-radius: 99px; font-weight: 700; padding: 10px 24px; font-size: 14px; display: inline-flex; align-items: center; gap: 8px;">
            ${icon("download", 16)}
            <span>My Downloads (${unlockedList.length})</span>
          </button>
        </div>

        <!-- Tab 1: Saved Designs -->
        ${activeWishlistTab === 'saved' ? renderSavedTabContent(savedProducts) : renderDownloadsTabContent(unlockedList)}

        <hr style="border: 0; border-top: 1px solid var(--border); margin: 50px 0 36px;" />

        <!-- Related Actions Banner: Need Something Custom? -->
        <div class="custom-promo-banner" style="border: 1px solid var(--border); border-radius: 12px; padding: 36px 24px; background: #fff; text-align: center; display: grid; gap: 12px; justify-items: center; max-width: 800px; margin: 0 auto; box-shadow: var(--shadow);">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--gold); letter-spacing: 0.1em;">Custom Digitizing Available</span>
          <h2 style="font-family: var(--font-serif); font-size: clamp(24px, 3.5vw, 32px); color: var(--navy); font-weight: 700; margin: 0;">Need a Custom Stitch Pattern?</h2>
          <p style="color: var(--ink-soft); font-size: 14px; max-width: 580px; margin: 0 auto 12px; line-height: 1.6;">
            Send your sketch, blouse photo, or saree border design to our digitizing studio and get machine files delivered within 24–48 hours.
          </p>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;">
            <a href="https://wa.me/918309897055?text=Hello%20Godavari%20Designers%2C%20I%20want%20to%20request%20a%20custom%20embroidery%20digitizing%20quote." target="_blank" rel="noopener noreferrer" class="button" style="background: #25D366; color: #fff; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 700; padding: 12px 24px; border-radius: 99px;">
              ${icon("message-circle", 18)}
              <span>Chat on WhatsApp</span>
            </a>
            <a href="#/custom-order" class="button button-secondary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 700; padding: 12px 24px; border-radius: 99px;">
              <span>Online Request Form</span>
              ${icon("arrow-right", 16)}
            </a>
          </div>
        </div>

      </div>
    </section>
  `;
}

function renderSavedTabContent(savedProducts) {
  if (savedProducts.length === 0) {
    return `
      <div class="wishlist-empty-state" style="padding: 60px 20px; text-align: center; background: #fff; border: 1px dashed var(--border); border-radius: 12px;">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: var(--surface); display: grid; place-items: center; color: var(--navy); margin: 0 auto 16px;">
          ${icon("heart", 28)}
        </div>
        <h3 style="font-family: var(--font-serif); font-size: 26px; color: var(--navy); margin: 0 0 8px;">No Saved Designs</h3>
        <p style="color: var(--ink-soft); font-size: 14px; max-width: 420px; margin: 0 auto 20px;">
          Browse our embroidery design catalog and tap the heart icon to save designs for your upcoming boutique projects.
        </p>
        <a href="#/catalog" class="button button-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
          <span>Explore Catalog</span>
          ${icon("arrow-right", 16)}
        </a>
      </div>
    `;
  }

  return `
    <div class="wishlist-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px;">
      ${savedProducts.map((product) => {
        const defaultFormat = product.formats && product.formats[0] ? product.formats[0].format : "DST";
        const totalStitches = product.totalStitchCount;
        const formatsList = (product.machineFormats || []).join(", ") || "DST, PES, JEF";

        return `
          <article class="wishlist-item-card" style="border: 1px solid var(--border); border-radius: 10px; background: #fff; display: flex; flex-direction: column; overflow: hidden; position: relative; box-shadow: var(--shadow); transition: transform 0.2s ease;">
            
            <!-- Remove button -->
            <button type="button" data-action="wishlist-remove" data-id="${attr(product.id)}" aria-label="Remove saved design" style="position: absolute; top: 10px; right: 10px; z-index: 10; width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border); background: rgba(255, 255, 255, 0.9); display: grid; place-items: center; cursor: pointer; color: var(--ink-soft);">
              ${icon("x", 15)}
            </button>

            <!-- Image preview -->
            <div style="aspect-ratio: 1 / 1; background: #faf8f5; position: relative; overflow: hidden;">
              <a href="#/product/${product.slug}" style="display: block; width: 100%; height: 100%;">
                <img src="${attr(mediaUrl(product.image))}" alt="${attr(product.title)}" class="image-shield" style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;" oncontextmenu="return false;" />
              </a>
              <!-- Watermark -->
              <div class="watermark-overlay" style="bottom: 8px; right: 8px; padding: 4px 8px;">
                <span class="watermark-text" style="font-size: 9px;">GD • ${escapeHtml(product.code)}</span>
              </div>
            </div>

            <!-- Content -->
            <div style="padding: 16px; display: flex; flex-direction: column; flex: 1; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gold); background: rgba(200, 161, 90, 0.1); border: 1px solid rgba(200, 161, 90, 0.25); border-radius: 4px; padding: 2px 6px;">${escapeHtml(product.code)}</span>
                <strong style="font-size: 16px; font-weight: 800; color: var(--gold);">${money(product.price)}</strong>
              </div>

              <h3 style="font-family: var(--font-serif); font-size: 16px; color: var(--navy); font-weight: 700; margin: 0; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(product.title)}</h3>

              <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--ink-soft); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 6px 0;">
                <span>🧵 ${totalStitches ? totalStitches.toLocaleString() : "35,000"} sts</span>
                <span>💻 ${escapeHtml(formatsList)}</span>
              </div>

              <!-- Action buttons: Amazon-Style Cart & Buy Now -->
              <div style="display: flex; gap: 8px; margin-top: auto; padding-top: 6px;">
                <button type="button" data-action="wishlist-to-cart" data-id="${attr(product.id)}" data-format="${attr(defaultFormat)}" class="button button-secondary" style="flex: 1; min-height: 38px; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; font-size: 12px; border-radius: 6px; cursor: pointer;">
                  ${icon("shopping-bag", 14)}
                  <span>Cart</span>
                </button>
                <button type="button" class="button button-primary" data-action="buy-now" data-id="${attr(product.id)}" data-format="${attr(defaultFormat)}" data-price="${attr(product.price)}" data-title="${attr(product.title)}" data-code="${attr(product.code)}" style="flex: 1.2; min-height: 38px; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; font-size: 12px; border: none; cursor: pointer; border-radius: 6px; background: var(--navy); color: #fff;">
                  ${icon("zap", 14)}
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderDownloadsTabContent(unlockedList = []) {
  const whatsappPhone = (site.brand?.contact?.phone || "+91 83098 97055").replace(/[^0-9]/g, '');

  if (!unlockedList || unlockedList.length === 0) {
    return `
      <div class="wishlist-empty-state" style="padding: 60px 20px; text-align: center; background: #fff; border: 1px dashed var(--border); border-radius: 12px;">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: #faf8f5; border: 1.5px solid var(--border); display: grid; place-items: center; color: var(--navy); margin: 0 auto 16px;">
          ${icon("lock", 28)}
        </div>
        <h3 style="font-family: var(--font-serif); font-size: 26px; color: var(--navy); margin: 0 0 8px;">No Unlocked Designs Yet</h3>
        <p style="color: var(--ink-soft); font-size: 14px; max-width: 440px; margin: 0 auto 20px; line-height: 1.6;">
          Your purchased machine stitch files (.DST, .PES, .EXP, .JEF) will appear here for lifetime instant download once unlocked via PhonePe, UPI, or Cards.
        </p>
        <a href="#/catalog" class="button button-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
          <span>Explore Design Library</span>
          ${icon("arrow-right", 16)}
        </a>
      </div>
    `;
  }

  return `
    <div class="downloads-tab-content">
      
      <!-- Info banner -->
      <div style="background: rgba(200, 161, 90, 0.08); border: 1px solid rgba(200, 161, 90, 0.3); border-radius: 10px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 24px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="color: var(--gold);">${icon("shield-check", 24)}</span>
          <div>
            <strong style="font-size: 14px; color: var(--navy); display: block;">Instant Commercial Machine File Access</strong>
            <span style="font-size: 12.5px; color: var(--ink-soft);">${unlockedList.length} design file(s) unlocked with commercial production rights.</span>
          </div>
        </div>
        <a href="https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hello Godavari Designers, I need help downloading my purchased machine embroidery files.')}" target="_blank" rel="noopener noreferrer" class="button button-secondary" style="font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 99px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
          ${icon("message-circle", 14)}
          <span>File Support</span>
        </a>
      </div>

      <!-- Downloads List Grid -->
      <div style="display: grid; gap: 16px;">
        ${unlockedList.map(item => {
          const pId = item.productId || item.id;
          const product = (site.products || []).find(p => p.id === pId) || {};
          const code = product.code || item.code || "GD-DESIGN";
          const title = product.title || item.title || "Commercial Embroidery Pattern";
          const format = item.format || "DST";
          const image = product.image || item.image || "media-collection-floral";
          const stitches = product.totalStitchCount || item.stitchCount || 30000;
          const dimensions = product.dimensions || item.dimensions || "200x200mm";

          return `
            <div class="download-item-card" style="background: #fff; border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; box-shadow: var(--shadow);">
              
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 58px; height: 58px; border-radius: 8px; overflow: hidden; background: var(--surface); border: 1px solid var(--border); flex-shrink: 0;">
                  <img src="${attr(mediaUrl(image))}" alt="${attr(title)}" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                    <span style="font-size: 9.5px; font-weight: 700; color: var(--gold); background: rgba(200, 161, 90, 0.12); padding: 1px 6px; border-radius: 4px;">${escapeHtml(code)}</span>
                    <span style="font-size: 11px; font-weight: 600; color: var(--navy); border: 1px solid var(--border); padding: 1px 6px; border-radius: 4px;">.${escapeHtml(format)}</span>
                    <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #389e0d; background: #f6ffed; border: 1px solid #b7eb8f; padding: 1px 6px; border-radius: 4px;">Ready to Stitch</span>
                  </div>
                  <strong style="font-family: var(--font-serif); font-size: 17px; color: var(--navy); display: block;">${escapeHtml(title)}</strong>
                  <span style="font-size: 12px; color: var(--ink-soft);">${stitches.toLocaleString()} stitches &bull; ${escapeHtml(dimensions)} &bull; Ref: ${escapeHtml(item.orderRef || "PAID")}</span>
                </div>
              </div>

              <!-- Download actions -->
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <button type="button" class="button button-primary" data-action="download-machine-file" data-id="${attr(pId)}" data-format="${attr(format)}" style="min-height: 40px; font-size: 12.5px; font-weight: 700; padding: 0 18px; border: none; cursor: pointer; border-radius: 6px; display: inline-flex; align-items: center; gap: 8px; background: #237804; color: #fff;">
                  ${icon("download", 15)}
                  <span>Download .${escapeHtml(format)}</span>
                </button>
                <button type="button" class="button button-secondary" data-action="download-machine-file" data-id="${attr(pId)}" data-format="PES" style="min-height: 40px; font-size: 12px; font-weight: 700; padding: 0 14px; border-radius: 6px; cursor: pointer;">
                  <span>.PES</span>
                </button>
                <button type="button" class="button button-secondary" data-action="download-machine-file" data-id="${attr(pId)}" data-format="JEF" style="min-height: 40px; font-size: 12px; font-weight: 700; padding: 0 14px; border-radius: 6px; cursor: pointer;">
                  <span>.JEF</span>
                </button>
                <a href="#/product/${product.slug || ''}" class="button button-secondary" style="min-height: 40px; font-size: 12px; font-weight: 700; padding: 0 14px; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center;">
                  <span>Details</span>
                </a>
              </div>

            </div>
          `;
        }).join("")}
      </div>

    </div>
  `;
}

// Bind clicks on dual tab buttons in Wishlist page
document.addEventListener("click", (e) => {
  const tabBtn = e.target.closest("[data-action='set-saved-tab']");
  if (tabBtn) {
    activeWishlistTab = tabBtn.dataset.tab;
    triggerRender();
  }
});
