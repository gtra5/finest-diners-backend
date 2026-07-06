const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// ─── Startup secret validation ────────────────────────────────────────────────
// Fail fast — don't start the server with missing critical config
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'ALLOWED_ORIGINS'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET is too short. Use at least 32 random characters.');
  process.exit(1);
}

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
// express.json() MUST be registered before any routes so req.body is populated
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Routes ───────────────────────────────────────────────────────────────────
// Imported after middleware so the router chain is fully built before mounting
const authRoutes        = require('./routes/authRoutes');
const foodRoutes        = require('./routes/foodRoutes');
const orderRoutes       = require('./routes/orderRoutes');
const restaurantRoutes  = require('./routes/restaurantRoutes');

app.use('/api/auth',        authRoutes);
app.use('/api/food',        foodRoutes);
app.use('/api/orders',      orderRoutes);
app.use('/api/restaurants', restaurantRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'alive', message: 'Finest Diners API is running.' });
});

// ─── 404 catch-all ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: `Route not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // Log full error server-side only — never send stack traces to the client
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
});

// ─── Start server only after DB connects ──────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Failed to connect to database. Server not started.', err.message);
  process.exit(1);
});
