const STORAGE_KEY = "godavari-designer-site-v1";
const WISHLIST_KEY = "godavari-designer-wishlist-v1";
const CART_KEY = "godavari-designer-cart-v1";
const USERS_KEY = "godavari-designer-users-v1";
const PRODUCTS_KEY = "godavari-designer-products-v1";
const ORDERS_KEY = "godavari-designer-orders-v1";
const REQUESTS_KEY = "godavari-designer-requests-v1";
const FAQS_KEY = "godavari-designer-faqs-v1";
const SUBSCRIBERS_KEY = "godavari-designer-subscribers-v1";
const ACTIVE_USER_KEY = "godavari-designer-active-user-v1";

// Schema Definitions for validation
const Schemas = {
  User: {
    email: { type: "string", required: true, email: true },
    name: { type: "string", required: true },
    role: { type: "string", required: true }, // 'admin' | 'customer'
    password: { type: "string", required: true }
  },
  Product: {
    id: { type: "string", required: true },
    title: { type: "string", required: true },
    price: { type: "number", required: true },
    label: { type: "string", required: true },
    image: { type: "string", required: true },
    categoryId: { type: "string", required: true },
    description: { type: "string", required: true },
    stitchCount: { type: "number", required: true },
    dimensions: { type: "string", required: true },
    threadColorsCount: { type: "number", required: true },
    stitchType: { type: "string", required: true },
    fileFormats: { type: "array", required: true }
  },
  Order: {
    id: { type: "string", required: true },
    userId: { type: "string", required: true },
    items: { type: "array", required: true },
    total: { type: "number", required: true },
    paymentStatus: { type: "string", required: true }, // 'pending' | 'paid'
    createdAt: { type: "string", required: true }
  },
  CustomRequest: {
    id: { type: "string", required: true },
    name: { type: "string", required: true },
    email: { type: "string", required: true, email: true },
    phone: { type: "string", required: false },
    projectType: { type: "string", required: true },
    notes: { type: "string", required: true },
    status: { type: "string", required: true }, // 'received' | 'quoted' | 'sampling' | 'approved' | 'completed'
    quoteAmount: { type: "number", required: false },
    paymentStatus: { type: "string", required: true }, // 'unpaid' | 'paid'
    createdAt: { type: "string", required: true }
  },
  FAQ: {
    id: { type: "string", required: true },
    question: { type: "string", required: true },
    answer: { type: "string", required: true },
    category: { type: "string", required: true }
  }
};

// Runtime Schema Validator
function validateInput(data, schema) {
  const errors = [];
  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];
    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push(`${key} is required`);
      continue;
    }
    if (value !== undefined && value !== null && value !== "") {
      if (rules.type === "string" && typeof value !== "string") {
        errors.push(`${key} must be a string`);
      } else if (rules.type === "number" && typeof value !== "number") {
        errors.push(`${key} must be a number`);
      } else if (rules.type === "array" && !Array.isArray(value)) {
        errors.push(`${key} must be an array`);
      } else if (rules.type === "boolean" && typeof value !== "boolean") {
        errors.push(`${key} must be a boolean`);
      }
      if (rules.email && typeof value === "string" && !value.includes("@")) {
        errors.push(`${key} must be a valid email`);
      }
    }
  }
  if (errors.length > 0) {
    throw new Error("Validation Error: " + errors.join(", "));
  }
  return true;
}

