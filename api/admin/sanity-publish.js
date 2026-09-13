import "dotenv/config";

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || "6l7i886u";
const SANITY_DATASET = process.env.SANITY_DATASET || "production";
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN || "skDAzeqHxaxXUpIZqUtJ2UKbH4uv10L0rzlcPja2b2JaisuJPK4fQp1E4MqWi1wKKA48d1MfwfhzqgEnr3IQfzZVr1vPpIRpsyieEXXIgTP20I7aojIkTwXzs38pTm2h8ebITzV7R6hKukonkOa5s3GTLQsWcs3meS6yWDMocllpPSb2WS9L";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://xpqduepvrlhzsofxcukn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function uploadToSanityAsset(buffer, assetType, filename, contentType) {
  const cleanFilename = encodeURIComponent(filename || ("asset_" + Date.now()));
  const url = "https://" + SANITY_PROJECT_ID + ".api.sanity.io/v2023-08-01/assets/" + assetType + "/" + SANITY_DATASET + "?filename=" + cleanFilename;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + SANITY_API_TOKEN,
      "Content-Type": contentType || "application/octet-stream"
    },
    body: buffer
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error("Sanity asset upload failed (" + res.status + "): " + errText);
  }

  const data = await res.json();
  return data.document;
}

async function mutateSanityDoc(doc) {
  const url = "https://" + SANITY_PROJECT_ID + ".api.sanity.io/v2023-08-01/data/mutate/" + SANITY_DATASET;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + SANITY_API_TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ mutations: [{ create: doc }] })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error("Sanity document creation failed (" + res.status + "): " + errText);
  }

  return await res.json();
}

async function mirrorToSupabase({ title, code, slug, price, categoryName, imageUrl, galleryUrls, fileUrl, rawFileName }) {
  if (!SUPABASE_SERVICE_ROLE_KEY) return null;

  try {
    let categoryId = null;
    const catRes = await fetch(SUPABASE_URL + "/rest/v1/categories?select=id,name", {
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY
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
      const createCatRes = await fetch(SUPABASE_URL + "/rest/v1/categories", {
        method: "POST",
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
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
      description: "Authentic designer digitized embroidery pattern: " + title + ". High-density stitch work ready for multi-head production.",
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

    const prodRes = await fetch(SUPABASE_URL + "/rest/v1/products", {
      method: "POST",
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const body = req.body || {};
    const { title, category, price, image, extraImages, machineFile } = body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "TITLE_REQUIRED", message: "Design title or file name is required." });
    }
    if (!image || !image.base64) {
      return res.status(400).json({ error: "IMAGE_REQUIRED", message: "Please select a design cover image." });
    }

    const cleanTitle = title.trim();
    const cleanCategory = (category || "Blouse Designs").trim();
    const cleanPrice = Number(price) || 45;
    const code = "GD-" + Math.floor(1000 + Math.random() * 9000);
    const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + code.toLowerCase();

    console.log("Sanity API: Uploading primary image for:", cleanTitle);
    const primaryImgBuffer = Buffer.from(image.base64, "base64");
    const primaryImgDoc = await uploadToSanityAsset(
      primaryImgBuffer,
      "images",
      image.filename || (slug + "_cover.png"),
      image.contentType || "image/png"
    );
    const primaryImageUrl = primaryImgDoc.url;
    console.log("Sanity API: Primary image uploaded successfully. URL:", primaryImageUrl);

    const galleryDocs = [primaryImgDoc];
    const galleryUrls = [primaryImageUrl];

    if (Array.isArray(extraImages) && extraImages.length > 0) {
      for (let i = 0; i < extraImages.length; i++) {
        const extra = extraImages[i];
        if (extra && extra.base64) {
          const extraBuf = Buffer.from(extra.base64, "base64");
          const extraDoc = await uploadToSanityAsset(
            extraBuf,
            "images",
            extra.filename || (slug + "_angle_" + (i + 1) + ".png"),
            extra.contentType || "image/png"
          );
          galleryDocs.push(extraDoc);
          galleryUrls.push(extraDoc.url);
        }
      }
    }

    let machineFileDoc = null;
    let machineFileUrl = null;
    if (machineFile && machineFile.base64) {
      console.log("Sanity API: Uploading machine file for:", cleanTitle);
      const machineBuf = Buffer.from(machineFile.base64, "base64");
      machineFileDoc = await uploadToSanityAsset(
        machineBuf,
        "files",
        machineFile.filename || (slug + "_design.dst"),
        machineFile.contentType || "application/octet-stream"
      );
      machineFileUrl = machineFileDoc.url;
      console.log("Sanity API: Machine file uploaded successfully. URL:", machineFileUrl);
    }

    const sanityProductDoc = {
      _type: "product",
      title: cleanTitle,
      code,
      slug: { _type: "slug", current: slug },
      price: cleanPrice,
      category: cleanCategory,
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: primaryImgDoc._id }
      },
      gallery: galleryDocs.map(g => ({
        _key: g._id,
        _type: "image",
        asset: { _type: "reference", _ref: g._id }
      })),
      ...(machineFileDoc ? {
        designFile: {
          _type: "file",
          asset: { _type: "reference", _ref: machineFileDoc._id }
        },
        designFileName: machineFile.filename || "design.dst"
      } : {})
    };

    console.log("Sanity API: Creating product document in Content Lake...");
    const sanityResult = await mutateSanityDoc(sanityProductDoc);
    console.log("Sanity API: Document created successfully:", sanityResult);

    const supabaseProduct = await mirrorToSupabase({
      title: cleanTitle,
      code,
      slug,
      price: cleanPrice,
      categoryName: cleanCategory,
      imageUrl: primaryImageUrl,
      galleryUrls,
      fileUrl: machineFileUrl,
      rawFileName: machineFile?.filename
    });

    return res.status(200).json({
      success: true,
      message: "Design published successfully to Sanity Cloud & Website!",
      product: {
        id: supabaseProduct?.id || code,
        title: cleanTitle,
        code,
        slug,
        price: cleanPrice,
        category: cleanCategory,
        image: primaryImageUrl,
        gallery: galleryUrls,
        designFile: machineFileUrl,
        sanityUrl: primaryImageUrl
      }
    });
  } catch (err) {
    console.error("Sanity publishing error:", err);
    return res.status(500).json({
      error: "SANITY_PUBLISH_FAILED",
      message: err.message || "Failed to publish design to Sanity"
    });
  }
}
