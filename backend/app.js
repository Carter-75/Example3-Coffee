// --- Environment and Dependencies ---
const path = require('path');
const fs = require('fs');
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const resolveEnvPath = () => {
  const candidates = [
    path.join(process.cwd(), '.env.local'), 
    path.join(process.cwd(), 'backend', '.env.local'),
    path.join(__dirname, '../.env.local')
  ];
  for (const c of candidates) { if (fs.existsSync(c)) return c; }
  return null;
};
const envPath = resolveEnvPath();
if (envPath) require('dotenv').config({ path: envPath });
else require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');

const app = express();

// --- Configuration ---
const isProd = process.env.PRODUCTION === 'true' || process.env.VERCEL === '1';
const prodUrl = process.env.PROD_FRONTEND_URL;
const PROJECT_NAME = process.env.PROJECT_NAME || 'example3-coffee';

// Trust proxy
if (isProd) {
  app.set('trust proxy', 1);
}

// Frame Ancestors
const frameAncestors = ["'self'", "https://carter-portfolio.fyi", "https://carter-portfolio.vercel.app", "https://*.vercel.app", `http://localhost:${process.env.PORT || '3002'}`];
if (prodUrl) frameAncestors.push(prodUrl);

// --- Routers ---
const roastsRouter = require('./routes/roasts');

// --- Seeding Logic ---
const Roast = require('./models/roast');
const seedRoasts = async () => {
  const count = await Roast.countDocuments();
  if (count === 0) {
    console.log('INFO: Seeding luxury coffee data...');
    await Roast.create([
      {
        name: "Midnight Obsidian",
        origin: "Ethiopia & Colombia",
        notes: ["Dark Chocolate", "Black Cherry", "Smoke"],
        intensity: 9,
        price: 24.00,
        isFeatured: true,
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400"
      },
      {
        name: "Golden Hour Bloom",
        origin: "Costa Rica",
        notes: ["Honey", "Jasmine", "Citrus"],
        intensity: 4,
        price: 28.00,
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400"
      },
      {
        name: "Velvet Highlands",
        origin: "Guatemala",
        notes: ["Caramel", "Toasted Almond", "Vanilla"],
        intensity: 6,
        price: 22.00,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400"
      },
      {
        name: "Emerald Mist",
        origin: "Sumatra",
        notes: ["Earth", "Cedar", "Spice"],
        intensity: 8,
        price: 26.00,
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=400"
      }
    ]);
    console.log('OK: Seeding complete');
  }
};

// --- Diagnostic Routes ---
app.get('/api/health', async (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({ status: 'online', database: isConnected ? 'Connected' : 'Disconnected' });
});

// --- MongoDB Setup ---
const mongoURI = process.env.MONGODB_URI;
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (!mongoURI) return;
  try {
    await mongoose.connect(mongoURI);
    console.log('OK: Connected to MongoDB');
    seedRoasts();
  } catch (err) {
    console.error('ERROR: MongoDB Connection Failed:', err.message);
  }
};
connectDB();

// --- Middlewares ---
app.use(helmet({
  contentSecurityPolicy: false,
  frameguard: false
}));

app.use((req, res, next) => {
  // Dynamically calculate frame ancestors to support various Vercel aliases
  const host = req.get('host');
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const currentOrigin = `${protocol}://${host}`;
  
  const ancestors = ["'self'", "https://*.vercel.app", "https://carter-portfolio.fyi", currentOrigin];
  
  res.setHeader('Content-Security-Policy', `frame-ancestors ${ancestors.join(' ')}`);
  res.setHeader('X-Frame-Options', 'ALLOWALL'); 
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Mount Routes
app.use('/api/roasts', roastsRouter);
app.use('/roasts', roastsRouter);

app.get('/', (req, res) => {
  res.send(`API for ${PROJECT_NAME} is running`);
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});

module.exports = app;
