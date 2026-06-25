window.addEventListener("error", (e) => {
  const errorMsg = `JS_ERROR: ${e.message} at ${e.filename}:${e.lineno}:${e.colno}`;
  console.error(errorMsg);
  fetch(`/error-log?msg=${encodeURIComponent(errorMsg)}`).catch(() => {});
});

window.addEventListener("unhandledrejection", (e) => {
  const errorMsg = `JS_REJECTION: ${e.reason ? e.reason.message || e.reason : 'Unknown reason'}`;
  console.error(errorMsg);
  fetch(`/error-log?msg=${encodeURIComponent(errorMsg)}`).catch(() => {});
});

import { initDB } from "./services/db.js?v=6";
import { initRouter } from "./services/router.js?v=6";
import { MediaLibrary } from "./services/media.js?v=6";
import { loadConfig } from "./services/config.js?v=6";
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
  onAuthChange,
  submitCartQuote,
  clearCartQuoteResult,
  submitQuoteModal
} from "./services/store.js?v=6";
import { storageService } from "./services/supabase.js?v=6";
import { clone, escapeHtml, attr, icon, money, isMobileViewport, mediaUrl } from "./utils/helpers.js?v=6";

// Components
import { renderHeader } from "./components/Header.js?v=6";
import { renderFooter } from "./components/Footer.js?v=6";
import { renderFloatingActions } from "./components/FloatingActions.js?v=6";
import { renderSearchOverlay } from "./components/SearchOverlay.js?v=6";
import { renderCartDrawer } from "./components/CartDrawer.js?v=6";
import { renderQuoteModal } from "./components/QuoteModal.js?v=6";
import { renderStoryModal } from "./components/StoryModal.js?v=6";
import { renderToast } from "./components/Toast.js?v=6";
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
} from "./components/AdminDrawer.js?v=6";
import { renderQuickViewModal } from "./components/QuickViewModal.js?v=6";
import { renderBottomNavigation } from "./components/BottomNavigation.js?v=6";
import { renderMobileDrawer } from "./components/MobileDrawer.js?v=6";
import { renderMobileShell } from "./components/mobile/MobileShell.js?v=6";


// Pages
import { renderHome } from "./pages/Home.js?v=6";
import { renderCatalog, catalogState } from "./pages/Catalog.js?v=6";
import { renderProductDetail, initProductDetailEvents } from "./pages/ProductDetail.js?v=6";
import { renderCustomOrder, initCustomOrderEvents } from "./pages/CustomOrder.js?v=6";
import { renderCart } from "./pages/Cart.js?v=6";
import { renderWishlist } from "./pages/Wishlist.js?v=6";
import { renderCheckout, initCheckoutEvents } from "./pages/Checkout.js?v=6";
import { renderAuth, initAuthDelegates } from "./pages/Auth.js?v=6";
import { renderAdminDashboard, initAdminDashboardDelegates } from "./pages/AdminDashboard.js?v=6";
import { renderNotFound, initNotFoundEvents } from "./pages/NotFound.js?v=6";
import { renderOrderTracking, initOrderTrackingDelegates } from "./pages/OrderTracking.js?v=6";
import { renderAccount, initAccountDelegates, loadAccountData } from "./pages/Account.js?v=6";

// Company & Support Pages
import {
  renderAboutUs,
  renderOurProcess,
  renderWhyGodavari,
  renderReviews,
  renderCareers
} from "./pages/CompanyPages.js?v=6";
import {
  renderFAQs,
  renderShippingDelivery,
  renderReturnsRefunds,
  renderTermsService,
  renderPrivacyPolicy
} from "./pages/SupportPages.js?v=6";
import { renderServicePage } from "./pages/ServicePages.js?v=6";
import { renderLocationPage } from "./pages/LocationPages.js?v=6";

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

