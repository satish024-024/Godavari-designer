import { DB } from "./db.js";
import { defaultSite } from "../data/defaultSite.js";
import { mergeDefaults, clone, money } from "../utils/helpers.js";
import {
  initSupabase,
  supabase,
  authService,
  categoryService,
  collectionService,
  productService,
  settingsService,
  customRequestService,
  testimonialService,
  faqService,
  orderService
} from "./supabase.js";

const STORAGE_KEY = "godavari-designer-site-v1";
const WISHLIST_KEY = "godavari-designer-wishlist-v1";
const CART_KEY = "godavari-designer-cart-v1";

// In-Memory App State (Initially loads local defaults, updated asynchronously during bootstrapping)
export let site = clone(defaultSite);
export let wishlist = new Set(DB.load(WISHLIST_KEY, []));
export let cart = DB.load(CART_KEY, []);
export let currentUser = DB.getActiveUser();
export let currentProfile = null;
export let authInitialized = false;
export let authLoading = false;
export let faqs = [];
export let dataSynced = false;
export let cartQuoteSubmitting = false;
export let lastCartQuoteResult = null;

export const ui = {
  page: "home",
  pageParams: {},
  adminOpen: false,
  searchOpen: false,
  cartOpen: false,
  quoteOpen: false,
  storyOpen: false,
  quickViewProductId: null,
  searchQuery: "",
  toast: "",
  mobileMenuOpen: false
};

let renderCallback = () => {};

export function onStateChange(callback) {
  renderCallback = callback;
}

export function triggerRender() {
  renderCallback();
}

// Map testimonials database rows back to site.stories template structure
function mapStoriesFromTestimonials(rows) {
  if (!rows || rows.length === 0) return defaultSite.stories;
  const main = rows.find(r => r.display_order === 1) || rows[0];
  const clients = rows.filter(r => r.id !== main.id).map(r => ({
    name: r.name,
    type: r.role,
    quote: r.quote,
    image: r.image
  }));
  return {
    quote: main.quote,
    person: main.name,
    role: main.role,
    rating: Number(main.rating || 5.0).toFixed(1),
    clients: clients.length > 0 ? clients : defaultSite.stories.clients
  };
}

// ==========================================
// ASYNC INITIALIZATION & SYNC LAYER
// ==========================================

let isSyncing = false;
let pendingSyncPromise = null;
let lastLocalWriteTime = 0;

export function recordLocalWrite() {
  lastLocalWriteTime = Date.now();
  console.log("Store: Local write recorded at", lastLocalWriteTime);
}

export async function syncFromSupabase() {
  if (isSyncing) {
    console.log("Store: Sync already in progress, returning existing pending promise to prevent duplicate requests");
    return pendingSyncPromise;
  }

  isSyncing = true;
  pendingSyncPromise = (async () => {
    initSupabase();
    try {
      console.log("Store: Initiating full state sync from Supabase...");
      // 1. Fetch website settings (section rows)
      const settings = await settingsService.getWebsiteSettings();
      const sections = ['brand', 'navigation', 'hero', 'steps', 'stories', 'cta', 'footer', 'theme'];
      sections.forEach((sec) => {
        if (settings[sec]) {
          site[sec] = mergeDefaults(defaultSite[sec], settings[sec]);
        }
      });

      // 2. Fetch testimonials & map to stories
      const testimonials = await testimonialService.getTestimonials();
      if (testimonials && testimonials.length > 0) {
        site.stories = mapStoriesFromTestimonials(testimonials);
      }

      // 3. Fetch categories
      const cats = await categoryService.getCategories();
      DB.saveCategories(cats); // Cache categories in LocalStorage

      // 4. Fetch collections
      const cols = await collectionService.getCollections();
      site.collections = cols;

      // 5. Fetch products
      const prods = await productService.getProducts();
      site.products = prods;
      DB.saveProducts(prods); // Cache products in LocalStorage

      // 6. Fetch FAQs
      faqs = await faqService.getFaqs();

      // Controlled State Update Path: Sanitize Catalog State (decoupled from rendering)
      try {
        const { sanitizeCatalogState } = await import("../pages/Catalog.js");
        sanitizeCatalogState(cats, cols);
      } catch (err) {
        // Catalog.js might not be loaded yet or active; ignore safely
      }

      dataSynced = true;
      import("./router.js").then(({ handleRouting }) => {
        handleRouting();
      }).catch((e) => {
        triggerRender();
      });
    } catch (err) {
      console.error("Failed to sync state from Supabase:", err);
      showToast("Running in offline mode");
      
      // Fallback: restore from local cache
      const cachedCats = DB.getCategories();
      const cachedProds = DB.getProducts();
      if (cachedProds.length > 0) site.products = cachedProds;
      
      dataSynced = true;
      import("./router.js").then(({ handleRouting }) => {
        handleRouting();
      }).catch((e) => {
        triggerRender();
      });
    } finally {
      isSyncing = false;
      pendingSyncPromise = null;
    }
  })();

  return pendingSyncPromise;
}

