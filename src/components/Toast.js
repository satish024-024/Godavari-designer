import { ui } from "../services/store.js";
import { escapeHtml } from "../utils/helpers.js";

export function renderToast() {
  return ui.toast ? `<div class="toast">${escapeHtml(ui.toast)}</div>` : "";
}
