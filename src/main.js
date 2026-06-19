import { initDB } from "./services/db.js";
import { initRouter } from "./services/router.js";
import { MediaLibrary } from "./services/media.js";
import { loadConfig } from "./services/config.js";
import {
  site,
  wishlist,
  cart,
  ui,
  currentUser,
  onStateChange,
  triggerRender,
  addToCart,
  updateCartQty,
  removeFromCart,
  updateCartItemFormat,
  toggleWishlist,
  showToast,
  closePanels,
  syncAdminFields,
  resetSite,
  applyJson,
  setPage,
  setByPath,
  saveSite,
  saveCommerce,
  getCategories,
  saveCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  initAuth,
  syncFromSupabase,
  initRealtimeSubscriptions,
  login,
  logout,
  onAuthChange
} from "./services/store.js";
import { storageService } from "./services/supabase.js";
import { clone, escapeHtml, attr, icon, money } from "./utils/helpers.js";

// Components
import { renderHeader } from "./components/Header.js";
import { renderFooter } from "./components/Footer.js";
import { renderFloatingActions } from "./components/FloatingActions.js";
import { renderSearchOverlay } from "./components/SearchOverlay.js";
import { renderCartDrawer } from "./components/CartDrawer.js";
import { renderQuoteModal } from "./components/QuoteModal.js";
import { renderStoryModal } from "./components/StoryModal.js";
import { renderToast } from "./components/Toast.js";
import {
  renderAdminDrawer,
  adminTab,
  editingCategoryId,
  isCreating,
  targetParentId,
  setAdminTab,
  showCreateCategoryForm,
  showEditCategoryForm,
  cancelCategoryForm
} from "./components/AdminDrawer.js";
import { renderQuickViewModal } from "./components/QuickViewModal.js";

// Pages
import { renderHome } from "./pages/Home.js";
import { renderCatalog, catalogState } from "./pages/Catalog.js";
import { renderProductDetail, initProductDetailEvents } from "./pages/ProductDetail.js";
import { renderCustomOrder, initCustomOrderEvents } from "./pages/CustomOrder.js";
import { renderCart } from "./pages/Cart.js";
import { renderWishlist } from "./pages/Wishlist.js";
import { renderCheckout, initCheckoutEvents } from "./pages/Checkout.js";
import { renderAuth, initAuthDelegates } from "./pages/Auth.js";
import { renderAdminDashboard, initAdminDashboardDelegates } from "./pages/AdminDashboard.js";
import { renderNotFound, initNotFoundEvents } from "./pages/NotFound.js";
import { renderOrderTracking, initOrderTrackingDelegates } from "./pages/OrderTracking.js";
import { renderAccount, initAccountDelegates, loadAccountData } from "./pages/Account.js";

const app = document.getElementById("app");
let lastLoadedPage = "";
let notFoundAnalyticsEmitted = false;

// Apply variables to CSS root
function applyTheme() {
  const root = document.documentElement;
  Object.entries(site.theme).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}

