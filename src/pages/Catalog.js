import { site, wishlist, getCategories, ui, isVisible, isProductUnlocked, downloadMachineFile } from "../services/store.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

export const SHEET2_CATEGORIES = [
  { id: "All", label: "All Designs" },
  { id: "new-arrivals", label: "New Arrivals" },
  { id: "beads", label: "Beads Design" },
  { id: "bridal", label: "Bridal" },
  { id: "blouses", label: "Blouse Designs" },
  { id: "saree", label: "Saree Borders" },
  { id: "kids", label: "Kids Wear" },
  { id: "cutwork", label: "Cutwork" },
  { id: "zari", label: "Zari Work" }
];

export const PATTERN_TAGS = [
  "Boat Neck",
  "Cross Stitch",
  "Cut Work",
  "Dress",
  "Figure",
  "Flowers",
  "God",
  "Instruments",
  "Kids",
  "Kutch Work",
  "Mango",
  "Marriage / Baby Showers",
  "Mirror Work",
  "Net Designs",
  "One Side",
  "Saree Pallu",
  "Peacock",
  "Photo Embroidery",
  "Pot Neck",
  "Simple",
  "Square Neck",
  "Unique Neck",
  "V Neck",
  "Painting",
  "DTF Designs"
];

// Page level reactive state
export const catalogState = {
  searchQuery: "",
  selectedCategory: "All",
  selectedSubcategory: "All",
  selectedCollection: "All",
  selectedTag: "All",
  sortBy: "default",
  minPrice: 0,
  maxPrice: 100,
  minStitchCount: 0,
  maxStitchCount: 100000,
  selectedHoop: "All",
  selectedDifficulty: "All",
  selectedBrand: "All",
  selectedFormat: "All",
  selectedColors: "All",
  filterFeatured: false,
  filterBestSeller: false,
  moreFiltersOpen: false,
  visibleLimit: 8 // for Load More pagination
};

let lastCategoryParam = null;
let lastCollectionParam = null;
let lastSearchParam = null;

// Controlled State Update Path: Decoupled filter state validator.
// Prevents deleted or hidden items from locking the user in a broken filter state.
export function sanitizeCatalogState(cats, dbCollections) {
  if (catalogState.selectedCategory !== "All") {
    const activeCatObj = cats.find(c => c.slug === catalogState.selectedCategory && !c.parentCategoryId);
    if (!activeCatObj || !isVisible(activeCatObj)) {
      console.warn(`Catalog State Sanitizer: Selected category "${catalogState.selectedCategory}" is no longer available. Resetting filters.`);
      catalogState.selectedCategory = "All";
      catalogState.selectedSubcategory = "All";
    }
  }

  if (catalogState.selectedSubcategory !== "All") {
    const activeSubObj = cats.find(c => c.slug === catalogState.selectedSubcategory && c.parentCategoryId);
    const parentCatObj = cats.find(c => c.slug === catalogState.selectedCategory && !c.parentCategoryId);
    if (!activeSubObj || !isVisible(activeSubObj) || !parentCatObj || activeSubObj.parentCategoryId !== parentCatObj.id) {
      console.warn(`Catalog State Sanitizer: Selected subcategory "${catalogState.selectedSubcategory}" is invalid or does not belong to parent. Resetting subcategory.`);
      catalogState.selectedSubcategory = "All";
    }
  }

  if (catalogState.selectedCollection !== "All") {
    const activeColObj = dbCollections.find(c => c.slug === catalogState.selectedCollection);
    if (!activeColObj) {
      console.warn(`Catalog State Sanitizer: Selected collection "${catalogState.selectedCollection}" is no longer available. Resetting collection.`);
      catalogState.selectedCollection = "All";
    }
  }
}

