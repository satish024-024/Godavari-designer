import { config } from "../../lib/config.js";

/**
 * Server-side Admin Catalog Management Endpoint
 * Performs product, category, and collection create/update/delete operations
 * using SUPABASE_SERVICE_ROLE_KEY to bypass client-side RLS failures.
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED", message: "Only POST requests are supported" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { action, entity = "product", id, data } = body;

    if (!action) {
      return res.status(400).json({ error: "MISSING_ACTION", message: "action (create, update, delete) is required" });
    }

    const table = entity === "category" ? "categories" : entity === "collection" ? "collections" : "products";
    const supabaseUrl = config.supabase.url.replace(/\/$/, "");
    const serviceKey = config.supabase.serviceRoleKey || config.supabase.anonKey;

    let endpoint = `${supabaseUrl}/rest/v1/${table}`;
    let method = "POST";
    let prefer = "return=representation";
    let payload = data;

    // Apply database schema defaults and sanitization for products
    if (entity === "product" && payload) {
      payload = {
        ...payload,
        description: (payload.description || "").trim() || "Premium machine-ready embroidery design.",
        width: parseInt(payload.width || 100, 10) || 100,
        height: parseInt(payload.height || 100, 10) || 100,
        back_stitch_count: parseInt(payload.back_stitch_count || 0, 10) || 0,
        hand_stitch_count: parseInt(payload.hand_stitch_count || 0, 10) || 0,
        total_stitch_count: parseInt(payload.total_stitch_count || 0, 10) || 0,
        rpm: parseInt(payload.rpm || 850, 10) || 850,
        estimated_time: parseInt(payload.estimated_time || 0, 10) || 0,
        thread_colors: parseInt(payload.thread_colors || 0, 10) || 0,
        formats: Array.isArray(payload.formats) ? payload.formats : [],
        tags: Array.isArray(payload.tags) ? payload.tags : [],
        recommended_fabrics: Array.isArray(payload.recommended_fabrics) ? payload.recommended_fabrics : ["Silk", "Velvet", "Cotton"],
        gallery: Array.isArray(payload.gallery) && payload.gallery.length > 0 ? payload.gallery : (payload.image ? [payload.image] : []),
        featured: Boolean(payload.featured),
        best_seller: Boolean(payload.best_seller)
      };
    }

    if (action === "create") {
      method = "POST";
    } else if (action === "update") {
      if (!id) return res.status(400).json({ error: "MISSING_ID", message: "id is required for update" });
      method = "PATCH";
      endpoint += `?id=eq.${encodeURIComponent(id)}`;
    } else if (action === "delete") {
      if (!id) return res.status(400).json({ error: "MISSING_ID", message: "id is required for delete" });
      method = "DELETE";
      endpoint += `?id=eq.${encodeURIComponent(id)}`;
      payload = null;
    } else {
      return res.status(400).json({ error: "INVALID_ACTION", message: `Unsupported action: ${action}` });
    }

    const headers = {
      "Authorization": `Bearer ${serviceKey}`,
      "apikey": serviceKey,
      "Content-Type": "application/json",
      "Prefer": prefer
    };

    const dbRes = await fetch(endpoint, {
      method,
      headers,
      body: payload ? JSON.stringify(payload) : undefined
    });

    if (!dbRes.ok) {
      const errorText = await dbRes.text().catch(() => "");
      console.error(`Catalog DB error (${dbRes.status}):`, errorText);
      return res.status(dbRes.status || 500).json({
        error: "DATABASE_ERROR",
        message: `Database mutation failed: ${errorText}`
      });
    }

    const contentType = dbRes.headers.get("content-type");
    let result = null;
    if (contentType && contentType.includes("application/json")) {
      result = await dbRes.json();
    } else {
      result = await dbRes.text();
    }

    return res.status(200).json({
      success: true,
      action,
      entity,
      data: Array.isArray(result) && result.length === 1 ? result[0] : result
    });

  } catch (err) {
    console.error("Admin catalog handler error:", err);
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: err.message || "Failed to execute catalog action"
    });
  }
}
