import { renderMobileHeader } from "./MobileHeader.js";
import { renderMobileBottomNav } from "./MobileBottomNav.js";
import { renderMobileDrawer } from "../MobileDrawer.js";
import { renderFloatingActions } from "../FloatingActions.js";
import { renderSearchOverlay } from "../SearchOverlay.js";
import { renderCartDrawer } from "../CartDrawer.js";
import { renderQuoteModal } from "../QuoteModal.js";
import { renderStoryModal } from "../StoryModal.js";
import { renderQuickViewModal } from "../QuickViewModal.js";
import { renderToast } from "../Toast.js";
import { renderAdminDrawer } from "../AdminDrawer.js";
import { ui, currentUser } from "../../services/store.js";

export function renderMobileShell(pageContent) {
  return `
    <div class="mobile-shell">
      ${renderMobileHeader()}
      <main class="mobile-shell-main">
        ${pageContent}
      </main>
      ${renderMobileBottomNav()}
      ${renderMobileDrawer()}
      ${renderFloatingActions()}
      ${ui.searchOpen ? renderSearchOverlay() : ""}
      ${ui.cartOpen ? renderCartDrawer() : ""}
      ${ui.quoteOpen ? renderQuoteModal() : ""}
      ${ui.storyOpen ? renderStoryModal() : ""}
      ${ui.adminOpen && currentUser && currentUser.role === "admin" ? renderAdminDrawer() : ""}
      ${ui.quickViewProductId ? renderQuickViewModal(ui.quickViewProductId) : ""}
      ${renderToast()}
    </div>
  `;
}
