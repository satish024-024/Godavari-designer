import { setPage, currentUser, showToast, authInitialized, dataSynced } from "./store.js";
import { DB } from "./db.js";

// ==========================================
// ROUTE CONFIGURATION
// ==========================================
// requiresAuth  → user must be signed in
// requiresAdmin → user must have role = 'admin' (verified server-side)

const routes = {
  "/": { page: "home", title: "Godavari Designer | Luxury Embroidery" },
  "/catalog": { page: "catalog", title: "Design Library | Godavari Designer" },
  "/product/:slug": { page: "product-detail", title: "Product Detail | Godavari" },
  "/custom-order": { page: "custom-order", title: "Custom Digitizing Request | Godavari" },
  "/cart": { page: "cart", title: "Your Cart | Godavari Designer" },
  "/wishlist": { page: "wishlist", title: "Saved Designs | Godavari Designer" },
  "/checkout": { page: "checkout", title: "Checkout | Godavari Designer" },
  "/track-order": { page: "track-order", title: "Track Your Order | Godavari" },
  "/account": { page: "account", title: "Customer Dashboard | Godavari", requiresAuth: true },
  "/auth": { page: "auth", title: "Sign In / Register | Godavari" },
  
  // Company pages
  "/about-us": { page: "about-us", title: "About Us | Godavari Designer" },
  "/our-process": { page: "our-process", title: "Our Process | Godavari Designer" },
  "/why-godavari": { page: "why-godavari", title: "Why Godavari | Godavari Designer" },
  "/reviews": { page: "reviews", title: "Customer Reviews | Godavari Designer" },
  "/careers": { page: "careers", title: "Careers | Godavari Designer" },
  
  // Support pages
  "/faqs": { page: "faqs", title: "Frequently Asked Questions | Godavari" },
  "/shipping-delivery": { page: "shipping-delivery", title: "Shipping & Delivery | Godavari" },
  "/returns-refunds": { page: "returns-refunds", title: "Returns & Refunds | Godavari" },
  "/terms-of-service": { page: "terms-of-service", title: "Terms of Service | Godavari" },
  "/privacy-policy": { page: "privacy-policy", title: "Privacy Policy | Godavari" },

  // Admin login alias – redirects authenticated admins, no bare auth access
  "/admin/login": { page: "auth", title: "Admin Login | Godavari" },
  // Admin portal root
  "/admin": { page: "admin-dashboard", title: "Admin Portal | Godavari", requiresAdmin: true },
  "/admin-dashboard": { page: "admin-dashboard", title: "Admin Portal | Godavari", requiresAdmin: true },
  // Admin sub-routes — all protected
  "/admin/products": { page: "admin-dashboard", title: "Products | Admin Portal", requiresAdmin: true },
  "/admin/categories": { page: "admin-dashboard", title: "Categories | Admin Portal", requiresAdmin: true },
  "/admin/collections": { page: "admin-dashboard", title: "Collections | Admin Portal", requiresAdmin: true },
  "/admin/orders": { page: "admin-dashboard", title: "Orders | Admin Portal", requiresAdmin: true },
  "/admin/custom-requests": { page: "admin-dashboard", title: "Custom Requests | Admin Portal", requiresAdmin: true },
  "/admin/customers": { page: "admin-dashboard", title: "Customers | Admin Portal", requiresAdmin: true },
  "/admin/content": { page: "admin-dashboard", title: "Content | Admin Portal", requiresAdmin: true },
  "/admin/testimonials": { page: "admin-dashboard", title: "Testimonials | Admin Portal", requiresAdmin: true },
  "/admin/faqs": { page: "admin-dashboard", title: "FAQs | Admin Portal", requiresAdmin: true },
  "/admin/settings": { page: "admin-dashboard", title: "Settings | Admin Portal", requiresAdmin: true },
  "/admin/media": { page: "admin-dashboard", title: "Media Library | Admin Portal", requiresAdmin: true },
  "/404": { page: "404", title: "Page Not Found | Godavari" }
};

// ==========================================
// ADMIN ROUTE GUARD — Server-Authoritative
// ==========================================

/**
 * Checks if the current user has admin role.
 * NEVER trusts localStorage, sessionStorage, or URL state.
 * Always reads from currentUser which is populated by authService.getCurrentUser()
 * (which queries profiles.role from Supabase on every session restore).
 */
function isAuthenticatedAdmin() {
  return !!(currentUser && currentUser.role === "admin");
}

function isAuthenticated() {
  return !!currentUser;
}

// ==========================================
// ROUTER INIT
// ==========================================

export function initRouter() {
  window.addEventListener("hashchange", handleRouting);
  handleRouting();
}

// ==========================================
// ROUTING LOGIC
// ==========================================

