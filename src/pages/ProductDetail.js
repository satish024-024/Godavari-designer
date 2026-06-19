import { site, wishlist, ui, addToCart, toggleWishlist, currentUser, showToast, triggerRender } from "../services/store.js";
import { customRequestService } from "../services/supabase.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

// Local State
let lastProductId = null;
let activeFormatCode = "";
let activeImageSrc = "";
let activeGalleryMode = "zoom"; // 'zoom' | 'pan'
let isCustomModalOpen = false;
let isLightboxOpen = false;
let currentProduct = null;

// Fallback Default Use Cases mapping
function getDefaultUseCases(product) {
  const categoryLower = (product.category || "").toLowerCase();
  const titleLower = (product.title || "").toLowerCase();
  
  if (categoryLower.includes("bridal") || titleLower.includes("bridal") || titleLower.includes("peony") || titleLower.includes("royal")) {
    return ["Bridal Blouses", "Designer Wear", "Boutique Orders"];
  } else if (categoryLower.includes("saree") || titleLower.includes("border") || titleLower.includes("vine")) {
    return ["Saree Borders", "Boutique Orders", "Bulk Production"];
  } else if (categoryLower.includes("blouse") || titleLower.includes("blouse")) {
    return ["Bridal Blouses", "Designer Wear", "Boutique Orders"];
  } else if (categoryLower.includes("kids")) {
    return ["Designer Wear", "Boutique Orders"];
  }
  return ["Designer Wear", "Boutique Orders", "Bulk Production"];
}

function formatEmbroideryDuration(totalMinutes) {
  const safeMinutes = Number(totalMinutes || 0);
  if (!safeMinutes) return "N/A";

  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (!hours) return `${minutes} M`;
  if (!minutes) return `${hours} H`;
  return `${hours} H ${minutes} M`;
}

function getDimensionUnit(product) {
  const dimensionsText = String(product.dimensions || "").toLowerCase();
  if (dimensionsText.includes("inch")) return "inch";
  if (dimensionsText.includes("in")) return "inch";
  return "mm";
}

function formatDimensionValue(product, value) {
  if (value === undefined || value === null || value === "") return "N/A";
  return `${value} ${getDimensionUnit(product)}`;
}

function getRpmProgress(rpm) {
  const safeRpm = Number(rpm || 0);
  const min = 0;
  const max = 1200;
  const clamped = Math.max(min, Math.min(max, safeRpm));
  return (clamped / max) * 100;
}

