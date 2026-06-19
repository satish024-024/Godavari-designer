import { currentUser } from "../services/store.js";
import { icon } from "../utils/helpers.js";

export function renderFloatingActions() {
  const isAdmin = currentUser && currentUser.role === "admin";
  return `
    <div class="floating-actions">
      ${isAdmin ? `
        <button type="button" class="admin-fab" data-action="open-admin" aria-label="Customize website">
          ${icon("sliders-horizontal", 20)}
        </button>
      ` : ""}
      <button type="button" class="to-top" data-action="scroll-to" data-target="home" aria-label="Back to top">
        ${icon("arrow-up", 20)}
      </button>
    </div>
  `;
}
