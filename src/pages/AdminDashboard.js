import {
  currentUser,
  logout,
  showToast,
  site,
  getCategories,
  saveCategories,
  triggerRender,
  saveSite
} from "../services/store.js";
import { navigate } from "../services/router.js";
import { DB } from "../services/db.js";
import { icon, escapeHtml, attr, mediaUrl } from "../utils/helpers.js";
import {
  productService,
  categoryService,
  collectionService,
  orderService,
  customRequestService,
  testimonialService,
  faqService,
  storageService,
  authService,
  supabase,
  initSupabase
} from "../services/supabase.js";

// ==========================================
// ADMIN NAVIGATION STRUCTURE
// ==========================================

const adminNav = [
  {
    group: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "layout-dashboard", path: "/admin-dashboard" }
    ]
  },
  {
    group: "Catalog",
    items: [
      { id: "products", label: "Products", icon: "package", path: "/admin/products" },
      { id: "categories", label: "Categories", icon: "tag", path: "/admin/categories" },
      { id: "collections", label: "Collections", icon: "layers", path: "/admin/collections" }
    ]
  },
  {
    group: "Commerce",
    items: [
      { id: "orders", label: "Orders", icon: "shopping-bag", path: "/admin/orders" },
      { id: "custom-requests", label: "Custom Requests", icon: "pencil-ruler", path: "/admin/custom-requests" },
      { id: "customers", label: "Customers", icon: "users", path: "/admin/customers" }
    ]
  },
  {
    group: "Content",
    items: [
      { id: "content", label: "Site Content", icon: "file-text", path: "/admin/content" },
      { id: "testimonials", label: "Testimonials", icon: "message-square", path: "/admin/testimonials" },
      { id: "faqs", label: "FAQs", icon: "help-circle", path: "/admin/faqs" },
      { id: "media", label: "Media Library", icon: "image", path: "/admin/media" }
    ]
  },
  {
    group: "System",
    items: [
      { id: "settings", label: "Settings", icon: "settings", path: "/admin/settings" }
    ]
  }
];

// ==========================================
// LOCAL ADMIN STATE
// ==========================================

let stats = { orders: 0, requests: 0, products: 0, customers: 0 };
let ordersList = [];
let requestsList = [];
let customersList = [];
let categoriesList = [];
let testimonialsList = [];
let faqsList = [];
let mediaList = [];

let loadingStats = false;
let loadingOrders = false;
let loadingRequests = false;
let loadingCustomers = false;
let loadingCategories = false;
let loadingTestimonials = false;
let loadingFaqs = false;
let loadingMedia = false;

let dataLoaded = {
  stats: false,
  orders: false,
  requests: false,
  customers: false,
  categories: false,
  testimonials: false,
  faqs: false,
  media: false
};

// Search and Filtering states
let productSearchQuery = "";
let productFilterCategory = "";
let orderSearchQuery = "";
let requestSearchQuery = "";
let customerSearchQuery = "";

// Creation / editing states
let editingProduct = null;
let isAddingProduct = false;
let isBulkImporting = false;

let editingCategory = null;
let isAddingCategory = false;

let editingCollection = null;
let isAddingCollection = false;

let editingTestimonial = null;
let isAddingTestimonial = false;

let editingFaq = null;
let isAddingFaq = false;

let selectedOrder = null;
let selectedRequest = null;

// ==========================================
// ASYNC DATA LOADER
// ==========================================

function triggerDataLoad(section) {
  initSupabase();

  if (section === "dashboard" && !dataLoaded.stats && !loadingStats) {
    loadingStats = true;
    Promise.all([
      orderService.getOrders().catch(() => []),
      customRequestService.getRequests().catch(() => []),
      productService.getProducts().catch(() => []),
      authService.getProfiles().catch(() => [])
    ]).then(([ords, reqs, prods, custs]) => {
      stats.orders = ords.length;
      stats.requests = reqs.length;
      stats.products = prods.length;
      stats.customers = custs.length;
      ordersList = ords || [];
      requestsList = reqs || [];
      dataLoaded.stats = true;
      loadingStats = false;
      triggerRender();
    }).catch(err => {
      console.error(err);
      loadingStats = false;
    });
  }

  if (section === "orders" && !dataLoaded.orders && !loadingOrders) {
    loadingOrders = true;
    orderService.getOrders().then(data => {
      ordersList = data || [];
      dataLoaded.orders = true;
      loadingOrders = false;
      triggerRender();
    }).catch(err => {
      console.error(err);
      loadingOrders = false;
    });
  }

  if (section === "custom-requests" && !dataLoaded.requests && !loadingRequests) {
    loadingRequests = true;
    customRequestService.getRequests().then(data => {
      requestsList = data || [];
      dataLoaded.requests = true;
      loadingRequests = false;
      triggerRender();
    }).catch(err => {
      console.error(err);
      loadingRequests = false;
    });
  }

  if (section === "customers" && !dataLoaded.customers && !loadingCustomers) {
    loadingCustomers = true;
    authService.getProfiles().then(data => {
      customersList = data || [];
      dataLoaded.customers = true;
      loadingCustomers = false;
      triggerRender();
    }).catch(err => {
      console.error(err);
      loadingCustomers = false;
    });
  }

  if (section === "categories" && !dataLoaded.categories && !loadingCategories) {
    loadingCategories = true;
    categoryService.getCategories().then(data => {
      categoriesList = data || [];
      dataLoaded.categories = true;
      loadingCategories = false;
      triggerRender();
    }).catch(err => {
      console.error(err);
      loadingCategories = false;
    });
  }

  if (section === "testimonials" && !dataLoaded.testimonials && !loadingTestimonials) {
    loadingTestimonials = true;
    testimonialService.getTestimonials().then(data => {
      testimonialsList = data || [];
      dataLoaded.testimonials = true;
      loadingTestimonials = false;
      triggerRender();
    }).catch(err => {
      console.error(err);
      loadingTestimonials = false;
    });
  }

  if (section === "faqs" && !dataLoaded.faqs && !loadingFaqs) {
    loadingFaqs = true;
    faqService.getFaqs().then(data => {
      faqsList = data || [];
      dataLoaded.faqs = true;
      loadingFaqs = false;
      triggerRender();
    }).catch(err => {
      console.error(err);
      loadingFaqs = false;
    });
  }

  if (section === "media" && !dataLoaded.media && !loadingMedia) {
    loadingMedia = true;
    supabase.storage.from('media-library').list('images', { limit: 100, sortBy: { column: 'name', order: 'asc' } })
      .then(({ data, error }) => {
        if (error) throw error;
        mediaList = data || [];
        dataLoaded.media = true;
        loadingMedia = false;
        triggerRender();
      }).catch(err => {
        console.error("Error listing media:", err);
        loadingMedia = false;
      });
  }
}

function resetLoadedState() {
  dataLoaded = {
    stats: false,
    orders: false,
    requests: false,
    customers: false,
    categories: false,
    testimonials: false,
    faqs: false,
    media: false
  };
}

// ==========================================
// RENDER HELPERS
// ==========================================

function getActiveSection(params) {
  return params.adminSection || "dashboard";
}

function renderSidebar(activeSection) {
  const navItems = adminNav.map((group) => {
    const groupItems = group.items.map((item) => {
      const isActive = item.id === activeSection;
      return `
        <a
          href="#${item.path}"
          class="admin-nav-item${isActive ? " active" : ""}"
          data-admin-nav="${item.id}"
          aria-current="${isActive ? "page" : "false"}"
        >
          <span class="admin-nav-icon"><i data-lucide="${item.icon}"></i></span>
          <span class="admin-nav-label">${item.label}</span>
        </a>
      `;
    }).join("");

    return `
      <div class="admin-nav-group">
        <span class="admin-nav-group-label">${group.group}</span>
        ${groupItems}
      </div>
    `;
  }).join("");

  return `
    <aside class="admin-sidebar" id="adminSidebar">
      <div class="admin-sidebar-header">
        <div class="admin-brand">
          <span class="admin-brand-symbol">✦</span>
          <div class="admin-brand-text">
            <span class="admin-brand-name">Godavari</span>
            <span class="admin-brand-role">Admin Portal</span>
          </div>
        </div>
      </div>
      <nav class="admin-nav" aria-label="Admin Navigation">
        ${navItems}
      </nav>
      <div class="admin-sidebar-footer">
        <a href="#/account" class="admin-user-card" title="View Profile Settings" style="text-decoration: none;">
          <div class="admin-user-avatar">
            ${currentUser ? currentUser.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div class="admin-user-info">
            <span class="admin-user-name">${currentUser ? currentUser.name : "Admin"}</span>
            <span class="admin-user-email">${currentUser ? currentUser.email : ""}</span>
          </div>
        </a>
        <button class="admin-logout-btn" id="adminLogoutBtn" aria-label="Logout">
          <i data-lucide="log-out"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  `;
}

// ==========================================
// MODULE RENDERERS
// ==========================================

