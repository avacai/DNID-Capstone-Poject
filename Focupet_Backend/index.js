import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

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
const storePath = path.join(__dirname, "store.json");
const rewardsPath = path.join(__dirname, "rewards.json");

const tasksPath = path.join(__dirname, "tasks.json");
const systemTasksPath = path.join(__dirname, "system_tasks.json");


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
let storeData = await loadJSON(storePath, []);
let rewardConfig = await loadJSON(rewardsPath, {
  currencyPer5Min: 5,
  petExpPer5Min: 0,
});

let tasks = await loadJSON(tasksPath, []);
let systemTasks = await loadJSON(systemTasksPath, []);
// SAVE GAMEDATA HELPER
async function saveGameData() {
  await saveJSON(gamedataPath, gamedata);
}

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

// INIT PET (called after onboarding quiz)
app.post("/api/pet/init", auth, async (req, res) => {
  const { petType } = req.body;
  const userId = req.user.id;

  if (!petType) {
    return res.status(400).json({ ok: false, message: "petType is required" });
  }

  // load pets.json
  const petsList = JSON.parse(
    await fs.readFile(path.join(__dirname, "pets.json"), "utf-8")
  );

  const petConfig = petsList.find(p => p.type === petType);
  if (!petConfig) {
    return res.status(400).json({ ok: false, message: "Invalid pet type" });
  }

  // find or create gamedata
  let userGame = gamedata.find(g => g.userId === userId);

  if (!userGame) {
    userGame = {
      userId,
      currency: 0,
      inventory: [],
      equipped: {
        head: null,
        body: null,
        tail: null,
        face: null,
        neck: null,
        shoes: null,
        bowl: null,
        toy: null
      },
      sessions: [],
      storyProgress: 0,
      stories: [],
      tasks: [],
      pet: null
    };
    gamedata.push(userGame);
  }

  // Set the pet
  userGame.pet = {
    type: petType,
    exp: 0,
    growthStage: "baby",
    mood: "neutral",
    lastActiveAt: new Date().toISOString()
  };

  // save to gamedata.json
  await saveGameData();

  res.json({
    ok: true,
    message: "Pet initialized successfully",
    pet: userGame.pet
  });
});

// REWARD HELPERS
function computeReward(durationSeconds) {
  const blocks = Math.floor(durationSeconds / 300); // 每 5 分钟一个区块
  if (blocks <= 0) {
    return { currency: 0, petExp: 0 };
  }

  const currencyPer5 =
    typeof rewardConfig.currencyPer5Min === "number"
      ? rewardConfig.currencyPer5Min
      : 5;
  const petExpPer5 =
    typeof rewardConfig.petExpPer5Min === "number"
      ? rewardConfig.petExpPer5Min
      : 0;

  return {
    currency: blocks * currencyPer5,
    petExp: blocks * petExpPer5,
  };
}

