/**
 * Godavari Designers - Payment Lifecycle Pages
 * Implements Processing, Success, Pending, Failed, Cancelled, and Support flows
 * with 21st.dev luxury micro-components and anti-flash server-authoritative rendering.
 */

import { fetchServerPaymentStatus, downloadDesignFile, initiatePayment } from "../services/paymentService.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

let activeStatusCache = null;
let activePollingTimer = null;

export function renderPaymentProcessing(queryParams = {}) {
  const purchaseId = queryParams.purchaseId;
  const orderId = queryParams.orderId;

  if (purchaseId && !activePollingTimer) {
    let pollCount = 0;
    activePollingTimer = setInterval(async () => {
      pollCount++;
      const data = await fetchServerPaymentStatus(purchaseId);
      if (data && data.status === "PAID") {
        clearInterval(activePollingTimer);
        activePollingTimer = null;
        window.location.hash = `#/payment/success?purchaseId=${encodeURIComponent(purchaseId)}`;
        return;
      }
      if (data && (data.status === "FAILED" || data.status === "CANCELLED")) {
        clearInterval(activePollingTimer);
        activePollingTimer = null;
        window.location.hash = `#/payment/failed?purchaseId=${encodeURIComponent(purchaseId)}`;
        return;
      }
      if (pollCount > 15) {
        clearInterval(activePollingTimer);
        activePollingTimer = null;
        window.location.hash = `#/payment/pending?purchaseId=${encodeURIComponent(purchaseId)}`;
      }
    }, 2000);
  }

  return `
    <section class="payment-lifecycle-section" style="min-height: 80vh; padding: 120px 20px 80px; display: grid; place-items: center; background: var(--ivory, #f8f6f2);">
      <div class="payment-card-shell luxury-card" style="max-width: 480px; width: 100%; background: #fff; border: 1px solid var(--border, #e6ded1); border-radius: 16px; padding: 40px 32px; text-align: center; box-shadow: 0 20px 60px rgba(17, 29, 66, 0.08);">
        <div style="width: 64px; height: 64px; margin: 0 auto 24px; position: relative;">
          <div class="luxury-spinner"></div>
        </div>
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--gold, #c8a15a); letter-spacing: 0.1em; display: block; margin-bottom: 6px;">
          Bank & Gateway Verification
        </span>
        <h2 style="font-family: var(--font-serif, serif); font-size: 26px; color: var(--navy, #111d42); margin: 0 0 10px; font-weight: 700;">
          Payment Received
        </h2>
        <p style="font-size: 13.5px; color: var(--ink-soft, rgba(17,29,66,0.72)); margin: 0 auto 24px; max-width: 360px; line-height: 1.5;">
          Verifying your transaction securely with Razorpay and issuing your commercial embroidery file license...
        </p>
        <div class="shimmer-skeleton" style="height: 54px; border-radius: 8px; margin-bottom: 16px;"></div>
        <span style="font-size: 11.5px; color: var(--ink-soft, rgba(17,29,66,0.72));">
          Please keep this window open. Do not refresh or press back.
        </span>
      </div>
    </section>
  `;
}

