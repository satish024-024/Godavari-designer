import { consumeDownloadGrant } from "../../lib/crypto.js";
import { getProductById, atomicIncrementDownloadCount, checkActiveEntitlement } from "../../lib/supabase.js";

function generateDstFileBuffer(product) {
  const code = (product.code || "GD-DESIGN").replace(/[^a-zA-Z0-9_-]/g, "");
  const stitchCount = product.total_stitch_count || 32000;
  const widthMm = (product.width || 120) * 10;
  const heightMm = (product.height || 120) * 10;
  const colors = product.thread_colors || 5;

  let header = `LA:${code.padEnd(16, " ")}\r`;
  header += `ST:${String(stitchCount).padStart(7, " ")}\r`;
  header += `CO:${String(colors).padStart(3, " ")}\r`;
  header += `+X:${String(widthMm).padStart(5, " ")}\r`;
  header += `-X:${String(widthMm).padStart(5, " ")}\r`;
  header += `+Y:${String(heightMm).padStart(5, " ")}\r`;
  header += `-Y:${String(heightMm).padStart(5, " ")}\r`;
  header += `AX:+    0\rAY:+    0\rMX:+    0\rMY:+    0\rPD:******\r`;
  header = header.padEnd(511, " ") + "\x1A";

  const buffer = Buffer.alloc(512 + 128);
  buffer.write(header, 0, 512, "ascii");

  for (let i = 512; i < 512 + 120; i += 3) {
    buffer[i] = 0x00;
    buffer[i + 1] = 0x00;
    buffer[i + 2] = 0x03;
  }
  buffer[512 + 120] = 0x00;
  buffer[512 + 121] = 0x00;
  buffer[512 + 122] = 0xF3;

  return buffer;
}

function generatePesFileBuffer(product) {
  const code = (product.code || "GD-DESIGN").replace(/[^a-zA-Z0-9_-]/g, "");
  const magic = "#PES0001";
  const headerBuffer = Buffer.alloc(128);
  headerBuffer.write(magic, 0, magic.length, "ascii");
  headerBuffer.write(code, 16, code.length, "ascii");

  const block = Buffer.from([0xFF, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00]);
  return Buffer.concat([headerBuffer, block]);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    let grantId = req.query?.grantId;
    let format = (req.query?.format || "DST").toUpperCase();

    if (req.url) {
      try {
        const url = new URL(req.url, "http://localhost");
        const pathParts = url.pathname.split("/");
        const lastPart = pathParts[pathParts.length - 1].split("?")[0];
        if (lastPart && !lastPart.startsWith("[") && lastPart !== "download") {
          grantId = lastPart;
        }
        if (url.searchParams.get("format")) {
          format = url.searchParams.get("format").toUpperCase();
        }
      } catch (_) {}
    }

    if (!grantId) {
      return res.status(400).json({ error: "MISSING_GRANT_ID", message: "Download grant identifier is required" });
    }

    const grant = consumeDownloadGrant(grantId);
    if (!grant) {
      res.setHeader("Content-Type", "application/json");
      return res.status(410).json({
        error: "GRANT_EXPIRED_OR_INVALID",
        message: "This secure download link has expired or has already been used. Please click Download again to generate a fresh link."
      });
    }

    const product = await getProductById(grant.productId);
    if (!product) {
      return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
    }

    const entitlement = await checkActiveEntitlement({
      productId: product.id,
      userId: grant.userId
    });
    if (entitlement) {
      await atomicIncrementDownloadCount(entitlement.id);
    }

    let fileBuffer;
    let fileExtension = format === "PES" ? "pes" : "dst";

    // If a real uploaded machine file exists, attempt to stream it
    if (product.design_file) {
      try {
        const designPath = product.design_file.replace(/^\/+/, "");
        const bucketUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
        const storageUrl = `${bucketUrl.replace(/\/$/, "")}/storage/v1/object/digitized-designs/${encodeURIComponent(designPath)}`;
        const storageRes = await fetch(storageUrl, {
          headers: { "Authorization": `Bearer ${serviceKey}`, "apikey": serviceKey }
        });
        if (storageRes.ok) {
          const realBuffer = Buffer.from(await storageRes.arrayBuffer());
          if (realBuffer.length > 0) {
            fileBuffer = realBuffer;
            // Determine extension from the stored file name
            const storedName = designPath.split("/").pop() || "";
            const storedExt = storedName.split(".").pop()?.toLowerCase();
            if (storedExt && storedExt.length <= 4) {
              fileExtension = storedExt;
            }
          }
        }
      } catch (streamErr) {
        console.warn("Failed to stream real design file, falling back to generated:", streamErr.message);
      }
    }

    // Fallback: generate synthetic file if no real file was streamed
    if (!fileBuffer) {
      if (format === "PES") {
        fileBuffer = generatePesFileBuffer(product);
      } else {
        fileBuffer = generateDstFileBuffer(product);
      }
    }

    const filename = `${product.code || "GD-DESIGN"}_${format}.${fileExtension}`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", fileBuffer.length);
    res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.statusCode = 200;
    if (typeof res.status === "function") {
      try {
        const ret = res.status(200);
        if (ret && typeof ret.end === "function") return ret.end(fileBuffer);
        if (ret && typeof ret.send === "function") return ret.send(fileBuffer);
      } catch (_) {}
    }
    if (typeof res.send === "function") {
      return res.send(fileBuffer);
    }
    if (typeof res.end === "function") {
      return res.end(fileBuffer);
    }
    return res;
  } catch (err) {
    console.error("api/downloads/:grantId error:", err);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ error: "DOWNLOAD_FAILED", message: "Failed to stream download file securely" });
  }
}
