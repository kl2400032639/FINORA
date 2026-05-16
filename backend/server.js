/**
 * Finora SaaS - Main Server Entry Point
 * Sets up Express, connects MongoDB, registers all routes.
 */

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const rateLimit = require('express-rate-limit');
const path     = require('path');
require('dotenv').config();

const app = express();

// ── Security Middleware ──────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ── CORS ─────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// ── Rate Limiting ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// ── Body Parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging (dev only) ────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Static Files (receipt uploads) ───────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',      require('./src/routes/auth'));
app.use('/api/expenses',  require('./src/routes/expenses'));
app.use('/api/goals',     require('./src/routes/goals'));
app.use('/api/analytics', require('./src/routes/analytics'));
app.use('/api/user',      require('./src/routes/user'));

// ── Health Check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Finora API is running 🚀', time: new Date() });
});

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── MongoDB + Server Start ────────────────────────────────
const PORT = process.env.PORT || 5000;
const { MongoMemoryServer } = require('mongodb-memory-server');

const startServer = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    // Try to connect to local MongoDB first
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log('✅ Connected to Local MongoDB');
    } catch (localErr) {
      console.log('⚠️ Local MongoDB not found. Starting In-Memory MongoDB for testing...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to In-Memory MongoDB (No installation required!)');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Finora API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Database connection failed completely:', err.message);
    process.exit(1);
  }
};

startServer();
