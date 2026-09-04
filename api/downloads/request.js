import { checkActiveEntitlement, getUserFromAuthHeader, getProductById } from "../lib/supabase.js";
import { hashGuestToken, createDownloadGrant } from "../lib/crypto.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Guest-Token");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { productId, format = "DST" } = body;

    if (!productId) {
      return res.status(400).json({ error: "MISSING_PRODUCT_ID", message: "productId is required" });
    }

    // 1. Authenticate user or guest
    const user = await getUserFromAuthHeader(req);
    const guestToken = req.headers["x-guest-token"] || body.guestToken || null;
    const guestTokenHash = guestToken ? hashGuestToken(guestToken) : null;

    if (!user && !guestTokenHash) {
      return res.status(401).json({
        error: "AUTHENTICATION_REQUIRED",
        message: "You must be signed in or provide a valid guest access token to request download access."
      });
    }

    // 2. Verify active entitlement in database
    const entitlement = await checkActiveEntitlement({
      productId,
      userId: user ? user.id : null,
      guestTokenHash
    });

    if (!entitlement || entitlement.status !== "ACTIVE") {
      return res.status(403).json({
        error: "ACCESS_DENIED",
        message: "No active commercial entitlement found for this design. Please purchase to unlock."
      });
    }

    // 3. Verify product exists
    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: "PRODUCT_NOT_FOUND", message: "Design file metadata not found" });
    }

    // 4. Generate Single-Use 60-Second Download Grant
    const { grantId, expiresIn } = createDownloadGrant({
      productId: product.id,
      userId: user ? user.id : null,
      purchaseId: entitlement.purchase_id,
      format: (format || "DST").toUpperCase()
    });

    return res.status(200).json({
      success: true,
      grantId,
      expiresIn,
      downloadUrl: `/api/downloads/${grantId}?format=${encodeURIComponent(format.toUpperCase())}`,
      productCode: product.code,
      format: format.toUpperCase()
    });
  } catch (err) {
    console.error("api/downloads/request error:", err);
    return res.status(500).json({ error: "DOWNLOAD_REQUEST_FAILED", message: err.message });
  }
}
