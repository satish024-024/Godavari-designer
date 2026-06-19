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
  if (typeof id === "string" && (id.startsWith("http://") || id.startsWith("https://") || id.startsWith("./"))) {
    return id;
  }
  return MediaLibrary.getMediaUrl(id, id);
}
