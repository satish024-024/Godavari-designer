import { getUserFromAuthHeader } from "../lib/supabase.js";
import { config } from "../lib/config.js";

const baseUrl = config.supabase.url.replace(/\/$/, "");
const authHeaderKey = config.supabase.serviceRoleKey || config.supabase.anonKey;

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
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "Sign in required to view purchase history" });
    }

    const url = new URL(req.url, "http://localhost");
    const isScopeAdmin = url.searchParams.get("scope") === "admin";
    let isAdmin = false;

    if (isScopeAdmin) {
      try {
        const profileRes = await fetch(`${baseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=role`, {
          headers: {
            "apikey": config.supabase.anonKey,
            "Authorization": `Bearer ${authHeaderKey}`
          }
        });
        const profiles = await profileRes.json();
        if (Array.isArray(profiles) && profiles.length > 0 && profiles[0].role === 'admin') {
          isAdmin = true;
        }
      } catch (_) {}
    }

    const filterParam = isAdmin && isScopeAdmin ? "" : `&user_id=eq.${encodeURIComponent(user.id)}`;
    const purchasesRes = await fetch(`${baseUrl}/rest/v1/purchases?order=created_at.desc${filterParam}&select=id,user_id,product_id,amount,currency,status,razorpay_order_id,razorpay_payment_id,payment_method,customer_email,customer_phone,created_at,paid_at`, {
      headers: {
        "apikey": config.supabase.anonKey,
        "Authorization": `Bearer ${authHeaderKey}`
      }
    });

    const purchases = await purchasesRes.json();
    if (!Array.isArray(purchases)) {
      return res.status(200).json({ purchases: [] });
    }

    // Fetch product details for each purchase
    const productIds = [...new Set(purchases.map(p => p.product_id).filter(Boolean))];
    let productsMap = {};
    if (productIds.length > 0) {
      const prodRes = await fetch(`${baseUrl}/rest/v1/products?id=in.(${productIds.join(",")})&select=id,code,title,price,image`, {
        headers: {
          "apikey": config.supabase.anonKey,
          "Authorization": `Bearer ${authHeaderKey}`
        }
      });
      const prods = await prodRes.json();
      if (Array.isArray(prods)) {
        prods.forEach(p => { productsMap[p.id] = p; });
      }
    }

    const items = purchases.map(p => ({
      ...p,
      product: productsMap[p.product_id] || null
    }));

    return res.status(200).json({ purchases: items });
  } catch (err) {
    console.error("api/purchases/index error:", err);
    return res.status(500).json({ error: "PURCHASES_FETCH_FAILED", message: err.message });
  }
}
