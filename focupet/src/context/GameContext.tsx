// src/context/GameContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  apiLogin,
  apiGetGameState,
  apiGetTasksMe,
  apiAddTask,
  apiCompleteTask,
  apiPurchase,
  apiStartSession,
  apiEndSession,
  ApiEndSessionResult,
  setAuthToken,
} from "../api/client";

type User = { id: number; name: string; email: string };

type GameState = {
  pet: any;
  currency: number;
  equipped: any;
  inventory: any[];
  storyProgress: number;
  stories: any[];
  store: any[];
};

type Task = {
  id: number;
  userId: number;
  title: string;
  due: string | null;
  reward: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
};

type EndSessionSummary = {
  reward: { currency: number; petExp: number };
  newCurrency: number | null;
  pet: any;
  evolved: boolean;
  oldStage: string | null;
  newStage: string | null;
  moodChanged: boolean;
  oldMood: string | null;
  newMood: string | null;
  storyProgress: number;
};

type GameContextValue = {
  user: User | null;
  token: string | null;
  game: GameState | null;
  tasks: Task[];
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshGame: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  addTask: (title: string) => Promise<void>;
  completeTask: (taskId: number) => Promise<void>;
  purchaseItem: (itemId: string) => Promise<void>;

  startSession: (
    taskTitle: string | null,
    taskId: number | null
  ) => Promise<{ id: number } | null>;
  endSession: (sessionId: number) => Promise<EndSessionSummary | null>;
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const savedToken = await AsyncStorage.getItem("auth_token");
      const savedUser = await AsyncStorage.getItem("auth_user");
      if (savedToken && savedUser) {
        setTokenState(savedToken);
        setAuthToken(savedToken);
        setUser(JSON.parse(savedUser));
        try {
          await Promise.all([
            refreshGameInternal(savedToken),
            refreshTasksInternal(savedToken),
          ]);
        } catch {
          // ignore on startup
        }
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshGameInternal(currentToken: string | null = token) {
    if (!currentToken) return;
    const data = await apiGetGameState();
    if (data.ok) {
      const {
        pet,
        currency,
        equipped,
        inventory,
        storyProgress,
        stories,
        store,
      } = data;
      setGame({
        pet,
        currency,
        equipped,
        inventory,
        storyProgress,
        stories,
        store,
      });
    }
  }

  async function refreshTasksInternal(currentToken: string | null = token) {
    if (!currentToken) return;
    const data = await apiGetTasksMe();
    if (data.ok) {
      setTasks(data.tasks);
    }
  }

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      const newToken = data.token;
      const newUser = data.user;

      setTokenState(newToken);
      setAuthToken(newToken);
      setUser(newUser);

      await AsyncStorage.setItem("auth_token", newToken);
      await AsyncStorage.setItem("auth_user", JSON.stringify(newUser));

      await Promise.all([
        refreshGameInternal(newToken),
        refreshTasksInternal(newToken),
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      setTokenState(null);
      setAuthToken(null);
      setUser(null);
      setGame(null);
      setTasks([]);
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("auth_user");
    } finally {
      setLoading(false);
    }
  }

  async function refreshGame() {
    await refreshGameInternal();
  }

  async function refreshTasks() {
    await refreshTasksInternal();
  }

  async function addTask(title: string) {
    if (!title.trim()) return;
    const data = await apiAddTask(title, 5, null);
    if (data.ok && data.task) {
      setTasks((prev) => [data.task, ...prev]);
    }
  }

  async function completeTask(taskId: number) {
    const data = await apiCompleteTask(taskId);
    if (data.ok) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
      );
      if (data.newCurrency != null) {
        setGame((prev) =>
          prev
            ? {
                ...prev,
                currency: data.newCurrency,
              }
            : prev
        );
      }
    }
  }

  async function purchaseItem(itemId: string) {
    if (!user) return;
    const data = await apiPurchase(user.id, itemId);
    if (data.ok) {
      setGame((prev) =>
        prev
          ? {
              ...prev,
              currency: data.currency,
              inventory: data.inventory,
            }
          : prev
      );
    }
  }

  async function startSession(
    taskTitle: string | null,
    taskId: number | null
  ) {
    try {
      const data = await apiStartSession(taskTitle, taskId);
      if (data.ok && data.session) {
        return { id: data.session.id };
      }
    } catch (e) {
      console.log("startSession failed:", e);
    }
    return null;
  }

  async function endSession(sessionId: number): Promise<EndSessionSummary | null> {
    try {
      const data: ApiEndSessionResult = await apiEndSession(sessionId);
      if (data.ok) {
        // Patch game state with new currency / pet / story progress
        setGame((prev) =>
          prev
            ? {
                ...prev,
                pet: data.pet ?? prev.pet,
                currency:
                  typeof data.newCurrency === "number"
                    ? data.newCurrency
                    : prev.currency,
                storyProgress:
                  typeof data.storyProgress === "number"
                    ? data.storyProgress
                    : prev.storyProgress,
              }
            : prev
        );

        return {
          reward: data.reward,
          newCurrency:
            typeof data.newCurrency === "number" ? data.newCurrency : null,
          pet: data.pet ?? null,
          evolved: !!data.evolved,
          oldStage: (data.oldStage as string | null) ?? null,
          newStage: (data.newStage as string | null) ?? null,
          moodChanged: !!data.moodChanged,
          oldMood: (data.oldMood as string | null) ?? null,
          newMood: (data.newMood as string | null) ?? null,
          storyProgress: data.storyProgress ?? 0,
        };
      }
    } catch (e) {
      console.log("endSession failed:", e);
    }
    return null;
  }

  const value: GameContextValue = {
    user,
    token,
    game,
    tasks,
    loading,
    login,
    logout,
    refreshGame,
    refreshTasks,
    addTask,
    completeTask,
    purchaseItem,
    startSession,
    endSession,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

