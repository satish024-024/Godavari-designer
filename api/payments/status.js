import { getPurchaseById, getPurchaseByOrderId, getProductById } from "../../lib/supabase.js";
import { config } from "../../lib/config.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Guest-Token");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const url = new URL(req.url, "http://localhost");
    const purchaseId = url.searchParams.get("purchaseId") || req.query?.purchaseId;
    const orderId = url.searchParams.get("orderId") || req.query?.orderId;

    if (!purchaseId && !orderId) {
      return res.status(400).json({ error: "MISSING_IDENTIFIER", message: "purchaseId or orderId is required" });
    }

    let purchase = null;
    if (purchaseId) {
      purchase = await getPurchaseById(purchaseId);
    }
    if (!purchase && orderId) {
      purchase = await getPurchaseByOrderId(orderId);
    }

    if (!purchase) {
      return res.status(404).json({ error: "PURCHASE_NOT_FOUND", message: "Purchase record could not be found" });
    }

    const product = await getProductById(purchase.product_id);

    // Determine entitlement status
    let entitlementStatus = "PENDING";
    if (purchase.status === "PAID") {
      entitlementStatus = "ACTIVE";
    } else if (purchase.status === "REFUNDED") {
      entitlementStatus = "REVOKED";
    }

    return res.status(200).json({
      status: purchase.status,
      entitlementStatus,
      purchase: {
        id: purchase.id,
        amount: Number(purchase.amount),
        currency: purchase.currency,
        orderId: purchase.razorpay_order_id,
        paymentId: purchase.razorpay_payment_id || null,
        paymentMethod: purchase.payment_method || null,
        paidAt: purchase.paid_at || null,
        createdAt: purchase.created_at,
        isGuest: !purchase.user_id
      },
      product: product ? {
        id: product.id,
        code: product.code,
        title: product.title,
        price: Number(product.price),
        image: product.image,
        width: product.width,
        height: product.height,
        totalStitchCount: product.total_stitch_count,
        threadColors: product.thread_colors
      } : null
    });
  } catch (err) {
    console.error("api/payments/status error:", err);
    return res.status(500).json({ error: "STATUS_LOOKUP_FAILED", message: err.message });
  }
}
