import { currentUser, logout, showToast, site, getCategories, triggerRender } from "../services/store.js";
import { navigate } from "../services/router.js";
import { icon, escapeHtml, attr, mediaUrl } from "../utils/helpers.js";
import { productService } from "../services/supabase.js";

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

// Local Admin Catalog States
let editingProduct = null;       // Product being edited
let isAddingProduct = false;      // Flag for showing add product form
let productSearchQuery = "";     // Filter products by search term
let productFilterCategory = "";  // Filter products by category

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
        <a href="#/account" class="admin-user-card" title="View Profile Settings" style="text-decoration: none; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.04); color: inherit; transition: background 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.08)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.04)'">
          <div class="admin-user-avatar">
            ${currentUser ? currentUser.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div class="admin-user-info">
            <span class="admin-user-name" style="display: block; font-size: 13px; font-weight: 600; color: #ffffff;">${currentUser ? currentUser.name : "Admin"}</span>
            <span class="admin-user-email" style="display: block; font-size: 11px; color: rgba(255, 255, 255, 0.4); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 140px;">${currentUser ? currentUser.email : ""}</span>
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
  return `
    <div class="admin-module">
      <div class="admin-module-header">
        <h1 class="admin-module-title">Dashboard Overview</h1>
        <p class="admin-module-subtitle">Welcome back, ${currentUser ? currentUser.name : "Admin"}. Here's a snapshot of your store.</p>
      </div>

      <div class="admin-stats-grid">
        <div class="admin-stat-card">
          <div class="admin-stat-icon"><i data-lucide="shopping-bag"></i></div>
          <div class="admin-stat-body">
            <span class="admin-stat-label">Total Orders</span>
            <span class="admin-stat-value" id="adminStatOrders">—</span>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon"><i data-lucide="pencil-ruler"></i></div>
          <div class="admin-stat-body">
            <span class="admin-stat-label">Custom Requests</span>
            <span class="admin-stat-value" id="adminStatRequests">—</span>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon"><i data-lucide="package"></i></div>
          <div class="admin-stat-body">
            <span class="admin-stat-label">Products</span>
            <span class="admin-stat-value" id="adminStatProducts">—</span>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon"><i data-lucide="users"></i></div>
          <div class="admin-stat-body">
            <span class="admin-stat-label">Customers</span>
            <span class="admin-stat-value" id="adminStatCustomers">—</span>
          </div>
        </div>
      </div>

      <div class="admin-module-notice">
        <div class="admin-notice-icon"><i data-lucide="info"></i></div>
        <div class="admin-notice-body">
          <strong>Admin CMS modules are coming in Phase 16.</strong>
          This dashboard is fully secured — navigation and structure are in place.
          All routes require <code>profiles.role = 'admin'</code> verified server-side.
        </div>
      </div>

      <div class="admin-quick-links">
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

function renderProductsModule() {
  const cats = getCategories();
  
  if (isAddingProduct || editingProduct) {
    const isEdit = !!editingProduct;
    const p = editingProduct || {};
    
    // Convert array values to comma-separated strings for easy input
    const tagsString = Array.isArray(p.tags) ? p.tags.join(", ") : "";
    const fabricsString = Array.isArray(p.recommendedFabrics) ? p.recommendedFabrics.join(", ") : "Silk, Organza, Velvet";
    
    return `
      <div class="admin-module">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
          <button class="admin-product-cancel-btn" style="background: transparent; border: none; color: rgba(255,255,255,0.6); cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600;">
            ${icon("arrow-left", 16)} Back to Catalog
          </button>
        </div>

        <form id="adminProductForm" style="display: grid; gap: 20px; grid-template-columns: 1fr 1fr; background: rgba(255, 255, 255, 0.02); padding: 30px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06); color: #e8e8ec;">
          <input type="hidden" name="id" value="${p.id || ''}">
          
          <div style="grid-column: span 2;">
            <h2 style="font-family: var(--font-serif); font-size: 24px; color: #f0ece4; margin: 0 0 6px;">
              ${isEdit ? 'Edit Product Design' : 'Add New Product Design'}
            </h2>
            <p style="font-size: 13px; color: rgba(255, 255, 255, 0.45); margin: 0;">Configure design attributes, file associations, and stitch technical parameters.</p>
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Design Title</label>
            <input type="text" name="title" value="${isEdit ? escapeHtml(p.title) : ''}" required style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;" placeholder="e.g. Royal Peony Floral">
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Design Code</label>
            <input type="text" name="code" value="${isEdit ? escapeHtml(p.code) : ''}" required style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;" placeholder="e.g. JC-1028">
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">URL Slug</label>
            <input type="text" name="slug" value="${isEdit ? escapeHtml(p.slug) : ''}" required style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;" placeholder="e.g. royal-peony-floral">
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Price ($)</label>
            <input type="number" name="price" value="${isEdit ? p.price : ''}" required style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;" placeholder="e.g. 45">
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Category</label>
            <select name="categoryId" required style="padding: 10px; background: #111318; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;">
              <option value="">Select Category</option>
              ${cats.map(c => `<option value="${c.id}" ${isEdit && p.categoryId === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
            </select>
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Collection (Optional)</label>
            <select name="collectionId" style="padding: 10px; background: #111318; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;">
              <option value="">None</option>
              ${site.collections.map(col => `<option value="${col.id}" ${isEdit && p.collectionId === col.id ? 'selected' : ''}>${escapeHtml(col.title)}</option>`).join('')}
            </select>
          </div>

          <div style="grid-column: span 2; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Description</label>
            <textarea name="description" rows="3" style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none; resize: vertical;" placeholder="An exquisite design for...">${isEdit ? escapeHtml(p.description || "") : ''}</textarea>
          </div>

          <div style="grid-column: span 2; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; margin-top: 8px;">
            <h3 style="font-family: var(--font-serif); font-size: 18px; color: var(--gold); margin: 0 0 14px;">Stitch Specifications & Calculation Parameters</h3>
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Back Stitch Count</label>
            <input type="number" id="formBackStitches" name="backStitchCount" value="${isEdit ? (p.backStitchCount || 0) : 0}" required style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;">
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Hands Stitch Count</label>
            <input type="number" id="formHandsStitches" name="handStitchCount" value="${isEdit ? (p.handStitchCount || 0) : 0}" required style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;">
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.5);">Total Stitch Count (Auto-Summed)</label>
            <input type="number" id="formTotalStitches" name="totalStitchCount" value="${isEdit ? (p.totalStitchCount || 0) : 0}" readonly style="padding: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; color: rgba(255,255,255,0.5); outline: none;" title="Auto-calculates as Back + Hands stitches">
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Default Running Speed (RPM)</label>
            <input type="number" id="formRpm" name="rpm" value="${isEdit ? (p.rpm || 850) : 850}" required style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;">
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Thread Colors Count</label>
            <input type="number" id="formColors" name="threadColors" value="${isEdit ? (p.threadColors || 0) : 0}" required style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;">
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.5);">Est. Stitch Time (Mins - Auto-Calculated)</label>
            <input type="number" id="formEstTime" name="estimatedEmbroideryTime" value="${isEdit ? (p.estimatedEmbroideryTime || 0) : 0}" style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;">
          </div>

          <div style="grid-column: span 2; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; margin-top: 8px;">
            <h3 style="font-family: var(--font-serif); font-size: 18px; color: var(--gold); margin: 0 0 14px;">Media & Additional Parameters</h3>
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Primary Image Asset Code / URL</label>
            <input type="text" name="image" value="${isEdit ? escapeHtml(p.image) : ''}" required style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;" placeholder="e.g. media-product-peony">
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Difficulty Level</label>
            <select name="difficultyLevel" style="padding: 10px; background: #111318; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;">
              <option value="Easy" ${isEdit && p.difficultyLevel === 'Easy' ? 'selected' : ''}>Easy</option>
              <option value="Intermediate" ${isEdit && p.difficultyLevel === 'Intermediate' ? 'selected' : (!isEdit ? 'selected' : '')}>Intermediate</option>
              <option value="Advanced" ${isEdit && p.difficultyLevel === 'Advanced' ? 'selected' : ''}>Advanced</option>
            </select>
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Width (mm)</label>
            <input type="number" name="width" value="${isEdit ? (p.width || 100) : 100}" required style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;">
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Height (mm)</label>
            <input type="number" name="height" value="${isEdit ? (p.height || 100) : 100}" required style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;">
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Tags (comma separated)</label>
            <input type="text" name="tags" value="${tagsString}" style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;" placeholder="e.g. blouse, allover, floral">
          </div>

          <div style="grid-column: span 1; display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">Fabrics (comma separated)</label>
            <input type="text" name="recommendedFabrics" value="${fabricsString}" style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; outline: none;" placeholder="e.g. Silk, Organza">
          </div>

          <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; margin-top: 10px;">
            <button type="button" class="admin-product-cancel-btn" style="padding: 10px 20px; background: transparent; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;">
              Cancel
            </button>
            <button type="submit" style="padding: 10px 24px; background: var(--gold); border: none; border-radius: 6px; color: var(--navy); cursor: pointer; font-size: 14px; font-weight: 700; transition: all 0.2s;">
              Save Design
            </button>
          </div>
        </form>
      </div>
    `;
  }
  
  // Filter products list based on search and category filters
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
        <button id="adminAddProductBtn" style="padding: 10px 20px; background: var(--gold); border: none; border-radius: 6px; color: var(--navy); cursor: pointer; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s;">
          ${icon("plus", 16)} Add Design
        </button>
      </div>

      <!-- Search & Filters -->
      <div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
        <input 
          type="text" 
          id="adminProductSearch" 
          value="${escapeHtml(productSearchQuery)}" 
          placeholder="Search by title, code, or tags..." 
          style="flex: 1; min-width: 250px; padding: 10px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; color: #fff; outline: none; border-color: rgba(255,255,255,0.12);"
        >
        <select 
          id="adminProductCategoryFilter" 
          style="padding: 10px; background: #111318; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; color: #fff; outline: none; min-width: 180px;"
        >
          <option value="">All Categories</option>
          ${cats.map(c => `<option value="${c.id}" ${productFilterCategory === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
        </select>
      </div>

      <!-- Products Table -->
      <div style="overflow-x: auto; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px; color: rgba(255,255,255,0.7);">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: rgba(255,255,255,0.02); color: #f0ece4; font-weight: 600;">
              <th style="padding: 16px;">Product</th>
              <th style="padding: 16px;">Category</th>
              <th style="padding: 16px; text-align: right;">Price</th>
              <th style="padding: 16px;">Stitches (Back / Hands)</th>
              <th style="padding: 16px;">Emb. Details</th>
              <th style="padding: 16px; text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filteredProducts.map(p => {
              const categoryName = p.category || "N/A";
              const formattedStitches = `${p.totalStitchCount ? p.totalStitchCount.toLocaleString() : '0'} (${(p.backStitchCount || 0).toLocaleString()} / ${(p.handStitchCount || 0).toLocaleString()})`;
              
              return `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.04); transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.01)'" onmouseout="this.style.background='transparent'">
                  <td style="padding: 16px; display: flex; align-items: center; gap: 12px;">
                    <img src="${attr(mediaUrl(p.image))}" alt="" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover; border: 1px solid rgba(255,255,255,0.06);" />
                    <div>
                      <div style="font-weight: 600; color: #f0ece4; font-size: 14px;">${escapeHtml(p.title)}</div>
                      <div style="font-size: 11px; color: var(--gold); font-weight: 500; text-transform: uppercase; margin-top: 2px;">${escapeHtml(p.code)}</div>
                    </div>
                  </td>
                  <td style="padding: 16px;">${escapeHtml(categoryName)}</td>
                  <td style="padding: 16px; text-align: right; font-weight: 600; color: #fff;">$${p.price}</td>
                  <td style="padding: 16px;">${formattedStitches}</td>
                  <td style="padding: 16px;">
                    <div>Speed: <strong>${p.rpm} RPM</strong></div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px;">Est: ${p.estimatedEmbroideryTime} mins</div>
                  </td>
                  <td style="padding: 16px; text-align: center;">
                    <div style="display: flex; gap: 8px; justify-content: center;">
                      <button class="admin-product-edit-btn" data-id="${p.id}" style="padding: 6px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #fff; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 4px; transition: all 0.15s;" onmouseover="this.style.borderColor='var(--gold)'; this.style.color='var(--gold)';" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.color='#fff';">
                        ${icon("edit-2", 12)} Edit
                      </button>
                      <button class="admin-product-delete-btn" data-id="${p.id}" style="padding: 6px 12px; background: rgba(239, 83, 80, 0.1); border: 1px solid rgba(239, 83, 80, 0.25); border-radius: 4px; color: #ef5350; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 4px; transition: all 0.15s;" onmouseover="this.style.background='rgba(239, 83, 80, 0.2)'" onmouseout="this.style.background='rgba(239, 83, 80, 0.1)'">
                        ${icon("trash-2", 12)} Delete
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
            ${filteredProducts.length === 0 ? `
              <tr>
                <td colspan="6" style="padding: 40px; text-align: center; color: rgba(255,255,255,0.45);">
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

function renderComingSoon(title, description, iconName) {
  return `
    <div class="admin-module">
      <div class="admin-module-header">
        <h1 class="admin-module-title">${title}</h1>
        <p class="admin-module-subtitle">${description}</p>
      </div>
      <div class="admin-coming-soon">
        <div class="admin-coming-soon-icon"><i data-lucide="${iconName}"></i></div>
        <h3>Coming in Phase 16</h3>
        <p>This module will be fully functional in the Admin CMS phase. The route is secured and protected — only admins with <code>profiles.role = 'admin'</code> can reach this page.</p>
        <a href="#/admin-dashboard" class="admin-back-link">
          <i data-lucide="arrow-left"></i>
          Back to Dashboard
        </a>
      </div>
    </div>
  `;
}

function renderModule(section) {
  const moduleMap = {
    "dashboard": () => renderDashboardOverview(),
    "products": () => renderProductsModule(),
    "categories": () => renderComingSoon("Categories", "Organize designs into categories.", "tag"),
    "collections": () => renderComingSoon("Collections", "Curate featured design collections.", "layers"),
    "orders": () => renderComingSoon("Orders", "View and manage customer orders.", "shopping-bag"),
    "custom-requests": () => renderComingSoon("Custom Requests", "Review digitizing requests from customers.", "pencil-ruler"),
    "customers": () => renderComingSoon("Customers", "Browse and manage customer accounts.", "users"),
    "content": () => renderComingSoon("Site Content", "Edit hero text, CTA sections, and brand copy.", "file-text"),
    "testimonials": () => renderComingSoon("Testimonials", "Manage customer testimonials displayed on the home page.", "message-square"),
    "faqs": () => renderComingSoon("FAQs", "Add and update frequently asked questions.", "help-circle"),
    "media": () => renderComingSoon("Media Library", "Upload and manage images and design files.", "image"),
    "settings": () => renderComingSoon("Settings", "Configure store-wide settings and preferences.", "settings")
  };

  const renderer = moduleMap[section];
  return renderer ? renderer() : renderComingSoon("Unknown Section", "This section is not recognized.", "alert-circle");
}

// ==========================================
// MAIN RENDER EXPORT
// ==========================================

export function renderAdminDashboard(params = {}) {
  const activeSection = getActiveSection(params);

  return `
    <div class="admin-shell" id="adminShell">
      ${renderSidebar(activeSection)}
      <div class="admin-main" id="adminMain">
        <header class="admin-topbar" id="adminTopbar">
          <button class="admin-menu-toggle" id="adminMenuToggle" aria-label="Toggle sidebar">
            <i data-lucide="menu"></i>
          </button>
          <div class="admin-topbar-breadcrumb">
            <span>Admin</span>
            <i data-lucide="chevron-right"></i>
            <span>${activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace("-", " ")}</span>
          </div>
          <div class="admin-topbar-actions">
            <a href="#/" class="admin-topbar-link" target="_blank" rel="noopener">
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
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("admin-sidebar--open");
    });
  }

  // Logout button
  const logoutBtn = document.getElementById("adminLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await logout();
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
      // Keep focus on the search input after render
      const input = document.getElementById("adminProductSearch");
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
  });

  // Action Click handlers
  document.addEventListener("click", async (e) => {
    // Add Design Clicked
    if (e.target.closest("#adminAddProductBtn")) {
      isAddingProduct = true;
      editingProduct = null;
      triggerRender();
      return;
    }
    
    // Cancel Form Clicked
    if (e.target.closest(".admin-product-cancel-btn")) {
      isAddingProduct = false;
      editingProduct = null;
      triggerRender();
      return;
    }
    
    // Edit Button Clicked
    const editBtn = e.target.closest(".admin-product-edit-btn");
    if (editBtn) {
      const id = editBtn.dataset.id;
      const prod = site.products.find(p => p.id === id);
      if (prod) {
        editingProduct = prod;
        isAddingProduct = false;
        triggerRender();
      }
      return;
    }
    
    // Delete Button Clicked
    const deleteBtn = e.target.closest(".admin-product-delete-btn");
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      const prod = site.products.find(p => p.id === id);
      if (prod && confirm(`Are you sure you want to delete "${prod.title}"?`)) {
        try {
          await productService.deleteProduct(id);
          showToast("Design deleted successfully!");
          
          const freshProds = await productService.getProducts();
          site.products = freshProds;
          triggerRender();
        } catch (err) {
          console.error("Error deleting product:", err);
          showToast(`Failed to delete: ${err.message}`);
        }
      }
      return;
    }
  });

  // Product Form Submission
  document.addEventListener("submit", async (e) => {
    if (e.target.id === "adminProductForm") {
      e.preventDefault();
      
      const submitBtn = e.target.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Saving Design...";
      }
      
      const formData = new FormData(e.target);
      const id = formData.get("id");
      
      const tagsStr = formData.get("tags") || "";
      const tags = tagsStr.split(",").map(t => t.trim()).filter(Boolean);
      
      const fabricsStr = formData.get("recommendedFabrics") || "";
      const recommendedFabrics = fabricsStr.split(",").map(t => t.trim()).filter(Boolean);
      
      const price = Number(formData.get("price") || 0);
      const title = formData.get("title");
      
      let formats = [];
      if (id) {
        const existing = site.products.find(p => p.id === id);
        if (existing) {
          formats = existing.formats || [];
          formats.forEach(f => f.price = price);
        }
      }
      if (formats.length === 0) {
        formats = [
          { format: "DST", machineBrand: "Tajima", machineModel: "TMEZ-SC", hoopSize: "200mm x 200mm", price },
          { format: "PES", machineBrand: "Brother", machineModel: "PR1055X", hoopSize: "200mm x 200mm", price },
          { format: "EXP", machineBrand: "Bernina", machineModel: "E16", hoopSize: "200mm x 200mm", price },
          { format: "JEF", machineBrand: "Janome", machineModel: "MC550E", hoopSize: "200mm x 200mm", price },
          { format: "XXX", machineBrand: "Singer", machineModel: "EM9305", hoopSize: "200mm x 200mm", price }
        ];
      }
      
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
        image: formData.get("image"),
        gallery: [formData.get("image")],
        difficultyLevel: formData.get("difficultyLevel") || "Intermediate",
        recommendedFabrics,
        tags,
        formats,
        featured: true,
        bestSeller: true
      };

      try {
        if (id) {
          await productService.updateProduct(id, prodPayload);
          showToast("Design updated successfully!");
        } else {
          await productService.createProduct(prodPayload);
          showToast("Design added successfully!");
        }
        
        const freshProds = await productService.getProducts();
        site.products = freshProds;
        
        isAddingProduct = false;
        editingProduct = null;
        triggerRender();
      } catch (err) {
        console.error("Error saving product:", err);
        showToast(`Failed to save: ${err.message}`);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "Save Design";
        }
      }
    }
  });
}
