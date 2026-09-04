import { getPurchaseByOrderId, getPurchaseById, activatePurchaseEntitlement, getUserFromAuthHeader } from "../../lib/supabase.js";
import { fetchRazorpayPayment, fetchRazorpayOrder } from "../../lib/razorpay.js";
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
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const email = body.email;
    const orderReference = body.orderReference || body.orderId || null;
    const category = body.category || body.issueType || "Payment Issue";
    const description = body.description || body.message || "";
    const paymentId = body.paymentId || null;

    if (!email || !description) {
      return res.status(400).json({ error: "MISSING_FIELDS", message: "Email and issue description are required" });
    }

    const user = await getUserFromAuthHeader(req);

    let purchase = null;
    if (orderReference) {
      purchase = await getPurchaseByOrderId(orderReference);
      if (!purchase) {
        purchase = await getPurchaseById(orderReference);
      }
    }

    let autoResolved = false;
    let diagnosis = {
      orderReference: orderReference || null,
      paymentId: paymentId || null,
      checkedAt: new Date().toISOString()
    };

    // Auto-reconciliation check for "Money debited but not unlocked"
    if (purchase && (category.toLowerCase().includes("debited") || category.toLowerCase().includes("pending") || category === "Payment Issue")) {
      if (purchase.status === "PAID") {
        autoResolved = true;
        diagnosis.status = "ALREADY_PAID";
      } else if (purchase.razorpay_order_id) {
        try {
          // Check order and payments via Razorpay API
          const rzpOrder = await fetchRazorpayOrder(purchase.razorpay_order_id);
          diagnosis.razorpayOrderStatus = rzpOrder?.status;

          const pId = paymentId || purchase.razorpay_payment_id;
          if (pId) {
            const rzpPayment = await fetchRazorpayPayment(pId);
            diagnosis.razorpayPaymentStatus = rzpPayment?.status;

            if (rzpPayment?.status === "captured") {
              // Atomically activate purchase
              const activation = await activatePurchaseEntitlement({
                razorpayOrderId: purchase.razorpay_order_id,
                razorpayPaymentId: pId,
                paymentMethod: rzpPayment.method || "card"
              });

              if (activation && activation.success) {
                autoResolved = true;
                diagnosis.status = "AUTO_ACTIVATED_ON_SUPPORT_CHECK";
                purchase.status = "PAID";
              }
            }
          }
        } catch (e) {
          diagnosis.reconciliationError = e.message;
        }
      }
    }

    // Persist ticket to database
    let ticketId = `TKT-${Date.now().toString().slice(-8)}`;
    try {
      const ticketRes = await fetch(`${baseUrl}/rest/v1/payment_support_tickets`, {
        method: "POST",
        headers: {
          "apikey": config.supabase.anonKey,
          "Authorization": `Bearer ${authHeaderKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          user_id: user ? user.id : null,
          purchase_id: purchase ? purchase.id : null,
          order_reference: orderReference || null,
          email: email.trim().toLowerCase(),
          category: category || "General Payment Support",
          description: description.trim(),
          status: autoResolved ? "RESOLVED" : "IN_REVIEW",
          diagnosis,
          admin_notes: autoResolved ? "Automatically resolved via gateway verification." : null
        })
      });
      const ticketRows = await ticketRes.json().catch(() => []);
      if (Array.isArray(ticketRows) && ticketRows.length > 0 && ticketRows[0].id) {
        ticketId = ticketRows[0].id;
      }
    } catch (_) {}

    return res.status(200).json({
      success: true,
      ticketId,
      autoResolved,
      purchaseId: purchase ? purchase.id : null,
      productId: purchase ? purchase.product_id : null,
      purchaseStatus: purchase ? purchase.status : null,
      message: autoResolved
        ? "Payment successfully verified with the gateway! Your embroidery design has been unlocked."
        : "Your ticket has been received by our engineering support team. If money was debited by your bank, it will be automatically reconciled or resolved shortly."
    });
  } catch (err) {
    console.error("api/support/payment error:", err);
    return res.status(500).json({ error: "SUPPORT_SUBMIT_FAILED", message: err.message });
  }
}
