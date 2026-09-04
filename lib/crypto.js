import crypto from "crypto";

/**
 * Timing-safe HMAC SHA-256 signature verification
 */
export function verifyHmacSha256(data, providedSignature, secret) {
  if (!data || !providedSignature || !secret) {
    return false;
  }
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const providedBuffer = Buffer.from(providedSignature, "utf8");

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  } catch (err) {
    console.error("verifyHmacSha256 error:", err);
    return false;
  }
}

/**
 * Generate a cryptographically secure 256-bit random guest token
 */
export function generateGuestToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * SHA-256 hash of guest token for server-side persistence
 */
export function hashGuestToken(token) {
  if (!token || typeof token !== "string") return null;
  return crypto.createHash("sha256").update(token.trim()).digest("hex");
}

// ------------------------------------------------------------
// In-Memory Single-Use 60-Second Download Grant Store
// ------------------------------------------------------------
const downloadGrants = new Map();

// Periodic sweep for expired grants (every 30 seconds)
setInterval(() => {
  const now = Date.now();
  for (const [grantId, grant] of downloadGrants.entries()) {
    if (now - grant.createdAt > 60000) {
      downloadGrants.delete(grantId);
    }
  }
}, 30000).unref();

/**
 * Create a short-lived (60s), single-use download grant
 */
export function createDownloadGrant({ productId, userId = null, purchaseId, format = "DST", createdAt = Date.now() }) {
  const grantId = "grant_" + crypto.randomBytes(24).toString("hex");
  downloadGrants.set(grantId, {
    grantId,
    productId,
    userId,
    purchaseId,
    format: (format || "DST").toUpperCase(),
    createdAt
  });
  return { grantId, expiresIn: 60 };
}

/**
 * Atomically consume a download grant (single-use!)
 */
export function consumeDownloadGrant(grantId) {
  if (!grantId || typeof grantId !== "string") return null;
  const grant = downloadGrants.get(grantId);
  if (!grant) return null;

  // Invalidate immediately (single-use guarantee)
  downloadGrants.delete(grantId);

  const isExpired = Date.now() - grant.createdAt > 60000;
  if (isExpired) return null;

  return grant;
}
