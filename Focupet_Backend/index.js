import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, _res, next) => {
  console.log("request received:", req.method, req.url);
  next();
});

app.use(express.json());

// CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// FILE PATHS
const usersPath = path.join(__dirname, "users.json");
const gamedataPath = path.join(__dirname, "gamedata.json");
const sessionPath = path.join(__dirname, "session.json");

// LOAD FILE HELPERS
async function loadJSON(path, fallback = []) {
  try {
    const raw = await fs.readFile(path, "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function saveJSON(path, data) {
  await fs.writeFile(path, JSON.stringify(data, null, 2), "utf-8");
}

// LOAD DATA
let users = await loadJSON(usersPath, []);
let gamedata = await loadJSON(gamedataPath, []);
let sessions = await loadJSON(sessionPath, []);

// SESSION TOKEN (LOGIN)
const tokens = new Map();

function sanitizeUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

function createToken() {
  return "token_" + crypto.randomBytes(16).toString("hex");
}

// AUTH MIDDLEWARE
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
  req.user = tokens.get(token); // { id, email }
  next();
}

// ROUTES
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, status: "healthy" });
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ ok: false, message: "Invalid credentials" });
  }

  const token = createToken();
  const safeUser = sanitizeUser(user);
  tokens.set(token, safeUser);

  const userData = gamedata.find((g) => g.userId === safeUser.id);

  return res.json({
    ok: true,
    token,
    user: safeUser,
    gamedata: userData,
  });
});

// LOGOUT
app.post("/api/logout", auth, (req, res) => {
  const header = req.headers.authorization;
  const token = header.slice(7);
  tokens.delete(token);
  res.json({ ok: true });
});

// ME
app.get("/api/me", auth, (req, res) => {
  res.json({ ok: true, user: req.user });
});

// GET GAMEDATA (SELF)
app.get("/api/gamedata", auth, (req, res) => {
  const userGame = gamedata.find((g) => g.userId === req.user.id);
  if (!userGame) {
    return res.status(404).json({ ok: false, message: "No gamedata found" });
  }
  res.json({ ok: true, gamedata: userGame });
});

//
// --------------------------
// SESSION SYSTEM START HERE
// --------------------------
//

// START SESSION
app.post("/api/session/start", auth, async (req, res) => {
  const { task = null, taskId = null } = req.body;
  const userId = req.user.id;

  const now = new Date();
  const sessionId = now.getTime();

  const newSession = {
    id: sessionId,
    userId,
    task,
    taskId,
    startTime: now.toISOString(),
    endTime: null,
    duration: null,
    reward: 0,
  };

  sessions.push(newSession);
  await saveJSON(sessionPath, sessions);

  res.json({ ok: true, session: newSession });
});

// END SESSION
app.post("/api/session/end", auth, async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.user.id;

  const session = sessions.find(
    (s) => s.id === sessionId && s.userId === userId
  );

  if (!session) {
    return res.status(404).json({ ok: false, message: "Session not found" });
  }

  if (session.endTime) {
    return res.json({ ok: true, session, message: "Session already ended" });
  }

  const end = new Date();
  const start = new Date(session.startTime);

  const duration = Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / 1000)
  );

  const reward = Math.floor(duration / 300) * 5; // 5 minutes = 5 coins

  session.endTime = end.toISOString();
  session.duration = duration;
  session.reward = reward;

  await saveJSON(sessionPath, sessions);

  // SYNC TO GAMEDATA
  const userGame = gamedata.find((g) => g.userId === userId);
  if (userGame) {
    userGame.currency += reward;

    if (!Array.isArray(userGame.sessions)) {
      userGame.sessions = [];
    }

    userGame.sessions.push({
      id: session.id,
      task: session.task,
      taskId: session.taskId,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      reward: session.reward,
    });

    await saveJSON(gamedataPath, gamedata);
  }

  res.json({
    ok: true,
    session,
    newCurrency: userGame ? userGame.currency : null,
  });
});

// GET USER SESSIONS
app.get("/api/session/:userId", auth, (req, res) => {
  const uid = Number(req.params.userId);
  const userSessions = sessions.filter((s) => s.userId === uid);

  res.json({
    ok: true,
    sessions: userSessions,
  });
});

// ----------------------------
// END SESSION SYSTEM
// ----------------------------

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

