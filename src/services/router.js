import { setPage, currentUser, showToast, authInitialized, dataSynced, site } from "./store.js";
import { DB } from "./db.js";
import { SERVICES_DATA, LOCATIONS_DATA } from "../data/seoLandingPages.js";

// ==========================================
// ROUTE CONFIGURATION
// ==========================================
// requiresAuth  → user must be signed in
// requiresAdmin → user must have role = 'admin' (verified server-side)

const routes = {
  "/": { page: "home", title: "Godavari Designer | Luxury Embroidery" },
  "/catalog": { page: "catalog", title: "Design Library | Godavari Designer" },
  "/collection/:collection": { page: "catalog", title: "Collection | Godavari Designer" },
  "/category/:category": { page: "catalog", title: "Category | Godavari Designer" },
  "/product/:slug": { page: "product-detail", title: "Product Detail | Godavari" },
  "/custom-order": { page: "custom-order", title: "Custom Digitizing Request | Godavari" },
  "/services/:service": { page: "service-detail", title: "Embroidery Services | Godavari Designers" },
  "/locations/:location": { page: "location-detail", title: "Embroidery Digitizing | Godavari Designers" },
  "/cart": { page: "cart", title: "Your Cart | Godavari Designer", noindex: true },
  "/wishlist": { page: "wishlist", title: "Saved Designs | Godavari Designer", noindex: true },
  "/checkout": { page: "checkout", title: "Checkout | Godavari Designer", noindex: true },
  "/track-order": { page: "track-order", title: "Track Your Order | Godavari", noindex: true },
  "/account": { page: "account", title: "Customer Dashboard | Godavari", requiresAuth: true, noindex: true },
  "/auth": { page: "auth", title: "Sign In / Register | Godavari", noindex: true },
  
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
  "/admin/login": { page: "auth", title: "Admin Login | Godavari", noindex: true },
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
  "/404": { page: "404", title: "Page Not Found | Godavari", noindex: true }
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
  const hash = window.location.hash;

  // Parse OAuth parameters from hash if present
  const hashParams = {};
  if (hash) {
    const hashString = hash.replace("#", "");
    const paramString = hashString.includes("?") ? hashString.split("?")[1] : hashString;
    if (paramString && paramString.includes("=")) {
      paramString.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        if (key) {
          hashParams[decodeURIComponent(key)] = decodeURIComponent(value || "");
        }
      });
    }
  }

  // Determine active route path and query string (supporting both pathnames and hashbangs/hashes)
  let path = "/";
  let queryString = "";

  if (hash && hash !== "#" && hash !== "#/") {
    let cleanHash = hash.replace("#", "");
    if (cleanHash.startsWith("!")) {
      cleanHash = cleanHash.substring(1);
    }
    const [hashPath, qString] = cleanHash.split("?");
    path = hashPath || "/";
    queryString = qString || "";
  } else if (window.location.pathname && window.location.pathname !== "/" && window.location.pathname !== "/index.html") {
    const [pathPart, qString] = window.location.pathname.split("?");
    path = pathPart;
    queryString = qString || "";
    if (window.location.search) {
      queryString = window.location.search.substring(1);
    }
  }

  // Normalize path (ensure leading slash, strip trailing slash if not root)
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

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

  // 1b. Validate service slug
  if (matchedRoute.page === "service-detail" && matchedParams.service) {
    if (!SERVICES_DATA[matchedParams.service]) {
      window.location.hash = "#/404";
      return;
    }
  }

  // 1c. Validate location slug
  if (matchedRoute.page === "location-detail" && matchedParams.location) {
    if (!LOCATIONS_DATA[matchedParams.location]) {
      window.location.hash = "#/404";
      return;
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
  
  // Dynamic SEO Metadata and JSON-LD Schema
  let pageTitle = matchedRoute.title;
  let pageDescription = "Godavari Designers is a premium luxury embroidery digitizing studio and design library. Download machine-ready embroidery files (DST, PES, EXP).";
  let schemaData = null;

  if (matchedRoute.page === "product-detail" && matchedParams.slug) {
    const products = DB.getProducts();
    const product = products.find((p) => p.slug === matchedParams.slug);
    if (product) {
      pageTitle = product.seoTitle || `${product.title} Embroidery Design | DST / PES / EXP | Godavari Designers`;
      pageDescription = product.seoDescription || `Download high-quality ${product.title} embroidery design. Hoop size: ${product.hoopSize || "standard"}, stitch count: ${product.stitchCount || "optimized"}, compatible with all major embroidery machines.`;
      
      // Inject Product Schema
      schemaData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.title,
        "image": product.image ? (product.image.startsWith("http") ? product.image : `https://godavaridesigners.com/${product.image}`) : "",
        "description": product.description || pageDescription,
        "sku": product.id || product.slug,
        "brand": {
          "@type": "Brand",
          "name": "Godavari Designers"
        },
        "offers": {
          "@type": "Offer",
          "url": `https://godavaridesigners.com/product/${product.slug}`,
          "priceCurrency": "INR",
          "price": product.price || "0",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock"
        }
      };
    }
  } else if (matchedRoute.page === "catalog") {
    const activeCol = matchedParams.collection || queryParams.collection;
    const activeCat = matchedParams.category || queryParams.category;

    if (activeCol) {
      const col = site.collections?.find((c) => c.slug === activeCol);
      if (col) {
        pageTitle = col.seoTitle || `${col.title} | Godavari Designers`;
        pageDescription = col.seoDescription || col.description || `Explore our ${col.title} machine embroidery designs.`;
      } else {
        const collectionNames = {
          bridal: "Bridal Collection",
          blouses: "Designer Blouses",
          saree: "Saree Borders",
          kids: "Kids Wear",
          floral: "Luxury Floral"
        };
        const colName = collectionNames[activeCol] || activeCol;
        pageTitle = `${colName} Embroidery Designs | Godavari Designers`;
        pageDescription = `Explore our curated list of ${colName} machine embroidery files. Premium luxury designs available for instant download.`;
      }
    } else if (activeCat) {
      const cats = DB.getCategories();
      const cat = cats.find((c) => c.slug === activeCat);
      if (cat) {
        pageTitle = cat.seoTitle || `${cat.name} Embroidery Designs | Godavari Designers`;
        pageDescription = cat.seoDescription || cat.description || `Browse our collection of ${cat.name} machine embroidery designs. Available for instant download.`;
      }
    }
  } else if (matchedRoute.page === "home") {
    pageTitle = "Godavari Designers | Custom Embroidery Digitizing in Rajahmundry";
    pageDescription = "Godavari Designers provides custom embroidery digitizing, bridal blouse embroidery designs, saree border embroidery, and logo digitizing services in Rajahmundry, Andhra Pradesh.";
    
    // Inject Local Business + Organization Schema Graph
    schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://godavaridesigners.com/#organization",
          "name": "Godavari Designers",
          "url": "https://godavaridesigners.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://godavaridesigners.com/logo-512.png",
            "width": "512",
            "height": "512"
          },
          "image": {
            "@type": "ImageObject",
            "url": "https://godavaridesigners.com/og-image.png",
            "width": "1200",
            "height": "630"
          },
          "email": "godavaridesigner@gmail.com",
          "telephone": "+91 83098 97055",
          "sameAs": [
            "https://www.facebook.com/godavaridesigners",
            "https://www.instagram.com/godavaridesigners",
            "https://wa.me/918309897055"
          ]
        },
        {
          "@type": "LocalBusiness",
          "@id": "https://godavaridesigners.com/#localbusiness",
          "name": "Godavari Designers",
          "image": "https://godavaridesigners.com/og-image.png",
          "url": "https://godavaridesigners.com",
          "telephone": "+91 83098 97055",
          "email": "godavaridesigner@gmail.com",
          "logo": "https://godavaridesigners.com/logo-512.png",
          "priceRange": "$$",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Rajahmundry",
            "addressRegion": "Andhra Pradesh",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "17.0005",
            "longitude": "81.8040"
          },
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday"
            ],
            "opens": "09:00",
            "closes": "21:00"
          },
          "areaServed": [
            {
              "@type": "AdministrativeArea",
              "name": "Rajahmundry"
            },
            {
              "@type": "AdministrativeArea",
              "name": "Andhra Pradesh"
            },
            {
              "@type": "AdministrativeArea",
              "name": "India"
            }
          ],
          "description": "Godavari Designers provides custom embroidery digitizing, bridal blouse embroidery designs, saree border embroidery, and logo digitizing services in Rajahmundry, Andhra Pradesh."
        }
      ]
    };
  } else if (matchedRoute.page === "service-detail" && matchedParams.service) {
    const service = SERVICES_DATA[matchedParams.service];
    if (service) {
      pageTitle = service.metaTitle;
      pageDescription = service.metaDescription;
      
      // Inject Service Schema + BreadcrumbList Schema
      schemaData = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Service",
            "name": service.h1,
            "description": service.metaDescription,
            "provider": {
              "@type": "LocalBusiness",
              "name": "Godavari Designers",
              "image": "https://godavaridesigners.com/desktop-home.png",
              "telephone": "+91 83098 97055",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Rajahmundry",
                "addressRegion": "Andhra Pradesh",
                "addressCountry": "IN"
              }
            },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "INR"
            }
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://godavaridesigners.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Services",
                "item": `https://godavaridesigners.com/services/${service.slug}`
              }
            ]
          }
        ]
      };
    }
  } else if (matchedRoute.page === "location-detail" && matchedParams.location) {
    const location = LOCATIONS_DATA[matchedParams.location];
    if (location) {
      pageTitle = location.metaTitle;
      pageDescription = location.metaDescription;

      const graph = [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://godavaridesigners.com"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Locations",
              "item": `https://godavaridesigners.com/locations/${location.slug}`
            }
          ]
        }
      ];

      // If Rajahmundry, also inject LocalBusiness schema
      if (location.slug === "rajahmundry-embroidery-digitizing") {
        graph.push({
          "@type": "LocalBusiness",
          "name": "Godavari Designers",
          "image": "https://godavaridesigners.com/desktop-home.png",
          "url": "https://godavaridesigners.com",
          "telephone": "+91 83098 97055",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Rajahmundry",
            "addressRegion": "Andhra Pradesh",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "17.0005",
            "longitude": "81.8040"
          },
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday"
            ],
            "opens": "09:00",
            "closes": "21:00"
          }
        });
      }

      schemaData = {
        "@context": "https://schema.org",
        "@graph": graph
      };
    }
  }

  // Apply Title
  document.title = pageTitle;

  // Apply Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.setAttribute("name", "description");
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute("content", pageDescription);

  // Apply Open Graph / Twitter Meta Tags
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement("meta");
    ogTitle.setAttribute("property", "og:title");
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute("content", pageTitle);

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement("meta");
    ogDesc.setAttribute("property", "og:description");
    document.head.appendChild(ogDesc);
  }
  ogDesc.setAttribute("content", pageDescription);

  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement("meta");
    ogUrl.setAttribute("property", "og:url");
    document.head.appendChild(ogUrl);
  }
  ogUrl.setAttribute("content", `https://godavaridesigners.com${path}`);

  let ogImage = document.querySelector('meta[property="og:image"]');
  if (!ogImage) {
    ogImage = document.createElement("meta");
    ogImage.setAttribute("property", "og:image");
    document.head.appendChild(ogImage);
  }
  ogImage.setAttribute("content", "https://godavaridesigners.com/og-image.png");

  let twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (!twitterTitle) {
    twitterTitle = document.createElement("meta");
    twitterTitle.setAttribute("name", "twitter:title");
    document.head.appendChild(twitterTitle);
  }
  twitterTitle.setAttribute("content", pageTitle);

  let twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (!twitterDesc) {
    twitterDesc = document.createElement("meta");
    twitterDesc.setAttribute("name", "twitter:description");
    document.head.appendChild(twitterDesc);
  }
  twitterDesc.setAttribute("content", pageDescription);

  let twitterImage = document.querySelector('meta[name="twitter:image"]');
  if (!twitterImage) {
    twitterImage = document.createElement("meta");
    twitterImage.setAttribute("name", "twitter:image");
    document.head.appendChild(twitterImage);
  }
  twitterImage.setAttribute("content", "https://godavaridesigners.com/og-image.png");

  // Apply Meta Robots (noindex for private/transactional/admin pages)
  const isNoIndex = !!(matchedRoute.noindex || matchedRoute.requiresAdmin);
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (isNoIndex) {
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.setAttribute("name", "robots");
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute("content", "noindex, nofollow");
  } else if (metaRobots) {
    metaRobots.remove();
  }

  // For noindex pages: suppress canonical and JSON-LD, clean up any stale tags
  if (isNoIndex) {
    const staleCanonical = document.querySelector('link[rel="canonical"]');
    if (staleCanonical) staleCanonical.remove();
    const staleSchema = document.getElementById("seo-schema-jsonld");
    if (staleSchema) staleSchema.remove();
  } else {
    // Apply Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    let canonicalPath = path;
    if (path === "/catalog") {
      if (queryParams.collection) {
        canonicalPath = `/collection/${queryParams.collection}`;
      } else if (queryParams.category) {
        canonicalPath = `/category/${queryParams.category}`;
      }
    }
    canonicalLink.setAttribute("href", `https://godavaridesigners.com${canonicalPath}`);

    // Apply JSON-LD Schema
    let schemaScript = document.getElementById("seo-schema-jsonld");
    if (schemaScript) {
      schemaScript.remove();
    }
    if (schemaData) {
      schemaScript = document.createElement("script");
      schemaScript.id = "seo-schema-jsonld";
      schemaScript.type = "application/ld+json";
      schemaScript.text = JSON.stringify(schemaData);
      document.head.appendChild(schemaScript);
    }
  }

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
