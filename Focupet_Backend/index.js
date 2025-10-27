import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());

// CORS: allow common local ports in development; in production, set CLIENT_ORIGIN environment variable
const allowedOrigins = new Set([
  process.env.CLIENT_ORIGIN || '',
  'http://localhost:3000', // CRA
  'http://127.0.0.1:3000',
  'http://localhost:5173', // Vite default
  'http://127.0.0.1:5173',
].filter(Boolean));

app.use(
  cors({
    origin(origin, cb) {
      // No Origin means same-origin or curl; allow during development
      if (!origin) return cb(null, true);
      if (allowedOrigins.size === 0) return cb(null, true); // if no specific origins defined, allow by default during development
      return cb(null, allowedOrigins.has(origin));
    },
    credentials: true,
  })
);

// Load hardcoded users
const usersPath = path.join(__dirname, 'users.json');
let users = [];
try {
  users = JSON.parse(await fs.readFile(usersPath, 'utf-8'));
} catch (e) {
  console.error('Failed to read users.json:', e);
}

// Optional: load game data (if exists)
const gamedataPath = path.join(__dirname, 'gamedata.json');
let gamedata = null;
try {
  gamedata = JSON.parse(await fs.readFile(gamedataPath, 'utf-8'));
  console.log('Loaded gamedata.json');
} catch {
  console.log('gamedata.json not found (optional).');
}

// Simple in-memory session: token -> user (no password)
const sessions = new Map();

function sanitizeUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

function createToken() {
  return 'demo_' + crypto.randomBytes(12).toString('hex');
}

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

// Login: email + password
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email and password are required' });
  }
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ ok: false, message: 'Invalid credentials' });
  }
  const token = createToken();
  const safeUser = sanitizeUser(user);
  sessions.set(token, safeUser);

  // If gamedata exists, attach initial progress here (adjust return structure as needed)
  return res.json({
    ok: true,
    token,
    user: safeUser,
    gamedata: gamedata ? { tasks: gamedata.tasks, pets: gamedata.pets, defaultProgress: gamedata.defaultProgress } : undefined,
  });
});

// Logout: remove token
app.post('/api/logout', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (token) sessions.delete(token);
  return res.json({ ok: true });
});

// Get current user info
app.get('/api/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }
  return res.json({ ok: true, user: sessions.get(token) });
});

// Optional: if backend should serve game data
app.get('/api/gamedata', (_req, res) => {
  if (!gamedata) return res.status(404).json({ ok: false, message: 'gamedata not found' });
  return res.json({ ok: true, gamedata });
});

// Production: serve frontend static assets (auto-detect common build directories)
function findStaticDir() {
  const candidates = [
    // Common locations relative to backend directory
    path.join(__dirname, 'public'), // if frontend output is placed under backend/public
    path.join(__dirname, 'client', 'build'), // CRA under backend/client
    path.join(__dirname, '..', 'client', 'build'), // CRA under repo root/client parallel to backend
    path.join(__dirname, 'frontend', 'dist'), // Vite under backend/frontend
    path.join(__dirname, '..', 'frontend', 'dist'), // Vite under repo root/frontend
    path.join(__dirname, '..', 'dist'), // other custom dist
  ];
  return Promise.all(
    candidates.map(async (p) => {
      try {
        const st = await fs.stat(p);
        return st.isDirectory() ? p : null;
      } catch {
        return null;
      }
    })
  ).then((arr) => arr.find(Boolean) || null);
}

const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
  const staticDir = await findStaticDir();
  if (staticDir) {
    console.log('Serving static assets from:', staticDir);
    app.use(express.static(staticDir));
    // SPA fallback
    app.get('*', async (req, res, next) => {
      try {
        const indexPath = path.join(staticDir, 'index.html');
        await fs.access(indexPath);
        res.sendFile(indexPath);
      } catch (e) {
        next();
      }
    });
  } else {
    console.warn('No static build folder found. Skipping static hosting.');
  }
}

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