// apply reward to user
async function applyRewardToUser(userId, durationSeconds, sessionRecord) {
  const reward = computeReward(durationSeconds);
  const userGame = gamedata.find((g) => g.userId === userId);

  // what this function will return to API
  let evolved = false;
  let oldStage = null;
  let newStage = null;

  let moodChanged = false;
  let oldMood = null;
  let newMood = null;

  if (userGame) {
    //
    // Base currency logic
    //
    if (typeof userGame.currency !== "number") {
      userGame.currency = 0;
    }
    userGame.currency += reward.currency;

    //
    // Ensure pet object exists
    //
    if (!userGame.pet) {
      userGame.pet = {
        type: "Cat",
        exp: 0,
        growthStage: "baby",
        mood: "neutral",
        lastActiveAt: new Date().toISOString()
      };
    }

    //
    // Base EXP gain
    //
    if (typeof userGame.pet.exp !== "number") {
      userGame.pet.exp = 0;
    }
    userGame.pet.exp += reward.petExp;

    //
    // -----------------------------
    // A) PET GROWTH SYSTEM
    // -----------------------------
    //
    const thresholds = rewardConfig.expThresholds || {};

    oldStage = userGame.pet.growthStage || "baby";

    // baby → teen
    if (
      userGame.pet.growthStage === "baby" &&
      userGame.pet.exp >= thresholds.baby_to_teen
    ) {
      userGame.pet.growthStage = "teen";
      evolved = true;
      newStage = "teen";
    }

    // teen → adult
    if (
      userGame.pet.growthStage === "teen" &&
      userGame.pet.exp >= thresholds.teen_to_adult
    ) {
      userGame.pet.growthStage = "adult";
      evolved = true;
      newStage = "adult";
    }

    //
    // -----------------------------
    // B) PET MOOD SYSTEM
    // -----------------------------
    //
    const moodRules = rewardConfig.moodRules || {};
    const minutes = durationSeconds / 60;

    oldMood = userGame.pet.mood || "neutral";
    newMood = oldMood;

    // Session-based mood improvement
    if (minutes >= 5 && minutes < 15) {
      newMood = moodRules.shortSession || "okay";
    } else if (minutes >= 15 && minutes < 30) {
      newMood = moodRules.mediumSession || "happy";
    } else if (minutes >= 30) {
      newMood = moodRules.longSession || "happy";
    }

    // Mood decay: no activity for 24 hours
    const lastActive = userGame.pet.lastActiveAt
      ? new Date(userGame.pet.lastActiveAt)
      : null;
    const now = new Date();

    if (lastActive) {
      const hoursInactive =
        (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

      if (hoursInactive >= 24) {
        newMood = "sad";
      }
    }

    if (newMood !== oldMood) {
      moodChanged = true;
    }

    userGame.pet.mood = newMood;

    // Update last active time
    userGame.pet.lastActiveAt = new Date().toISOString();

    //
    // -----------------------------
    // C) STORY PROGRESS ACCUMULATION
    // -----------------------------
    //
    const storyAmount = rewardConfig.storyProgressPer25Min || 0;
    const blocks25 = Math.floor(durationSeconds / (25 * 60));

    if (typeof userGame.storyProgress !== "number") {
      userGame.storyProgress = 0;
    }

    if (blocks25 > 0) {
      userGame.storyProgress += blocks25 * storyAmount;
    }

    //
    // Save session history
    //
    if (!Array.isArray(userGame.sessions)) {
      userGame.sessions = [];
    }

    if (sessionRecord) {
      userGame.sessions.push({
        ...sessionRecord,
        reward: reward.currency
      });
    }

    //
    // Persist all changes
    //
    await saveGameData();
  }

  //
  // return expanded reward summary
  //
  return {
    reward,
    userGame,
    evolved,
    oldStage,
    newStage,
    moodChanged,
    oldMood,
    newMood,
    storyProgress: userGame.storyProgress
  };
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


// --------------------------
// SESSION SYSTEM
// --------------------------
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

  // session already finished
  if (session.endTime) {
    return res.json({ ok: true, session, message: "Session already ended" });
  }

  const end = new Date();
  const start = new Date(session.startTime);

  const duration = Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / 1000)
  );

  session.endTime = end.toISOString();
  session.duration = duration;

  await saveJSON(sessionPath, sessions);

  // Call reward system (ONLY ONCE)
  const result = await applyRewardToUser(
    userId,
    duration,
    {
      id: session.id,
      task: session.task,
      taskId: session.taskId,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration
    }
  );

  // unpack all fields needed by SSDD
  const {
    reward,
    userGame,
    evolved,
    oldStage,
    newStage,
    moodChanged,
    oldMood,
    newMood,
    storyProgress
  } = result;

  session.reward = reward.currency;

  // Auto-complete task if session has taskId
  if (session.taskId) {
    const linkedTask = tasks.find(
      t => t.id === session.taskId && t.userId === userId
    );

    if (linkedTask && !linkedTask.completed) {
      linkedTask.completed = true;
      linkedTask.completedAt = new Date().toISOString();

      // Add task reward to currency
      if (userGame) {
        userGame.currency =
          (userGame.currency || 0) + (linkedTask.reward || 0);
      }

      await saveJSON(tasksPath, tasks);
      await saveGameData();
    }
  }

  res.json({
    ok: true,
    session,
    reward,
    newCurrency: userGame ? userGame.currency : null,
    pet: userGame ? userGame.pet : null,

    // Pet reacts
    evolved,
    oldStage,
    newStage,
    moodChanged,
    oldMood,
    newMood,

    // Story progression
    storyProgress: storyProgress || 0
  });
});


