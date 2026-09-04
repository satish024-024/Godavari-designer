import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".dst": "application/octet-stream",
  ".pes": "application/octet-stream"
};

// Map of API routes to handlers
const apiRoutes = {
  "/api/payments/create-order": () => import("./api/payments/create-order.js"),
  "/api/payments/verify": () => import("./api/payments/verify.js"),
  "/api/payments/webhook": () => import("./api/payments/webhook.js"),
  "/api/payments/status": () => import("./api/payments/status.js"),
  "/api/downloads/request": () => import("./api/downloads/request.js"),
  "/api/purchases/claim-guest": () => import("./api/purchases/claim-guest.js"),
  "/api/purchases": () => import("./api/purchases/index.js"),
  "/api/support/payment": () => import("./api/support/payment.js")
};

function enhanceResponse(res) {
  res.status = function(code) {
    res.statusCode = code;
    return res;
  };
  res.json = function(data) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
    return res;
  };
}

const server = http.createServer(async (req, res) => {
  enhanceResponse(res);

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  // 1. Check API Routes
  if (pathname.startsWith("/api/")) {
    // Read request body
    let rawBody = "";
    req.on("data", chunk => { rawBody += chunk; });
    req.on("end", async () => {
      req.rawBody = rawBody;
      try {
        req.body = rawBody ? JSON.parse(rawBody) : {};
      } catch (e) {
        req.body = rawBody;
      }

      try {
        // Direct route matches
        if (apiRoutes[pathname]) {
          const mod = await apiRoutes[pathname]();
          return await mod.default(req, res);
        }

        // Dynamic route: /api/downloads/:grantId
        if (pathname.startsWith("/api/downloads/")) {
          const grantId = pathname.replace("/api/downloads/", "").split("?")[0];
          req.query = { grantId };
          const mod = await import("./api/downloads/[grantId].js");
          return await mod.default(req, res);
        }

        // Dynamic route: /api/purchases/:purchaseId
        if (pathname.startsWith("/api/purchases/") && pathname !== "/api/purchases/claim-guest") {
          const purchaseId = pathname.replace("/api/purchases/", "").split("?")[0];
          req.query = { purchaseId };
          const mod = await import("./api/purchases/[purchaseId].js");
          return await mod.default(req, res);
        }

        return res.status(404).json({ error: "NOT_FOUND", message: `API endpoint ${pathname} does not exist` });
      } catch (err) {
        console.error("Server API routing error:", err);
        return res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
      }
    });
    return;
  }

  // 2. Static File Serving
  let filePath = path.join(__dirname, pathname === "/" ? "index.html" : pathname);
  
  // Clean query strings / hashes from filePath
  filePath = filePath.split("?")[0].split("#")[0];

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: serve index.html for non-API client routes
      const indexPath = path.join(__dirname, "index.html");
      fs.readFile(indexPath, (indexErr, indexData) => {
        if (indexErr) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error: index.html missing");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(indexData);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600"
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`✨ Godavari Designers Production Dev Server listening on http://localhost:${PORT}`);
});
