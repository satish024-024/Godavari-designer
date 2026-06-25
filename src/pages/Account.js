import { site, ui, currentUser, wishlist, addToCart, triggerRender, showToast, logout } from "../services/store.js";
import { orderService, customRequestService, authService } from "../services/supabase.js";
import { escapeHtml, attr, icon, money } from "../utils/helpers.js";

// Local State
let activeTab = "overview"; // 'overview' | 'orders' | 'custom' | 'saved' | 'profile'
let userOrders = [];
let userRequests = [];
let loadingData = false;
let userActivities = [];
let profileFormMsg = "";
let profileFormMsgType = "success";

// Helper to load user-specific records
export async function loadAccountData() {
  if (!currentUser) return;
  loadingData = true;
  profileFormMsg = "";
  try {
    const [orders, requests] = await Promise.all([
      orderService.getUserOrders(),
      customRequestService.getUserCustomRequests()
    ]);
    userOrders = orders || [];
    userRequests = requests || [];

    // Compile Recent Activities dynamically
    const activities = [];

    // 1. Order Placed Activities
    userOrders.forEach(o => {
      activities.push({
        type: "order",
        label: `Placed order ${o.reference_number} for ${money(o.total)}`,
        timestamp: new Date(o.created_at),
        icon: "shopping-bag"
      });
    });

    // 2. Custom Requests Activities
    userRequests.forEach(r => {
      activities.push({
        type: "custom_submit",
        label: `Submitted custom request ${r.referenceNumber} (${r.projectType})`,
        timestamp: new Date(r.createdAt),
        icon: "file-text"
      });

      if (r.status === "Approved") {
        activities.push({
          type: "custom_approved",
          label: `Quote approved for custom request ${r.referenceNumber}`,
          timestamp: new Date(r.updatedAt),
          icon: "check-circle"
        });
      }
    });

    // 3. Wishlist Items
    wishlist.forEach(productId => {
      const prod = site.products.find(p => p.id === productId);
      if (prod) {
        activities.push({
          type: "wishlist",
          label: `Saved design "${prod.title}" to wishlist`,
          timestamp: new Date(), // treat as recent
          icon: "heart"
        });
      }
    });

    // Sort descending by timestamp
    activities.sort((a, b) => b.timestamp - a.timestamp);
    userActivities = activities.slice(0, 5); // display top 5
  } catch (err) {
    console.error("Error loading account data:", err);
  } finally {
    loadingData = false;
    triggerRender();
  }
}

// Global Reorder trigger exposed to window for inline onclick execution
window.reorderOrderItems = (encodedItems) => {
  try {
    const items = JSON.parse(decodeURIComponent(encodedItems));
    if (!items || items.length === 0) return;
    
    items.forEach(item => {
      // Add to store cart
      addToCart(item.product_id || item.productId, item.format || "DST");
    });
    
    ui.cartOpen = true;
    showToast(`${items.length} items added back to your cart!`);
    triggerRender();
  } catch (e) {
    console.error("Reorder action failed:", e);
    showToast("Failed to reorder items.");
  }
};