// GET SESSIONS for current authenticated user (SSDD required)
app.get("/api/sessions/me", auth, (req, res) => {
  const uid = req.user.id;
  const userSessions = sessions.filter(s => s.userId === uid);

  res.json({
    ok: true,
    sessions: userSessions
  });
});


// GET USER SESSIONS (admin/debug)
app.get("/api/session/:userId", auth, (req, res) => {
  const uid = Number(req.params.userId);
  const userSessions = sessions.filter((s) => s.userId === uid);

  res.json({
    ok: true,
    sessions: userSessions,
  });
});


// Manually apply reward (e.g., frontend custom duration)
app.post("/api/reward/apply", auth, async (req, res) => {
  const { duration } = req.body;

  if (typeof duration !== "number" || duration <= 0) {
    return res
      .status(400)
      .json({ ok: false, message: "Invalid duration value" });
  }

  const { reward, userGame } = await applyRewardToUser(
    req.user.id,
    duration,
    null
  );

// ------- STORY UNLOCK (Placeholder) -------
if (systemStories && Array.isArray(systemStories)) {
  const progress = userGame.storyProgress || 0;
  // Ensure user stories exist
  if (!Array.isArray(userGame.stories)) {
    userGame.stories = systemStories.map(s => ({
      id: s.id,
      unlocked: s.threshold === 0
    }));
  }

  systemStories.forEach(story => {
    if (progress >= story.threshold) {
      const entry = userGame.stories.find(s => s.id === story.id);
      if (entry && !entry.unlocked) {
        entry.unlocked = true;
      }
    }
  });

  await saveGameData();
}

  res.json({
    ok: true,
    reward,
    newCurrency: userGame ? userGame.currency : null,
    pet: userGame ? userGame.pet : null,
  });
});


//
// --------------------------
// STORE RELATED SYSTEM
// 1. FILTER ITEMS BY PET TYPE
// 2. PURCHASE ITEM
// 3. EQUIP ITEM
// --------------------------
//

// GET store items based on user's pet type
app.get("/api/store/list", (req, res) => {
  const userId = parseInt(req.query.userId);

  const user = gamedata.find((u) => u.userId === userId);
  if (!user) {
    return res.status(404).json({ ok: false, error: "User not found" });
  }

  if (!user.pet || !user.pet.type) {
    return res.status(400).json({ ok: false, error: "User has no pet type" });
  }

  const petType = user.pet.type;
  const availableItems = storeData.filter((item) => item.petType === petType);

  res.json({
    ok: true,
    store: availableItems,
  });
});

// PURCHASE ITEM
app.post("/api/purchase", async (req, res) => {
  const { userId, itemId } = req.body;

  const user = gamedata.find((u) => u.userId === userId);
  if (!user) {
    return res.status(404).json({ ok: false, error: "User not found" });
  }

  const item = storeData.find((i) => i.id === itemId);
  if (!item) {
    return res.status(404).json({ ok: false, error: "Item not found" });
  }

  if (!user.pet || item.petType !== user.pet.type) {
    return res.status(400).json({
      ok: false,
      error: "This item cannot be equipped by your pet type",
    });
  }

  if (user.currency < item.price) {
    return res.status(400).json({
      ok: false,
      error: "Not enough currency",
    });
  }

  user.currency -= item.price;

  if (!user.inventory) user.inventory = [];
  user.inventory.push({
    itemId: itemId,
    acquiredAt: new Date().toISOString(),
  });

  await saveGameData();

  res.json({
    ok: true,
    message: "Purchase successful",
    currency: user.currency,
    inventory: user.inventory,
  });
});

