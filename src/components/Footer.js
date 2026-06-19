import { site } from "../services/store.js";
import { escapeHtml, attr, icon } from "../utils/helpers.js";

export function renderFooter() {
  return `
    <footer class="site-footer" id="footer">
      <div class="footer-brand">
        <a class="brand-lockup footer-logo" href="#/">
          <span class="brand-name">${escapeHtml(site.brand.name.split(" ")[0] || site.brand.name)}</span>
          <span class="brand-sub">${escapeHtml(site.brand.name.split(" ").slice(1).join(" ") || "Designer")}</span>
        </a>
        <p>${escapeHtml(site.brand.descriptor)}</p>
        <div class="contact-row">
          <button type="button" data-action="copy-email">${icon("mail", 16)} ${escapeHtml(site.brand.contact.email)}</button>
          <span>${icon("phone", 16)} ${escapeHtml(site.brand.contact.phone)}</span>
          <span>${icon("map-pin", 16)} ${escapeHtml(site.brand.contact.address)}</span>
          <a href="#/track-order" style="text-decoration:none; color:inherit; display:inline-flex; align-items:center; gap:6px; font-weight:600;">
            ${icon("compass", 16)} Track Order
          </a>
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
