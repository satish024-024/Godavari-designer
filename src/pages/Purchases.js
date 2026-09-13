/**
 * Godavari Designers - Customer Purchases & Order Details Views
 * Implements #/account/purchases and #/account/purchases/:purchaseId
 */

import { currentUser, showToast, triggerRender } from "../services/store.js";
import { downloadDesignFile } from "../services/paymentService.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

let purchasesCache = null;
let isLoadingPurchases = false;

export async function loadCustomerPurchases() {
  if (isLoadingPurchases) return;
  isLoadingPurchases = true;
  try {
    const { supabase } = await import("../services/supabase.js");
    const sessionRes = await supabase.auth.getSession();
    const token = sessionRes?.data?.session?.access_token;
    if (!token) {
      purchasesCache = [];
      isLoadingPurchases = false;
      return;
    }

    const res = await fetch("/api/purchases", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    purchasesCache = Array.isArray(data.purchases) ? data.purchases : [];
  } catch (err) {
    console.error("loadCustomerPurchases error:", err);
    purchasesCache = [];
  } finally {
    isLoadingPurchases = false;
    triggerRender();
  }
}

export function renderPurchasesHistory() {
  if (!currentUser) {
    return `
      <section class="content-section" style="padding-top: calc(var(--header-height, 70px) + 40px); min-height: 70vh; background: var(--ivory, #f8f6f2); display: grid; place-items: center;">
        <div style="text-align: center; max-width: 400px; padding: 20px;">
          <h2 style="font-family: var(--font-serif, serif); font-size: 24px; color: var(--navy, #111d42); margin-bottom: 8px;">Sign In to View Purchases</h2>
          <p style="font-size: 13.5px; color: var(--ink-soft, rgba(17,29,66,0.72)); margin-bottom: 20px;">Please sign in to access your purchased machine embroidery designs and download licenses.</p>
          <a href="#/auth" class="button button-primary" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 24px; font-size: 13px; font-weight: 700; border-radius: 6px;">Sign In / Register</a>
        </div>
      </section>
    `;
  }

  if (purchasesCache === null) {
    loadCustomerPurchases();
    return `
      <section class="content-section" style="padding-top: calc(var(--header-height, 70px) + 40px); min-height: 70vh; background: var(--ivory, #f8f6f2); padding-bottom: 60px;">
        <div style="width: min(100%, 1100px); margin: 0 auto; padding: 0 16px;">
          <h1 style="font-family: var(--font-serif, serif); font-size: 28px; color: var(--navy, #111d42); margin-bottom: 24px;">My Purchased Designs</h1>
          <div class="shimmer-skeleton" style="height: 80px; border-radius: 10px; margin-bottom: 12px;"></div>
          <div class="shimmer-skeleton" style="height: 80px; border-radius: 10px; margin-bottom: 12px;"></div>
        </div>
      </section>
    `;
  }

  return `
    <section class="content-section" style="padding-top: calc(var(--header-height, 70px) + 30px); min-height: 75vh; background: var(--ivory, #f8f6f2); padding-bottom: 60px;">
      <div style="width: min(100%, 1100px); margin: 0 auto; padding: 0 16px;">
        
        <!-- Breadcrumbs -->
        <div class="breadcrumbs" style="padding: 12px 0 16px; font-size: 12px; color: var(--ink-soft, rgba(17,29,66,0.72)); display: flex; gap: 6px;">
          <a href="#/" style="color: inherit; text-decoration: none;">Home</a>
          <span>&gt;</span>
          <a href="#/account" style="color: inherit; text-decoration: none;">Account</a>
          <span>&gt;</span>
          <span style="color: var(--navy, #111d42); font-weight: 600;">Purchased Designs</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 24px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h1 style="font-family: var(--font-serif, serif); font-size: 32px; color: var(--navy, #111d42); margin: 0 0 4px; font-weight: 700;">
              My Purchased Designs
            </h1>
            <span style="font-size: 13px; color: var(--ink-soft, rgba(17,29,66,0.72));">
              Lifetime access to commercial DST & PES machine files
            </span>
          </div>
          <button type="button" data-action="refresh-purchases" class="button button-secondary" style="font-size: 12px; font-weight: 600; height: 36px; padding: 0 14px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px;">
            ${icon("refresh-cw", 13)}
            <span>Refresh</span>
          </button>
        </div>

        ${purchasesCache.length === 0 ? `
          <!-- Empty State -->
          <div style="background: #fff; border: 1px solid var(--border, #e6ded1); border-radius: 12px; padding: 48px 24px; text-align: center; max-width: 480px; margin: 40px auto;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--surface, #efe8dd); color: var(--navy, #111d42); display: grid; place-items: center; margin: 0 auto 16px;">
              ${icon("shopping-bag", 24)}
            </div>
            <h3 style="font-family: var(--font-serif, serif); font-size: 20px; color: var(--navy, #111d42); margin: 0 0 8px;">No Designs Purchased Yet</h3>
            <p style="font-size: 13px; color: var(--ink-soft, rgba(17,29,66,0.72)); margin: 0 0 20px; line-height: 1.5;">
              Discover our library of bridal, royal flora, and cutwork machine embroidery patterns.
            </p>
            <a href="#/catalog" class="button button-primary" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; height: 42px; padding: 0 20px; font-size: 12.5px; font-weight: 700; border-radius: 6px;">
              Explore Design Library
            </a>
          </div>
        ` : `
          <!-- Purchase Cards Grid -->
          <div style="display: grid; gap: 14px;">
            ${purchasesCache.map(item => {
              const p = item.product || {};
              const isPaid = item.status === "PAID";
              const formattedDate = new Date(item.paid_at || item.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
              });

              return `
                <div style="background: #fff; border: 1px solid var(--border, #e6ded1); border-radius: 10px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; box-shadow: 0 4px 16px rgba(17,29,66,0.03);">
                  
                  <!-- Left: Product info -->
                  <div style="display: flex; gap: 14px; align-items: center; min-width: 260px; flex: 1;">
                    <div style="width: 68px; height: 68px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border, #e6ded1); background: var(--surface, #efe8dd); flex-shrink: 0;">
                      <img src="${attr(mediaUrl(p.image || '/banner.jpeg'))}" alt="${attr(p.title || 'Design')}" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                    <div style="overflow: hidden;">
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                        <span style="font-size: 10px; font-weight: 700; color: var(--gold, #c8a15a); background: rgba(200, 161, 90, 0.12); padding: 1px 6px; border-radius: 3px;">
                          ${escapeHtml(p.code || "GD-DESIGN")}
                        </span>
                        <span style="font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 3px; ${isPaid ? 'color: #52c41a; background: #f6ffed; border: 1px solid #b7eb8f;' : 'color: #faad14; background: #fffbe6; border: 1px solid #ffe58f;'}">
                          ${escapeHtml(item.status)}
                        </span>
                      </div>
                      <h4 style="font-family: var(--font-serif, serif); font-size: 17px; margin: 0 0 2px; color: var(--navy, #111d42); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${escapeHtml(p.title || "Embroidery Design")}
                      </h4>
                      <span style="font-size: 11.5px; color: var(--ink-soft, rgba(17,29,66,0.72));">
                        Purchased on ${escapeHtml(formattedDate)} • <strong>${money(item.amount)}</strong>
                      </span>
                    </div>
                  </div>

                  <!-- Right: Action Buttons -->
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    ${isPaid ? `
                      <button 
                        type="button" 
                        class="button button-primary" 
                        data-action="download-dst" 
                        data-id="${attr(item.product_id)}" 
                        style="height: 38px; padding: 0 14px; font-size: 12px; font-weight: 700; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; background: var(--navy, #111d42); color: #fff;"
                      >
                        ${icon("download", 14)}
                        <span>.DST</span>
                      </button>
                      <button 
                        type="button" 
                        class="button button-primary" 
                        data-action="download-pes" 
                        data-id="${attr(item.product_id)}" 
                        style="height: 38px; padding: 0 14px; font-size: 12px; font-weight: 700; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; background: var(--navy, #111d42); color: #fff;"
                      >
                        ${icon("download", 14)}
                        <span>.PES</span>
                      </button>
                    ` : `
                      <a href="#/payment/pending?purchaseId=${encodeURIComponent(item.id)}" class="button button-secondary" style="text-decoration: none; height: 38px; padding: 0 14px; font-size: 12px; font-weight: 600; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px;">
                        <span>View Status</span>
                      </a>
                    `}
                    <a href="#/account/purchases/${encodeURIComponent(item.id)}" class="button button-secondary" style="text-decoration: none; height: 38px; padding: 0 12px; font-size: 12px; font-weight: 600; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;">
                      ${icon("file-text", 13)}
                      <span>Receipt</span>
                    </a>
                  </div>

                </div>
              `;
            }).join("")}
          </div>
        `}

      </div>
    </section>
  `;
}

