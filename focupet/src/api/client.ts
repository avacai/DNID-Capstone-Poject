// src/api/client.ts
import { API_BASE_URL } from "../config/api";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignore non-JSON
  }

  if (!res.ok || (data && data.ok === false)) {
    const msg = data?.message || data?.error || `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// ---- Auth & core game ----

export async function apiLogin(email: string, password: string) {
  const data = await apiFetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data as {
    ok: true;
    token: string;
    user: { id: number; name: string; email: string };
    gamedata: any;
  };
}

export async function apiGetGameState() {
  return apiFetch("/api/game/state");
}

// ---- Tasks ----

export async function apiGetTasksMe() {
  return apiFetch("/api/tasks/me");
}

export async function apiAddTask(
  title: string,
  reward = 0,
  due: string | null = null
) {
  return apiFetch("/api/tasks/add", {
    method: "POST",
    body: JSON.stringify({ title, reward, due }),
  });
}

export async function apiCompleteTask(taskId: number) {
  return apiFetch("/api/tasks/complete", {
    method: "POST",
    body: JSON.stringify({ taskId }),
  });
}

// ---- Store / Inventory ----

export async function apiStoreList(userId: number) {
  return apiFetch(`/api/store/list?userId=${userId}`);
}

export async function apiPurchase(userId: number, itemId: string) {
  return apiFetch("/api/purchase", {
    method: "POST",
    body: JSON.stringify({ userId, itemId }),
  });
}

export async function apiEquip(userId: number, itemId: string) {
  return apiFetch("/api/equip", {
    method: "POST",
    body: JSON.stringify({ userId, itemId }),
  });
}

// ---- Focus sessions ----

export async function apiStartSession(
  task: string | null,
  taskId: number | null
) {
  const data = await apiFetch("/api/session/start", {
    method: "POST",
    body: JSON.stringify({ task, taskId }),
  });
  return data as {
    ok: true;
    session: {
      id: number;
      userId: number;
      task: string | null;
      taskId: number | null;
      startTime: string;
      endTime: string | null;
      duration: number | null;
      reward: number;
    };
  };
}

export type ApiEndSessionResult = {
  ok: true;
  session: any;
  reward: { currency: number; petExp: number };
  newCurrency: number | null;
  pet: any;
  evolved?: boolean;
  oldStage?: string | null;
  newStage?: string | null;
  moodChanged?: boolean;
  oldMood?: string | null;
  newMood?: string | null;
  storyProgress?: number;
};

export async function apiEndSession(sessionId: number) {
  const data = await apiFetch("/api/session/end", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
  return data as ApiEndSessionResult;
}

// Optional: get all sessions for the current user
export async function apiGetSessionsMe() {
  return apiFetch("/api/sessions/me");
}

// Optional: manual reward apply helper (not used yet)
export async function apiApplyReward(durationSeconds: number) {
  return apiFetch("/api/reward/apply", {
    method: "POST",
    body: JSON.stringify({ duration: durationSeconds }),
  });
}


