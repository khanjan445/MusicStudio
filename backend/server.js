require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend client calls
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// HTTP Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection initialization with runtime fallback
let isDbConnected = false;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/musicProject';

mongoose.connect(mongoUri)
  .then(() => {
    isDbConnected = true;
    app.set('isDbConnected', true);
    app.set('UserModel', User);
    console.log('✅ Connected to MongoDB Database');
  })
  .catch(err => {
    isDbConnected = false;
    app.set('isDbConnected', false);
    app.set('UserModel', null);
    console.log('⚠️ MongoDB connection unavailable. Operating on CSV fallback datastore.');
  });

// Attach API Routes
app.use('/', authRoutes);
app.use('/api', contactRoutes);

// Optional: Serve frontend static files if running monolithic bundle
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

app.get('/*splat', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/login' || req.path === '/register') {
    return next();
  }
  const indexPath = path.join(frontendPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).json({ error: 'API route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Jaiak Studio Backend Server running on http://localhost:${PORT}`);
});
