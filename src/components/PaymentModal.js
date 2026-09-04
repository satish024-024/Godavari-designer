/**
 * Godavari Designers - Pre-Checkout Presentation Component
 * Clean, minimal pre-checkout card preceding Razorpay Standard Checkout.
 * All custom QR codes, manual UPI instructions, and manual verification buttons are eliminated.
 */

import { paymentContext, PaymentState, initiatePayment, closePreCheckout, openPreCheckout } from "../services/paymentService.js";
import { site } from "../services/store.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

export function renderPaymentModal() {
  if (!paymentContext.isPreCheckoutOpen || !paymentContext.product) {
    return "";
  }

  const p = paymentContext.product;
  const price = Number(p.price || 45);
  const isLoading = 
    paymentContext.state === PaymentState.CREATING_ORDER ||
    paymentContext.state === PaymentState.OPENING_CHECKOUT;

  let btnLabel = `Pay ${money(price)}`;
  if (paymentContext.state === PaymentState.CREATING_ORDER) {
    btnLabel = "Creating secure order...";
  } else if (paymentContext.state === PaymentState.OPENING_CHECKOUT) {
    btnLabel = "Opening secure payment...";
  }

  return `
    <div class="overlay-panel payment-modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="precheckout-title">
      <div class="overlay-scrim" data-action="close-precheckout" tabindex="-1"></div>
      
      <section class="payment-modal-card luxury-card" style="max-width: 440px; width: 92%; margin: auto; background: var(--ivory, #f8f6f2); border-radius: 14px; border: 1px solid var(--border, #e6ded1); box-shadow: 0 24px 70px rgba(17, 29, 66, 0.16); overflow: hidden; position: relative; z-index: 1000; animation: modalEnter 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
        
        <!-- Header -->
        <div style="padding: 16px 20px; background: var(--navy, #111d42); color: #fff; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--gold, #c8a15a);"></span>
            <h3 id="precheckout-title" style="font-family: var(--font-serif, serif); font-size: 19px; margin: 0; color: #fff; font-weight: 600; letter-spacing: 0.02em;">
              Unlock Embroidery Design
            </h3>
          </div>
          <button type="button" class="icon-button" data-action="close-precheckout" aria-label="Close" style="color: #fff; background: rgba(255,255,255,0.12); border: none; border-radius: 50%; width: 30px; height: 30px; display: grid; place-items: center; cursor: pointer; transition: background 0.2s;">
            ${icon("x", 16)}
          </button>
        </div>

        <!-- Body -->
        <div style="padding: 24px 22px; display: grid; gap: 20px;">
          
          <!-- Product Showcase Card -->
          <div style="display: flex; gap: 16px; background: #fff; border: 1px solid var(--border, #e6ded1); border-radius: 10px; padding: 14px; align-items: center;">
            <div style="width: 72px; height: 72px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border, #e6ded1); flex-shrink: 0; background: var(--surface, #efe8dd);">
              <img src="${attr(mediaUrl(p.image))}" alt="${attr(p.title)}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="overflow: hidden; flex: 1;">
              <div style="font-size: 10.5px; font-weight: 700; color: var(--gold, #c8a15a); letter-spacing: 0.06em; text-transform: uppercase;">
                ${escapeHtml(p.code || "GD-DESIGN")}
              </div>
              <h4 style="font-family: var(--font-serif, serif); font-size: 17px; margin: 2px 0 4px; color: var(--navy, #111d42); line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${escapeHtml(p.title || "Embroidery Design")}
              </h4>
              <span style="font-size: 11px; color: var(--ink-soft, rgba(17,29,66,0.72)); display: block;">
                Commercial .DST & .PES Machine Files
              </span>
            </div>
          </div>

          <!-- Price Row -->
          <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid var(--border, #e6ded1); padding-bottom: 14px;">
            <div>
              <span style="font-size: 12px; color: var(--ink-soft, rgba(17,29,66,0.72)); font-weight: 500; display: block;">Total Price:</span>
              <span style="font-size: 11px; color: #52c41a; font-weight: 600;">Includes Commercial Machine License</span>
            </div>
            <div style="font-size: 26px; font-family: var(--font-serif, serif); font-weight: 700; color: var(--navy, #111d42);">
              ${money(price)}
            </div>
          </div>

          <!-- Razorpay Security Badge -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 11.5px; color: var(--ink-soft, rgba(17,29,66,0.72));">
            ${icon("shield-check", 16)}
            <span>Secure payment powered by <strong>Razorpay</strong></span>
          </div>

          <!-- Primary Pay Button -->
          <button 
            type="button" 
            class="button button-primary" 
            data-action="start-razorpay-checkout" 
            data-id="${attr(p.id)}"
            ${isLoading ? "disabled" : ""}
            style="width: 100%; min-height: 50px; font-size: 14.5px; font-weight: 700; border-radius: 8px; border: none; cursor: ${isLoading ? "not-allowed" : "pointer"}; display: flex; align-items: center; justify-content: center; gap: 10px; background: var(--navy, #111d42); color: #fff; box-shadow: 0 12px 30px rgba(17, 29, 66, 0.2); transition: all 0.2s;"
          >
            ${isLoading ? `
              <span class="btn-spinner" aria-hidden="true"></span>
              <span>${btnLabel}</span>
            ` : `
              ${icon("lock", 16)}
              <span>${btnLabel}</span>
            `}
          </button>

          <!-- Safe Disclaimer -->
          <p style="margin: 0; font-size: 11px; color: var(--ink-soft, rgba(17,29,66,0.72)); text-align: center; line-height: 1.4;">
            Instant unlock upon payment. Downloads available in both Tajima (.DST) and Brother (.PES) formats.
          </p>

        </div>

      </section>
    </div>
  `;
}

/**
 * Event delegates for Pre-Checkout modal
 */
export function initPaymentModalDelegates() {
  document.addEventListener("click", (e) => {
    // Close modal
    if (e.target.closest("[data-action='close-precheckout']")) {
      closePreCheckout();
      return;
    }

    // Start payment button
    const startBtn = e.target.closest("[data-action='start-razorpay-checkout']");
    if (startBtn) {
      const pId = startBtn.dataset.id;
      if (pId) {
        initiatePayment(pId);
      }
      return;
    }
  });
}

/**
 * Compatibility helper to open pre-checkout modal from checkout or external calls
 */
export function openPaymentModal(options = {}) {
  if (!options) return;
  let product = null;
  if (options.productId) {
    product = site.products?.find(p => p.id === options.productId);
  } else if (options.items && options.items.length > 0) {
    const firstId = options.items[0].productId || options.items[0].id;
    product = site.products?.find(p => p.id === firstId);
  }

  if (!product && options.total) {
    product = {
      id: options.productId || (options.items && options.items[0]?.productId) || "cart-order",
      title: options.orderRef ? `Order ${options.orderRef}` : "Embroidery Order",
      price: options.total,
      formats: ["DST", "PES"]
    };
  }

  if (product) {
    openPreCheckout(product);
  }
}
