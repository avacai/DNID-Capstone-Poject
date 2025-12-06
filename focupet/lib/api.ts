import { Platform } from "react-native";

// ---------------------------------------------
// BASE URL (Local dev: Android / iOS support)
// ---------------------------------------------
export const BASE_URL =
Platform.OS === "android"
? "http://10.0.2.2:5050"   // ✅ new port
: "http://localhost:5050"; // ✅ new port

// ---------------------------------------------
// AUTH TOKEN
// ---------------------------------------------
let AUTH_TOKEN = null;

export function setAuthToken(token) {
  AUTH_TOKEN = token;
}

// ---------------------------------------------
// INTERNAL REQUEST WRAPPER
// ---------------------------------------------
async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (AUTH_TOKEN) {
    headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Try to read raw text first so we can debug better
  let text = "";
  try {
    text = await response.text();
  } catch (_) {}

  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    data = { raw: text };
  }

  if (!response.ok) {
    console.log("❌ API Error:", path, response.status, data);
    throw new Error((data && data.message) || "API request failed");
  }

  return data;
}

// ---------------------------------------------
// API METHODS
// ---------------------------------------------
export const api = {
  // Health check
  health: () => request("/api/health"),

  // -----------------------
  // AUTH
  // -----------------------
  login: (email, password) =>
    request("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request("/api/logout", {
      method: "POST",
    }),

  me: () => request("/api/me"),

  // -----------------------
  // GAME DATA
  // -----------------------
  gamedata: () => request("/api/gamedata"),
  gameState: () => request("/api/game/state"),

  // -----------------------
  // PET STATUS
  // -----------------------
  petStatus: () => request("/api/pet/status"),

  // -----------------------
  // STORE
  // -----------------------
  getStoreList: (userId) =>
    request(`/api/store/list?userId=${userId}`),

  purchaseItem: (userId, itemId) =>
    request("/api/purchase", {
      method: "POST",
      body: JSON.stringify({ userId, itemId }),
    }),

  equipItem: (userId, itemId) =>
    request("/api/equip", {
      method: "POST",
      body: JSON.stringify({ userId, itemId }),
    }),

  inventory: () => request("/api/inventory"),

  // -----------------------
  // SESSION SYSTEM
  // -----------------------
  sessionStart: (taskId, task) =>
    request("/api/session/start", {
      method: "POST",
      body: JSON.stringify({ taskId, task }),
    }),

  sessionEnd: (sessionId) =>
    request("/api/session/end", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }),

  sessionsMe: () => request("/api/sessions/me"),

  sessionsByUserId: (userId) => request(`/api/session/${userId}`),

  // Manual reward (rarely needed)
  applyReward: (durationSeconds) =>
    request("/api/reward/apply", {
      method: "POST",
      body: JSON.stringify({ duration: durationSeconds }),
    }),

  // -----------------------
  // TASK SYSTEM
  // -----------------------

  // Suggested (system) tasks
  suggestedTasks: () => request("/api/tasks/suggest"),

  // User personal tasks
  myTasks: () => request("/api/tasks/me"),

  addTask: (title, reward = 0, due = null) =>
    request("/api/tasks/add", {
      method: "POST",
      body: JSON.stringify({ title, reward, due }),
    }),

  completeTask: (taskId) =>
    request("/api/tasks/complete", {
      method: "POST",
      body: JSON.stringify({ taskId }),
    }),
};