import { site, cart, updateCartQty, removeFromCart, updateCartItemFormat } from "../services/store.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

function getProduct(id) {
  return site.products.find((product) => product.id === id);
}

export function renderCart() {
  if (!cart || cart.length === 0) {
    return `
      <section class="content-section cart-empty-section" style="padding: 120px 24px; text-align: center; background: var(--ivory); min-height: 70vh; display: flex; align-items: center; justify-content: center;">
        <div style="max-width: 440px; margin: 0 auto; display: grid; gap: 16px; justify-items: center;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: #fff; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--navy); margin-bottom: 8px;">
            ${icon("shopping-bag", 32)}
          </div>
          <h1 style="font-family: var(--font-serif); font-size: 32px; color: var(--navy); font-weight: 700; margin: 0;">Your Cart is Empty</h1>
          <p style="color: var(--ink-soft); font-size: 14px; line-height: 1.6; margin: 0;">
            Explore our curated luxury library of machine-ready embroidery designs and select placements for your collection.
          </p>
          <a href="#/catalog" class="button button-primary" style="margin-top: 12px; display: inline-flex; align-items: center; gap: 8px; font-weight: 700;">
            <span>Browse Design Library</span>
            ${icon("arrow-right", 18)}
          </a>
        </div>
      </section>
    `;
  }

  // Calculate prices
  let subtotal = 0;
  const lineItemsHtml = cart.map((item) => {
    const product = getProduct(item.id);
    if (!product) return "";

    const formatObj = product.formats ? product.formats.find(f => f.format === item.format) : null;
    const price = formatObj ? formatObj.price : product.price;
    const itemTotal = price * item.qty;
    subtotal += itemTotal;

    const hoopSize = formatObj ? formatObj.hoopSize : (product.dimensions || "N/A");
    const stitches = formatObj && formatObj.stitchLimit ? formatObj.stitchLimit : product.totalStitchCount;

    return `
      <article class="cart-page-item" style="display: flex; gap: 20px; border: 1px solid var(--border); padding: 20px; border-radius: 6px; background: #fff; position: relative;">
        <!-- Left: Image -->
        <div class="cart-item-img-wrapper" style="width: 120px; height: 120px; border-radius: 4px; border: 1px solid var(--border); overflow: hidden; background: var(--surface); flex-shrink: 0;">
          <img src="${attr(mediaUrl(product.image))}" alt="${attr(product.title)}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>

        <!-- Middle: Info & Specs -->
        <div style="flex: 1; display: grid; gap: 8px;">
          <div>
            <h3 style="font-family: var(--font-serif); font-size: 18px; color: var(--navy); font-weight: 700; margin: 0;">${escapeHtml(product.title)}</h3>
            <span style="font-size: 11px; text-transform: uppercase; color: var(--ink-soft); font-weight: 600; letter-spacing: 0.5px; margin-top: 2px; display: inline-block;">Code: ${escapeHtml(product.code)}</span>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 12px; color: var(--ink-soft);">
            <span>🧵 Stitches: <strong>${stitches.toLocaleString()}</strong></span>
            <span>📐 Hoop: <strong>${escapeHtml(hoopSize)}</strong></span>
          </div>

          <!-- Format Dropdown -->
          <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; margin-top: 4px;">
            <span style="color: var(--navy); font-weight: 600;">Format:</span>
            <select data-action="change-item-format" data-id="${attr(product.id)}" data-format="${attr(item.format)}" style="padding: 4px 10px; border: 1px solid var(--border); border-radius: 4px; background: #fff; cursor: pointer; font-size: 12px; font-weight: 600;">
              ${(product.formats || []).map(f => `
                <option value="${attr(f.format)}" ${item.format === f.format ? "selected" : ""}>
                  ${escapeHtml(f.format)} (${escapeHtml(f.machineBrand)})
                </option>
              `).join("")}
            </select>
          </div>
        </div>

        <!-- Right: Quantity Controls & Price -->
        <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; width: 140px; flex-shrink: 0;">
          <strong style="font-size: 18px; color: var(--navy); font-family: var(--font-serif); font-weight: 700;">${money(itemTotal)}</strong>
          
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="qty-row" style="border: 1px solid var(--border); border-radius: 4px; display: flex; align-items: center; overflow: hidden; background: #fff; height: 32px;">
              <button type="button" data-action="cart-minus" data-id="${attr(product.id)}" data-format="${attr(item.format)}" style="width: 32px; height: 100%; border: none; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--navy); border-right: 1px solid var(--border);">${icon("minus", 12)}</button>
              <span style="min-width: 32px; text-align: center; font-size: 13px; font-weight: 600; color: var(--navy);">${item.qty}</span>
              <button type="button" data-action="cart-plus" data-id="${attr(product.id)}" data-format="${attr(item.format)}" style="width: 32px; height: 100%; border: none; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--navy); border-left: 1px solid var(--border);">${icon("plus", 12)}</button>
            </div>

            <button type="button" data-action="remove-cart" data-id="${attr(product.id)}" data-format="${attr(item.format)}" aria-label="Remove item" style="border: 1px solid var(--border); background: none; border-radius: 4px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink-soft); transition: all 0.2s;">
              ${icon("trash-2", 14)}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  const processingFee = 0; // Flat standard processing fee (free standard)
  const grandTotal = subtotal + processingFee;

  return `
    <section class="content-section cart-page-section" style="padding-top: var(--header-height); background: var(--ivory); min-height: 90vh;">
      <div style="width: min(100%, 1280px); margin: 0 auto; padding: 32px 24px 80px;">
        
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="font-family: var(--font-serif); font-size: clamp(36px, 4.5vw, 54px); color: var(--navy); font-weight: 700; margin: 0 0 8px;">Your Cart</h1>
            <p style="color: var(--ink-soft); font-size: 15px; margin: 0;">Review selected design files and proceed to digital sampling checkout.</p>
          </div>
          <a href="#/catalog" class="text-action" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; padding-bottom: 6px;">
            ${icon("arrow-left", 16)}
            <span>Continue Shopping</span>
          </a>
        </div>

        <div class="cart-layout" style="display: grid; grid-template-columns: 1fr 380px; gap: 32px;">
          <!-- Left: Line items -->
          <div style="display: grid; gap: 16px; align-content: start;">
            ${lineItemsHtml}
          </div>

          <!-- Right: Summary Card -->
          <div style="display: grid; gap: 20px; align-content: start;">
            <div class="summary-card" style="border: 1px solid var(--border); padding: 24px; border-radius: 6px; background: #fff; display: grid; gap: 20px;">
              <h2 style="font-family: var(--font-serif); font-size: 22px; color: var(--navy); font-weight: 700; margin: 0; padding-bottom: 12px; border-bottom: 1px solid var(--border);">Order Summary</h2>
              
              <div style="display: grid; gap: 12px; font-size: 14px;">
                <div style="display: flex; justify-content: space-between; color: var(--ink-soft);">
                  <span>Design Subtotal</span>
                  <strong>${money(subtotal)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--ink-soft);">
                  <span>Processing Fee</span>
                  <strong>${processingFee === 0 ? "Free" : money(processingFee)}</strong>
                </div>
                <hr style="border: 0; border-top: 1px solid var(--border); margin: 4px 0;" />
                <div style="display: flex; justify-content: space-between; font-size: 18px; color: var(--navy); font-weight: 700;">
                  <span>Total</span>
                  <strong>${money(grandTotal)}</strong>
                </div>
              </div>

              <a href="#/checkout" class="button button-primary" style="text-decoration: none; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; min-height: 48px;">
                <span>Proceed to Checkout</span>
                ${icon("arrow-right", 18)}
              </a>
            </div>

            <!-- Custom Digitizing CTA -->
            <div style="border: 1px dashed var(--border); padding: 20px; border-radius: 6px; background: rgba(200, 161, 90, 0.04); display: grid; gap: 10px; text-align: center;">
              <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--gold); letter-spacing: 0.5px;">Need a Custom Design?</span>
              <p style="font-size: 13px; color: var(--ink-soft); margin: 0; line-height: 1.5;">Get logos, sketches, blouses or saree borders digitized by our master team in 24–48 hours.</p>
              <a href="#/custom-order" class="button button-secondary" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; padding: 8px 16px; margin-top: 4px;">
                <span>Request Custom Digitizing</span>
                ${icon("sparkles", 14)}
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  `;
}
