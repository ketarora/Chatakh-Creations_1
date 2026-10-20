import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { razorpayWebhook } from "./controllers/paymentController.js";

import path from "path";
import https from "https";
import { fileURLToPath } from "url";
import { clerkMiddleware } from "@clerk/express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();

// 1. CORS MUST BE ABSOLUTELY FIRST
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    // Allowed frontends: defaults + ALPHA domain + env-driven (no more code
    // changes for new domains — just set ALLOWED_ORIGINS on Render).
    const defaultOrigins = [
      "http://localhost:5173",
      "https://chatakh-creations.vercel.app",
      "https://www.chatakh-creations.vercel.app",
      "https://chatakh-creations-alpha.vercel.app"
    ];
    const envOrigins = (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("CORS REJECTED ORIGIN:", origin);
      callback(new Error("CORS policy: origin not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Added OPTIONS here
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// 2. BODY PARSERS NEXT (Increased limits to prevent payload crashes)
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), razorpayWebhook);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 3. CLERK MIDDLEWARE COMES AFTER CORS
app.use(clerkMiddleware());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// Health check — for uptime monitors and the keep-alive ping below
app.get("/api/health", (req, res) => {
  res.json({ ok: true, t: Date.now() });
});

// 404 handler for undefined routes
app.use((req, res) => {
  console.warn("404 - Route not found:", req.method, req.path);
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.message, err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);

  // Startup verification
  console.log("\n🔍 STARTUP CONFIGURATION CHECK:");
  console.log("  ✓ Clerk Secret Key:", process.env.CLERK_SECRET_KEY ? "✅ SET" : "❌ MISSING");
  console.log("  ✓ MongoDB URI:", process.env.MONGO_URI ? "✅ SET" : "❌ MISSING");
  console.log("  ✓ Cloudinary Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ SET" : "❌ MISSING");
  console.log("  ✓ Cloudinary API Key:", process.env.CLOUDINARY_API_KEY ? "✅ SET" : "❌ MISSING");
  console.log("  ✓ Razorpay Key ID:", process.env.RAZORPAY_KEY_ID ? "✅ SET" : "❌ MISSING");
  console.log("\n");
});

// Free-tier keep-alive: Render spins down after 15 min of zero traffic.
// While the process is alive, ping our own public URL every 10 min — the
// request goes through Render's edge and resets the idle timer. (A sleeping
// process cannot wake itself; the first visitor of the day still waits.)
const SELF_URL = process.env.RENDER_EXTERNAL_URL;
if (SELF_URL) {
  const ping = () =>
    https
      .get(`${SELF_URL}/api/health`, (r) => {
        r.resume();
        console.log(`KEEP-ALIVE ping → ${r.statusCode}`);
      })
      .on("error", () => {});
  setTimeout(ping, 60 * 1000);
  setInterval(ping, 10 * 60 * 1000);
}
