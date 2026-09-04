import { site, unlockDesignsAfterPayment, downloadMachineFile, showToast, triggerRender } from "../services/store.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

// Global Payment Modal State
export const paymentState = {
  isOpen: false,
  items: [],
  total: 0,
  orderRef: "",
  activeTab: "upi", // 'upi' | 'razorpay'
  isSuccess: false,
  unlockedList: []
};

export function openPaymentModal({ items = [], total = 0, orderRef = "", initialTab = "upi" } = {}) {
  paymentState.isOpen = true;
  paymentState.items = items;
  paymentState.total = total || items.reduce((sum, it) => sum + (it.price || 45), 0);
  paymentState.orderRef = orderRef || `GD-PAY-${Date.now().toString().slice(-6)}`;
  paymentState.activeTab = initialTab;
  paymentState.isSuccess = false;
  paymentState.unlockedList = [];
  triggerRender();
}

export function closePaymentModal() {
  paymentState.isOpen = false;
  paymentState.isSuccess = false;
  triggerRender();
}

export function renderPaymentModal() {
  if (!paymentState.isOpen) return "";

  const upiId = "8309897055@ybl";
  const amount = paymentState.total;
  const orderRef = paymentState.orderRef;
  const upiUri = `upi://pay?pa=${upiId}&pn=Godavari%20Designers&am=${amount}&cu=INR&tn=${encodeURIComponent(orderRef)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}`;

  return `
    <div class="overlay-panel payment-modal-overlay" role="dialog" aria-modal="true" aria-label="Complete Payment">
      <div class="overlay-scrim" data-action="close-payment-modal"></div>
      <section class="payment-modal-card" style="max-width: 520px; width: 92%; margin: auto; background: #fff; border-radius: 12px; border: 1px solid var(--border); box-shadow: var(--shadow-deep); overflow: hidden; position: relative; z-index: 1000;">
        
        <!-- Header -->
        <div style="padding: 16px 20px; background: var(--navy); color: #fff; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--gold); letter-spacing: 0.08em;">Instant Entitlement Gateway</span>
            <h3 style="font-family: var(--font-serif); font-size: 20px; margin: 2px 0 0; color: #fff;">Unlock Embroidery Design</h3>
          </div>
          <button type="button" class="icon-button" data-action="close-payment-modal" aria-label="Close" style="color: #fff; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; width: 32px; height: 32px; display: grid; place-items: center; cursor: pointer;">
            ${icon("x", 18)}
          </button>
        </div>

        <!-- Body -->
        <div style="padding: 20px; max-height: 80vh; overflow-y: auto;">
          ${paymentState.isSuccess ? renderSuccessView() : renderCheckoutView(amount, orderRef, upiId, upiUri, qrUrl)}
        </div>

      </section>
    </div>
  `;
}

