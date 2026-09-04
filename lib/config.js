import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../");

// Load .env if present
try {
  const envPath = path.join(rootDir, ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [k, ...v] = trimmed.split("=");
        const val = v.join("=").trim().replace(/^["']|["']$/g, "");
        if (!process.env[k.trim()]) {
          process.env[k.trim()] = val;
        }
      }
    });
  }
} catch (e) {
  // Ignore env loading error
}

// Fallback to config.json for Supabase credentials if not in process.env
let configJson = {};
try {
  const configJsonPath = path.join(rootDir, "config.json");
  if (fs.existsSync(configJsonPath)) {
    configJson = JSON.parse(fs.readFileSync(configJsonPath, "utf-8"));
  }
} catch (e) {
  // Ignore
}

export const config = {
  razorpay: {
    keyId: "",
    keySecret: "",
    webhookSecret: ""
  },
  supabase: {
    url: "https://xpqduepvrlhzsofxcukn.supabase.co",
    anonKey: "",
    serviceRoleKey: ""
  }
};

config.nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
config.isProduction = (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production");
config.allowDevMock = (process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production") && (process.env.ALLOW_DEV_MOCK_PAYMENTS === "true");

config.razorpay.keyId = process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID : "";
config.razorpay.keySecret = process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET : "";
config.razorpay.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ? process.env.RAZORPAY_WEBHOOK_SECRET : "";

config.supabase.url = process.env.SUPABASE_URL ? process.env.SUPABASE_URL : (configJson.supabaseUrl ? configJson.supabaseUrl : "https://xpqduepvrlhzsofxcukn.supabase.co");
config.supabase.anonKey = process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY : (configJson.supabaseAnonKey ? configJson.supabaseAnonKey : "");
config.supabase.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY : "";

export function isRazorpayConfigured() {
  return Boolean(config.razorpay.keyId && config.razorpay.keySecret);
}

export function assertProductionSafety() {
  if (config.isProduction && !isRazorpayConfigured()) {
    const err = new Error("CRITICAL_CONFIG_ERROR: Razorpay production credentials are missing. Payment service has failed closed.");
    err.statusCode = 503;
    err.code = "PAYMENT_GATEWAY_UNAVAILABLE";
    throw err;
  }
}
