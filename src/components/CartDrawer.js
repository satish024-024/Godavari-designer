import { site, cart } from "../services/store.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

function getProduct(id) {
  return site.products.find((product) => product.id === id);
}

export function renderCartDrawer() {
  const lines = cart
    .map((item) => {
      const product = getProduct(item.id);
      if (!product) return "";
      return `
        <article class="cart-line">
          <img src="${attr(mediaUrl(product.image))}" alt="${attr(product.title)}" />
          <div>
            <h3>${escapeHtml(product.title)}</h3>
            <p style="font-size:12px; color:var(--ink-soft); margin-bottom:6px;">Format: <strong>${escapeHtml(item.format)}</strong></p>
            <p>${money(product.price)} x ${item.qty}</p>
            <div class="qty-row">
              <button type="button" data-action="cart-minus" data-id="${attr(product.id)}" data-format="${attr(item.format)}">${icon("minus", 14)}</button>
              <span>${item.qty}</span>
              <button type="button" data-action="cart-plus" data-id="${attr(product.id)}" data-format="${attr(item.format)}">${icon("plus", 14)}</button>
            </div>
          </div>
          <button type="button" class="icon-button" data-action="remove-cart" data-id="${attr(product.id)}" data-format="${attr(item.format)}" aria-label="Remove ${attr(product.title)}">${icon("trash-2", 18)}</button>
        </article>
      `;
    })
    .join("");

  const total = cart.reduce((sum, item) => {
    const product = getProduct(item.id);
    if (!product) return sum;
    const formatObj = product.formats ? product.formats.find(f => f.format === item.format) : null;
    const price = formatObj ? formatObj.price : product.price;
    return sum + (price * item.qty);
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
