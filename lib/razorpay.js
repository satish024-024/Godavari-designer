import crypto from "crypto";
import { config, isRazorpayConfigured, assertProductionSafety } from "./config.js";
import { verifyHmacSha256 } from "./crypto.js";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

function getBasicAuthHeader() {
  const token = Buffer.from(`${config.razorpay.keyId}:${config.razorpay.keySecret}`).toString("base64");
  return `Basic ${token}`;
}

/**
 * Create Razorpay Order with authoritative amount in paise and payment_capture: 1
 */
export async function createRazorpayOrder({ amount, currency = "INR", receipt, notes = {} }) {
  assertProductionSafety();

  const amountInPaise = Math.round(Number(amount) * 100);

  // Development mock mode fallback (ONLY active when explicitly enabled in dev)
  const isPlaceholderKey = config.razorpay.keyId.includes("GodavariTestKey") || config.razorpay.keyId.includes("TestKey");
  if (!isRazorpayConfigured() || (isPlaceholderKey && config.allowDevMock)) {
    if (config.allowDevMock) {
      return {
        id: `MOCK_ORD_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
        entity: "order",
        amount: amountInPaise,
        currency,
        receipt,
        status: "created",
        notes
      };
    }
    const err = new Error("Razorpay credentials are not configured.");
    err.statusCode = 503;
    throw err;
  }

  const res = await fetch(`${RAZORPAY_API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Authorization": getBasicAuthHeader(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency,
      receipt: receipt ? String(receipt).slice(0, 40) : undefined,
      payment_capture: 1, // CRITICAL: Enforce automatic payment capture
      notes
    })
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    if (res.status === 401 && config.allowDevMock && !config.isProduction) {
      console.warn("⚠️ Razorpay API key rejected (401) in dev environment. Falling back to development mock order.");
      return {
        id: `MOCK_ORD_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
        entity: "order",
        amount: amountInPaise,
        currency,
        receipt,
        status: "created",
        notes
      };
    }
    const err = new Error(`Razorpay Order creation failed (${res.status}): ${errorBody}`);
    err.status = res.status;
    err.body = errorBody;
    throw err;
  }

  return await res.json();
}

const mockPaymentStore = new Map();

export function setMockPayment(paymentId, paymentData) {
  mockPaymentStore.set(paymentId, paymentData);
}

/**
 * Fetch Payment details from Razorpay Payments API
 */
export async function fetchRazorpayPayment(paymentId) {
  assertProductionSafety();

  if (mockPaymentStore.has(paymentId)) {
    return mockPaymentStore.get(paymentId);
  }

  if (String(paymentId).startsWith("MOCK_PAY_")) {
    if (config.allowDevMock) {
      const isAuthOnly = paymentId.includes("AUTH");
      return {
        id: paymentId,
        entity: "payment",
        amount: 6500,
        currency: "INR",
        status: isAuthOnly ? "authorized" : "captured",
        order_id: `MOCK_ORD_${paymentId.slice(9)}`,
        method: "upi",
        captured: !isAuthOnly
      };
    }
    const err = new Error("Mock payments are strictly rejected in production.");
    err.statusCode = 400;
    throw err;
  }

  const res = await fetch(`${RAZORPAY_API_BASE}/payments/${encodeURIComponent(paymentId)}`, {
    headers: {
      "Authorization": getBasicAuthHeader()
    }
  });

  if (!res.ok) {
    if (res.status === 401 && config.allowDevMock && !config.isProduction) {
      console.warn("⚠️ Razorpay API key rejected (401) on fetchPayment in dev. Falling back to mock captured payment.");
      return {
        id: paymentId,
        entity: "payment",
        amount: 6500,
        currency: "INR",
        status: "captured",
        order_id: `order_dev_${Date.now()}`,
        method: "upi",
        captured: true
      };
    }
    const errorBody = await res.text().catch(() => "");
    const err = new Error(`Failed to fetch Razorpay payment ${paymentId} (${res.status}): ${errorBody}`);
    err.status = res.status;
    throw err;
  }

  return await res.json();
}

/**
 * Fetch Order details from Razorpay Orders API
 */
export async function fetchRazorpayOrder(orderId) {
  assertProductionSafety();

  if (String(orderId).startsWith("MOCK_ORD_")) {
    if (config.allowDevMock) {
      return {
        id: orderId,
        entity: "order",
        amount: 6500,
        currency: "INR",
        status: "paid",
        attempts: 1
      };
    }
    const err = new Error("Mock orders are strictly rejected in production.");
    err.statusCode = 400;
    throw err;
  }

  const res = await fetch(`${RAZORPAY_API_BASE}/orders/${encodeURIComponent(orderId)}`, {
    headers: {
      "Authorization": getBasicAuthHeader()
    }
  });

  if (!res.ok) {
    if (res.status === 401 && config.allowDevMock && !config.isProduction) {
      console.warn("⚠️ Razorpay API key rejected (401) on fetchOrder in dev. Falling back to mock paid order.");
      return {
        id: orderId,
        entity: "order",
        amount: 6500,
        currency: "INR",
        status: "paid",
        attempts: 1
      };
    }
    const errorBody = await res.text().catch(() => "");
    const err = new Error(`Failed to fetch Razorpay order ${orderId} (${res.status}): ${errorBody}`);
    err.status = res.status;
    throw err;
  }

  return await res.json();
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (String(razorpayOrderId).startsWith("MOCK_ORD_")) {
    if (config.allowDevMock) {
      if (razorpaySignature === "MOCK_SIGNATURE_OK") return true;
      if (config.razorpay.keySecret) {
        const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
        return verifyHmacSha256(payload, razorpaySignature, config.razorpay.keySecret);
      }
    }
    return false;
  }

  if (!config.razorpay.keySecret) {
    return false;
  }

  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  return verifyHmacSha256(payload, razorpaySignature, config.razorpay.keySecret);
}

/**
 * Verify Razorpay webhook signature against raw request body
 */
export function verifyRazorpayWebhookSignature(rawBody, signature) {
  if (!config.razorpay.webhookSecret) {
    return false;
  }
  return verifyHmacSha256(rawBody, signature, config.razorpay.webhookSecret);
}