// Master Render loop
function render() {
  applyTheme();

  // Page switcher
  let pageContent = "";
  switch (ui.page) {
    case "home":
      pageContent = renderHome();
      break;
    case "catalog":
      pageContent = renderCatalog();
      break;
    case "product-detail":
      pageContent = renderProductDetail();
      break;
    case "custom-order":
      pageContent = renderCustomOrder();
      break;
    case "cart":
      pageContent = renderCart();
      break;
    case "wishlist":
      pageContent = renderWishlist();
      break;
    case "checkout":
      pageContent = renderCheckout();
      break;
    case "track-order":
      pageContent = renderOrderTracking();
      break;
    case "account":
      pageContent = renderAccount();
      break;
    case "auth":
      pageContent = renderAuth();
      break;
    case "admin-dashboard":
      pageContent = renderAdminDashboard(ui.pageParams);
      break;
    case "404":
      pageContent = renderNotFound();
      break;
    default:
      pageContent = renderHome();
  }

  // Admin dashboard gets its own full-screen shell — no site header/footer
  if (ui.page === "admin-dashboard") {
    app.innerHTML = `
      <div class="admin-page-wrapper">
        ${pageContent}
        ${renderToast()}
      </div>
    `;
    afterRender();
    return;
  }

  // Shell Layout (all non-admin pages)
  app.innerHTML = `
    <div class="site-shell">
      ${renderHeader()}
      <main>
        ${pageContent}
      </main>
      ${renderFooter()}
      ${renderFloatingActions()}
      ${ui.searchOpen ? renderSearchOverlay() : ""}
      ${ui.cartOpen ? renderCartDrawer() : ""}
      ${ui.quoteOpen ? renderQuoteModal() : ""}
      ${ui.storyOpen ? renderStoryModal() : ""}
      ${ui.adminOpen ? renderAdminDrawer() : ""}
      ${ui.quickViewProductId ? renderQuickViewModal(ui.quickViewProductId) : ""}
      ${renderToast()}
    </div>
  `;

  afterRender();
}


function afterRender() {
  // Bind Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Initialize Product Detail events if active page
  if (ui.page === "product-detail") {
    initProductDetailEvents();
  }

  // Initialize Custom Order events if active page
  if (ui.page === "custom-order") {
    initCustomOrderEvents();
  }

  // Initialize Checkout events if active page
  if (ui.page === "checkout") {
    initCheckoutEvents();
  }

  // Initialize Order Tracking events if active page
  if (ui.page === "track-order") {
    initOrderTrackingDelegates();
  }

  // Initialize Account events and trigger loading if active page
  if (ui.page === "account") {
    initAccountDelegates();
    if (lastLoadedPage !== "account") {
      lastLoadedPage = "account";
      loadAccountData();
    }
  } else if (ui.page !== "account" && lastLoadedPage === "account") {
    lastLoadedPage = ""; // Reset tracker if navigating away
  }

  // Initialize Auth events if active page
  if (ui.page === "auth") {
    initAuthDelegates();
  }

  // Initialize Admin Dashboard events if active page
  if (ui.page === "admin-dashboard") {
    initAdminDashboardDelegates();
  }

  // Initialize NotFound events if active page
  if (ui.page === "404") {
    if (!notFoundAnalyticsEmitted) {
      notFoundAnalyticsEmitted = true;
      initNotFoundEvents();
    }
  } else {
    notFoundAnalyticsEmitted = false;
  }

  // Focus search input ONLY if it just opened and nothing else has focus
  const searchInput = document.getElementById("searchInput");
  if (searchInput && document.activeElement === document.body) {
    searchInput.focus();
    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
  }

  // Restore catalog search focus only when it was previously active
  const catSearchInput = document.getElementById("catalogSearchInput");
  if (catSearchInput && document.activeElement && document.activeElement.id === "catalogSearchInput") {
    catSearchInput.focus();
    catSearchInput.setSelectionRange(catSearchInput.value.length, catSearchInput.value.length);
  }

  // Observe scroll reveals
  document.querySelectorAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });

  updateHeaderState();
}

// Intersection Observer for scroll reveals
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.16 }
);

function updateHeaderState() {
  const header = document.getElementById("siteHeader");
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
  document.documentElement.style.setProperty("--scroll-y", `${window.scrollY}px`);
}