export function renderAccount() {
  if (!currentUser) {
    return `
      <section class="content-section" style="padding: 120px 24px; text-align: center; background: var(--ivory);">
        <div style="max-width: 440px; margin: 0 auto; display: grid; gap: 16px; justify-items: center;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: #fff; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--navy); margin-bottom: 8px;">
            ${icon("lock", 30)}
          </div>
          <h1 style="font-family: var(--font-serif); font-size: 32px; color: var(--navy); font-weight: 700; margin: 0;">Access Restricted</h1>
          <p style="color: var(--ink-soft); font-size: 14px; line-height: 1.6; margin: 0;">
            Please log in or create an account to view your dashboard, order history, and saved designs.
          </p>
          <a href="#/auth" class="button button-primary" style="margin-top: 12px; display: inline-flex; align-items: center; gap: 8px; font-weight: 700;">
            <span>Go to Sign In</span>
            ${icon("arrow-right", 18)}
          </a>
        </div>
      </section>
    `;
  }

  // Sidebar navigation column
  const tabList = [
    { key: "overview", label: "Dashboard", icon: "layout-dashboard" },
    { key: "orders", label: "My Orders", icon: "shopping-bag" },
    { key: "custom", label: "Custom Requests", icon: "file-text" },
    { key: "saved", label: "Saved Designs", icon: "heart" },
    { key: "profile", label: "Profile Settings", icon: "user-round" }
  ];

  const sidebarHtml = `
    <aside class="account-sidebar-nav">
      ${tabList.map(tab => {
        const isActive = activeTab === tab.key;
        return `
          <button 
            type="button" 
            class="tab-nav-btn ${isActive ? 'active' : ''}" 
            data-tab="${tab.key}"
          >
            <span style="display: flex;">${icon(tab.icon, 18)}</span>
            <span>${tab.label}</span>
          </button>
        `;
      }).join("")}

      <hr style="border: 0; border-top: 1px solid var(--border); margin: 16px 0;" />

      <button 
        type="button" 
        class="account-logout-btn"
        id="accountLogoutBtn"
      >
        <span style="display: flex;">${icon("log-out", 18)}</span>
        <span>Log Out</span>
      </button>
    </aside>
  `;

  // Render active tab workspace
  let tabWorkspaceHtml = "";

  if (loadingData) {
    tabWorkspaceHtml = `
      <div style="text-align: center; padding: 80px 24px;">
        <div class="loading-spinner" style="margin: 0 auto 16px;"></div>
        <p style="color: var(--ink-soft); font-size: 14px;">Syncing with account database...</p>
      </div>
    `;
  } else {
    switch (activeTab) {
      case "overview":
        tabWorkspaceHtml = renderOverviewTab();
        break;
      case "orders":
        tabWorkspaceHtml = renderOrdersTab();
        break;
      case "custom":
        tabWorkspaceHtml = renderCustomTab();
        break;
      case "saved":
        tabWorkspaceHtml = renderSavedTab();
        break;
      case "profile":
        tabWorkspaceHtml = renderProfileTab();
        break;
    }
  }

  return `
    <section class="content-section" style="padding: 120px 24px; background: var(--ivory); min-height: 90vh;">
      <div style="width: min(100%, 1160px); margin: 0 auto;">
        
        <!-- Welcome Header Banner -->
        <div class="account-header-card">
          <div class="account-profile-info">
            <div class="account-avatar-circle">
              ${currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div class="account-meta-details">
              <span class="welcome-text">Welcome Back</span>
              <h1 class="profile-name">
                ${escapeHtml(currentUser.name)}
              </h1>
              <p class="profile-email">${escapeHtml(currentUser.email)}</p>
            </div>
          </div>
          <div class="account-id-badge">
            <span>Customer ID:</span>
            <code>${escapeHtml(currentUser.id.substring(0, 8))}...</code>
            <button type="button" class="copy-id-btn" data-action="copy-id" data-id="${escapeHtml(currentUser.id)}" title="Copy Account ID">
              ${icon("copy", 14)}
            </button>
          </div>
        </div>

        ${currentUser && currentUser.role === "admin" ? `
          <!-- Admin Access Banner -->
          <div style="
            background: #fafaf9; 
            border: 1px solid var(--gold); 
            border-radius: 12px; 
            padding: 24px 32px; 
            margin-bottom: 32px; 
            box-shadow: var(--shadow-deep); 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            flex-wrap: wrap; 
            gap: 16px;
          ">
            <div style="display: flex; align-items: center; gap: 16px;">
              <span style="color: var(--gold); display: flex; flex-shrink: 0;">${icon("shield-check", 24)}</span>
              <div>
                <strong style="font-family: var(--font-serif); font-size: 16px; color: var(--navy); display: block; margin-bottom: 4px;">Administrator Credentials Detected</strong>
                <p style="color: var(--ink-soft); font-size: 13px; margin: 0;">You have full administrative access. Navigate to the Admin Portal to manage the store catalog, orders, and content settings.</p>
              </div>
            </div>
            <a href="#/admin-dashboard" class="button button-primary" style="text-decoration: none; padding: 10px 20px; font-size: 12px; font-weight: 700; border-radius: 4px; display: inline-flex; align-items: center; gap: 8px;">
              <span>Enter Admin Portal</span>
              ${icon("arrow-right", 14)}
            </a>
          </div>
        ` : ""}

        <!-- Dashboard Layout columns -->
        <div class="account-dashboard-layout">
          ${sidebarHtml}
          <div class="account-workspace">
            ${tabWorkspaceHtml}
          </div>
        </div>

      </div>
    </section>
  `;
}

