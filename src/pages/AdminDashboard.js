import { currentUser, logout, showToast } from "../services/store.js";
import { navigate } from "../services/router.js";
import { icon } from "../utils/helpers.js";

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
        <div class="admin-user-card">
          <div class="admin-user-avatar">
            ${currentUser ? currentUser.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div class="admin-user-info">
            <span class="admin-user-name">${currentUser ? currentUser.name : "Admin"}</span>
            <span class="admin-user-email">${currentUser ? currentUser.email : ""}</span>
          </div>
        </div>
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
    "products": () => renderComingSoon("Products", "Manage your embroidery design catalog.", "package"),
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
}
