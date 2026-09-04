import { getUserFromAuthHeader, getPurchaseById, getProductById } from "../../lib/supabase.js";
import { config } from "../../lib/config.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const url = new URL(req.url, "http://localhost");
    const pathParts = url.pathname.split("/");
    const purchaseId = pathParts[pathParts.length - 1].split("?")[0] || req.query?.purchaseId;

    if (!purchaseId) {
      return res.status(400).json({ error: "MISSING_ID", message: "Purchase ID required" });
    }

    const purchase = await getPurchaseById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Purchase record not found" });
    }

    // Ownership check if registered purchase
    const user = await getUserFromAuthHeader(req);
    if (purchase.user_id && (!user || user.id !== purchase.user_id)) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Access denied to this purchase record" });
    }

    const product = await getProductById(purchase.product_id);

    return res.status(200).json({
      purchase: {
        id: purchase.id,
        amount: Number(purchase.amount),
        currency: purchase.currency,
        status: purchase.status,
        orderId: purchase.razorpay_order_id,
        paymentId: purchase.razorpay_payment_id,
        paymentMethod: purchase.payment_method,
        paidAt: purchase.paid_at,
        createdAt: purchase.created_at
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
    console.error("api/purchases/[purchaseId] error:", err);
    return res.status(500).json({ error: "FETCH_FAILED", message: err.message });
  }
}
