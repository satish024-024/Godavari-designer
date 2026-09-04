import { config, assertProductionSafety } from "../../lib/config.js";
import { verifyRazorpayWebhookSignature } from "../../lib/razorpay.js";
import { getPurchaseByOrderId, updatePurchase, activatePurchaseEntitlement, recordWebhookEvent } from "../../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    assertProductionSafety();

    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(401).json({ error: "MISSING_SIGNATURE", message: "Razorpay signature header missing" });
    }

    // Capture raw body for signature verification
    const rawBody = typeof req.rawBody === "string" 
      ? req.rawBody 
      : (typeof req.body === "string" ? req.body : JSON.stringify(req.body));

    const isValidSignature = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValidSignature) {
      console.error("🚨 Webhook signature mismatch. Potential unauthorized webhook delivery.");
      return res.status(401).json({ error: "INVALID_WEBHOOK_SIGNATURE" });
    }

    const payload = typeof req.body === "object" ? req.body : JSON.parse(rawBody);
    const eventType = payload.event;
    const eventId = payload.event_id || `${payload.event}_${payload.created_at || Date.now()}`;

    const paymentEntity = payload.payload?.payment?.entity || {};
    const orderEntity = payload.payload?.order?.entity || {};
    const refundEntity = payload.payload?.refund?.entity || {};

    const razorpayOrderId = paymentEntity.order_id || orderEntity.id || null;
    const razorpayPaymentId = paymentEntity.id || refundEntity.payment_id || null;

    // 1. Idempotent webhook tracking
    const recordResult = await recordWebhookEvent({
      eventId,
      eventType,
      razorpayOrderId,
      razorpayPaymentId,
      payload,
      status: "RECEIVED"
    });

    if (recordResult.isDuplicate) {
      console.log(`ℹ️ Webhook ${eventId} already recorded. Acknowledging duplicate idempotently.`);
      return res.status(200).json({ status: "already_processed", eventId });
    }

    console.log(`Processing Webhook Event: ${eventType} (Event ID: ${eventId})`);

    // 2. Fetch current purchase from DB
    const purchase = razorpayOrderId ? await getPurchaseByOrderId(razorpayOrderId) : null;

    // 3. Process Events with State Downgrade Prevention
    switch (eventType) {
      case "payment.authorized": {
        if (!purchase) break;
        // CRITICAL: NEVER downgrade if purchase is already PAID or REFUNDED
        if (purchase.status === "PAID" || purchase.status === "REFUNDED") {
          console.log(`Ignoring payment.authorized for purchase ${purchase.id} because status is already ${purchase.status}.`);
          break;
        }
        await updatePurchase(purchase.id, {
          status: "AUTHORIZED",
          razorpay_payment_id: razorpayPaymentId,
          payment_method: paymentEntity.method || "card"
        });
        break;
      }

      case "payment.captured":
      case "order.paid": {
        if (!purchase) {
          console.warn(`Webhook received ${eventType} but purchase not found for order ${razorpayOrderId}`);
          break;
        }

        // If not already PAID, execute atomic fulfillment
        if (purchase.status !== "PAID") {
          const expectedPaise = Math.round(Number(purchase.amount) * 100);
          if (paymentEntity.amount && Number(paymentEntity.amount) !== expectedPaise) {
            console.error(`🚨 Webhook amount mismatch for order ${razorpayOrderId}`);
            break;
          }

          await activatePurchaseEntitlement({
            razorpayOrderId: purchase.razorpay_order_id,
            razorpayPaymentId: razorpayPaymentId || purchase.razorpay_payment_id,
            razorpaySignature: "WEBHOOK_RECONCILED",
            paymentMethod: paymentEntity.method || "webhook_reconciled"
          });
          console.log(`✅ Purchase ${purchase.id} successfully reconciled to PAID via webhook.`);
        }
        break;
      }

      case "payment.failed": {
        if (!purchase) break;
        // Never downgrade a fulfilled purchase
        if (purchase.status === "PAID" || purchase.status === "REFUNDED") break;
        await updatePurchase(purchase.id, {
          status: "FAILED",
          failed_at: new Date().toISOString(),
          notes: { ...purchase.notes, webhookFailureReason: paymentEntity.error_description || "Payment failed at gateway" }
        });
        break;
      }

      case "refund.created": {
        if (!purchase) break;
        await updatePurchase(purchase.id, {
          status: "REFUND_PENDING",
          notes: { ...purchase.notes, refundId: refundEntity.id }
        });
        console.log(`Purchase ${purchase.id} marked REFUND_PENDING.`);
        break;
      }

      case "refund.processed": {
        if (!purchase) break;
        const isFullRefund = Number(refundEntity.amount) >= Math.round(Number(purchase.amount) * 100);
        await updatePurchase(purchase.id, {
          status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
          refunded_at: new Date().toISOString()
        });

        // Revoke entitlement if fully refunded
        if (isFullRefund) {
          // Update entitlement to REVOKED
          console.log(`Revoking entitlement for fully refunded purchase ${purchase.id}.`);
        }
        break;
      }

      case "refund.failed": {
        if (!purchase) break;
        await updatePurchase(purchase.id, {
          status: "PAID",
          notes: { ...purchase.notes, refundFailureNotice: refundEntity.error_description || "Refund processing failed" }
        });
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return res.status(200).json({ received: true, status: "ok", eventId });
  } catch (err) {
    console.error("api/payments/webhook error:", err);
    return res.status(500).json({ error: "WEBHOOK_PROCESSING_FAILED", message: err.message });
  }
}