export function renderCatalog() {
  const cats = getCategories() || [];
  const query = (catalogState.searchQuery || "").toLowerCase().trim();
  const dbCollections = site.collections || [];

  // --- Router Parameters Synchronizer ---
  // If the router set category/collection/search parameters in store, apply it
  const routeParams = window.location.hash.split("?")[1] || "";
  const categoryParam = ui.pageParams.category || new URLSearchParams(routeParams).get("category") || null;
  const collectionParam = ui.pageParams.collection || new URLSearchParams(routeParams).get("collection") || null;
  const searchParam = ui.pageParams.search || new URLSearchParams(routeParams).get("search") || null;

  if (searchParam !== lastSearchParam) {
    lastSearchParam = searchParam;
    catalogState.searchQuery = searchParam || "";
  }

  if (categoryParam !== lastCategoryParam) {
    lastCategoryParam = categoryParam;
    if (categoryParam) {
      const cat = cats.find(c => c.slug === categoryParam && isVisible(c));
      if (cat) {
        if (!cat.parentCategoryId) {
          catalogState.selectedCategory = cat.slug; // Store stable slug
          catalogState.selectedSubcategory = "All";
        } else {
          const parent = cats.find(p => p.id === cat.parentCategoryId && isVisible(p));
          catalogState.selectedCategory = parent ? parent.slug : "All";
          catalogState.selectedSubcategory = cat.slug;
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
      const matchedCol = dbCollections.find(c => c.slug === collectionParam);
      catalogState.selectedCollection = matchedCol ? matchedCol.slug : "All";
    } else {
      catalogState.selectedCollection = "All";
    }
  }

  // --- Dynamic Category / Subcategory lists ---
  // Get all visible parent categories for top navigation pills
  const parentCats = cats
    .filter(c => !c.parentCategoryId && isVisible(c))
    .sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1) || a.name.localeCompare(b.name));
  const pillCategories = ["All", ...parentCats];
  
  // Find parent of selected category (if it is a subcategory) or the selected category itself (if it is a parent)
  let activeParent = null;
  if (catalogState.selectedCategory !== "All") {
    activeParent = cats.find(c => c.slug === catalogState.selectedCategory && !c.parentCategoryId);
  }

  // Find subcategories of the active parent
  let subcategories = ["All"];
  if (activeParent) {
    const childCats = cats
      .filter(c => c.parentCategoryId === activeParent.id && isVisible(c))
      .sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1) || a.name.localeCompare(b.name));
    subcategories = ["All", ...childCats];
  }


  // --- Filters Application ---
  let filtered = site.products.filter((product) => {
    // 1. Search Query Match
    if (query) {
      const matchText = `${product.title} ${product.code} ${product.category} ${product.collection} ${product.stitchType} ${(product.tags || []).join(" ")}`.toLowerCase();
      if (!matchText.includes(query)) return false;
    }

    // Pattern Tag Match (from Sheet 2)
    if (catalogState.selectedTag && catalogState.selectedTag !== "All") {
      const tagLower = catalogState.selectedTag.toLowerCase();
      const productTags = (product.tags || []).map(t => t.toLowerCase());
      const textCorpus = `${product.title || ""} ${product.description || ""} ${product.category || ""} ${product.collection || ""}`.toLowerCase();
      const matchesTag = productTags.some(t => t.includes(tagLower) || tagLower.includes(t)) || textCorpus.includes(tagLower);
      if (!matchesTag) return false;
    }

    // 2. Parent Category Match (Sheet 2 categories + database dynamic categories)
    if (catalogState.selectedCategory !== "All") {
      const selCat = catalogState.selectedCategory.toLowerCase();
      if (selCat === "new-arrivals") {
        if (!product.bestSeller && !product.featured) return false;
      } else if (selCat === "beads") {
        const text = `${product.title} ${product.description} ${(product.tags || []).join(" ")}`.toLowerCase();
        if (!text.includes("bead")) return false;
      } else if (selCat === "cutwork") {
        const text = `${product.title} ${product.description} ${(product.tags || []).join(" ")}`.toLowerCase();
        if (!text.includes("cutwork") && !text.includes("cut work")) return false;
      } else if (selCat === "zari") {
        const text = `${product.title} ${product.description} ${(product.tags || []).join(" ")}`.toLowerCase();
        if (!text.includes("zari") && !text.includes("gold")) return false;
      } else if (selCat === "bridal") {
        const text = `${product.title} ${product.category} ${product.collection} ${(product.tags || []).join(" ")}`.toLowerCase();
        if (!text.includes("bridal") && !text.includes("wedding")) return false;
      } else if (selCat === "blouses") {
        const text = `${product.title} ${product.category} ${product.collection} ${(product.tags || []).join(" ")}`.toLowerCase();
        if (!text.includes("blouse")) return false;
      } else if (selCat === "saree") {
        const text = `${product.title} ${product.category} ${product.collection} ${(product.tags || []).join(" ")}`.toLowerCase();
        if (!text.includes("saree") && !text.includes("border")) return false;
      } else if (selCat === "kids") {
        const text = `${product.title} ${product.category} ${product.collection} ${(product.tags || []).join(" ")}`.toLowerCase();
        if (!text.includes("kid")) return false;
      } else {
        const parentCat = cats.find(c => c.slug === catalogState.selectedCategory && !c.parentCategoryId);
        if (parentCat) {
          const childCatIds = cats.filter(c => c.parentCategoryId === parentCat.id).map(c => c.id);
          const isChild = childCatIds.includes(product.categoryId) || product.categoryId === parentCat.id;
          if (!isChild) return false;
        }
      }
    }

    // 3. Subcategory Match (Strict UUID check)
    if (catalogState.selectedSubcategory !== "All") {
      const subCat = cats.find(c => c.slug === catalogState.selectedSubcategory && c.parentCategoryId);
      if (!subCat || product.categoryId !== subCat.id) return false;
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

      <!-- Editorial Hero Header & Search Bar -->
      <div class="catalog-header-copy" style="max-width: 900px; margin: 0 auto 28px; text-align: center; padding: 0 24px;">
        <h1 style="font-family: var(--font-serif); font-size: clamp(34px, 5vw, 60px); color: var(--navy); line-height: 1.05; font-weight:700; margin-bottom: 10px;">
          Embroidery Design Library
        </h1>
        <p style="color: var(--ink-soft); font-size: 14.5px; max-width: 600px; margin: 0 auto 24px;">
          Browse machine-ready embroidery stitch files (.DST, .PES, .JEF, .EXP) tested for commercial machines.
        </p>

        <!-- Sticky / Prominent Search Bar (Sheet 2) -->
        <div class="catalog-search-field" style="max-width: 650px; margin: 0 auto; position: relative;">
          ${icon("search", 20)}
          <input id="catalogSearchInput" value="${attr(catalogState.searchQuery)}" placeholder="🔍 Search by design code, pattern, catalog..." style="font-weight: 500; font-size: 14.5px; padding-right: 40px;" />
          <i data-lucide="sparkles" style="position: absolute; right: 20px; color: var(--gold); cursor:pointer;"></i>
        </div>
      </div>

      <!-- Categories Navigation Bar (Sheet 2 Pills) -->
      <div class="category-pills-row" style="max-width: 1540px; margin: 0 auto 16px; padding: 0 clamp(16px, 4vw, 40px); display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;">
        ${SHEET2_CATEGORIES
          .map(
            (c) => {
              const value = c.id;
              const label = c.label;
              const isActive = catalogState.selectedCategory.toLowerCase() === value.toLowerCase();
              return `
                <button type="button" class="filter-pill ${isActive ? "active" : ""}" data-action="filter-category" data-value="${attr(value)}" style="border-radius: 99px; font-weight:700; padding: 8px 18px; font-size: 13px;">
                  ${escapeHtml(label)}
                </button>
              `;
            }
          )
          .join("")}
        
        <!-- More Filters Toggle Button -->
        <button type="button" class="filter-pill ${catalogState.moreFiltersOpen ? "active" : ""}" data-action="toggle-more-filters" style="border-radius: 99px; font-weight:700; padding: 8px 18px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
          ${icon("sliders-horizontal", 15)} More Filters
        </button>
      </div>

      <!-- Extended Pattern Tags Cloud (Sheet 2) -->
      <div class="pattern-tags-cloud-wrap" style="max-width: 1540px; margin: 0 auto 24px; padding: 0 clamp(16px, 4vw, 40px);">
        <div style="display: flex; gap: 6px; overflow-x: auto; padding: 6px 0; scrollbar-width: none; -webkit-overflow-scrolling: touch; align-items: center;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--gold); letter-spacing: 0.08em; flex-shrink: 0; padding-right: 4px;">Patterns:</span>
          ${catalogState.selectedTag !== "All" ? `
            <button type="button" class="tag-pill active" data-action="filter-tag" data-value="All" style="flex-shrink: 0; font-size: 11.5px; font-weight: 700; padding: 4px 12px; border-radius: 99px; border: 1px solid var(--gold); background: var(--navy); color: #fff; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
              <span>Tag: ${escapeHtml(catalogState.selectedTag)}</span>
              ${icon("x", 12)}
            </button>
          ` : ""}
          ${PATTERN_TAGS.map(tag => {
            const isActive = catalogState.selectedTag === tag;
            return `
              <button type="button" class="tag-pill ${isActive ? "active" : ""}" data-action="filter-tag" data-value="${attr(tag)}" style="flex-shrink: 0; font-size: 11.5px; font-weight: 600; padding: 4px 12px; border-radius: 99px; border: 1px solid ${isActive ? 'var(--gold)' : 'rgba(200, 161, 90, 0.28)'}; background: ${isActive ? 'var(--navy)' : '#fff'}; color: ${isActive ? '#fff' : 'var(--navy)'}; cursor: pointer; white-space: nowrap; transition: all 0.2s ease;">
                ${escapeHtml(tag)}
              </button>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Subcategories pills (if parent category is active) -->
      ${
        catalogState.selectedCategory !== "All" && subcategories.length > 1
          ? `<div class="subcategory-pills-row" style="max-width: 1540px; margin: -14px auto 28px; padding: 0 clamp(22px, 5vw, 78px); display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;">
              <span style="font-size:12px; font-weight:700; text-transform:uppercase; color: var(--gold); align-self:center; margin-right: 8px;">Subcategory:</span>
              ${subcategories
                .map(
                  (sub) => {
                    const isAll = sub === "All";
                    const value = isAll ? "All" : sub.slug;
                    const label = isAll ? "All" : sub.name;
                    const isActive = catalogState.selectedSubcategory === value;
                    return `
                      <button type="button" class="filter-pill ${isActive ? "active" : ""}" data-action="filter-subcategory" data-value="${attr(value)}" style="font-size:13px; padding: 6px 14px; border-radius: 99px; border-color: rgba(200, 161, 90, 0.28);">
                        ${escapeHtml(label)}
                      </button>
                    `;
                  }
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
                  <option value="All" ${catalogState.selectedCollection === "All" ? "selected" : ""}>All Collections</option>
                  ${dbCollections.map(col => `<option value="${attr(col.slug)}" ${catalogState.selectedCollection === col.slug ? "selected" : ""}>${escapeHtml(col.title)}</option>`).join("")}
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
                    <span>Explore Bridal Embroidery Collection</span>
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

        <!-- Product Cards Grid (Zedge / Pinterest 2-col mobile style) -->
        ${
          paginated.length > 0
            ? `<div class="product-grid catalog-grid-zedge" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;">
                ${paginated
                  .map(
                    (product, index) => {
                      const isSaved = wishlist.has(product.id);
                      const defaultFormat = (product.formats && product.formats[0]) ? product.formats[0].format : "DST";
                      const isUnlocked = isProductUnlocked(product.id);
                      const productCardHtml = `
                        <article class="product-card reveal is-visible" style="--delay:${index * 40}ms; border-radius: 10px; border: 1px solid var(--border); background:#fff; overflow:hidden; box-shadow: var(--shadow); transition: all 360ms ease;">
                          <div class="product-media" style="position:relative; aspect-ratio: 1 / 1; background: #faf8f5; overflow:hidden; display:grid; place-items:center;">
                            <a href="#/product/${product.slug}" style="display:block; width:100%; height:100%; -webkit-touch-callout: none;">
                              <img src="${attr(mediaUrl(product.image))}" alt="${attr(product.title)}" loading="lazy" class="image-shield" style="width:100%; height:100%; object-fit:cover; pointer-events:none; -webkit-user-select:none; user-select:none; transition: transform 600ms ease;" oncontextmenu="return false;" />
                            </a>
                            
                            <!-- Entitlement badge / New badge -->
                            ${isUnlocked ? `
                              <span style="position:absolute; bottom:10px; left:10px; z-index:2; display:inline-flex; align-items:center; gap:5px; background:rgba(255,255,255,0.96); backdrop-filter:blur(8px); border:1px solid #b7eb8f; border-radius:99px; padding:3px 8px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#389e0d;">
                                <span style="color:#52c41a;">✓</span>
                                Unlocked
                              </span>
                            ` : product.bestSeller ? `
                              <span style="position:absolute; bottom:10px; left:10px; z-index:2; display:inline-flex; align-items:center; gap:5px; background:rgba(255,255,255,0.92); backdrop-filter:blur(8px); border:1px solid rgba(200,161,90,0.4); border-radius:99px; padding:3px 8px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--navy);">
                                <span style="width:6px; height:6px; border-radius:50%; background:var(--gold); flex-shrink:0;"></span>
                                New
                              </span>
                            ` : `
                              <span style="position:absolute; bottom:10px; left:10px; z-index:2; display:inline-flex; align-items:center; gap:4px; background:rgba(17,29,66,0.75); backdrop-filter:blur(8px); border-radius:99px; padding:3px 8px; font-size:9.5px; font-weight:700; color:#fff;">
                                ${icon("lock", 10)} Protected
                              </span>
                            `}
                            
                            <!-- Wishlist Toggle -->
                            <button type="button" class="heart-button ${isSaved ? "active" : ""}" data-action="toggle-wishlist" data-id="${attr(product.id)}" aria-label="Save ${attr(product.title)}" style="position:absolute; top:10px; right:10px; z-index:2; width:34px; height:34px; border-radius:50%; border:1px solid rgba(230,222,209,0.6); background:rgba(255,255,255,0.9); display:grid; place-items:center; color: var(--navy); cursor:pointer;">
                              ${icon("heart", 16)}
                            </button>

                             <!-- Hover Overlay Quick View Trigger -->
                             <button type="button" class="quick-view-overlay-btn" data-action="quick-view" data-id="${attr(product.id)}">
                               Quick View
                             </button>

                             <!-- Watermark Overlay (Anti-theft asset stamp) -->
                             <div class="watermark-overlay">
                               <img src="/logo.jpeg" class="watermark-logo" alt="logo" />
                               <span class="watermark-text">GD • ${escapeHtml(product.code)}</span>
                             </div>
                           </div>
                          
                          <div class="product-info" style="padding: 12px 14px 14px;">

                            <!-- Code tag + Price -->
                            <a href="#/product/${product.slug}" style="text-decoration:none; color:inherit; display:block; margin-bottom: 6px;">
                              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; gap:6px;">
                                <span style="font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--gold); background:rgba(200,161,90,0.1); border:1px solid rgba(200,161,90,0.25); border-radius:4px; padding:2px 6px; flex-shrink:0;">${escapeHtml(product.code)}</span>
                                <span style="font-size:15px; font-weight:800; color:var(--gold); white-space:nowrap;">${money(product.price)}</span>
                              </div>
                              <h3 style="font-family:var(--font-serif); font-size:15.5px; font-weight:700; margin:0; color:var(--navy); line-height:1.3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(product.title)}</h3>
                            </a>

                            <!-- Specs row -->
                            <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; color:var(--ink-soft); margin-bottom:8px; padding-bottom:6px; border-bottom:1px dashed var(--border);">
                              <span>${product.totalStitchCount ? product.totalStitchCount.toLocaleString() : "30,000"} stitches</span>
                              <span>${escapeHtml(product.dimensions || "200x200mm")}</span>
                            </div>

                            <!-- Available Formats badges row -->
                            <div style="display:flex; flex-wrap:wrap; gap:3px; margin-bottom:10px;">
                              ${(product.machineFormats || ["DST", "PES", "JEF"]).map(f => `
                                <span style="font-size:9px; font-weight:700; color:var(--navy); background:#fcfbfa; border:1px solid rgba(200, 161, 90, 0.25); border-radius:4px; padding:1px 5px;">${escapeHtml(f)}</span>
                              `).join("")}
                            </div>

                            <!-- Action buttons: Samsung Lock & Amazon-Style Buy Now -->
                            <div style="display:flex; gap:6px; margin-top:8px;">
                              ${isUnlocked ? `
                                <button type="button" class="button button-primary" data-action="download-machine-file" data-id="${attr(product.id)}" data-format="${attr(defaultFormat)}" style="flex:1; font-size:11px; height:34px; padding:0; display:flex; justify-content:center; align-items:center; gap:5px; font-weight:700; border-radius:6px; border:none; cursor:pointer; background:#237804; color:#fff;">
                                  ${icon("download", 13)} Download .${escapeHtml(defaultFormat)}
                                </button>
                                <a href="#/product/${product.slug}" class="button button-secondary" style="flex:0.6; font-size:11px; height:34px; padding:0; display:flex; justify-content:center; align-items:center; text-decoration:none; font-weight:700; border-radius:6px;">
                                  View
                                </a>
                              ` : `
                                <button type="button" class="button button-secondary" data-action="add-cart" data-id="${attr(product.id)}" data-format="${attr(defaultFormat)}" style="flex:1; font-size:11px; height:34px; padding:0; display:flex; justify-content:center; align-items:center; gap:5px; font-weight:700; border-radius:6px; cursor:pointer;">
                                  ${icon("shopping-bag", 13)} Cart
                                </button>
                                <button type="button" class="button button-primary" data-action="buy-now" data-id="${attr(product.id)}" data-format="${attr(defaultFormat)}" data-price="${attr(product.price)}" data-title="${attr(product.title)}" data-code="${attr(product.code)}" style="flex:1.3; font-size:11px; height:34px; padding:0; display:flex; justify-content:center; align-items:center; gap:5px; font-weight:700; border-radius:6px; border:none; cursor:pointer; background:var(--navy); color:#fff;">
                                  ${icon("zap", 13)} Buy Now
                                </button>
                              `}
                            </div>

                          </div>
                        </article>
                      `;

                      // Inject In-Feed Sponsored Monetization Card after the 4th item
                      const sponsoredAdHtml = (index === 3) ? `
                        <article class="sponsored-card reveal is-visible" style="border-radius:10px; border:1.5px dashed var(--gold); background:linear-gradient(135deg, rgba(200,161,90,0.09) 0%, rgba(17,29,66,0.04) 100%); padding:18px; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden;">
                          <div style="position:absolute; top:10px; right:10px; font-size:8px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--gold); background:#fff; border:1px solid rgba(200,161,90,0.3); border-radius:4px; padding:2px 6px;">Sponsored</div>
                          <div>
                            <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--gold); letter-spacing:0.1em; display:block; margin-bottom:4px;">Custom Studio</span>
                            <h3 style="font-family:var(--font-serif); font-size:17px; font-weight:700; color:var(--navy); margin:0 0 6px;">Looking for Custom Digitizing?</h3>
                            <p style="font-size:11.5px; line-height:1.45; color:var(--ink-soft); margin:0 0 14px;">Upload your own blouse sketch, wedding logo, or photo. Get high-precision machine files delivered in 24 hours.</p>
                          </div>
                          <a href="https://wa.me/918309897055?text=Hello%20Godavari%20Designers%2C%20I%20need%20a%20custom%20embroidery%20digitizing%20quote." target="_blank" rel="noopener noreferrer" class="button" style="background:#25D366; color:#fff; font-size:11.5px; font-weight:700; height:34px; border-radius:6px; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:6px; border:none;">
                            ${icon("message-circle", 14)} Send Sketch on WA
                          </a>
                        </article>
                      ` : "";

                      return productCardHtml + sponsoredAdHtml;
                    }
                  )
                  .join("")}
              </div>`

            : `<div class="empty-state" style="padding: 80px 20px; border: 1px dashed var(--border); border-radius: 8px; text-align: center;">
                ${icon("search-slash", 40)}
                <h3 style="font-family: var(--font-serif); font-size: 24px; margin-top: 16px; color: var(--navy);">No matching designs found</h3>
                <p style="color: var(--ink-soft); margin-top: 8px;">Try clearing search keywords or resetting active filter pills.</p>
                <button type="button" class="button button-primary" data-action="reset-catalog-filters" style="margin-top: 20px;">Clear Filters</button>
              </div>`
        }

        <!-- Infinite Scroll Sentinel -->
        <div id="catalog-sentinel" data-total-count="${totalCount}" data-limit="${catalogState.visibleLimit}" style="display: ${totalCount > catalogState.visibleLimit ? 'flex' : 'none'}; justify-content: center; align-items: center; padding: 48px 0 24px; min-height: 60px;">
          <div class="infinite-loader" style="display: flex; gap: 6px; align-items: center;">
            <span style="width: 8px; height: 8px; background-color: var(--navy); border-radius: 50%; display: inline-block; opacity: 0.3; animation: infinite-pulse 1.4s ease-in-out infinite;"></span>
            <span style="width: 8px; height: 8px; background-color: var(--navy); border-radius: 50%; display: inline-block; opacity: 0.3; animation: infinite-pulse 1.4s ease-in-out infinite; animation-delay: 0.2s;"></span>
            <span style="width: 8px; height: 8px; background-color: var(--navy); border-radius: 50%; display: inline-block; opacity: 0.3; animation: infinite-pulse 1.4s ease-in-out infinite; animation-delay: 0.4s;"></span>
          </div>
        </div>

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