// EQUIP ITEM
app.post("/api/equip", async (req, res) => {
  const { userId, itemId } = req.body;

  const user = gamedata.find((u) => u.userId === userId);
  if (!user) {
    return res.status(404).json({ ok: false, error: "User not found" });
  }

  if (!user.inventory) user.inventory = [];
  if (!user.equipped) {
    user.equipped = {
      head: null,
      body: null,
      tail: null,
      face: null,
      neck: null,
      shoes: null,
      bowl: null,
      toy: null,
    };
  }

  const item = storeData.find((i) => i.id === itemId);
  if (!item) {
    return res.status(404).json({ ok: false, error: "Item not found" });
  }

  const hasItem = user.inventory.some((i) => i.itemId === itemId);
  if (!hasItem) {
    return res.status(400).json({
      ok: false,
      error: "You do not own this item",
    });
  }

  if (!user.pet || item.petType !== user.pet.type) {
    return res.status(400).json({
      ok: false,
      error: "This item is not compatible with your pet type",
    });
  }

  const slot = item.category;
  user.equipped[slot] = itemId;

  await saveGameData();

  res.json({
    ok: true,
    message: "Item equipped successfully",
    equipped: user.equipped,
  });
});

//
// --------------------------
// INVENTORY AND PET STATUS
// --------------------------
//

app.get("/api/inventory", auth, (req, res) => {
  const userGame = gamedata.find((g) => g.userId === req.user.id);
  if (!userGame) {
    return res.status(404).json({ ok: false, message: "No gamedata found" });
  }

  res.json({
    ok: true,
    currency: userGame.currency || 0,
    inventory: userGame.inventory || [],
    equipped: userGame.equipped || {},
  });
});

// PET STATUS
app.get("/api/pet/status", auth, (req, res) => {
  const userGame = gamedata.find((g) => g.userId === req.user.id);
  if (!userGame) {
    return res.status(404).json({ ok: false, message: "No gamedata found" });
  }

  if (!userGame.pet) {
    userGame.pet = {
      type: "Cat",
      exp: 0,
      growthStage: "baby",
      mood: "neutral",
    };
  }

  res.json({
    ok: true,
    pet: userGame.pet,
    equipped: userGame.equipped || {},
    currency: userGame.currency || 0,
    stories: userGame.stories || []
  });
});

// Unified Game State 
app.get("/api/game/state", auth, (req, res) => {
  const userId = req.user.id;
  const userGame = gamedata.find(g => g.userId === userId);

  if (!userGame) {
    return res.status(404).json({ ok: false, message: "No gamedata found" });
  }

  // Filter store items for this pet
  const petType = userGame.pet?.type;
  const availableStoreItems = storeData.filter(
    item => item.petType === petType
  );

  res.json({
    ok: true,
    pet: userGame.pet,
    currency: userGame.currency || 0,
    equipped: userGame.equipped || {},
    inventory: userGame.inventory || [],
    storyProgress: userGame.storyProgress || 0,
    stories: userGame.stories || [],
    store: availableStoreItems
  });
});

//---------------------
// --- TASK SYSTEM ---
//---------------------

// Get Suggested Tasks (from system_tasks.json)
app.get("/api/tasks/suggest", auth, (req, res) => {
  res.json({
    ok: true,
    tasks: systemTasks
  });
});

// Get User's Personal Tasks
app.get("/api/tasks/me", auth, (req, res) => {
  const uid = req.user.id;
  const userTasks = tasks.filter(t => t.userId === uid);

  res.json({
    ok: true,
    tasks: userTasks
  });
});

// Add a new personal task
app.post("/api/tasks/add", auth, async (req, res) => {
  const uid = req.user.id;
  const { title, due = null, reward = 0 } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ ok: false, message: "Invalid task title" });
  }

  const newTask = {
    id: Date.now(),
    userId: uid,
    title,
    due,
    reward,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  await saveJSON(tasksPath, tasks);

  res.json({ ok: true, task: newTask });
});


// Complete a task manually
app.post("/api/tasks/complete", auth, async (req, res) => {
  const uid = req.user.id;
  const { taskId } = req.body;

  const task = tasks.find(t => t.id === taskId && t.userId === uid);

  if (!task) {
    return res.status(404).json({ ok: false, message: "Task not found" });
  }

  if (task.completed) {
    return res.json({ ok: true, task, message: "Task already completed" });
  }

  task.completed = true;
  task.completedAt = new Date().toISOString();

  // Add task reward to gamedata
  const userGame = gamedata.find(g => g.userId === uid);
  if (userGame) {
    userGame.currency = (userGame.currency || 0) + (task.reward || 0);
    await saveGameData();
  }

  await saveJSON(tasksPath, tasks);

  res.json({
    ok: true,
    task,
    newCurrency: userGame ? userGame.currency : null
  });
});



app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});











