import { config, isRazorpayConfigured, assertProductionSafety } from "../../lib/config.js";
import { getProductById, getRecentPendingPurchase, createPurchase, checkActiveEntitlement, getUserFromAuthHeader } from "../../lib/supabase.js";
import { createRazorpayOrder } from "../../lib/razorpay.js";

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Guest-Session-ID");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED", message: "Only POST requests are permitted" });
  }

  try {
    assertProductionSafety();

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { productId } = body;

    // Security check: reject explicit client-sent amount manipulation
    if (body.amount !== undefined || body.price !== undefined) {
      console.warn("⚠️ Client attempted to supply payment amount. Client price override strictly rejected.");
    }
    if (body.format !== undefined) {
      console.info("ℹ️ Format specified in request. Note that Model A applies: all formats (.DST and .PES) are included.");
    }

    if (!productId || typeof productId !== "string") {
      return res.status(400).json({ error: "INVALID_REQUEST", message: "A valid productId string is required" });
    }

    // 1. Authenticate user if token provided
    const user = await getUserFromAuthHeader(req);
    const guestSessionId = req.headers["x-guest-session-id"] || body.guestSessionId || null;

    // 2. Fetch authoritative product from database
    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: "PRODUCT_NOT_FOUND", message: "The requested design could not be found" });
    }

    // 3. Check for existing ACTIVE entitlement
    const existingEntitlement = await checkActiveEntitlement({
      productId: product.id,
      userId: user ? user.id : null
    });

    if (existingEntitlement) {
      return res.status(200).json({
        alreadyPurchased: true,
        productId: product.id,
        title: product.title,
        message: "You already own an active license for this embroidery design."
      });
    }

    // 4. 15-Minute Order Reuse Check
    const recentPurchase = await getRecentPendingPurchase({
      productId: product.id,
      userId: user ? user.id : null,
      guestSessionId
    });

    if (recentPurchase) {
      console.log(`Reusing active pending order ${recentPurchase.razorpay_order_id} for purchase ${recentPurchase.id}`);
      return res.status(200).json({
        orderId: recentPurchase.razorpay_order_id,
        razorpayOrderId: recentPurchase.razorpay_order_id,
        purchaseId: recentPurchase.id,
        amount: Number(recentPurchase.amount),
        amountInPaise: Math.round(Number(recentPurchase.amount) * 100),
        currency: recentPurchase.currency,
        keyId: config.razorpay.keyId,
        reused: true,
        isExistingOrder: true,
        entitledFormats: ["DST", "PES"],
        product: {
          id: product.id,
          code: product.code,
          title: product.title,
          image: product.image
        }
      });
    }

    // 5. Authoritative Price from DB
    const authoritativePrice = Number(product.price);
    if (isNaN(authoritativePrice) || authoritativePrice <= 0) {
      return res.status(500).json({ error: "INVALID_PRODUCT_PRICE", message: "Invalid product pricing in database" });
    }

    // 6. Create Razorpay Order
    const razorpayOrder = await createRazorpayOrder({
      amount: authoritativePrice,
      currency: "INR",
      receipt: `RCPT-${Date.now().toString().slice(-8)}`,
      notes: {
        productId: product.id,
        productCode: product.code,
        userId: user ? user.id : "guest"
      }
    });

    // 7. Store internal Purchase record
    const newPurchase = await createPurchase({
      user_id: user ? user.id : null,
      product_id: product.id,
      amount: authoritativePrice,
      currency: "INR",
      status: "CREATED",
      razorpay_order_id: razorpayOrder.id,
      guest_session_id: guestSessionId,
      notes: {
        productCode: product.code,
        productTitle: product.title
      }
    });

    return res.status(200).json({
      orderId: razorpayOrder.id,
      razorpayOrderId: razorpayOrder.id,
      purchaseId: newPurchase.id,
      amount: authoritativePrice,
      amountInPaise: Math.round(authoritativePrice * 100),
      currency: "INR",
      keyId: config.razorpay.keyId,
      isExistingOrder: false,
      entitledFormats: ["DST", "PES"],
      product: {
        id: product.id,
        code: product.code,
        title: product.title,
        image: product.image
      }
    });
  } catch (err) {
    console.error("api/payments/create-order error:", err);
    return res.status(err.statusCode || err.status || 500).json({
      error: err.code || "ORDER_CREATION_FAILED",
      message: err.message || "Failed to create payment order"
    });
  }
}
