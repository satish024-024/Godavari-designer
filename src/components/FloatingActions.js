import { currentUser } from "../services/store.js";
import { icon, isMobileViewport } from "../utils/helpers.js";

export function renderFloatingActions() {
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

  const isMobile = isMobileViewport();

  return `
    <div class="floating-actions">
      ${isAdmin && !isMobile ? `
        <a href="https://godavari-designers.sanity.studio/" target="_blank" rel="noopener noreferrer" class="admin-fab" aria-label="Open Sanity Studio CMS" title="Sanity Studio CMS">
          <svg style="width: 20px; height: 20px; fill: currentColor;" viewBox="0 0 24 24">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
          </svg>
        </a>
      ` : ""}
      <button type="button" class="to-top" data-action="scroll-to" data-target="home" aria-label="Back to top">
        ${icon("arrow-up", 20)}
      </button>
    </div>
  `;
}
