import { site, wishlist, getCategories } from "../services/store.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

// Page level reactive state
export const catalogState = {
  searchQuery: "",
  selectedCategory: "All",
  selectedSubcategory: "All",
  selectedCollection: "All",
  sortBy: "default",
  minPrice: 0,
  maxPrice: 100,
  minStitchCount: 0,
  maxStitchCount: 100000,
  selectedDifficulty: "All",
  selectedBrand: "All",
  selectedFormat: "All",
  selectedHoop: "All",
  selectedColors: "All",
  filterFeatured: false,
  filterBestSeller: false,
  moreFiltersOpen: false,
  visibleLimit: 8 // for Load More pagination
};

let lastCategoryParam = null;
let lastCollectionParam = null;
let lastSearchParam = null;

export function renderCatalog() {
  const cats = getCategories();
  const query = (catalogState.searchQuery || "").toLowerCase().trim();

  // --- Router Parameters Synchronizer ---
  // If the router set category/collection/search parameters in store, apply it
  const routeParams = window.location.hash.split("?")[1] || "";
  const categoryParam = new URLSearchParams(routeParams).get("category") || null;
  const collectionParam = new URLSearchParams(routeParams).get("collection") || null;
  const searchParam = new URLSearchParams(routeParams).get("search") || null;

  if (searchParam !== lastSearchParam) {
    lastSearchParam = searchParam;
    catalogState.searchQuery = searchParam || "";
  }

  if (categoryParam !== lastCategoryParam) {
    lastCategoryParam = categoryParam;
    if (categoryParam) {
      const cat = cats.find(c => c.slug === categoryParam);
      if (cat) {
        if (!cat.parentCategoryId) {
          catalogState.selectedCategory = cat.name;
          catalogState.selectedSubcategory = "All";
        } else {
          const parent = cats.find(p => p.id === cat.parentCategoryId);
          catalogState.selectedCategory = parent ? parent.name : "All";
          catalogState.selectedSubcategory = cat.name;
        }
      }
    } else {
      catalogState.selectedCategory = "All";
      catalogState.selectedSubcategory = "All";
    }
  }
  
  if (collectionParam !== lastCollectionParam) {
    lastCollectionParam = collectionParam;
    if (collectionParam) {
      catalogState.selectedCollection = collectionParam;
    } else {
      catalogState.selectedCollection = "All";
    }
  }

  // --- Dynamic Category / Subcategory lists ---
  // Get featured categories for top navigation pills (both parent and subcategories can be featured)
  const featuredCats = cats.filter(c => c.featured).sort((a, b) => a.displayOrder - b.displayOrder);
  const pillCategories = ["All", ...featuredCats.map(c => c.name)];
  
  // Find parent of selected category (if it is a subcategory) or the selected category itself (if it is a parent)
  let activeParent = null;
  const selectedCat = cats.find(c => c.name === catalogState.selectedCategory);
  if (selectedCat) {
    if (!selectedCat.parentCategoryId) {
      activeParent = selectedCat;
    } else {
      activeParent = cats.find(c => c.id === selectedCat.parentCategoryId);
    }
  }

  // Find subcategories of the active parent
  let subcategories = ["All"];
  if (activeParent) {
    subcategories = ["All", ...cats.filter(c => c.parentCategoryId === activeParent.id).sort((a, b) => a.displayOrder - b.displayOrder).map(c => c.name)];
  }

  // Collections (slugs: bridal, blouses, saree, kids, floral)
  const collections = ["All", "bridal", "blouses", "saree", "kids", "floral"];

  // --- Filters Application ---
  let filtered = site.products.filter((product) => {
    // 1. Search Query Match (instant, matches name, code, category, collection, tags, stitchType)
    if (query) {
      const matchText = `${product.title} ${product.code} ${product.category} ${product.collection} ${product.stitchType} ${product.tags.join(" ")}`.toLowerCase();
      if (!matchText.includes(query)) return false;
    }

    // 2. Category Match
    if (catalogState.selectedCategory !== "All") {
      // Find parent category ID
      const parentCat = cats.find(c => c.name === catalogState.selectedCategory && !c.parentCategoryId);
      if (parentCat) {
        // If product category matches parent, or matches any of its subcategories
        const productCat = cats.find(c => c.name === product.category);
        if (!productCat) return false;
        
        const isDirectMatch = productCat.id === parentCat.id;
        const isChildMatch = productCat.parentCategoryId === parentCat.id;
        
        if (!isDirectMatch && !isChildMatch) return false;
      }
    }

    // 3. Subcategory Match
    if (catalogState.selectedSubcategory !== "All") {
      if (product.category !== catalogState.selectedSubcategory) return false;
    }

    // 4. Collection Match
    if (catalogState.selectedCollection !== "All" && product.collection !== catalogState.selectedCollection) {
      return false;
    }

    // 5. Price Limit Match
    if (product.price < catalogState.minPrice || product.price > catalogState.maxPrice) {
      return false;
    }

    // 6. Stitch Count Range Match
    if (product.totalStitchCount < catalogState.minStitchCount || product.totalStitchCount > catalogState.maxStitchCount) {
      return false;
    }

    // 7. Thread Colors Match
    if (catalogState.selectedColors !== "All") {
      const colorsNum = parseInt(catalogState.selectedColors);
      if (colorsNum === 7) {
        if (product.threadColors < 7) return false;
      } else {
        if (product.threadColors !== colorsNum) return false;
      }
    }

    // 8. Machine Brand Match
    if (catalogState.selectedBrand !== "All") {
      const hasBrand = product.formats.some(f => f.machineBrand.toLowerCase() === catalogState.selectedBrand.toLowerCase());
      if (!hasBrand) return false;
    }

    // 9. File Format Match
    if (catalogState.selectedFormat !== "All") {
      if (!product.machineFormats.includes(catalogState.selectedFormat)) return false;
    }

    // 10. Hoop Size Match
    if (catalogState.selectedHoop !== "All") {
      const hasHoop = product.formats.some(f => f.hoopSize.includes(catalogState.selectedHoop));
      if (!hasHoop) return false;
    }

    // 11. Difficulty Level Match
    if (catalogState.selectedDifficulty !== "All" && product.difficultyLevel !== catalogState.selectedDifficulty) {
      return false;
    }

    // 12. Featured & Best Seller
    if (catalogState.filterFeatured && !product.featured) return false;
    if (catalogState.filterBestSeller && !product.bestSeller) return false;

    return true;
  });

  // --- Sorting Engine ---
  if (catalogState.sortBy === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (catalogState.sortBy === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (catalogState.sortBy === "stitch-asc") {
    filtered.sort((a, b) => a.totalStitchCount - b.totalStitchCount);
  } else if (catalogState.sortBy === "stitch-desc") {
    filtered.sort((a, b) => b.totalStitchCount - a.totalStitchCount);
  } else if (catalogState.sortBy === "newest") {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Paginated Results
  const totalCount = filtered.length;
  const paginated = filtered.slice(0, catalogState.visibleLimit);

  // Bind trigger actions in main.js to update reactive filter parameters
  return `
    <section class="content-section catalog-section" style="background: var(--ivory); padding-top: calc(var(--header-height) + 12px);">
      
      <!-- Breadcrumbs -->
      <nav class="breadcrumbs" style="margin: 0 auto; max-width: 1540px; padding: 0 clamp(22px, 5vw, 78px); font-size: 12px; font-weight:600; color: var(--ink-soft); text-transform: uppercase; margin-bottom: 24px;">
        <a href="#/" style="color: inherit; text-decoration: none;">Home</a> &nbsp;&gt;&nbsp; <span style="color: var(--gold);">Design Library</span>
      </nav>

      <!-- Editorial Hero Header -->
      <div class="catalog-header-copy" style="max-width: 900px; margin: 0 auto 36px; text-align: center; padding: 0 24px;">
        <h1 style="font-family: var(--font-serif); font-size: clamp(38px, 5vw, 68px); color: var(--navy); line-height: 1.05; font-weight:700; margin-bottom: 12px;">
          Explore Luxury<br />Embroidery Designs
        </h1>
        <p style="color: var(--ink-soft); font-size: 15px; max-width: 600px; margin: 0 auto 28px;">
          Discover machine-ready embroidery collections crafted for designers, boutiques, and fashion brands.
        </p>

        <!-- Centered Search Bar -->
        <div class="catalog-search-field" style="max-width: 620px; margin: 0 auto;">
          ${icon("search", 20)}
          <input id="catalogSearchInput" value="${attr(catalogState.searchQuery)}" placeholder="Search by design code, pattern, category or embroidery style..." style="font-weight: 500; font-size: 14px;" />
          <i data-lucide="sparkles" style="position: absolute; right: 20px; color: var(--gold); cursor:pointer;"></i>
        </div>
      </div>

      <!-- Categories Navigation Bar (Pills) -->
      <div class="category-pills-row" style="max-width: 1540px; margin: 0 auto 28px; padding: 0 clamp(22px, 5vw, 78px); display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
        ${pillCategories
          .map(
            (c) => `
              <button type="button" class="filter-pill ${catalogState.selectedCategory === c ? "active" : ""}" data-action="filter-category" data-value="${attr(c)}" style="border-radius: 99px; font-weight:700; padding: 10px 22px;">
                ${escapeHtml(c === "All" ? "All Designs" : c)}
              </button>
            `
          )
          .join("")}
        
        <!-- More Filters Toggle Button -->
        <button type="button" class="filter-pill ${catalogState.moreFiltersOpen ? "active" : ""}" data-action="toggle-more-filters" style="border-radius: 99px; font-weight:700; padding: 10px 22px; display: inline-flex; align-items: center; gap: 8px;">
          ${icon("sliders-horizontal", 16)} More Filters
        </button>
      </div>

      <!-- Subcategories pills (if parent category is active) -->
      ${
        catalogState.selectedCategory !== "All" && subcategories.length > 1
          ? `<div class="subcategory-pills-row" style="max-width: 1540px; margin: -14px auto 28px; padding: 0 clamp(22px, 5vw, 78px); display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;">
              <span style="font-size:12px; font-weight:700; text-transform:uppercase; color: var(--gold); align-self:center; margin-right: 8px;">Subcategory:</span>
              ${subcategories
                .map(
                  (sub) => `
                    <button type="button" class="filter-pill ${catalogState.selectedSubcategory === sub ? "active" : ""}" data-action="filter-subcategory" data-value="${attr(sub)}" style="font-size:13px; padding: 6px 14px; border-radius: 99px; border-color: rgba(200, 161, 90, 0.28);">
                      ${escapeHtml(sub)}
                    </button>
                  `
                )
                .join("")}
            </div>`
          : ""
      }

      <!-- Detailed Filters Panel (Toggled on "More Filters" click) -->
      ${
        catalogState.moreFiltersOpen
          ? `<div class="more-filters-panel" style="max-width: 1540px; margin: 0 auto 36px; padding: 24px clamp(22px, 5vw, 78px); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.4); backdrop-filter: blur(10px); display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px;">
              
              <!-- 1. Collection Filter -->
              <div class="filter-group">
                <h3>Collections</h3>
                <select id="filterCollectionSelect" class="sort-select" style="width: 100%; border-radius:4px; padding: 10px;" data-action="filter-collection-select">
                  ${collections.map(col => `<option value="${attr(col)}" ${catalogState.selectedCollection === col ? "selected" : ""}>${escapeHtml(col === "All" ? "All Collections" : col.toUpperCase())}</option>`).join("")}
                </select>
              </div>

              <!-- 2. Price Range Filters -->
              <div class="filter-group">
                <h3>Price Limit</h3>
                <div style="display:flex; gap: 10px; align-items:center; margin-top: 8px;">
                  <input type="number" id="priceMinInput" value="${catalogState.minPrice}" style="width: 100%; padding: 8px; border:1px solid var(--border); border-radius:4px;" placeholder="Min" />
                  <span style="color:var(--gold);">&ndash;</span>
                  <input type="number" id="priceMaxInput" value="${catalogState.maxPrice}" style="width: 100%; padding: 8px; border:1px solid var(--border); border-radius:4px;" placeholder="Max" />
                </div>
              </div>

              <!-- 3. Stitches Range Filters -->
              <div class="filter-group">
                <h3>Stitch Count</h3>
                <div style="display:flex; gap: 10px; align-items:center; margin-top: 8px;">
                  <input type="number" id="stitchMinInput" value="${catalogState.minStitchCount}" style="width: 100%; padding: 8px; border:1px solid var(--border); border-radius:4px; font-size:12px;" placeholder="Min Stitches" />
                  <span style="color:var(--gold);">&ndash;</span>
                  <input type="number" id="stitchMaxInput" value="${catalogState.maxStitchCount}" style="width: 100%; padding: 8px; border:1px solid var(--border); border-radius:4px; font-size:12px;" placeholder="Max Stitches" />
                </div>
              </div>

              <!-- 4. Thread Colors Count -->
              <div class="filter-group">
                <h3>Thread Colors</h3>
                <select id="filterColorsSelect" class="sort-select" style="width: 100%; border-radius:4px; padding: 10px;" data-action="filter-colors-select">
                  <option value="All" ${catalogState.selectedColors === "All" ? "selected" : ""}>All Colors</option>
                  <option value="3" ${catalogState.selectedColors === "3" ? "selected" : ""}>3 Colors</option>
                  <option value="4" ${catalogState.selectedColors === "4" ? "selected" : ""}>4 Colors</option>
                  <option value="5" ${catalogState.selectedColors === "5" ? "selected" : ""}>5 Colors</option>
                  <option value="6" ${catalogState.selectedColors === "6" ? "selected" : ""}>6 Colors</option>
                  <option value="7" ${catalogState.selectedColors === "7" ? "selected" : ""}>7+ Colors</option>
                </select>
              </div>

              <!-- 5. Machine Formats -->
              <div class="filter-group">
                <h3>Machine Format</h3>
                <select id="filterFormatSelect" class="sort-select" style="width: 100%; border-radius:4px; padding: 10px;" data-action="filter-format-select">
                  <option value="All" ${catalogState.selectedFormat === "All" ? "selected" : ""}>All Formats</option>
                  <option value="DST" ${catalogState.selectedFormat === "DST" ? "selected" : ""}>DST</option>
                  <option value="EXP" ${catalogState.selectedFormat === "EXP" ? "selected" : ""}>EXP</option>
                  <option value="PES" ${catalogState.selectedFormat === "PES" ? "selected" : ""}>PES</option>
                  <option value="JEF" ${catalogState.selectedFormat === "JEF" ? "selected" : ""}>JEF</option>
                  <option value="XXX" ${catalogState.selectedFormat === "XXX" ? "selected" : ""}>XXX</option>
                </select>
              </div>

              <!-- 6. Machine Brands -->
              <div class="filter-group">
                <h3>Machine Brand</h3>
                <select id="filterBrandSelect" class="sort-select" style="width: 100%; border-radius:4px; padding: 10px;" data-action="filter-brand-select">
                  <option value="All" ${catalogState.selectedBrand === "All" ? "selected" : ""}>All Brands</option>
                  <option value="Tajima" ${catalogState.selectedBrand === "Tajima" ? "selected" : ""}>Tajima</option>
                  <option value="Brother" ${catalogState.selectedBrand === "Brother" ? "selected" : ""}>Brother</option>
                  <option value="Bernina" ${catalogState.selectedBrand === "Bernina" ? "selected" : ""}>Bernina</option>
                  <option value="Janome" ${catalogState.selectedBrand === "Janome" ? "selected" : ""}>Janome</option>
                  <option value="Singer" ${catalogState.selectedBrand === "Singer" ? "selected" : ""}>Singer</option>
                </select>
              </div>

              <!-- 7. Hoop Size -->
              <div class="filter-group">
                <h3>Hoop Size</h3>
                <select id="filterHoopSelect" class="sort-select" style="width: 100%; border-radius:4px; padding: 10px;" data-action="filter-hoop-select">
                  <option value="All" ${catalogState.selectedHoop === "All" ? "selected" : ""}>All Sizes</option>
                  <option value="100mm" ${catalogState.selectedHoop === "100mm" ? "selected" : ""}>100mm x 100mm</option>
                  <option value="200mm" ${catalogState.selectedHoop === "200mm" ? "selected" : ""}>200mm x 200mm</option>
                  <option value="300mm" ${catalogState.selectedHoop === "300mm" ? "selected" : ""}>300mm x 300mm</option>
                </select>
              </div>

              <!-- 8. Difficulty Level -->
              <div class="filter-group">
                <h3>Difficulty</h3>
                <select id="filterDifficultySelect" class="sort-select" style="width: 100%; border-radius:4px; padding: 10px;" data-action="filter-difficulty-select">
                  <option value="All" ${catalogState.selectedDifficulty === "All" ? "selected" : ""}>All Levels</option>
                  <option value="Beginner" ${catalogState.selectedDifficulty === "Beginner" ? "selected" : ""}>Beginner</option>
                  <option value="Intermediate" ${catalogState.selectedDifficulty === "Intermediate" ? "selected" : ""}>Intermediate</option>
                  <option value="Advanced" ${catalogState.selectedDifficulty === "Advanced" ? "selected" : ""}>Advanced</option>
                </select>
              </div>

              <!-- 9. Toggles (Featured & Best Sellers) -->
              <div class="filter-group" style="display:flex; flex-direction:column; gap:10px; justify-content:center;">
                <label style="display:inline-flex; align-items:center; gap:8px; font-weight:600; font-size:13px; color:var(--navy);">
                  <input type="checkbox" id="filterFeaturedCheck" ${catalogState.filterFeatured ? "checked" : ""} style="accent-color: var(--gold); width:16px; height:16px;" />
                  Featured Designs
                </label>
                <label style="display:inline-flex; align-items:center; gap:8px; font-weight:600; font-size:13px; color:var(--navy);">
                  <input type="checkbox" id="filterBestSellerCheck" ${catalogState.filterBestSeller ? "checked" : ""} style="accent-color: var(--gold); width:16px; height:16px;" />
                  Best Sellers
                </label>
              </div>

              <!-- 10. Filter Action Buttons -->
              <div class="filter-group" style="display:flex; align-items:center; gap:10px;">
                <button type="button" class="button button-primary" data-action="apply-more-filters" style="flex:1; min-height:40px; font-size:13px; padding:0;">
                  Apply Filters
                </button>
                <button type="button" class="button button-secondary" data-action="reset-catalog-filters" style="flex:1; min-height:40px; font-size:13px; padding:0;">
                  Clear All
                </button>
              </div>

            </div>`
          : ""
      }

      <!-- Dynamic Featured Collection Banner (Visual QA Match) -->
      ${
        catalogState.selectedCategory === "All" && !query
          ? `<div class="featured-banner-wrapper">
              <div class="trending-collection-banner">
                <div class="banner-veil"></div>
                
                <div class="banner-content">
                  <p class="section-kicker" style="font-size:12px; font-weight:700; color:var(--gold); margin-bottom:8px;">TRENDING COLLECTION</p>
                  <h2 style="font-family: var(--font-serif); font-size: clamp(32px, 4vw, 44px); color: var(--navy); line-height: 1.1; margin-bottom: 12px; font-weight:700;">
                    2026 Bridal Luxury Collection
                  </h2>
                  <p style="color: var(--ink-soft); font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
                    Intricate floral embroidery designed for couture bridal fashion.
                  </p>
                  <a href="#/catalog?collection=bridal" class="button button-primary" style="display:inline-flex; text-decoration:none; padding: 12px 28px; min-height:48px;">
                    <span>Explore Collection</span>
                    ${icon("arrow-right", 16)}
                  </a>
                </div>
              </div>
            </div>`
          : ""
      }

      <!-- Main Layout: Grid and Counter -->
      <div style="max-width: 1540px; margin: 0 auto; padding: 0 clamp(22px, 5vw, 78px);">
        
        <!-- Controls & Sorters Bar -->
        <div class="catalog-controls" style="margin-bottom: 24px;">
          <span class="results-count" style="font-size:15px;">Showing ${totalCount} Designs</span>
          
          <div class="catalog-actions">
            <select class="sort-select" data-action="sort-catalog" aria-label="Sort designs" style="border-radius:4px; font-size: 13px; padding: 8px 16px;">
              <option value="default" ${catalogState.sortBy === "default" ? "selected" : ""}>Sort by: Newest First</option>
              <option value="price-asc" ${catalogState.sortBy === "price-asc" ? "selected" : ""}>Price: Low to High</option>
              <option value="price-desc" ${catalogState.sortBy === "price-desc" ? "selected" : ""}>Price: High to Low</option>
              <option value="stitch-asc" ${catalogState.sortBy === "stitch-asc" ? "selected" : ""}>Stitches: Low to High</option>
              <option value="stitch-desc" ${catalogState.sortBy === "stitch-desc" ? "selected" : ""}>Stitches: High to Low</option>
              <option value="newest" ${catalogState.sortBy === "newest" ? "selected" : ""}>Newest Arrivals</option>
            </select>
            
            <!-- Grid / List Icons -->
            <div style="display:flex; border: 1px solid var(--border); border-radius: 4px; overflow:hidden; flex-shrink: 0;">
              <button type="button" class="icon-button" style="width:34px; height:34px; border:none; border-radius:0; background:rgba(255,255,255,0.8); color: var(--navy);">
                ${icon("layout-grid", 16)}
              </button>
              <button type="button" class="icon-button" style="width:34px; height:34px; border:none; border-radius:0; background:transparent; color: var(--ink-soft);">
                ${icon("list", 16)}
              </button>
            </div>
          </div>
        </div>

        <!-- Product Cards Grid -->
        ${
          paginated.length > 0
            ? `<div class="product-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px;">
                ${paginated
                  .map(
                    (product, index) => {
                      const isSaved = wishlist.has(product.id);
                      return `
                        <article class="product-card reveal is-visible" style="--delay:${index * 40}ms; border-radius: 8px; border: 1px solid var(--border); background:#fff; overflow:hidden; box-shadow: var(--shadow); transition: all 360ms ease;">
                          <div class="product-media" style="position:relative; aspect-ratio: 1 / 1; background: #faf8f5; overflow:hidden; display:grid; place-items:center;">
                            <a href="#/product/${product.slug}" style="display:block; width:100%; height:100%;">
                              <img src="${attr(mediaUrl(product.image))}" alt="${attr(product.title)}" loading="lazy" style="width:100%; height:100%; object-fit:cover; transition: transform 600ms ease;" />
                            </a>
                            
                            <!-- New badge — subtle gold pill at bottom of image -->
                            ${product.bestSeller ? `
                              <span style="position:absolute; bottom:10px; left:12px; z-index:2; display:inline-flex; align-items:center; gap:5px; background:rgba(255,255,255,0.88); backdrop-filter:blur(8px); border:1px solid rgba(200,161,90,0.4); border-radius:99px; padding:4px 10px 4px 7px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--navy);">
                                <span style="width:6px; height:6px; border-radius:50%; background:var(--gold); flex-shrink:0;"></span>
                                New
                              </span>
                            ` : ""}
                            
                            <!-- Wishlist Toggle -->
                            <button type="button" class="heart-button ${isSaved ? "active" : ""}" data-action="toggle-wishlist" data-id="${attr(product.id)}" aria-label="Save ${attr(product.title)}" style="position:absolute; top:12px; right:12px; z-index:2; width:34px; height:34px; border-radius:50%; border:1px solid rgba(230,222,209,0.5); background:rgba(255,255,255,0.85); display:grid; place-items:center; color: var(--navy); cursor:pointer;">
                              ${icon("heart", 16)}
                            </button>

                            <!-- Hover Overlay Quick View Trigger -->
                            <button type="button" class="quick-view-overlay-btn" data-action="quick-view" data-id="${attr(product.id)}">
                              Quick View
                            </button>
                          </div>
                          
                          <div class="product-info" style="padding: 14px 16px 16px;">

                            <!-- Code tag + Title -->
                            <a href="#/product/${product.slug}" style="text-decoration:none; color:inherit; display:block; margin-bottom: 12px;">
                              <div style="display:flex; align-items:center; gap:6px; margin-bottom:5px;">
                                <span style="font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:var(--gold); background:rgba(200,161,90,0.1); border:1px solid rgba(200,161,90,0.25); border-radius:4px; padding:2px 6px; flex-shrink:0;">${escapeHtml(product.code)}</span>
                              </div>
                              <h3 style="font-family:var(--font-serif); font-size:16px; font-weight:700; margin:0; color:var(--navy); line-height:1.35; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:43px;">${escapeHtml(product.title)}</h3>
                            </a>

                            <!-- Specs row -->
                            <div style="display:flex; flex-direction:column; gap:4px; padding-top:10px; border-top:1px solid rgba(230,222,209,0.7); margin-bottom:12px;">
                              <div style="display:flex; align-items:center; gap:6px;">
                                ${icon("activity", 11)}
                                <span style="font-size:11px; font-weight:600; color:rgba(17,29,66,0.55); letter-spacing:0.02em;">${product.totalStitchCount.toLocaleString()} stitches</span>
                              </div>
                              <div style="display:flex; align-items:center; gap:6px; min-width:0;">
                                ${icon("cpu", 11)}
                                <span style="font-size:11px; font-weight:600; color:rgba(17,29,66,0.55); letter-spacing:0.02em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                                  ${(() => {
                                    const brands = product.formats.map(f => f.machineBrand).filter((v,i,a) => a.indexOf(v)===i);
                                    return brands.length > 2
                                      ? `${escapeHtml(brands.slice(0,2).join(" · "))} <span style="color:var(--gold);">+${brands.length-2}</span>`
                                      : escapeHtml(brands.join(" · "));
                                  })()}
                                </span>
                              </div>
                            </div>

                            <!-- Bottom: category + quick view -->
                            <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
                              <span style="font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:rgba(17,29,66,0.38); border:1px solid rgba(17,29,66,0.12); border-radius:99px; padding:3px 9px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:55%;">${escapeHtml(product.category)}</span>
                              <button type="button" class="quick-view-text-btn" data-action="quick-view" data-id="${attr(product.id)}" style="border:none; background:transparent; font-size:11px; font-weight:700; color:var(--navy); letter-spacing:0.04em; cursor:pointer; white-space:nowrap; flex-shrink:0; padding:0; text-transform:uppercase; opacity:0.65; transition:opacity 180ms;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.65'">
                                View →
                              </button>
                            </div>

                          </div>

                        </article>
                      `;
                     })
                     .join("")}
              </div>`

            : `<div class="empty-state" style="padding: 80px 20px; border: 1px dashed var(--border); border-radius: 8px; text-align: center;">
                ${icon("search-slash", 40)}
                <h3 style="font-family: var(--font-serif); font-size: 24px; margin-top: 16px; color: var(--navy);">No matching designs found</h3>
                <p style="color: var(--ink-soft); margin-top: 8px;">Try clearing search keywords or resetting active filter pills.</p>
                <button type="button" class="button button-primary" data-action="reset-catalog-filters" style="margin-top: 20px;">Clear Filters</button>
              </div>`
        }

        <!-- Load More Pagination Button -->
        ${
          totalCount > catalogState.visibleLimit
            ? `<div style="display:flex; justify-content:center; margin: 48px 0 24px;">
                <button type="button" class="button button-secondary" data-action="load-more-designs" style="min-height: 48px; border-radius: 99px; padding: 0 40px; border-color: var(--border); font-size: 13px; font-weight:700; display: inline-flex; align-items:center; gap:8px;">
                  ${icon("refresh-cw", 16)} Load More Designs
                </button>
              </div>`
            : ""
        }

      </div>

      <!-- Trust Badges row (Direct QA Match) -->
      <div class="trust-badges-wrapper">
        <div class="trust-badges-grid">
          <div class="trust-badge-card">
            ${icon("gem", 28)}
            <h3>10,000+</h3>
            <p>Embroidery Designs<br />Premium & Exclusive</p>
          </div>
          <div class="trust-badge-card">
            ${icon("crown", 28)}
            <h3>2,500+</h3>
            <p>Fashion Brands<br />Worldwide Trust</p>
          </div>
          <div class="trust-badge-card">
            ${icon("star", 28)}
            <h3>98%</h3>
            <p>Client Satisfaction<br />Quality You Can Trust</p>
          </div>
          <div class="trust-badge-card">
            ${icon("clock", 28)}
            <h3>24 Hours</h3>
            <p>Quote Delivery<br />Fast & Reliable</p>
          </div>
        </div>
      </div>

    </section>
  `;
}
export function loadMoreDesigns() {
  catalogState.visibleLimit += 8;
}