export async function renderPurchaseDetail(queryParams = {}, routeParams = {}) {
  const purchaseId = routeParams.purchaseId || queryParams.purchaseId;

  if (!purchaseId) {
    return `<section style="padding: 120px 20px; text-align: center;">Purchase not specified.</section>`;
  }

  // Fetch purchase detail
  let purchaseData = null;
  try {
    const { supabase } = await import("../services/supabase.js");
    const sessionRes = await supabase.auth.getSession();
    const token = sessionRes?.data?.session?.access_token;
    const headers = token ? { "Authorization": `Bearer ${token}` } : {};

    const res = await fetch(`/api/purchases/${encodeURIComponent(purchaseId)}`, { headers });
    if (res.ok) {
      purchaseData = await res.json();
    }
  } catch (e) {
    console.error("renderPurchaseDetail error:", e);
  }

  if (!purchaseData || !purchaseData.purchase) {
    return `
      <section class="content-section" style="padding-top: calc(var(--header-height, 70px) + 40px); min-height: 70vh; background: var(--ivory, #f8f6f2); display: grid; place-items: center;">
        <div style="text-align: center; max-width: 400px; padding: 20px;">
          <h2 style="font-family: var(--font-serif, serif); font-size: 24px; color: var(--navy, #111d42);">Purchase Record Not Found</h2>
          <p style="font-size: 13px; color: var(--ink-soft, rgba(17,29,66,0.72)); margin-bottom: 20px;">Could not retrieve transaction details for this order identifier.</p>
          <a href="#/account/purchases" class="button button-secondary" style="text-decoration: none;">Return to Purchases</a>
        </div>
      </section>
    `;
  }

  const { purchase, product } = purchaseData;
  const isPaid = purchase.status === "PAID";
  const formattedDate = new Date(purchase.paidAt || purchase.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  return `
    <section class="content-section" style="padding-top: calc(var(--header-height, 70px) + 30px); min-height: 80vh; background: var(--ivory, #f8f6f2); padding-bottom: 60px;">
      <div style="width: min(100%, 780px); margin: 0 auto; padding: 0 16px;">
        
        <div class="breadcrumbs" style="padding: 12px 0 16px; font-size: 12px; color: var(--ink-soft, rgba(17,29,66,0.72)); display: flex; gap: 6px;">
          <a href="#/" style="color: inherit; text-decoration: none;">Home</a>
          <span>&gt;</span>
          <a href="#/account/purchases" style="color: inherit; text-decoration: none;">Purchases</a>
          <span>&gt;</span>
          <span style="color: var(--navy, #111d42); font-weight: 600;">${escapeHtml(purchase.orderId || "Order")}</span>
        </div>

        <!-- Receipt Card Container -->
        <div style="background: #fff; border: 1px solid var(--border, #e6ded1); border-radius: 14px; overflow: hidden; box-shadow: 0 16px 50px rgba(17, 29, 66, 0.06);">
          
          <!-- Receipt Header -->
          <div style="padding: 24px 28px; background: var(--navy, #111d42); color: #fff; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--gold, #c8a15a); letter-spacing: 0.1em;">
                Official Digital Receipt
              </span>
              <h2 style="font-family: var(--font-serif, serif); font-size: 24px; margin: 2px 0 0; color: #fff; font-weight: 700;">
                Godavari Designers
              </h2>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,0.7); display: block;">Status</span>
              <span style="font-size: 13px; font-weight: 700; color: ${isPaid ? '#52c41a' : '#faad14'};">
                ${escapeHtml(purchase.status)} ✓
              </span>
            </div>
          </div>

          <!-- Receipt Details -->
          <div style="padding: 28px; display: grid; gap: 24px;">
            
            <!-- Metadata Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; font-size: 12.5px; border-bottom: 1px solid var(--border, #e6ded1); padding-bottom: 20px;">
              <div>
                <span style="color: var(--ink-soft, rgba(17,29,66,0.72)); display: block; margin-bottom: 2px;">Order ID:</span>
                <strong style="font-family: monospace; color: var(--navy, #111d42);">${escapeHtml(purchase.orderId || "N/A")}</strong>
              </div>
              <div>
                <span style="color: var(--ink-soft, rgba(17,29,66,0.72)); display: block; margin-bottom: 2px;">Payment ID:</span>
                <strong style="font-family: monospace; color: var(--navy, #111d42);">${escapeHtml(purchase.paymentId || "N/A")}</strong>
              </div>
              <div>
                <span style="color: var(--ink-soft, rgba(17,29,66,0.72)); display: block; margin-bottom: 2px;">Date & Time:</span>
                <strong style="color: var(--navy, #111d42);">${escapeHtml(formattedDate)}</strong>
              </div>
              <div>
                <span style="color: var(--ink-soft, rgba(17,29,66,0.72)); display: block; margin-bottom: 2px;">Payment Gateway:</span>
                <strong style="color: var(--navy, #111d42);">Razorpay Standard</strong>
              </div>
            </div>

            <!-- Product Row -->
            <div style="display: flex; gap: 18px; align-items: center; background: var(--ivory, #f8f6f2); border: 1px solid var(--border, #e6ded1); border-radius: 10px; padding: 18px;">
              <div style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border, #e6ded1); flex-shrink: 0; background: #fff;">
                <img src="${attr(mediaUrl(product?.image || '/banner.jpeg'))}" alt="${attr(product?.title || 'Design')}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <div style="flex: 1;">
                <div style="font-size: 11px; font-weight: 700; color: var(--gold, #c8a15a); letter-spacing: 0.05em; text-transform: uppercase;">
                  ${escapeHtml(product?.code || "GD-DESIGN")}
                </div>
                <h3 style="font-family: var(--font-serif, serif); font-size: 20px; color: var(--navy, #111d42); margin: 2px 0 6px;">
                  ${escapeHtml(product?.title || "Embroidery Pattern")}
                </h3>
                <span style="font-size: 12px; color: var(--ink-soft, rgba(17,29,66,0.72)); display: block;">
                  Commercial DST & PES Machine Embroidery Stitch Files
                </span>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 12px; color: var(--ink-soft, rgba(17,29,66,0.72)); display: block;">Amount Paid</span>
                <strong style="font-size: 22px; font-family: var(--font-serif, serif); color: var(--navy, #111d42);">${money(purchase.amount)}</strong>
              </div>
            </div>

            <!-- Downloads Section -->
            ${isPaid ? `
              <div style="background: #faf8f5; border: 1px dashed var(--gold, #c8a15a); border-radius: 10px; padding: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
                <div>
                  <strong style="font-size: 14px; color: var(--navy, #111d42); display: block;">Instant Machine File Downloads</strong>
                  <span style="font-size: 12px; color: var(--ink-soft, rgba(17,29,66,0.72));">Downloads are cryptographically signed and secured via single-use grants.</span>
                </div>
                <div style="display: flex; gap: 10px;">
                  <button type="button" class="button button-primary" data-action="download-dst" data-id="${attr(product?.id)}" style="height: 40px; padding: 0 16px; font-size: 12.5px; font-weight: 700; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; background: var(--navy, #111d42); color: #fff;">
                    ${icon("download", 14)}
                    <span>Download .DST</span>
                  </button>
                  <button type="button" class="button button-primary" data-action="download-pes" data-id="${attr(product?.id)}" style="height: 40px; padding: 0 16px; font-size: 12.5px; font-weight: 700; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; background: var(--navy, #111d42); color: #fff;">
                    ${icon("download", 14)}
                    <span>Download .PES</span>
                  </button>
                </div>
              </div>
            ` : ""}

            <!-- Footer Actions -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; pt: 10px;">
              <a href="#/account/purchases" class="button button-secondary" style="text-decoration: none; height: 38px; padding: 0 16px; font-size: 12px; font-weight: 600; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px;">
                ${icon("arrow-left", 13)}
                <span>Back to Purchases</span>
              </a>
              <a href="#/support/payment?orderRef=${attr(purchase.orderId || '')}" style="font-size: 12px; color: var(--ink-soft, rgba(17,29,66,0.72)); text-decoration: underline;">
                Need help with this order?
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  `;
}

export function initPurchasesDelegates() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-action='refresh-purchases']")) {
      purchasesCache = null;
      loadCustomerPurchases();
      return;
    }
  });
}
