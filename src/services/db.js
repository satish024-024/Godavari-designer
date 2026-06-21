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
const CATEGORIES_KEY = "godavari-designer-categories-v1";

import { defaultSite, faqs } from "../data/defaultSite.js";

// Default Category Data Model seeding
const defaultCategories = [
  // Parent Categories
  {
    id: "cat-bridal",
    name: "Bridal",
    slug: "bridal",
    parentCategoryId: null,
    image: "media-collection-bridal",
    bannerImage: "media-collection-bridal",
    description: "Heirloom-quality bridal machine embroidery designs, intricate wedding lehenga borders, and couture blouse back-neck patterns. Meticulously digitized to ensure flawless stitching with gold zari and metallic threads on premium silks, velvets, and organza veils.",
    featured: true,
    seoTitle: "Luxury Bridal & Wedding Lehenga Embroidery Designs | Godavari",
    seoDescription: "Explore heirloom bridal machine embroidery designs. Premium lehenga borders, blouse back-necks, and veil embroidery files in DST, PES, and EXP formats.",
    displayOrder: 1,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "cat-blouses",
    name: "Blouse Designs",
    slug: "blouses",
    parentCategoryId: null,
    image: "media-collection-blouses",
    bannerImage: "media-collection-blouses",
    description: "Exquisite designer blouse embroidery placement files, featuring detailed back-necks, front collars, and sleeve borders. Fully optimized computer embroidery designs compatible with Tajima, Brother, and other commercial sewing machines.",
    featured: false,
    seoTitle: "Designer Blouse Embroidery Designs & Neck Patterns | Godavari",
    seoDescription: "Download luxury blouse neck designs, sleeve borders, and computer embroidery patterns. Compatible with all major machine formats.",
    displayOrder: 2,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "cat-saree",
    name: "Saree Borders",
    slug: "saree",
    parentCategoryId: null,
    image: "media-collection-saree",
    bannerImage: "media-collection-saree",
    description: "Intricate, repeating machine embroidery borders and lace trims engineered for wedding sarees, dupattas, and heavy drapes. Offers seamless continuous loops that guarantee neat stitch sequences and zero overlapping errors.",
    featured: false,
    seoTitle: "Luxury Saree Border Machine Embroidery Designs | Godavari",
    seoDescription: "High-quality saree border embroidery files. Elegant gold zari borders, temple borders, and lace trims for silk & organza sarees.",
    displayOrder: 3,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "cat-kids-wear",
    name: "Kids Wear",
    slug: "kids-wear",
    parentCategoryId: null,
    image: "media-collection-kids",
    bannerImage: "media-collection-kids",
    description: "Soft, skin-safe festive embroidery motifs and patterns designed for kids' ethnic wear, frocks, sherwanis, and mini lehengas. Engineered with low stitch density and light fills to keep fabrics comfortable and flexible.",
    featured: false,
    seoTitle: "Festive Kids Wear Machine Embroidery Patterns | Godavari",
    seoDescription: "Delicate, skin-safe festive embroidery designs for children. Cute frocks, kid lehengas, and ethnic sherwani motifs.",
    displayOrder: 4,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "cat-floral",
    name: "Luxury Floral",
    slug: "floral-collection",
    parentCategoryId: null,
    image: "media-collection-floral",
    bannerImage: "media-collection-floral",
    description: "Dimensional floral motifs, botanical vine borders, and gold rose patterns. Digitized with sophisticated shading techniques and stitch directions to create elevated 3D textured effects on luxury apparel.",
    featured: false,
    seoTitle: "Luxury Floral Machine Embroidery Patterns & Vines | Godavari",
    seoDescription: "Premium floral embroidery patterns, rose motifs, and gold vine borders for luxury boutique stitching.",
    displayOrder: 5,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "cat-designer",
    name: "Designer",
    slug: "designer",
    parentCategoryId: null,
    image: "media-collection-floral",
    bannerImage: "media-collection-floral",
    description: "Couture digitizing and premium designer placements.",
    featured: true,
    seoTitle: "Designer Embroidery Collection | Godavari Designer",
    seoDescription: "Browse designer embroidery patterns and couture placements.",
    displayOrder: 6,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "cat-luxury",
    name: "Luxury",
    slug: "luxury",
    parentCategoryId: null,
    image: "media-product-peony",
    bannerImage: "media-product-peony",
    description: "Ultra high stitch-count premium masterpieces.",
    featured: true,
    seoTitle: "Luxury Masterpiece Embroidery | Godavari Designer",
    seoDescription: "High stitch count premium luxury embroidery designs.",
    displayOrder: 7,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  
  // Subcategories
  // Bridal Subcategories
  {
    id: "sub-3d-flower",
    name: "3D Flower",
    slug: "3d-flower",
    parentCategoryId: "cat-bridal",
    image: "media-collection-bridal",
    bannerImage: "media-collection-bridal",
    description: "Three-dimensional flower motifs.",
    featured: false,
    seoTitle: "3D Flower Bridal Embroidery | Godavari Designer",
    seoDescription: "Dimensional flower embroidery patterns.",
    displayOrder: 1,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "sub-cutwork",
    name: "Cutwork",
    slug: "cutwork",
    parentCategoryId: "cat-bridal",
    image: "media-collection-bridal",
    bannerImage: "media-collection-bridal",
    description: "Intricate bridal cutwork embroidery designs. Digitized with dense, secure satin stitch edges to serve as perfect fabric cutting guides, achieving a clean hollow lace look on boutique blouses.",
    featured: true,
    seoTitle: "Bridal Cutwork Blouse Embroidery Designs | Godavari",
    seoDescription: "Intricate cutwork machine embroidery patterns. Exquisite back-neck cutouts and lace border files.",
    displayOrder: 2,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "sub-embossed",
    name: "Embossed",
    slug: "embossed",
    parentCategoryId: "cat-bridal",
    image: "media-collection-bridal",
    bannerImage: "media-collection-bridal",
    description: "Raised embossed textures.",
    featured: false,
    seoTitle: "Embossed Bridal Embroidery | Godavari Designer",
    seoDescription: "Raised embossed textures for luxury lehengas.",
    displayOrder: 3,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "sub-peacock",
    name: "Peacock",
    slug: "peacock",
    parentCategoryId: "cat-bridal",
    image: "media-collection-bridal",
    bannerImage: "media-collection-bridal",
    description: "Elegant peacock designs.",
    featured: false,
    seoTitle: "Peacock Bridal Embroidery | Godavari Designer",
    seoDescription: "Peacock motifs for ethnic bridal couture.",
    displayOrder: 4,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  
  // Blouse Subcategories
  {
    id: "sub-boat-neck",
    name: "Boat Neck",
    slug: "boat-neck",
    parentCategoryId: "cat-blouses",
    image: "media-collection-blouses",
    bannerImage: "media-collection-blouses",
    description: "Boat neck placement patterns.",
    featured: false,
    seoTitle: "Boat Neck Blouse Embroidery | Godavari Designer",
    seoDescription: "Boat neck embroidery placements.",
    displayOrder: 1,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "sub-pot-neck",
    name: "Pot Neck",
    slug: "pot-neck",
    parentCategoryId: "cat-blouses",
    image: "media-collection-blouses",
    bannerImage: "media-collection-blouses",
    description: "Pot neck placement patterns.",
    featured: false,
    seoTitle: "Pot Neck Blouse Embroidery | Godavari Designer",
    seoDescription: "Pot neck embroidery placements.",
    displayOrder: 2,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "sub-v-neck",
    name: "V Neck",
    slug: "v-neck",
    parentCategoryId: "cat-blouses",
    image: "media-collection-blouses",
    bannerImage: "media-collection-blouses",
    description: "V neck placement patterns.",
    featured: false,
    seoTitle: "V Neck Blouse Embroidery | Godavari Designer",
    seoDescription: "V neck embroidery placements.",
    displayOrder: 3,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "sub-neckline",
    name: "Neckline",
    slug: "neckline",
    parentCategoryId: "cat-blouses",
    image: "media-collection-blouses",
    bannerImage: "media-collection-blouses",
    description: "Regal necklines and collar placements.",
    featured: true,
    seoTitle: "Neckline Embroidery Designs | Godavari Designer",
    seoDescription: "Regal neckline and collar embroidery placements.",
    displayOrder: 4,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  
  // Saree Subcategories
  {
    id: "sub-floral",
    name: "Floral",
    slug: "floral-saree",
    parentCategoryId: "cat-saree",
    image: "media-collection-saree",
    bannerImage: "media-collection-saree",
    description: "Floral saree borders and motifs.",
    featured: true,
    seoTitle: "Floral Saree Borders | Godavari Designer",
    seoDescription: "Floral patterns for saree borders.",
    displayOrder: 1,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "sub-temple",
    name: "Temple",
    slug: "temple",
    parentCategoryId: "cat-saree",
    image: "media-collection-saree",
    bannerImage: "media-collection-saree",
    description: "Traditional temple saree borders.",
    featured: false,
    seoTitle: "Temple Saree Borders | Godavari Designer",
    seoDescription: "Temple borders for traditional sarees.",
    displayOrder: 2,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "sub-traditional",
    name: "Traditional",
    slug: "traditional",
    parentCategoryId: "cat-saree",
    image: "media-collection-saree",
    bannerImage: "media-collection-saree",
    description: "Ethnic traditional borders and motifs.",
    featured: true,
    seoTitle: "Traditional Saree Borders | Godavari Designer",
    seoDescription: "Ethnic border machine embroidery.",
    displayOrder: 3,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "sub-borders",
    name: "Borders",
    slug: "borders",
    parentCategoryId: "cat-saree",
    image: "media-collection-saree",
    bannerImage: "media-collection-saree",
    description: "Exquisite borders for sarees and lehengas.",
    featured: false,
    seoTitle: "Embroidery Borders | Godavari Designer",
    seoDescription: "Premium machine-ready embroidery borders.",
    displayOrder: 4,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "sub-zari-work",
    name: "Zari Work",
    slug: "zari-work",
    parentCategoryId: "cat-saree",
    image: "media-collection-saree",
    bannerImage: "media-collection-saree",
    description: "Classic gold metallic thread zari work patterns. Authentic Indian motifs designed for high-density metallic thread stability, minimizing breaks on high-speed machines.",
    featured: false,
    seoTitle: "Traditional Gold Zari Work Machine Embroidery | Godavari",
    seoDescription: "Couture gold metallic zari embroidery files. Premium motifs for wedding lehengas and festive blouses.",
    displayOrder: 5,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  
  // Kids Subcategory
  {
    id: "sub-kids",
    name: "Kids",
    slug: "kids-sub",
    parentCategoryId: "cat-kids-wear",
    image: "media-collection-kids",
    bannerImage: "media-collection-kids",
    description: "Children festive wear designs.",
    featured: true,
    seoTitle: "Kids Embroidery Designs | Godavari Designer",
    seoDescription: "Festive children wear embroidery designs.",
    displayOrder: 1,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z"
  }
];

// Schema Definitions for validation
export const Schemas = {
  User: {
    email: { type: "string", required: true, email: true },
    name: { type: "string", required: true },
    role: { type: "string", required: true }, // 'admin' | 'customer'
    password: { type: "string", required: true }
  },
  Category: {
    id: { type: "string", required: true },
    name: { type: "string", required: true },
    slug: { type: "string", required: true },
    parentCategoryId: { type: "string", required: false },
    image: { type: "string", required: true },
    bannerImage: { type: "string", required: true },
    description: { type: "string", required: true },
    featured: { type: "boolean", required: true },
    seoTitle: { type: "string", required: true },
    seoDescription: { type: "string", required: true },
    displayOrder: { type: "number", required: true }
  },
  Product: {
    id: { type: "string", required: true },
    slug: { type: "string", required: true },
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    price: { type: "number", required: true },
    category: { type: "string", required: true },
    collection: { type: "string", required: true },
    image: { type: "string", required: true }, // media reference ID
    gallery: { type: "array", required: true }, // media reference IDs
    stitchCount: { type: "number", required: true },
    threadColors: { type: "number", required: true },
    dimensions: { type: "string", required: true },
    machineFormats: { type: "array", required: true },
    featured: { type: "boolean", required: true },
    bestSeller: { type: "boolean", required: true },
    tags: { type: "array", required: true },
    seoTitle: { type: "string", required: true },
    seoDescription: { type: "string", required: true },
    createdAt: { type: "string", required: true },
    updatedAt: { type: "string", required: true },
    
    // Extended Specifications
    width: { type: "number", required: true },
    height: { type: "number", required: true },
    backStitchCount: { type: "number", required: true },
    handStitchCount: { type: "number", required: true },
    totalStitchCount: { type: "number", required: true },
    rpm: { type: "number", required: true },
    estimatedEmbroideryTime: { type: "number", required: true },
    difficultyLevel: { type: "string", required: true },
    recommendedFabrics: { type: "array", required: true },
    formats: { type: "array", required: true }
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
export function validateInput(data, schema) {
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
export const DB = {
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
  
  getCategories() { return this.load(CATEGORIES_KEY, []); },
  saveCategories(cats) { this.save(CATEGORIES_KEY, cats); },

  getProducts() {
    const products = this.load(PRODUCTS_KEY, []);
    let migrated = false;
    products.forEach((p) => {
      if (this.migrateProductSchema(p)) {
        migrated = true;
      }
    });
    if (migrated) {
      this.saveProducts(products);
    }
    return products;
  },
  saveProducts(products) { this.save(PRODUCTS_KEY, products); },
  
  getOrders() { return this.load(ORDERS_KEY, []); },
  saveOrders(orders) { this.save(ORDERS_KEY, orders); },
  
  getRequests() { return this.load(REQUESTS_KEY, []); },
  saveRequests(requests) { this.save(REQUESTS_KEY, requests); },
  
  getFaqs() { return this.load(FAQS_KEY, []); },
  saveFaqs(faqsList) { this.save(FAQS_KEY, faqsList); },
  
  getSubscribers() { return this.load(SUBSCRIBERS_KEY, []); },
  saveSubscribers(subs) { this.save(SUBSCRIBERS_KEY, subs); },

  getActiveUser() { return this.load(ACTIVE_USER_KEY, null); },
  setActiveUser(user) { this.save(ACTIVE_USER_KEY, user); },

  // Self-healing migration for existing databases in Local Storage
  migrateProductSchema(p) {
    let modified = false;
    
    // Specifications
    if (p.width === undefined) { 
      const parts = (p.dimensions || "100mm x 100mm").toLowerCase().split("x");
      p.width = parseInt(parts[0]) || 100;
      modified = true; 
    }
    if (p.height === undefined) { 
      const parts = (p.dimensions || "100mm x 100mm").toLowerCase().split("x");
      p.height = parseInt(parts[1]) || 100;
      modified = true; 
    }
    if (p.backStitchCount === undefined) { p.backStitchCount = Math.round((p.stitchCount || 10000) * 0.08); modified = true; }
    if (p.handStitchCount === undefined) { p.handStitchCount = 0; modified = true; }
    if (p.totalStitchCount === undefined) { p.totalStitchCount = p.stitchCount || 10000; modified = true; }
    if (p.rpm === undefined) { p.rpm = 850; modified = true; }
    if (p.estimatedEmbroideryTime === undefined) { p.estimatedEmbroideryTime = Math.round(p.totalStitchCount / 850) + 2; modified = true; }
    if (p.difficultyLevel === undefined) { p.difficultyLevel = "Intermediate"; modified = true; }
    if (p.tags === undefined) { p.tags = []; modified = true; }
    
    // Fabrics
    if (p.recommendedFabrics === undefined) { p.recommendedFabrics = ["Silk", "Net", "Organza"]; modified = true; }
    
    // Formats Detailed Array
    if (p.formats === undefined) {
      const fmts = p.machineFormats || ["DST", "EXP", "PES", "JEF", "XXX"];
      p.formats = fmts.map((f) => ({
        format: f,
        machineBrand: f === "DST" ? "Tajima" : f === "PES" ? "Brother" : f === "EXP" ? "Bernina" : f === "JEF" ? "Janome" : "Singer",
        machineModel: "Standard",
        hoopSize: `${p.width}mm x ${p.height}mm`,
        price: p.price || 40
      }));
      modified = true;
    }
    return modified;
  }
};

export function initDB() {
  // Database seeding is now handled centrally on Supabase via migrations
}
