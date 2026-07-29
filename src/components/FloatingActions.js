import { currentUser } from "../services/store.js";
import { icon } from "../utils/helpers.js";

export function renderFloatingActions() {
  const isAdmin = currentUser && currentUser.role === "admin";
  return `
    <div class="floating-actions">
      ${isAdmin ? `
        <a href="#/admin-dashboard" class="admin-fab" aria-label="Open admin portal">
          ${icon("sliders-horizontal", 20)}
        </a>
      ` : ""}
      <button type="button" class="to-top" data-action="scroll-to" data-target="home" aria-label="Back to top">
        ${icon("arrow-up", 20)}
      </button>
    </div>
  `;
}
