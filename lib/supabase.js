import { config } from "./config.js";

const baseUrl = config.supabase.url.replace(/\/$/, "");
const authHeaderKey = config.supabase.serviceRoleKey || config.supabase.anonKey;

async function supabaseFetch(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    "apikey": config.supabase.anonKey,
    "Authorization": `Bearer ${authHeaderKey}`,
    "Content-Type": "application/json",
    ...options.headers
  };

  const res = await fetch(url, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    const err = new Error(`Supabase API error (${res.status}): ${errorBody}`);
    err.status = res.status;
    err.body = errorBody;
    throw err;
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }
  return await res.text();
}

/**
 * Fetch product by ID with authoritative database price
 */
export async function getProductById(productId) {
  if (!productId) return null;
  const rows = await supabaseFetch(`/rest/v1/products?id=eq.${encodeURIComponent(productId)}&select=id,code,title,price,slug,width,height,total_stitch_count,thread_colors,image,description`);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

/**
 * Fetch purchase by Razorpay Order ID
 */
export async function getPurchaseByOrderId(orderId) {
  if (!orderId) return null;
  const rows = await supabaseFetch(`/rest/v1/purchases?razorpay_order_id=eq.${encodeURIComponent(orderId)}&select=*`);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

/**
 * Fetch purchase by internal Purchase ID
 */
export async function getPurchaseById(purchaseId) {
  if (!purchaseId) return null;
  const rows = await supabaseFetch(`/rest/v1/purchases?id=eq.${encodeURIComponent(purchaseId)}&select=*`);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

/**
 * 15-Minute Order Reuse Strategy
 * Looks for an active purchase in 'CREATED' status less than 15 minutes old
 */
export async function getRecentPendingPurchase({ productId, userId = null, guestSessionId = null }) {
  if (!productId) return null;
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  
  let query = `/rest/v1/purchases?product_id=eq.${encodeURIComponent(productId)}&status=eq.CREATED&created_at=gte.${encodeURIComponent(fifteenMinutesAgo)}&order=created_at.desc&limit=1`;
  if (userId) {
    query += `&user_id=eq.${encodeURIComponent(userId)}`;
  } else if (guestSessionId) {
    query += `&guest_session_id=eq.${encodeURIComponent(guestSessionId)}`;
  } else {
    return null;
  }

  const rows = await supabaseFetch(query);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

/**
 * Create a new internal purchase record
 */
export async function createPurchase(purchaseData) {
  const rows = await supabaseFetch(`/rest/v1/purchases`, {
    method: "POST",
    headers: { "Prefer": "return=representation" },
    body: JSON.stringify(purchaseData)
  });
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : rows;
}

/**
 * Update purchase record
 */
export async function updatePurchase(purchaseId, updateData) {
  const rows = await supabaseFetch(`/rest/v1/purchases?id=eq.${encodeURIComponent(purchaseId)}`, {
    method: "PATCH",
    headers: { "Prefer": "return=representation" },
    body: JSON.stringify({
      ...updateData,
      updated_at: new Date().toISOString()
    })
  });
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : rows;
}

/**
 * Atomically activate purchase and entitlement via database RPC
 */
export async function activatePurchaseEntitlement({ razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod, guestTokenHash = null }) {
  const result = await supabaseFetch(`/rest/v1/rpc/activate_purchase_entitlement`, {
    method: "POST",
    body: JSON.stringify({
      p_razorpay_order_id: razorpayOrderId,
      p_razorpay_payment_id: razorpayPaymentId,
      p_razorpay_signature: razorpaySignature,
      p_payment_method: paymentMethod,
      p_guest_token_hash: guestTokenHash
    })
  });
  return result;
}

/**
 * Check if an active entitlement already exists
 */
export async function checkActiveEntitlement({ productId, userId = null, guestTokenHash = null }) {
  if (!productId) return false;

  if (userId) {
    const rows = await supabaseFetch(`/rest/v1/entitlements?product_id=eq.${encodeURIComponent(productId)}&user_id=eq.${encodeURIComponent(userId)}&status=eq.ACTIVE&limit=1`);
    if (Array.isArray(rows) && rows.length > 0) return rows[0];
  }

  if (guestTokenHash) {
    // Find purchase with this guest token hash, then check its entitlement
    const purchases = await supabaseFetch(`/rest/v1/purchases?guest_token_hash=eq.${encodeURIComponent(guestTokenHash)}&product_id=eq.${encodeURIComponent(productId)}&status=eq.PAID&limit=1`);
    if (Array.isArray(purchases) && purchases.length > 0) {
      const pId = purchases[0].id;
      const entitlements = await supabaseFetch(`/rest/v1/entitlements?purchase_id=eq.${encodeURIComponent(pId)}&status=eq.ACTIVE&limit=1`);
      if (Array.isArray(entitlements) && entitlements.length > 0) return entitlements[0];
    }
  }

  return null;
}

/**
 * Atomically increment download count
 */
export async function atomicIncrementDownloadCount(entitlementId) {
  if (!entitlementId) return;
  try {
    await supabaseFetch(`/rest/v1/rpc/atomic_increment_download_count`, {
      method: "POST",
      body: JSON.stringify({ p_entitlement_id: entitlementId })
    });
  } catch (err) {
    console.error("atomicIncrementDownloadCount error:", err);
  }
}

/**
 * Idempotently record webhook event
 */
export async function recordWebhookEvent({ eventId, eventType, razorpayOrderId, razorpayPaymentId, payload, status = "RECEIVED", errorMessage = null }) {
  try {
    // Check if event already exists
    const existing = await supabaseFetch(`/rest/v1/payment_webhooks?event_id=eq.${encodeURIComponent(eventId)}&select=id,status`);
    if (Array.isArray(existing) && existing.length > 0) {
      return { isDuplicate: true, event: existing[0] };
    }

    const inserted = await supabaseFetch(`/rest/v1/payment_webhooks`, {
      method: "POST",
      headers: { "Prefer": "return=representation" },
      body: JSON.stringify({
        event_id: eventId,
        event_type: eventType,
        razorpay_order_id: razorpayOrderId || null,
        razorpay_payment_id: razorpayPaymentId || null,
        payload: payload || {},
        status,
        error_message: errorMessage
      })
    });
    return { isDuplicate: false, event: Array.isArray(inserted) ? inserted[0] : inserted };
  } catch (err) {
    console.error("recordWebhookEvent error:", err);
    return { isDuplicate: false, error: err.message };
  }
}

/**
 * Authenticate current user from Request Authorization header
 */
export async function getUserFromAuthHeader(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  try {
    const res = await fetch(`${baseUrl}/auth/v1/user`, {
      headers: {
        "apikey": config.supabase.anonKey,
        "Authorization": `Bearer ${token}`
      }
    });
    if (res.ok) {
      const user = await res.json();
      return user && user.id ? user : null;
    }
  } catch (e) {
    // Session token invalid or expired
  }
  return null;
}
