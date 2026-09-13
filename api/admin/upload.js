import { config } from "../../lib/config.js";

/**
 * Server-side Admin File Upload Endpoint
 * Handles preview images (media-library) and digitized embroidery files (digitized-designs)
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS and CORS restrictions
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
    const {
      bucket = "media-library",
      path: requestedPath,
      filename,
      contentType = "application/octet-stream",
      base64
    } = body;

    if (!base64) {
      return res.status(400).json({ error: "MISSING_DATA", message: "File content (base64) is required" });
    }

    const cleanBucket = bucket === "digitized-designs" ? "digitized-designs" : "media-library";
    
    // Sanitize destination path
    let uploadPath = requestedPath;
    if (!uploadPath) {
      const cleanFileName = (filename || `upload_${Date.now()}`)
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "_");
      const subFolder = cleanBucket === "digitized-designs" ? "designs" : "images";
      uploadPath = `${subFolder}/${Date.now()}_${cleanFileName}`;
    }
    uploadPath = uploadPath.replace(/^\/+/, "");

    // Decode base64 to binary buffer
    const fileBuffer = Buffer.from(base64, "base64");
    if (fileBuffer.length === 0) {
      return res.status(400).json({ error: "EMPTY_FILE", message: "Uploaded file is empty" });
    }
    if (fileBuffer.length > 50 * 1024 * 1024) {
      return res.status(413).json({ error: "FILE_TOO_LARGE", message: "File size exceeds 50MB limit" });
    }

    const supabaseUrl = config.supabase.url.replace(/\/$/, "");
    const serviceKey = config.supabase.serviceRoleKey || config.supabase.anonKey;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${cleanBucket}/${encodeURIComponent(uploadPath)}`;

    // Upload directly using Supabase Storage REST API with service role privileges
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serviceKey}`,
        "apikey": serviceKey,
        "Content-Type": contentType,
        "x-upsert": "true"
      },
      body: fileBuffer
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text().catch(() => "");
      console.error(`Storage upload error (${uploadRes.status}):`, errorText);
      return res.status(uploadRes.status || 500).json({
        error: "STORAGE_ERROR",
        message: `Failed to upload to storage: ${errorText}`
      });
    }

    // Generate authoritative public CDN URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${cleanBucket}/${uploadPath}`;

    return res.status(200).json({
      success: true,
      bucket: cleanBucket,
      path: uploadPath,
      publicUrl,
      size: fileBuffer.length,
      contentType
    });

  } catch (err) {
    console.error("Admin upload handler error:", err);
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: err.message || "Failed to process file upload"
    });
  }
}

export const configExport = {
  api: {
    bodyParser: {
      sizeLimit: "50mb"
    }
  }
};