function scrollToTarget(target) {
  closePanels();
  triggerRender();
  requestAnimationFrame(() => {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function syncAdminDrawerInputs() {
  document.querySelectorAll("[data-setting]").forEach((field) => {
    setByPath(site, field.dataset.setting, field.value);
  });
  saveSite();
  applyTheme();
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(site, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "godavari-designer-content.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

// Event delegation
document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;

  const action = trigger.dataset.action;

  if (action === "scroll-to") {
    // If not on Home page, navigate to Home first, then scroll
    if (ui.page !== "home") {
      window.location.hash = "#/";
      setTimeout(() => {
        scrollToTarget(trigger.dataset.target);
      }, 100);
    } else {
      scrollToTarget(trigger.dataset.target);
    }
  }

  if (action === "open-search") {
    ui.searchQuery = trigger.dataset.query || ui.searchQuery;
    ui.searchOpen = true;
    ui.adminOpen = false;
    triggerRender();
  }

  if (action === "open-admin") {
    if (currentUser && currentUser.role === "admin") {
      window.location.hash = "#/admin-dashboard";
    } else {
      ui.adminOpen = true;
      ui.searchOpen = false;
      triggerRender();
    }
  }

  if (action === "open-cart") {
    ui.cartOpen = true;
    triggerRender();
  }

  if (action === "open-quote") {
    ui.quoteOpen = true;
    ui.cartOpen = false;
    triggerRender();
  }

  if (action === "open-story") {
    ui.storyOpen = true;
    triggerRender();
  }

  if (action === "close-panels") {
    closePanels();
    triggerRender();
  }

  if (action === "add-cart") {
    addToCart(trigger.dataset.id, trigger.dataset.format);
  }

  if (action === "toggle-wishlist") {
    toggleWishlist(trigger.dataset.id);
  }

  if (action === "wishlist-remove") {
    toggleWishlist(trigger.dataset.id);
    showToast("Design removed from wishlist");
  }

  if (action === "wishlist-to-cart") {
    const id = trigger.dataset.id;
    const format = trigger.dataset.format || "DST";
    addToCart(id, format);
    toggleWishlist(id); // Transfer item (remove from wishlist)
  }

  if (action === "remove-cart") {
    removeFromCart(trigger.dataset.id, trigger.dataset.format);
  }

  if (action === "cart-minus") {
    updateCartQty(trigger.dataset.id, -1, trigger.dataset.format);
  }
  if (action === "cart-plus") {
    updateCartQty(trigger.dataset.id, 1, trigger.dataset.format);
  }

  if (action === "open-collection") {
    const label = trigger.dataset.label;
    catalogState.selectedCategory = label;
    window.location.hash = "#/catalog";
    closePanels();
    triggerRender();
  }

  if (action === "scroll-carousel") {
    const target = document.getElementById(trigger.dataset.target);
    const direction = Number(trigger.dataset.direction || 1);
    target?.scrollBy({ left: direction * 420, behavior: "smooth" });
  }

  if (action === "copy-email") {
    navigator.clipboard?.writeText(site.brand.contact.email);
    showToast("Email copied to clipboard");
  }

  // --- Search Submit (overlay) ---
  if (action === "search-submit") {
    const q = ui.searchQuery.trim();
    if (q) {
      window.location.hash = `#/catalog?search=${encodeURIComponent(q)}`;
    }
    closePanels();
    triggerRender();
  }

  if (action === "search-clear") {
    ui.searchQuery = "";
    triggerRender();
    // Refocus the input after clear
    setTimeout(() => {
      document.getElementById("searchInput")?.focus();
    }, 50);
  }

  // --- Catalog Filters ---
  if (action === "filter-category") {
    catalogState.selectedCategory = trigger.dataset.value;
    catalogState.selectedSubcategory = "All";
    catalogState.visibleLimit = 8;
    triggerRender();
  }

  if (action === "filter-subcategory") {
    catalogState.selectedSubcategory = trigger.dataset.value;
    catalogState.visibleLimit = 8;
    triggerRender();
  }

  if (action === "filter-collection") {
    catalogState.selectedCollection = trigger.dataset.value;
    catalogState.visibleLimit = 8;
    triggerRender();
  }

  if (action === "toggle-more-filters") {
    catalogState.moreFiltersOpen = !catalogState.moreFiltersOpen;
    triggerRender();
  }

  if (action === "apply-more-filters") {
    catalogState.selectedCollection = document.getElementById("filterCollectionSelect")?.value || "All";
    catalogState.minPrice = parseFloat(document.getElementById("priceMinInput")?.value || "0");
    catalogState.maxPrice = parseFloat(document.getElementById("priceMaxInput")?.value || "100");
    catalogState.minStitchCount = parseInt(document.getElementById("stitchMinInput")?.value || "0");
    catalogState.maxStitchCount = parseInt(document.getElementById("stitchMaxInput")?.value || "100000");
    catalogState.selectedColors = document.getElementById("filterColorsSelect")?.value || "All";
    catalogState.selectedFormat = document.getElementById("filterFormatSelect")?.value || "All";
    catalogState.selectedBrand = document.getElementById("filterBrandSelect")?.value || "All";
    catalogState.selectedHoop = document.getElementById("filterHoopSelect")?.value || "All";
    catalogState.selectedDifficulty = document.getElementById("filterDifficultySelect")?.value || "All";
    catalogState.filterFeatured = document.getElementById("filterFeaturedCheck")?.checked || false;
    catalogState.filterBestSeller = document.getElementById("filterBestSellerCheck")?.checked || false;
    catalogState.visibleLimit = 8;
    triggerRender();
  }

  if (action === "reset-catalog-filters") {
    catalogState.searchQuery = "";
    catalogState.selectedCategory = "All";
    catalogState.selectedSubcategory = "All";
    catalogState.selectedCollection = "All";
    catalogState.minPrice = 0;
    catalogState.maxPrice = 100;
    catalogState.selectedDifficulty = "All";
    catalogState.selectedBrand = "All";
    catalogState.selectedFormat = "All";
    catalogState.selectedHoop = "All";
    catalogState.minStitchCount = 0;
    catalogState.maxStitchCount = 100000;
    catalogState.selectedColors = "All";
    catalogState.filterFeatured = false;
    catalogState.filterBestSeller = false;
    catalogState.visibleLimit = 8;
    triggerRender();
  }

  if (action === "load-more-designs") {
    catalogState.visibleLimit += 8;
    triggerRender();
  }

  // --- Quick View Actions ---
  if (action === "quick-view") {
    ui.quickViewProductId = trigger.dataset.id;
    triggerRender();
  }

  if (action === "swap-qv-image") {
    const mainImg = document.getElementById("quickviewMainImg");
    if (mainImg) {
      mainImg.src = trigger.dataset.src;
    }
    document.querySelectorAll(".thumb-btn").forEach(btn => btn.classList.remove("active"));
    trigger.classList.add("active");
  }

  if (action === "qv-add-cart") {
    const format = document.getElementById("qvFileFormat")?.value || "DST";
    addToCart(trigger.dataset.id);
    showToast(`Added design with format ${format}`);
    closePanels();
    triggerRender();
  }

  // --- Admin Category CMS actions ---
  if (action === "set-admin-tab") {
    setAdminTab(trigger.dataset.tab);
    triggerRender();
  }

  if (action === "add-category-btn") {
    showCreateCategoryForm();
    triggerRender();
  }

  if (action === "add-subcategory-btn") {
    showCreateCategoryForm(trigger.dataset.parentId);
    triggerRender();
  }

  if (action === "edit-category-btn") {
    showEditCategoryForm(trigger.dataset.id);
    triggerRender();
  }

  if (action === "cancel-category-form") {
    cancelCategoryForm();
    triggerRender();
  }

  if (action === "delete-category-btn") {
    if (window.confirm("Are you sure you want to delete this category? Deleting a parent category will delete all its subcategories.")) {
      deleteCategory(trigger.dataset.id);
      showToast("Category deleted successfully");
    }
  }

  if (action === "reorder-category-up") {
    const cats = getCategories();
    const targetId = trigger.dataset.id;
    const cat = cats.find(c => c.id === targetId);
    if (cat) {
      const sameLevel = cats.filter(c => c.parentCategoryId === cat.parentCategoryId).sort((a,b)=>a.displayOrder - b.displayOrder);
      const idx = sameLevel.findIndex(c => c.id === targetId);
      if (idx > 0) {
        // Swap displayOrders
        const prev = sameLevel[idx - 1];
        const temp = cat.displayOrder;
        cat.displayOrder = prev.displayOrder;
        prev.displayOrder = temp;
        saveCategories(cats);
        showToast("Category order updated");
      }
    }
  }

  if (action === "reorder-category-down") {
    const cats = getCategories();
    const targetId = trigger.dataset.id;
    const cat = cats.find(c => c.id === targetId);
    if (cat) {
      const sameLevel = cats.filter(c => c.parentCategoryId === cat.parentCategoryId).sort((a,b)=>a.displayOrder - b.displayOrder);
      const idx = sameLevel.findIndex(c => c.id === targetId);
      if (idx !== -1 && idx < sameLevel.length - 1) {
        // Swap displayOrders
        const next = sameLevel[idx + 1];
        const temp = cat.displayOrder;
        cat.displayOrder = next.displayOrder;
        next.displayOrder = temp;
        saveCategories(cats);
        showToast("Category order updated");
      }
    }
  }

  // --- Admin actions ---
  if (action === "save-admin") {
    syncAdminDrawerInputs();
    ui.adminOpen = false;
    showToast("Homepage settings updated");
  }

  if (action === "reset-site") {
    if (window.confirm("Reset the homepage content to the default Godavari design?")) {
      resetSite();
      showToast("Homepage content reset");
    }
  }

  if (action === "export-site") {
    syncAdminDrawerInputs();
    downloadJson();
  }

  if (action === "apply-json") {
    const editor = document.getElementById("siteJsonEditor");
    applyJson(editor?.value);
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "searchInput") {
    ui.searchQuery = event.target.value;
    triggerRender();
  }
  
  if (event.target.id === "catalogSearchInput") {
    catalogState.searchQuery = event.target.value;
    triggerRender();
    const input = document.getElementById("catalogSearchInput");
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }

  const settingField = event.target.closest("[data-setting]");
  if (settingField && settingField.type === "color") {
    setByPath(site, settingField.dataset.setting, settingField.value);
    saveSite();
    applyTheme();
  }
});

document.addEventListener("change", (event) => {
  const trigger = event.target.closest("[data-action]");

  if (trigger && trigger.dataset.action === "change-item-format") {
    const id = trigger.dataset.id;
    const oldFormat = trigger.dataset.format;
    const newFormat = event.target.value;
    updateCartItemFormat(id, oldFormat, newFormat);
    showToast(`Format updated to ${newFormat}`);
    return;
  }

  if (trigger && trigger.dataset.action === "sort-catalog") {
    catalogState.sortBy = event.target.value;
    triggerRender();
  }

  // --- Catalog Filters Instant Sync ---
  if (event.target.id === "filterCollectionSelect") {
    catalogState.selectedCollection = event.target.value;
    triggerRender();
  }
  if (event.target.id === "filterColorsSelect") {
    catalogState.selectedColors = event.target.value;
    triggerRender();
  }
  if (event.target.id === "filterFormatSelect") {
    catalogState.selectedFormat = event.target.value;
    triggerRender();
  }
  if (event.target.id === "filterBrandSelect") {
    catalogState.selectedBrand = event.target.value;
    triggerRender();
  }
  if (event.target.id === "filterHoopSelect") {
    catalogState.selectedHoop = event.target.value;
    triggerRender();
  }
  if (event.target.id === "filterDifficultySelect") {
    catalogState.selectedDifficulty = event.target.value;
    triggerRender();
  }
  if (event.target.id === "filterFeaturedCheck") {
    catalogState.filterFeatured = event.target.checked;
    triggerRender();
  }
  if (event.target.id === "filterBestSellerCheck") {
    catalogState.filterBestSeller = event.target.checked;
    triggerRender();
  }

  // --- Category CMS File Upload ---
  if (event.target.classList.contains("category-image-upload")) {
    const file = event.target.files[0];
    if (file) {
      const filename = `cat-${Date.now()}-${file.name}`;
      storageService.uploadImage(file, filename)
        .then((url) => {
          const input = document.querySelector('input[name="image"]');
          if (input) {
            input.value = url;
            showToast("Cover image uploaded to cloud");
            triggerRender();
          }
        })
        .catch((err) => {
          showToast(`Upload failed: ${err.message}`);
        });
    }
  }

  if (event.target.classList.contains("category-banner-upload")) {
    const file = event.target.files[0];
    if (file) {
      const filename = `banner-${Date.now()}-${file.name}`;
      storageService.uploadImage(file, filename)
        .then((url) => {
          const input = document.querySelector('input[name="bannerImage"]');
          if (input) {
            input.value = url;
            showToast("Banner image uploaded to cloud");
            triggerRender();
          }
        })
        .catch((err) => {
          showToast(`Upload failed: ${err.message}`);
        });
    }
  }

  const settingField = event.target.closest("[data-setting]");
  if (settingField) {
    setByPath(site, settingField.dataset.setting, settingField.value);
    saveSite();
    applyTheme();
  }
});

document.addEventListener("submit", (event) => {
  // Category CRUD Form Submit handler
  if (event.target.id === "categoryForm") {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
      parentCategoryId: formData.get("parentCategoryId") || null,
      name: formData.get("name"),
      slug: formData.get("slug"),
      image: formData.get("image") || "media-collection-bridal",
      bannerImage: formData.get("bannerImage") || "media-collection-bridal",
      description: formData.get("description"),
      featured: formData.get("featured") === "on",
      seoTitle: formData.get("seoTitle"),
      seoDescription: formData.get("seoDescription"),
      displayOrder: parseInt(formData.get("displayOrder") || "1"),
      updatedAt: new Date().toISOString()
    };

    if (editingCategoryId) {
      updateCategory(editingCategoryId, data);
      showToast("Category updated successfully");
    } else {
      const newCat = {
        id: "cat-" + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        ...data
      };
      createCategory(newCat);
      showToast("Category created successfully");
    }
    cancelCategoryForm();
    triggerRender();
  }

  // Admin Login Form Submit handler
  if (event.target.id === "adminLoginForm") {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");

    const submitBtn = event.target.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Signing in...";
    }

    login(email, password).then((success) => {
      if (success) {
        window.location.hash = "#/admin";
      } else {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = "Sign In";
        }
      }
    });
  }

  if (event.target.id === "quoteForm") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    localStorage.setItem(
      "godavari-designer-last-quote",
      JSON.stringify({ ...data, cart, submittedAt: new Date().toISOString() })
    );
    closePanels();
    showToast("Quote request submitted successfully");
  }

  if (event.target.id === "newsletterForm") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    localStorage.setItem(
      "godavari-designer-newsletter",
      JSON.stringify({ ...data, submittedAt: new Date().toISOString() })
    );
    event.target.reset();
    showToast("Subscribed to newsletter!");
  }
});

// Scroll & Mousemove handlers
window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("mousemove", (event) => {
  const x = (event.clientX / window.innerWidth - 0.5).toFixed(3);
  const y = (event.clientY / window.innerHeight - 0.5).toFixed(3);
  document.documentElement.style.setProperty("--mouse-x", x);
  document.documentElement.style.setProperty("--mouse-y", y);
});

// Bootstrap Application
async function bootstrap() {
  initDB();
  onStateChange(render);
  initRouter();
  
  // Enforce route security dynamically when auth state resolves
  onAuthChange(() => {
    import("./services/router.js").then(({ handleRouting }) => {
      handleRouting();
    });
  });

  render(); // Instant initial render using default & cached state!

  // Perform network initialization asynchronously in the background
  try {
    await loadConfig(); // Fast local config load
    initAuth().then(() => {
      syncFromSupabase();
      initRealtimeSubscriptions();
    });
  } catch (err) {
    console.error("Non-blocking boot initialization warning:", err);
  }
}

bootstrap().catch((err) => {
  console.error("Critical boot error:", err);
});