function renderCheckoutView(amount, orderRef, upiId, upiUri, qrUrl) {
  return `
    <!-- Items Summary Banner -->
    <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; margin-bottom: 6px;">
        <span style="color: var(--ink-soft); font-weight: 600;">Order Ref:</span>
        <strong style="font-family: monospace; color: var(--navy);">${escapeHtml(orderRef)}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="font-size: 14px; color: var(--navy); display: block;">${paymentState.items.length} Design(s) to Unlock</strong>
          <span style="font-size: 11px; color: var(--ink-soft);">Commercial .DST & .PES Machine Files</span>
        </div>
        <div style="font-size: 22px; font-weight: 800; color: var(--gold);">${money(amount)}</div>
      </div>
    </div>

    <!-- Payment Method Tabs -->
    <div style="display: flex; border-bottom: 1.5px solid var(--border); margin-bottom: 16px;">
      <button type="button" class="payment-tab-btn" data-action="select-payment-tab" data-tab="upi" style="flex: 1; padding: 10px 12px; font-size: 13px; font-weight: 700; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${paymentState.activeTab === 'upi' ? 'var(--gold)' : 'transparent'}; color: ${paymentState.activeTab === 'upi' ? 'var(--navy)' : 'var(--ink-soft)'}; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <span>⚡ PhonePe / UPI Apps</span>
      </button>
      <button type="button" class="payment-tab-btn" data-action="select-payment-tab" data-tab="razorpay" style="flex: 1; padding: 10px 12px; font-size: 13px; font-weight: 700; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${paymentState.activeTab === 'razorpay' ? 'var(--gold)' : 'transparent'}; color: ${paymentState.activeTab === 'razorpay' ? 'var(--navy)' : 'var(--ink-soft)'}; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <span>💳 Razorpay / Cards / NetBanking</span>
      </button>
    </div>

    <!-- Tab Content: PhonePe & UPI -->
    ${paymentState.activeTab === 'upi' ? `
      <div style="display: grid; gap: 16px;">
        
        <!-- QR Code Box -->
        <div style="background: #faf8f5; border: 1px dashed var(--gold); border-radius: 10px; padding: 16px; text-align: center; display: grid; gap: 10px; justify-items: center;">
          <span style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--gold); letter-spacing: 0.05em;">Scan with PhonePe, Google Pay, or Paytm</span>
          <div style="background: #fff; padding: 8px; border-radius: 8px; border: 1px solid var(--border); width: 170px; height: 170px; display: grid; place-items: center;">
            <img src="${qrUrl}" alt="UPI QR Code" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>
          <span style="font-size: 12px; color: var(--navy); font-weight: 600;">Total to Pay: <strong style="color: var(--gold); font-size: 14px;">${money(amount)}</strong></span>
        </div>

        <!-- 1-Tap Mobile UPI Intent Buttons -->
        <div>
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--ink-soft); display: block; margin-bottom: 8px;">Pay with Installed App:</span>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <a href="${upiUri}" class="button button-secondary" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; font-weight: 700; height: 38px; border-radius: 6px;">
              <span>🟣 PhonePe</span>
            </a>
            <a href="${upiUri}" class="button button-secondary" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; font-weight: 700; height: 38px; border-radius: 6px;">
              <span>🔵 Google Pay</span>
            </a>
            <a href="${upiUri}" class="button button-secondary" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; font-weight: 700; height: 38px; border-radius: 6px;">
              <span>💠 Paytm</span>
            </a>
            <a href="${upiUri}" class="button button-secondary" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; font-weight: 700; height: 38px; border-radius: 6px;">
              <span>🏦 Any UPI App</span>
            </a>
          </div>
        </div>

        <!-- Copy UPI ID Row -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 8px 12px; font-size: 12px;">
          <span style="color: var(--ink-soft);">UPI ID: <strong style="color: var(--navy);">${upiId}</strong></span>
          <button type="button" data-action="copy-upi-id" data-upi="${upiId}" style="background: #fff; border: 1px solid var(--border); border-radius: 4px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer; color: var(--navy);">
            Copy ID
          </button>
        </div>

        <!-- Confirm Payment Button -->
        <button type="button" class="button button-primary" data-action="confirm-payment-unlock" data-method="PhonePe/UPI" style="width: 100%; min-height: 46px; font-size: 13.5px; font-weight: 700; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--navy); color: #fff;">
          ${icon("shield-check", 18)}
          <span>I Have Paid — Verify & Unlock Files</span>
        </button>

      </div>
    ` : `
      <!-- Tab Content: Razorpay -->
      <div style="display: grid; gap: 16px; text-align: center;">
        <div style="background: #fdfaf6; border: 1px solid var(--border); border-radius: 10px; padding: 24px 16px; display: grid; gap: 12px; justify-items: center;">
          <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(200, 161, 90, 0.15); display: grid; place-items: center; color: var(--gold);">
            ${icon("credit-card", 24)}
          </div>
          <div>
            <strong style="font-size: 15px; color: var(--navy); display: block;">Razorpay Secure Checkout</strong>
            <p style="font-size: 12.5px; color: var(--ink-soft); margin: 4px 0 0; max-width: 320px;">Pay with Credit/Debit Cards (Visa, Mastercard, RuPay), NetBanking, or Digital Wallets.</p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
            <span style="font-size: 10px; font-weight: 700; background: #fff; border: 1px solid var(--border); border-radius: 4px; padding: 3px 6px;">VISA</span>
            <span style="font-size: 10px; font-weight: 700; background: #fff; border: 1px solid var(--border); border-radius: 4px; padding: 3px 6px;">Mastercard</span>
            <span style="font-size: 10px; font-weight: 700; background: #fff; border: 1px solid var(--border); border-radius: 4px; padding: 3px 6px;">RuPay</span>
            <span style="font-size: 10px; font-weight: 700; background: #fff; border: 1px solid var(--border); border-radius: 4px; padding: 3px 6px;">NetBanking</span>
          </div>
        </div>

        <button type="button" class="button button-primary" data-action="confirm-payment-unlock" data-method="Razorpay" style="width: 100%; min-height: 46px; font-size: 13.5px; font-weight: 700; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
          ${icon("lock", 16)}
          <span>Pay ${money(amount)} via Razorpay</span>
        </button>
      </div>
    `}
  `;
}

