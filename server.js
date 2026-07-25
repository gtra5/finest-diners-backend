const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const attachOrderTracking = require("./sockets/Ordertracking");

// ─── Startup secret validation ────────────────────────────────────────────────
// Fail fast — don't start the server with missing critical config
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET", "ALLOWED_ORIGINS"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missing.join(", ")}`,
  );
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error(
    "❌ JWT_SECRET is too short. Use at least 32 random characters.",
  );
  process.exit(1);
}

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
// express.json() MUST be registered before any routes so req.body is populated
const normalizeOrigin = (origin) => origin.replace(/\/$/, "");
const isVercelPreviewOrigin = (origin) =>
  /^https:\/\/[A-Za-z0-9-]+(?:--[A-Za-z0-9-]+)*\.vercel\.app$/i.test(origin);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => normalizeOrigin(o.trim()))
  : [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://finest-diners-2-1.onrender.com",
      "https://finest-diners-2-622i.vercel.app",
    ];

const corsOriginCheck = (origin, callback) => {
  // Allow requests with no origin (mobile apps, curl, Postman)
  if (!origin) return callback(null, true);

  const normalizedOrigin = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalizedOrigin) || isVercelPreviewOrigin(normalizedOrigin)) {
    return callback(null, true);
  }

  callback(new Error(`CORS: origin ${origin} not allowed`));
};

app.use(
  cors({
    origin: corsOriginCheck,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── HTTP server + Socket.IO (live order tracking) ────────────────────────────
// Socket.IO needs the raw http.Server, not the Express app, so requests can
// be upgraded to WebSocket connections. Express keeps handling all normal
// HTTP routes exactly as before via the same `app`.
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: corsOriginCheck, credentials: true },
});
app.set("io", io); // lets controllers (e.g. orderController) emit events
attachOrderTracking(io);

// ─── Routes ───────────────────────────────────────────────────────────────────
// Imported after middleware so the router chain is fully built before mounting
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const orderRoutes = require("./routes/orderRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const locationRoutes = require("./routes/locationRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/location", locationRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "alive", message: "Finest Diners API is running." });
});

// ─── 404 catch-all ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: `Route not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // Log full error server-side only — never send stack traces to the client
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  });
});

// ─── Start server only after DB connects ──────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Live order tracking ready via Socket.IO`);
    });
  })
  .catch((err) => {
    console.error(
      "❌ Failed to connect to database. Server not started.",
      err.message,
    );
    process.exit(1);
  });