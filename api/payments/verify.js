import { config, assertProductionSafety } from "../lib/config.js";
import { getPurchaseByOrderId, getPurchaseById, activatePurchaseEntitlement, updatePurchase, getUserFromAuthHeader } from "../lib/supabase.js";
import { fetchRazorpayPayment, fetchRazorpayOrder, verifyRazorpaySignature } from "../lib/razorpay.js";
import { generateGuestToken, hashGuestToken } from "../lib/crypto.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED", message: "Only POST requests are permitted" });
  }

  try {
    assertProductionSafety();

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const razorpayPaymentId = body.razorpayPaymentId || body.razorpay_payment_id;
    const razorpayOrderId = body.razorpayOrderId || body.razorpay_order_id;
    const razorpaySignature = body.razorpaySignature || body.razorpay_signature;
    const purchaseId = body.purchaseId || body.purchase_id;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({
        error: "MISSING_VERIFICATION_PARAMS",
        message: "razorpayPaymentId, razorpayOrderId, and razorpaySignature are required"
      });
    }

    // 1. Load Purchase record
    let purchase = null;
    if (razorpayOrderId) {
      purchase = await getPurchaseByOrderId(razorpayOrderId);
    }
    if (!purchase && purchaseId) {
      purchase = await getPurchaseById(purchaseId);
    }

    if (!purchase) {
      return res.status(404).json({
        error: "PURCHASE_NOT_FOUND",
        message: "No purchase record matched the provided payment identifiers"
      });
    }

    // Early idempotency check if already confirmed PAID
    if (purchase.status === "PAID") {
      return res.status(200).json({
        success: true,
        status: "PAID",
        idempotent: true,
        purchaseId: purchase.id,
        productId: purchase.product_id,
        entitlementStatus: "ACTIVE",
        message: "Purchase is already verified and active."
      });
    }

    // 2. Verify HMAC SHA-256 signature
    const isValidSignature = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!isValidSignature) {
      console.error(`🚨 Security Alert: Signature mismatch for order ${razorpayOrderId} and payment ${razorpayPaymentId}`);
      await updatePurchase(purchase.id, {
        status: "FAILED",
        failed_at: new Date().toISOString(),
        notes: { ...purchase.notes, failureReason: "Cryptographic signature verification failed" }
      });

      return res.status(400).json({
        error: "INVALID_SIGNATURE",
        message: "Payment signature could not be verified securely"
      });
    }

    // 3. Query Razorpay API for live payment verification
    const rzpPayment = await fetchRazorpayPayment(razorpayPaymentId);

    // Verify order ID matches
    if (rzpPayment.order_id !== purchase.razorpay_order_id) {
      console.error(`🚨 Order ID mismatch: Razorpay reports ${rzpPayment.order_id}, DB expects ${purchase.razorpay_order_id}`);
      return res.status(400).json({
        error: "ORDER_MISMATCH",
        message: "The payment is not linked to the specified order"
      });
    }

    // Verify amount in paise matches authoritative DB price
    const expectedPaise = Math.round(Number(purchase.amount) * 100);
    if (Number(rzpPayment.amount) !== expectedPaise) {
      console.error(`🚨 Amount mismatch: Razorpay reports ${rzpPayment.amount}, DB expects ${expectedPaise}`);
      return res.status(400).json({
        error: "AMOUNT_MISMATCH",
        message: "Payment amount does not match authoritative purchase price"
      });
    }

    // Verify currency
    if (rzpPayment.currency !== "INR") {
      return res.status(400).json({
        error: "CURRENCY_MISMATCH",
        message: "Payment currency is not supported"
      });
    }

    // 4. CRITICAL RULE: Payment Capture Verification
    // Digital entitlement CANNOT be granted on 'authorized' alone.
    if (rzpPayment.status !== "captured") {
      if (rzpPayment.status === "authorized") {
        console.warn(`Payment ${razorpayPaymentId} is AUTHORIZED but not yet CAPTURED. Entitlement deferred.`);
        await updatePurchase(purchase.id, {
          status: "AUTHORIZED",
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
          payment_method: rzpPayment.method || "card"
        });

        return res.status(200).json({
          success: false,
          status: "AUTHORIZED",
          purchaseId: purchase.id,
          message: "Payment is authorized but not yet captured. Digital access will unlock upon capture confirmation."
        });
      }

      return res.status(400).json({
        error: "PAYMENT_NOT_CAPTURED",
        status: rzpPayment.status,
        message: `Payment status is ${rzpPayment.status}, but captured payment is required for digital fulfillment.`
      });
    }

    // 5. Verify Order status is paid
    const rzpOrder = await fetchRazorpayOrder(purchase.razorpay_order_id);
    if (rzpOrder.status !== "paid") {
      console.warn(`Payment is captured but Order ${purchase.razorpay_order_id} status is ${rzpOrder.status}.`);
    }

    // 6. Handle Guest Token Generation (if guest checkout)
    let plaintextGuestToken = null;
    let guestTokenHash = null;

    if (!purchase.user_id) {
      plaintextGuestToken = generateGuestToken();
      guestTokenHash = hashGuestToken(plaintextGuestToken);
    }

    // 7. Atomic Purchase & Entitlement Activation via Database RPC
    const activationResult = await activatePurchaseEntitlement({
      razorpayOrderId: purchase.razorpay_order_id,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod: rzpPayment.method || "upi",
      guestTokenHash
    });

    if (!activationResult.success) {
      console.error("Activation failed:", activationResult);
      return res.status(500).json({
        error: "ACTIVATION_FAILED",
        message: activationResult.message || "Failed to activate design entitlement"
      });
    }

    return res.status(200).json({
      success: true,
      status: "PAID",
      purchaseId: purchase.id,
      productId: purchase.product_id,
      guestToken: plaintextGuestToken || undefined,
      entitlementStatus: "ACTIVE",
      message: "Payment verified successfully. Machine embroidery files are unlocked."
    });
  } catch (err) {
    console.error("api/payments/verify error:", err);
    return res.status(err.statusCode || err.status || 500).json({
      error: err.code || "VERIFICATION_FAILED",
      message: err.message || "Payment verification failed"
    });
  }
}