function renderLoadingAuth() {
  return `
    <div class="loading-auth-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; font-family: var(--font-sans); color: var(--navy); text-align: center; padding: 24px;">
      <!-- Elegant Spinner -->
      <div class="luxury-spinner" style="width: 48px; height: 48px; border: 2px solid var(--border); border-top: 2px solid var(--gold); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 24px;"></div>
      <h2 style="font-family: var(--font-serif); font-size: 24px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.01em;">Godavari Designer</h2>
      <p style="color: var(--ink-soft); font-size: 14px; margin: 0;">Restoring secure session...</p>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
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
    case "loading-auth":
      pageContent = renderLoadingAuth();
      break;
    case "about-us":
      pageContent = renderAboutUs();
      break;
    case "our-process":
      pageContent = renderOurProcess();
      break;
    case "why-godavari":
      pageContent = renderWhyGodavari();
      break;
    case "reviews":
      pageContent = renderReviews();
      break;
    case "careers":
      pageContent = renderCareers();
      break;
    case "faqs":
      pageContent = renderFAQs();
      break;
    case "shipping-delivery":
      pageContent = renderShippingDelivery();
      break;
    case "returns-refunds":
      pageContent = renderReturnsRefunds();
      break;
    case "terms-of-service":
      pageContent = renderTermsService();
      break;
    case "privacy-policy":
      pageContent = renderPrivacyPolicy();
      break;
    case "service-detail":
      pageContent = renderServicePage(ui.pageParams.service);
      break;
    case "location-detail":
      pageContent = renderLocationPage(ui.pageParams.location);
      break;
    case "404":
      pageContent = renderNotFound();
      break;
    default:
      pageContent = renderHome();
  }

  // Admin dashboard and loading state get their own full-screen shell — no site header/footer
  if (ui.page === "admin-dashboard" || ui.page === "loading-auth") {
    app.innerHTML = `
      <div class="full-screen-wrapper">
        ${pageContent}
        ${renderToast()}
      </div>
    `;
    afterRender();
    return;
  }

  if (isMobileViewport()) {
    app.innerHTML = renderMobileShell(pageContent);
  } else {
    app.innerHTML = `
      <div class="site-shell desktop-shell">
        ${renderHeader(false)}
        <main>
          ${pageContent}
        </main>
        ${renderFooter()}
        ${renderFloatingActions()}
        ${ui.searchOpen ? renderSearchOverlay() : ""}
        ${ui.cartOpen ? renderCartDrawer() : ""}
        ${ui.quoteOpen ? renderQuoteModal() : ""}
        ${ui.storyOpen ? renderStoryModal() : ""}
        ${ui.adminOpen && currentUser && currentUser.role === "admin" ? renderAdminDrawer() : ""}
        ${ui.quickViewProductId ? renderQuickViewModal(ui.quickViewProductId) : ""}
        ${renderToast()}
      </div>
    `;
  }

  afterRender();
}


// --- Infinite Scroll Observer ---
let catalogObserver = null;

function stopCatalogInfiniteScroll() {
  if (catalogObserver) {
    catalogObserver.disconnect();
    catalogObserver = null;
  }
}

function initCatalogInfiniteScroll() {
  stopCatalogInfiniteScroll();

  const sentinel = document.getElementById("catalog-sentinel");
  if (!sentinel) return;

  catalogObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const total = parseInt(sentinel.dataset.totalCount || "0", 10);
        const limit = parseInt(sentinel.dataset.limit || "0", 10);
        if (total > limit) {
          catalogState.visibleLimit += 8;
          triggerRender();
        }
      }
    });
  }, {
    rootMargin: "300px"
  });

  catalogObserver.observe(sentinel);
}

// --- Carousel Autoscroll Animations ---
let autoscrollFrameId = null;

function stopCollectionAutoscroll() {
  if (autoscrollFrameId) {
    cancelAnimationFrame(autoscrollFrameId);
    autoscrollFrameId = null;
  }
}

function initCollectionAutoscroll() {
  stopCollectionAutoscroll();

  const track = document.getElementById("collectionTrack");
  if (!track) return;

  const items = Array.from(track.children);
  if (items.length === 0) return;

  const originalScrollWidth = track.scrollWidth;
  const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
  const loopThreshold = originalScrollWidth + gap;

  // If layout is not ready yet (e.g. elements not fully rendered), retry in 100ms
  if (originalScrollWidth === 0) {
    setTimeout(initCollectionAutoscroll, 100);
    return;
  }

  // Clone elements to create at least 3 identical sets for seamless bidirectional scrolling
  const cloneCount = Math.max(2, Math.ceil(track.clientWidth / originalScrollWidth) + 1);
  for (let i = 0; i < cloneCount; i++) {
    items.forEach(item => {
      track.appendChild(item.cloneNode(true));
    });
  }

  let currentScroll = loopThreshold;
  let isPaused = false;
  let isHovered = false;
  let resumeTimeout = null;

  // Disable smooth scroll behavior on the element to prevent jitter during animation
  track.style.scrollBehavior = "auto";
  track.scrollLeft = loopThreshold;

  function step() {
    if (!isPaused) {
      currentScroll += 0.8; // continuous scrolling speed (pixels per frame)
      if (currentScroll >= loopThreshold * 2) {
        currentScroll -= loopThreshold;
      }
      track.scrollLeft = currentScroll;
    }
    autoscrollFrameId = requestAnimationFrame(step);
  }

  // Helper to pause autoscrolling
  const pause = () => {
    isPaused = true;
    if (resumeTimeout) {
      clearTimeout(resumeTimeout);
      resumeTimeout = null;
    }
  };

  // Helper to schedule resumption after scrolling/touch stops
  const scheduleResume = () => {
    if (resumeTimeout) {
      clearTimeout(resumeTimeout);
    }
    resumeTimeout = setTimeout(() => {
      // Only resume if the user is not actively hovering the carousel on desktop
      if (!isHovered) {
        isPaused = false;
      }
    }, 200); // 200ms debounce ensures momentum scrolling has fully stopped
  };

  // Handle wrap-around on scroll events (including user drag/swipe/mousewheel/momentum)
  const handleScroll = () => {
    const sl = track.scrollLeft;
    if (sl >= loopThreshold * 2) {
      track.scrollLeft = sl - loopThreshold;
      currentScroll = track.scrollLeft;
    } else if (sl < loopThreshold) {
      track.scrollLeft = sl + loopThreshold;
      currentScroll = track.scrollLeft;
    } else if (isPaused) {
      currentScroll = sl;
    }

    // If scrolling while paused (i.e. manual interaction or momentum), keep resetting resume timer
    if (isPaused) {
      scheduleResume();
    }
  };

  track.addEventListener("scroll", handleScroll, { passive: true });

  // Pausing interactions
  const container = track.closest(".carousel-shell") || track;

  container.addEventListener("mouseenter", () => {
    isHovered = true;
    pause();
  });
  
  container.addEventListener("mouseleave", () => {
    isHovered = false;
    scheduleResume();
  });
  
  track.addEventListener("touchstart", pause, { passive: true });
  track.addEventListener("touchend", scheduleResume);
  track.addEventListener("touchcancel", scheduleResume);
  track.addEventListener("pointerdown", pause);
  track.addEventListener("pointerup", scheduleResume);

  autoscrollFrameId = requestAnimationFrame(step);
}

function afterRender() {
  // Bind Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Initialize Home page events and autoscrolling
  if (ui.page === "home" || !ui.page) {
    initCollectionAutoscroll();
  } else {
    stopCollectionAutoscroll();
  }

  // Initialize Catalog Infinite Scroll if active page
  if (ui.page === "catalog") {
    initCatalogInfiniteScroll();
  } else {
    stopCatalogInfiniteScroll();
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
  
  const toTop = document.querySelector(".to-top");
  if (toTop) {
    toTop.classList.toggle("visible", window.scrollY > 300);
  }
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

function showImageDownloadModal(imageUrl, filename) {
  const existing = document.getElementById("image-download-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "image-download-modal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "99999";
  modal.style.padding = "20px";
  modal.style.backdropFilter = "blur(5px)";

  modal.innerHTML = `
    <div style="background: #fff; max-width: 480px; width: 100%; border-radius: 12px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 16px; border: 1px solid #E6DED1; font-family: 'Inter', sans-serif; color: #111D42;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E6DED1; padding-bottom: 12px;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 700; font-family: serif;">Download Design Image</h3>
        <button id="close-download-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #8d9b83; font-weight: bold; padding: 0; line-height: 1;">&times;</button>
      </div>
      <p style="font-size: 13px; color: #555; margin: 0; line-height: 1.5;">
        Your browser has security restrictions for direct downloading from remote servers. Please save the image manually:
      </p>
      <ul style="font-size: 13px; color: #555; margin: 0; padding-left: 20px; line-height: 1.6;">
        <li><strong>On Desktop:</strong> Right-click the image below and select <strong>"Save image as..."</strong></li>
        <li><strong>On Mobile/Tablet:</strong> Long-press (tap & hold) the image below and select <strong>"Download image"</strong> or <strong>"Save image"</strong>.</li>
      </ul>
      <div style="border: 1px solid #E6DED1; border-radius: 8px; overflow: hidden; display: flex; justify-content: center; background: #F8F6F2; max-height: 260px; padding: 10px;">
        <img src="${imageUrl}" alt="Design Preview" style="max-width: 100%; max-height: 240px; object-fit: contain; border-radius: 4px;" />
      </div>
      <button id="ok-download-modal" style="background: #111D42; color: #fff; border: none; border-radius: 6px; padding: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s; font-size: 14px; text-align: center;">Got it</button>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => {
    modal.style.opacity = "0";
    modal.style.transition = "opacity 0.2s ease";
    setTimeout(() => modal.remove(), 200);
  };

  modal.querySelector("#close-download-modal").addEventListener("click", closeModal);
  modal.querySelector("#ok-download-modal").addEventListener("click", closeModal);
  
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

function generateBrandedImage(imageUrl, productCode, callback) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;

  const logo = new Image();
  logo.src = "/logo.jpeg";

  let imgLoaded = false;
  let logoLoaded = false;

  const draw = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width || 800;
      canvas.height = img.naturalHeight || img.height || 800;
      const ctx = canvas.getContext("2d");

      // Draw original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Calculations for dynamic sizing
      const scale = canvas.width / 800;
      const fontSize = Math.max(10, Math.round(13 * scale));
      const paddingH = Math.max(10, Math.round(16 * scale));
      const paddingV = Math.max(6, Math.round(10 * scale));
      const margin = Math.max(12, Math.round(20 * scale));
      const logoSize = Math.max(16, Math.round(24 * scale));
      const gap = Math.max(6, Math.round(8 * scale));

      ctx.font = `bold ${fontSize}px "Inter", -apple-system, sans-serif`;
      const text = `GD • ${productCode} • +91 83098 97055`;
      const textWidth = ctx.measureText(text).width;

      const watermarkWidth = paddingH * 2 + logoSize + gap + textWidth;
      const watermarkHeight = paddingV * 2 + logoSize;

      const x = canvas.width - watermarkWidth - margin;
      const y = canvas.height - watermarkHeight - margin;

      // Draw rounded rectangle container
      ctx.fillStyle = "rgba(17, 29, 66, 0.85)";
      const radius = Math.max(4, Math.round(6 * scale));
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + watermarkWidth - radius, y);
      ctx.quadraticCurveTo(x + watermarkWidth, y, x + watermarkWidth, y + radius);
      ctx.lineTo(x + watermarkWidth, y + watermarkHeight - radius);
      ctx.quadraticCurveTo(x + watermarkWidth, y + watermarkHeight, x + watermarkWidth - radius, y + watermarkHeight);
      ctx.lineTo(x + radius, y + watermarkHeight);
      ctx.quadraticCurveTo(x, y + watermarkHeight, x, y + watermarkHeight - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      // Draw Logo
      if (logoLoaded) {
        ctx.save();
        ctx.beginPath();
        const logoX = x + paddingH + logoSize / 2;
        const logoY = y + paddingV + logoSize / 2;
        ctx.arc(logoX, logoY, logoSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(logo, x + paddingH, y + paddingV, logoSize, logoSize);
        ctx.restore();
      }

      // Draw Text
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      const textX = x + paddingH + (logoLoaded ? logoSize + gap : 0);
      const textY = y + paddingV + logoSize / 2;
      ctx.fillText(text, textX, textY);

      canvas.toBlob((blob) => {
        callback(blob);
      }, "image/jpeg", 0.92);
    } catch (err) {
      console.error("Watermark drawing failed:", err);
      callback(null);
    }
  };

  img.onload = () => {
    imgLoaded = true;
    if (logoLoaded) draw();
  };
  img.onerror = () => callback(null);

  logo.onload = () => {
    logoLoaded = true;
    if (imgLoaded) draw();
  };
  logo.onerror = () => {
    logoLoaded = false;
    if (imgLoaded) draw();
  };

  // Fallback timeout
  setTimeout(() => {
    if (!imgLoaded) {
      callback(null);
    } else {
      draw();
    }
  }, 3500);
}