function renderSuccessView() {
  const items = paymentState.items;
  return `
    <div style="text-align: center; display: grid; gap: 16px; justify-items: center; padding: 10px 0;">
      
      <div style="width: 60px; height: 60px; border-radius: 50%; background: #f6ffed; border: 1.5px solid #b7eb8f; color: #52c41a; display: grid; place-items: center;">
        ${icon("check", 30)}
      </div>

      <div>
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #52c41a; letter-spacing: 0.08em;">Authorized & Verified</span>
        <h3 style="font-family: var(--font-serif); font-size: 22px; color: var(--navy); margin: 4px 0 6px;">Payment Complete! 🎉</h3>
        <p style="font-size: 13px; color: var(--ink-soft); margin: 0; max-width: 360px; line-height: 1.5;">
          Your machine embroidery stitch files are now unlocked and permanently available for download.
        </p>
      </div>

      <!-- Unlocked Files List with 1-Tap Download -->
      <div style="width: 100%; display: grid; gap: 10px; text-align: left; margin: 8px 0;">
        ${items.map(item => {
          const p = site.products.find(x => x.id === item.productId || x.id === item.id) || {};
          const code = p.code || item.code || "GD-DESIGN";
          const title = p.title || item.title || "Embroidery Pattern";
          const format = item.format || "DST";

          return `
            <div style="background: #faf8f5; border: 1px solid var(--border); border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
              <div style="overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                  <span style="font-size: 9.5px; font-weight: 700; color: var(--gold); background: rgba(200, 161, 90, 0.12); padding: 1px 5px; border-radius: 3px;">${escapeHtml(code)}</span>
                  <span style="font-size: 9.5px; font-weight: 700; color: #52c41a; background: #f6ffed; border: 1px solid #b7eb8f; padding: 1px 5px; border-radius: 3px;">Unlocked ✓</span>
                </div>
                <strong style="font-size: 13px; color: var(--navy); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(title)}</strong>
              </div>
              <button type="button" class="button button-primary" data-action="download-machine-file" data-id="${attr(item.productId || item.id)}" data-format="${attr(format)}" style="flex-shrink: 0; min-height: 36px; font-size: 12px; font-weight: 700; padding: 0 14px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px;">
                ${icon("download", 14)}
                <span>.${escapeHtml(format)}</span>
              </button>
            </div>
          `;
        }).join("")}
      </div>

      <!-- Footer navigation -->
      <div style="display: flex; gap: 10px; width: 100%;">
        <a href="#/wishlist?tab=downloads" data-action="close-payment-modal" class="button button-secondary" style="flex: 1; text-decoration: none; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; min-height: 40px; border-radius: 6px;">
          <span>Go to My Downloads</span>
        </a>
        <button type="button" data-action="close-payment-modal" class="button button-primary" style="flex: 1; font-size: 12px; font-weight: 700; min-height: 40px; border-radius: 6px;">
          <span>Done</span>
        </button>
      </div>

    </div>
  `;
}

// Global click event listener for payment modal actions
export function initPaymentModalDelegates() {
  document.addEventListener("click", (e) => {
    // Close modal
    const closeBtn = e.target.closest("[data-action='close-payment-modal']");
    if (closeBtn) {
      closePaymentModal();
      return;
    }

    // Switch tab
    const tabBtn = e.target.closest("[data-action='select-payment-tab']");
    if (tabBtn) {
      paymentState.activeTab = tabBtn.dataset.tab;
      triggerRender();
      return;
    }

    // Copy UPI ID
    const copyBtn = e.target.closest("[data-action='copy-upi-id']");
    if (copyBtn) {
      const upi = copyBtn.dataset.upi || "8309897055@ybl";
      navigator.clipboard?.writeText(upi).then(() => {
        showToast("Copied UPI ID: " + upi);
      }).catch(() => {
        showToast("UPI ID: " + upi);
      });
      return;
    }

    // Confirm payment and unlock files
    const confirmBtn = e.target.closest("[data-action='confirm-payment-unlock']");
    if (confirmBtn) {
      const method = confirmBtn.dataset.method || "PhonePe/UPI";
      const paymentData = {
        method,
        paymentId: "PAY_" + Date.now().toString(36).toUpperCase()
      };
      const unlocked = unlockDesignsAfterPayment(paymentState.orderRef, paymentState.items, paymentData);
      paymentState.isSuccess = true;
      paymentState.unlockedList = unlocked;
      showToast("🎉 Payment confirmed! Machine files unlocked.");
      triggerRender();
      return;
    }

    // Direct machine file download action
    const dlBtn = e.target.closest("[data-action='download-machine-file']");
    if (dlBtn) {
      const pId = dlBtn.dataset.id;
      const format = dlBtn.dataset.format || "DST";
      downloadMachineFile(pId, format);
      return;
    }
  });
}