// 1. Overview Dashboard Tab
function renderOverviewTab() {
  const wishlistCount = wishlist.size;

  return `
    <div style="display: grid; gap: 32px;">
      <h2>Dashboard Overview</h2>
      
      <!-- Stats Cards Row -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-icon">${icon("shopping-bag", 18)}</div>
          <span class="stat-card-label">Embroidery Orders</span>
          <strong class="stat-card-number">${userOrders.length}</strong>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon">${icon("file-text", 18)}</div>
          <span class="stat-card-label">Digitizing Quotes</span>
          <strong class="stat-card-number">${userRequests.length}</strong>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon">${icon("heart", 18)}</div>
          <span class="stat-card-label">Saved Designs</span>
          <strong class="stat-card-number">${wishlistCount}</strong>
        </div>
      </div>

      <!-- Recent Activity Feed -->
      <div style="display: grid; gap: 16px; margin-top: 10px;">
        <h3 style="font-size: 14px; color: var(--navy); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; border-bottom: 1px dashed var(--border); padding-bottom: 10px; margin: 0;">
          Recent Activity
        </h3>

        ${userActivities.length === 0 ? `
          <p style="color: var(--ink-soft); font-size: 13.5px; font-style: italic; margin: 0; padding: 12px 0;">No recent activities found.</p>
        ` : `
          <div class="activity-timeline">
            ${userActivities.map(act => {
              const timeStr = act.timestamp.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit"
              });
              return `
                <div class="activity-item">
                  <div class="activity-node"></div>
                  <span class="activity-icon-wrapper">
                    ${icon(act.icon, 14)}
                  </span>
                  <div class="activity-content">
                    <span class="activity-text">${escapeHtml(act.label)}</span>
                    <span class="activity-time">${timeStr}</span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        `}
      </div>

    </div>
  `;
}

// 2. My Orders Tab
function renderOrdersTab() {
  return `
    <div style="display: grid; gap: 24px;">
      <h2>Purchase History</h2>

      ${userOrders.length === 0 ? `
        <div style="text-align: center; padding: 48px 0; color: var(--ink-soft); font-size: 14px;">
          You haven't purchased any embroidery designs yet.
          <div style="margin-top: 16px;">
            <a href="#/catalog" class="button button-primary" style="display: inline-flex; text-decoration: none;">Browse Catalog</a>
          </div>
        </div>
      ` : `
        <div class="order-list">
          ${userOrders.map(order => {
            const dateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric"
            });
            const items = order.order_items || [];

            // URL Encode order items payload for Reorder action
            const orderItemsPayload = encodeURIComponent(JSON.stringify(items));

            return `
              <div class="order-card">
                
                <!-- Order Header Block -->
                <div class="order-header-block">
                  <div class="order-ref">
                    <span>Order Reference:</span>
                    <strong>${escapeHtml(order.reference_number)}</strong>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <span style="color: var(--ink-soft);">Placed on ${dateStr}</span>
                    <span class="order-status-badge ${order.status === 'completed' ? 'completed' : 'pending'}">
                      ${escapeHtml(order.status)}
                    </span>
                  </div>
                </div>

                <!-- Order items rows -->
                <div class="order-items-container">
                  ${items.map(item => {
                    const product = item.products || {};
                    return `
                      <div class="order-item-row">
                        <img src="${escapeHtml(product.image || 'https://placehold.co/80')}" alt="${escapeHtml(product.title || 'Product')}" class="order-item-img" />
                        <div class="order-item-details">
                          <strong class="order-item-title">${escapeHtml(product.title || 'Embroidery Design')}</strong>
                          <span class="order-item-meta">Format: ${escapeHtml(item.format)} | Code: ${escapeHtml(product.code || 'N/A')}</span>
                        </div>
                        <span class="order-item-price">${money(item.price)}</span>
                      </div>
                    `;
                  }).join("")}
                </div>

                <!-- Order Action row -->
                <div class="order-action-block">
                  <div class="order-total-paid">
                    <span>Total Paid:</span>
                    <strong>${money(order.total)}</strong>
                  </div>
                  
                  <div class="order-action-btn-group">
                    <a href="#/track-order?ref=${order.reference_number}" class="button button-secondary" style="min-height: 38px; font-size: 12px; font-weight: 700; padding: 0 16px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; border-radius: 4px;">
                      ${icon("compass", 13)} View Tracking
                    </a>
                    <button type="button" class="button button-primary" onclick="reorderOrderItems('${orderItemsPayload}')" style="min-height: 38px; font-size: 12px; font-weight: 700; padding: 0 16px; border: none; cursor: pointer; border-radius: 4px; display: inline-flex; align-items: center; gap: 6px;">
                      ${icon("rotate-ccw", 13)} Order Again
                    </button>
                  </div>
                </div>

              </div>
            `;
          }).join("")}
        </div>
      `}
    </div>
  `;
}

// 3. Custom Requests Tab
function renderCustomTab() {
  return `
    <div style="display: grid; gap: 24px;">
      <h2>Custom Digitizing Requests</h2>

      ${userRequests.length === 0 ? `
        <div style="text-align: center; padding: 48px 0; color: var(--ink-soft); font-size: 14px;">
          You haven't submitted any custom digitizing requests yet.
          <div style="margin-top: 16px;">
            <a href="#/custom-order" class="button button-primary" style="display: inline-flex; text-decoration: none;">Request Quote</a>
          </div>
        </div>
      ` : `
        <div style="display: grid; gap: 20px;">
          ${userRequests.map(req => {
            const dateStr = new Date(req.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric"
            });
            const isCart = req.requestSource === 'cart_quote';
            const artworkUrls = req.artworkAttachment ? req.artworkAttachment.split(", ").filter(Boolean) : [];
            
            const thumbnailsHtml = isCart 
              ? (req.cartItems || []).map(item => `
                  <div style="width: 54px; height: 54px; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.02);" title="${escapeHtml(item.product_name)}">
                    <img src="${escapeHtml(item.image)}" style="width:100%; height:100%; object-fit:cover;" />
                  </div>
                `).join("")
              : artworkUrls.map(url => `
                  <div style="width: 54px; height: 54px; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.02);">
                    <img src="${escapeHtml(url)}" style="width:100%; height:100%; object-fit:cover;" />
                  </div>
                `).join("");

            return `
              <div class="custom-request-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
                  <div>
                    <span style="font-size: 11px; text-transform: uppercase; color: var(--ink-soft); font-weight: 700; display: block; letter-spacing: 0.05em; margin-bottom: 2px;">Quote Reference</span>
                    <strong style="font-family: monospace; font-size: 14px; color: var(--navy);">${escapeHtml(req.referenceNumber)}</strong>
                  </div>
                  <div style="text-align: right;">
                    <span style="font-size: 12px; color: var(--ink-soft); display: block;">Requested on ${dateStr}</span>
                    <span class="order-status-badge completed" style="margin-top: 4px;">
                      ${escapeHtml(req.status)}
                    </span>
                  </div>
                </div>

                <div class="custom-request-meta-grid">
                  <div class="custom-request-meta-item">
                    <span>${isCart ? "Inquiry Type" : "Application"}</span>
                    <strong>${isCart ? "Cart Quote" : escapeHtml(req.projectType || "Custom")}</strong>
                  </div>
                  <div class="custom-request-meta-item">
                    <span>Payment State</span>
                    <strong style="text-transform: uppercase;">${escapeHtml(req.paymentStatus)}</strong>
                  </div>
                  <div class="custom-request-meta-item">
                    <span>Quote Amount</span>
                    <strong style="font-family: var(--font-serif); font-weight: 700; font-size: 16px;">${req.quoteAmount ? money(req.quoteAmount) : "Awaiting Quote"}</strong>
                  </div>
                </div>

                <!-- Reference thumbnails / Cart items -->
                ${(isCart ? (req.cartItems || []).length > 0 : artworkUrls.length > 0) ? `
                  <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
                    ${thumbnailsHtml}
                  </div>
                ` : ""}

                <div style="display: flex; justify-content: flex-end; border-top: 1px dashed var(--border); padding-top: 16px; margin-top: 16px;">
                  <a href="#/track-order?ref=${req.referenceNumber}" class="button button-secondary" style="min-height: 38px; font-size: 12px; font-weight: 700; padding: 0 16px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; border-radius: 4px;">
                    ${icon("compass", 13)} Track Progress
                  </a>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `}
    </div>
  `;
}

// 4. Saved Designs Tab (Wishlist items)
function renderSavedTab() {
  const wishlistItems = site.products.filter(p => wishlist.has(p.id));

  return `
    <div style="display: grid; gap: 24px;">
      <h2>Saved Designs</h2>

      ${wishlistItems.length === 0 ? `
        <div style="text-align: center; padding: 48px 0; color: var(--ink-soft); font-size: 14px;">
          Your wishlist is empty.
          <div style="margin-top: 16px;">
            <a href="#/catalog" class="button button-primary" style="display: inline-flex; text-decoration: none;">Explore Designs</a>
          </div>
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px;">
          ${wishlistItems.map(prod => `
            <div style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; background: #fff; transition: all 0.2s ease-in-out; box-shadow: 0 2px 8px rgba(0,0,0,0.015);" onmouseover="this.style.borderColor='rgba(200, 161, 90, 0.4)'; this.style.boxShadow='var(--shadow)'" onmouseout="this.style.borderColor='var(--border)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.015)'">
              <a href="#/product/${prod.slug}" style="display: block; aspect-ratio: 1.02/1; position: relative; overflow: hidden; background: var(--surface);">
                <img src="${escapeHtml(prod.image)}" alt="${escapeHtml(prod.title)}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1.0)'" />
              </a>
              <div style="padding: 16px; display: flex; flex-direction: column; gap: 6px; flex: 1;">
                <strong style="color: var(--navy); font-size: 14px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${escapeHtml(prod.title)}
                </strong>
                <span style="font-size: 12px; color: var(--ink-soft);">Code: ${escapeHtml(prod.code)}</span>
                <span style="font-weight: 700; color: var(--navy); font-size: 15px; margin-top: 4px; font-family: var(--font-serif);">${money(prod.price)}</span>
                
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-top: auto; border-top: 1px solid var(--border); padding-top: 12px;">
                  <button type="button" class="button button-primary" data-action="add-cart" data-id="${prod.id}" style="min-height: 34px; font-size: 11px; padding: 0 10px; display: flex; align-items: center; justify-content: center; gap: 6px; border-radius: 4px;">
                    ${icon("shopping-bag", 12)} Add to Cart
                  </button>
                  <button type="button" class="button button-secondary" data-action="toggle-wishlist" data-id="${prod.id}" style="min-height: 34px; padding: 0 10px; display: flex; align-items: center; justify-content: center; color: #cf1322; border-radius: 4px;" title="Remove">
                    ${icon("trash-2", 12)}
                  </button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      `}
    </div>
  `;
}

// 5. Profile Settings Tab
function renderProfileTab() {
  const alertHtml = profileFormMsg ? `
    <div style="
      background: ${profileFormMsgType === 'success' ? '#f6ffed' : '#fff2e8'}; 
      border: 1px solid ${profileFormMsgType === 'success' ? '#b7eb8f' : '#ffbb96'};
      border-radius: 6px; 
      padding: 14px 18px; 
      color: ${profileFormMsgType === 'success' ? '#389e0d' : '#d46b08'}; 
      font-size: 13.5px; 
      margin-bottom: 24px;
    ">
      ${escapeHtml(profileFormMsg)}
    </div>
  ` : "";

  return `
    <div style="display: grid; gap: 24px;">
      <h2>Profile Settings</h2>

      ${alertHtml}

      <form id="profileUpdateForm" class="account-form-grid">
        <div class="account-form-row">
          <label class="account-form-label">
            <span>Full Name</span>
            <input type="text" name="name" class="account-form-input" value="${escapeHtml(currentUser.name)}" required autocomplete="name" />
          </label>

          <label class="account-form-label">
            <span>Phone Number</span>
            <input type="text" name="phone" class="account-form-input" value="${escapeHtml(currentUser.phone || '')}" placeholder="+91 99999 99999" autocomplete="tel" />
          </label>
        </div>

        <div style="border-top: 1px dashed var(--border); padding-top: 20px; display: grid; gap: 18px;">
          <h3 style="font-size: 14px; text-transform: uppercase; color: var(--navy); font-weight: 700; margin: 0; letter-spacing: 0.05em;">Default Shipping Address</h3>
          
          <label class="account-form-label">
            <span>Address Line 1</span>
            <input type="text" name="addressLine1" class="account-form-input" value="${escapeHtml(currentUser.addressLine1 || '')}" placeholder="Street address, company name" autocomplete="address-line1" />
          </label>

          <label class="account-form-label">
            <span>Address Line 2 (Optional)</span>
            <input type="text" name="addressLine2" class="account-form-input" value="${escapeHtml(currentUser.addressLine2 || '')}" placeholder="Apartment, suite, unit, building, floor" autocomplete="address-line2" />
          </label>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 16px;" class="account-form-row">
            <label class="account-form-label">
              <span>City</span>
              <input type="text" name="city" class="account-form-input" value="${escapeHtml(currentUser.city || '')}" autocomplete="address-level2" />
            </label>

            <label class="account-form-label">
              <span>State / Region</span>
              <input type="text" name="state" class="account-form-input" value="${escapeHtml(currentUser.state || '')}" autocomplete="address-level1" />
            </label>

            <label class="account-form-label">
              <span>Country</span>
              <input type="text" name="country" class="account-form-input" value="${escapeHtml(currentUser.country || '')}" autocomplete="country" />
            </label>

            <label class="account-form-label">
              <span>Postal / Zip Code</span>
              <input type="text" name="postalCode" class="account-form-input" value="${escapeHtml(currentUser.postalCode || '')}" autocomplete="postal-code" />
            </label>
          </div>
        </div>

        <div style="border-top: 1px dashed var(--border); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <!-- Forgot Password Trigger -->
          <button type="button" id="triggerPasswordResetBtn" style="border: none; background: none; color: var(--gold); font-size: 13.5px; font-weight: 700; cursor: pointer; text-decoration: underline; padding: 0;">
            Forgot Password? Send Reset Email
          </button>

          <button type="submit" class="button button-primary" style="min-height: 44px; padding: 0 28px; font-size: 14px; font-weight: 700; border-radius: 4px; border: none; cursor: pointer;">
            Save Profile Updates
          </button>
        </div>
      </form>
    </div>
  `;
}

// Bind Page Delegates
export function initAccountDelegates() {
  // Tab switcher
  document.querySelectorAll("[data-tab]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const target = e.currentTarget.dataset.tab;
      if (target) {
        activeTab = target;
        profileFormMsg = "";
        triggerRender();
      }
    });
  });

  // Copy Customer ID action
  const copyBtn = document.querySelector("[data-action='copy-id']");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const textToCopy = copyBtn.dataset.id;
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast("Customer Account ID copied to clipboard!");
      }).catch(err => {
        console.error("Copy failed: ", err);
      });
    });
  }

  // Logout button
  const logoutBtn = document.getElementById("accountLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await logout();
      window.location.hash = "#/";
    });
  }

  // Profile update submit
  const profileForm = document.getElementById("profileUpdateForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(profileForm);
      const submitBtn = profileForm.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;

      const name = formData.get("name");
      const phone = formData.get("phone");
      const addressFields = {
        addressLine1: formData.get("addressLine1"),
        addressLine2: formData.get("addressLine2"),
        city: formData.get("city"),
        state: formData.get("state"),
        country: formData.get("country"),
        postalCode: formData.get("postalCode")
      };

      try {
        const { updateUserProfile } = await import("../services/store.js");
        const success = await updateUserProfile(name, phone, addressFields);
        if (success) {
          profileFormMsg = "Profile information updated successfully.";
          profileFormMsgType = "success";
        } else {
          profileFormMsg = "Failed to update profile settings.";
          profileFormMsgType = "error";
        }
      } catch (err) {
        profileFormMsg = `Error: ${err.message}`;
        profileFormMsgType = "error";
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        triggerRender();
      }
    });
  }

  // Password reset trigger
  const resetBtn = document.getElementById("triggerPasswordResetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      resetBtn.disabled = true;
      resetBtn.innerText = "Sending Reset Link...";
      try {
        await authService.sendPasswordResetEmail(currentUser.email);
        profileFormMsg = `Password reset instructions sent to ${currentUser.email}`;
        profileFormMsgType = "success";
      } catch (err) {
        profileFormMsg = `Error: ${err.message}`;
        profileFormMsgType = "error";
      } finally {
        resetBtn.disabled = false;
        resetBtn.innerText = "Forgot Password? Send Reset Email";
        triggerRender();
      }
    });
  }
}
