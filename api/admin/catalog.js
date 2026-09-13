import { config } from "../../lib/config.js";

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || "6l7i886u";
const SANITY_DATASET = process.env.SANITY_DATASET || "production";
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN || "skDAzeqHxaxXUpIZqUtJ2UKbH4uv10L0rzlcPja2b2JaisuJPK4fQp1E4MqWi1wKKA48d1MfwfhzqgEnr3IQfzZVr1vPpIRpsyieEXXIgTP20I7aojIkTwXzs38pTm2h8ebITzV7R6hKukonkOa5s3GTLQsWcs3meS6yWDMocllpPSb2WS9L";

async function uploadToSanityAsset(buffer, assetType, filename, contentType) {
  const cleanFilename = encodeURIComponent(filename || ("asset_" + Date.now()));
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-08-01/assets/${assetType}/${SANITY_DATASET}?filename=${cleanFilename}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SANITY_API_TOKEN}`,
      "Content-Type": contentType || "application/octet-stream"
    },
    body: buffer
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Sanity asset upload failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.document;
}

async function mutateSanityDoc(doc) {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-08-01/data/mutate/${SANITY_DATASET}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SANITY_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ mutations: [{ create: doc }] })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Sanity document creation failed (${res.status}): ${errText}`);
  }

  return await res.json();
}

async function mirrorToSupabase({ title, code, slug, price, categoryName, imageUrl, galleryUrls, fileUrl, rawFileName }) {
  const supabaseUrl = config.supabase.url.replace(/\/$/, "");
  const serviceKey = config.supabase.serviceRoleKey || config.supabase.anonKey;
  if (!serviceKey) return null;

  try {
    let categoryId = null;
    const catRes = await fetch(`${supabaseUrl}/rest/v1/categories?select=id,name`, {
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`
      }
    });

    if (catRes.ok) {
      const cats = await catRes.json();
      const match = cats.find(c => (c.name || "").toLowerCase() === (categoryName || "").toLowerCase());
      if (match) {
        categoryId = match.id;
      } else if (cats.length > 0) {
        categoryId = cats[0].id;
      }
    }

    if (!categoryId) {
      const createCatRes = await fetch(`${supabaseUrl}/rest/v1/categories`, {
        method: "POST",
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          name: categoryName || "Blouse Designs",
          slug: (categoryName || "blouse-designs").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: "Premium handcrafted embroidery patterns."
        })
      });
      if (createCatRes.ok) {
        const createdCat = await createCatRes.json();
        categoryId = createdCat[0]?.id;
      }
    }

    const formats = [
      { format: "DST", price: Number(price) || 45, machineBrand: "Tajima", machineModel: "TMEZ-SC", hoopSize: "200x200mm" },
      { format: "PES", price: Number(price) || 45, machineBrand: "Brother", machineModel: "PR1055X", hoopSize: "200x200mm" }
    ];

    const prodPayload = {
      title,
      code,
      slug,
      price: Number(price) || 45,
      category_id: categoryId,
      description: `Authentic designer digitized embroidery pattern: ${title}. High-density stitch work ready for multi-head production.`,
      image: imageUrl,
      gallery: galleryUrls && galleryUrls.length > 0 ? galleryUrls : [imageUrl],
      design_file: fileUrl || null,
      width: 100,
      height: 100,
      back_stitch_count: 14500,
      hand_stitch_count: 9500,
      total_stitch_count: 24000,
      rpm: 850,
      estimated_time: 28,
      thread_colors: 4,
      difficulty_level: "Intermediate",
      recommended_fabrics: ["Silk", "Organza", "Velvet", "Raw Silk"],
      formats,
      featured: true,
      best_seller: true,
      tags: [categoryName, "Embroidery", "Designer", "Sanity"].filter(Boolean)
    };

    const prodRes = await fetch(`${supabaseUrl}/rest/v1/products`, {
      method: "POST",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(prodPayload)
    });

    if (prodRes.ok) {
      const prodData = await prodRes.json();
      return prodData[0] || null;
    }
  } catch (err) {
    console.warn("Notice: Failed to mirror Sanity product into Supabase:", err.message);
  }
  return null;
}

async function handleSanityPublish(body, res) {
  const { title, category, price, image, extraImages, machineFile } = body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "TITLE_REQUIRED", message: "Design title or file name is required." });
  }
  if (!image || !image.base64) {
    return res.status(400).json({ error: "IMAGE_REQUIRED", message: "Please select a design cover image." });
  }

  const cleanTitle = title.trim();
  const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "-" + Date.now().toString(36);
  const code = "GD-" + Math.floor(1000 + Math.random() * 9000);

  // 1. Upload Cover Image to Sanity
  const imgBuffer = Buffer.from(image.base64, "base64");
  const imgAsset = await uploadToSanityAsset(
    imgBuffer,
    "images",
    image.filename || `${slug}-cover.jpg`,
    image.contentType || "image/jpeg"
  );

  // 2. Upload Machine File if attached
  let machineAsset = null;
  if (machineFile && machineFile.base64) {
    const fileBuffer = Buffer.from(machineFile.base64, "base64");
    machineAsset = await uploadToSanityAsset(
      fileBuffer,
      "files",
      machineFile.filename || `${slug}-design.dst`,
      machineFile.contentType || "application/octet-stream"
    );
  }

  // 3. Create Sanity Product Document
  const doc = {
    _type: "product",
    title: cleanTitle,
    code,
    slug: { _type: "slug", current: slug },
    price: Number(price) || 45,
    category: category || "Blouse Designs",
    image: {
      _type: "image",
      asset: { _type: "reference", _ref: imgAsset._id }
    },
    description: `Handcrafted luxury embroidery design: ${cleanTitle}. Production-ready for commercial embroidery machines.`
  };

  if (machineAsset) {
    doc.designFile = {
      _type: "file",
      asset: { _type: "reference", _ref: machineAsset._id }
    };
    doc.designFileName = machineFile.filename || "design.dst";
  }

  const sanityResult = await mutateSanityDoc(doc);

  // 4. Mirror to Supabase Catalog for Instant Storefront Display
  const mirroredProduct = await mirrorToSupabase({
    title: cleanTitle,
    code,
    slug,
    price,
    categoryName: category || "Blouse Designs",
    imageUrl: imgAsset.url,
    galleryUrls: [imgAsset.url],
    fileUrl: machineAsset ? machineAsset.url : null,
    rawFileName: machineFile ? machineFile.filename : null
  });

  return res.status(200).json({
    success: true,
    sanityId: sanityResult.results?.[0]?.id,
    product: {
      id: mirroredProduct?.id || sanityResult.results?.[0]?.id,
      title: cleanTitle,
      code,
      slug,
      price: Number(price) || 45,
      category: category || "Blouse Designs",
      image: imgAsset.url,
      machineFileUrl: machineAsset ? machineAsset.url : null
    }
  });
}

/**
 * Server-side Admin Catalog Management Endpoint
 * Performs product, category, and collection create/update/delete operations
 * and Sanity publishing using SUPABASE_SERVICE_ROLE_KEY to bypass client-side RLS failures.
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

    // Check if this is a Sanity Publish request
    if (body.action === "sanity-publish" || (!body.action && body.title && body.image)) {
      return await handleSanityPublish(body, res);
    }

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