const authCallbacks = [];
export function onAuthChange(callback) {
  authCallbacks.push(callback);
}

function notifyAuthChange() {
  authCallbacks.forEach(cb => {
    try { cb(currentUser); } catch(e) { console.error(e); }
  });
}

export async function processPendingCartItem() {
  try {
    const pendingItemJson = sessionStorage.getItem("godavari_pending_cart_item");
    if (pendingItemJson) {
      const item = JSON.parse(pendingItemJson);
      sessionStorage.removeItem("godavari_pending_cart_item");
      if (item && item.id) {
        // Wait briefly for active state to propagate
        setTimeout(() => {
          addToCart(item.id, item.format);
          triggerRender();
        }, 100);
      }
    }
  } catch (e) {
    console.error("Failed to process pending cart item:", e);
  }
}

export async function initAuth() {
  initSupabase(true);
  authLoading = true;
  triggerRender();

  try {
    const user = await authService.getCurrentUser();
    currentUser = user;
    currentProfile = user;
    DB.setActiveUser(user);
  } catch (e) {
    currentUser = null;
    currentProfile = null;
    DB.setActiveUser(null);
  } finally {
    authLoading = false;
    authInitialized = true;
    notifyAuthChange();
    triggerRender();
  }

  // Bind session state change listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    authLoading = true;
    triggerRender();

    if (session) {
      try {
        const user = await authService.getCurrentUser();
        currentUser = user;
        currentProfile = user;
        DB.setActiveUser(user);
        await processPendingCartItem();
        
        // On OAuth sign-in, route to appropriate dashboard
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          const currentHash = window.location.hash;
          const isOnAuthPage = currentHash.includes('/auth') || 
                               currentHash.includes('access_token') ||
                               currentHash.includes('error_description');
          if (isOnAuthPage && user) {
            setTimeout(() => {
              window.location.hash = user.role === 'admin' ? '#/admin-dashboard' : '#/account';
            }, 100);
          }
        }

      } catch (e) {
        currentUser = null;
        currentProfile = null;
        DB.setActiveUser(null);
      }
    } else {
      currentUser = null;
      currentProfile = null;
      DB.setActiveUser(null);

      // If signed out, and we are on a protected route, redirect to auth
      if (event === 'SIGNED_OUT') {
        const currentHash = window.location.hash;
        if (currentHash.includes('/admin') || currentHash.includes('/account') || currentHash.includes('/admin-dashboard')) {
          window.location.hash = '#/auth';
        }
      }
    }
    
    authLoading = false;
    authInitialized = true;
    notifyAuthChange();
    triggerRender();
  });
}

// Realtime channel and refresh timeout trackers to prevent duplicate listener leaks
let realtimeChannel = null;
let refreshTimeout = null;

// Global helper for category/product visibility consistency
export const isVisible = (item) => item?.visibility !== false;

export function initRealtimeSubscriptions() {
  initSupabase();

  // Guard against duplicate subscription setups
  if (realtimeChannel) {
    console.log("Realtime: Subscriptions already initialized, skipping duplicate setup");
    return;
  }

  // Centralized debounced refresh function to sync all storefront data
  const debouncedRefresh = () => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
    refreshTimeout = setTimeout(async () => {
      // Skip if we just did a local write within 2.5 seconds to prevent refresh loops/storms
      if (Date.now() - lastLocalWriteTime < 2500) {
        console.log("Realtime: Skipping refresh, local write was just processed synchronously");
        return;
      }
      console.log("Realtime: Executing debounced full site data refresh...");
      try {
        await syncFromSupabase();
        console.log("Realtime: Full site sync complete");
      } catch (err) {
        console.error("Realtime: Full site sync failed:", err);
      }
    }, 500); // 500ms debounce window
  };

  // Create fresh subscription and attach listeners
  realtimeChannel = supabase
    .channel('schema-db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, debouncedRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, debouncedRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'collections' }, debouncedRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, debouncedRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'faqs' }, debouncedRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'website_settings' }, debouncedRefresh);

  realtimeChannel.subscribe((status) => {
    console.log(`Realtime: Subscription status is: ${status}`);
  });
}


