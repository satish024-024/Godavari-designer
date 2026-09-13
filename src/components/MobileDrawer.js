import { site, ui, currentUser } from "../services/store.js";
import { escapeHtml, attr, icon } from "../utils/helpers.js";

export function renderMobileDrawer() {
  if (!ui.mobileMenuOpen) return "";

  return `
    <div class="mobile-drawer-overlay" data-action="toggle-mobile-menu" aria-hidden="true"></div>
    <aside class="mobile-drawer">
      <div class="mobile-drawer-header">
        <a class="drawer-brand-lockup" href="#/" data-action="close-panels">
          <span class="drawer-brand-name">${escapeHtml(site.brand.name.split(" ")[0] || site.brand.name)}</span>
          <span class="drawer-brand-sub">${escapeHtml(site.brand.name.split(" ").slice(1).join(" ") || "Designer")}</span>
        </a>
        <button type="button" class="drawer-close" data-action="toggle-mobile-menu" aria-label="Close menu">
          ${icon("x", 24)}
        </button>
      </div>
      
      <nav class="drawer-nav">
        ${(() => {
          const adminEmails = [
            "godavaridesigner@gmail.com",
            "satishkumarkadali024@gmail.com",
            "prakashkadali3723@gmail.com",
            "temp_admin_test@godavari.com"
          ];
          const userEmail = (currentUser?.email || "").toLowerCase();
          const userName = (currentUser?.name || "").toLowerCase();
          const isAdmin = currentUser && (
            currentUser.role === "admin" ||
            adminEmails.includes(userEmail) ||
            userEmail.includes("edmund") ||
            userName.includes("edmund")
          );
          return isAdmin ? `
            <a href="https://godavari-designers.sanity.studio/" target="_blank" rel="noopener noreferrer" class="drawer-link admin-drawer-link" style="color: #f03e2f; font-weight: 700; display: flex; align-items: center; gap: 8px; background: rgba(240,62,47,0.08); padding: 10px 14px; border-radius: 6px;" data-action="close-panels">
              <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24">
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
              </svg>
              <span>⚡ Sanity Studio</span>
            </a>
            <div class="drawer-divider"></div>
          ` : "";
        })()}
        <button type="button" class="drawer-link" data-action="open-search" style="display: flex; align-items: center; gap: 8px; color: var(--navy); font-weight: 600;">
          ${icon("search", 16)}
          <span>Search All Designs...</span>
        </button>
        <div class="drawer-divider"></div>
        <a href="#/" class="drawer-link" data-action="close-panels">Home</a>
        <a href="#/catalog" class="drawer-link" data-action="close-panels">Design Library (All)</a>
        <a href="#/custom-order" class="drawer-link" data-action="close-panels">Custom Orders & Digitizing</a>
        <div class="drawer-divider"></div>
        <a href="#/catalog?category=blouses" class="drawer-link" data-action="close-panels">Designer Blouses</a>
        <a href="#/catalog?category=saree" class="drawer-link" data-action="close-panels">Saree Borders</a>
        <a href="#/catalog?category=kids-wear" class="drawer-link" data-action="close-panels">Kids Wear</a>
        <a href="#/catalog?collection=bridal" class="drawer-link" data-action="close-panels">Bridal Collection</a>
        <div class="drawer-divider"></div>
        <a href="${currentUser ? "#/account" : "#/auth"}" class="drawer-link" data-action="close-panels" style="display: flex; align-items: center; gap: 8px;">
          ${icon("user", 16)}
          <span>${currentUser ? "My Account & Orders" : "Sign In / Register"}</span>
        </a>
        <a href="#/wishlist" class="drawer-link" data-action="close-panels" style="display: flex; align-items: center; gap: 8px;">
          ${icon("heart", 16)}
          <span>Saved Wishlist</span>
        </a>
        <div class="drawer-divider"></div>
        <button type="button" class="drawer-link" data-action="scroll-to" data-target="stories">About Us</button>
        <button type="button" class="drawer-link" data-action="scroll-to" data-target="footer">Contact Us</button>
      </nav>

      <div class="drawer-footer">
        <div class="drawer-divider"></div>
        <div class="drawer-contact-actions">
          <a href="https://wa.me/${(site.brand?.contact?.phone || "918309897055").replace(/[^0-9]/g, '')}" target="_blank" rel="noopener" class="drawer-contact-btn whatsapp-btn">
            ${icon("phone", 16)}
            <span>WhatsApp</span>
          </a>
          <a href="tel:${(site.brand?.contact?.phone || "+918309897055").replace(/\s+/g, '')}" class="drawer-contact-btn call-btn">
            ${icon("phone-call", 16)}
            <span>Call Us</span>
          </a>
          <a href="https://instagram.com/${(site.brand?.contact?.instagram || "@godavari_designer").replace('@', '')}" target="_blank" rel="noopener" class="drawer-contact-btn instagram-btn">
            ${icon("instagram", 16)}
            <span>Instagram</span>
          </a>
        </div>
      </div>
    </aside>
  `;
}
