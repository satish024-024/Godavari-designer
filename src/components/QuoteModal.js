import { currentUser } from "../services/store.js";
import { icon, attr } from "../utils/helpers.js";

export function renderQuoteModal() {
  const defaultName = currentUser ? (currentUser.name || "") : "";
  const defaultEmail = currentUser ? (currentUser.email || "") : "";
  const defaultPhone = currentUser ? (currentUser.phone || "") : "";

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
            <input name="name" required value="${attr(defaultName)}" placeholder="Your name" />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" required value="${attr(defaultEmail)}" placeholder="you@example.com" />
          </label>
          <label>
            <span>Phone</span>
            <input name="phone" value="${attr(defaultPhone)}" placeholder="+91" />
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