// ==========================================
// STORE ACTIONS & MUTATIONS
// ==========================================

export async function saveSite() {
  DB.save(STORAGE_KEY, site); // local cache
  
  // Push site sections to website_settings table on Supabase
  try {
    const sections = ['brand', 'navigation', 'hero', 'steps', 'stories', 'cta', 'footer', 'theme'];
    for (const sec of sections) {
      await settingsService.updateWebsiteSettings(sec, site[sec]);
    }
    recordLocalWrite();
    showToast("Settings synchronized with database!");
  } catch (error) {
    console.error("Failed to save site settings to Supabase:", error);
    showToast(`Offline mode: Settings saved locally but failed to sync to cloud (${error.message || error})`);
  }
}

export function saveCommerce() {
  DB.save(WISHLIST_KEY, [...wishlist]);
  DB.save(CART_KEY, cart);
}

export function addToCart(id, format = null) {
  const product = site.products.find((p) => p.id === id);
  if (!product) return;
  const chosenFormat = format || (product.formats && product.formats[0] ? product.formats[0].format : "DST");
  
  // Gatekeeper: Require auth to add items to cart
  if (!currentUser) {
    sessionStorage.setItem("godavari_pending_cart_item", JSON.stringify({ id, format: chosenFormat }));
    showToast("Please sign in to add this design to your cart");
    window.location.hash = "#/auth";
    return;
  }

  const existing = cart.find((item) => item.id === id && item.format === chosenFormat);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1, format: chosenFormat });
  }
  saveCommerce();
  showToast(`${product.title} (${chosenFormat}) added to cart`);
}

export function updateCartQty(id, delta, format = null) {
  const item = format
    ? cart.find((entry) => entry.id === id && entry.format === format)
    : cart.find((entry) => entry.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    if (format) {
      cart = cart.filter((entry) => !(entry.id === id && entry.format === format));
    } else {
      cart = cart.filter((entry) => entry.id !== id);
    }
  }
  saveCommerce();
  triggerRender();
}

export function removeFromCart(id, format = null) {
  if (format) {
    cart = cart.filter((item) => !(item.id === id && item.format === format));
  } else {
    cart = cart.filter((item) => item.id !== id);
  }
  saveCommerce();
  triggerRender();
}

export function updateCartItemFormat(id, oldFormat, newFormat) {
  const item = cart.find((entry) => entry.id === id && entry.format === oldFormat);
  if (!item) return;
  const existing = cart.find((entry) => entry.id === id && entry.format === newFormat);
  if (existing) {
    existing.qty += item.qty;
    cart = cart.filter((entry) => !(entry.id === id && entry.format === oldFormat));
  } else {
    item.format = newFormat;
  }
  saveCommerce();
  triggerRender();
}

export function toggleWishlist(id) {
  if (wishlist.has(id)) {
    wishlist.delete(id);
  } else {
    wishlist.add(id);
  }
  saveCommerce();
  triggerRender();
}

let toastTimer = null;
export function showToast(message) {
  ui.toast = message;
  triggerRender();
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    ui.toast = "";
    triggerRender();
  }, 2400);
}

export function closePanels() {
  ui.adminOpen = false;
  ui.searchOpen = false;
  ui.cartOpen = false;
  ui.quoteOpen = false;
  ui.storyOpen = false;
  ui.quickViewProductId = null;
  ui.mobileMenuOpen = false;
}

export function syncAdminFields() {
  document.querySelectorAll("[data-setting]").forEach((field) => {
    setByPath(site, field.dataset.setting, field.value);
  });
  saveSite();
  triggerRender();
}

export function resetSite() {
  site = clone(defaultSite);
  saveSite();
  triggerRender();
}

