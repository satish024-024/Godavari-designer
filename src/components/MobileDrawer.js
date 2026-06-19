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
        ${currentUser && currentUser.role === "admin" ? `
          <a href="#/admin-dashboard" class="drawer-link admin-drawer-link" style="color: var(--gold); font-weight: 700; display: flex; align-items: center; gap: 8px;" data-action="close-panels">
            <span style="display: flex;">${icon("shield-check", 16)}</span>
            <span>Admin Portal</span>
          </a>
          <div class="drawer-divider"></div>
        ` : ""}
        <a href="#/" class="drawer-link" data-action="close-panels">Home</a>
        <div class="drawer-divider"></div>
        <button type="button" class="drawer-link" data-action="scroll-to" data-target="collections">Collections</button>
        <a href="#/catalog?category=blouses" class="drawer-link" data-action="close-panels">Designer Blouses</a>
        <a href="#/catalog?category=saree" class="drawer-link" data-action="close-panels">Saree Borders</a>
        <a href="#/catalog?category=kids-wear" class="drawer-link" data-action="close-panels">Kids Wear</a>
        <a href="#/catalog?collection=bridal" class="drawer-link" data-action="close-panels">Bridal Collection</a>
        <div class="drawer-divider"></div>
        <a href="#/custom-order" class="drawer-link" data-action="close-panels">Custom Orders</a>
        <a href="#/catalog" class="drawer-link" data-action="close-panels">Design Library</a>
        <div class="drawer-divider"></div>
        <button type="button" class="drawer-link" data-action="scroll-to" data-target="stories">About Us</button>
        <button type="button" class="drawer-link" data-action="scroll-to" data-target="footer">Contact</button>
      </nav>

      <div class="drawer-footer">
        <div class="drawer-divider"></div>
        <div class="drawer-contact-actions">
          <a href="https://wa.me/${(site.brand?.contact?.phone || "919999999999").replace(/[^0-9]/g, '')}" target="_blank" rel="noopener" class="drawer-contact-btn whatsapp-btn">
            ${icon("phone", 16)}
            <span>WhatsApp</span>
          </a>
          <a href="tel:${(site.brand?.contact?.phone || "+919999999999").replace(/\s+/g, '')}" class="drawer-contact-btn call-btn">
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
