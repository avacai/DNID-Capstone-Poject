// app/session/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { SessionTask } from "@/components/TaskModal";
import { useGame } from "@/src/context/GameContext";
import SessionCompleteModal from "@/components/SessionCompleteModal";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function SessionScreen() {
  const router = useRouter();
  const { minutes, tasks } = useLocalSearchParams<{
    minutes?: string;
    tasks?: string;
  }>();

  const { startSession, endSession } = useGame();

  const parsedTasks: SessionTask[] = useMemo(
    () => (tasks ? JSON.parse(tasks as string) : []),
    [tasks]
  );

  const initialSeconds =
    (minutes ? parseInt(minutes as string, 10) : 25) * 60;

  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const [showComplete, setShowComplete] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [expEarned, setExpEarned] = useState(0);

  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const startedRef = useRef(false);
  const endedRef = useRef(false);

  // start countdown timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // when timer hits 0, stop and complete the session
  useEffect(() => {
    if (secondsLeft === 0 && !endedRef.current) {
      // stop ticking
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // auto-finish the session and show rewards
      void finishSessionAndShowRewards(true);
    }
  }, [secondsLeft]);

  // Start backend session once on mount
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const firstTaskTitle = parsedTasks[0]?.title ?? null;
        const active = await startSession(firstTaskTitle, null);
        if (active) {
          setSessionId(active.id);
        }
      } catch (e) {
        console.log("Failed to start backend session:", e);
      }
    })();
  }, [parsedTasks, startSession]);

  // Shared helper: end backend session and show rewards (unless cancelled)
  async function finishSessionAndShowRewards(autoFinished: boolean) {
    if (endedRef.current) return;
    endedRef.current = true;

    try {
      const result = await endSession(sessionId ?? undefined);
      if (result) {
        setCoinsEarned(result.reward.currency || 0);
        setExpEarned(result.reward.petExp || 0);

        // For Cancel path we might skip the modal – handled separately.
        if (!autoFinished) {
          setShowComplete(true);
        } else {
          // Auto-finish at 0: still show rewards
          setShowComplete(true);
        }
      } else {
        // If no result, just send them home
        router.replace("/(tabs)/home");
      }
    } catch (e) {
      console.log("Failed to end session:", e);
      router.replace("/(tabs)/home");
    }
  }

  const handleStop = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    await finishSessionAndShowRewards(false);
  };

  const handleCancel = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // We still end the session in the backend (so the timer is closed),
    // but we skip showing the rewards modal.
    if (!endedRef.current) {
      endedRef.current = true;
      try {
        await endSession(sessionId ?? undefined);
      } catch (e) {
        console.log("Failed to end session on Cancel:", e);
      }
    }
    router.replace("/(tabs)/home");
  };

  const handleCloseModal = () => {
    setShowComplete(false);
    router.replace("/(tabs)/home");
  };

  return (
    <View style={styles.container}>
      {/* big time pill */}
      <View style={styles.timePill}>
        <Text style={styles.timeText}>{formatTime(secondsLeft)}</Text>
      </View>

      {/* simple task preview bars (visual only for now) */}
      <View style={styles.tasksWrapper}>
        {parsedTasks.slice(0, 2).map((t) => (
          <View key={t.id} style={styles.taskBar} />
        ))}
      </View>

      {/* pet circle placeholder (later: show equipped pet sprite) */}
      <View style={styles.petCircle} />

      {/* Stop / Cancel bar */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={handleStop}
          style={[styles.bottomBtn, styles.stopBtn]}
        >
          <Text style={[styles.bottomText, { color: "#FFFFFF" }]}>Stop</Text>
        </Pressable>

        <Pressable
          onPress={handleCancel}
          style={[styles.bottomBtn, styles.cancelBtn]}
        >
          <Text style={[styles.bottomText, { color: "#111827" }]}>
            Cancel
          </Text>
        </Pressable>
      </View>

      <SessionCompleteModal
        visible={showComplete}
        coinsEarned={coinsEarned}
        expEarned={expEarned}
        onClose={handleCloseModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF5",
    alignItems: "center",
    paddingTop: 80,
  },
  timePill: {
    backgroundColor: "#B9C5F7",
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 10,
    marginBottom: 24,
  },
  timeText: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 1,
  },
  tasksWrapper: {
    width: "80%",
    gap: 12,
    marginBottom: 24,
  },
  taskBar: {
    height: 32,
    borderRadius: 10,
    backgroundColor: "#B9C5F7",
  },
  petCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#DFE1E4",
    marginBottom: 60,
  },
  bottomBar: {
    flexDirection: "row",
    width: "90%",
    borderRadius: 24,
    overflow: "hidden",
  },
  bottomBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stopBtn: {
    backgroundColor: "#1F2A44",
  },
  cancelBtn: {
    backgroundColor: "#A0B1F3",
  },
  bottomText: {
    fontSize: 18,
    fontWeight: "800",
  },
});