export function applyJson(jsonString) {
  try {
    site = mergeDefaults(defaultSite, JSON.parse(jsonString));
    saveSite();
    ui.adminOpen = false;
    showToast("JSON applied successfully");
  } catch (error) {
    showToast("Invalid JSON structure");
  }
}

export function setPage(page, params = {}) {
  ui.page = page;
  ui.pageParams = params;
  closePanels();
  triggerRender();
  try {
    window.scrollTo({ top: 0, behavior: "instant" });
  } catch (e) {
    // ignore scroll errors in testing environments without window
  }
}

export async function loginWithGoogle() {
  try {
    await authService.loginWithGoogle();
    return true;
  } catch (error) {
    showToast(error.message || "Failed to initiate Google login");
    return false;
  }
}

export async function login(email, password) {
  try {
    const user = await authService.login(email, password);
    currentUser = user;
    currentProfile = user;
    DB.setActiveUser(user);
    showToast(`Welcome back, ${user.name}`);
    await processPendingCartItem();
    triggerRender();
    // Role-based redirect
    if (user.role === 'admin') {
      window.location.hash = '#/admin-dashboard';
    } else {
      window.location.hash = '#/account';
    }
    return true;
  } catch (error) {
    // Check if the user exists but is registered with Google OAuth
    let isGoogleUser = false;
    try {
      initSupabase();
      const { data: profile } = await supabase
        .from('profiles')
        .select('auth_provider')
        .eq('email', email)
        .maybeSingle();
      if (profile && profile.auth_provider === 'google') {
        isGoogleUser = true;
      }
    } catch (dbErr) {
      console.warn("Failed to check auth_provider on login error:", dbErr);
    }

    if (isGoogleUser) {
      showToast("This account uses Google Sign-In. Continue with Google.");
    } else {
      showToast(error.message || "Invalid email or password. New user? Please click 'Create Account' below to sign up first.");
    }
    return false;
  }
}

export async function register(email, password, name, phone, addressFields = {}) {
  try {
    const user = await authService.signUp(email, password, name, phone, addressFields);
    currentUser = user;
    currentProfile = user;
    DB.setActiveUser(user);
    showToast(`Account created! Welcome, ${user.name}`);
    await processPendingCartItem();
    triggerRender();
    // Role-based redirect
    if (user.role === 'admin') {
      window.location.hash = '#/admin-dashboard';
    } else {
      window.location.hash = '#/account';
    }
    return true;
  } catch (error) {
    // Check if the user exists but is registered with Google OAuth
    let isGoogleUser = false;
    try {
      initSupabase();
      const { data: profile } = await supabase
        .from('profiles')
        .select('auth_provider')
        .eq('email', email)
        .maybeSingle();
      if (profile && profile.auth_provider === 'google') {
        isGoogleUser = true;
      }
    } catch (dbErr) {
      console.warn("Failed to check auth_provider on registration error:", dbErr);
    }

    if (isGoogleUser) {
      showToast("This email is already registered using Google Sign-In. Please sign in with Google.");
    } else {
      showToast(error.message || "Failed to create account");
    }
    return false;
  }
}

export async function updateUserProfile(name, phone, addressFields = {}) {
  try {
    await authService.updateProfile(name, phone, addressFields);
    // Update local currentUser state
    currentUser = {
      ...currentUser,
      name,
      phone,
      addressLine1: addressFields.addressLine1 || "",
      addressLine2: addressFields.addressLine2 || "",
      city: addressFields.city || "",
      state: addressFields.state || "",
      country: addressFields.country || "",
      postalCode: addressFields.postalCode || ""
    };
    currentProfile = currentUser;
    DB.setActiveUser(currentUser);
    showToast("Profile updated successfully");
    triggerRender();
    return true;
  } catch (error) {
    showToast(error.message || "Failed to update profile");
    return false;
  }
}

export async function logout() {
  try {
    await authService.logout();
    currentUser = null;
    currentProfile = null;
    DB.setActiveUser(null);
    showToast("Logged out successfully");
    triggerRender();
  } catch (error) {
    showToast(error.message);
  }
}

export function setByPath(target, path, value) {
  const parts = path.split(".");
  let cursor = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    cursor = cursor[parts[index]];
  }
  cursor[parts[parts.length - 1]] = value;
}

// ==========================================
// CMS CATEGORIES PASSTHROUGHS
// ==========================================

export function getCategories() {
  return DB.getCategories();
}

export function getFaqs() {
  return faqs;
}

