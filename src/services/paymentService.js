/**
 * Godavari Designers - Production Payment Service
 * Manages Razorpay Standard Checkout, lifecycle states, and server verification.
 */

import { site, currentUser, showToast, triggerRender } from "./store.js";
import { supabase } from "./supabase.js";

// Explicit Payment Lifecycle States
export const PaymentState = {
  IDLE: "IDLE",
  CREATING_ORDER: "CREATING_ORDER",
  OPENING_CHECKOUT: "OPENING_CHECKOUT",
  PAYMENT_PROCESSING: "PAYMENT_PROCESSING",
  VERIFYING: "VERIFYING",
  SUCCESS: "SUCCESS",
  PENDING: "PENDING",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  ALREADY_PURCHASED: "ALREADY_PURCHASED"
};

export const paymentContext = {
  state: PaymentState.IDLE,
  productId: null,
  product: null,
  purchaseId: null,
  orderId: null,
  paymentId: null,
  amount: 0,
  currency: "INR",
  error: null,
  guestToken: null,
  isPreCheckoutOpen: false
};

let razorpayScriptLoaded = false;
let razorpayScriptPromise = null;

/**
 * Dynamically load official Razorpay Checkout SDK
 */
export function loadRazorpayScript() {
  if (razorpayScriptLoaded && window.Razorpay) {
    return Promise.resolve(true);
  }
  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve, reject) => {
    // Check if script already in DOM
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing && window.Razorpay) {
      razorpayScriptLoaded = true;
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      razorpayScriptLoaded = true;
      resolve(true);
    };
    script.onerror = () => {
      razorpayScriptPromise = null;
      reject(new Error("Failed to load secure Razorpay checkout script. Please check your internet connection."));
    };
    document.head.appendChild(script);
  });

  return razorpayScriptPromise;
}

/**
 * Open Pre-Checkout Modal (Product context & Pay button)
 */
export function openPreCheckout(product) {
  if (!product) return;
  if (!currentUser) {
    sessionStorage.setItem("godavari_pending_buy_now", JSON.stringify({
      productId: product.id,
      returnUrl: window.location.hash || ""
    }));
    showToast("Please sign in or register to purchase designs.");
    window.location.hash = "#/auth";
    return;
  }
  paymentContext.product = product;
  paymentContext.productId = product.id;
  paymentContext.amount = Number(product.price);
  paymentContext.state = PaymentState.IDLE;
  paymentContext.error = null;
  paymentContext.isPreCheckoutOpen = true;
  triggerRender();
}

/**
 * Close Pre-Checkout Modal
 */
export function closePreCheckout() {
  paymentContext.isPreCheckoutOpen = false;
  if (paymentContext.state === PaymentState.IDLE || paymentContext.state === PaymentState.CANCELLED) {
    paymentContext.state = PaymentState.IDLE;
  }
  triggerRender();
}

/**
 * Helper to get active Supabase JWT token
 */
async function getAuthToken() {
  try {
    const sessionRes = await supabase.auth.getSession();
    return sessionRes?.data?.session?.access_token || null;
  } catch (e) {
    return null;
  }
}

/**
 * Guest session ID generator / getter (stored in sessionStorage)
 */
function getGuestSessionId() {
  let gid = sessionStorage.getItem("gd_guest_session_id");
  if (!gid) {
    gid = "guest_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    sessionStorage.setItem("gd_guest_session_id", gid);
  }
  return gid;
}

/**
 * Initiates the real Razorpay standard checkout flow
 */
