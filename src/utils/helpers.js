import { MediaLibrary } from "../services/media.js";

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

export function mergeDefaults(base, saved) {
  if (Array.isArray(base)) return Array.isArray(saved) ? saved : base;
  if (!isObject(base)) return saved === undefined ? base : saved;

  const output = { ...base };
  if (!isObject(saved)) return output;

  Object.keys(saved).forEach((key) => {
    output[key] = key in base ? mergeDefaults(base[key], saved[key]) : saved[key];
  });
  return output;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function attr(value) {
  return escapeHtml(value);
}

export function icon(name, size = 20) {
  return `<i data-lucide="${name}" style="width:${size}px;height:${size}px" aria-hidden="true"></i>`;
}

export function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export function mediaUrl(id) {
  if (!id || typeof id !== "string") {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23F4EDE4'/%3E%3Ctext x='50%25' y='50%25' font-family='serif' font-size='20' fill='%23C8A15A' text-anchor='middle' dominant-baseline='middle'%3EGodavari Designers%3C/text%3E%3C/svg%3E";
  }

  const clean = id.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:") || clean.startsWith("./") || clean.startsWith("/")) {
    return clean;
  }

  // Check if it's a Supabase storage path (e.g. images/..., media-library/..., designs/...)
  if (clean.startsWith("images/") || clean.startsWith("media-library/") || clean.startsWith("videos/")) {
    const subPath = clean.replace(/^(media-library|public)\//, "");
    return `https://xpqduepvrlhzsofxcukn.supabase.co/storage/v1/object/public/media-library/${subPath}`;
  }
  if (clean.startsWith("designs/") || clean.startsWith("digitized-designs/")) {
    const subPath = clean.replace(/^(digitized-designs|public)\//, "");
    return `https://xpqduepvrlhzsofxcukn.supabase.co/storage/v1/object/public/digitized-designs/${subPath}`;
  }

  const registryUrl = MediaLibrary.getMediaUrl(clean, null);
  if (registryUrl) {
    return registryUrl;
  }

  return clean;
}

export function isMobileViewport() {
  return window.innerWidth <= 768;
}

export function renderAdBlock(slotId = "", format = "auto") {
  // Only render manual ad block if a genuine numeric slot ID is configured
  if (!slotId || !/^\d+$/.test(String(slotId).trim())) {
    return "";
  }
  return `
    <div class="ad-container" style="margin: 20px 0; text-align: center; overflow: hidden; min-height: 90px;">
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-4534760311767422"
           data-ad-slot="${slotId}"
           data-ad-format="${format}"
           data-full-width-responsive="true"></ins>
    </div>
  `;
}

export function triggerAds() {
  try {
    const ads = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status="done"])');
    ads.forEach((ad) => {
      // Only push ad when container has positive width to avoid TagError (availableWidth=0)
      if (ad.offsetWidth > 0 && typeof window.adsbygoogle !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    });
  } catch (_) {
    // Non-blocking
  }
}