export function handleRouting() {
  const hash = window.location.hash || "#/";

  // Parse parameters from hash (which can be formatted like query params, e.g. #access_token=... or #error_description=...)
  const hashParams = {};
  const hashString = hash.replace("#", "");
  if (hashString) {
    const paramString = hashString.includes("?") ? hashString.split("?")[1] : hashString;
    paramString.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key) {
        hashParams[decodeURIComponent(key)] = decodeURIComponent(value || "");
      }
    });
  }

  // Split hash into path and query parameters
  const [hashPath, queryString] = hash.replace("#", "").split("?");
  const path = hashPath || "/";

  // Handle OAuth authentication errors
  if (hashParams.error_description || hashParams.error) {
    const errorDesc = hashParams.error_description || hashParams.error || "Authentication failed";
    showToast(`Authentication failed: ${errorDesc}`);
    window.location.hash = "#/auth";
    return;
  }

  // Handle successful OAuth redirects: pause routing so Supabase client can process the token from the URL hash
  if (hashParams.access_token) {
    console.log("Router: OAuth redirect detected, postponing routing until session is established.");
    return;
  }

  // Parse query parameters
  const queryParams = {};
  if (queryString) {
    queryString.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key) {
        queryParams[decodeURIComponent(key)] = decodeURIComponent(value || "");
      }
    });
  }

  // ------------------------------------------
  // WILDCARD ADMIN ROUTE GUARD
  // Any path starting with /admin, /cms, or /dashboard that isn't in
  // the routes table is denied immediately.
  // ------------------------------------------
  if ((path.startsWith("/admin") || path.startsWith("/cms") || path.startsWith("/dashboard")) && !routes[path]) {
    // Unknown admin sub-path → deny, send to admin login
    showToast("Access denied: Admins only");
    window.location.hash = "#/admin/login";
    return;
  }

  // ------------------------------------------
  // MATCH ROUTE (including dynamic :param routes)
  // ------------------------------------------
  let matchedRoute = null;
  let matchedParams = {};

  for (const [routePattern, config] of Object.entries(routes)) {
    const patternParts = routePattern.split("/");
    const pathParts = path.split("/");

    if (patternParts.length === pathParts.length) {
      let isMatch = true;
      const params = {};

      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(":")) {
          params[patternParts[i].slice(1)] = pathParts[i];
        } else if (patternParts[i] !== pathParts[i]) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        matchedRoute = config;
        matchedParams = params;
        break;
      }
    }
  }

  // Redirect to 404 if no matched route
  if (!matchedRoute) {
    window.location.hash = "#/404";
    return;
  }

  // ------------------------------------------
  // SECURITY VALIDATIONS
  // ------------------------------------------

  // 1. Validate product slug
  if (matchedRoute.page === "product-detail") {
    if (dataSynced) {
      const products = DB.getProducts();
      if (!products.some((p) => p.slug === matchedParams.slug)) {
        window.location.hash = "#/404";
        return;
      }
    }
  }

  // 2. Validate catalog query params
  if (matchedRoute.page === "catalog") {
    if (queryParams.category) {
      if (dataSynced) {
        const cats = DB.getCategories();
        if (!cats.some((c) => c.slug === queryParams.category)) {
          window.location.hash = "#/404";
          return;
        }
      }
    }
    if (queryParams.collection) {
      const allowedCollections = ["bridal", "blouses", "saree", "kids", "floral"];
      if (!allowedCollections.includes(queryParams.collection)) {
        window.location.hash = "#/404";
        return;
      }
    }
  }

  // 3. Pause routing for protected routes if Auth is not yet initialized
  if (!authInitialized && (matchedRoute.requiresAuth || matchedRoute.requiresAdmin)) {
    setPage("loading-auth");
    return;
  }

  // 4. Redirect already-authenticated users away from auth page
  if (matchedRoute.page === "auth" && isAuthenticated()) {
    window.location.hash = isAuthenticatedAdmin() ? "#/admin-dashboard" : "#/account";
    return;
  }

  // 5. Admin route guard — CRITICAL SECURITY CHECK
  if (matchedRoute.requiresAdmin) {
    if (!isAuthenticated()) {
      showToast("Please sign in to access the admin portal");
      window.location.hash = "#/admin/login";
      return;
    } else if (!isAuthenticatedAdmin()) {
      showToast("Access denied: Admin credentials required");
      window.location.hash = "#/account";
      return;
    }
  }

  // 6. Auth-required route guard (customer-facing protected routes)
  if (matchedRoute.requiresAuth) {
    if (!isAuthenticated()) {
      showToast("Please sign in to access your account");
      window.location.hash = "#/auth";
      return;
    }
  }

  // ------------------------------------------
  // NAVIGATION — pass sub-route to page component
  // ------------------------------------------
  document.title = matchedRoute.title;

  // Derive admin section from path (e.g. /admin/products → 'products')
  let adminSection = null;
  if (matchedRoute.page === "admin-dashboard" && path !== "/admin" && path !== "/admin-dashboard") {
    const parts = path.split("/");
    adminSection = parts[2] || null; // e.g. 'products', 'orders', 'settings'
  }

  const mergedParams = {
    ...matchedParams,
    ...queryParams,
    ...(adminSection ? { adminSection } : {})
  };

  setPage(matchedRoute.page, mergedParams);
}

export function navigate(routePath) {
  window.location.hash = `#${routePath}`;
}
