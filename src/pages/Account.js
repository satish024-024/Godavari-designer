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
    <aside style="display: flex; flex-direction: column; gap: 8px; border-right: 1px solid var(--border); padding-right: 24px;">
      ${tabList.map(tab => {
        const isActive = activeTab === tab.key;
        return `
          <button 
            type="button" 
            class="tab-nav-btn ${isActive ? 'active' : ''}" 
            data-tab="${tab.key}"
            style="
              display: flex; 
              align-items: center; 
              gap: 12px; 
              padding: 14px 18px; 
              width: 100%; 
              border: none; 
              border-radius: 6px; 
              font-size: 14px; 
              font-weight: 600; 
              text-align: left; 
              cursor: pointer;
              background: ${isActive ? 'var(--navy)' : 'transparent'};
              color: ${isActive ? '#fff' : 'var(--navy)'};
              transition: all 200ms;
            "
          >
            <span style="display: flex;">${icon(tab.icon, 18)}</span>
            <span>${tab.label}</span>
          </button>
        `;
      }).join("")}

      <hr style="border: 0; border-top: 1px solid var(--border); margin: 16px 0;" />

      <button 
        type="button" 
        id="accountLogoutBtn"
        style="
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 14px 18px; 
          width: 100%; 
          border: 1px solid #ffa39e; 
          border-radius: 6px; 
          font-size: 14px; 
          font-weight: 700; 
          text-align: left; 
          cursor: pointer;
          background: #fff1f0;
          color: #cf1322;
          transition: all 200ms;
        "
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
      <div style="max-width: 1100px; margin: 0 auto;">
        
        <!-- Welcome Header Banner -->
        <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 32px; margin-bottom: 32px; box-shadow: var(--shadow-deep); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
          <div>
            <span style="font-size: 12px; color: var(--gold); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Welcome Back</span>
            <h1 style="font-family: var(--font-serif); font-size: 28px; color: var(--navy); margin: 4px 0 0 0; font-weight: 700;">
              ${escapeHtml(currentUser.name)}
            </h1>
            <p style="color: var(--ink-soft); font-size: 13px; margin: 6px 0 0 0;">${escapeHtml(currentUser.email)}</p>
          </div>
          <div style="background: var(--surface); padding: 8px 16px; border: 1px dashed var(--border); border-radius: 4px; font-size: 12px; font-weight: 600; color: var(--navy);">
            Customer Account ID: <code style="font-family: monospace; font-size: 12px; color: var(--gold);">${currentUser.id.substring(0, 8)}...</code>
          </div>
        </div>

        ${currentUser && currentUser.role === "admin" ? `
          <!-- Admin Access Banner -->
          <div style="
            background: #fafaf9; 
            border: 1px solid var(--gold); 
            border-radius: 8px; 
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
        <div class="account-dashboard-layout" style="display: grid; grid-template-columns: 240px 1fr; gap: 40px; align-items: start;">
          ${sidebarHtml}
          <div class="account-workspace" style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 32px; box-shadow: var(--shadow-deep); min-height: 480px;">
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
      <h2 style="font-family: var(--font-serif); font-size: 22px; color: var(--navy); margin: 0; font-weight: 700; border-bottom: 1px solid var(--border); padding-bottom: 12px;">Dashboard Overview</h2>
      
      <!-- Stats Cards Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px;">
        <div style="background: var(--surface); border: 1px solid var(--border); padding: 20px; border-radius: 6px; text-align: center;">
          <span style="color: var(--ink-soft); font-size: 12px; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 8px;">Embroidery Orders</span>
          <strong style="font-size: 32px; color: var(--navy);">${userOrders.length}</strong>
        </div>
        <div style="background: var(--surface); border: 1px solid var(--border); padding: 20px; border-radius: 6px; text-align: center;">
          <span style="color: var(--ink-soft); font-size: 12px; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 8px;">Digitizing Quotes</span>
          <strong style="font-size: 32px; color: var(--navy);">${userRequests.length}</strong>
        </div>
        <div style="background: var(--surface); border: 1px solid var(--border); padding: 20px; border-radius: 6px; text-align: center;">
          <span style="color: var(--ink-soft); font-size: 12px; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 8px;">Saved Designs</span>
          <strong style="font-size: 32px; color: var(--navy);">${wishlistCount}</strong>
        </div>
      </div>

      <!-- Recent Activity Feed -->
      <div style="display: grid; gap: 16px; margin-top: 10px;">
        <h3 style="font-size: 15px; color: var(--navy); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; border-bottom: 1px dashed var(--border); padding-bottom: 8px; margin: 0;">
          Recent Activity
        </h3>

        ${userActivities.length === 0 ? `
          <p style="color: var(--ink-soft); font-size: 13px; font-style: italic; margin: 0; padding: 12px 0;">No recent activities found.</p>
        ` : `
          <div style="display: grid; gap: 14px; position: relative; padding-left: 12px;">
            <!-- Activity vertical bar -->
            <div style="position: absolute; top: 8px; bottom: 8px; left: 2px; width: 1px; background: var(--border);"></div>

            ${userActivities.map(act => {
              const timeStr = act.timestamp.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit"
              });
              return `
                <div style="display: flex; gap: 16px; align-items: flex-start; position: relative;">
                  <div style="
                    width: 7px; 
                    height: 7px; 
                    border-radius: 50%; 
                    background: var(--gold); 
                    position: absolute; 
                    left: -13px; 
                    top: 6px;
                    border: 2px solid #fff;
                  "></div>
                  
                  <span style="color: var(--navy); display: flex; flex-shrink: 0; margin-top: 2px; color: var(--ink-soft);">
                    ${icon(act.icon, 14)}
                  </span>
                  
                  <div style="flex: 1; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 13px;">
                    <span style="color: var(--navy); font-weight: 500;">${escapeHtml(act.label)}</span>
                    <span style="color: var(--ink-soft); font-size: 11px;">${timeStr}</span>
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
      <h2 style="font-family: var(--font-serif); font-size: 22px; color: var(--navy); margin: 0; font-weight: 700; border-bottom: 1px solid var(--border); padding-bottom: 12px;">Purchase History</h2>

      ${userOrders.length === 0 ? `
        <div style="text-align: center; padding: 48px 0; color: var(--ink-soft); font-size: 14px;">
          You haven't purchased any embroidery designs yet.
          <div style="margin-top: 16px;">
            <a href="#/catalog" class="button button-primary" style="display: inline-flex; text-decoration: none;">Browse Catalog</a>
          </div>
        </div>
      ` : `
        <div style="display: grid; gap: 20px;">
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
              <div style="border: 1px solid var(--border); border-radius: 6px; overflow: hidden; background: #fff;">
                
                <!-- Order Header Block -->
                <div style="background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 20px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 13px;">
                  <div>
                    <span style="color: var(--ink-soft);">Reference:</span>
                    <strong style="color: var(--navy); font-family: monospace; font-size: 14px; margin-left: 4px;">${escapeHtml(order.reference_number)}</strong>
                  </div>
                  <div>
                    <span style="color: var(--ink-soft); margin-right: 12px;">Placed on ${dateStr}</span>
                    <span style="border-radius: 99px; font-size: 11px; font-weight: 700; padding: 2px 8px; text-transform: uppercase; background: ${order.status === 'completed' ? '#f6ffed' : '#fff7e6'}; color: ${order.status === 'completed' ? '#389e0d' : '#d46b08'};">
                      Status: ${escapeHtml(order.status)}
                    </span>
                  </div>
                </div>

                <!-- Order items rows -->
                <div style="padding: 20px; display: grid; gap: 16px;">
                  ${items.map(item => {
                    const product = item.products || {};
                    return `
                      <div style="display: flex; gap: 16px; align-items: center; font-size: 13px;">
                        <img src="${escapeHtml(product.image || 'https://placehold.co/80')}" alt="${escapeHtml(product.title || 'Product')}" style="width: 50px; height: 50px; object-fit: cover; border: 1px solid var(--border); border-radius: 4px;" />
                        <div style="flex: 1;">
                          <strong style="color: var(--navy); display: block;">${escapeHtml(product.title || 'Embroidery Design')}</strong>
                          <span style="color: var(--ink-soft); font-size: 12px;">Format: ${escapeHtml(item.format)}</span>
                        </div>
                        <span style="font-weight: 600; color: var(--navy);">${money(item.price)}</span>
                      </div>
                    `;
                  }).join("")}
                </div>

                <!-- Order Action row -->
                <div style="border-top: 1px dashed var(--border); padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                  <div>
                    <span style="color: var(--ink-soft); font-size: 12px;">Total Paid:</span>
                    <strong style="color: var(--navy); font-size: 15px; margin-left: 4px;">${money(order.total)}</strong>
                  </div>
                  
                  <div style="display: flex; gap: 10px;">
                    <a href="#/track-order?ref=${order.reference_number}" class="button button-secondary" style="min-height: 38px; font-size: 12px; font-weight: 700; padding: 0 16px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                      ${icon("compass", 13)} View Tracking
                    </a>
                    <button type="button" class="button" onclick="reorderOrderItems('${orderItemsPayload}')" style="min-height: 38px; font-size: 12px; font-weight: 700; padding: 0 16px; background: var(--navy); color: #fff; border: none; cursor: pointer; border-radius: 4px; display: inline-flex; align-items: center; gap: 6px;">
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
      <h2 style="font-family: var(--font-serif); font-size: 22px; color: var(--navy); margin: 0; font-weight: 700; border-bottom: 1px solid var(--border); padding-bottom: 12px;">Custom Digitizing Requests</h2>

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
            const artworkUrls = req.artworkAttachment ? req.artworkAttachment.split(", ").filter(Boolean) : [];

            return `
              <div style="border: 1px solid var(--border); border-radius: 6px; background: #fff; padding: 20px; display: grid; gap: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
                  <div>
                    <span style="font-size: 11px; text-transform: uppercase; color: var(--ink-soft); font-weight: 700; display: block;">Quote Reference</span>
                    <strong style="font-family: monospace; font-size: 14px; color: var(--navy);">${escapeHtml(req.referenceNumber)}</strong>
                  </div>
                  <div style="text-align: right;">
                    <span style="font-size: 12px; color: var(--ink-soft); display: block;">Requested on ${dateStr}</span>
                    <span style="border-radius: 99px; font-size: 10px; font-weight: 700; padding: 2px 8px; text-transform: uppercase; background: #b7eb8f; color: #389e0d; display: inline-block; margin-top: 4px;">
                      ${escapeHtml(req.status)}
                    </span>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; font-size: 13px; background: var(--surface); padding: 12px; border-radius: 4px; border: 1px solid var(--border);">
                  <div>
                    <span style="color: var(--ink-soft); display: block; font-size: 11px;">Application</span>
                    <strong style="color: var(--navy);">${escapeHtml(req.projectType)}</strong>
                  </div>
                  <div>
                    <span style="color: var(--ink-soft); display: block; font-size: 11px;">Payment State</span>
                    <strong style="color: var(--navy); text-transform: uppercase;">${escapeHtml(req.paymentStatus)}</strong>
                  </div>
                  <div>
                    <span style="color: var(--ink-soft); display: block; font-size: 11px;">Quote Amount</span>
                    <strong style="color: var(--navy);">${req.quoteAmount ? money(req.quoteAmount) : "Awaiting Quote"}</strong>
                  </div>
                </div>

                <!-- Reference thumbnails -->
                ${artworkUrls.length > 0 ? `
                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${artworkUrls.map(url => `
                      <div style="width: 50px; height: 50px; border: 1px solid var(--border); border-radius: 4px; overflow: hidden;">
                        <img src="${escapeHtml(url)}" style="width:100%; height:100%; object-fit:cover;" />
                      </div>
                    `).join("")}
                  </div>
                ` : ""}

                <div style="display: flex; justify-content: flex-end; border-top: 1px dashed var(--border); padding-top: 14px;">
                  <a href="#/track-order?ref=${req.referenceNumber}" class="button button-secondary" style="min-height: 38px; font-size: 12px; font-weight: 700; padding: 0 16px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
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
      <h2 style="font-family: var(--font-serif); font-size: 22px; color: var(--navy); margin: 0; font-weight: 700; border-bottom: 1px solid var(--border); padding-bottom: 12px;">Saved Designs</h2>

      ${wishlistItems.length === 0 ? `
        <div style="text-align: center; padding: 48px 0; color: var(--ink-soft); font-size: 14px;">
          Your wishlist is empty.
          <div style="margin-top: 16px;">
            <a href="#/catalog" class="button button-primary" style="display: inline-flex; text-decoration: none;">Explore Designs</a>
          </div>
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
          ${wishlistItems.map(prod => `
            <div style="border: 1px solid var(--border); border-radius: 6px; overflow: hidden; display: flex; flex-direction: column; background: #fff; transition: border-color 0.2s;">
              <a href="#/product/${prod.slug}" style="display: block; aspect-ratio: 1/1; position: relative;">
                <img src="${escapeHtml(prod.image)}" alt="${escapeHtml(prod.title)}" style="width: 100%; height: 100%; object-fit: cover;" />
              </a>
              <div style="padding: 14px; display: grid; gap: 6px; flex: 1;">
                <strong style="color: var(--navy); font-size: 14px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${escapeHtml(prod.title)}
                </strong>
                <span style="font-size: 12px; color: var(--ink-soft);">Code: ${escapeHtml(prod.code)}</span>
                <span style="font-weight: 700; color: var(--navy); font-size: 14px; margin-top: 4px;">${money(prod.price)}</span>
                
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-top: 10px; border-top: 1px solid var(--border); padding-top: 8px;">
                  <button type="button" class="button button-primary" data-action="add-cart" data-id="${prod.id}" style="min-height: 32px; font-size: 11px; padding: 0 10px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                    ${icon("shopping-bag", 12)} Add to Cart
                  </button>
                  <button type="button" class="button button-secondary" data-action="toggle-wishlist" data-id="${prod.id}" style="min-height: 32px; padding: 0 8px; display: flex; align-items: center; justify-content: center; color: #cf1322;" title="Remove">
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
      border-radius: 4px; 
      padding: 12px 16px; 
      color: ${profileFormMsgType === 'success' ? '#389e0d' : '#d46b08'}; 
      font-size: 13px; 
      margin-bottom: 20px;
    ">
      ${escapeHtml(profileFormMsg)}
    </div>
  ` : "";

  return `
    <div style="display: grid; gap: 24px;">
      <h2 style="font-family: var(--font-serif); font-size: 22px; color: var(--navy); margin: 0; font-weight: 700; border-bottom: 1px solid var(--border); padding-bottom: 12px;">Profile Settings</h2>

      ${alertHtml}

      <form id="profileUpdateForm" style="display: grid; gap: 20px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy);">
            <span>Full Name</span>
            <input type="text" name="name" value="${escapeHtml(currentUser.name)}" required style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
          </label>

          <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy);">
            <span>Phone Number</span>
            <input type="text" name="phone" value="${escapeHtml(currentUser.phone || '')}" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
          </label>
        </div>

        <div style="border-top: 1px dashed var(--border); padding-top: 16px; display: grid; gap: 16px;">
          <h3 style="font-size: 14px; text-transform: uppercase; color: var(--navy); font-weight: 700; margin: 0;">Default Shipping Address</h3>
          
          <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy);">
            <span>Address Line 1</span>
            <input type="text" name="addressLine1" value="${escapeHtml(currentUser.addressLine1 || '')}" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
          </label>

          <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy);">
            <span>Address Line 2</span>
            <input type="text" name="addressLine2" value="${escapeHtml(currentUser.addressLine2 || '')}" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
          </label>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 16px;">
            <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy);">
              <span>City</span>
              <input type="text" name="city" value="${escapeHtml(currentUser.city || '')}" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
            </label>

            <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy);">
              <span>State / Region</span>
              <input type="text" name="state" value="${escapeHtml(currentUser.state || '')}" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
            </label>

            <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy);">
              <span>Country</span>
              <input type="text" name="country" value="${escapeHtml(currentUser.country || '')}" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
            </label>

            <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy);">
              <span>Postal / Zip Code</span>
              <input type="text" name="postalCode" value="${escapeHtml(currentUser.postalCode || '')}" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
            </label>
          </div>
        </div>

        <div style="border-top: 1px dashed var(--border); padding-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <!-- Forgot Password Trigger -->
          <button type="button" id="triggerPasswordResetBtn" style="border: none; background: none; color: var(--gold); font-size: 13px; font-weight: 700; cursor: pointer; text-decoration: underline; padding: 0;">
            Forgot Password? Send Reset Email
          </button>

          <button type="submit" class="button button-primary" style="min-height: 44px; padding: 0 24px; font-size: 14px; font-weight: 700; border-radius: 4px; border: none; cursor: pointer;">
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
