// app/session/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { SessionTask } from "@/components/TaskModal";

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

  const parsedTasks: SessionTask[] = useMemo(
    () => (tasks ? JSON.parse(tasks as string) : []),
    [tasks]
  );

  const initialSeconds =
    (minutes ? parseInt(minutes as string, 10) : 25) * 60;

  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  // start countdown
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // when timer hits 0, stop it
  useEffect(() => {
    if (secondsLeft === 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      // TODO: show “session complete” modal / reward coins, etc.
    }
  }, [secondsLeft]);

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    router.replace("/(tabs)/home"); // end session → back home
  };

  const cancelSession = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    router.replace("/(tabs)/home"); // or router.back() if you prefer
  };

  return (
    <View style={styles.container}>
      {/* big time pill */}
      <View style={styles.timePill}>
        <Text style={styles.timeText}>{formatTime(secondsLeft)}</Text>
      </View>

      {/* two task bars (just visual for now) */}
      <View style={styles.tasksWrapper}>
        {parsedTasks.slice(0, 2).map((t) => (
          <View key={t.id} style={styles.taskBar} />
        ))}
      </View>

      {/* pet circle placeholder */}
      <View style={styles.petCircle} />

      {/* Stop / Cancel bar */}
      <View style={styles.bottomBar}>
        <Pressable onPress={stopTimer} style={[styles.bottomBtn, styles.stopBtn]}>
          <Text style={[styles.bottomText, { color: "#FFFFFF" }]}>Stop</Text>
        </Pressable>

        <Pressable onPress={cancelSession} style={[styles.bottomBtn, styles.cancelBtn]}>
          <Text style={[styles.bottomText, { color: "#111827" }]}>Cancel</Text>
        </Pressable>
      </View>
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