function renderDashboardOverview() {
  const recentOrders = ordersList.slice(0, 5);
  const recentRequests = requestsList.slice(0, 5);

  return `
    <div class="admin-module">
      <div class="admin-module-header">
        <h1 class="admin-module-title">Dashboard Overview</h1>
        <p class="admin-module-subtitle">Welcome back, ${currentUser ? currentUser.name : "Admin"}. Here is a snapshot of your storefront.</p>
      </div>

      <div class="admin-stats-grid">
        <div class="admin-stat-card">
          <div class="admin-stat-icon"><i data-lucide="shopping-bag"></i></div>
          <div class="admin-stat-body">
            <span class="admin-stat-label">Total Orders</span>
            <span class="admin-stat-value">${loadingStats ? "..." : stats.orders}</span>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon"><i data-lucide="pencil-ruler"></i></div>
          <div class="admin-stat-body">
            <span class="admin-stat-label">Custom Requests</span>
            <span class="admin-stat-value">${loadingStats ? "..." : stats.requests}</span>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon"><i data-lucide="package"></i></div>
          <div class="admin-stat-body">
            <span class="admin-stat-label">Products</span>
            <span class="admin-stat-value">${loadingStats ? "..." : stats.products}</span>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon"><i data-lucide="users"></i></div>
          <div class="admin-stat-body">
            <span class="admin-stat-label">Customers</span>
            <span class="admin-stat-value">${loadingStats ? "..." : stats.customers}</span>
          </div>
        </div>
      </div>

      <!-- Recent Orders Section -->
      <div style="margin-top: 40px;">
        <h2 style="font-family: var(--font-serif); font-size: 20px; color: var(--navy); margin: 0 0 16px;">Recent Orders</h2>
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th style="text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${recentOrders.map(o => `
                <tr>
                  <td><strong>${escapeHtml(o.reference_number || o.id.slice(0, 8).toUpperCase())}</strong></td>
                  <td>
                    <div style="font-weight:600;">${escapeHtml(o.customer_name || "Guest")}</div>
                    <div style="font-size:11px; color:rgba(17,29,66,0.5);">${escapeHtml(o.customer_email || "")}</div>
                  </td>
                  <td>${new Date(o.created_at).toLocaleDateString()}</td>
                  <td><strong>$${o.total}</strong></td>
                  <td><span class="admin-pill ${o.payment_status === 'paid' ? 'admin-pill-success' : 'admin-pill-danger'}">${o.payment_status}</span></td>
                  <td><span class="admin-pill admin-pill-gold">${o.status}</span></td>
                  <td style="text-align: center;">
                    <button class="admin-btn admin-btn-secondary view-order-details-btn" data-id="${o.id}">
                      View Details
                    </button>
                  </td>
                </tr>
              `).join("")}
              ${recentOrders.length === 0 ? `
                <tr>
                  <td colspan="7" style="padding: 30px; text-align: center; color: rgba(17,29,66,0.5);">No orders placed recently.</td>
                </tr>
              ` : ""}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Custom Requests & Inquiries Section -->
      <div style="margin-top: 40px;">
        <h2 style="font-family: var(--font-serif); font-size: 20px; color: var(--navy); margin: 0 0 16px;">Recent Custom Requests & Inquiries</h2>
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Source</th>
                <th>Date</th>
                <th>Details / Type</th>
                <th>Status</th>
                <th style="text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${recentRequests.map(r => {
                const isCart = r.requestSource === 'cart_quote';
                const sourceLabel = isCart ? 'Cart Quote' : 'Custom Order';
                const sourceStyle = isCart 
                  ? 'background: rgba(56, 125, 255, 0.1); color: #387dff; border: 1px solid rgba(56, 125, 255, 0.2);' 
                  : 'background: rgba(200, 161, 90, 0.12); color: var(--gold); border: 1px solid rgba(200, 161, 90, 0.2);';
                const detailVal = isCart 
                  ? `<strong>${(r.cartItems || []).length} items</strong>` 
                  : escapeHtml(r.projectType || 'Custom');
                const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—';
                return `
                  <tr>
                    <td><strong>${escapeHtml(r.referenceNumber || r.id.slice(0, 8).toUpperCase())}</strong></td>
                    <td>
                      <div style="font-weight:600;">${escapeHtml(r.name)}</div>
                      <div style="font-size:11px; color:rgba(17,29,66,0.5);">${escapeHtml(r.email)}</div>
                    </td>
                    <td>
                      <span class="admin-pill" style="${sourceStyle}">${sourceLabel}</span>
                    </td>
                    <td>${dateStr}</td>
                    <td>${detailVal}</td>
                    <td><span class="admin-pill admin-pill-gold">${r.status}</span></td>
                    <td style="text-align: center;">
                      <a href="#/admin/custom-requests" class="admin-btn admin-btn-secondary view-request-details-btn" data-id="${r.id}">
                        Review & Quote
                      </a>
                    </td>
                  </tr>
                `;
              }).join("")}
              ${recentRequests.length === 0 ? `
                <tr>
                  <td colspan="7" style="padding: 30px; text-align: center; color: rgba(17,29,66,0.5);">No requests received recently.</td>
                </tr>
              ` : ""}
            </tbody>
          </table>
        </div>
      </div>

      <div class="admin-quick-links" style="margin-top: 40px;">
        <h2 class="admin-quick-links-title">Quick Access</h2>
        <div class="admin-quick-links-grid">
          ${adminNav.flatMap(g => g.items).filter(i => i.id !== "dashboard").map(item => `
            <a href="#${item.path}" class="admin-quick-link">
              <span class="admin-quick-link-icon"><i data-lucide="${item.icon}"></i></span>
              <span class="admin-quick-link-label">${item.label}</span>
              <span class="admin-quick-link-arrow"><i data-lucide="arrow-right"></i></span>
            </a>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderBulkImportForm() {
  const cats = getCategories();
  const collections = site.collections || [];
  const categoryOptions = cats.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  const collectionOptions = `<option value="">None</option>` + collections.map(col => `<option value="${col.id}">${escapeHtml(col.name)}</option>`).join("");
  
  // Find highest existing code number in site.products
  let highestCodeNumber = 2000;
  site.products.forEach(p => {
    if (p.code) {
      const match = p.code.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > highestCodeNumber) highestCodeNumber = num;
      }
    }
  });
  const nextStartNumber = highestCodeNumber + 1;

  return `
    <div class="admin-module">
      <div style="margin-bottom: 24px;">
        <button class="admin-btn admin-btn-secondary admin-bulk-cancel-btn">
          ${icon("arrow-left", 16)} Back to Catalog
        </button>
      </div>

      <form id="adminBulkImportForm" class="admin-form">
        <div style="grid-column: span 2;">
          <h2 class="admin-form-title">Bulk Upload & Import Designs</h2>
          <p style="font-size: 13px; color: rgba(17,29,66,0.5); margin: 0;">Upload multiple images at once. All designs will inherit the shared details entered below, and their codes will auto-increment.</p>
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="bulkBaseTitle">Base Design Title</label>
          <input type="text" id="bulkBaseTitle" name="baseTitle" required class="admin-form-control" placeholder="e.g. Bridal Blouse Saree, Velvet Border">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="bulkCategoryId">Category</label>
          <select id="bulkCategoryId" name="categoryId" required class="admin-form-control">
            ${categoryOptions}
          </select>
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="bulkCollectionId">Collection (Optional)</label>
          <select id="bulkCollectionId" name="collectionId" class="admin-form-control">
            ${collectionOptions}
          </select>
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="bulkPrice">Price (₹)</label>
          <input type="number" id="bulkPrice" name="price" value="1500" required class="admin-form-control">
        </div>

        <div class="admin-form-group" style="grid-column: span 2;">
          <span class="admin-form-label">Available Machine Formats</span>
          <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 8px;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight:600; cursor:pointer;">
              <input type="checkbox" name="formatOption" value="DST" checked> Tajima (DST)
            </label>
            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight:600; cursor:pointer;">
              <input type="checkbox" name="formatOption" value="PES" checked> Brother (PES)
            </label>
            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight:600; cursor:pointer;">
              <input type="checkbox" name="formatOption" value="EXP" checked> Bernina (EXP)
            </label>
            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight:600; cursor:pointer;">
              <input type="checkbox" name="formatOption" value="JEF" checked> Janome (JEF)
            </label>
            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight:600; cursor:pointer;">
              <input type="checkbox" name="formatOption" value="XXX"> Singer (XXX)
            </label>
          </div>
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="bulkCodePrefix">Code Prefix</label>
          <input type="text" id="bulkCodePrefix" name="codePrefix" value="GD-" required class="admin-form-control" placeholder="e.g. GD-">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="bulkStartNumber">Starting Code Number</label>
          <input type="number" id="bulkStartNumber" name="startNumber" value="${nextStartNumber}" required class="admin-form-control">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="bulkTotalStitchCount">Stitch Count (Default)</label>
          <input type="number" id="bulkTotalStitchCount" name="totalStitchCount" value="28000" class="admin-form-control">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="bulkThreadColors">Thread Colors (Default)</label>
          <input type="number" id="bulkThreadColors" name="threadColors" value="4" class="admin-form-control">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="bulkWidth">Width (mm)</label>
          <input type="number" id="bulkWidth" name="width" value="120" class="admin-form-control">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="bulkHeight">Height (mm)</label>
          <input type="number" id="bulkHeight" name="height" value="120" class="admin-form-control">
        </div>

        <div class="admin-form-group" style="grid-column: span 2;">
          <label class="admin-form-label" for="bulkRecommendedFabrics">Recommended Fabrics (comma-separated)</label>
          <input type="text" id="bulkRecommendedFabrics" name="recommendedFabrics" value="Silk, Velvet, Organza, Cotton" class="admin-form-control">
        </div>

        <div class="admin-form-group" style="grid-column: span 2;">
          <label class="admin-form-label" for="bulkDescription">Description / Features</label>
          <textarea id="bulkDescription" name="description" class="admin-form-control" rows="3" placeholder="e.g. High-density embroidery design optimized for premium blouses.">Premium machine-ready embroidery design.</textarea>
        </div>

        <div class="admin-form-group" style="grid-column: span 2; border: 1px dashed var(--border); padding: 24px; border-radius: 8px; background: #faf8f5;">
          <label class="admin-form-label" for="bulkImagesInput" style="display: block; text-align: center; margin-bottom: 12px; font-weight:700;">Select Images for Upload</label>
          <input type="file" id="bulkImagesInput" multiple accept="image/*" required class="admin-form-control" style="display: block; max-width: 320px; margin: 0 auto;">
          <p style="font-size: 11px; color: rgba(17,29,66,0.5); text-align: center; margin-top: 8px;">Select one or more images. A new design card will be created for each image.</p>
        </div>

        <!-- Real-Time Upload Progress Panel -->
        <div id="bulkUploadProgressPanel" style="display: none; grid-column: span 2; border: 1px solid var(--border); border-radius: 8px; padding: 16px; background: #fff; margin-top: 12px;">
          <h4 style="margin: 0 0 10px; font-family: var(--font-serif); color: var(--navy);">Processing Images...</h4>
          <div style="width: 100%; background: #f0ede9; border-radius: 99px; height: 10px; overflow: hidden; margin-bottom: 12px;">
            <div id="bulkUploadProgressBar" style="width: 0%; background: var(--navy); height: 100%; transition: width 0.3s ease;"></div>
          </div>
          <div id="bulkUploadProgressLog" style="font-size: 12px; font-family: monospace; max-height: 120px; overflow-y: auto; background: #fdfcfb; padding: 10px; border: 1px solid rgba(230,222,209,0.5); border-radius: 4px; line-height: 1.5;"></div>
        </div>

        <div class="admin-form-actions" style="grid-column: span 2; display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; border-top: 1px solid var(--border); padding-top: 20px;">
          <button type="button" class="admin-btn admin-btn-secondary admin-bulk-cancel-btn">Cancel</button>
          <button type="submit" id="adminBulkSubmitBtn" class="admin-btn admin-btn-primary" style="background: var(--navy); border-color: var(--navy);">
            ${icon("upload-cloud", 16)} Start Bulk Import
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderProductsModule() {
  const cats = getCategories();

  if (isBulkImporting) {
    return renderBulkImportForm();
  }
  
  if (isAddingProduct || editingProduct) {
    const isEdit = !!editingProduct;
    const p = editingProduct || {};
    const tagsString = Array.isArray(p.tags) ? p.tags.join(", ") : "";
    const fabricsString = Array.isArray(p.recommendedFabrics) ? p.recommendedFabrics.join(", ") : "Silk, Organza, Velvet";
    
    return `
      <div class="admin-module">
        <div style="margin-bottom: 24px;">
          <button class="admin-btn admin-btn-secondary admin-product-cancel-btn">
            ${icon("arrow-left", 16)} Back to Catalog
          </button>
        </div>

        <form id="adminProductForm" class="admin-form">
          <input type="hidden" name="id" value="${p.id || ''}">
          
          <div style="grid-column: span 2;">
            <h2 class="admin-form-title">${isEdit ? 'Edit Product Design' : 'Add New Product Design'}</h2>
            <p style="font-size: 13px; color: rgba(17,29,66,0.5); margin: 0;">Configure design attributes, file associations, and stitch technical parameters.</p>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="prodTitle">Design Title</label>
            <input type="text" id="prodTitle" name="title" value="${isEdit ? escapeHtml(p.title) : ''}" required class="admin-form-control" placeholder="e.g. Royal Peony Floral">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="prodCode">Design Code</label>
            <input type="text" id="prodCode" name="code" value="${isEdit ? escapeHtml(p.code) : ''}" required class="admin-form-control" placeholder="e.g. JC-1028">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="prodSlug">URL Slug</label>
            <input type="text" id="prodSlug" name="slug" value="${isEdit ? escapeHtml(p.slug) : ''}" required class="admin-form-control" placeholder="e.g. royal-peony-floral">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="prodPrice">Price ($)</label>
            <input type="number" id="prodPrice" name="price" value="${isEdit ? p.price : ''}" required class="admin-form-control" placeholder="e.g. 45">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="prodCategoryId">Category</label>
            <select id="prodCategoryId" name="categoryId" required class="admin-form-control">
              <option value="">Select Category</option>
              ${cats.map(c => `<option value="${c.id}" ${isEdit && p.categoryId === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
            </select>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="prodCollectionId">Collection (Optional)</label>
            <select id="prodCollectionId" name="collectionId" class="admin-form-control">
              <option value="">None</option>
              ${site.collections.map(col => `<option value="${col.id}" ${isEdit && p.collectionId === col.id ? 'selected' : ''}>${escapeHtml(col.title)}</option>`).join('')}
            </select>
          </div>

          <div class="admin-form-group" style="grid-column: span 2;">
            <span class="admin-form-label">Available Machine Formats</span>
            <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 8px;">
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight:600; cursor:pointer;">
                <input type="checkbox" name="formatOption" value="DST" ${!isEdit || (p.machineFormats && p.machineFormats.includes("DST")) ? "checked" : ""}> Tajima (DST)
              </label>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight:600; cursor:pointer;">
                <input type="checkbox" name="formatOption" value="PES" ${!isEdit || (p.machineFormats && p.machineFormats.includes("PES")) ? "checked" : ""}> Brother (PES)
              </label>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight:600; cursor:pointer;">
                <input type="checkbox" name="formatOption" value="EXP" ${!isEdit || (p.machineFormats && p.machineFormats.includes("EXP")) ? "checked" : ""}> Bernina (EXP)
              </label>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight:600; cursor:pointer;">
                <input type="checkbox" name="formatOption" value="JEF" ${!isEdit || (p.machineFormats && p.machineFormats.includes("JEF")) ? "checked" : ""}> Janome (JEF)
              </label>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight:600; cursor:pointer;">
                <input type="checkbox" name="formatOption" value="XXX" ${isEdit && p.machineFormats && p.machineFormats.includes("XXX") ? "checked" : ""}> Singer (XXX)
              </label>
            </div>
          </div>

          <div class="admin-form-group" style="grid-column: span 2;">
            <label class="admin-form-label" for="prodDescription">Description</label>
            <textarea id="prodDescription" name="description" rows="3" class="admin-form-control" placeholder="An exquisite design for...">${isEdit ? escapeHtml(p.description || "") : ''}</textarea>
          </div>

          <div style="grid-column: span 2; border-top: 1px solid var(--border); padding-top: 16px; margin-top: 8px;">
            <h3 style="font-family: var(--font-serif); font-size: 18px; color: var(--gold); margin: 0 0 14px;">Stitch Specifications & Calculation Parameters</h3>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="formBackStitches">Back Stitch Count</label>
            <input type="number" id="formBackStitches" name="backStitchCount" value="${isEdit ? (p.backStitchCount || 0) : 0}" required class="admin-form-control">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="formHandsStitches">Hands Stitch Count</label>
            <input type="number" id="formHandsStitches" name="handStitchCount" value="${isEdit ? (p.handStitchCount || 0) : 0}" required class="admin-form-control">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="formTotalStitches">Total Stitch Count (Auto-Summed)</label>
            <input type="number" id="formTotalStitches" name="totalStitchCount" value="${isEdit ? (p.totalStitchCount || 0) : 0}" readonly class="admin-form-control" style="background:var(--ivory);" title="Auto-calculates as Back + Hands stitches">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="formRpm">Default Running Speed (RPM)</label>
            <input type="number" id="formRpm" name="rpm" value="${isEdit ? (p.rpm || 850) : 850}" required class="admin-form-control">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="formColors">Thread Colors Count</label>
            <input type="number" id="formColors" name="threadColors" value="${isEdit ? (p.threadColors || 0) : 0}" required class="admin-form-control">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="formEstTime">Est. Stitch Time (Mins - Auto-Calculated)</label>
            <input type="number" id="formEstTime" name="estimatedEmbroideryTime" value="${isEdit ? (p.estimatedEmbroideryTime || 0) : 0}" class="admin-form-control">
          </div>

          <div style="grid-column: span 2; border-top: 1px solid var(--border); padding-top: 16px; margin-top: 8px;">
            <h3 style="font-family: var(--font-serif); font-size: 18px; color: var(--gold); margin: 0 0 14px;">Media & Additional Parameters</h3>
          </div>

          <div class="admin-form-group" style="grid-column: span 2;">
            <label class="admin-form-label" for="productImageFile">Design Image</label>
            <div class="image-upload-card" style="border: 2px dashed var(--border); border-radius: 12px; padding: 24px; text-align: center; background: #fff; cursor: pointer; transition: border-color 0.2s; position: relative; margin-top: 6px;">
              <input type="file" id="productImageFile" accept="image/*" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
              <div class="upload-placeholder" style="${isEdit && p.image ? 'display: none;' : 'display: flex; flex-direction: column; align-items: center; gap: 8px;'}">
                ${icon("upload-cloud", 32)}
                <span style="font-size: 13px; font-weight: 500; color: var(--navy);">Click or drag image here to upload design</span>
                <span style="font-size: 11px; color: var(--ink-soft);">PNG, JPG, WEBP up to 10MB</span>
              </div>
              <div class="upload-preview" style="${isEdit && p.image ? 'display: flex; flex-direction: column; align-items: center; gap: 8px;' : 'display: none;'}">
                <img src="${isEdit && p.image ? attr(mediaUrl(p.image)) : ''}" style="max-height: 140px; max-width: 100%; object-fit: contain; border-radius: 6px; border: 1px solid var(--border);">
                <span style="font-size: 12px; color: var(--gold); font-weight: 600;">Click to replace image</span>
              </div>
              <input type="hidden" name="image" value="${isEdit ? escapeHtml(p.image || '') : ''}">
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="prodDifficultyLevel">Difficulty Level</label>
            <select id="prodDifficultyLevel" name="difficultyLevel" class="admin-form-control">
              <option value="Beginner" ${isEdit && p.difficultyLevel === 'Beginner' ? 'selected' : ''}>Beginner</option>
              <option value="Intermediate" ${isEdit && p.difficultyLevel === 'Intermediate' ? 'selected' : (!isEdit ? 'selected' : '')}>Intermediate</option>
              <option value="Advanced" ${isEdit && p.difficultyLevel === 'Advanced' ? 'selected' : ''}>Advanced</option>
            </select>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="prodWidth">Width (mm)</label>
            <input type="number" id="prodWidth" name="width" value="${isEdit ? (p.width || 100) : 100}" required class="admin-form-control">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="prodHeight">Height (mm)</label>
            <input type="number" id="prodHeight" name="height" value="${isEdit ? (p.height || 100) : 100}" required class="admin-form-control">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="prodTags">Tags (comma separated)</label>
            <input type="text" id="prodTags" name="tags" value="${tagsString}" class="admin-form-control" placeholder="e.g. blouse, allover, floral">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="prodRecommendedFabrics">Fabrics (comma separated)</label>
            <input type="text" id="prodRecommendedFabrics" name="recommendedFabrics" value="${fabricsString}" class="admin-form-control" placeholder="e.g. Silk, Organza">
          </div>

          <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border); padding-top: 20px; margin-top: 10px;">
            <button type="button" class="admin-btn admin-btn-secondary admin-product-cancel-btn">
              Cancel
            </button>
            <button type="submit" class="admin-btn admin-btn-primary">
              Save Design
            </button>
          </div>
        </form>
      </div>
    `;
  }
  
  const filteredProducts = site.products.filter(p => {
    const titleMatch = (p.title || "").toLowerCase().includes(productSearchQuery.toLowerCase());
    const codeMatch = (p.code || "").toLowerCase().includes(productSearchQuery.toLowerCase());
    const tagMatch = p.tags && p.tags.some(t => t.toLowerCase().includes(productSearchQuery.toLowerCase()));
    const searchMatch = !productSearchQuery || titleMatch || codeMatch || tagMatch;
    const categoryMatch = !productFilterCategory || p.categoryId === productFilterCategory;
    return searchMatch && categoryMatch;
  });
  
  return `
    <div class="admin-module">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h1 class="admin-module-title">Products Catalog</h1>
          <p class="admin-module-subtitle">View, add, edit, and delete designs in your digital library.</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="adminAddProductBtn" class="admin-btn admin-btn-primary">
            ${icon("plus", 16)} Add Design
          </button>
          <button id="adminBulkImportBtn" class="admin-btn admin-btn-secondary" style="background: var(--navy); color: #fff; border-color: var(--navy);">
            ${icon("files", 16)} Bulk Upload
          </button>
        </div>
      </div>

      <!-- Search & Filters -->
      <div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
        <input 
          type="text" 
          id="adminProductSearch" 
          value="${escapeHtml(productSearchQuery)}" 
          placeholder="Search by title, code, or tags..." 
          class="admin-form-control"
          style="flex: 1; min-width: 250px;"
        >
        <select 
          id="adminProductCategoryFilter" 
          class="admin-form-control"
          style="min-width: 180px;"
        >
          <option value="">All Categories</option>
          ${cats.map(c => `<option value="${c.id}" ${productFilterCategory === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
        </select>
      </div>

      <!-- Products Table -->
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th style="text-align: right;">Price</th>
              <th>Stitches (Back / Hands)</th>
              <th>Emb. Details</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filteredProducts.map(p => {
              const categoryName = p.category || "N/A";
              const formattedStitches = `${p.totalStitchCount ? p.totalStitchCount.toLocaleString() : '0'} (${(p.backStitchCount || 0).toLocaleString()} / ${(p.handStitchCount || 0).toLocaleString()})`;
              
              return `
                <tr>
                  <td style="display: flex; align-items: center; gap: 12px;">
                    <img src="${attr(mediaUrl(p.image))}" alt="" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border);" />
                    <div>
                      <div style="font-weight: 600; color: var(--navy); font-size: 14px;">${escapeHtml(p.title)}</div>
                      <div style="font-size: 11px; color: var(--gold); font-weight: 500; text-transform: uppercase; margin-top: 2px;">${escapeHtml(p.code)}</div>
                    </div>
                  </td>
                  <td>${escapeHtml(categoryName)}</td>
                  <td style="text-align: right; font-weight: 600; color: var(--navy);">$${p.price}</td>
                  <td>${formattedStitches}</td>
                  <td>
                    <div>Speed: <strong>${p.rpm} RPM</strong></div>
                    <div style="font-size: 11px; color: rgba(17,29,66,0.5); margin-top: 2px;">Est: ${p.estimatedEmbroideryTime} mins</div>
                  </td>
                  <td style="text-align: center;">
                    <div style="display: flex; gap: 8px; justify-content: center;">
                      <button class="admin-btn admin-btn-secondary admin-product-edit-btn" data-id="${p.id}">
                        ${icon("edit-2", 12)} Edit
                      </button>
                      <button class="admin-btn admin-btn-danger admin-product-delete-btn" data-id="${p.id}">
                        ${icon("trash-2", 12)} Delete
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
            ${filteredProducts.length === 0 ? `
              <tr>
                <td colspan="6" style="padding: 40px; text-align: center; color: rgba(17,29,66,0.5);">
                  No products found matching your filters.
                </td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCategoriesModule() {
  if (isAddingCategory || editingCategory) {
    const isEdit = !!editingCategory;
    const c = editingCategory || {};
    return `
      <div class="admin-module">
        <div style="margin-bottom: 24px;">
          <button class="admin-btn admin-btn-secondary admin-category-cancel-btn">
            ${icon("arrow-left", 16)} Back to Categories
          </button>
        </div>

        <form id="adminCategoryForm" class="admin-form">
          <input type="hidden" name="id" value="${c.id || ''}">
          <div>
            <h2 class="admin-form-title">${isEdit ? 'Edit Category' : 'Add New Category'}</h2>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="catName">Category Name</label>
            <input type="text" id="catName" name="name" value="${isEdit ? escapeHtml(c.name) : ''}" required class="admin-form-control" placeholder="e.g. Designer Blouses">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="catSlug">Slug</label>
            <input type="text" id="catSlug" name="slug" value="${isEdit ? escapeHtml(c.slug) : ''}" required class="admin-form-control" placeholder="e.g. designer-blouses">
          </div>

          <div class="admin-form-group" style="grid-column: span 2;">
            <label class="admin-form-label" for="catDescription">Description</label>
            <textarea id="catDescription" name="description" rows="3" class="admin-form-control" placeholder="Describe the category...">${isEdit ? escapeHtml(c.description || "") : ''}</textarea>
          </div>

          <div class="admin-form-group" style="grid-column: span 2;">
            <label class="admin-form-label" for="categoryImageFile">Category Image</label>
            <div class="image-upload-card" style="border: 2px dashed var(--border); border-radius: 12px; padding: 24px; text-align: center; background: #fff; cursor: pointer; transition: border-color 0.2s; position: relative; margin-top: 6px;">
              <input type="file" id="categoryImageFile" accept="image/*" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
              <div class="upload-placeholder" style="${isEdit && c.image ? 'display: none;' : 'display: flex; flex-direction: column; align-items: center; gap: 8px;'}">
                ${icon("upload-cloud", 32)}
                <span style="font-size: 13px; font-weight: 500; color: var(--navy);">Click or drag image here to upload category image</span>
                <span style="font-size: 11px; color: var(--ink-soft);">PNG, JPG, WEBP up to 10MB</span>
              </div>
              <div class="upload-preview" style="${isEdit && c.image ? 'display: flex; flex-direction: column; align-items: center; gap: 8px;' : 'display: none;'}">
                <img src="${isEdit && c.image ? attr(mediaUrl(c.image)) : ''}" style="max-height: 140px; max-width: 100%; object-fit: contain; border-radius: 6px; border: 1px solid var(--border);">
                <span style="font-size: 12px; color: var(--gold); font-weight: 600;">Click to replace image</span>
              </div>
              <input type="hidden" name="image" value="${isEdit ? escapeHtml(c.image || '') : ''}">
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="catDisplayOrder">Display Order</label>
            <input type="number" id="catDisplayOrder" name="displayOrder" value="${isEdit ? c.displayOrder : 1}" class="admin-form-control">
          </div>

          <div class="admin-form-group" style="grid-column: span 2; display: flex; flex-direction: row; align-items: center; gap: 8px;">
            <input type="checkbox" id="catFeatured" name="featured" ${c.featured ? 'checked' : ''} style="width: 16px; height: 16px;">
            <label for="catFeatured" class="admin-form-label" style="margin: 0; cursor: pointer;">Featured on Homepage</label>
          </div>

          <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border); padding-top: 20px;">
            <button type="button" class="admin-btn admin-btn-secondary admin-category-cancel-btn">Cancel</button>
            <button type="submit" class="admin-btn admin-btn-primary">Save Category</button>
          </div>
        </form>
      </div>
    `;
  }

  return `
    <div class="admin-module">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="admin-module-title">Categories CMS</h1>
          <p class="admin-module-subtitle">Manage storefront catalog categories.</p>
        </div>
        <button id="adminAddCategoryBtn" class="admin-btn admin-btn-primary">
          ${icon("plus", 16)} Add Category
        </button>
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Display Order</th>
              <th>Featured</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${categoriesList.map(c => `
              <tr>
                <td>
                  <img src="${attr(mediaUrl(c.image))}" alt="" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover; border: 1px solid var(--border);" />
                </td>
                <td><strong>${escapeHtml(c.name)}</strong></td>
                <td><code>${escapeHtml(c.slug)}</code></td>
                <td>${c.displayOrder}</td>
                <td><span class="admin-pill ${c.featured ? 'admin-pill-gold' : 'admin-pill-secondary'}">${c.featured ? 'Yes' : 'No'}</span></td>
                <td style="text-align: center;">
                  <div style="display: flex; gap: 8px; justify-content: center;">
                    <button class="admin-btn admin-btn-secondary edit-category-btn" data-id="${c.id}">Edit</button>
                    <button class="admin-btn admin-btn-danger delete-category-btn" data-id="${c.id}">Delete</button>
                  </div>
                </td>
              </tr>
            `).join("")}
            ${categoriesList.length === 0 ? `
              <tr>
                <td colspan="6" style="padding: 30px; text-align: center; color: rgba(17,29,66,0.5);">No categories found.</td>
              </tr>
            ` : ""}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCollectionsModule() {
  if (isAddingCollection || editingCollection) {
    const isEdit = !!editingCollection;
    const col = editingCollection || {};
    return `
      <div class="admin-module">
        <div style="margin-bottom: 24px;">
          <button class="admin-btn admin-btn-secondary admin-collection-cancel-btn">
            ${icon("arrow-left", 16)} Back to Collections
          </button>
        </div>

        <form id="adminCollectionForm" class="admin-form">
          <input type="hidden" name="id" value="${col.id || ''}">
          <div>
            <h2 class="admin-form-title">${isEdit ? 'Edit Collection' : 'Add New Collection'}</h2>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="colTitle">Collection Title</label>
            <input type="text" id="colTitle" name="title" value="${isEdit ? escapeHtml(col.title) : ''}" required class="admin-form-control" placeholder="e.g. Bridal Collection">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="colSlug">Slug</label>
            <input type="text" id="colSlug" name="slug" value="${isEdit ? escapeHtml(col.slug) : ''}" required class="admin-form-control" placeholder="e.g. bridal">
          </div>

          <div class="admin-form-group" style="grid-column: span 2;">
            <label class="admin-form-label" for="colDescription">Description</label>
            <textarea id="colDescription" name="description" rows="3" class="admin-form-control" placeholder="Description...">${isEdit ? escapeHtml(col.description || "") : ''}</textarea>
          </div>

          <div class="admin-form-group" style="grid-column: span 2;">
            <label class="admin-form-label" for="collectionImageFile">Collection Image</label>
            <div class="image-upload-card" style="border: 2px dashed var(--border); border-radius: 12px; padding: 24px; text-align: center; background: #fff; cursor: pointer; transition: border-color 0.2s; position: relative; margin-top: 6px;">
              <input type="file" id="collectionImageFile" accept="image/*" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
              <div class="upload-placeholder" style="${isEdit && col.image ? 'display: none;' : 'display: flex; flex-direction: column; align-items: center; gap: 8px;'}">
                ${icon("upload-cloud", 32)}
                <span style="font-size: 13px; font-weight: 500; color: var(--navy);">Click or drag image here to upload collection image</span>
                <span style="font-size: 11px; color: var(--ink-soft);">PNG, JPG, WEBP up to 10MB</span>
              </div>
              <div class="upload-preview" style="${isEdit && col.image ? 'display: flex; flex-direction: column; align-items: center; gap: 8px;' : 'display: none;'}">
                <img src="${isEdit && col.image ? attr(mediaUrl(col.image)) : ''}" style="max-height: 140px; max-width: 100%; object-fit: contain; border-radius: 6px; border: 1px solid var(--border);">
                <span style="font-size: 12px; color: var(--gold); font-weight: 600;">Click to replace image</span>
              </div>
              <input type="hidden" name="image" value="${isEdit ? escapeHtml(col.image || '') : ''}">
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="colDisplayOrder">Display Order</label>
            <input type="number" id="colDisplayOrder" name="displayOrder" value="${isEdit ? col.displayOrder : 1}" class="admin-form-control">
          </div>

          <div class="admin-form-group" style="grid-column: span 2; display: flex; flex-direction: row; align-items: center; gap: 8px;">
            <input type="checkbox" id="colFeatured" name="featured" ${col.featured ? 'checked' : ''} style="width: 16px; height: 16px;">
            <label for="colFeatured" class="admin-form-label" style="margin: 0; cursor: pointer;">Featured Collection</label>
          </div>

          <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border); padding-top: 20px;">
            <button type="button" class="admin-btn admin-btn-secondary admin-collection-cancel-btn">Cancel</button>
            <button type="submit" class="admin-btn admin-btn-primary">Save Collection</button>
          </div>
        </form>
      </div>
    `;
  }

  return `
    <div class="admin-module">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="admin-module-title">Collections CMS</h1>
          <p class="admin-module-subtitle">Curate homepage featured collections.</p>
        </div>
        <button id="adminAddCollectionBtn" class="admin-btn admin-btn-primary">
          ${icon("plus", 16)} Add Collection
        </button>
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Slug</th>
              <th>Display Order</th>
              <th>Featured</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${site.collections.map(col => `
              <tr>
                <td>
                  <img src="${attr(mediaUrl(col.image))}" alt="" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover; border: 1px solid var(--border);" />
                </td>
                <td><strong>${escapeHtml(col.title)}</strong></td>
                <td><code>${escapeHtml(col.slug)}</code></td>
                <td>${col.displayOrder}</td>
                <td><span class="admin-pill ${col.featured ? 'admin-pill-gold' : 'admin-pill-secondary'}">${col.featured ? 'Yes' : 'No'}</span></td>
                <td style="text-align: center;">
                  <div style="display: flex; gap: 8px; justify-content: center;">
                    <button class="admin-btn admin-btn-secondary edit-collection-btn" data-id="${col.id}">Edit</button>
                    <button class="admin-btn admin-btn-danger delete-collection-btn" data-id="${col.id}">Delete</button>
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderOrdersModule() {
  if (selectedOrder) {
    const o = selectedOrder;
    const date = new Date(o.created_at).toLocaleString();
    const items = o.order_items || [];
    
    return `
      <div class="admin-module">
        <div style="margin-bottom: 24px;">
          <button class="admin-btn admin-btn-secondary close-order-details-btn">
            ${icon("arrow-left", 16)} Back to Orders
          </button>
        </div>

        <div class="admin-grid-2-1">
          <div class="admin-form" style="padding: 24px;">
            <h2 class="admin-form-title">Order Details</h2>
            <div style="font-size: 13px; color:rgba(17,29,66,0.5); border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:12px;">
              Order Ref: <strong>${escapeHtml(o.reference_number || o.id.slice(0, 8).toUpperCase())}</strong><br>
              Placed on: ${date}
            </div>

            <div style="display: grid; gap: 16px;">
              <div>
                <h3 style="font-size:14px; margin: 0 0 8px; font-weight:700;">Customer Information</h3>
                <p style="margin: 0; font-size:13.5px; line-height:1.6;">
                  Name: <strong>${escapeHtml(o.customer_name || "Guest")}</strong><br>
                  Email: ${escapeHtml(o.customer_email || "N/A")}<br>
                  Phone: ${escapeHtml(o.customer_phone || "N/A")}<br>
                  Shipping Address: ${escapeHtml(o.shipping_address || "N/A")}
                </p>
              </div>

              <div style="border-top:1px solid var(--border); padding-top:16px;">
                <h3 style="font-size:14px; margin: 0 0 12px; font-weight:700;">Order Items</h3>
                <div style="display: grid; gap: 12px;">
                  ${items.map(item => {
                    const prod = item.products || {};
                    return `
                      <div style="display: flex; justify-content: space-between; align-items: center; background:var(--ivory); padding: 12px; border-radius: 6px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                          <img src="${attr(mediaUrl(prod.image))}" style="width: 44px; height: 44px; border-radius: 4px; object-fit:cover;" />
                          <div>
                            <div style="font-weight:600; font-size:13.5px;">${escapeHtml(prod.title || "Deleted Product")}</div>
                            <div style="font-size:11px; color:var(--gold); font-weight:600; text-transform:uppercase;">Code: ${escapeHtml(prod.code || "N/A")}</div>
                            <div style="font-size:11px; color:rgba(17,29,66,0.5);">Format: <strong>${escapeHtml(item.format || "DST")}</strong></div>
                          </div>
                        </div>
                        <div style="font-weight:700; font-size:14px;">$${item.price}</div>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>
            </div>
          </div>

          <!-- Order Status Side Panel -->
          <form id="orderStatusForm" class="admin-form" style="padding:24px;">
            <input type="hidden" name="id" value="${o.id}">
            <h3 style="font-family:var(--font-serif); font-size:18px; margin: 0 0 16px;">Fulfillment & Payment</h3>
            
            <div class="admin-form-group">
              <label class="admin-form-label" for="ordStatus">Order Status</label>
              <select id="ordStatus" name="status" class="admin-form-control">
                <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
                <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>

            <div class="admin-form-group">
              <label class="admin-form-label" for="ordPaymentStatus">Payment Status</label>
              <select id="ordPaymentStatus" name="paymentStatus" class="admin-form-control">
                <option value="pending" ${o.payment_status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="paid" ${o.payment_status === 'paid' ? 'selected' : ''}>Paid</option>
                <option value="refunded" ${o.payment_status === 'refunded' ? 'selected' : ''}>Refunded</option>
              </select>
            </div>

            <div style="margin-top:16px;">
              <button type="submit" class="admin-btn admin-btn-primary" style="width:100%; justify-content:center;">
                Save Status Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  const filteredOrders = ordersList.filter(o => {
    const term = orderSearchQuery.toLowerCase();
    const refMatch = (o.reference_number || "").toLowerCase().includes(term);
    const idMatch = o.id.toLowerCase().includes(term);
    const nameMatch = (o.customer_name || "").toLowerCase().includes(term);
    const emailMatch = (o.customer_email || "").toLowerCase().includes(term);
    return !orderSearchQuery || refMatch || idMatch || nameMatch || emailMatch;
  });

  return `
    <div class="admin-module">
      <div style="margin-bottom: 24px;">
        <h1 class="admin-module-title">Orders Management</h1>
        <p class="admin-module-subtitle">Fulfill customer design purchases and update commerce transactions.</p>
      </div>

      <div style="margin-bottom: 24px;">
        <input 
          type="text" 
          id="adminOrderSearch" 
          value="${escapeHtml(orderSearchQuery)}" 
          placeholder="Search by reference, name, email, or order ID..." 
          class="admin-form-control"
          style="width: 100%; max-width: 480px;"
        >
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filteredOrders.map(o => `
              <tr>
                <td><strong>${escapeHtml(o.reference_number || o.id.slice(0, 8).toUpperCase())}</strong></td>
                <td>
                  <div style="font-weight:600;">${escapeHtml(o.customer_name || "Guest")}</div>
                  <div style="font-size:11px; color:rgba(17,29,66,0.5);">${escapeHtml(o.customer_email || "")}</div>
                </td>
                <td>${new Date(o.created_at).toLocaleDateString()}</td>
                <td><strong>$${o.total}</strong></td>
                <td><span class="admin-pill ${o.payment_status === 'paid' ? 'admin-pill-success' : 'admin-pill-danger'}">${o.payment_status}</span></td>
                <td><span class="admin-pill admin-pill-gold">${o.status}</span></td>
                <td style="text-align: center;">
                  <button class="admin-btn admin-btn-secondary view-order-details-btn" data-id="${o.id}">
                    View Details
                  </button>
                </td>
              </tr>
            `).join("")}
            ${filteredOrders.length === 0 ? `
              <tr>
                <td colspan="7" style="padding: 30px; text-align: center; color: rgba(17,29,66,0.5);">No orders found.</td>
              </tr>
            ` : ""}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCustomRequestsModule() {
  if (selectedRequest) {
    const r = selectedRequest;
    const date = new Date(r.createdAt).toLocaleString();
    
    return `
      <div class="admin-module">
        <div style="margin-bottom: 24px;">
          <button class="admin-btn admin-btn-secondary close-request-details-btn">
            ${icon("arrow-left", 16)} Back to Requests
          </button>
        </div>

        <div class="admin-grid-2-1">
          <div class="admin-form" style="padding: 24px;">
            <h2 class="admin-form-title">${r.requestSource === 'cart_quote' ? 'Cart Quote Inquiry' : 'Custom Digitizing Request'}</h2>
            <div style="font-size: 13px; color:rgba(17,29,66,0.5); border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:12px;">
              Request Ref: <strong>${escapeHtml(r.referenceNumber || r.id.slice(0, 8).toUpperCase())}</strong><br>
              Received on: ${date}
            </div>

            <div style="display: grid; gap: 16px;">
              <div>
                <h3 style="font-size:14px; margin: 0 0 8px; font-weight:700;">Customer Information</h3>
                <p style="margin: 0; font-size:13.5px; line-height:1.6;">
                  Name: <strong>${escapeHtml(r.name)}</strong><br>
                  Email: ${escapeHtml(r.email)}<br>
                  Phone: ${escapeHtml(r.phone || "N/A")}
                </p>
              </div>

              <div style="border-top:1px solid var(--border); padding-top:16px;">
                <h3 style="font-size:14px; margin: 0 0 8px; font-weight:700;">Customer Message / Notes</h3>
                <p style="margin: 0; font-size:13.5px; line-height:1.6;">
                  <em style="color:rgba(17,29,66,0.7); display:block; padding: 10px; background:var(--ivory); border-radius:6px; margin-top:6px;">"${escapeHtml(r.notes || 'No description provided')}"</em>
                </p>
              </div>

              ${r.requestSource === 'cart_quote' ? `
                <div style="border-top:1px solid var(--border); padding-top:16px;">
                  <h3 style="font-size:14px; margin: 0 0 12px; font-weight:700;">Requested Cart Items</h3>
                  <div class="admin-table-wrapper" style="margin-top: 8px;">
                    <table class="admin-table" style="font-size: 12.5px;">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Format</th>
                          <th>Qty</th>
                          <th>Est. Unit Price</th>
                          <th>Est. Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${(r.cartItems || []).map(item => `
                          <tr>
                            <td>
                              <div style="display: flex; align-items: center; gap: 8px;">
                                <img src="${attr(mediaUrl(item.image))}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border);" />
                                <div>
                                  <div style="font-weight: 600;">${escapeHtml(item.product_name)}</div>
                                  <div style="font-size: 10px; color: rgba(17,29,66,0.5);">Slug: ${escapeHtml(item.product_slug)}</div>
                                </div>
                              </div>
                            </td>
                            <td><span class="admin-pill admin-pill-gold" style="font-size: 10px;">${escapeHtml(item.selected_format)}</span></td>
                            <td><strong>${item.quantity}</strong></td>
                            <td>${money(item.unit_price)}</td>
                            <td><strong>${money(item.line_total)}</strong></td>
                          </tr>
                        `).join("")}
                      </tbody>
                    </table>
                  </div>
                </div>
              ` : `
                <div style="border-top:1px solid var(--border); padding-top:16px;">
                  <h3 style="font-size:14px; margin: 0 0 8px; font-weight:700;">Request Details</h3>
                  <p style="margin: 0; font-size:13.5px; line-height:1.6;">
                    Project Type: <strong>${escapeHtml(r.projectType || 'Custom')}</strong>
                  </p>
                </div>

                ${r.artworkAttachment ? `
                  <div style="border-top:1px solid var(--border); padding-top:16px;">
                    <h3 style="font-size:14px; margin: 0 0 12px; font-weight:700;">Artwork Attachment</h3>
                    <a href="${attr(mediaUrl(r.artworkAttachment))}" target="_blank" rel="noopener">
                      <img src="${attr(mediaUrl(r.artworkAttachment))}" style="max-width: 100%; max-height: 280px; border-radius: 8px; border:1px solid var(--border); object-fit:contain;" />
                    </a>
                  </div>
                ` : ""}
              `}
            </div>
          </div>

          <!-- Price Quote form -->
          <form id="customRequestQuoteForm" class="admin-form" style="padding:24px;">
            <input type="hidden" name="id" value="${r.id}">
            <h3 style="font-family:var(--font-serif); font-size:18px; margin: 0 0 16px;">Quote Price & Status</h3>

            <div class="admin-form-group">
              <label class="admin-form-label" for="custQuoteAmount">Quoted Amount ($)</label>
              <input type="number" id="custQuoteAmount" name="quoteAmount" value="${r.quoteAmount || ''}" class="admin-form-control" placeholder="e.g. 150">
            </div>

            <div class="admin-form-group">
              <label class="admin-form-label" for="custRequestStatus">Request Status</label>
              <select id="custRequestStatus" name="status" class="admin-form-control">
                <option value="Submitted" ${r.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                <option value="Quote Sent" ${r.status === 'Quote Sent' ? 'selected' : ''}>Quote Sent</option>
                <option value="Approved" ${r.status === 'Approved' ? 'selected' : ''}>Approved</option>
                <option value="Digitizing" ${r.status === 'Digitizing' ? 'selected' : ''}>Digitizing</option>
                <option value="Production" ${r.status === 'Production' ? 'selected' : ''}>Production</option>
                <option value="Delivered" ${r.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                <option value="Guest Lead" ${r.status === 'Guest Lead' ? 'selected' : ''}>Guest Lead</option>
                <option value="Rejected" ${r.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                <option value="Cancelled" ${r.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>

            <div class="admin-form-group">
              <label class="admin-form-label" for="custPaymentStatus">Payment Status</label>
              <select id="custPaymentStatus" name="paymentStatus" class="admin-form-control">
                <option value="unpaid" ${r.paymentStatus === 'unpaid' ? 'selected' : ''}>Unpaid</option>
                <option value="paid" ${r.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option>
              </select>
            </div>

            <div class="admin-form-group">
              <label class="admin-form-label" for="digitizedDesignFile">Digitized File (PES, DST, EXP, etc.)</label>
              <div class="image-upload-card" style="border: 2px dashed var(--border); border-radius: 8px; padding: 16px; text-align: center; background: #fff; cursor: pointer; transition: border-color 0.2s; position: relative; margin-top: 6px;">
                <input type="file" id="digitizedDesignFile" accept=".pes,.dst,.exp,.jef,.xxx,.pdf,.zip" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
                <div class="upload-placeholder" style="${r.digitizedFile ? 'display: none;' : 'display: flex; flex-direction: column; align-items: center; gap: 6px;'}">
                  ${icon("upload-cloud", 24)}
                  <span style="font-size: 12px; font-weight: 500; color: var(--navy);">Click or drag file to upload design</span>
                  <span style="font-size: 10px; color: var(--ink-soft);">PES, DST, EXP, ZIP etc.</span>
                </div>
                <div class="upload-preview" style="${r.digitizedFile ? 'display: flex; flex-direction: column; align-items: center; gap: 6px;' : 'display: none;'}">
                  ${icon("file-check", 24)}
                  <span style="font-size: 12px; color: var(--navy); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;">
                    ${r.digitizedFile ? r.digitizedFile.split('/').pop() : 'Design file uploaded'}
                  </span>
                  ${r.digitizedFile ? `<a href="${attr(mediaUrl(r.digitizedFile))}" target="_blank" style="font-size: 11px; color: var(--gold); font-weight: bold; text-decoration: underline;" onclick="event.stopPropagation();">Download Current File</a>` : ''}
                </div>
                <input type="hidden" name="digitizedFile" value="${escapeHtml(r.digitizedFile || '')}">
              </div>
            </div>

            <div class="admin-form-group">
              <label class="admin-form-label">Admin Notes</label>
              <textarea name="adminNotes" rows="3" class="admin-form-control" placeholder="Add private notes or instructions...">${escapeHtml(r.adminNotes || '')}</textarea>
            </div>

            <div style="margin-top:16px;">
              <button type="submit" class="admin-btn admin-btn-primary" style="width:100%; justify-content:center;">
                Update Request / Send Quote
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  const filteredRequests = requestsList.filter(r => {
    const term = requestSearchQuery.toLowerCase();
    const refMatch = (r.referenceNumber || "").toLowerCase().includes(term);
    const nameMatch = (r.name || "").toLowerCase().includes(term);
    const emailMatch = (r.email || "").toLowerCase().includes(term);
    return !requestSearchQuery || refMatch || nameMatch || emailMatch;
  });

  return `
    <div class="admin-module">
      <div style="margin-bottom: 24px;">
        <h1 class="admin-module-title">Custom Digitizing & Cart Requests</h1>
        <p class="admin-module-subtitle">Review designs uploaded by customers or cart inquiries, quote prices, and manage order pipeline flow.</p>
      </div>

      <div style="margin-bottom: 24px;">
        <input 
          type="text" 
          id="adminRequestSearch" 
          value="${escapeHtml(requestSearchQuery)}" 
          placeholder="Search by reference, name, or email..." 
          class="admin-form-control"
          style="width: 100%; max-width: 480px;"
        >
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>Source</th>
              <th>Created At</th>
              <th>Details / Type</th>
              <th>Amount Quoted</th>
              <th>Payment</th>
              <th>Status</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRequests.map(r => {
              const isCart = r.requestSource === 'cart_quote';
              const sourceLabel = isCart ? 'Cart Quote' : 'Custom Order';
              const sourceStyle = isCart 
                ? 'background: rgba(56, 125, 255, 0.1); color: #387dff; border: 1px solid rgba(56, 125, 255, 0.2);' 
                : 'background: rgba(200, 161, 90, 0.12); color: var(--gold); border: 1px solid rgba(200, 161, 90, 0.2);';
              const detailVal = isCart 
                ? `<strong>${(r.cartItems || []).length} items</strong>` 
                : escapeHtml(r.projectType || 'Custom');
              const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—';
              return `
                <tr>
                  <td><strong>${escapeHtml(r.referenceNumber || r.id.slice(0, 8).toUpperCase())}</strong></td>
                  <td>
                    <div style="font-weight:600;">${escapeHtml(r.name)}</div>
                    <div style="font-size:11px; color:rgba(17,29,66,0.5);">${escapeHtml(r.email)}</div>
                  </td>
                  <td>
                    <span class="admin-pill" style="${sourceStyle}">${sourceLabel}</span>
                  </td>
                  <td>${dateStr}</td>
                  <td>${detailVal}</td>
                  <td><strong>${r.quoteAmount ? `$${r.quoteAmount}` : "—"}</strong></td>
                  <td><span class="admin-pill ${r.paymentStatus === 'paid' ? 'admin-pill-success' : 'admin-pill-danger'}">${r.paymentStatus || 'unpaid'}</span></td>
                  <td><span class="admin-pill admin-pill-gold">${r.status}</span></td>
                  <td style="text-align: center;">
                    <button class="admin-btn admin-btn-secondary view-request-details-btn" data-id="${r.id}">
                      Review & Quote
                    </button>
                  </td>
                </tr>
              `;
            }).join("")}
            ${filteredRequests.length === 0 ? `
              <tr>
                <td colspan="9" style="padding: 30px; text-align: center; color: rgba(17,29,66,0.5);">No requests found.</td>
              </tr>
            ` : ""}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCustomersModule() {
  const filteredCustomers = customersList.filter(c => {
    const term = customerSearchQuery.toLowerCase();
    const nameMatch = (c.name || "").toLowerCase().includes(term);
    const emailMatch = (c.email || "").toLowerCase().includes(term);
    const phoneMatch = (c.phone || "").toLowerCase().includes(term);
    return !customerSearchQuery || nameMatch || emailMatch || phoneMatch;
  });

  return `
    <div class="admin-module">
      <div style="margin-bottom: 24px;">
        <h1 class="admin-module-title">Customers Directory</h1>
        <p class="admin-module-subtitle">Browse registered customer profiles, contact numbers, and billing registries.</p>
      </div>

      <div style="margin-bottom: 24px;">
        <input 
          type="text" 
          id="adminCustomerSearch" 
          value="${escapeHtml(customerSearchQuery)}" 
          placeholder="Search by name, email, or phone..." 
          class="admin-form-control"
          style="width: 100%; max-width: 480px;"
        >
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Default Address</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            ${filteredCustomers.map(c => `
              <tr>
                <td>
                  <div class="admin-user-avatar" style="width:36px; height:36px; font-size:13px;">
                    ${c.name ? c.name.charAt(0).toUpperCase() : "U"}
                  </div>
                </td>
                <td><strong>${escapeHtml(c.name || "Customer")}</strong></td>
                <td>${escapeHtml(c.email)}</td>
                <td>${escapeHtml(c.phone || "—")}</td>
                <td>
                  ${c.address_line_1 ? `
                    <div style="font-size:12px; line-height:1.4;">
                      ${escapeHtml(c.address_line_1)} ${c.address_line_2 ? escapeHtml(c.address_line_2) : ""}<br>
                      ${escapeHtml(c.city || "")}, ${escapeHtml(c.state || "")} ${escapeHtml(c.postal_code || "")}<br>
                      ${escapeHtml(c.country || "")}
                    </div>
                  ` : "—"}
                </td>
                <td><span class="admin-pill ${c.role === 'admin' ? 'admin-pill-gold' : 'admin-pill-secondary'}">${c.role}</span></td>
              </tr>
            `).join("")}
            ${filteredCustomers.length === 0 ? `
              <tr>
                <td colspan="6" style="padding: 30px; text-align: center; color: rgba(17,29,66,0.5);">No customers registered yet.</td>
              </tr>
            ` : ""}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderContentModule() {
  const b = site.brand || {};
  const c = site.brand.contact || {};
  const h = site.hero || {};
  const ct = site.cta || {};
  const f = site.footer || {};
  
  return `
    <div class="admin-module">
      <div style="margin-bottom: 24px;">
        <h1 class="admin-module-title">Customize Storefront Content</h1>
        <p class="admin-module-subtitle">Edit brand details, contact info (phone, email, address), homepage text, and footer parameters.</p>
      </div>

      <form id="adminSiteContentForm" class="admin-form admin-grid-2-col">
        
        <!-- Section 1: Brand & Contact Info -->
        <div style="grid-column: span 2; border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom:10px;">
          <h2 style="font-family:var(--font-serif); font-size:20px; color:var(--navy); margin:0;">1. Brand & Contact Information</h2>
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="contBrandName">Brand Name</label>
          <input type="text" id="contBrandName" name="brandName" value="${escapeHtml(b.name || '')}" required class="admin-form-control">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="contBrandTagline">Brand Tagline</label>
          <input type="text" id="contBrandTagline" name="brandTagline" value="${escapeHtml(b.tagline || '')}" required class="admin-form-control">
        </div>

        <div class="admin-form-group" style="grid-column: span 2;">
          <label class="admin-form-label" for="contBrandDescriptor">Brand Descriptor</label>
          <textarea id="contBrandDescriptor" name="brandDescriptor" rows="2" required class="admin-form-control">${escapeHtml(b.descriptor || '')}</textarea>
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="contContactEmail">Contact Email Address</label>
          <input type="email" id="contContactEmail" name="contactEmail" value="${escapeHtml(c.email || '')}" required class="admin-form-control">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="contContactPhone">Contact Phone Number</label>
          <input type="text" id="contContactPhone" name="contactPhone" value="${escapeHtml(c.phone || '')}" required class="admin-form-control">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="contContactInstagram">Instagram Handle</label>
          <input type="text" id="contContactInstagram" name="contactInstagram" value="${escapeHtml(c.instagram || '')}" required class="admin-form-control">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="contBrandTrustText">Trust Bar Text</label>
          <input type="text" id="contBrandTrustText" name="brandTrustText" value="${escapeHtml(b.trustText || '')}" required class="admin-form-control">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="contBrandStoryLabel">Watch Story Button Label</label>
          <input type="text" id="contBrandStoryLabel" name="brandStoryLabel" value="${escapeHtml(b.storyLabel || '')}" required class="admin-form-control">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="contBrandQualityTitle">Quality Badge Title</label>
          <input type="text" id="contBrandQualityTitle" name="brandQualityTitle" value="${escapeHtml(b.qualityTitle || '')}" required class="admin-form-control">
        </div>

        <div class="admin-form-group" style="grid-column: span 2;">
          <label class="admin-form-label" for="contBrandQualityText">Quality Badge Description</label>
          <input type="text" id="contBrandQualityText" name="brandQualityText" value="${escapeHtml(b.qualityText || '')}" required class="admin-form-control">
        </div>

        <div class="admin-form-group" style="grid-column: span 2;">
          <label class="admin-form-label" for="contContactAddress">Physical Address</label>
          <input type="text" id="contContactAddress" name="contactAddress" value="${escapeHtml(c.address || '')}" required class="admin-form-control">
        </div>

        <!-- Section 2: Hero Section -->
        <div style="grid-column: span 2; border-bottom:1px solid var(--border); padding-top:20px; padding-bottom:10px; margin-bottom:10px;">
          <h2 style="font-family:var(--font-serif); font-size:20px; color:var(--navy); margin:0;">2. Hero Header Block</h2>
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="contHeroEyebrow">Hero Eyebrow</label>
          <input type="text" id="contHeroEyebrow" name="heroEyebrow" value="${escapeHtml(h.eyebrow || '')}" class="admin-form-control">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="contHeroHeading">Hero Heading Title</label>
          <input type="text" id="contHeroHeading" name="heroHeading" value="${escapeHtml(h.heading || '')}" class="admin-form-control">
        </div>

        <div class="admin-form-group" style="grid-column: span 2;">
          <label class="admin-form-label" for="contHeroSubheading">Hero Subheading</label>
          <input type="text" id="contHeroSubheading" name="heroSubheading" value="${escapeHtml(h.subheading || '')}" class="admin-form-control">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="contHeroPrimaryButton">Primary Button Text</label>
          <input type="text" id="contHeroPrimaryButton" name="heroPrimaryButton" value="${escapeHtml(h.primaryButton || '')}" class="admin-form-control">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="contHeroSecondaryButton">Secondary Button Text</label>
          <input type="text" id="contHeroSecondaryButton" name="heroSecondaryButton" value="${escapeHtml(h.secondaryButton || '')}" class="admin-form-control">
        </div>

        <!-- Section 3: Call To Action (CTA) -->
        <div style="grid-column: span 2; border-bottom:1px solid var(--border); padding-top:20px; padding-bottom:10px; margin-bottom:10px;">
          <h2 style="font-family:var(--font-serif); font-size:20px; color:var(--navy); margin:0;">3. Call To Action (CTA) Section</h2>
        </div>

        <div class="admin-form-group" style="grid-column: span 2;">
          <label class="admin-form-label" for="contCtaHeadline">CTA Headline</label>
          <input type="text" id="contCtaHeadline" name="ctaHeadline" value="${escapeHtml(ct.headline || '')}" class="admin-form-control">
        </div>

        <div class="admin-form-group" style="grid-column: span 2;">
          <label class="admin-form-label" for="contCtaText">CTA Paragraph Text</label>
          <textarea id="contCtaText" name="ctaText" rows="2" class="admin-form-control">${escapeHtml(ct.text || '')}</textarea>
        </div>

        <!-- Section 4: Footer -->
        <div style="grid-column: span 2; border-bottom:1px solid var(--border); padding-top:20px; padding-bottom:10px; margin-bottom:10px;">
          <h2 style="font-family:var(--font-serif); font-size:20px; color:var(--navy); margin:0;">4. Footer Parameters</h2>
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="contFooterNewsletterTitle">Newsletter Title</label>
          <input type="text" id="contFooterNewsletterTitle" name="footerNewsletterTitle" value="${escapeHtml(f.newsletterTitle || '')}" class="admin-form-control">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" for="contFooterNewsletterText">Newsletter Subtitle</label>
          <input type="text" id="contFooterNewsletterText" name="footerNewsletterText" value="${escapeHtml(f.newsletterText || '')}" class="admin-form-control">
        </div>

        <div style="grid-column: span 2; display: flex; justify-content: flex-end; padding-top: 20px; border-top:1px solid var(--border);">
          <button type="submit" class="admin-btn admin-btn-primary" style="padding:12px 30px;">
            Save & Publish Changes
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderTestimonialsModule() {
  if (isAddingTestimonial || editingTestimonial) {
    const isEdit = !!editingTestimonial;
    const t = editingTestimonial || {};
    
    return `
      <div class="admin-module">
        <div style="margin-bottom: 24px;">
          <button class="admin-btn admin-btn-secondary admin-testimonial-cancel-btn">
            ${icon("arrow-left", 16)} Back to Testimonials
          </button>
        </div>

        <form id="adminTestimonialForm" class="admin-form">
          <input type="hidden" name="id" value="${t.id || ''}">
          <div>
            <h2 class="admin-form-title">${isEdit ? 'Edit Testimonial' : 'Add New Testimonial'}</h2>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="testiName">Author Name</label>
            <input type="text" id="testiName" name="name" value="${isEdit ? escapeHtml(t.name) : ''}" required class="admin-form-control" placeholder="e.g. Neha Mehta">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="testiRole">Role / Location</label>
            <input type="text" id="testiRole" name="role" value="${isEdit ? escapeHtml(t.role) : ''}" required class="admin-form-control" placeholder="e.g. Boutique Owner, Mumbai">
          </div>

          <div class="admin-form-group" style="grid-column: span 2;">
            <label class="admin-form-label" for="testiQuote">Review Quote</label>
            <textarea id="testiQuote" name="quote" rows="3" required class="admin-form-control" placeholder="Quote...">${isEdit ? escapeHtml(t.quote) : ''}</textarea>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="testiRating">Rating (1 to 5 Stars)</label>
            <input type="number" id="testiRating" step="0.1" max="5.0" min="1.0" name="rating" value="${isEdit ? t.rating : 5.0}" required class="admin-form-control">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="testiDisplayOrder">Display Order</label>
            <input type="number" id="testiDisplayOrder" name="displayOrder" value="${isEdit ? (t.displayOrder || t.display_order || 1) : 1}" class="admin-form-control">
          </div>

          <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border); padding-top: 20px;">
            <button type="button" class="admin-btn admin-btn-secondary admin-testimonial-cancel-btn">Cancel</button>
            <button type="submit" class="admin-btn admin-btn-primary">Save Testimonial</button>
          </div>
        </form>
      </div>
    `;
  }

  return `
    <div class="admin-module">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="admin-module-title">Customer Testimonials</h1>
          <p class="admin-module-subtitle">Manage customer reviews displayed on the home page reviews wall.</p>
        </div>
        <button id="adminAddTestimonialBtn" class="admin-btn admin-btn-primary">
          ${icon("plus", 16)} Add Testimonial
        </button>
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Role</th>
              <th>Rating</th>
              <th style="width:40%;">Quote</th>
              <th>Order</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${testimonialsList.map(t => `
              <tr>
                <td><strong>${escapeHtml(t.name)}</strong></td>
                <td>${escapeHtml(t.role)}</td>
                <td><strong style="color:var(--gold);">${t.rating} ★</strong></td>
                <td><em style="font-size:12px; line-height:1.4; display:block;">"${escapeHtml(t.quote.slice(0, 100))}${t.quote.length > 100 ? '...' : ''}"</em></td>
                <td>${t.display_order || t.displayOrder || 1}</td>
                <td style="text-align: center;">
                  <div style="display: flex; gap: 8px; justify-content: center;">
                    <button class="admin-btn admin-btn-secondary edit-testimonial-btn" data-id="${t.id}">Edit</button>
                    <button class="admin-btn admin-btn-danger delete-testimonial-btn" data-id="${t.id}">Delete</button>
                  </div>
                </td>
              </tr>
            `).join("")}
            ${testimonialsList.length === 0 ? `
              <tr>
                <td colspan="6" style="padding: 30px; text-align: center; color: rgba(17,29,66,0.5);">No testimonials found.</td>
              </tr>
            ` : ""}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderFAQsModule() {
  if (isAddingFaq || editingFaq) {
    const isEdit = !!editingFaq;
    const f = editingFaq || {};
    
    return `
      <div class="admin-module">
        <div style="margin-bottom: 24px;">
          <button class="admin-btn admin-btn-secondary admin-faq-cancel-btn">
            ${icon("arrow-left", 16)} Back to FAQs
          </button>
        </div>

        <form id="adminFaqForm" class="admin-form">
          <input type="hidden" name="id" value="${f.id || ''}">
          <div>
            <h2 class="admin-form-title">${isEdit ? 'Edit FAQ' : 'Add New FAQ'}</h2>
          </div>

          <div class="admin-form-group" style="grid-column: span 2;">
            <label class="admin-form-label" for="faqQuestion">Question</label>
            <input type="text" id="faqQuestion" name="question" value="${isEdit ? escapeHtml(f.question) : ''}" required class="admin-form-control" placeholder="e.g. What formats do you support?">
          </div>

          <div class="admin-form-group" style="grid-column: span 2;">
            <label class="admin-form-label" for="faqAnswer">Answer</label>
            <textarea id="faqAnswer" name="answer" rows="3" required class="admin-form-control" placeholder="Provide a detailed answer...">${isEdit ? escapeHtml(f.answer) : ''}</textarea>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="faqCategory">Category</label>
            <input type="text" id="faqCategory" name="category" value="${isEdit ? escapeHtml(f.category) : 'General'}" required class="admin-form-control" placeholder="e.g. Formats, Orders, Shipping">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label" for="faqDisplayOrder">Display Order</label>
            <input type="number" id="faqDisplayOrder" name="displayOrder" value="${isEdit ? (f.displayOrder || f.display_order || 1) : 1}" class="admin-form-control">
          </div>

          <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border); padding-top: 20px;">
            <button type="button" class="admin-btn admin-btn-secondary admin-faq-cancel-btn">Cancel</button>
            <button type="submit" class="admin-btn admin-btn-primary">Save FAQ</button>
          </div>
        </form>
      </div>
    `;
  }

  return `
    <div class="admin-module">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="admin-module-title">FAQs CMS</h1>
          <p class="admin-module-subtitle">Manage frequently asked questions categorized by section.</p>
        </div>
        <button id="adminAddFaqBtn" class="admin-btn admin-btn-primary">
          ${icon("plus", 16)} Add FAQ
        </button>
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Question</th>
              <th style="width:40%;">Answer</th>
              <th>Order</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${faqsList.map(f => `
              <tr>
                <td><span class="admin-pill admin-pill-gold">${escapeHtml(f.category)}</span></td>
                <td><strong>${escapeHtml(f.question)}</strong></td>
                <td><span style="font-size:12px; line-height:1.4; display:block;">${escapeHtml(f.answer.slice(0, 100))}${f.answer.length > 100 ? '...' : ''}</span></td>
                <td>${f.display_order || f.displayOrder || 1}</td>
                <td style="text-align: center;">
                  <div style="display: flex; gap: 8px; justify-content: center;">
                    <button class="admin-btn admin-btn-secondary edit-faq-btn" data-id="${f.id}">Edit</button>
                    <button class="admin-btn admin-btn-danger delete-faq-btn" data-id="${f.id}">Delete</button>
                  </div>
                </td>
              </tr>
            `).join("")}
            ${faqsList.length === 0 ? `
              <tr>
                <td colspan="5" style="padding: 30px; text-align: center; color: rgba(17,29,66,0.5);">No FAQs found.</td>
              </tr>
            ` : ""}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderMediaModule() {
  return `
    <div class="admin-module">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 class="admin-module-title">Media Library</h1>
          <p class="admin-module-subtitle">Upload, view, and retrieve public links for catalog assets.</p>
        </div>
        <form id="adminMediaUploadForm" style="display:flex; gap:10px; align-items:center;">
          <input type="file" id="mediaUploadInput" required class="admin-form-control" style="padding:6px; max-width:240px;" accept="image/*" aria-label="Upload image file">
          <button type="submit" class="admin-btn admin-btn-primary">
            ${icon("upload-cloud", 16)} Upload Image
          </button>
        </form>
      </div>

      <!-- Media Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px;">
        ${mediaList.map(item => {
          const publicUrl = supabase.storage.from('media-library').getPublicUrl('images/' + item.name).data.publicUrl;
          return `
            <div style="background:#ffffff; border:1px solid var(--border); border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:8px;">
              <div style="height:120px; border-radius:6px; overflow:hidden; background:var(--ivory); border:1px solid var(--border); display:grid; place-items:center;">
                <img src="${attr(publicUrl)}" style="max-width:100%; max-height:100%; object-fit:contain;" />
              </div>
              <div style="font-size:11.5px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--navy);" title="${escapeHtml(item.name)}">
                ${escapeHtml(item.name)}
              </div>
              <div style="font-size:10px; color:rgba(17,29,66,0.5);">
                ${(item.metadata?.size / 1024).toFixed(1)} KB
              </div>
              <div style="display:flex; gap:6px; margin-top:4px;">
                <button class="admin-btn admin-btn-secondary copy-media-url-btn" data-url="${attr(publicUrl)}" style="padding:6px; font-size:11px; flex:1; justify-content:center;">
                  Copy URL
                </button>
                <button class="admin-btn admin-btn-danger delete-media-btn" data-name="${attr(item.name)}" style="padding:6px; font-size:11px; justify-content:center;">
                  ${icon("trash-2", 12)}
                </button>
              </div>
            </div>
          `;
        }).join("")}
        ${mediaList.length === 0 ? `
          <div style="grid-column: 1 / -1; padding: 60px; text-align: center; color: rgba(17,29,66,0.5); border: 1px dashed var(--border); border-radius:12px;">
            No media library assets uploaded yet.
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

function renderSettingsModule() {
  return `
    <div class="admin-module">
      <div style="margin-bottom: 24px;">
        <h1 class="admin-module-title">System Settings</h1>
        <p class="admin-module-subtitle">Manage backups, reset store data, and configure global variables.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
        <!-- Backup Section -->
        <div class="admin-form" style="padding: 24px; gap:12px;">
          <h3 style="font-family:var(--font-serif); font-size:18px; margin:0 0 4px;">Store Backups</h3>
          <p style="font-size:12.5px; color:rgba(17,29,66,0.6); margin:0;">Download the entire storefront configuration, text content, and products into a JSON file, or restore a previous backup.</p>
          <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
            <button id="downloadBackupBtn" class="admin-btn admin-btn-secondary" style="justify-content:center;">
              ${icon("download", 16)} Download Backup JSON
            </button>
            <div style="border-top:1px dashed var(--border); padding-top:10px; margin-top:4px;">
              <label class="admin-form-label" style="display:block; margin-bottom:6px;">Restore Backup File</label>
              <input type="file" id="restoreBackupInput" class="admin-form-control" style="padding:6px; width:100%;" accept=".json">
            </div>
          </div>
        </div>

        <!-- System Reset Section -->
        <div class="admin-form" style="padding: 24px; gap:12px;">
          <h3 style="font-family:var(--font-serif); font-size:18px; margin:0 0 4px; color:#ef5350;">System Recovery</h3>
          <p style="font-size:12.5px; color:rgba(17,29,66,0.6); margin:0;">Warning: Resetting to defaults will erase all custom settings modifications and restore default storefront parameters.</p>
          <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px; justify-content:flex-end; flex:1;">
            <button id="systemResetBtn" class="admin-btn admin-btn-danger" style="justify-content:center; width:100%;">
              ${icon("alert-triangle", 16)} Reset System to Defaults
            </button>
          </div>
        </div>

        <!-- Sync Diagnostics -->
        <div class="admin-form" style="padding: 24px; gap:12px;">
          <h3 style="font-family:var(--font-serif); font-size:18px; margin:0 0 4px;">Sync Diagnostics</h3>
          <p style="font-size:12.5px; color:rgba(17,29,66,0.6); margin:0;">Perform manual database synchronization between client state cache and Cloud Supabase tables.</p>
          <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px; justify-content:flex-end; flex:1;">
            <button id="manualSyncBtn" class="admin-btn admin-btn-primary" style="justify-content:center; width:100%;">
              ${icon("refresh-cw", 16)} Sync Database Now
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderModule(section) {
  const moduleMap = {
    "dashboard": () => renderDashboardOverview(),
    "products": () => renderProductsModule(),
    "categories": () => renderComingSoon("Categories", "Organize designs into categories.", "tag"), // Fallback if needed, but we implemented categories!
    "categories": () => renderCategoriesModule(),
    "collections": () => renderCollectionsModule(),
    "orders": () => renderOrdersModule(),
    "custom-requests": () => renderCustomRequestsModule(),
    "customers": () => renderCustomersModule(),
    "content": () => renderContentModule(),
    "testimonials": () => renderTestimonialsModule(),
    "faqs": () => renderFAQsModule(),
    "media": () => renderMediaModule(),
    "settings": () => renderSettingsModule()
  };

  const renderer = moduleMap[section];
  return renderer ? renderer() : renderDashboardOverview();
}

// ==========================================
// MAIN RENDER EXPORT
// ==========================================

export function renderAdminDashboard(params = {}) {
  const activeSection = getActiveSection(params);
  if (activeSection !== "products") {
    isAddingProduct = false;
    isBulkImporting = false;
    editingProduct = null;
  }
  triggerDataLoad(activeSection);

  return `
    <div class="admin-shell" id="adminShell">
      ${renderSidebar(activeSection)}
      <div class="admin-sidebar-overlay" id="adminSidebarOverlay" style="
        position: fixed;
        inset: 0;
        background: rgba(17, 29, 66, 0.4);
        backdrop-filter: blur(4px);
        opacity: 0;
        visibility: hidden;
        transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 250;
      "></div>
      <div class="admin-main" id="adminMain">
        <header class="admin-topbar" id="adminTopbar">
          <button class="admin-menu-toggle" id="adminMenuToggle" aria-label="Toggle sidebar">
            <i data-lucide="menu"></i>
          </button>
          <div class="admin-topbar-breadcrumb">
            <span>Admin</span>
            <i data-lucide="chevron-right"></i>
            <span style="font-weight:600;">${activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace("-", " ")}</span>
          </div>
          <div class="admin-topbar-actions">
            <a href="#/" class="admin-topbar-link">
              <i data-lucide="external-link"></i>
              View Site
            </a>
          </div>
        </header>
        <div class="admin-content" id="adminContent">
          ${renderModule(activeSection)}
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// EVENT DELEGATES
// ==========================================

let eventsBound = false;

export function initAdminDashboardDelegates() {
  // Sidebar toggle for mobile
  const menuToggle = document.getElementById("adminMenuToggle");
  const sidebar = document.getElementById("adminSidebar");
  const overlay = document.getElementById("adminSidebarOverlay");
  if (menuToggle && sidebar && overlay) {
    const toggleSidebar = () => {
      sidebar.classList.toggle("admin-sidebar--open");
      const isOpen = sidebar.classList.contains("admin-sidebar--open");
      overlay.style.opacity = isOpen ? "1" : "0";
      overlay.style.visibility = isOpen ? "visible" : "hidden";
    };
    menuToggle.addEventListener("click", toggleSidebar);
    overlay.addEventListener("click", toggleSidebar);
  }

  // Logout button
  const logoutBtn = document.getElementById("adminLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await logout();
      resetLoadedState();
      navigate("/");
    });
  }

  if (eventsBound) return;
  eventsBound = true;

  // Search & Filtering listeners
  document.addEventListener("input", (e) => {
    if (e.target.id === "adminProductSearch") {
      productSearchQuery = e.target.value;
      triggerRender();
      const input = document.getElementById("adminProductSearch");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
    
    if (e.target.id === "adminOrderSearch") {
      orderSearchQuery = e.target.value;
      triggerRender();
      const input = document.getElementById("adminOrderSearch");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }

    if (e.target.id === "adminRequestSearch") {
      requestSearchQuery = e.target.value;
      triggerRender();
      const input = document.getElementById("adminRequestSearch");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }

    if (e.target.id === "adminCustomerSearch") {
      customerSearchQuery = e.target.value;
      triggerRender();
      const input = document.getElementById("adminCustomerSearch");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }

    // Auto-calculating stitch counts and estimated time on the product form
    if (e.target.id === "formBackStitches" || e.target.id === "formHandsStitches" || e.target.id === "formRpm") {
      const back = parseInt(document.getElementById("formBackStitches")?.value || 0);
      const hands = parseInt(document.getElementById("formHandsStitches")?.value || 0);
      const total = back + hands;
      const rpm = parseInt(document.getElementById("formRpm")?.value || 850);
      
      const totalInput = document.getElementById("formTotalStitches");
      if (totalInput) {
        totalInput.value = total;
      }
      
      const estTimeInput = document.getElementById("formEstTime");
      if (estTimeInput && rpm > 0) {
        estTimeInput.value = Math.round(total / rpm);
      }
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.id === "adminProductCategoryFilter") {
      productFilterCategory = e.target.value;
      triggerRender();
    }
    
    // Category Image File Preview
    if (e.target.id === "categoryImageFile") {
      const file = e.target.files[0];
      if (file) {
        const card = e.target.closest(".image-upload-card");
        if (card) {
          const placeholder = card.querySelector(".upload-placeholder");
          const preview = card.querySelector(".upload-preview");
          const img = card.querySelector(".upload-preview img");
          if (placeholder && preview && img) {
            const reader = new FileReader();
            reader.onload = (event) => {
              img.src = event.target.result;
              placeholder.style.display = "none";
              preview.style.display = "flex";
            };
            reader.readAsDataURL(file);
          }
        }
      }
    }

    // Collection Image File Preview
    if (e.target.id === "collectionImageFile") {
      const file = e.target.files[0];
      if (file) {
        const card = e.target.closest(".image-upload-card");
        if (card) {
          const placeholder = card.querySelector(".upload-placeholder");
          const preview = card.querySelector(".upload-preview");
          const img = card.querySelector(".upload-preview img");
          if (placeholder && preview && img) {
            const reader = new FileReader();
            reader.onload = (event) => {
              img.src = event.target.result;
              placeholder.style.display = "none";
              preview.style.display = "flex";
            };
            reader.readAsDataURL(file);
          }
        }
      }
    }

    // Product Image File Preview
    if (e.target.id === "productImageFile") {
      const file = e.target.files[0];
      if (file) {
        const card = e.target.closest(".image-upload-card");
        if (card) {
          const placeholder = card.querySelector(".upload-placeholder");
          const preview = card.querySelector(".upload-preview");
          const img = card.querySelector(".upload-preview img");
          if (placeholder && preview && img) {
            const reader = new FileReader();
            reader.onload = (event) => {
              img.src = event.target.result;
              placeholder.style.display = "none";
              preview.style.display = "flex";
            };
            reader.readAsDataURL(file);
          }
        }
      }
    }

    // Digitized Custom Design File Preview
    if (e.target.id === "digitizedDesignFile") {
      const file = e.target.files[0];
      if (file) {
        const card = e.target.closest(".image-upload-card");
        if (card) {
          const placeholder = card.querySelector(".upload-placeholder");
          const preview = card.querySelector(".upload-preview");
          const textSpan = card.querySelector(".upload-preview span");
          if (placeholder && preview && textSpan) {
            textSpan.innerText = file.name;
            placeholder.style.display = "none";
            preview.style.display = "flex";
          }
        }
      }
    }

    // Settings Restore File Upload
    if (e.target.id === "restoreBackupInput") {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            // Apply backup sections
            const sections = ['brand', 'navigation', 'hero', 'steps', 'stories', 'cta', 'footer', 'theme'];
            sections.forEach(sec => {
              if (parsed[sec]) site[sec] = parsed[sec];
            });
            await saveSite();
            showToast("Backup configuration restored successfully!");
            triggerRender();
          } catch (err) {
            console.error("Backup restore failed:", err);
            showToast("Failed to parse backup JSON file.");
          }
        };
        reader.readAsText(file);
      }
    }
  });

  // Action Click handlers
  document.addEventListener("click", async (e) => {
    // ------------------------------------------
    // Products CMS Actions
    // ------------------------------------------
    if (e.target.closest("#adminAddProductBtn")) {
      isAddingProduct = true;
      isBulkImporting = false;
      editingProduct = null;
      triggerRender();
      return;
    }

    if (e.target.closest("#adminBulkImportBtn")) {
      isBulkImporting = true;
      isAddingProduct = false;
      editingProduct = null;
      triggerRender();
      return;
    }
    
    if (e.target.closest(".admin-product-cancel-btn")) {
      isAddingProduct = false;
      editingProduct = null;
      triggerRender();
      return;
    }

    if (e.target.closest(".admin-bulk-cancel-btn")) {
      isBulkImporting = false;
      triggerRender();
      return;
    }
    
    const editProdBtn = e.target.closest(".admin-product-edit-btn");
    if (editProdBtn) {
      const id = editProdBtn.dataset.id;
      const prod = site.products.find(p => p.id === id);
      if (prod) {
        editingProduct = prod;
        isAddingProduct = false;
        triggerRender();
      }
      return;
    }
    
    const deleteProdBtn = e.target.closest(".admin-product-delete-btn");
    if (deleteProdBtn) {
      const id = deleteProdBtn.dataset.id;
      const prod = site.products.find(p => p.id === id);
      if (prod && confirm(`Are you sure you want to delete "${prod.title}"?`)) {
        try {
          await productService.deleteProduct(id);
          showToast("Design deleted successfully!");
          site.products = await productService.getProducts();
          DB.saveProducts(site.products); // Update local cache
          triggerRender();
        } catch (err) {
          console.error("Error deleting product:", err);
          showToast(`Failed to delete: ${err.message}`);
        }
      }
      return;
    }

    // ------------------------------------------
    // Categories CMS Actions
    // ------------------------------------------
    if (e.target.closest("#adminAddCategoryBtn")) {
      isAddingCategory = true;
      editingCategory = null;
      triggerRender();
      return;
    }

    if (e.target.closest(".admin-category-cancel-btn")) {
      isAddingCategory = false;
      editingCategory = null;
      triggerRender();
      return;
    }

    const editCatBtn = e.target.closest(".edit-category-btn");
    if (editCatBtn) {
      const id = editCatBtn.dataset.id;
      const cat = categoriesList.find(c => c.id === id);
      if (cat) {
        editingCategory = cat;
        isAddingCategory = false;
        triggerRender();
      }
      return;
    }

    const deleteCatBtn = e.target.closest(".delete-category-btn");
    if (deleteCatBtn) {
      const id = deleteCatBtn.dataset.id;
      const cat = categoriesList.find(c => c.id === id);
      if (cat && confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
        try {
          await categoryService.deleteCategory(id);
          showToast("Category deleted successfully!");
          categoriesList = await categoryService.getCategories();
          saveCategories(categoriesList); // Update local cache & trigger render
        } catch (err) {
          const isForeignKey = err.code === "23503" || (err.message && err.message.includes("foreign key"));
          if (isForeignKey) {
            showToast("Cannot delete: This category has associated products. Please reassign or delete them first.");
          } else {
            showToast(`Failed to delete category: ${err.message}`);
          }
        }
      }
      return;
    }

    // ------------------------------------------
    // Collections CMS Actions
    // ------------------------------------------
    if (e.target.closest("#adminAddCollectionBtn")) {
      isAddingCollection = true;
      editingCollection = null;
      triggerRender();
      return;
    }

    if (e.target.closest(".admin-collection-cancel-btn")) {
      isAddingCollection = false;
      editingCollection = null;
      triggerRender();
      return;
    }

    const editColBtn = e.target.closest(".edit-collection-btn");
    if (editColBtn) {
      const id = editColBtn.dataset.id;
      const col = site.collections.find(c => c.id === id);
      if (col) {
        editingCollection = col;
        isAddingCollection = false;
        triggerRender();
      }
      return;
    }

    const deleteColBtn = e.target.closest(".delete-collection-btn");
    if (deleteColBtn) {
      const id = deleteColBtn.dataset.id;
      const col = site.collections.find(c => c.id === id);
      if (col && confirm(`Are you sure you want to delete collection "${col.title}"?`)) {
        try {
          await collectionService.deleteCollection(id);
          showToast("Collection deleted successfully!");
          site.collections = await collectionService.getCollections();
          DB.save("godavari-designer-site-v1", site); // Update local cache
          triggerRender();
        } catch (err) {
          showToast(`Failed to delete collection: ${err.message}`);
        }
      }
      return;
    }

    // ------------------------------------------
    // Order Actions
    // ------------------------------------------
    const viewOrderBtn = e.target.closest(".view-order-details-btn");
    if (viewOrderBtn) {
      const id = viewOrderBtn.dataset.id;
      const order = ordersList.find(o => o.id === id);
      if (order) {
        selectedOrder = order;
        triggerRender();
      }
      return;
    }

    if (e.target.closest(".close-order-details-btn")) {
      selectedOrder = null;
      triggerRender();
      return;
    }

    // ------------------------------------------
    // Custom Request Actions
    // ------------------------------------------
    const viewReqBtn = e.target.closest(".view-request-details-btn");
    if (viewReqBtn) {
      const id = viewReqBtn.dataset.id;
      const req = requestsList.find(r => r.id === id);
      if (req) {
        selectedRequest = req;
        triggerRender();
      }
      return;
    }

    if (e.target.closest(".close-request-details-btn")) {
      selectedRequest = null;
      triggerRender();
      return;
    }

    // ------------------------------------------
    // Testimonials CMS Actions
    // ------------------------------------------
    if (e.target.closest("#adminAddTestimonialBtn")) {
      isAddingTestimonial = true;
      editingTestimonial = null;
      triggerRender();
      return;
    }

    if (e.target.closest(".admin-testimonial-cancel-btn")) {
      isAddingTestimonial = false;
      editingTestimonial = null;
      triggerRender();
      return;
    }

    const editTestBtn = e.target.closest(".edit-testimonial-btn");
    if (editTestBtn) {
      const id = editTestBtn.dataset.id;
      const test = testimonialsList.find(t => t.id === id);
      if (test) {
        editingTestimonial = test;
        isAddingTestimonial = false;
        triggerRender();
      }
      return;
    }

    const deleteTestBtn = e.target.closest(".delete-testimonial-btn");
    if (deleteTestBtn) {
      const id = deleteTestBtn.dataset.id;
      if (confirm("Are you sure you want to delete this testimonial?")) {
        try {
          await testimonialService.deleteTestimonial(id);
          showToast("Testimonial deleted successfully!");
          testimonialsList = await testimonialService.getTestimonials();
          triggerRender();
        } catch (err) {
          showToast(`Failed to delete: ${err.message}`);
        }
      }
      return;
    }

    // ------------------------------------------
    // FAQs CMS Actions
    // ------------------------------------------
    if (e.target.closest("#adminAddFaqBtn")) {
      isAddingFaq = true;
      editingFaq = null;
      triggerRender();
      return;
    }

    if (e.target.closest(".admin-faq-cancel-btn")) {
      isAddingFaq = false;
      editingFaq = null;
      triggerRender();
      return;
    }

    const editFaqBtn = e.target.closest(".edit-faq-btn");
    if (editFaqBtn) {
      const id = editFaqBtn.dataset.id;
      const faq = faqsList.find(f => f.id === id);
      if (faq) {
        editingFaq = faq;
        isAddingFaq = false;
        triggerRender();
      }
      return;
    }

    const deleteFaqBtn = e.target.closest(".delete-faq-btn");
    if (deleteFaqBtn) {
      const id = deleteFaqBtn.dataset.id;
      if (confirm("Are you sure you want to delete this FAQ?")) {
        try {
          await faqService.deleteFaq(id);
          showToast("FAQ deleted successfully!");
          faqsList = await faqService.getFaqs();
          triggerRender();
        } catch (err) {
          showToast(`Failed to delete: ${err.message}`);
        }
      }
      return;
    }

    // ------------------------------------------
    // Media Library Actions
    // ------------------------------------------
    const copyUrlBtn = e.target.closest(".copy-media-url-btn");
    if (copyUrlBtn) {
      const url = copyUrlBtn.dataset.url;
      try {
        await navigator.clipboard.writeText(url);
        showToast("Public URL copied to clipboard!");
      } catch (err) {
        console.error("Clipboard copy failed:", err);
        showToast(`Image URL: ${url}`);
      }
      return;
    }

    const deleteMediaBtn = e.target.closest(".delete-media-btn");
    if (deleteMediaBtn) {
      const filename = deleteMediaBtn.dataset.name;
      if (confirm(`Are you sure you want to delete "${filename}"?`)) {
        try {
          await storageService.deleteMedia('media-library', `images/${filename}`);
          showToast("Asset deleted from storage!");
          // Reload list
          const { data } = await supabase.storage.from('media-library').list('images');
          mediaList = data || [];
          triggerRender();
        } catch (err) {
          showToast(`Failed to delete: ${err.message}`);
        }
      }
      return;
    }

    // ------------------------------------------
    // System Settings Actions
    // ------------------------------------------
    if (e.target.closest("#downloadBackupBtn")) {
      const blob = new Blob([JSON.stringify(site, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "godavari-designer-backup.json";
      link.click();
      URL.revokeObjectURL(link.href);
      showToast("Backup JSON file download initiated!");
      return;
    }

    if (e.target.closest("#manualSyncBtn")) {
      const btn = document.getElementById("manualSyncBtn");
      if (btn) btn.disabled = true;
      showToast("Synchronizing storefront settings...");
      try {
        await saveSite();
      } catch (err) {
        console.error(err);
      } finally {
        if (btn) btn.disabled = false;
      }
      return;
    }

    if (e.target.closest("#systemResetBtn")) {
      if (confirm("DANGER: This resets all custom content settings back to the system defaults. Proceed?")) {
        localStorage.clear();
        showToast("System cache cleared. Reloading...");
        setTimeout(() => window.location.reload(), 1500);
      }
      return;
    }
  });

  // Form Submissions Delegator
  document.addEventListener("submit", async (e) => {
    // ------------------------------------------
    // Products CMS Bulk Import Form Submit
    // ------------------------------------------
    if (e.target.id === "adminBulkImportForm") {
      e.preventDefault();
      const form = e.target;
      const submitBtn = form.querySelector("#adminBulkSubmitBtn");
      const progressPanel = document.getElementById("bulkUploadProgressPanel");
      const progressBar = document.getElementById("bulkUploadProgressBar");
      const progressLog = document.getElementById("bulkUploadProgressLog");

      const fileInput = document.getElementById("bulkImagesInput");
      const files = fileInput ? fileInput.files : [];
      if (files.length === 0) {
        showToast("Please select at least one image file.");
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (progressPanel) progressPanel.style.display = "block";
      if (progressBar) progressBar.style.width = "0%";
      if (progressLog) progressLog.innerHTML = "";

      const log = (msg) => {
        if (progressLog) {
          progressLog.innerHTML += `[${new Date().toLocaleTimeString()}] ${msg}<br>`;
          progressLog.scrollTop = progressLog.scrollHeight;
        }
      };

      try {
        const formData = new FormData(form);
        const baseTitle = formData.get("baseTitle");
        const price = Number(formData.get("price") || 1500);
        const categoryId = formData.get("categoryId");
        const collectionId = formData.get("collectionId") || null;
        const codePrefix = formData.get("codePrefix") || "GD-";
        const startNumber = parseInt(formData.get("startNumber") || "2001", 10);
        
        // formats checkboxes
        const formatsCheckboxOptions = Array.from(form.querySelectorAll("input[name='formatOption']:checked")).map(el => el.value);
        
        // categories look up
        const cats = getCategories();
        const activeCategory = cats.find(c => c.id === categoryId);
        const categoryName = activeCategory ? activeCategory.name : "";

        // collections look up
        const collectionsList = site.collections || [];
        const activeCollection = collectionsList.find(c => c.id === collectionId);
        const collectionName = activeCollection ? activeCollection.name : "";

        const fabricsStr = formData.get("recommendedFabrics") || "";
        const recommendedFabrics = fabricsStr.split(",").map(t => t.trim()).filter(Boolean);
        const description = formData.get("description") || "Premium embroidery design.";
        
        const totalStitchCount = parseInt(formData.get("totalStitchCount") || 28000, 10);
        const threadColors = parseInt(formData.get("threadColors") || 4, 10);
        const width = parseInt(formData.get("width") || 120, 10);
        const height = parseInt(formData.get("height") || 120, 10);

        log(`Starting bulk import of ${files.length} designs...`);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const codeNumber = startNumber + i;
          const code = `${codePrefix}${codeNumber}`;
          const productTitle = `${baseTitle} - ${code}`;
          const slug = `${baseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${code.toLowerCase()}`;

          log(`Processing ${i + 1}/${files.length}: ${file.name}...`);
          
          // 1. Upload the image file to Supabase storage
          const cleanName = `bulk_${Date.now()}_${i}_${file.name.toLowerCase().replace(/[^a-z0-9.]/g, '_')}`;
          log(`Uploading image ${file.name} to storage...`);
          const publicUrl = await storageService.uploadImage(file, cleanName);
          log(`Uploaded successfully! Public URL: ${publicUrl}`);

          // 2. Prepare formats structure
          const formats = formatsCheckboxOptions.map(fmt => {
            let machineBrand = "Tajima";
            let machineModel = "TMEZ-SC";
            let hoopSize = "200mm x 200mm";
            if (fmt === "PES") {
              machineBrand = "Brother";
              machineModel = "PR1055X";
            } else if (fmt === "EXP") {
              machineBrand = "Bernina";
              machineModel = "E16";
            } else if (fmt === "JEF") {
              machineBrand = "Janome";
              machineModel = "MC550E";
            } else if (fmt === "XXX") {
              machineBrand = "Singer";
              machineModel = "EM9305";
            }
            return {
              format: fmt,
              machineBrand,
              machineModel,
              hoopSize,
              price
            };
          });

          // 3. Insert product details to Supabase
          const prodPayload = {
            title: productTitle,
            code,
            slug,
            price,
            categoryId,
            collectionId,
            description,
            backStitchCount: 0,
            handStitchCount: 0,
            totalStitchCount,
            rpm: 850,
            estimatedEmbroideryTime: Math.round(totalStitchCount / 850),
            threadColors,
            width,
            height,
            image: publicUrl,
            gallery: [publicUrl],
            difficultyLevel: "Intermediate",
            recommendedFabrics,
            tags: [categoryName, collectionName].filter(Boolean),
            formats,
            featured: true,
            bestSeller: true
          };

          log(`Saving design details for ${code}...`);
          await productService.createProduct(prodPayload);
          log(`Design ${code} created successfully!`);

          // Update progress bar
          const percent = Math.round(((i + 1) / files.length) * 100);
          if (progressBar) progressBar.style.width = `${percent}%`;
        }

        log(`Refreshing product catalog from server...`);
        site.products = await productService.getProducts();
        log(`All done! Imported ${files.length} products successfully.`);
        showToast(`Bulk imported ${files.length} designs successfully!`);

        setTimeout(() => {
          isBulkImporting = false;
          triggerRender();
        }, 1500);

      } catch (err) {
        log(`ERROR: ${err.message}`);
        showToast(`Bulk upload failed: ${err.message}`);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
      return;
    }

    // ------------------------------------------
    // Products CMS Form Submit
    // ------------------------------------------
    if (e.target.id === "adminProductForm") {
      e.preventDefault();
      const form = e.target;
      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Saving Design...";
      }
      
      const formData = new FormData(form);
      const id = formData.get("id");

      try {
        const fileInput = document.getElementById("productImageFile");
        const file = fileInput ? fileInput.files[0] : null;
        let imageUrl = formData.get("image");

        if (file) {
          if (submitBtn) submitBtn.innerText = "Uploading Image...";
          const cleanName = `prod_${Date.now()}_${file.name.toLowerCase().replace(/[^a-z0-9.]/g, '_')}`;
          imageUrl = await storageService.uploadImage(file, cleanName);
        }

        if (!id && !imageUrl) {
          throw new Error("An image file is required for new product designs.");
        }
        
        const tagsStr = formData.get("tags") || "";
        const tags = tagsStr.split(",").map(t => t.trim()).filter(Boolean);
        
        const fabricsStr = formData.get("recommendedFabrics") || "";
        const recommendedFabrics = fabricsStr.split(",").map(t => t.trim()).filter(Boolean);
        
        const price = Number(formData.get("price") || 0);
        const title = formData.get("title");
        
        const formatsCheckboxOptions = Array.from(form.querySelectorAll("input[name='formatOption']:checked")).map(el => el.value);
        
        const formats = formatsCheckboxOptions.map(fmt => {
          let existingFormat = null;
          if (id) {
            const existing = site.products.find(p => p.id === id);
            if (existing && existing.formats) {
              existingFormat = existing.formats.find(f => f.format === fmt);
            }
          }
          if (existingFormat) {
            existingFormat.price = price;
            return existingFormat;
          }
          
          let machineBrand = "Tajima";
          let machineModel = "TMEZ-SC";
          let hoopSize = "200mm x 200mm";
          if (fmt === "PES") {
            machineBrand = "Brother";
            machineModel = "PR1055X";
          } else if (fmt === "EXP") {
            machineBrand = "Bernina";
            machineModel = "E16";
          } else if (fmt === "JEF") {
            machineBrand = "Janome";
            machineModel = "MC550E";
          } else if (fmt === "XXX") {
            machineBrand = "Singer";
            machineModel = "EM9305";
          }
          return {
            format: fmt,
            machineBrand,
            machineModel,
            hoopSize,
            price
          };
        });

        const prodPayload = {
          title,
          code: formData.get("code"),
          slug: formData.get("slug"),
          price,
          categoryId: formData.get("categoryId"),
          collectionId: formData.get("collectionId") || null,
          description: formData.get("description"),
          backStitchCount: parseInt(formData.get("backStitchCount") || 0),
          handStitchCount: parseInt(formData.get("handStitchCount") || 0),
          totalStitchCount: parseInt(formData.get("totalStitchCount") || 0),
          rpm: parseInt(formData.get("rpm") || 850),
          estimatedEmbroideryTime: parseInt(formData.get("estimatedEmbroideryTime") || 0),
          threadColors: parseInt(formData.get("threadColors") || 0),
          width: parseInt(formData.get("width") || 100),
          height: parseInt(formData.get("height") || 100),
          image: imageUrl,
          gallery: [imageUrl],
          difficultyLevel: formData.get("difficultyLevel") || "Intermediate",
          recommendedFabrics,
          tags,
          formats,
          featured: true,
          bestSeller: true
        };

        if (id) {
          await productService.updateProduct(id, prodPayload);
          showToast("Design updated successfully!");
        } else {
          await productService.createProduct(prodPayload);
          showToast("Design added successfully!");
        }
        site.products = await productService.getProducts();
        DB.saveProducts(site.products); // Update local cache
        isAddingProduct = false;
        editingProduct = null;
        triggerRender();
      } catch (err) {
        showToast(`Failed to save: ${err.message}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "Save Design";
        }
      }
    }

    // ------------------------------------------
    // Categories CMS Form Submit
    // ------------------------------------------
    if (e.target.id === "adminCategoryForm") {
      e.preventDefault();
      const form = e.target;
      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Saving Category...";
      }

      const formData = new FormData(form);
      const id = formData.get("id");

      try {
        const fileInput = document.getElementById("categoryImageFile");
        const file = fileInput ? fileInput.files[0] : null;
        let imageUrl = formData.get("image") || "";

        if (file) {
          if (submitBtn) submitBtn.innerText = "Uploading Image...";
          const cleanName = `cat_${Date.now()}_${file.name.toLowerCase().replace(/[^a-z0-9.]/g, '_')}`;
          imageUrl = await storageService.uploadImage(file, cleanName);
        }

        if (!id && !imageUrl) {
          throw new Error("An image file is required for new categories.");
        }

        const payload = {
          name: formData.get("name"),
          slug: formData.get("slug"),
          description: formData.get("description"),
          image: imageUrl,
          displayOrder: parseInt(formData.get("displayOrder") || 1),
          featured: form.featured.checked
        };

        if (id) {
          await categoryService.updateCategory(id, payload);
          showToast("Category updated!");
        } else {
          await categoryService.createCategory(payload);
          showToast("Category added!");
        }
        categoriesList = await categoryService.getCategories();
        isAddingCategory = false;
        editingCategory = null;
        saveCategories(categoriesList); // Update local cache & trigger render
      } catch (err) {
        showToast(`Error: ${err.message}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "Save Category";
        }
      }
    }

    // ------------------------------------------
    // Collections CMS Form Submit
    // ------------------------------------------
    if (e.target.id === "adminCollectionForm") {
      e.preventDefault();
      const form = e.target;
      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Saving Collection...";
      }

      const formData = new FormData(form);
      const id = formData.get("id");

      try {
        const fileInput = document.getElementById("collectionImageFile");
        const file = fileInput ? fileInput.files[0] : null;
        let imageUrl = formData.get("image") || "";

        if (file) {
          if (submitBtn) submitBtn.innerText = "Uploading Image...";
          const cleanName = `col_${Date.now()}_${file.name.toLowerCase().replace(/[^a-z0-9.]/g, '_')}`;
          imageUrl = await storageService.uploadImage(file, cleanName);
        }

        if (!id && !imageUrl) {
          throw new Error("An image file is required for new collections.");
        }

        const payload = {
          title: formData.get("title"),
          slug: formData.get("slug"),
          description: formData.get("description"),
          image: imageUrl,
          displayOrder: parseInt(formData.get("displayOrder") || 1),
          featured: form.featured.checked
        };

        if (id) {
          await collectionService.updateCollection(id, payload);
          showToast("Collection updated!");
        } else {
          await collectionService.createCollection(payload);
          showToast("Collection added!");
        }
        site.collections = await collectionService.getCollections();
        isAddingCollection = false;
        editingCollection = null;
        await saveSite();
        triggerRender();
      } catch (err) {
        showToast(`Error: ${err.message}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "Save Collection";
        }
      }
    }

    // ------------------------------------------
    // Order Status Update Submit
    // ------------------------------------------
    if (e.target.id === "orderStatusForm") {
      e.preventDefault();
      const form = e.target;
      const id = form.elements.id ? form.elements.id.value : '';
      const status = form.status.value;
      const paymentStatus = form.paymentStatus.value;

      try {
        await orderService.updateOrder(id, { status, paymentStatus });
        showToast("Order status updated successfully!");
        ordersList = await orderService.getOrders();
        selectedOrder = ordersList.find(o => o.id === id);
        triggerRender();
      } catch (err) {
        showToast(`Error updating order: ${err.message}`);
      }
    }

    // ------------------------------------------
    // Custom Request Quote Submit
    // ------------------------------------------
    if (e.target.id === "customRequestQuoteForm") {
      e.preventDefault();
      const form = e.target;
      const id = form.elements.id ? form.elements.id.value : '';
      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Saving Request...";
      }

      try {
        const fileInput = document.getElementById("digitizedDesignFile");
        const file = fileInput ? fileInput.files[0] : null;
        let designUrl = form.digitizedFile.value;

        if (file) {
          if (submitBtn) submitBtn.innerText = "Uploading Design File...";
          const cleanName = `dsn_${Date.now()}_${file.name.toLowerCase().replace(/[^a-z0-9.]/g, '_')}`;
          designUrl = await storageService.uploadDesignFile(file, cleanName);
        }

        const payload = {
          quoteAmount: Number(form.quoteAmount.value || 0),
          status: form.status.value,
          paymentStatus: form.paymentStatus.value,
          digitizedFile: designUrl || null,
          adminNotes: form.adminNotes.value || null,
          name: selectedRequest.name,
          email: selectedRequest.email,
          notes: selectedRequest.notes,
          requestSource: selectedRequest.requestSource,
          cartItems: selectedRequest.cartItems
        };

        await customRequestService.updateRequest(id, payload);
        showToast("Request updated successfully!");
        requestsList = await customRequestService.getRequests();
        selectedRequest = requestsList.find(r => r.id === id);
        triggerRender();
      } catch (err) {
        showToast(`Error updating request: ${err.message}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "Update Request / Send Quote";
        }
      }
    }

    // ------------------------------------------
    // Site Content Form Submit
    // ------------------------------------------
    if (e.target.id === "adminSiteContentForm") {
      e.preventDefault();
      const f = e.target;
      
      // Update site state directly
      site.brand.name = f.brandName.value;
      site.brand.tagline = f.brandTagline.value;
      site.brand.descriptor = f.brandDescriptor.value;
      site.brand.contact.email = f.contactEmail.value;
      site.brand.contact.phone = f.contactPhone.value;
      site.brand.contact.address = f.contactAddress.value;
      site.brand.contact.instagram = f.contactInstagram.value;

      site.brand.trustText = f.brandTrustText.value;
      site.brand.storyLabel = f.brandStoryLabel.value;
      site.brand.qualityTitle = f.brandQualityTitle.value;
      site.brand.qualityText = f.brandQualityText.value;

      site.hero.eyebrow = f.heroEyebrow.value;
      site.hero.heading = f.heroHeading.value;
      site.hero.subheading = f.heroSubheading.value;
      site.hero.primaryButton = f.heroPrimaryButton.value;
      site.hero.secondaryButton = f.heroSecondaryButton.value;

      site.cta.headline = f.ctaHeadline.value;
      site.cta.text = f.ctaText.value;

      site.footer.newsletterTitle = f.footerNewsletterTitle.value;
      site.footer.newsletterText = f.footerNewsletterText.value;

      try {
        const submitBtn = f.querySelector("button[type='submit']");
        if (submitBtn) submitBtn.disabled = true;
        await saveSite();
      } catch (err) {
        console.error(err);
      } finally {
        const submitBtn = f.querySelector("button[type='submit']");
        if (submitBtn) submitBtn.disabled = false;
      }
    }

    // ------------------------------------------
    // Testimonials Form Submit
    // ------------------------------------------
    if (e.target.id === "adminTestimonialForm") {
      e.preventDefault();
      const form = e.target;
      const id = form.elements.id ? form.elements.id.value : '';
      const payload = {
        name: form.name.value,
        role: form.role.value,
        quote: form.quote.value,
        rating: Number(form.rating.value || 5.0),
        displayOrder: parseInt(form.displayOrder.value || 1)
      };

      try {
        if (id) {
          await testimonialService.updateTestimonial(id, payload);
          showToast("Testimonial updated!");
        } else {
          await testimonialService.createTestimonial(payload);
          showToast("Testimonial added!");
        }
        testimonialsList = await testimonialService.getTestimonials();
        isAddingTestimonial = false;
        editingTestimonial = null;
        triggerRender();
      } catch (err) {
        showToast(`Error: ${err.message}`);
      }
    }

    // ------------------------------------------
    // FAQs Form Submit
    // ------------------------------------------
    if (e.target.id === "adminFaqForm") {
      e.preventDefault();
      const form = e.target;
      const id = form.elements.id ? form.elements.id.value : '';
      const payload = {
        question: form.question.value,
        answer: form.answer.value,
        category: form.category.value,
        displayOrder: parseInt(form.displayOrder.value || 1)
      };

      try {
        if (id) {
          await faqService.updateFaq(id, payload);
          showToast("FAQ updated!");
        } else {
          await faqService.createFaq(payload);
          showToast("FAQ added!");
        }
        faqsList = await faqService.getFaqs();
        isAddingFaq = false;
        editingFaq = null;
        triggerRender();
      } catch (err) {
        showToast(`Error: ${err.message}`);
      }
    }

    // ------------------------------------------
    // Media Library Upload Form Submit
    // ------------------------------------------
    if (e.target.id === "adminMediaUploadForm") {
      e.preventDefault();
      const fileInput = document.getElementById("mediaUploadInput");
      const file = fileInput ? fileInput.files[0] : null;
      if (!file) return;

      const submitBtn = e.target.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Uploading...";
      }

      try {
        const cleanName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, '_');
        await storageService.uploadImage(file, cleanName);
        showToast("Asset uploaded successfully!");
        const { data } = await supabase.storage.from('media-library').list('images');
        mediaList = data || [];
        fileInput.value = "";
        triggerRender();
      } catch (err) {
        showToast(`Upload failed: ${err.message}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "Upload Image";
        }
      }
    }
  });
}