export async function initiatePayment(productId) {
  if (!productId) {
    showToast("Invalid design selection");
    return;
  }

  if (!currentUser) {
    sessionStorage.setItem("godavari_pending_buy_now", JSON.stringify({
      productId,
      returnUrl: window.location.hash || ""
    }));
    showToast("Please sign in or register to purchase designs.");
    window.location.hash = "#/auth";
    return;
  }

  // Prevent duplicate concurrent clicks
  if (
    paymentContext.state === PaymentState.CREATING_ORDER ||
    paymentContext.state === PaymentState.OPENING_CHECKOUT ||
    paymentContext.state === PaymentState.VERIFYING
  ) {
    console.warn("Payment request already in progress. Ignoring duplicate click.");
    return;
  }

  try {
    paymentContext.state = PaymentState.CREATING_ORDER;
    paymentContext.productId = productId;
    paymentContext.error = null;
    triggerRender();

    const token = await getAuthToken();
    const guestSessionId = getGuestSessionId();

    const headers = {
      "Content-Type": "application/json",
      "X-Guest-Session-ID": guestSessionId
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Call server to create or reuse order (Strictly passes ONLY productId)
    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers,
      body: JSON.stringify({ productId })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to create secure checkout order");
    }

    // Already owned check
    if (data.alreadyPurchased) {
      paymentContext.state = PaymentState.ALREADY_PURCHASED;
      paymentContext.isPreCheckoutOpen = false;
      showToast("✓ You already own this design!");
      triggerRender();
      return;
    }

    paymentContext.purchaseId = data.purchaseId;
    paymentContext.orderId = data.orderId;
    paymentContext.amount = data.amount;
    paymentContext.currency = data.currency || "INR";
    if (data.product) {
      paymentContext.product = data.product;
    }

    // Pre-load Razorpay SDK
    paymentContext.state = PaymentState.OPENING_CHECKOUT;
    triggerRender();

    await loadRazorpayScript();

    // Close pre-checkout modal before launching Razorpay Standard Checkout
    paymentContext.isPreCheckoutOpen = false;
    triggerRender();

    // Launch official Razorpay Standard Checkout
    const cleanPhone = (currentUser?.phone || "").replace(/\D/g, '').slice(-10);
    const options = {
      key: data.keyId,
      amount: Math.round(data.amount * 100),
      currency: data.currency || "INR",
      name: "Godavari Designers",
      description: "Commercial DST & PES Machine Files",
      image: "/logo.jpeg",
      order_id: data.orderId,
      prefill: {
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        contact: cleanPhone ? `+91${cleanPhone}` : ""
      },
      notes: {
        purchase_id: data.purchaseId,
        product_title: data.product?.title || "Embroidery Design"
      },
      theme: {
        color: "#111d42",
        backdrop_color: "rgba(17, 29, 66, 0.65)"
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: "UPI / PhonePe / Google Pay / QR Scanner",
              instruments: [
                {
                  method: "upi"
                }
              ]
            },
            other: {
              name: "Cards / Netbanking / Wallets",
              instruments: [
                {
                  method: "card"
                },
                {
                  method: "netbanking"
                },
                {
                  method: "wallet"
                }
              ]
            }
          },
          sequence: ["block.upi", "block.other"],
          preferences: {
            show_default_blocks: true
          }
        }
      },
      modal: {
        confirm_close: true,
        ondismiss: function () {
          console.log("Customer dismissed Razorpay Checkout modal.");
          paymentContext.state = PaymentState.CANCELLED;
          window.location.hash = `#/payment/cancelled?purchaseId=${encodeURIComponent(data.purchaseId)}&productId=${encodeURIComponent(productId)}`;
          triggerRender();
        }
      },
      handler: async function (response) {
        // Customer paid successfully at the gateway!
        console.log("Razorpay Checkout success handler fired:", response.razorpay_payment_id);
        
        paymentContext.paymentId = response.razorpay_payment_id;
        paymentContext.state = PaymentState.PAYMENT_PROCESSING;
        
        // Immediately navigate to secure processing page
        window.location.hash = `#/payment/processing?purchaseId=${encodeURIComponent(data.purchaseId)}&orderId=${encodeURIComponent(response.razorpay_order_id)}`;
        
        // Submit server verification
        await verifyPaymentOnServer({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
          purchaseId: data.purchaseId
        });
      }
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      console.error("Razorpay payment failed:", response.error);
      paymentContext.state = PaymentState.FAILED;
      paymentContext.error = response.error?.description || "Payment failed";
      window.location.hash = `#/payment/failed?purchaseId=${encodeURIComponent(data.purchaseId)}&productId=${encodeURIComponent(productId)}&reason=${encodeURIComponent(paymentContext.error)}`;
      triggerRender();
    });

    rzp.open();
  } catch (err) {
    console.error("initiatePayment error:", err);
    paymentContext.state = PaymentState.FAILED;
    paymentContext.error = err.message;
    showToast(err.message || "Failed to initialize payment");
    triggerRender();
  }
}

/**
 * Submit payment verification to backend
 */
export async function verifyPaymentOnServer({ razorpayPaymentId, razorpayOrderId, razorpaySignature, purchaseId }) {
  try {
    paymentContext.state = PaymentState.VERIFYING;
    triggerRender();

    const token = await getAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("/api/payments/verify", {
      method: "POST",
      headers,
      body: JSON.stringify({
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
        purchaseId
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Payment verification failed");
    }

    if (data.status === "PAID" && data.success) {
      paymentContext.state = PaymentState.SUCCESS;
      if (data.guestToken) {
        sessionStorage.setItem("gd_guest_token_" + data.productId, data.guestToken);
        paymentContext.guestToken = data.guestToken;
      }
      window.location.hash = `#/payment/success?purchaseId=${encodeURIComponent(purchaseId)}`;
      triggerRender();
      return;
    }

    if (data.status === "AUTHORIZED") {
      paymentContext.state = PaymentState.PENDING;
      window.location.hash = `#/payment/pending?purchaseId=${encodeURIComponent(purchaseId)}`;
      triggerRender();
      return;
    }

    throw new Error(data.message || "Unconfirmed payment state");
  } catch (err) {
    console.error("verifyPaymentOnServer error:", err);
    paymentContext.state = PaymentState.FAILED;
    paymentContext.error = err.message;
    window.location.hash = `#/payment/failed?purchaseId=${encodeURIComponent(purchaseId)}&reason=${encodeURIComponent(err.message)}`;
    triggerRender();
  }
}

/**
 * Fetch authoritative server status for a purchase
 */
export async function fetchServerPaymentStatus(purchaseId) {
  if (!purchaseId) return null;
  try {
    const token = await getAuthToken();
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`/api/payments/status?purchaseId=${encodeURIComponent(purchaseId)}`, { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

/**
 * Request secure single-use download grant for a product
 */
export async function requestDownloadGrant(productId, format = "DST") {
  const token = await getAuthToken();
  const guestToken = sessionStorage.getItem("gd_guest_token_" + productId) || paymentContext.guestToken;

  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (guestToken) headers["X-Guest-Token"] = guestToken;

  const res = await fetch("/api/downloads/request", {
    method: "POST",
    headers,
    body: JSON.stringify({ productId, format })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to generate download access grant");
  }

  return data;
}

/**
 * Trigger browser file download via secure grant
 */
export async function downloadDesignFile(productId, format = "DST") {
  try {
    showToast(`Preparing commercial .${format.toUpperCase()} machine file...`);
    const grantData = await requestDownloadGrant(productId, format);
    
    // Trigger download via temporary iframe / anchor
    const link = document.createElement("a");
    link.href = grantData.downloadUrl;
    link.setAttribute("download", `${grantData.productCode || "DESIGN"}_${format}.${format.toLowerCase()}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`✓ Downloading ${grantData.productCode || "Design"} (.${format.toUpperCase()})`);
  } catch (err) {
    console.error("downloadDesignFile error:", err);
    showToast(`Download error: ${err.message}`);
  }
}