export function renderProductDetail() {
  const slug = ui.pageParams.slug;
  const product = site.products.find((p) => p.slug === slug);
  
  if (!product) {
    return `
      <section class="content-section not-found-section" style="padding: 100px 24px; text-align: center;">
        <h2 style="font-family: var(--font-serif); font-size: 32px; color: var(--navy); margin-bottom: 16px;">Product Not Found</h2>
        <p style="color: var(--ink-soft); margin-bottom: 24px;">The embroidery design you are looking for does not exist or has been relocated.</p>
        <a href="#/catalog" class="button button-primary">Back to Catalog</a>
      </section>
    `;
  }

  // Auto-initialize local state when product changes
  if (lastProductId !== product.id) {
    lastProductId = product.id;
    activeFormatCode = product.formats && product.formats.length > 0 ? product.formats[0].format : "DST";
    activeImageSrc = product.image;
    activeGalleryMode = "zoom";
    isCustomModalOpen = false;
    isLightboxOpen = false;
  }

  currentProduct = product;

  const isSaved = wishlist.has(product.id);
  const selectedFormat = product.formats.find(f => f.format === activeFormatCode) || product.formats[0];
  const displayPrice = selectedFormat ? selectedFormat.price : product.price;

  // Formats listing helper
  const uniqueFormatsList = product.machineFormats.join(", ");
  const fabricsList = product.recommendedFabrics.join(", ");

  // Custom Use Cases fallback
  const useCases = product.recommendedUseCases || product.recommended_use_cases || getDefaultUseCases(product);
  const formattedDuration = formatEmbroideryDuration(product.estimatedEmbroideryTime);
  const productTags = Array.isArray(product.tags) ? product.tags.filter(Boolean) : [];
  const productName = product.title || product.code || "Untitled Product";
  const selectedFormatLabel = selectedFormat?.label || selectedFormat?.format || activeFormatCode || "N/A";
  const rpmProgress = getRpmProgress(product.rpm);

  // WhatsApp prefills
  const whatsappNumber = (site.brand.contact.phone || "+91 98765 43210").replace(/[^0-9+]/g, '');
  const whatsappMsg = encodeURIComponent(
    `Inquiry Details:\n` +
    `- Design Name: ${product.title}\n` +
    `- Product Code: ${product.code}\n` +
    `- Selected Machine Format: ${activeFormatCode}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

  // Scored Related Products algorithm
  const currentCategory = product.categoryId;
  const currentCollection = product.collectionId;
  const currentTags = product.tags || [];

  const scoredProducts = site.products
    .filter(p => p.id !== product.id)
    .map(p => {
      let score = 0;
      if (p.categoryId === currentCategory) score += 3;
      if (p.collectionId && p.collectionId === currentCollection) score += 2;
      if (p.tags && Array.isArray(p.tags)) {
        const shared = p.tags.filter(t => currentTags.includes(t));
        score += shared.length;
      }
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score);

  const relatedProducts = scoredProducts.slice(0, 6).map(item => item.product);

  return `
    <section class="content-section product-detail-section" style="padding-top: var(--header-height); background: var(--ivory);">
      <div style="width: min(100%, 1280px); margin: 0 auto; padding: 0 24px 80px;">
        
        <!-- Breadcrumbs -->
        <div class="breadcrumbs" style="padding: 24px 0 16px; font-size: 13px; color: var(--ink-soft); font-weight: 500;">
          <a href="#/" style="color: inherit; text-decoration: none;">Home</a>
          <span style="margin: 0 8px; color: var(--border);">&gt;</span>
          <a href="#/catalog" style="color: inherit; text-decoration: none;">Design Library</a>
          <span style="margin: 0 8px; color: var(--border);">&gt;</span>
          <a href="#/catalog?category=${attr(product.category)}" style="color: inherit; text-decoration: none;">${escapeHtml(product.category)}</a>
          <span style="margin: 0 8px; color: var(--border);">&gt;</span>
          <span style="color: var(--gold); font-weight: 600;">${escapeHtml(product.title)}</span>
        </div>

        <!-- Product Detail Columns Layout -->
        <div class="product-detail-layout">
          
          <!-- Left Column: Gallery Container -->
          <div class="product-gallery-column">
            <div class="detail-gallery-container">
              <!-- Thumbnails -->
              <div class="detail-gallery-thumbs">
                ${(product.gallery && product.gallery.length > 0 ? product.gallery : [product.image])
                  .map(
                    (thumbId) => `
                      <button type="button" class="detail-thumb-btn ${activeImageSrc === thumbId ? "active" : ""}" data-action="select-thumb" data-src="${attr(thumbId)}">
                        <img src="${attr(mediaUrl(thumbId))}" alt="Thumbnail" />
                      </button>
                    `
                  )
                  .join("")}
              </div>

              <!-- Main Image Box -->
              <div id="detailMainImgContainer" class="detail-main-image-wrapper mode-${activeGalleryMode}" data-action="open-lightbox">
                <img id="detailMainImg" src="${attr(mediaUrl(activeImageSrc))}" alt="${attr(product.title)}" />
              </div>
            </div>

            <!-- Gallery Interactive Controls Bar -->
            <div class="gallery-controls-bar">
              <button type="button" class="gallery-control-btn ${activeGalleryMode === "zoom" ? "active" : ""}" data-action="set-gallery-mode" data-mode="zoom">
                ${icon("search", 14)} Zoom (Hover)
              </button>
              <button type="button" class="gallery-control-btn ${activeGalleryMode === "pan" ? "active" : ""}" data-action="set-gallery-mode" data-mode="pan">
                ${icon("hand", 14)} Pan (Drag)
              </button>
              <button type="button" class="gallery-control-btn" data-action="open-lightbox">
                ${icon("maximize-2", 14)} Full Screen
              </button>
            </div>
            
            <!-- Future-Proof Download Center Preview -->
            <div class="download-section" style="border: 1px solid var(--border); border-radius: 8px; padding: 20px; background: #fff; margin-top: 24px;">
              <h3 style="font-family: var(--font-serif); font-size: 18px; margin-bottom: 8px; color: var(--navy);">Design Download Center</h3>
              <p style="font-size: 13px; color: var(--ink-soft); margin-bottom: 16px;">Attach preview vectors, fabric mockups, and digitizing specifications sheets.</p>
              <div style="display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));">
                ${product.designFile ? `
                  <a href="${attr(mediaUrl(product.designFile))}" class="button button-secondary" download style="display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 13px; padding: 10px;">
                    ${icon("download", 14)} Production File
                  </a>
                ` : `
                  <button type="button" class="button button-secondary" disabled style="display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 13px; opacity: 0.6; cursor: not-allowed; padding: 10px;">
                    ${icon("lock", 14)} Production File
                  </button>
                `}
                <button type="button" class="button button-secondary" style="display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 13px; padding: 10px;" onclick="alert('Spec Sheet PDF will download here.')">
                  ${icon("file-text", 14)} Spec Sheet (PDF)
                </button>
                <button type="button" class="button button-secondary" style="display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 13px; padding: 10px;" onclick="alert('Fabric mockup placement will render here.')">
                  ${icon("image", 14)} Fabric Mockup
                </button>
              </div>
            </div>

            <div style="border: 1px solid var(--border); border-radius: 16px; padding: 28px; background: #fff; margin-top: 24px; box-shadow: 0 14px 40px rgba(17, 29, 66, 0.08);">
              <h3 style="font-family: var(--font-serif); font-size: 20px; color: var(--navy); margin: 0 0 18px;">
                ${icon("scroll-text", 18)} Stitch Details (Back + Hands)
              </h3>
              
              <!-- Back and Hands Stitch Counts Breakdown -->
              <div style="display: flex; justify-content: space-between; font-size: 14px; color: var(--ink-soft); margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px dashed var(--border);">
                <span>Back Stitches: <strong style="color: var(--navy);">${(product.backStitchCount || 0).toLocaleString()}</strong></span>
                <span>Hands Stitches: <strong style="color: var(--navy);">${(product.handStitchCount || 0).toLocaleString()}</strong></span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 15px; color: var(--ink-soft); font-weight: 500;">Embroidery Speed</span>
                <span style="font-size: 18px; color: var(--navy); font-weight: 700;" id="rpmValueDisplay">${product.rpm || 850} RPM</span>
              </div>
              
              <!-- Interactive Range Input -->
              <input 
                type="range" 
                id="rpmSlider" 
                min="300" 
                max="1200" 
                step="50" 
                value="${product.rpm || 850}" 
                style="width: 100%; cursor: pointer;"
              />
              
              <div id="estTimeDisplay" style="background: #eef7fe; border-radius: 12px; padding: 18px; text-align: center; color: #1677d2; font-size: 20px; font-weight: 700; transition: all 0.2s ease;">
                Estimated Time: ${formattedDuration}
              </div>
            </div>
          </div>

          <!-- Right Column: Sidebar Info -->
          <div class="product-detail-info">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom: 20px;">
              <div>
                <span class="product-detail-label">${escapeHtml(product.bestSeller ? "Bestseller" : "Product Details")}</span>
                <h1 class="product-detail-title" style="margin-bottom: 8px;">${escapeHtml(productName)}</h1>
                <div class="product-detail-meta">
                  <span>Code: <strong>${escapeHtml(product.code || "N/A")}</strong></span>
                  <span>Category: <strong>${escapeHtml(product.category || "N/A")}</strong></span>
                  ${product.collection ? `<span>Collection: <strong>${escapeHtml(product.collection.toUpperCase())}</strong></span>` : ""}
                </div>
              </div>
              <button
                type="button"
                class="button button-secondary"
                data-action="share-product"
                style="min-height: 40px; padding: 0 14px; white-space: nowrap;"
              >
                ${icon("share-2", 16)} Share
              </button>
            </div>

            <div style="border:1px solid var(--border); border-radius: 12px; background:#fff; padding: 24px; margin-bottom: 20px;">
              <div style="display:grid; gap:20px;">
                <div style="display:grid; grid-template-columns: minmax(120px, 180px) 1fr; gap: 14px;">
                  <span style="font-weight:700; color:var(--navy);">Product Name</span>
                  <strong style="color:var(--navy);">${escapeHtml(productName)}</strong>
                </div>
                <div style="display:grid; grid-template-columns: minmax(120px, 180px) 1fr; gap: 14px;">
                  <span style="font-weight:700; color:var(--navy);">Dimensions</span>
                  <div style="display:grid; gap:4px; color:var(--navy);">
                    <strong>Height: ${escapeHtml(formatDimensionValue(product, product.height))}</strong>
                    <strong>Width: ${escapeHtml(formatDimensionValue(product, product.width))}</strong>
                  </div>
                </div>
                <div style="display:grid; grid-template-columns: minmax(120px, 180px) 1fr; gap: 14px;">
                  <span style="font-weight:700; color:var(--navy);">Stitch Details</span>
                  <div style="display:grid; gap:4px; color:var(--navy);">
                    <strong>Back: ${product.backStitchCount.toLocaleString()}</strong>
                    <strong>Hand: ${product.handStitchCount.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div style="border:1px solid var(--border); border-radius: 12px; background:#fff; padding: 24px; margin-bottom: 20px;">
              <h3 style="font-family: var(--font-serif); font-size: 22px; color: var(--navy); margin: 0 0 16px;">Stitch Details (Back + Hands)</h3>
              <div style="display:grid; gap:12px; color:var(--navy);">
                <div style="display:flex; justify-content:space-between; gap:12px;">
                  <span style="font-weight:600;">Embroidery Speed</span>
                  <strong>${product.rpm} RPM</strong>
                </div>
                <div style="display:flex; justify-content:space-between; gap:12px;">
                  <span style="font-weight:600;">Estimated Time</span>
                  <strong>${formattedDuration}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; gap:12px;">
                  <span style="font-weight:600;">Total Stitch Count</span>
                  <strong>${product.totalStitchCount.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div class="product-detail-price" style="margin-bottom: 12px;">
              ${money(displayPrice)}
            </div>

            ${
              productTags.length > 0
                ? `
                  <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom: 20px;">
                    ${productTags
                      .map(
                        (tag) => `
                          <span style="display:inline-flex; align-items:center; padding:6px 10px; border-radius:999px; border:1px solid var(--border); background:#fff; color:var(--navy); font-size:12px; font-weight:600;">
                            ${escapeHtml(tag)}
                          </span>
                        `
                      )
                      .join("")}
                  </div>
                `
                : ""
            }

            <div style="border:1px solid var(--border); border-radius: 12px; background:#fff; padding: 24px; margin-bottom: 20px;">
              <div style="display:grid; gap:10px;">
                <div style="display:flex; justify-content:space-between; gap:12px;">
                  <span style="font-weight:600; color:var(--navy);">Thread Colors</span>
                  <strong style="color:var(--navy);">${product.threadColors}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; gap:12px;">
                  <span style="font-weight:600; color:var(--navy);">Difficulty</span>
                  <strong style="color:var(--navy);">${escapeHtml(product.difficultyLevel)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; gap:12px;">
                  <span style="font-weight:600; color:var(--navy);">Available Formats</span>
                  <strong style="color:var(--navy);">${escapeHtml(uniqueFormatsList || "N/A")}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; gap:12px;">
                  <span style="font-weight:600; color:var(--navy);">Compatible Machines</span>
                  <strong style="color:var(--navy);">${escapeHtml(
                    product.formats && product.formats.length > 0
                      ? [...new Set(product.formats.map(f => f.machineBrand).filter(Boolean))].join(", ")
                      : "N/A"
                  )}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; gap:12px;">
                  <span style="font-weight:600; color:var(--navy);">Recommended Fabrics</span>
                  <strong style="color:var(--navy); text-align:right;">${escapeHtml(fabricsList || "N/A")}</strong>
                </div>
              </div>
            </div>

            <div class="format-section-title">Select Machine Format</div>
            <div style="font-size: 13px; color: var(--ink-soft); margin-bottom: 12px;">
              Selected: <strong style="color: var(--navy);">${escapeHtml(selectedFormatLabel)}</strong>
            </div>
            <div class="format-cards-grid">
              ${product.formats
                .map(
                  (f) => `
                    <div class="format-card ${activeFormatCode === f.format ? "active" : ""}" data-action="select-format" data-format="${attr(f.format)}">
                      <div class="format-card-brand">${escapeHtml(f.machineBrand)}</div>
                      <div class="format-card-badge">${escapeHtml(f.label || f.format)}</div>
                      <div class="format-card-model">${escapeHtml(f.machineModel)}</div>
                      <div class="format-card-hoop">Hoop: ${escapeHtml(f.hoopSize)}</div>
                      <div class="format-card-price">${money(f.price)}</div>
                      
                      ${f.stitchLimit ? `<div style="font-size:10px; color:var(--ink-soft); margin-top:4px;">Stitches: ${f.stitchLimit}</div>` : ""}
                      ${f.notes ? `<div style="font-size:9px; color:var(--gold); margin-top:2px;" title="${attr(f.notes)}">${escapeHtml(f.notes)}</div>` : ""}
                    </div>
                  `
                )
                .join("")}
            </div>

            <!-- Purchase Actions -->
            <div class="detail-actions-grid">
              <button type="button" class="button button-primary" data-action="add-cart" data-id="${attr(product.id)}" data-format="${attr(activeFormatCode)}" style="display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700;">
                <span>Add to Studio Cart</span>
                ${icon("shopping-bag", 18)}
              </button>

              <button type="button" class="button button-secondary heart-button ${isSaved ? "active" : ""}" data-action="toggle-wishlist" data-id="${attr(product.id)}" style="display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700;">
                <span>Save to Wishlist</span>
                ${icon("heart", 18)}
              </button>

              <!-- Prefilled WhatsApp Inquiry CTA -->
              <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="button detail-actions-full" style="display: flex; align-items: center; justify-content: center; gap: 8px; background: #25d366; color: #fff; border: none; text-decoration: none; font-weight: 700; border-radius: 4px; padding: 12px; margin-top: 6px;">
                ${icon("phone", 18)} WhatsApp Inquiry
              </a>

              <!-- Custom Version Link pointing to Custom Order Page with Query Params -->
              <a href="#/custom-order?product_id=${attr(product.id)}&product_slug=${attr(product.slug)}&product_name=${attr(encodeURIComponent(product.title))}&format=${attr(activeFormatCode)}" class="button button-secondary detail-actions-full" style="text-decoration:none; margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700;">
                <span>Request Custom Version</span>
                ${icon("sliders", 18)}
              </a>
            </div>

            <div style="border:1px solid var(--border); border-radius: 12px; background:#fff; padding: 24px; margin-top: 20px;">
              <h3 style="font-family: var(--font-serif); font-size: 22px; color: var(--navy); margin: 0 0 16px;">Product Description</h3>
              <p style="font-size: 14px; color: var(--ink-soft); line-height: 1.7; margin: 0;">
                ${escapeHtml(product.description || "No product description available.")}
              </p>
            </div>

            ${
              useCases.length > 0
                ? `
                  <div class="use-cases-card" style="margin-top: 20px;">
                    <div class="use-cases-title">Suitable Use Cases</div>
                    <div class="use-cases-list">
                      ${useCases
                        .map(
                          (uc) => `
                            <div class="use-case-item">
                              <span class="use-case-check">${icon("check-circle-2", 14)}</span>
                              <span>${escapeHtml(uc)}</span>
                            </div>
                          `
                        )
                        .join("")}
                    </div>
                  </div>
                `
                : ""
            }
          </div>
        </div>

        <hr style="border: 0; border-top: 1px solid var(--border); margin: 60px 0 40px;" />

        <!-- Embroidery Digitizing Process Section -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="font-family: var(--font-serif); font-size: 32px; color: var(--navy); margin-bottom: 8px;">Godavari Digitizing Process</h2>
          <p style="color: var(--ink-soft); font-size: 14px; max-width: 600px; margin: 0 auto;">Every embroidery file in our library undergoes rigorous design simulations and quality testing.</p>
        </div>

        <div class="timeline-container">
          <div class="timeline-step">
            <div class="timeline-dot">1</div>
            <div class="timeline-text">
              <h3 class="timeline-title">Art Digitizing</h3>
              <p class="timeline-desc">Source artwork converted to vector boundaries and stitch curves.</p>
            </div>
          </div>
          <div class="timeline-step">
            <div class="timeline-dot">2</div>
            <div class="timeline-text">
              <h3 class="timeline-title">Stitch Simulation</h3>
              <p class="timeline-desc">3D embroidery rendering to calibrate speeds and thread pull densities.</p>
            </div>
          </div>
          <div class="timeline-step">
            <div class="timeline-dot">3</div>
            <div class="timeline-text">
              <h3 class="timeline-title">Color Calibration</h3>
              <p class="timeline-desc">Pantone matching thread layers to prevent fabric warping.</p>
            </div>
          </div>
          <div class="timeline-step">
            <div class="timeline-dot">4</div>
            <div class="timeline-text">
              <h3 class="timeline-title">Output Delivery</h3>
              <p class="timeline-desc">Multi-format file assembly optimized for Tajima, Brother, and Bernina.</p>
            </div>
          </div>
        </div>

        <hr style="border: 0; border-top: 1px solid var(--border); margin: 60px 0 40px;" />

        <!-- Related Products Slider Section -->
        ${
          relatedProducts.length > 0
            ? `
              <div style="margin-top: 60px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                  <h2 style="font-family: var(--font-serif); font-size: clamp(28px, 4vw, 36px); color: var(--navy); margin:0;">You May Also Like</h2>
                  <div style="display:flex; gap: 8px;">
                    <button type="button" class="icon-button" data-action="scroll-carousel" data-target="relatedCarousel" data-direction="-1" aria-label="Scroll left">${icon("chevron-left", 16)}</button>
                    <button type="button" class="icon-button" data-action="scroll-carousel" data-target="relatedCarousel" data-direction="1" aria-label="Scroll right">${icon("chevron-right", 16)}</button>
                  </div>
                </div>
                
                <div id="relatedCarousel" class="related-products-slider">
                  ${relatedProducts
                    .map(
                      (p) => `
                        <article class="product-card reveal is-visible" style="min-width: 280px; max-width: 280px; border-radius: 8px; border: 1px solid var(--border); background:#fff; overflow:hidden; box-shadow: var(--shadow); transition: all 360ms ease;">
                          <div class="product-media" style="position:relative; aspect-ratio: 1 / 1; background: #faf8f5; overflow:hidden; display:grid; place-items:center;">
                            <a href="#/product/${p.slug}" style="display:block; width:100%; height:100%;">
                              <img src="${attr(mediaUrl(p.image))}" alt="${attr(p.title)}" loading="lazy" style="width:100%; height:100%; object-fit:cover; transition: transform 600ms ease;" />
                            </a>
                            ${p.bestSeller ? `<span class="product-label" style="position:absolute; top:12px; left:12px; z-index:2; background:var(--navy); color:#fff; font-size:10px; font-weight:700; text-transform:uppercase; padding:3px 8px; border-radius:3px;">New</span>` : ""}
                          </div>
                          
                          <div class="product-info" style="padding: 20px;">
                            <a href="#/product/${p.slug}" style="text-decoration:none; color:inherit; display:block;">
                              <h3 style="font-family: var(--font-serif); font-size: 19px; font-weight: 700; margin: 0 0 4px; color: var(--navy);">${escapeHtml(p.title)}</h3>
                            </a>
                            <p style="font-size: 11px; color: var(--ink-soft); font-weight: 500; text-transform: uppercase; margin-bottom: 12px;">
                              ${escapeHtml(p.code)}
                            </p>
                            
                            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:12px;">
                              <span style="font-size: 13px; font-weight: 700; color: var(--navy);">${money(p.price)}</span>
                              <a href="#/product/${p.slug}" style="font-size: 12px; font-weight: 700; color: var(--gold); text-decoration: none; display: flex; align-items: center; gap: 4px;">
                                View Details ${icon("arrow-right", 12)}
                              </a>
                            </div>
                          </div>
                        </article>
                      `
                    )
                    .join("")}
                </div>
              </div>
            `
            : ""
        }

      </div>
    </section>

    <!-- Custom Request Form Modal overlay -->
    ${
      isCustomModalOpen
        ? `
          <div class="overlay-panel" role="dialog" aria-modal="true" style="position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center;">
            <div class="overlay-scrim" data-action="close-custom-modal" style="position: absolute; inset: 0; background: rgba(17,29,66,0.6); backdrop-filter: blur(4px);"></div>
            <section style="position: relative; width: min(90vw, 500px); background: #fff; border-radius: 8px; padding: 32px; box-shadow: var(--shadow-deep); z-index: 2;">
              <button type="button" class="icon-button" data-action="close-custom-modal" style="position: absolute; top: 16px; right: 16px;">${icon("x", 16)}</button>
              
              <h2 style="font-family: var(--font-serif); font-size: 26px; color: var(--navy); margin-top: 0; margin-bottom: 8px;">Request Changes / Custom Version</h2>
              <p style="color: var(--ink-soft); font-size: 13px; margin-bottom: 24px;">Our designers will adjust dimensions, stitch densities, or formats for you.</p>
              
              ${
                currentUser
                  ? `
                    <form id="customVersionForm" style="display: grid; gap: 16px;">
                      <label style="display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: var(--navy);">
                        <span>Full Name</span>
                        <input type="text" name="name" value="${attr(currentUser.name)}" required style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
                      </label>
                      
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <label style="display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: var(--navy);">
                          <span>Email</span>
                          <input type="email" name="email" value="${attr(currentUser.email)}" required style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
                        </label>
                        <label style="display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: var(--navy);">
                          <span>Phone Number</span>
                          <input type="tel" name="phone" placeholder="+91" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
                        </label>
                      </div>

                      <label style="display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: var(--navy);">
                        <span>Customization Request Type</span>
                        <select name="projectType" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px; background: #fff;">
                          <option value="Resize Design">Resize Design (Width/Height)</option>
                          <option value="Additional Format">Additional Format Compatibility</option>
                          <option value="Stitch Modification">Adjust Density / Remove Fill Stitches</option>
                          <option value="Fabric Optimization">Optimize for Velvet/Leather/Chiffon</option>
                        </select>
                      </label>
                      
                      <label style="display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: var(--navy);">
                        <span>Modification Notes / Instructions</span>
                        <textarea name="notes" placeholder="Specify your exact changes (e.g. increase width to 160mm, reduce backfill speed)..." required style="width: 100%; height: 100px; padding: 10px; border: 1px solid var(--border); border-radius: 4px; resize: none;"></textarea>
                      </label>
                      
                      <button type="submit" class="button button-primary" style="width: 100%; min-height: 48px; border: none; margin-top: 10px;">
                        Submit Modification Request
                      </button>
                    </form>
                  `
                  : `
                    <div style="border: 1px dashed var(--border); padding: 24px; border-radius: 6px; text-align: center; background: var(--surface);">
                      ${icon("lock", 28, "color: var(--gold); margin-bottom: 12px;")}
                      <h4 style="font-family: var(--font-serif); font-size: 18px; margin: 0 0 8px; color: var(--navy);">Authentication Required</h4>
                      <p style="font-size: 13px; color: var(--ink-soft); line-height: 1.5; margin-bottom: 16px;">
                        Only registered studio accounts can save customization requests directly to their workspace.
                      </p>
                      <a href="#/auth" class="button button-primary" style="display: inline-flex; width: 100%; justify-content: center; margin-bottom: 8px;">Sign In to Account</a>
                      <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="button button-secondary" style="display: inline-flex; width: 100%; justify-content: center; gap: 6px;">
                        ${icon("phone", 14)} Inquiry via WhatsApp
                      </a>
                    </div>
                  `
              }
            </section>
          </div>
        `
        : ""
    }

    <!-- Lightbox Fullscreen Image Modal -->
    ${
      isLightboxOpen
        ? `
          <div class="lightbox-overlay" data-action="close-lightbox">
            <div class="lightbox-content">
              <button type="button" class="lightbox-close" data-action="close-lightbox">${icon("x", 20)}</button>
              <img src="${attr(mediaUrl(activeImageSrc))}" alt="${attr(product.title)}" />
            </div>
          </div>
        `
        : ""
    }
  `;
}

// Bind Zoom & Drag Pan Handlers
function initZoomPanEvents() {
  const container = document.getElementById("detailMainImgContainer");
  const img = document.getElementById("detailMainImg");
  if (!container || !img) return;
  
  if (activeGalleryMode === "zoom") {
    container.addEventListener("mousemove", (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      img.style.transformOrigin = `${x}% ${y}%`;
      img.style.transform = "scale(2.2)";
    });
    
    container.addEventListener("mouseleave", () => {
      img.style.transform = "scale(1)";
      img.style.transformOrigin = "center center";
    });
  } else if (activeGalleryMode === "pan") {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let translateX = 0;
    let translateY = 0;
    
    img.style.transform = "scale(1.8)";
    img.style.transformOrigin = "center center";
    img.style.position = "relative";
    
    container.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isDragging = true;
      translateX = parseInt(img.style.left) || 0;
      translateY = parseInt(img.style.top) || 0;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
    });
    
    const onMouseMove = (e) => {
      if (!isDragging) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      
      const maxTranslateX = 120;
      const maxTranslateY = 120;
      translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX));
      translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY));
      
      img.style.left = `${translateX}px`;
      img.style.top = `${translateY}px`;
    };
    
    const onMouseUp = () => {
      isDragging = false;
    };
    
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    
    // Clean up temporary listeners on next change
    container.addEventListener("mouseleave", () => {
      isDragging = false;
    });
  }
}

let eventsBound = false;
export function initProductDetailEvents() {
  initZoomPanEvents();
  
  if (eventsBound) return;
  eventsBound = true;

  document.addEventListener("input", (e) => {
    if (e.target.id === "rpmSlider") {
      const currentRpm = parseInt(e.target.value);
      
      // Update RPM Text Display
      const rpmDisplay = document.getElementById("rpmValueDisplay");
      if (rpmDisplay) {
        rpmDisplay.textContent = `${currentRpm} RPM`;
      }
      
      // Calculate and Update Estimated Time
      if (currentProduct) {
        let estimatedMinutes = 0;
        if (currentProduct.rpm && currentProduct.estimatedEmbroideryTime) {
          // Scale based on default RPM and default time
          estimatedMinutes = Math.round(currentProduct.estimatedEmbroideryTime * (currentProduct.rpm / currentRpm));
        } else {
          // Fallback simple calculation
          const stitches = currentProduct.totalStitchCount || currentProduct.stitchCount || 0;
          estimatedMinutes = Math.round(stitches / currentRpm);
        }
        
        const estTimeDisplay = document.getElementById("estTimeDisplay");
        if (estTimeDisplay) {
          estTimeDisplay.textContent = `Estimated Time: ${formatEmbroideryDuration(estimatedMinutes)}`;
        }
      }
    }
  });
  
  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    
    if (action === "select-format") {
      activeFormatCode = target.dataset.format;
      triggerRender();
    }
    
    if (action === "select-thumb") {
      activeImageSrc = target.dataset.src;
      triggerRender();
    }
    
    if (action === "set-gallery-mode") {
      activeGalleryMode = target.dataset.mode;
      const img = document.getElementById("detailMainImg");
      if (img) {
        img.style.transform = "scale(1)";
        img.style.transformOrigin = "center center";
        img.style.left = "0px";
        img.style.top = "0px";
      }
      triggerRender();
    }
    
    if (action === "open-lightbox") {
      isLightboxOpen = true;
      triggerRender();
    }
    
    if (action === "close-lightbox") {
      isLightboxOpen = false;
      triggerRender();
    }
    
    if (action === "open-custom-modal") {
      isCustomModalOpen = true;
      triggerRender();
    }
    
    if (action === "close-custom-modal") {
      isCustomModalOpen = false;
      triggerRender();
    }
  });
  
  document.addEventListener("submit", async (e) => {
    if (e.target.id === "customVersionForm") {
      e.preventDefault();
      const formData = new FormData(e.target);
      const submitBtn = e.target.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting Request...";
      }
      
      try {
        const product = site.products.find(p => p.id === lastProductId);
        const format = activeFormatCode;
        const selectedFormatObj = product.formats.find(f => f.format === format) || product.formats[0];
        const price = selectedFormatObj ? selectedFormatObj.price : product.price;
        
        const metadata = `[Product Customization Request]
Product ID: ${product.id}
Product Slug: ${product.slug}
Format: ${format}
Price: ${money(price)}

[User Instructions]
${formData.get("notes")}`;
        
        const requestPayload = {
          userId: currentUser ? currentUser.id : null,
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          projectType: formData.get("projectType") || "Custom Version",
          notes: metadata,
          artworkAttachment: ""
        };
        
        await customRequestService.createRequest(requestPayload);
        showToast("Custom request submitted successfully!");
        isCustomModalOpen = false;
        triggerRender();
      } catch (err) {
        console.error("Error creating custom request:", err);
        showToast(`Submission failed: ${err.message}`);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "Submit Request";
        }
      }
    }
  });
}