export async function saveCategories(cats) {
  // Not used directly in CMS list reorders anymore, but kept as interface fallback
  DB.saveCategories(cats);
  triggerRender();
}

export async function createCategory(cat) {
  try {
    await categoryService.createCategory(cat);
    recordLocalWrite();
    const cats = await categoryService.getCategories();
    DB.saveCategories(cats);
    triggerRender();
  } catch (error) {
    showToast(`Error: ${error.message}`);
  }
}

export async function updateCategory(id, updatedCat) {
  try {
    await categoryService.updateCategory(id, updatedCat);
    recordLocalWrite();
    const cats = await categoryService.getCategories();
    DB.saveCategories(cats);
    triggerRender();
  } catch (error) {
    showToast(`Error: ${error.message}`);
  }
}

export async function deleteCategory(id) {
  try {
    await categoryService.deleteCategory(id);
    recordLocalWrite();
    const cats = await categoryService.getCategories();
    DB.saveCategories(cats);
    triggerRender();
  } catch (error) {
    showToast(`Error: ${error.message}`);
  }
}

export function clearCartQuoteResult() {
  lastCartQuoteResult = null;
  triggerRender();
}

export async function submitCartQuote(formData) {
  if (!cart || cart.length === 0) {
    showToast("Your cart is empty");
    return null;
  }

  // 1. Map/transform cart items to structured cart_items format
  const cartItems = cart.map((item) => {
    const product = site.products.find((p) => p.id === item.id);
    if (!product) return null;
    const formatObj = product.formats ? product.formats.find(f => f.format === item.format) : null;
    const unitPrice = formatObj ? formatObj.price : product.price;
    const categoryName = product.category || "";
    const collectionName = product.collection || "";

    return {
      product_id: product.id,
      product_slug: product.slug,
      product_name: product.title,
      quantity: item.qty,
      selected_format: item.format,
      unit_price: Number(unitPrice),
      line_total: Number(unitPrice * item.qty),
      image: product.image,
      category_name: categoryName,
      collection_name: collectionName
    };
  }).filter(Boolean);

  if (cartItems.length === 0) {
    showToast("Invalid items in cart");
    return null;
  }

  cartQuoteSubmitting = true;
  triggerRender();

  try {
    const payload = {
      userId: currentUser ? currentUser.id : null,
      name: formData.name || formData.get?.("name") || "",
      email: formData.email || formData.get?.("email") || "",
      phone: formData.phone || formData.get?.("phone") || "",
      notes: formData.notes || formData.get?.("notes") || "",
      cartItems
    };

    let result;
    try {
      result = await customRequestService.createCartQuoteRequest(payload);
    } catch (dbErr) {
      console.warn("Database insert failed, falling back to local reference for WhatsApp:", dbErr);
      
      const year = new Date().getFullYear();
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randStr = '';
      for (let i = 0; i < 6; i++) {
        randStr += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const refNum = `GD-CQ-TEMP-${year}-${randStr}`;

      result = {
        id: "temp-" + Date.now(),
        referenceNumber: refNum,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        notes: payload.notes,
        cartItems: payload.cartItems,
        createdAt: new Date().toISOString(),
        isLocalFallback: true
      };
    }

    // Build the WhatsApp message
    const itemsText = cartItems.map(item => `- ${item.product_name} (${item.selected_format}) x${item.quantity}`).join('\n');
    const totalEst = cartItems.reduce((sum, item) => sum + item.line_total, 0);
    const whatsappMsg = `Hello Godavari Designer, I would like to request a quote for the following designs:

Reference: ${result.referenceNumber}
Customer: ${result.name}
Email: ${result.email}
Phone: ${result.phone}
Notes: ${result.notes || "None"}

Designs:
${itemsText}

Total Estimate: ${money(totalEst)}

Please confirm the pricing and availability. Thank you!`;

    const whatsappPhone = (site.brand?.contact?.phone || "918309897055").replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMsg)}`;

    try {
      window.open(whatsappUrl, "_blank");
    } catch (popErr) {
      console.warn("Popup blocked, fallback will be handled by success page button", popErr);
    }

    // Clear cart upon successful submission/preparation
    cart = [];
    saveCommerce();

    result.whatsappUrl = whatsappUrl;
    lastCartQuoteResult = result;

    if (!result.isLocalFallback) {
      showToast("Quote inquiry submitted successfully!");
    } else {
      showToast("Inquiry prepared. Please send via WhatsApp.");
    }

    return result;
  } catch (err) {
    console.error("Failed to submit cart quote:", err);
    showToast(err.message || "Failed to submit quote inquiry");
    throw err;
  } finally {
    cartQuoteSubmitting = false;
    triggerRender();
  }
}

export async function submitQuoteModal(formData) {
  const cartItems = cart.map((item) => {
    const product = site.products.find((p) => p.id === item.id);
    if (!product) return null;
    const formatObj = product.formats ? product.formats.find(f => f.format === item.format) : null;
    const unitPrice = formatObj ? formatObj.price : product.price;
    const categoryName = product.category || "";
    const collectionName = product.collection || "";

    return {
      product_id: product.id,
      product_slug: product.slug,
      product_name: product.title,
      quantity: item.qty,
      selected_format: item.format,
      unit_price: Number(unitPrice),
      line_total: Number(unitPrice * item.qty),
      image: product.image,
      category_name: categoryName,
      collection_name: collectionName
    };
  }).filter(Boolean);

  const nameVal = formData.name || formData.get?.("name") || "";
  const emailVal = formData.email || formData.get?.("email") || "";
  const phoneVal = formData.phone || formData.get?.("phone") || "";
  const projectVal = formData.project || formData.get?.("project") || "Custom Quote";
  const notesVal = formData.notes || formData.get?.("notes") || "";

  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randStr = '';
  for (let i = 0; i < 6; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const prefix = cartItems.length > 0 ? "GD-CQ" : "GD-CO";
  const refNum = `${prefix}-${year}-${randStr}`;
  const statusVal = currentUser ? "Submitted" : "Guest Lead";

  const requestData = {
    userId: currentUser ? currentUser.id : null,
    name: nameVal,
    email: emailVal,
    phone: phoneVal,
    projectType: projectVal,
    notes: notesVal,
    artworkAttachment: null,
    status: statusVal,
    referenceNumber: refNum,
    requestSource: cartItems.length > 0 ? "cart_quote" : "custom_order",
    cartItems: cartItems.length > 0 ? cartItems : null
  };

  try {
    let result;
    let isLocalFallback = false;
    try {
      result = await customRequestService.createRequest(requestData);
    } catch (dbErr) {
      console.warn("Database insert failed for quote modal, falling back to WhatsApp:", dbErr);
      isLocalFallback = true;
      result = {
        id: "temp-" + Date.now(),
        referenceNumber: refNum,
        name: requestData.name,
        email: requestData.email,
        phone: requestData.phone,
        projectType: requestData.projectType,
        notes: requestData.notes,
        status: statusVal,
        createdAt: new Date().toISOString(),
        requestSource: requestData.requestSource,
        cartItems: requestData.cartItems,
        isLocalFallback: true
      };
    }

    const whatsappPhone = (site.brand?.contact?.phone || "918309897055").replace(/[^0-9]/g, '');
    let whatsappMsg = `Hello Godavari Designer, I would like to request a quote.

Reference: ${result.referenceNumber}
Customer: ${result.name}
Email: ${result.email}
Phone: ${result.phone}
Project Type: ${result.projectType}
Notes: ${result.notes || "None"}
`;

    if (cartItems.length > 0) {
      const itemsText = cartItems.map(item => `- ${item.product_name} (${item.selected_format}) x${item.quantity}`).join('\n');
      const totalEst = cartItems.reduce((sum, item) => sum + item.line_total, 0);
      whatsappMsg += `
Selected Designs:
${itemsText}

Total Estimate: ${money(totalEst)}
`;
    }

    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMsg)}`;

    try {
      window.open(whatsappUrl, "_blank");
    } catch (popErr) {
      console.warn("Popup blocked, fallback will be handled by success page button", popErr);
    }

    if (cartItems.length > 0) {
      cart = [];
      saveCommerce();
    }

    result.whatsappUrl = whatsappUrl;
    
    if (!result.isLocalFallback) {
      showToast("Quote request submitted successfully!");
    } else {
      showToast("Quote request prepared. Opening WhatsApp...");
    }

    return result;
  } catch (err) {
    console.error("Failed to submit quote modal:", err);
    showToast(err.message || "Failed to submit quote request");
    throw err;
  }
}
