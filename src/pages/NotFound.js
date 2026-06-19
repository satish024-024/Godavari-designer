import { site, getCategories, showToast } from "../services/store.js";
import { escapeHtml, icon } from "../utils/helpers.js";

export function renderNotFound() {
  const cats = getCategories();
  
  // Read featured categories dynamically from database/store
  const featuredCategories = cats
    .filter(c => c.featured)
    .slice(0, 5); // display up to 5 featured categories

  // Fallback to top-level parent categories if no featured categories exist
  const categoriesToShow = featuredCategories.length > 0 
    ? featuredCategories 
    : cats.filter(c => !c.parentCategoryId).slice(0, 5);

  const categoryLinksHtml = categoriesToShow.map(cat => `
    <a href="#/catalog?category=${cat.slug}" class="not-found-link" style="
      text-decoration: none; 
      color: var(--navy); 
      font-size: 13px; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: 0.05em;
      padding: 8px 16px;
      border: 1.5px solid var(--border);
      border-radius: 99px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      background: #ffffff;
    ">
      ${escapeHtml(cat.name)}
    </a>
  `).join("");

  const whatsappNumber = site.brand.contact.phone.replace(/[^0-9]/g, "");
  const whatsappMsg = encodeURIComponent("Hello Godavari Designer support, I'm on the 404 page and need assistance with a design link.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

  // CSS and Page layout
  return `
    <style>
      .not-found-svg-container {
        position: relative;
        width: 140px;
        height: 140px;
        margin: 0 auto 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .animated-thread {
        stroke-dashoffset: 0;
        animation: threadFlow 6s linear infinite;
      }

      @keyframes threadFlow {
        to {
          stroke-dashoffset: -100;
        }
      }

      .interactive-needle {
        transform: rotate(calc(var(--mouse-x) * 20deg)) translate(calc(var(--mouse-y) * 8px), calc(var(--mouse-x) * 4px));
        transform-origin: 50px 30px;
        transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .not-found-link:hover {
        border-color: var(--gold);
        color: var(--gold);
        background: var(--ivory);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(200, 161, 90, 0.1);
      }

      .not-found-search-bar {
        display: flex;
        gap: 10px;
        max-width: 460px;
        margin: 0 auto 36px;
        width: 100%;
      }

      .not-found-search-input {
        flex: 1;
        padding: 12px 14px 12px 42px;
        border: 1.5px solid var(--border);
        border-radius: 6px;
        font-size: 14px;
        color: var(--navy);
        background: #ffffff;
        outline: none;
        transition: all 0.25s ease;
      }

      .not-found-search-input:focus {
        border-color: var(--gold);
        box-shadow: 0 0 0 4px rgba(200, 161, 90, 0.12);
      }
    </style>

    <section class="content-section not-found-section" style="padding: clamp(64px, 10vw, 120px) 24px; text-align: center; background: var(--ivory);">
      <div style="max-width: 680px; margin: 0 auto;">
        
        <!-- Interactive Embroidery Visual (Cursor reactive, pure CSS vectors under 5KB) -->
        <div class="not-found-svg-container">
          <svg width="120" height="120" viewBox="0 0 100 100" style="overflow: visible;">
            <!-- Golden embroidery loop outline -->
            <circle cx="50" cy="50" r="46" fill="none" stroke="var(--border)" stroke-width="3" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--gold)" stroke-width="0.8" stroke-dasharray="3, 3" />
            
            <!-- Loose stitch gold thread path -->
            <path d="M 30,52 C 30,22 70,22 70,52 C 70,82 51,91 51,70 C 51,48 33,39 53,39" 
                  fill="none" 
                  stroke="var(--gold)" 
                  stroke-width="2.5" 
                  stroke-linecap="round"
                  stroke-dasharray="6, 4" 
                  class="animated-thread" />
            
            <!-- Interactive tilting needle -->
            <g class="interactive-needle">
              <!-- Thread trailing from eye -->
              <path d="M 50,18 C 50,6 40,8 30,16" fill="none" stroke="var(--gold)" stroke-width="1" opacity="0.6" stroke-dasharray="2, 2" />
              <!-- Needle shape -->
              <path d="M 49.5,10 L 50.5,10 L 50.8,55 L 50,60 L 49.2,55 Z" fill="var(--navy)" />
              <!-- Needle eye cutout -->
              <ellipse cx="50" cy="18" rx="0.5" ry="3.5" fill="var(--ivory)" />
            </g>
          </svg>
        </div>

        <h1 style="font-family: var(--font-serif); font-size: clamp(80px, 12vw, 110px); color: var(--navy); line-height: 0.8; margin: 0 0 16px;">404</h1>
        <p style="font-size: 13px; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 20px 0;">The Stitch Has Been Lost</p>
        
        <p style="color: var(--ink-soft); font-size: 15px; line-height: 1.6; max-width: 500px; margin: 0 auto 32px;">
          The page or product design collection you are looking for does not exist, has been archived, or has a temporarily misplaced coordinate.
        </p>

        <!-- Direct Search Box (Redirects to catalog with query search parameter) -->
        <form id="notFoundSearchForm" class="not-found-search-bar">
          <div style="position: relative; flex: 1; display: flex; align-items: center;">
            <span style="position: absolute; left: 14px; color: var(--gold); display: flex; align-items: center; pointer-events: none;">
              ${icon("search", 17)}
            </span>
            <input type="text" name="search" required placeholder="Search designs, codes, embroidery patterns..." class="not-found-search-input" />
          </div>
          <button type="submit" class="button button-primary" style="min-height: 45px; font-size: 13px; font-weight: 700; padding: 0 20px;">Search</button>
        </form>

        <!-- Quick Recovery Nav buttons (Touch targets >= 48px) -->
        <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 40px;">
          <a href="#/" class="button button-primary" style="min-height: 48px; min-width: 180px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; text-decoration: none;">
            <span>Back to Homepage</span>
          </a>
          <a href="#/track-order" class="button button-secondary" style="min-height: 48px; min-width: 180px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; text-decoration: none;">
            <span>Track Existing Order</span>
          </a>
        </div>

        <!-- WhatsApp Support Support CTA -->
        <div style="margin-bottom: 48px;">
          <a href="${whatsappUrl}" target="_blank" class="button" style="
            min-height: 48px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: 700;
            background: #25d366;
            color: #ffffff;
            border: none;
            padding: 0 24px;
            border-radius: 6px;
            text-decoration: none;
            box-shadow: 0 4px 16px rgba(37, 211, 102, 0.2);
            transition: all 0.25s ease;
          " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 20px rgba(37, 211, 102, 0.35)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 16px rgba(37, 211, 102, 0.2)';">
            <svg style="width: 20px; height: 20px; fill: #fff;" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.019-5.117-2.875-6.974C16.594 1.91 14.12 1.888 11.488 1.888c-5.437 0-9.864 4.42-9.868 9.866-.001 1.768.48 3.49 1.39 5.005L1.93 21.147l4.717-1.993zM18.006 14.75c-.33-.165-1.956-.965-2.257-1.074-.303-.11-.523-.165-.743.165-.22.33-.853 1.074-1.046 1.3-.193.223-.386.248-.716.083-.33-.165-1.393-.513-2.656-1.64-1.002-.893-1.68-2.0-1.877-2.33-.197-.33-.021-.508.144-.673.148-.148.33-.385.495-.578.165-.192.22-.33.33-.55.11-.22.055-.413-.028-.578-.083-.166-.743-1.79-1.019-2.45-.268-.644-.542-.556-.743-.566-.19-.01-.41-.012-.628-.012-.22 0-.578.083-.88.413-.303.33-1.155 1.128-1.155 2.75 0 1.623 1.182 3.19 1.346 3.41.165.22 2.327 3.55 5.637 4.978.788.34 1.402.543 1.88.697.79.25 1.51.215 2.078.13.633-.095 1.956-.8 2.23-1.57.275-.77.275-1.43.193-1.57-.083-.14-.303-.223-.633-.39z" />
            </svg>
            <span>WhatsApp Support</span>
          </a>
        </div>

        <!-- Supabase CMS Category Shortcuts -->
        <div style="border-top: 1px solid var(--border); padding-top: 36px;">
          <span style="font-size: 11px; text-transform: uppercase; color: var(--gold); font-weight: 700; letter-spacing: 0.12em; display: block; margin-bottom: 18px;">Browse Featured Collections</span>
          <div style="display: flex; gap: 12px 16px; justify-content: center; flex-wrap: wrap;">
            ${categoryLinksHtml}
          </div>
        </div>

      </div>
    </section>
  `;
}

// Bind 404 Form Delegates and Event Handlers
export function initNotFoundEvents() {
  // Emit event hook point for analytics tracking
  if (typeof window.emitAnalyticsEvent === "function") {
    window.emitAnalyticsEvent("404_PAGE_VIEW", {
      path: window.location.hash,
      timestamp: new Date().toISOString()
    });
  } else {
    console.log("[Analytics Hook] 404_PAGE_VIEW emitted for: " + window.location.hash);
  }

  // 1. Search Box redirection handler
  const searchForm = document.getElementById("notFoundSearchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(searchForm);
      const query = formData.get("search");
      if (query && query.trim()) {
        // Redirect directly to catalog page with search parameter
        window.location.hash = `#/catalog?search=${encodeURIComponent(query.trim())}`;
      }
    });
  }
}