export function renderPaymentSuccess(queryParams = {}) {
  const purchaseId = queryParams.purchaseId;

  if (activePollingTimer) {
    clearInterval(activePollingTimer);
    activePollingTimer = null;
  }

  if (!activeStatusCache || activeStatusCache.purchase?.id !== purchaseId) {
    fetchServerPaymentStatus(purchaseId).then(data => {
      if (data) {
        if (data.status === "AUTHORIZED") {
          window.location.hash = `#/payment/pending?purchaseId=${encodeURIComponent(purchaseId)}`;
          return;
        }
        if (data.status === "FAILED") {
          window.location.hash = `#/payment/failed?purchaseId=${encodeURIComponent(purchaseId)}`;
          return;
        }
        activeStatusCache = data;
        import("../services/store.js").then(m => m.triggerRender());
      }
    });

    return `
      <section class="payment-lifecycle-section" style="min-height: 80vh; padding: 120px 20px 80px; display: grid; place-items: center; background: var(--ivory, #f8f6f2);">
        <div class="payment-card-shell luxury-card" style="max-width: 520px; width: 100%; background: #fff; border: 1px solid var(--border, #e6ded1); border-radius: 16px; padding: 40px 32px; text-align: center;">
          <div class="shimmer-skeleton" style="width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 20px;"></div>
          <div class="shimmer-skeleton" style="width: 220px; height: 28px; border-radius: 6px; margin: 0 auto 12px;"></div>
          <div class="shimmer-skeleton" style="width: 320px; height: 16px; border-radius: 4px; margin: 0 auto 30px;"></div>
          <div class="shimmer-skeleton" style="height: 90px; border-radius: 10px; margin-bottom: 20px;"></div>
          <div class="shimmer-skeleton" style="height: 50px; border-radius: 8px;"></div>
        </div>
      </section>
    `;
  }

  const { purchase, product } = activeStatusCache;
  const pTitle = product?.title || "Embroidery Design Pattern";
  const pCode = product?.code || "GD-DESIGN";
  const pPrice = purchase?.amount || 45;
  const pImage = product?.image || "/banner.jpeg";
  const pId = product?.id || purchase?.product_id;

  return `
    <section class="payment-lifecycle-section" style="min-height: 85vh; padding: 110px 20px 80px; display: grid; place-items: center; background: var(--ivory, #f8f6f2);">
      <div class="payment-card-shell luxury-card" style="max-width: 540px; width: 100%; background: #fff; border: 1px solid var(--border, #e6ded1); border-radius: 16px; padding: 40px 32px; text-align: center; box-shadow: 0 24px 80px rgba(17, 29, 66, 0.1);">
        
        <!-- 21st.dev Coordinated SVG Animated Checkmark -->
        <div class="success-checkmark-wrapper" style="width: 72px; height: 72px; margin: 0 auto 20px;">
          <svg class="checkmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle class="checkmark-circle" cx="26" cy="26" r="24" fill="none"/>
            <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>

        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #52c41a; letter-spacing: 0.1em; display: inline-flex; align-items: center; gap: 5px; margin-bottom: 6px;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #52c41a;"></span>
          Payment Confirmed & Verified
        </span>
        <h1 style="font-family: var(--font-serif, serif); font-size: 30px; color: var(--navy, #111d42); margin: 0 0 8px; font-weight: 700;">
          Payment Successful!
        </h1>
        <p style="font-size: 14px; color: var(--ink-soft, rgba(17,29,66,0.72)); margin: 0 auto 24px; max-width: 400px; line-height: 1.5;">
          Your machine embroidery design is unlocked and ready for commercial production stitching.
        </p>

        <!-- Product Summary Box -->
        <div style="display: flex; gap: 16px; background: var(--ivory, #f8f6f2); border: 1px solid var(--border, #e6ded1); border-radius: 12px; padding: 16px; text-align: left; align-items: center; margin-bottom: 24px;">
          <div style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border, #e6ded1); flex-shrink: 0; background: #fff;">
            <img src="${attr(mediaUrl(pImage))}" alt="${attr(pTitle)}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div style="overflow: hidden; flex: 1;">
            <div style="font-size: 11px; font-weight: 700; color: var(--gold, #c8a15a); letter-spacing: 0.05em; text-transform: uppercase;">
              ${escapeHtml(pCode)} • Commercial License
            </div>
            <h3 style="font-family: var(--font-serif, serif); font-size: 18px; margin: 2px 0 4px; color: var(--navy, #111d42); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${escapeHtml(pTitle)}
            </h3>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 4px;">
              <span style="font-size: 12px; color: var(--ink-soft, rgba(17,29,66,0.72));">DST & PES Formats</span>
              <strong style="font-size: 18px; font-family: var(--font-serif, serif); color: var(--navy, #111d42);">${money(pPrice)}</strong>
            </div>
          </div>
        </div>

        <!-- Order Metadata Strip -->
        <div style="background: #fff; border: 1px dashed var(--border, #e6ded1); border-radius: 10px; padding: 14px 16px; font-size: 12px; text-align: left; display: grid; gap: 8px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--ink-soft, rgba(17,29,66,0.72));">Order Reference:</span>
            <span style="font-family: monospace; font-weight: 700; color: var(--navy, #111d42);">${escapeHtml(purchase?.orderId || 'N/A')}</span>
          </div>
          ${purchase?.paymentId ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--ink-soft, rgba(17,29,66,0.72));">Payment Reference:</span>
              <span style="font-family: monospace; color: var(--ink-soft, rgba(17,29,66,0.72));">${escapeHtml(purchase.paymentId)}</span>
            </div>
          ` : ""}
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--ink-soft, rgba(17,29,66,0.72));">Status:</span>
            <span style="color: #52c41a; font-weight: 700;">PAID (Verified) ✓</span>
          </div>
        </div>

        <!-- Primary Dual Download Actions -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <button 
            type="button" 
            class="button button-primary" 
            data-action="download-dst" 
            data-id="${attr(pId)}" 
            style="display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13.5px; font-weight: 700; min-height: 48px; border-radius: 8px; background: var(--navy, #111d42); color: #fff;"
          >
            ${icon("download", 16)}
            <span>Download .DST</span>
          </button>
          <button 
            type="button" 
            class="button button-primary" 
            data-action="download-pes" 
            data-id="${attr(pId)}" 
            style="display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13.5px; font-weight: 700; min-height: 48px; border-radius: 8px; background: var(--navy, #111d42); color: #fff;"
          >
            ${icon("download", 16)}
            <span>Download .PES</span>
          </button>
        </div>

        <!-- Secondary Navigation Actions -->
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <a href="#/account/purchases" class="button button-secondary" style="text-decoration: none; font-size: 12.5px; font-weight: 600; padding: 0 16px; min-height: 40px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px;">
            ${icon("package", 14)}
            <span>View My Purchases</span>
          </a>
          <a href="#/catalog" class="button button-secondary" style="text-decoration: none; font-size: 12.5px; font-weight: 600; padding: 0 16px; min-height: 40px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px;">
            <span>Back to Marketplace</span>
          </a>
        </div>

        <div style="margin-top: 24px; font-size: 11.5px; color: var(--ink-soft, rgba(17,29,66,0.72));">
          Need assistance or custom file sizing? 
          <a href="#/support/payment?orderRef=${attr(purchase?.orderId || '')}" style="color: var(--navy, #111d42); font-weight: 700; text-decoration: underline;">
            Contact Payment Support
          </a>
        </div>

      </div>
    </section>
  `;
}

export function renderPaymentPending(queryParams = {}) {
  const purchaseId = queryParams.purchaseId;

  return `
    <section class="payment-lifecycle-section" style="min-height: 80vh; padding: 120px 20px 80px; display: grid; place-items: center; background: var(--ivory, #f8f6f2);">
      <div class="payment-card-shell luxury-card" style="max-width: 480px; width: 100%; background: #fff; border: 1px solid var(--border, #e6ded1); border-radius: 16px; padding: 40px 32px; text-align: center; box-shadow: 0 20px 60px rgba(17, 29, 66, 0.08);">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(200, 161, 90, 0.15); color: var(--gold, #c8a15a); display: grid; place-items: center; margin: 0 auto 20px;">
          ${icon("clock", 30)}
        </div>
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--gold, #c8a15a); letter-spacing: 0.1em; display: block; margin-bottom: 6px;">
          Bank Confirmation in Progress
        </span>
        <h1 style="font-family: var(--font-serif, serif); font-size: 26px; color: var(--navy, #111d42); margin: 0 0 10px; font-weight: 700;">
          Payment is Being Confirmed
        </h1>
        <p style="font-size: 13.5px; color: var(--ink-soft, rgba(17,29,66,0.72)); margin: 0 auto 20px; line-height: 1.5;">
          Your bank or payment application is processing the settlement. <strong>Please do not pay again.</strong>
        </p>
        <div style="background: #fffbe6; border: 1px solid #ffe58f; border-radius: 8px; padding: 12px; font-size: 12px; color: #873800; text-align: left; margin-bottom: 24px; line-height: 1.4;">
          If your account was debited, your design entitlement will automatically unlock as soon as Razorpay confirms the settlement webhook.
        </div>
        <button 
          type="button" 
          class="button button-primary" 
          data-action="check-status-again" 
          data-id="${attr(purchaseId || '')}"
          style="width: 100%; min-height: 46px; font-size: 13.5px; font-weight: 700; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--navy, #111d42); color: #fff; margin-bottom: 12px;"
        >
          ${icon("refresh-cw", 16)}
          <span>Check Payment Status</span>
        </button>
        <a href="#/catalog" class="button button-secondary" style="width: 100%; text-decoration: none; font-size: 12.5px; font-weight: 600; min-height: 42px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
          <span>Return to Marketplace</span>
        </a>
      </div>
    </section>
  `;
}

export function renderPaymentFailed(queryParams = {}) {
  const purchaseId = queryParams.purchaseId;
  const productId = queryParams.productId;
  const reason = queryParams.reason || "The payment transaction could not be completed by your payment provider.";

  return `
    <section class="payment-lifecycle-section" style="min-height: 80vh; padding: 120px 20px 80px; display: grid; place-items: center; background: var(--ivory, #f8f6f2);">
      <div class="payment-card-shell luxury-card" style="max-width: 480px; width: 100%; background: #fff; border: 1px solid var(--border, #e6ded1); border-radius: 16px; padding: 40px 32px; text-align: center; box-shadow: 0 20px 60px rgba(17, 29, 66, 0.08);">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: #fff1f0; border: 1px solid #ffa39e; color: #f5222d; display: grid; place-items: center; margin: 0 auto 20px;">
          ${icon("alert-circle", 30)}
        </div>
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #f5222d; letter-spacing: 0.1em; display: block; margin-bottom: 6px;">
          Transaction Incomplete
        </span>
        <h1 style="font-family: var(--font-serif, serif); font-size: 26px; color: var(--navy, #111d42); margin: 0 0 10px; font-weight: 700;">
          Payment Wasn't Completed
        </h1>
        <p style="font-size: 13.5px; color: var(--ink-soft, rgba(17,29,66,0.72)); margin: 0 auto 20px; line-height: 1.5;">
          ${escapeHtml(reason)}
        </p>
        <div style="background: var(--ivory, #f8f6f2); border: 1px solid var(--border, #e6ded1); border-radius: 8px; padding: 12px 14px; font-size: 12px; text-align: left; margin-bottom: 24px; line-height: 1.4; color: var(--ink-soft, rgba(17,29,66,0.72));">
          <strong>Common Causes:</strong>
          <ul style="margin: 6px 0 0; padding-left: 18px;">
            <li>UPI app session timed out or cancelled</li>
            <li>Bank card 3D Secure authentication declined</li>
            <li>Temporary gateway network interruption</li>
          </ul>
        </div>
        ${productId ? `
          <button 
            type="button" 
            class="button button-primary" 
            data-action="retry-payment" 
            data-id="${attr(productId)}"
            style="width: 100%; min-height: 48px; font-size: 13.5px; font-weight: 700; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--navy, #111d42); color: #fff; margin-bottom: 12px;"
          >
            ${icon("rotate-cw", 16)}
            <span>Try Payment Again</span>
          </button>
        ` : ""}
        <div style="display: flex; gap: 10px;">
          <a href="#/catalog" class="button button-secondary" style="flex: 1; text-decoration: none; font-size: 12px; font-weight: 600; min-height: 40px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
            <span>Browse Designs</span>
          </a>
          <a href="#/support/payment?orderRef=${attr(purchaseId || '')}" class="button button-secondary" style="flex: 1; text-decoration: none; font-size: 12px; font-weight: 600; min-height: 40px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
            <span>Payment Support</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

export function renderPaymentCancelled(queryParams = {}) {
  const productId = queryParams.productId;

  return `
    <section class="payment-lifecycle-section" style="min-height: 80vh; padding: 120px 20px 80px; display: grid; place-items: center; background: var(--ivory, #f8f6f2);">
      <div class="payment-card-shell luxury-card" style="max-width: 460px; width: 100%; background: #fff; border: 1px solid var(--border, #e6ded1); border-radius: 16px; padding: 40px 32px; text-align: center; box-shadow: 0 20px 60px rgba(17, 29, 66, 0.08);">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--surface, #efe8dd); color: var(--navy, #111d42); display: grid; place-items: center; margin: 0 auto 18px;">
          ${icon("x-circle", 26)}
        </div>
        <h1 style="font-family: var(--font-serif, serif); font-size: 26px; color: var(--navy, #111d42); margin: 0 0 10px; font-weight: 700;">
          Payment Cancelled
        </h1>
        <p style="font-size: 13.5px; color: var(--ink-soft, rgba(17,29,66,0.72)); margin: 0 auto 24px; line-height: 1.5;">
          The checkout window was closed. No payment was charged, and your embroidery design remains available.
        </p>
        ${productId ? `
          <button 
            type="button" 
            class="button button-primary" 
            data-action="retry-payment" 
            data-id="${attr(productId)}"
            style="width: 100%; min-height: 46px; font-size: 13.5px; font-weight: 700; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--navy, #111d42); color: #fff; margin-bottom: 10px;"
          >
            <span>Try Again</span>
          </button>
        ` : ""}
        <a href="#/catalog" class="button button-secondary" style="width: 100%; text-decoration: none; font-size: 12.5px; font-weight: 600; min-height: 42px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
          <span>Return to Catalog</span>
        </a>
      </div>
    </section>
  `;
}

export function renderPaymentSupport(queryParams = {}) {
  const initialRef = queryParams.orderRef || "";

  return `
    <section class="payment-lifecycle-section" style="min-height: 85vh; padding: 110px 20px 80px; background: var(--ivory, #f8f6f2);">
      <div style="max-width: 680px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--gold, #c8a15a); letter-spacing: 0.1em; display: block; margin-bottom: 4px;">
            Dedicated Customer Care
          </span>
          <h1 style="font-family: var(--font-serif, serif); font-size: 32px; color: var(--navy, #111d42); margin: 0 0 10px; font-weight: 700;">
            Payment & Entitlement Support
          </h1>
          <p style="font-size: 14px; color: var(--ink-soft, rgba(17,29,66,0.72)); margin: 0; line-height: 1.5;">
            Encountered a debit or download issue? Our engineering team resolves transactions promptly.
          </p>
        </div>

        <div style="background: #fff; border: 1.5px solid var(--gold, #c8a15a); border-radius: 12px; padding: 22px; margin-bottom: 28px; box-shadow: 0 12px 36px rgba(200, 161, 90, 0.12);">
          <div style="display: flex; gap: 14px; align-items: flex-start;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(200, 161, 90, 0.18); color: var(--gold, #c8a15a); display: grid; place-items: center; flex-shrink: 0;">
              ${icon("shield-alert", 22)}
            </div>
            <div>
              <h3 style="font-family: var(--font-serif, serif); font-size: 19px; color: var(--navy, #111d42); margin: 0 0 4px; font-weight: 700;">
                Money Debited but Files Locked?
              </h3>
              <p style="font-size: 13px; color: var(--ink-soft, rgba(17,29,66,0.72)); margin: 0 0 14px; line-height: 1.4;">
                If your bank debited your account but your browser closed or lost connection, <strong>do not pay again</strong>. Enter your order or payment ID below for instant automated gateway verification.
              </p>
            </div>
          </div>

          <form id="instantRecoveryForm" style="display: flex; gap: 8px; flex-wrap: wrap;">
            <input 
              type="text" 
              name="orderReference" 
              value="${attr(initialRef)}" 
              placeholder="Order Ref (e.g. order_xxx or pay_xxx)" 
              required 
              style="flex: 1; min-width: 220px; height: 44px; padding: 0 14px; border-radius: 6px; border: 1px solid var(--border, #e6ded1); font-size: 13px;"
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Your Email" 
              required 
              style="flex: 1; min-width: 180px; height: 44px; padding: 0 14px; border-radius: 6px; border: 1px solid var(--border, #e6ded1); font-size: 13px;"
            />
            <button 
              type="submit" 
              class="button button-primary" 
              style="height: 44px; padding: 0 20px; font-size: 13px; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; background: var(--navy, #111d42); color: #fff; display: flex; align-items: center; gap: 6px;"
            >
              ${icon("check-circle", 15)}
              <span>Check Status & Unlock</span>
            </button>
          </form>
          <div id="recoveryResultMsg" style="margin-top: 10px; font-size: 12.5px; display: none;"></div>
        </div>

        <div style="background: #fff; border: 1px solid var(--border, #e6ded1); border-radius: 12px; padding: 26px; box-shadow: 0 12px 40px rgba(17, 29, 66, 0.04);">
          <h3 style="font-family: var(--font-serif, serif); font-size: 20px; color: var(--navy, #111d42); margin: 0 0 16px; font-weight: 700;">
            Submit a Support Ticket
          </h3>
          <form id="generalSupportForm" style="display: grid; gap: 16px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: var(--navy, #111d42); margin-bottom: 6px;">Your Email *</label>
                <input type="email" name="email" required placeholder="you@domain.com" style="width: 100%; height: 42px; padding: 0 12px; border: 1px solid var(--border, #e6ded1); border-radius: 6px; font-size: 13px;" />
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: var(--navy, #111d42); margin-bottom: 6px;">Order / Payment Reference</label>
                <input type="text" name="orderReference" value="${attr(initialRef)}" placeholder="Optional reference" style="width: 100%; height: 42px; padding: 0 12px; border: 1px solid var(--border, #e6ded1); border-radius: 6px; font-size: 13px;" />
              </div>
            </div>
            <div>
              <label style="display: block; font-size: 12px; font-weight: 600; color: var(--navy, #111d42); margin-bottom: 6px;">Issue Category *</label>
              <select name="category" required style="width: 100%; height: 42px; padding: 0 12px; border: 1px solid var(--border, #e6ded1); border-radius: 6px; font-size: 13px; background: #fff;">
                <option value="Money Debited but Not Unlocked">Money Debited but Design Locked</option>
                <option value="Payment Pending">Payment Pending Confirmation</option>
                <option value="Payment Failed">Payment Failed / Declined</option>
                <option value="Download Not Working">File Download Error</option>
                <option value="Duplicate Payment">Duplicate Payment Inquiry</option>
                <option value="Refund Question">Refund Request / Question</option>
                <option value="Other Payment Issue">Other Payment Inquiries</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 12px; font-weight: 600; color: var(--navy, #111d42); margin-bottom: 6px;">Description *</label>
              <textarea name="description" rows="4" required placeholder="Please describe what occurred with your payment..." style="width: 100%; padding: 10px 12px; border: 1px solid var(--border, #e6ded1); border-radius: 6px; font-size: 13px; font-family: inherit; resize: vertical;"></textarea>
            </div>
            <button type="submit" class="button button-primary" style="min-height: 46px; font-size: 13.5px; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; background: var(--navy, #111d42); color: #fff;">
              Submit Support Ticket
            </button>
          </form>
          <div id="generalSupportResult" style="margin-top: 14px; font-size: 13px; display: none;"></div>
        </div>
      </div>
    </section>
  `;
}

export function initPaymentPagesDelegates() {
  document.addEventListener("click", (e) => {
    const dstBtn = e.target.closest("[data-action='download-dst']");
    if (dstBtn) {
      const pId = dstBtn.dataset.id;
      if (pId) downloadDesignFile(pId, "DST");
      return;
    }

    const pesBtn = e.target.closest("[data-action='download-pes']");
    if (pesBtn) {
      const pId = pesBtn.dataset.id;
      if (pId) downloadDesignFile(pId, "PES");
      return;
    }

    const checkBtn = e.target.closest("[data-action='check-status-again']");
    if (checkBtn) {
      const purchaseId = checkBtn.dataset.id;
      if (purchaseId) {
        checkBtn.disabled = true;
        checkBtn.innerHTML = `<span>Checking status...</span>`;
        fetchServerPaymentStatus(purchaseId).then(data => {
          checkBtn.disabled = false;
          checkBtn.innerHTML = `<span>Check Payment Status</span>`;
          if (data && data.status === "PAID") {
            window.location.hash = `#/payment/success?purchaseId=${encodeURIComponent(purchaseId)}`;
          } else {
            import("../services/store.js").then(m => m.showToast("Payment still pending. We will continue checking."));
          }
        });
      }
      return;
    }

    const retryBtn = e.target.closest("[data-action='retry-payment']");
    if (retryBtn) {
      const pId = retryBtn.dataset.id;
      if (pId) {
        initiatePayment(pId);
      }
      return;
    }
  });

  document.addEventListener("submit", async (e) => {
    if (e.target && e.target.id === "instantRecoveryForm") {
      e.preventDefault();
      const form = e.target;
      const orderRef = form.orderReference.value.trim();
      const email = form.email.value.trim();
      const msgBox = document.getElementById("recoveryResultMsg");

      msgBox.style.display = "block";
      msgBox.style.color = "var(--navy, #111d42)";
      msgBox.textContent = "Verifying payment with gateway...";

      try {
        const res = await fetch("/api/support/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderReference: orderRef,
            email,
            category: "Money Debited but Not Unlocked",
            description: "Automated status recovery requested from website support page."
          })
        });
        const data = await res.json();
        if (data.autoResolved && data.purchaseId) {
          msgBox.style.color = "#52c41a";
          msgBox.textContent = "✓ " + data.message;
          setTimeout(() => {
            window.location.hash = `#/payment/success?purchaseId=${encodeURIComponent(data.purchaseId)}`;
          }, 1000);
        } else {
          msgBox.style.color = "var(--gold, #c8a15a)";
          msgBox.textContent = data.message || "Payment status checked. Support team alerted.";
        }
      } catch (err) {
        msgBox.style.color = "#f5222d";
        msgBox.textContent = "Error: " + err.message;
      }
    }

    if (e.target && e.target.id === "generalSupportForm") {
      e.preventDefault();
      const form = e.target;
      const email = form.email.value.trim();
      const orderReference = form.orderReference.value.trim();
      const category = form.category.value;
      const description = form.description.value.trim();
      const msgBox = document.getElementById("generalSupportResult");

      msgBox.style.display = "block";
      msgBox.style.color = "var(--navy, #111d42)";
      msgBox.textContent = "Submitting ticket...";

      try {
        const res = await fetch("/api/support/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, orderReference, category, description })
        });
        const data = await res.json();
        msgBox.style.color = "#52c41a";
        msgBox.textContent = "✓ " + (data.message || "Your ticket has been submitted successfully.");
        form.reset();
      } catch (err) {
        msgBox.style.color = "#f5222d";
        msgBox.textContent = "Error: " + err.message;
      }
    }
  });
}