function printSpecSheet(product) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    showToast("Popup blocked! Please allow popups to view Spec Sheet.");
    return;
  }
  const uniqueFormatsList = product.machineFormats ? product.machineFormats.join(", ") : "DST, PES, EXP, JEF, XXX";
  const fabricsList = product.recommendedFabrics ? product.recommendedFabrics.join(", ") : "Silk, Velvet, Organza, Cotton";
  
  let safeMinutes = Number(product.estimatedEmbroideryTime || 0);
  if (!safeMinutes && (product.totalStitchCount || product.stitchCount) && product.rpm) {
    safeMinutes = Math.round((product.totalStitchCount || product.stitchCount) / product.rpm);
  }
  
  let formattedDuration = "N/A";
  if (safeMinutes) {
    const hours = Math.floor(safeMinutes / 60);
    const minutes = safeMinutes % 60;
    formattedDuration = hours ? (minutes ? `${hours} H ${minutes} M` : `${hours} H`) : `${minutes} M`;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Spec Sheet - ${escapeHtml(product.code || "GD")}</title>
      <style>
        body { font-family: 'Inter', sans-serif; color: #111D42; padding: 40px; background: #fff; line-height: 1.6; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #C8A15A; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: 700; font-family: serif; color: #111D42; }
        .logo-sub { color: #C8A15A; font-weight: normal; }
        .title { font-size: 28px; margin: 0 0 10px; font-family: serif; color: #111D42; }
        .meta { color: #8d9b83; font-size: 14px; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .card { border: 1px solid #E6DED1; border-radius: 8px; padding: 20px; background: #F8F6F2; }
        .card h3 { margin-top: 0; color: #111D42; border-bottom: 1px solid #E6DED1; padding-bottom: 8px; font-family: serif; }
        .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .row span { font-weight: 600; }
        .row strong { color: #C8A15A; }
        .footer { text-align: center; color: #8d9b83; font-size: 12px; margin-top: 50px; border-top: 1px solid #E6DED1; padding-top: 20px; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background: #C8A15A; color: white; border: none; padding: 10px 20px; font-weight: 700; border-radius: 4px; cursor: pointer;">Print / Save as PDF</button>
      </div>
      <div class="header">
        <div>
          <div class="logo">Godavari <span class="logo-sub">Designer</span></div>
          <div style="font-size: 12px; color: #8d9b83;">Precision. Passion. Perfection.</div>
        </div>
        <div style="text-align: right;">
          <strong>Technical Spec Sheet</strong>
          <div style="font-size: 12px; color: #8d9b83;">Date: ${new Date().toLocaleDateString()}</div>
        </div>
      </div>
      
      <h1 class="title">${escapeHtml(product.title)}</h1>
      <div class="meta">Product Code: <strong>${escapeHtml(product.code || "N/A")}</strong> &bull; Category: <strong>${escapeHtml(product.category || "N/A")}</strong></div>
      
      <div class="grid">
        <div class="card">
          <h3>Stitch & Machine Details</h3>
          <div class="row"><span>Total Stitch Count</span><strong>${(product.totalStitchCount || product.stitchCount || 0).toLocaleString()}</strong></div>
          <div class="row"><span>Back Stitches</span><strong>${(product.backStitchCount || 0).toLocaleString()}</strong></div>
          <div class="row"><span>Hand Stitches</span><strong>${(product.handStitchCount || 0).toLocaleString()}</strong></div>
          <div class="row"><span>Embroidery Speed</span><strong>${product.rpm || 850} RPM</strong></div>
          <div class="row"><span>Estimated Stitch Time</span><strong>${formattedDuration}</strong></div>
          <div class="row"><span>Difficulty Level</span><strong>${escapeHtml(product.difficultyLevel || "Intermediate")}</strong></div>
        </div>
        <div class="card">
          <h3>Dimensions & Fabric</h3>
          <div class="row"><span>Width</span><strong>${escapeHtml(product.width ? product.width + " mm" : "N/A")}</strong></div>
          <div class="row"><span>Height</span><strong>${escapeHtml(product.height ? product.height + " mm" : "N/A")}</strong></div>
          <div class="row"><span>Thread Colors</span><strong>${product.threadColors || 0} Colors</strong></div>
          <div class="row"><span>Recommended Fabrics</span><strong>${escapeHtml(fabricsList)}</strong></div>
          <div class="row"><span>Formats Supported</span><strong>${escapeHtml(uniqueFormatsList)}</strong></div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 30px;">
        <h3>Description</h3>
        <p style="font-size: 14px; margin: 0; color: #111D42;">${escapeHtml(product.description || "No description provided.")}</p>
      </div>
      
      <div class="footer">
        Godavari Designer Studio &bull; godavaridesigner@gmail.com &bull; +91 83098 97055 &bull; Rajahmundry, Andhra Pradesh, India
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 500);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
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
    closePanels();
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

  if (action === "toggle-mobile-menu") {
    ui.mobileMenuOpen = !ui.mobileMenuOpen;
    triggerRender();
  }

  if (action === "open-search") {
    ui.searchQuery = trigger.dataset.query || ui.searchQuery;
    ui.searchOpen = true;
    ui.adminOpen = false;
    triggerRender();
  }

  if (action === "open-admin") {
    if (currentUser && currentUser.role === "admin") {
      ui.adminOpen = true;
      ui.searchOpen = false;
      triggerRender();
    } else {
      showToast("Access Denied: Admin privileges required");
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

  if (action === "share-product") {
    const url = window.location.href;
    const title = document.title;
    const code = trigger.dataset.code || "design";
    const imageSrc = trigger.dataset.image;

    if (navigator.share) {
      if (imageSrc) {
        const imageUrl = mediaUrl(imageSrc);
        generateBrandedImage(imageUrl, code, (blob) => {
          if (blob) {
            try {
              const file = new File([blob], `${code}-branded.jpg`, { type: 'image/jpeg' });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                  files: [file],
                  title: title,
                  text: `Check out this premium design (ID: ${code}) from Godavari Designers:`,
                  url: url
                }).catch(err => {
                  console.log("Error sharing file, falling back to url-only:", err);
                  navigator.share({ title: title, url: url }).catch(err => console.log(err));
                });
                return;
              }
            } catch (err) {
              console.warn("File sharing not supported or failed, falling back to url-only:", err);
            }
          }
          navigator.share({ title: title, url: url }).catch(err => console.log(err));
        });
      } else {
        navigator.share({ title: title, url: url }).catch(err => console.log(err));
      }
    } else {
      navigator.clipboard.writeText(url)
        .then(() => {
          showToast("Link copied to clipboard!");
        })
        .catch(err => {
          console.error("Failed to copy:", err);
          showToast("Could not copy link to clipboard");
        });
    }
  }

  if (action === "buy-whatsapp") {
    const title = trigger.dataset.title;
    const code = trigger.dataset.code;
    const price = trigger.dataset.price;
    const formats = trigger.dataset.formats || "DST, PES, EXP";
    
    const text = `Hello Godavari Designers! I am interested in purchasing/inquiring about the design:\n` +
                 `• Title: ${title}\n` +
                 `• Code: ${code}\n` +
                 `• Price: ₹${Number(price || 0).toLocaleString('en-IN')}\n` +
                 `• Formats: ${formats}`;
                 
    const encoded = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/918309897055?text=${encoded}`;
    
    showToast("Opening WhatsApp for quick purchase...");
    window.open(whatsappUrl, "_blank");
  }

  if (action === "download-production-file") {
    const id = trigger.dataset.id;
    const format = trigger.dataset.format || "DST";
    const product = site.products.find(p => p.id === id);
    if (product) {
      const content = `Tajima DST Format Embroidery File\r\n` +
                      `Design Code: ${product.code}\r\n` +
                      `Title: ${product.title}\r\n` +
                      `Format: ${format}\r\n` +
                      `Stitches: ${product.totalStitchCount || product.stitchCount || 35000}\r\n` +
                      `Colors: ${product.threadColors || 6}\r\n` +
                      `Dimensions: ${product.dimensions || "100mm x 100mm"}\r\n` +
                      `Created by: Godavari Designer Studio\r\n` +
                      `Date: 2026-06-22\r\n`;
      const blob = new Blob([content], { type: "application/octet-stream" });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${product.code}-${product.title.replace(/\s+/g, '_')}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      showToast(`${format} production file downloaded successfully!`);
    }
  }

  if (action === "download-spec-sheet") {
    const id = trigger.dataset.id;
    const product = site.products.find(p => p.id === id);
    if (product) {
      printSpecSheet(product);
    }
  }

  if (action === "download-fabric-mockup") {
    const id = trigger.dataset.id;
    const imageSrc = trigger.dataset.image;
    const product = site.products.find(p => p.id === id);
    if (product) {
      const imageUrl = mediaUrl(imageSrc);
      showToast("Baking watermark into design image...");
      
      generateBrandedImage(imageUrl, product.code, (blob) => {
        if (blob) {
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `${product.code}-branded.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
          showToast("Watermarked design downloaded successfully!");
        } else {
          // Fallback if canvas draw fails
          console.warn("Watermark baking failed. Attempting standard download...");
          fetch(imageUrl, { mode: 'cors' })
            .then(res => {
              if (!res.ok) throw new Error("Network response was not ok");
              return res.blob();
            })
            .then(fallbackBlob => {
              const downloadUrl = URL.createObjectURL(fallbackBlob);
              const a = document.createElement("a");
              a.href = downloadUrl;
              a.download = `${product.code}-image.jpg`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(downloadUrl);
              showToast("Design image downloaded (unwatermarked fallback)");
            })
            .catch(err => {
              console.warn("CORS fetch failed, falling back to overlay manual download instructions:", err);
              showImageDownloadModal(imageUrl, `${product.code}-image.jpg`);
            });
        }
      });
    }
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

  if (action === "clear-quote-success") {
    clearCartQuoteResult();
    setPage("catalog");
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
      const card = event.target.closest(".image-upload-card");
      if (card) {
        const placeholder = card.querySelector(".upload-placeholder");
        const preview = card.querySelector(".upload-preview");
        const img = card.querySelector(".upload-preview img");
        if (placeholder && preview && img) {
          const reader = new FileReader();
          reader.onload = (e) => { img.src = e.target.result; };
          reader.readAsDataURL(file);
          placeholder.style.display = "none";
          preview.style.display = "flex";
        }
      }

      const filename = `cat-${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.]/g, '_')}`;
      storageService.uploadImage(file, filename)
        .then((url) => {
          const input = card ? card.querySelector('input[name="image"]') : document.querySelector('input[name="image"]');
          if (input) {
            input.value = url;
            showToast("Cover image uploaded to cloud");
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
      const card = event.target.closest(".image-upload-card");
      if (card) {
        const placeholder = card.querySelector(".upload-placeholder");
        const preview = card.querySelector(".upload-preview");
        const img = card.querySelector(".upload-preview img");
        if (placeholder && preview && img) {
          const reader = new FileReader();
          reader.onload = (e) => { img.src = e.target.result; };
          reader.readAsDataURL(file);
          placeholder.style.display = "none";
          preview.style.display = "flex";
        }
      }

      const filename = `banner-${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.]/g, '_')}`;
      storageService.uploadImage(file, filename)
        .then((url) => {
          const input = card ? card.querySelector('input[name="bannerImage"]') : document.querySelector('input[name="bannerImage"]');
          if (input) {
            input.value = url;
            showToast("Banner image uploaded to cloud");
          }
        })
        .catch((err) => {
          showToast(`Upload failed: ${err.message}`);
        });
    }
  }

  // --- Media Library Row File Upload in Admin Drawer ---
  if (event.target.classList.contains("media-row-upload")) {
    const file = event.target.files[0];
    const path = event.target.dataset.path;
    if (file && path) {
      const field = event.target.closest(".media-field");
      const previewImg = field ? field.querySelector(".media-row-preview") : null;
      if (previewImg) {
        const reader = new FileReader();
        reader.onload = (e) => { previewImg.src = e.target.result; };
        reader.readAsDataURL(file);
      }

      const filename = `media_${Date.now()}_${file.name.toLowerCase().replace(/[^a-z0-9.]/g, '_')}`;
      storageService.uploadImage(file, filename)
        .then((url) => {
          const hiddenInput = event.target.parentNode.querySelector('input[type="hidden"]');
          if (hiddenInput) {
            hiddenInput.value = url;
          }
          setByPath(site, path, url);
          saveSite();
          applyTheme();
          showToast("Media updated and saved to cloud!");
          triggerRender();
        })
        .catch((err) => {
          showToast(`Upload failed: ${err.message}`);
        });
    }
  }

  // --- Universal Image/File Upload Card Live Preview (Admin Dashboard) ---
  if (event.target.type === "file" && event.target.closest(".image-upload-card")) {
    const file = event.target.files[0];
    if (file) {
      const card = event.target.closest(".image-upload-card");
      const placeholder = card ? card.querySelector(".upload-placeholder") : null;
      const preview = card ? card.querySelector(".upload-preview") : null;
      const img = card ? card.querySelector(".upload-preview img") : null;
      const span = card ? card.querySelector(".upload-preview span") : null;
      if (placeholder && preview) {
        if (img) {
          const reader = new FileReader();
          reader.onload = (e) => { img.src = e.target.result; };
          reader.readAsDataURL(file);
        } else if (span) {
          span.textContent = file.name;
        }
        placeholder.style.display = "none";
        preview.style.display = "flex";
      }
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
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    const submitBtn = event.target.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Submitting Request...</span>`;
    }

    submitQuoteModal(data).then(() => {
      closePanels();
      triggerRender();
    }).catch((err) => {
      // errors handled inside submitQuoteModal
    }).finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Send Quote Request</span>`;
      }
    });
  }

  if (event.target.id === "cartQuoteForm") {
    event.preventDefault();
    const formData = new FormData(event.target);
    submitCartQuote(formData).catch((err) => {
      // Toast/logging handled in store
    });
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

// Global auto-generation of URL Slugs from Name/Title inputs
document.addEventListener("input", (event) => {
  const target = event.target;
  if (target.tagName === "INPUT" && (target.name === "title" || target.name === "name")) {
    const form = target.closest("form");
    if (form) {
      const slugInput = form.querySelector('input[name="slug"]');
      if (slugInput) {
        // Auto-generate slug if it is empty, or has not been manually edited
        const isNew = !form.querySelector('input[name="id"]') || !form.querySelector('input[name="id"]').value;
        if (isNew || !slugInput.value || slugInput.dataset.autoSync === "true") {
          slugInput.value = target.value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .trim()
            .replace(/\s+/g, '-')        // Replace spaces with hyphens
            .replace(/-+/g, '-');         // Remove double hyphens
          slugInput.dataset.autoSync = "true";
        }
      }
    }
  }
  // If the user manually edits the slug, stop auto-syncing
  if (target.tagName === "INPUT" && target.name === "slug") {
    target.dataset.autoSync = "false";
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

// Switch layouts dynamically on threshold crossing
let wasMobile = isMobileViewport();
window.addEventListener("resize", () => {
  const isMobile = isMobileViewport();
  if (isMobile !== wasMobile) {
    wasMobile = isMobile;
    triggerRender();
  }
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
