/**
 * Godavari Designers - Pre-Checkout Presentation Component
 * Clean, minimal pre-checkout card preceding Razorpay Standard Checkout.
 * All custom QR codes, manual UPI instructions, and manual verification buttons are eliminated.
 */

import { paymentContext, PaymentState, initiatePayment, closePreCheckout, openPreCheckout } from "../services/paymentService.js";
import { site, currentUser, showToast } from "../services/store.js";
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
      
      <section class="payment-modal-card luxury-card" style="max-width: 460px; width: 100%; margin: auto; background: #fff; border-radius: 16px; border: 1px solid var(--border, #e6ded1); box-shadow: 0 25px 60px -12px rgba(17, 29, 66, 0.28); overflow: hidden; position: relative; z-index: 2;">
        
        <!-- Header -->
        <div style="padding: 18px 24px; background: var(--navy, #111d42); color: #fff; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--gold, #c8a15a); box-shadow: 0 0 8px rgba(200, 161, 90, 0.6);"></span>
            <h3 id="precheckout-title" style="font-family: var(--font-serif, serif); font-size: 19px; margin: 0; color: #fff; font-weight: 600; letter-spacing: 0.02em;">
              Unlock Embroidery Design
            </h3>
          </div>
          <button type="button" class="icon-button" data-action="close-precheckout" aria-label="Close" style="color: #fff; background: rgba(255,255,255,0.12); border: none; border-radius: 50%; width: 32px; height: 32px; display: grid; place-items: center; cursor: pointer; transition: background 0.2s;">
            ${icon("x", 16)}
          </button>
        </div>

        <!-- Body -->
        <div style="padding: 24px; display: grid; gap: 18px; background: #faf9f6;">
          
          <!-- Product Showcase Card -->
          <div style="display: flex; gap: 16px; background: #fff; border: 1px solid var(--border, #e6ded1); border-radius: 12px; padding: 14px; align-items: center; box-shadow: 0 2px 8px rgba(17,29,66,0.04);">
            <div style="width: 76px; height: 76px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border, #e6ded1); flex-shrink: 0; background: #f4efe6;">
              <img src="${attr(mediaUrl(p.image))}" alt="${attr(p.title)}" style="width: 100%; height: 100%; object-fit: contain; background: #fff;" />
            </div>
            <div style="overflow: hidden; flex: 1; min-width: 0;">
              <div style="display: inline-block; font-size: 11px; font-weight: 800; color: #111d42; background: rgba(200,161,90,0.2); padding: 2px 7px; border-radius: 4px; letter-spacing: 0.05em; text-transform: uppercase;">
                ${escapeHtml(p.code || "GD-DESIGN")}
              </div>
              <h4 style="font-family: var(--font-serif, serif); font-size: 16px; margin: 5px 0 3px; color: var(--navy, #111d42); line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${escapeHtml(p.title || "Embroidery Design")}
              </h4>
              <span style="font-size: 11.5px; color: rgba(17,29,66,0.65); display: block;">
                Commercial .DST Machine Files Set
              </span>
            </div>
          </div>

          <!-- Price & License Block -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid var(--border, #e6ded1); border-radius: 12px; padding: 16px 18px;">
            <div>
              <span style="font-size: 12px; color: rgba(17,29,66,0.6); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: block;">
                Total Amount
              </span>
              <span style="font-size: 12px; color: #15803d; font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 2px;">
                ✓ Commercial Machine License
              </span>
            </div>
            <div style="font-size: 28px; font-family: var(--font-serif, serif); font-weight: 800; color: var(--navy, #111d42); letter-spacing: -0.02em; white-space: nowrap; padding-left: 12px;">
              ${money(price)}
            </div>
          </div>

          <!-- Logged-in Account Banner -->
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(17,29,66,0.04); border: 1px solid var(--border, #e6ded1); border-radius: 8px; padding: 10px 14px; font-size: 12px; color: var(--navy, #111d42);">
            <span style="display: flex; align-items: center; gap: 6px; color: rgba(17,29,66,0.7);">
              ${icon("user-check", 15)}
              <span>Purchasing as:</span>
            </span>
            <strong style="font-weight: 700; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--navy, #111d42);">
              ${escapeHtml(currentUser?.email || currentUser?.phone || currentUser?.name || "Godavari Member")}
            </strong>
          </div>

          <!-- Razorpay Security Badge -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; color: rgba(17,29,66,0.7);">
            ${icon("shield-check", 16)}
            <span>Secure 256-bit encrypted checkout via <strong>Razorpay</strong></span>
          </div>

          <!-- Primary Pay Button -->
          <button 
            type="button" 
            class="button button-primary" 
            data-action="start-razorpay-checkout" 
            data-id="${attr(p.id)}"
            ${isLoading ? "disabled" : ""}
            style="width: 100%; min-height: 52px; font-size: 15px; font-weight: 700; border-radius: 10px; border: none; cursor: ${isLoading ? "not-allowed" : "pointer"}; display: flex; align-items: center; justify-content: center; gap: 10px; background: var(--navy, #111d42); color: #fff; box-shadow: 0 10px 25px rgba(17, 29, 66, 0.25); transition: all 0.2s;"
          >
            ${isLoading ? `
              <span class="btn-spinner" aria-hidden="true"></span>
              <span>${btnLabel}</span>
            ` : `
              ${icon("lock", 17)}
              <span>${btnLabel}</span>
            `}
          </button>

          <!-- Safe Disclaimer -->
          <p style="margin: 0; font-size: 11.5px; color: rgba(17,29,66,0.55); text-align: center; line-height: 1.4;">
            Instant unlock after payment. High-speed Tajima (.DST) machine embroidery bundle available immediately.
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

  if (!currentUser) {
    const firstId = options.productId || (options.items && options.items[0]?.productId) || (options.items && options.items[0]?.id);
    sessionStorage.setItem("godavari_pending_buy_now", JSON.stringify({
      productId: firstId,
      returnUrl: window.location.hash || ""
    }));
    showToast("Please sign in or register to complete your purchase.");
    window.location.hash = "#/auth";
    return;
  }

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
