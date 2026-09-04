import { getUserFromAuthHeader, updatePurchase } from "../../lib/supabase.js";
import { hashGuestToken } from "../../lib/crypto.js";
import { config } from "../../lib/config.js";

const baseUrl = config.supabase.url.replace(/\/$/, "");
const authHeaderKey = config.supabase.serviceRoleKey || config.supabase.anonKey;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "Sign in required to claim guest purchases" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { guestToken } = body;

    if (!guestToken || typeof guestToken !== "string") {
      return res.status(400).json({ error: "MISSING_PROOF", message: "A valid guest access token is required as proof of ownership" });
    }

    const tokenHash = hashGuestToken(guestToken);

    // Find guest purchase matching token hash
    const searchRes = await fetch(`${baseUrl}/rest/v1/purchases?guest_token_hash=eq.${encodeURIComponent(tokenHash)}&select=id,product_id,user_id,status`, {
      headers: {
        "apikey": config.supabase.anonKey,
        "Authorization": `Bearer ${authHeaderKey}`
      }
    });

    const purchases = await searchRes.json();
    if (!Array.isArray(purchases) || purchases.length === 0) {
      return res.status(404).json({ error: "PURCHASE_NOT_FOUND", message: "No purchase found matching this access token" });
    }

    const purchase = purchases[0];
    if (purchase.user_id) {
      if (purchase.user_id === user.id) {
        return res.status(200).json({ success: true, message: "Purchase is already linked to your account" });
      }
      return res.status(409).json({ error: "ALREADY_CLAIMED", message: "This purchase has already been claimed by another account" });
    }

    // Attach purchase to user
    await updatePurchase(purchase.id, {
      user_id: user.id
    });

    // Attach entitlement to user
    await fetch(`${baseUrl}/rest/v1/entitlements?purchase_id=eq.${encodeURIComponent(purchase.id)}`, {
      method: "PATCH",
      headers: {
        "apikey": config.supabase.anonKey,
        "Authorization": `Bearer ${authHeaderKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: user.id,
        updated_at: new Date().toISOString()
      })
    });

    return res.status(200).json({
      success: true,
      message: "Guest purchase successfully claimed and linked to your account.",
      purchaseId: purchase.id,
      productId: purchase.product_id
    });
  } catch (err) {
    console.error("api/purchases/claim-guest error:", err);
    return res.status(500).json({ error: "CLAIM_FAILED", message: err.message });
  }
}
