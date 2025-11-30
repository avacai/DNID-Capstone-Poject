import { Platform } from "react-native";

// ---------------------------------------------
// BASE URL (Local dev: Android / iOS support)
// ---------------------------------------------
export const BASE_URL =
Platform.OS === "android"
? "http://10.0.2.2:5000" // Android emulator → localhost
: "http://localhost:5000"; // iOS simulator / web

// ---------------------------------------------
// AUTH TOKEN
// ---------------------------------------------
let AUTH_TOKEN: string | null = null;

export function setAuthToken(token: string | null) {
  AUTH_TOKEN = token;
}

// ---------------------------------------------
// INTERNAL REQUEST WRAPPER
// ---------------------------------------------
async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any),
  };

  if (AUTH_TOKEN) {
    headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    console.log("❌ API Error:", path, data);
    throw new Error((data as any)?.message || "API request failed");
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
  login: (email: string, password: string) =>
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

  getStoreList: (userId: number) =>
    request(`/api/store/list?userId=${userId}`),

  purchaseItem: (userId: number, itemId: number | string) =>
    request("/api/purchase", {
      method: "POST",
      body: JSON.stringify({ userId, itemId }),
    }),

  equipItem: (userId: number, itemId: number | string) =>
    request("/api/equip", {
      method: "POST",
      body: JSON.stringify({ userId, itemId }),
    }),

  inventory: () => request("/api/inventory"),

  // -----------------------
  // SESSION SYSTEM
  // -----------------------

  sessionStart: (taskId?: number, task?: string) =>
    request("/api/session/start", {
      method: "POST",
      body: JSON.stringify({ taskId, task }),
    }),

  sessionEnd: (sessionId: number) =>
    request("/api/session/end", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }),

  sessionsMe: () => request("/api/sessions/me"),

  sessionsByUserId: (userId: number) => request(`/api/session/${userId}`),

  // Manual reward (rarely needed)
  applyReward: (durationSeconds: number) =>
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

  addTask: (title: string, reward = 0, due = null) =>
    request("/api/tasks/add", {
      method: "POST",
      body: JSON.stringify({ title, reward, due }),
    }),

  completeTask: (taskId: string | number) =>
    request("/api/tasks/complete", {
      method: "POST",
      body: JSON.stringify({ taskId }),
    }),
};

// ---------------------------------------------
// OPTIONAL TYPES (use if you want)
// ---------------------------------------------
export type User = {
  id: number;
  email: string;
  name?: string;
};

export type GameState = {
  pet: {
    type: string;
    exp: number;
    growthStage: string;
    mood: string;
  };
  currency: number;
  equipped: Record<string, number | null>;
  inventory: any[];
  storyProgress: number;
  store: any[];
};

export type StoreItem = {
  id: number;
  name: string;
  category: string;
  petType: string;
  price: number;
};

export type Task = {
  id: string | number;
  title: string;
  reward: number;
  completed: boolean;
};