// Client-side Database Controller
const DB = {
  load(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  
  getUsers() { return this.load(USERS_KEY, []); },
  saveUsers(users) { this.save(USERS_KEY, users); },
  
  getProducts() { return this.load(PRODUCTS_KEY, []); },
  saveProducts(products) { this.save(PRODUCTS_KEY, products); },
  
  getOrders() { return this.load(ORDERS_KEY, []); },
  saveOrders(orders) { this.save(ORDERS_KEY, orders); },
  
  getRequests() { return this.load(REQUESTS_KEY, []); },
  saveRequests(requests) { this.save(REQUESTS_KEY, requests); },
  
  getFaqs() { return this.load(FAQS_KEY, []); },
  saveFaqs(faqs) { this.save(FAQS_KEY, faqs); },
  
  getSubscribers() { return this.load(SUBSCRIBERS_KEY, []); },
  saveSubscribers(subs) { this.save(SUBSCRIBERS_KEY, subs); },

  getActiveUser() { return this.load(ACTIVE_USER_KEY, null); },
  setActiveUser(user) { this.save(ACTIVE_USER_KEY, user); }
};

function initDB() {
  if (DB.getUsers().length === 0) {
    const defaultUsers = [
      { email: "admin@godavari.com", name: "Sameer (Founder)", role: "admin", password: "admin123" },
      { email: "designer@label.com", name: "Ananya Mehta", role: "customer", password: "designer123" }
    ];
    defaultUsers.forEach(u => validateInput(u, Schemas.User));
    DB.saveUsers(defaultUsers);
  }

  if (DB.getProducts().length === 0) {
    const defaultProducts = [
      {
        id: "royal-peony",
        title: "Royal Peony Motif",
        price: 45,
        label: "Bestseller",
        image: "https://images.pexels.com/photos/10566050/pexels-photo-10566050.jpeg?auto=compress&cs=tinysrgb&w=1200",
        gallery: ["https://images.pexels.com/photos/10566050/pexels-photo-10566050.jpeg?auto=compress&cs=tinysrgb&w=1200"],
        description: "An exquisite royal peony motif designed for luxury blouses and centerpieces.",
        categoryId: "floral",
        stitchCount: 18400,
        dimensions: "140mm x 165mm",
        threadColorsCount: 6,
        stitchType: "Satin & Fill",
        fileFormats: ["DST", "EXP", "PES", "JEF", "XXX"]
      },
      {
        id: "floral-vine",
        title: "Floral Vine Border",
        price: 38,
        label: "New",
        image: "https://images.pexels.com/photos/6045282/pexels-photo-6045282.jpeg?auto=compress&cs=tinysrgb&w=1200",
        gallery: ["https://images.pexels.com/photos/6045282/pexels-photo-6045282.jpeg?auto=compress&cs=tinysrgb&w=1200"],
        description: "Elegant trailing floral vine border, perfect for saree borders, necklines, and panels.",
        categoryId: "saree",
        stitchCount: 12500,
        dimensions: "80mm x 250mm",
        threadColorsCount: 4,
        stitchType: "Run & Satin",
        fileFormats: ["DST", "EXP", "PES", "JEF", "XXX"]
      },
      {
        id: "paisley-patch",
        title: "Regal Paisley Patch",
        price: 42,
        label: "Couture",
        image: "https://images.pexels.com/photos/12715935/pexels-photo-12715935.jpeg?auto=compress&cs=tinysrgb&w=1200",
        gallery: ["https://images.pexels.com/photos/12715935/pexels-photo-12715935.jpeg?auto=compress&cs=tinysrgb&w=1200"],
        description: "Ornate regal paisley patch with rich gold embroidery details for bridal lehengas and ethnic wear back-necks.",
        categoryId: "bridal",
        stitchCount: 22100,
        dimensions: "150mm x 180mm",
        threadColorsCount: 5,
        stitchType: "Zari & Satin",
        fileFormats: ["DST", "EXP", "PES", "JEF", "XXX"]
      },
      {
        id: "luxury-net",
        title: "Luxury Net Embroidery",
        price: 55,
        label: "Limited",
        image: "https://images.pexels.com/photos/10542570/pexels-photo-10542570.jpeg?auto=compress&cs=tinysrgb&w=1200",
        gallery: ["https://images.pexels.com/photos/10542570/pexels-photo-10542570.jpeg?auto=compress&cs=tinysrgb&w=1200"],
        description: "Intricate all-over net style embroidery pattern designed for designer blouse backs and heavy sleeves.",
        categoryId: "blouses",
        stitchCount: 29500,
        dimensions: "200mm x 220mm",
        threadColorsCount: 7,
        stitchType: "Fill & Satin",
        fileFormats: ["DST", "EXP", "PES", "JEF", "XXX"]
      },
      {
        id: "golden-leaf",
        title: "Golden Leaf Trail",
        price: 36,
        label: "Studio Pick",
        image: "https://images.pexels.com/photos/37218091/pexels-photo-37218091.jpeg?auto=compress&cs=tinysrgb&w=1200",
        gallery: ["https://images.pexels.com/photos/37218091/pexels-photo-37218091.jpeg?auto=compress&cs=tinysrgb&w=1200"],
        description: "Delicate golden leaf trailing motif, suitable for soft festive kids wear, lehengas, and borders.",
        categoryId: "kids",
        stitchCount: 9200,
        dimensions: "70mm x 130mm",
        threadColorsCount: 3,
        stitchType: "Satin & Run",
        fileFormats: ["DST", "EXP", "PES", "JEF", "XXX"]
      }
    ];
    defaultProducts.forEach(p => validateInput(p, Schemas.Product));
    DB.saveProducts(defaultProducts);
  }

  if (DB.getFaqs().length === 0) {
    const defaultFaqs = [
      { id: "faq-1", question: "What formats do the machine-ready files come in?", answer: "We support DST, EXP, PES, JEF, and XXX formats. You can download all or any format after purchasing.", category: "Formats" },
      { id: "faq-2", question: "What is your turnaround time for custom digitizing?", answer: "Custom digitizing designs are reviewed, quoted, and sampled within 24-48 hours.", category: "Digitizing" },
      { id: "faq-3", question: "Do you supply physical samples of designs?", answer: "No, we provide high-resolution digital stitch-out rendering files and video previews. Once approved, the digital files are ready for production on your machine.", category: "Sampling" },
      { id: "faq-4", question: "How do I download my purchases?", answer: "Once payment is verified, you can download files directly from your order tracking screen or user profile area.", category: "Orders" }
    ];
    defaultFaqs.forEach(f => validateInput(f, Schemas.FAQ));
    DB.saveFaqs(defaultFaqs);
  }
}

initDB();

const defaultSite = {
  theme: {
    ivory: "#F8F6F2",
    surface: "#EFE8DD",
    navy: "#111D42",
    gold: "#C8A15A",
    border: "#E6DED1",
    glass: "rgba(255, 255, 255, 0.68)",
    blush: "#D8A7A0",
    sage: "#8D9B83"
  },
  brand: {
    name: "Godavari Designer",
    tagline: "Precision. Passion. Perfection.",
    descriptor: "Luxury embroidery designs, digitized to perfection for fashion that inspires.",
    trustText: "Trusted by 2,500+ Fashion Brands Worldwide",
    storyLabel: "Watch Our Story",
    qualityTitle: "Premium Quality",
    qualityText: "Machine-Ready Designs",
    contact: {
      email: "hello@godavaridesigner.com",
      phone: "+91 98765 43210",
      address: "Hyderabad, India",
      instagram: "@godavaridesigner"
    }
  },
  navigation: [
    { label: "Collections", target: "collections" },
    { label: "Custom Digitizing", target: "process" },
    { label: "Design Library", target: "best-sellers" },
    { label: "About Us", target: "stories" },
    { label: "Inspiration", target: "cta" },
    { label: "Contact", target: "footer" }
  ],
  hero: {
    eyebrow: "Passion. Perfection.",
    heading: "Embroidery Reimagined",
    subheading: "Custom Digitizing, Luxury Embroidery Designs, Machine-Ready Collections.",
    primaryButton: "Browse Designs",
    secondaryButton: "Request Custom Quote",
    videoUrl: "https://assets.mixkit.co/videos/45527/45527-720.mp4",
    posterImage: "https://images.pexels.com/photos/6045282/pexels-photo-6045282.jpeg?auto=compress&cs=tinysrgb&w=2200",
    note: "Cinematic machine stitching with luxury floral embroidery direction."
  },
  collections: [
    {
      id: "bridal",
      title: "Bridal Collection",
      description: "Heirloom motifs, veil borders and couture wedding details.",
      image: "https://images.pexels.com/photos/14111325/pexels-photo-14111325.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
    {
      id: "blouses",
      title: "Designer Blouses",
      description: "Back-neck artwork, sleeves and precision blouse placements.",
      image: "https://images.pexels.com/photos/29119826/pexels-photo-29119826.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
    {
      id: "saree",
      title: "Saree Borders",
      description: "Machine-ready ornate borders for silk, net and organza sarees.",
      image: "https://images.pexels.com/photos/32441377/pexels-photo-32441377.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
    {
      id: "kids",
      title: "Kids Wear",
      description: "Soft festive details for lehengas, frocks and tiny occasionwear.",
      image: "https://images.pexels.com/photos/29199351/pexels-photo-29199351.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
    {
      id: "floral",
      title: "Luxury Floral",
      description: "Dimensional florals, gold vines and elevated botanical patterns.",
      image: "https://images.pexels.com/photos/10566050/pexels-photo-10566050.jpeg?auto=compress&cs=tinysrgb&w=1200"
    }
  ],
  steps: [
    {
      title: "Upload Design",
      body: "Upload your artwork, sketch or reference.",
      icon: "upload-cloud"
    },
    {
      title: "Get Quote",
      body: "Receive a custom quote within 24 hours.",
      icon: "receipt-text"
    },
    {
      title: "Approve Sample",
      body: "Review and approve your stitch sample.",
      icon: "badge-check"
    },
    {
      title: "Production",
      body: "Precision embroidery with luxury quality.",
      icon: "factory"
    },
    {
      title: "Delivery",
      body: "Delivered to your doorstep.",
      icon: "package-check"
    }
  ],
  products: [
    {
      id: "royal-peony",
      title: "Royal Peony Motif",
      price: 45,
      label: "Bestseller",
      image: "https://images.pexels.com/photos/10566050/pexels-photo-10566050.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
    {
      id: "floral-vine",
      title: "Floral Vine Border",
      price: 38,
      label: "New",
      image: "https://images.pexels.com/photos/6045282/pexels-photo-6045282.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
    {
      id: "paisley-patch",
      title: "Regal Paisley Patch",
      price: 42,
      label: "Couture",
      image: "https://images.pexels.com/photos/12715935/pexels-photo-12715935.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
    {
      id: "luxury-net",
      title: "Luxury Net Embroidery",
      price: 55,
      label: "Limited",
      image: "https://images.pexels.com/photos/10542570/pexels-photo-10542570.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
    {
      id: "golden-leaf",
      title: "Golden Leaf Trail",
      price: 36,
      label: "Studio Pick",
      image: "https://images.pexels.com/photos/37218091/pexels-photo-37218091.jpeg?auto=compress&cs=tinysrgb&w=1200"
    }
  ],
  stories: {
    quote: "Godavari transformed our ideas into exquisite embroidery that elevates our entire collection.",
    person: "Neha Mehta",
    role: "Designer, Delhi",
    rating: "5.0",
    clients: [
      {
        name: "House of Anaya",
        type: "Fashion House",
        quote: "The sampling quality made approvals effortless.",
        image: "https://images.pexels.com/photos/29119826/pexels-photo-29119826.jpeg?auto=compress&cs=tinysrgb&w=1200"
      },
      {
        name: "Label Neha",
        type: "Designer Label",
        quote: "Digitizing felt exact, refined and ready for production.",
        image: "https://images.pexels.com/photos/32441377/pexels-photo-32441377.jpeg?auto=compress&cs=tinysrgb&w=1200"
      },
      {
        name: "Saaz Couture",
        type: "Couture Studio",
        quote: "Our bridal pieces now carry a richer finish.",
        image: "https://images.pexels.com/photos/6045282/pexels-photo-6045282.jpeg?auto=compress&cs=tinysrgb&w=1200"
      },
      {
        name: "Ivy & Oak Designs",
        type: "Boutique",
        quote: "A calm, premium experience from quote to delivery.",
        image: "https://images.pexels.com/photos/10542570/pexels-photo-10542570.jpeg?auto=compress&cs=tinysrgb&w=1200"
      },
      {
        name: "Meera Bridals",
        type: "Bridal Atelier",
        quote: "Every motif arrived production-ready.",
        image: "https://images.pexels.com/photos/14111325/pexels-photo-14111325.jpeg?auto=compress&cs=tinysrgb&w=1200"
      }
    ]
  },
  cta: {
    headline: "Bring Your Embroidery Vision To Life",
    text: "Transform ideas into precision embroidery crafted for fashion brands, boutiques and designers.",
    primaryButton: "Request Custom Quote",
    secondaryButton: "Browse Collections",
    image: "https://images.pexels.com/photos/10542570/pexels-photo-10542570.jpeg?auto=compress&cs=tinysrgb&w=1800"
  },
  footer: {
    columns: [
      {
        title: "Shop",
        links: ["All Collections", "Best Sellers", "New Arrivals", "Design Library", "Custom Digitizing"]
      },
      {
        title: "Company",
        links: ["About Us", "Our Process", "Why Godavari", "Reviews", "Careers"]
      },
      {
        title: "Support",
        links: ["FAQs", "Shipping & Delivery", "Returns & Refunds", "Terms of Service", "Privacy Policy"]
      }
    ],
    newsletterTitle: "Stay Inspired",
    newsletterText: "Subscribe to get updates on new designs, offers and embroidery inspirations."
  }
};

let site = loadSite();
let wishlist = new Set(loadJson(WISHLIST_KEY, []));
let cart = loadJson(CART_KEY, []);
let ui = {
  adminOpen: false,
  searchOpen: false,
  cartOpen: false,
  quoteOpen: false,
  storyOpen: false,
  searchQuery: "",
  toast: ""
};

const app = document.getElementById("app");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function mergeDefaults(base, saved) {
  if (Array.isArray(base)) return Array.isArray(saved) ? saved : base;
  if (!isObject(base)) return saved === undefined ? base : saved;

  const output = { ...base };
  if (!isObject(saved)) return output;

  Object.keys(saved).forEach((key) => {
    output[key] = key in base ? mergeDefaults(base[key], saved[key]) : saved[key];
  });
  return output;
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function loadSite() {
  const loadedSite = mergeDefaults(defaultSite, loadJson(STORAGE_KEY, null));
  loadedSite.products = DB.getProducts();
  return loadedSite;
}

function saveSite() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(site));
}

function saveCommerce() {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify([...wishlist]));
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attr(value) {
  return escapeHtml(value);
}

function icon(name, size = 20) {
  return `<i data-lucide="${name}" style="width:${size}px;height:${size}px" aria-hidden="true"></i>`;
}

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function cartCount() {
  return cart.reduce((total, item) => total + item.qty, 0);
}

function getProduct(id) {
  return site.products.find((product) => product.id === id);
}

function setByPath(target, path, value) {
  const parts = path.split(".");
  let cursor = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    cursor = cursor[parts[index]];
  }
  cursor[parts[parts.length - 1]] = value;
}

function applyTheme() {
  const root = document.documentElement;
  Object.entries(site.theme).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  document.title = site.brand.name;
}

function render() {
  applyTheme();
  app.innerHTML = `
    <div class="site-shell">
      ${renderHeader()}
      <main>
        ${renderHero()}
        ${renderCollections()}
        ${renderProcess()}
        ${renderBestSellers()}
        ${renderStories()}
        ${renderCta()}
      </main>
      ${renderFooter()}
      ${renderFloatingActions()}
      ${ui.searchOpen ? renderSearchOverlay() : ""}
      ${ui.cartOpen ? renderCartDrawer() : ""}
      ${ui.quoteOpen ? renderQuoteModal() : ""}
      ${ui.storyOpen ? renderStoryModal() : ""}
      ${ui.adminOpen ? renderAdminDrawer() : ""}
      ${ui.toast ? `<div class="toast">${escapeHtml(ui.toast)}</div>` : ""}
    </div>
  `;

  afterRender();
}

function renderHeader() {
  return `
    <header class="site-header" id="siteHeader">
      <a class="brand-lockup" href="#home" data-action="scroll-to" data-target="home" aria-label="${attr(site.brand.name)} home">
        <span class="brand-name">${escapeHtml(site.brand.name.split(" ")[0] || site.brand.name)}</span>
        <span class="brand-sub">${escapeHtml(site.brand.name.split(" ").slice(1).join(" ") || "Designer")}</span>
        <span class="brand-tagline">${escapeHtml(site.brand.tagline)}</span>
      </a>
      <nav class="main-nav" aria-label="Main navigation">
        ${site.navigation
          .map(
            (item) => `
              <button type="button" class="nav-link" data-action="scroll-to" data-target="${attr(item.target)}">
                ${escapeHtml(item.label)}
              </button>
            `
          )
          .join("")}
      </nav>
      <div class="header-actions">
        <button type="button" class="icon-button" data-action="open-search" aria-label="Search">
          ${icon("search", 21)}
        </button>
        <button type="button" class="icon-button" data-action="open-admin" aria-label="Admin customization">
          ${icon("user-round", 21)}
        </button>
        <button type="button" class="icon-button cart-button" data-action="open-cart" aria-label="Cart">
          ${icon("shopping-bag", 21)}
          <span>${cartCount()}</span>
        </button>
      </div>
    </header>
  `;
}

function renderHero() {
  return `
    <section class="hero" id="home">
      <div class="hero-media" aria-hidden="true">
        <img class="hero-poster" src="${attr(site.hero.posterImage)}" alt="" />
        ${
          site.hero.videoUrl
            ? `<video class="hero-video" autoplay muted loop playsinline poster="${attr(site.hero.posterImage)}">
                <source src="${attr(site.hero.videoUrl)}" type="video/mp4" />
              </video>`
            : ""
        }
      </div>
      <div class="hero-veil" aria-hidden="true"></div>
      ${renderThreads()}
      <div class="hero-inner">
        <div class="hero-copy reveal">
          <p class="section-kicker">${escapeHtml(site.hero.eyebrow)}</p>
          <h1>${escapeHtml(site.hero.heading).replace(" ", "<br />")}</h1>
          <p class="hero-subtitle">${escapeHtml(site.hero.subheading)}</p>
          <div class="hero-actions">
            <button type="button" class="button button-primary" data-action="scroll-to" data-target="collections">
              <span>${escapeHtml(site.hero.primaryButton)}</span>
              ${icon("arrow-right", 20)}
            </button>
            <button type="button" class="button button-secondary" data-action="open-quote">
              <span>${escapeHtml(site.hero.secondaryButton)}</span>
              ${icon("sparkles", 18)}
            </button>
          </div>
          <div class="hero-meta">
            <div class="avatar-stack" aria-hidden="true">
              ${site.stories.clients
                .slice(0, 4)
                .map((client) => `<img src="${attr(client.image)}" alt="" />`)
                .join("")}
            </div>
            <span>${escapeHtml(site.brand.trustText)}</span>
            <button type="button" class="story-link" data-action="open-story">
              <span class="play-dot">${icon("play", 14)}</span>
              ${escapeHtml(site.brand.storyLabel)}
            </button>
          </div>
        </div>
        <aside class="quality-card reveal">
          ${icon("gem", 34)}
          <strong>${escapeHtml(site.brand.qualityTitle)}</strong>
          <span>${escapeHtml(site.brand.qualityText)}</span>
        </aside>
      </div>
      <button type="button" class="scroll-cue" data-action="scroll-to" data-target="collections" aria-label="Scroll to collections">
        ${icon("chevron-down", 22)}
        <span>Scroll to explore</span>
      </button>
    </section>
  `;
}

function renderThreads() {
  return `
    <div class="thread-layer" aria-hidden="true">
      <svg class="thread thread-a" viewBox="0 0 700 180">
        <path d="M4 110 C 120 12, 230 178, 344 88 S 546 16, 696 98" />
      </svg>
      <svg class="thread thread-b" viewBox="0 0 580 160">
        <path d="M6 74 C 95 134, 184 8, 280 80 S 450 146, 574 52" />
      </svg>
      <svg class="thread thread-c" viewBox="0 0 460 150">
        <path d="M5 112 C 90 10, 156 128, 234 58 S 360 30, 455 96" />
      </svg>
    </div>
  `;
}

function renderSectionHeading(kicker, title, actionLabel, target) {
  return `
    <div class="section-heading reveal">
      <div>
        <p class="section-kicker">${escapeHtml(kicker)}</p>
        <h2>${escapeHtml(title)}</h2>
      </div>
      ${
        actionLabel
          ? `<button type="button" class="text-action" data-action="scroll-to" data-target="${attr(target)}">
              ${escapeHtml(actionLabel)}
              ${icon("arrow-right", 18)}
            </button>`
          : ""
      }
    </div>
  `;
}

function renderCollections() {
  return `
    <section class="content-section collections-section" id="collections">
      ${renderSectionHeading("Featured Collections", "Luxury Machine-Ready Worlds", "", "")}
      <div class="carousel-shell">
        <button type="button" class="round-control left" data-action="scroll-carousel" data-target="collectionTrack" data-direction="-1" aria-label="Previous collections">
          ${icon("arrow-left", 18)}
        </button>
        <div class="collection-track" id="collectionTrack">
          ${site.collections
            .map(
              (collection, index) => `
                <article class="collection-card reveal" style="--delay:${index * 80}ms">
                  <img src="${attr(collection.image)}" alt="${attr(collection.title)}" loading="lazy" />
                  <div class="collection-overlay">
                    <p>${escapeHtml(collection.description)}</p>
                  </div>
                  <div class="collection-content">
                    <h3>${escapeHtml(collection.title)}</h3>
                    <button type="button" class="gold-circle" data-action="open-collection" data-label="${attr(collection.title)}" aria-label="Open ${attr(collection.title)}">
                      ${icon("arrow-right", 18)}
                    </button>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
        <button type="button" class="round-control right" data-action="scroll-carousel" data-target="collectionTrack" data-direction="1" aria-label="Next collections">
          ${icon("arrow-right", 18)}
        </button>
      </div>
    </section>
  `;
}

function renderProcess() {
  return `
    <section class="content-section process-section" id="process">
      ${renderSectionHeading("How It Works", "From Sketch To Stitch File", "", "")}
      <div class="timeline reveal">
        <div class="timeline-thread" aria-hidden="true"></div>
        ${site.steps
          .map(
            (step, index) => `
              <article class="timeline-step" style="--step:${index}">
                <div class="step-number">${index + 1}</div>
                <div class="step-icon">${icon(step.icon, 30)}</div>
                <h3>${escapeHtml(step.title)}</h3>
                <p>${escapeHtml(step.body)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderBestSellers() {
  return `
    <section class="content-section best-sellers-section" id="best-sellers">
      ${renderSectionHeading("Best Sellers", "Premium Embroidery Showcase", "View All Designs", "best-sellers")}
      <div class="product-grid">
        ${site.products
          .map(
            (product, index) => `
              <article class="product-card reveal" style="--delay:${index * 70}ms">
                <div class="product-media">
                  <img src="${attr(product.image)}" alt="${attr(product.title)}" loading="lazy" />
                  <span class="product-label">${escapeHtml(product.label)}</span>
                  <button type="button" class="heart-button ${wishlist.has(product.id) ? "active" : ""}" data-action="toggle-wishlist" data-id="${attr(product.id)}" aria-label="Save ${attr(product.title)}">
                    ${icon("heart", 18)}
                  </button>
                </div>
                <div class="product-info">
                  <div>
                    <h3>${escapeHtml(product.title)}</h3>
                    <p>${money(product.price)}</p>
                  </div>
                  <button type="button" class="bag-mini" data-action="add-cart" data-id="${attr(product.id)}" aria-label="Add ${attr(product.title)} to cart">
                    ${icon("shopping-bag", 18)}
                  </button>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderStories() {
  return `
    <section class="content-section stories-section" id="stories">
      ${renderSectionHeading("Customer Stories", "Fashion Houses, Boutique Owners, Designer Labels", "", "")}
      <div class="stories-layout">
        <article class="testimonial reveal">
          <span class="quote-mark">"</span>
          <p>${escapeHtml(site.stories.quote)}</p>
          <div class="rating">${icon("star", 16)} ${icon("star", 16)} ${icon("star", 16)} ${icon("star", 16)} ${icon("star", 16)} <span>${escapeHtml(site.stories.rating)}</span></div>
          <div class="testimonial-person">
            <img src="${attr(site.stories.clients[1]?.image || site.hero.posterImage)}" alt="${attr(site.stories.person)}" />
            <div>
              <strong>${escapeHtml(site.stories.person)}</strong>
              <span>${escapeHtml(site.stories.role)}</span>
            </div>
          </div>
        </article>
        <div class="client-showcase reveal">
          <div class="logo-row">
            ${site.stories.clients
              .map(
                (client) => `
                  <button type="button" data-action="open-story">
                    <span>${escapeHtml(client.type)}</span>
                    <strong>${escapeHtml(client.name)}</strong>
                  </button>
                `
              )
              .join("")}
          </div>
          <div class="story-gallery">
            ${site.stories.clients
              .slice(0, 3)
              .map(
                (client) => `
                  <article>
                    <img src="${attr(client.image)}" alt="${attr(client.name)}" loading="lazy" />
                    <div>
                      <strong>${escapeHtml(client.name)}</strong>
                      <span>${escapeHtml(client.quote)}</span>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderCta() {
  return `
    <section class="premium-cta" id="cta">
      <img src="${attr(site.cta.image)}" alt="" loading="lazy" />
      <div class="premium-cta-copy reveal">
        <p class="section-kicker">Custom Digitizing Studio</p>
        <h2>${escapeHtml(site.cta.headline)}</h2>
        <p>${escapeHtml(site.cta.text)}</p>
        <div class="hero-actions">
          <button type="button" class="button button-primary" data-action="open-quote">
            <span>${escapeHtml(site.cta.primaryButton)}</span>
            ${icon("arrow-right", 20)}
          </button>
          <button type="button" class="button button-secondary" data-action="scroll-to" data-target="collections">
            <span>${escapeHtml(site.cta.secondaryButton)}</span>
            ${icon("sparkles", 18)}
          </button>
        </div>
      </div>
    </section>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer" id="footer">
      <div class="footer-brand">
        <a class="brand-lockup footer-logo" href="#home" data-action="scroll-to" data-target="home">
          <span class="brand-name">${escapeHtml(site.brand.name.split(" ")[0] || site.brand.name)}</span>
          <span class="brand-sub">${escapeHtml(site.brand.name.split(" ").slice(1).join(" ") || "Designer")}</span>
        </a>
        <p>${escapeHtml(site.brand.descriptor)}</p>
        <div class="contact-row">
          <button type="button" data-action="copy-email">${icon("mail", 16)} ${escapeHtml(site.brand.contact.email)}</button>
          <span>${icon("phone", 16)} ${escapeHtml(site.brand.contact.phone)}</span>
          <span>${icon("map-pin", 16)} ${escapeHtml(site.brand.contact.address)}</span>
        </div>
      </div>
      <div class="footer-columns">
        ${site.footer.columns
          .map(
            (column) => `
              <div>
                <h3>${escapeHtml(column.title)}</h3>
                ${column.links.map((link) => `<button type="button" data-action="open-search" data-query="${attr(link)}">${escapeHtml(link)}</button>`).join("")}
              </div>
            `
          )
          .join("")}
      </div>
      <form class="newsletter" id="newsletterForm">
        <h3>${escapeHtml(site.footer.newsletterTitle)}</h3>
        <p>${escapeHtml(site.footer.newsletterText)}</p>
        <label>
          <span>Email address</span>
          <input name="email" type="email" placeholder="Enter your email" required />
          <button type="submit" aria-label="Subscribe">${icon("arrow-right", 20)}</button>
        </label>
      </form>
      <div class="footer-bottom">
        <span>&copy; 2026 ${escapeHtml(site.brand.name)}. All Rights Reserved.</span>
        <span>${icon("lock", 16)} Secure Payments</span>
        <span>${icon("globe-2", 16)} Worldwide Shipping</span>
        <span>${icon("gem", 16)} Premium Quality</span>
      </div>
    </footer>
  `;
}

function renderFloatingActions() {
  return `
    <div class="floating-actions">
      <button type="button" class="admin-fab" data-action="open-admin" aria-label="Customize website">
        ${icon("sliders-horizontal", 20)}
      </button>
      <button type="button" class="to-top" data-action="scroll-to" data-target="home" aria-label="Back to top">
        ${icon("arrow-up", 20)}
      </button>
    </div>
  `;
}

function renderSearchOverlay() {
  const query = ui.searchQuery.toLowerCase().trim();
  const results = [
    ...site.collections.map((item) => ({ ...item, kind: "Collection" })),
    ...site.products.map((item) => ({ ...item, description: `${item.label} - ${money(item.price)}`, kind: "Design" }))
  ].filter((item) => {
    if (!query) return true;
    return `${item.title} ${item.description || ""} ${item.kind}`.toLowerCase().includes(query);
  });

  return `
    <div class="overlay-panel search-overlay" role="dialog" aria-modal="true" aria-label="Search designs">
      <div class="overlay-scrim" data-action="close-panels"></div>
      <section class="search-modal">
        <div class="modal-header">
          <h2>Design Library</h2>
          <button type="button" class="icon-button" data-action="close-panels" aria-label="Close search">${icon("x", 22)}</button>
        </div>
        <label class="search-field">
          ${icon("search", 22)}
          <input id="searchInput" value="${attr(ui.searchQuery)}" placeholder="Search collections, motifs, borders..." />
        </label>
        <div class="search-results">
          ${results
            .map(
              (item) => `
                <article>
                  <img src="${attr(item.image)}" alt="${attr(item.title)}" />
                  <div>
                    <span>${escapeHtml(item.kind)}</span>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.description || "")}</p>
                  </div>
                  <button type="button" class="gold-circle" data-action="${item.kind === "Design" ? "add-cart" : "open-collection"}" data-id="${attr(item.id || "")}" data-label="${attr(item.title)}">
                    ${icon(item.kind === "Design" ? "shopping-bag" : "arrow-right", 17)}
                  </button>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderCartDrawer() {
  const lines = cart
    .map((item) => {
      const product = getProduct(item.id);
      if (!product) return "";
      return `
        <article class="cart-line">
          <img src="${attr(product.image)}" alt="${attr(product.title)}" />
          <div>
            <h3>${escapeHtml(product.title)}</h3>
            <p>${money(product.price)} x ${item.qty}</p>
            <div class="qty-row">
              <button type="button" data-action="cart-minus" data-id="${attr(product.id)}">${icon("minus", 14)}</button>
              <span>${item.qty}</span>
              <button type="button" data-action="cart-plus" data-id="${attr(product.id)}">${icon("plus", 14)}</button>
            </div>
          </div>
          <button type="button" class="icon-button" data-action="remove-cart" data-id="${attr(product.id)}" aria-label="Remove ${attr(product.title)}">${icon("trash-2", 18)}</button>
        </article>
      `;
    })
    .join("");

  const total = cart.reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);

  return `
    <div class="drawer-layer" role="dialog" aria-modal="true" aria-label="Cart">
      <div class="overlay-scrim" data-action="close-panels"></div>
      <aside class="side-drawer">
        <div class="drawer-header">
          <div>
            <span>Studio Cart</span>
            <h2>Selected Designs</h2>
          </div>
          <button type="button" class="icon-button" data-action="close-panels" aria-label="Close cart">${icon("x", 22)}</button>
        </div>
        <div class="cart-list">
          ${lines || `<div class="empty-state">${icon("shopping-bag", 30)}<p>No designs selected yet.</p></div>`}
        </div>
        <div class="cart-summary">
          <span>Total</span>
          <strong>${money(total)}</strong>
        </div>
        <button type="button" class="button button-primary full-width" data-action="open-quote">
          <span>Request Production Quote</span>
          ${icon("arrow-right", 20)}
        </button>
      </aside>
    </div>
  `;
}

function renderQuoteModal() {
  return `
    <div class="overlay-panel" role="dialog" aria-modal="true" aria-label="Request custom quote">
      <div class="overlay-scrim" data-action="close-panels"></div>
      <section class="quote-modal">
        <div class="modal-header">
          <div>
            <span>Custom Quote</span>
            <h2>Request Custom Digitizing</h2>
          </div>
          <button type="button" class="icon-button" data-action="close-panels" aria-label="Close quote form">${icon("x", 22)}</button>
        </div>
        <form id="quoteForm" class="quote-form">
          <label>
            <span>Name</span>
            <input name="name" required placeholder="Your name" />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" required placeholder="you@example.com" />
          </label>
          <label>
            <span>Phone</span>
            <input name="phone" placeholder="+91" />
          </label>
          <label>
            <span>Project Type</span>
            <select name="project">
              <option>Custom Digitizing</option>
              <option>Bridal Embroidery</option>
              <option>Saree Border Design</option>
              <option>Designer Blouse Embroidery</option>
              <option>Boutique Production</option>
            </select>
          </label>
          <label class="wide">
            <span>Design Notes</span>
            <textarea name="notes" rows="4" placeholder="Fabric, size, colors, stitch direction, timeline..."></textarea>
          </label>
          <button type="submit" class="button button-primary full-width">
            <span>Send Quote Request</span>
            ${icon("send", 19)}
          </button>
        </form>
      </section>
    </div>
  `;
}

function renderStoryModal() {
  return `
    <div class="overlay-panel" role="dialog" aria-modal="true" aria-label="Customer story">
      <div class="overlay-scrim" data-action="close-panels"></div>
      <section class="story-modal">
        <button type="button" class="icon-button modal-close" data-action="close-panels" aria-label="Close story">${icon("x", 22)}</button>
        <img src="${attr(site.hero.posterImage)}" alt="${attr(site.brand.name)} studio" />
        <div>
          <span>${escapeHtml(site.brand.tagline)}</span>
          <h2>${escapeHtml(site.hero.heading)}</h2>
          <p>${escapeHtml(site.hero.note)}</p>
          <div class="story-stats">
            <strong>2,500+</strong><span>Fashion brands</span>
            <strong>24h</strong><span>Quote window</span>
            <strong>4K</strong><span>Visual-first catalog</span>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderAdminDrawer() {
  const json = JSON.stringify(site, null, 2);
  return `
    <div class="drawer-layer admin-layer" role="dialog" aria-modal="true" aria-label="Admin customization">
      <div class="overlay-scrim" data-action="close-panels"></div>
      <aside class="admin-drawer">
        <div class="drawer-header">
          <div>
            <span>Admin Studio</span>
            <h2>Customize Homepage</h2>
          </div>
          <button type="button" class="icon-button" data-action="close-panels" aria-label="Close admin">${icon("x", 22)}</button>
        </div>
        <div class="admin-content">
          <section class="admin-section">
            <h3>Brand</h3>
            ${adminInput("Website name", "brand.name", site.brand.name)}
            ${adminInput("Tagline", "brand.tagline", site.brand.tagline)}
            ${adminTextarea("Descriptor", "brand.descriptor", site.brand.descriptor)}
          </section>
          <section class="admin-section">
            <h3>Contact</h3>
            ${adminInput("Email", "brand.contact.email", site.brand.contact.email)}
            ${adminInput("Phone", "brand.contact.phone", site.brand.contact.phone)}
            ${adminInput("Address", "brand.contact.address", site.brand.contact.address)}
            ${adminInput("Instagram", "brand.contact.instagram", site.brand.contact.instagram)}
          </section>
          <section class="admin-section">
            <h3>Hero</h3>
            ${adminInput("Eyebrow", "hero.eyebrow", site.hero.eyebrow)}
            ${adminInput("Heading", "hero.heading", site.hero.heading)}
            ${adminTextarea("Subheading", "hero.subheading", site.hero.subheading)}
            ${adminInput("Primary button", "hero.primaryButton", site.hero.primaryButton)}
            ${adminInput("Secondary button", "hero.secondaryButton", site.hero.secondaryButton)}
          </section>
          <section class="admin-section">
            <h3>Colors</h3>
            <div class="color-grid">
              ${Object.entries(site.theme)
                .filter(([, value]) => String(value).startsWith("#"))
                .map(
                  ([key, value]) => `
                    <label>
                      <span>${escapeHtml(key)}</span>
                      <input type="color" data-setting="theme.${attr(key)}" value="${attr(value)}" />
                    </label>
                  `
                )
                .join("")}
            </div>
          </section>
          <section class="admin-section wide-admin">
            <h3>Media Library</h3>
            <div class="media-admin-grid">
              ${renderMediaAdminRows()}
            </div>
          </section>
          <section class="admin-section wide-admin">
            <h3>Full Content JSON</h3>
            <textarea id="siteJsonEditor" class="json-editor" spellcheck="false">${escapeHtml(json)}</textarea>
          </section>
        </div>
        <div class="admin-actions">
          <button type="button" class="admin-button" data-action="reset-site">${icon("rotate-ccw", 17)} Reset</button>
          <button type="button" class="admin-button" data-action="export-site">${icon("download", 17)} Export</button>
          <button type="button" class="admin-button" data-action="apply-json">${icon("braces", 17)} Apply JSON</button>
          <button type="button" class="admin-button primary" data-action="save-admin">${icon("save", 17)} Done</button>
        </div>
      </aside>
    </div>
  `;
}

function adminInput(label, path, value) {
  return `
    <label class="admin-field">
      <span>${escapeHtml(label)}</span>
      <input data-setting="${attr(path)}" value="${attr(value)}" />
    </label>
  `;
}

function adminTextarea(label, path, value) {
  return `
    <label class="admin-field">
      <span>${escapeHtml(label)}</span>
      <textarea data-setting="${attr(path)}" rows="3">${escapeHtml(value)}</textarea>
    </label>
  `;
}

function renderMediaAdminRows() {
  const rows = [
    { label: "Hero video", path: "hero.videoUrl", value: site.hero.videoUrl, preview: site.hero.posterImage },
    { label: "Hero poster", path: "hero.posterImage", value: site.hero.posterImage, preview: site.hero.posterImage },
    { label: "CTA image", path: "cta.image", value: site.cta.image, preview: site.cta.image },
    ...site.collections.map((item, index) => ({
      label: `Collection: ${item.title}`,
      path: `collections.${index}.image`,
      value: item.image,
      preview: item.image
    })),
    ...site.products.map((item, index) => ({
      label: `Product: ${item.title}`,
      path: `products.${index}.image`,
      value: item.image,
      preview: item.image
    })),
    ...site.stories.clients.map((item, index) => ({
      label: `Story: ${item.name}`,
      path: `stories.clients.${index}.image`,
      value: item.image,
      preview: item.image
    }))
  ];

  return rows
    .map(
      (row) => `
        <label class="media-field">
          <img src="${attr(row.preview)}" alt="" />
          <span>${escapeHtml(row.label)}</span>
          <input data-setting="${attr(row.path)}" value="${attr(row.value)}" />
        </label>
      `
    )
    .join("");
}

function afterRender() {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.focus();
    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
  }

  document.querySelectorAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });

  updateHeaderState();
}

function syncAdminFields() {
  document.querySelectorAll("[data-setting]").forEach((field) => {
    setByPath(site, field.dataset.setting, field.value);
  });
  saveSite();
  applyTheme();
}

function addToCart(id) {
  const product = getProduct(id);
  if (!product) return;
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCommerce();
  showToast(`${product.title} added to cart`);
}

function updateCartQty(id, delta) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((entry) => entry.id !== id);
  saveCommerce();
  render();
}

function showToast(message) {
  ui.toast = message;
  render();
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    ui.toast = "";
    render();
  }, 2400);
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(site, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "godavari-designer-content.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function closePanels() {
  ui.adminOpen = false;
  ui.searchOpen = false;
  ui.cartOpen = false;
  ui.quoteOpen = false;
  ui.storyOpen = false;
}

function scrollToTarget(target) {
  closePanels();
  render();
  requestAnimationFrame(() => {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;

  const action = trigger.dataset.action;

  if (action === "scroll-to") {
    scrollToTarget(trigger.dataset.target);
  }

  if (action === "open-search") {
    ui.searchQuery = trigger.dataset.query || ui.searchQuery;
    ui.searchOpen = true;
    ui.adminOpen = false;
    render();
  }

  if (action === "open-admin") {
    ui.adminOpen = true;
    ui.searchOpen = false;
    render();
  }

  if (action === "open-cart") {
    ui.cartOpen = true;
    render();
  }

  if (action === "open-quote") {
    ui.quoteOpen = true;
    ui.cartOpen = false;
    render();
  }

  if (action === "open-story") {
    ui.storyOpen = true;
    render();
  }

  if (action === "close-panels") {
    closePanels();
    render();
  }

  if (action === "add-cart") {
    addToCart(trigger.dataset.id);
  }

  if (action === "toggle-wishlist") {
    const id = trigger.dataset.id;
    if (wishlist.has(id)) wishlist.delete(id);
    else wishlist.add(id);
    saveCommerce();
    render();
  }

  if (action === "remove-cart") {
    cart = cart.filter((item) => item.id !== trigger.dataset.id);
    saveCommerce();
    render();
  }

  if (action === "cart-minus") updateCartQty(trigger.dataset.id, -1);
  if (action === "cart-plus") updateCartQty(trigger.dataset.id, 1);

  if (action === "open-collection") {
    ui.searchQuery = trigger.dataset.label || "";
    ui.searchOpen = true;
    render();
  }

  if (action === "scroll-carousel") {
    const target = document.getElementById(trigger.dataset.target);
    const direction = Number(trigger.dataset.direction || 1);
    target?.scrollBy({ left: direction * 420, behavior: "smooth" });
  }

  if (action === "copy-email") {
    navigator.clipboard?.writeText(site.brand.contact.email);
    showToast("Email copied");
  }

  if (action === "save-admin") {
    syncAdminFields();
    ui.adminOpen = false;
    showToast("Homepage updated");
  }

  if (action === "reset-site") {
    if (window.confirm("Reset the homepage content to the default Godavari design?")) {
      site = clone(defaultSite);
      saveSite();
      render();
      showToast("Homepage reset");
    }
  }

  if (action === "export-site") {
    syncAdminFields();
    downloadJson();
  }

  if (action === "apply-json") {
    const editor = document.getElementById("siteJsonEditor");
    try {
      site = mergeDefaults(defaultSite, JSON.parse(editor.value));
      saveSite();
      ui.adminOpen = false;
      showToast("JSON applied");
    } catch (error) {
      showToast("JSON could not be applied");
    }
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "searchInput") {
    ui.searchQuery = event.target.value;
    render();
  }

  const settingField = event.target.closest("[data-setting]");
  if (settingField && settingField.type === "color") {
    setByPath(site, settingField.dataset.setting, settingField.value);
    saveSite();
    applyTheme();
  }
});

document.addEventListener("change", (event) => {
  const settingField = event.target.closest("[data-setting]");
  if (!settingField) return;
  setByPath(site, settingField.dataset.setting, settingField.value);
  saveSite();
  applyTheme();
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "quoteForm") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    localStorage.setItem(
      "godavari-designer-last-quote",
      JSON.stringify({ ...data, cart, submittedAt: new Date().toISOString() })
    );
    closePanels();
    showToast("Quote request saved");
  }

  if (event.target.id === "newsletterForm") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    localStorage.setItem(
      "godavari-designer-newsletter",
      JSON.stringify({ ...data, submittedAt: new Date().toISOString() })
    );
    event.target.reset();
    showToast("Subscribed");
  }
});

function updateHeaderState() {
  const header = document.getElementById("siteHeader");
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
  document.documentElement.style.setProperty("--scroll-y", `${window.scrollY}px`);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  },
  { threshold: 0.16 }
);

window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("mousemove", (event) => {
  const x = (event.clientX / window.innerWidth - 0.5).toFixed(3);
  const y = (event.clientY / window.innerHeight - 0.5).toFixed(3);
  document.documentElement.style.setProperty("--mouse-x", x);
  document.documentElement.style.setProperty("--mouse-y", y);
});

render();
