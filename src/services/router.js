import { setPage, currentUser, showToast } from "./store.js";
import { DB } from "./db.js";

// Routes config mapping path names to page keys
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
  "/admin/login": { page: "auth", title: "Admin Login | Godavari" },
  "/admin": { page: "admin-dashboard", title: "Admin Portal | Godavari", requiresAdmin: true },
  "/admin-dashboard": { page: "admin-dashboard", title: "Admin Portal | Godavari", requiresAdmin: true },
  "/404": { page: "404", title: "Page Not Found | Godavari" }
};

export function initRouter() {
  window.addEventListener("hashchange", handleRouting);
  // Initial routing check on load
  handleRouting();
}

export function handleRouting() {
  const hash = window.location.hash || "#/";
  
  // Split hash into path and query parameters
  const [hashPath, queryString] = hash.replace("#", "").split("?");
  
  const path = hashPath || "/";
  
  // Intercept Supabase OAuth token redirects in the hash to prevent 404 errors
  if (path.startsWith("access_token") || path.includes("access_token=") || path.includes("error_description")) {
    window.location.hash = "#/";
    return;
  }
  
  // Parse query parameters
  const queryParams = {};
  if (queryString) {
    const pairs = queryString.split("&");
    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key) {
        queryParams[decodeURIComponent(key)] = decodeURIComponent(value || "");
      }
    });
  }

  // Match routes including dynamic routes (e.g. /product/:slug)
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
          const paramName = patternParts[i].slice(1);
          params[paramName] = pathParts[i];
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

  // Redirect to 404 if no matched route pattern
  if (!matchedRoute) {
    window.location.hash = "#/404";
    return;
  }

  // --- SECURITY VALIDATIONS ---
  
  // 1. Validate Product Slug for Product Details Route
  if (matchedRoute.page === "product-detail") {
    const productSlug = matchedParams.slug;
    const products = DB.getProducts();
    const productExists = products.some(p => p.slug === productSlug);
    if (!productExists) {
      window.location.hash = "#/404";
      return;
    }
  }

  // 2. Validate Category Slugs and Collection Slugs in Catalog Query Parameters
  if (matchedRoute.page === "catalog") {
    // Validate Category Query Param
    if (queryParams.category) {
      const cats = DB.getCategories();
      const catExists = cats.some(c => c.slug === queryParams.category);
      if (!catExists) {
        window.location.hash = "#/404";
        return;
      }
    }
    
    // Validate Collection Query Param
    if (queryParams.collection) {
      const allowedCollections = ["bridal", "blouses", "saree", "kids", "floral"];
      if (!allowedCollections.includes(queryParams.collection)) {
        window.location.hash = "#/404";
        return;
      }
    }
  }

  // 3. Route Guard Checks
  if (matchedRoute.page === "auth" && currentUser) {
    if (currentUser.role === "admin") {
      window.location.hash = "#/admin-dashboard";
    } else {
      window.location.hash = "#/account";
    }
    return;
  }

  if (matchedRoute.requiresAdmin) {
    if (!currentUser || currentUser.role !== "admin") {
      showToast("Access denied: Admins only");
      window.location.hash = "#/admin/login";
      return;
    }
  }

  if (matchedRoute.requiresAuth) {
    if (!currentUser) {
      showToast("Please sign in to access your account");
      window.location.hash = "#/auth";
      return;
    }
  }

  // Update Dynamic Document Title
  document.title = matchedRoute.title;

  // Set page and parameters in State Store (merge dynamic path params and query params)
  const mergedParams = { ...matchedParams, ...queryParams };
  setPage(matchedRoute.page, mergedParams);
}

export function navigate(routePath) {
  window.location.hash = `#${routePath}`;
}
