import { site, cart, updateCartQty, removeFromCart, updateCartItemFormat, cartQuoteSubmitting, lastCartQuoteResult, clearCartQuoteResult, currentUser } from "../services/store.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

function getProduct(id) {
  return site.products.find((product) => product.id === id);
}

export function renderCart() {
  if (lastCartQuoteResult) {
    return `
      <section class="content-section success-section" style="padding: 120px 24px; text-align: center; background: var(--ivory); min-height: 80vh; display: flex; align-items: center; justify-content: center;">
        <div class="success-card" style="max-width: 500px; width: 100%; border: 1px solid var(--border); padding: 40px; border-radius: 8px; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.02); display: grid; gap: 24px; justify-items: center;">
          <div class="success-check-icon" style="width: 64px; height: 64px; border-radius: 50%; background: #f6ffed; border: 1px solid #b7eb8f; display: flex; align-items: center; justify-content: center; color: #52c41a;">
            ${icon("check", 28)}
          </div>
          
          <div>
            <h1 style="font-family: var(--font-serif); font-size: 28px; color: var(--navy); font-weight: 700; margin: 0 0 12px;">Inquiry Submitted Successfully</h1>
            <p style="color: var(--ink-soft); font-size: 14px; line-height: 1.6; margin: 0;">
              Thank you for your inquiry! Your request has been logged. Our design team will review your requested items and get back to you with format confirmations, estimated stitches, and pricing details via email.
            </p>
          </div>

          <div class="tracking-info-card" style="width: 100%; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 16px 0; display: grid; gap: 10px; text-align: left; font-size: 13px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--ink-soft);">Reference Number:</span>
              <strong style="color: var(--navy); font-family: monospace; font-size: 14px;">${escapeHtml(lastCartQuoteResult.referenceNumber)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--ink-soft);">Contact Email:</span>
              <strong style="color: var(--navy);">${escapeHtml(lastCartQuoteResult.email)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--ink-soft);">Items Count:</span>
              <strong style="color: var(--navy);">${(lastCartQuoteResult.cartItems || []).length} Designs</strong>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; width: 100%; gap: 12px; margin-top: 8px;">
            ${lastCartQuoteResult.whatsappUrl ? `
              <a href="${lastCartQuoteResult.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="button" style="background: #25d366; color: #fff; text-decoration: none; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; font-weight: 700; border-radius: 4px;">
                ${icon("message-square", 16)}
                <span>Send details via WhatsApp</span>
              </a>
            ` : ''}

            ${!lastCartQuoteResult.isLocalFallback ? `
              <a href="#/track-order?ref=${encodeURIComponent(lastCartQuoteResult.referenceNumber)}" class="button button-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; text-decoration: none; min-height: 44px;">
                <span>Track Inquiry Status</span>
                ${icon("arrow-right", 16)}
              </a>
            ` : `
              <div style="font-size: 12px; color: #d93838; background: #fff2f0; border: 1px solid #ffccc7; padding: 10px 12px; border-radius: 4px; line-height: 1.5; margin-bottom: 4px; text-align: left;">
                ⚠️ Note: Could not save to database (login required / offline). Please click the green button above to send your inquiry details directly on WhatsApp to complete your request.
              </div>
            `}

            <button type="button" data-action="clear-quote-success" class="button button-secondary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 600; min-height: 44px; background: none; border: 1px solid var(--border); cursor: pointer;">
              <span>Return to Design Library</span>
            </button>
          </div>
        </div>
      </section>
    `;
  }

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
  let totalQty = 0;
  const formatsSelected = new Set();
  
  const lineItemsHtml = cart.map((item) => {
    const product = getProduct(item.id);
    if (!product) return "";

    const formatObj = product.formats ? product.formats.find(f => f.format === item.format) : null;
    const price = formatObj ? formatObj.price : product.price;
    const itemTotal = price * item.qty;
    subtotal += itemTotal;
    totalQty += item.qty;
    if (item.format) {
      formatsSelected.add(item.format);
    }

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

  const processingFee = 0; // Flat standard processing fee
  const grandTotal = subtotal + processingFee;
  const formatsList = Array.from(formatsSelected).join(", ") || "None";

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

          <!-- Right: Summary & Action Panels -->
          <div style="display: grid; gap: 20px; align-content: start;">
            
            <!-- Card 1: Purchase Flow -->
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

            <!-- Card 2: Send Query / Quote Flow -->
            <div class="summary-card" style="border: 1px solid var(--border); padding: 24px; border-radius: 6px; background: #fff; display: grid; gap: 16px;">
              <h2 style="font-family: var(--font-serif); font-size: 20px; color: var(--navy); font-weight: 700; margin: 0; padding-bottom: 12px; border-bottom: 1px solid var(--border);">Request Quote / Query</h2>
              <p style="font-size: 13px; color: var(--ink-soft); margin: 0; line-height: 1.5;">
                Interested in bulk orders, specific size adjustments, customization, or discussing payment alternatives? Send an inquiry directly to our masters.
              </p>
              
              <!-- Quote Summary details -->
              <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 12px; font-size: 12px; display: grid; gap: 6px;">
                <div style="display: flex; justify-content: space-between; color: var(--navy); font-weight: 600;">
                  <span>Quote Requested For:</span>
                  <span>${totalQty} Design(s)</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--ink-soft);">
                  <span>Selected Format(s):</span>
                  <span>${formatsList}</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--ink-soft);">
                  <span>Subtotal Estimate:</span>
                  <span>${money(subtotal)}</span>
                </div>
              </div>

              <form id="cartQuoteForm" style="display: grid; gap: 12px;">
                <div style="display: grid; gap: 4px;">
                  <label for="quote-name" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; color: var(--navy);">Full Name *</label>
                  <input type="text" id="quote-name" name="name" required value="${escapeHtml(currentUser?.name || '')}" placeholder="e.g. Satish Kumar" style="padding: 10px 12px; border: 1px solid var(--border); border-radius: 4px; font-size: 13px; background: var(--surface); color: var(--navy); width: 100%; box-sizing: border-box;" />
                </div>

                <div style="display: grid; gap: 4px;">
                  <label for="quote-email" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; color: var(--navy);">Email Address *</label>
                  <input type="email" id="quote-email" name="email" required value="${escapeHtml(currentUser?.email || '')}" placeholder="e.g. satish@example.com" style="padding: 10px 12px; border: 1px solid var(--border); border-radius: 4px; font-size: 13px; background: var(--surface); color: var(--navy); width: 100%; box-sizing: border-box;" />
                </div>

                <div style="display: grid; gap: 4px;">
                  <label for="quote-phone" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; color: var(--navy);">Phone Number *</label>
                  <input type="tel" id="quote-phone" name="phone" required value="${escapeHtml(currentUser?.phone || '')}" placeholder="e.g. +91 83098 97055" style="padding: 10px 12px; border: 1px solid var(--border); border-radius: 4px; font-size: 13px; background: var(--surface); color: var(--navy); width: 100%; box-sizing: border-box;" />
                </div>

                <div style="display: grid; gap: 4px;">
                  <label for="quote-notes" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; color: var(--navy);">Inquiry Notes / Requirements</label>
                  <textarea id="quote-notes" name="notes" placeholder="e.g. need border width adjusted, format conversion requests..." rows="3" style="padding: 10px 12px; border: 1px solid var(--border); border-radius: 4px; font-size: 13px; background: var(--surface); color: var(--navy); width: 100%; box-sizing: border-box; resize: vertical; min-height: 60px; font-family: inherit;"></textarea>
                </div>

                <button type="submit" ${cartQuoteSubmitting ? 'disabled' : ''} class="button button-secondary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; min-height: 44px; margin-top: 6px; cursor: pointer; border: 1px solid var(--border); background: none;">
                  ${cartQuoteSubmitting ? `<div class="luxury-spinner" style="width: 16px; height: 16px; border: 2px solid var(--navy); border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>` : ''}
                  <span>${cartQuoteSubmitting ? 'Submitting Inquiry...' : 'Send Inquiry / Request Quote'}</span>
                  ${!cartQuoteSubmitting ? icon("mail", 16) : ''}
                </button>
              </form>
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
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </section>
  `;
}
