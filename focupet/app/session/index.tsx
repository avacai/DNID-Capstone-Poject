// app/session/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { SessionTask } from "@/components/TaskModal";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type Overlay = "none" | "pause" | "giveUp" | "success";
type RewardType = "item" | "story";

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
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [successStep, setSuccessStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [rewardType, setRewardType] = useState<RewardType>("item");

  const intervalRef = useRef<NodeJS.Timer | null>(null);

  const startInterval = () => {
    if (intervalRef.current || finished) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
  };

  const clearIntervalRef = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // start countdown on mount
  useEffect(() => {
    startInterval();
    return () => clearIntervalRef();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when timer hits 0, stop it & show success flow
  useEffect(() => {
    if (secondsLeft === 0 && !finished) {
      clearIntervalRef();
      setFinished(true);

      // choose random reward: item or story
      const rnd: RewardType = Math.random() < 0.5 ? "item" : "story";
      setRewardType(rnd);

      setOverlay("success");
      setSuccessStep(0);
    }
  }, [secondsLeft, finished]);

  const pauseTimer = () => {
    clearIntervalRef();
    setOverlay("pause");
  };

  const resumeTimer = () => {
    setOverlay("none");
    startInterval();
  };

  const stopAndReturnHome = () => {
    clearIntervalRef();
    router.replace("/(tabs)/home");
  };

  const cancelSession = () => {
    stopAndReturnHome();
  };

  const handleGiveUp = () => {
    clearIntervalRef();
    setOverlay("giveUp");
  };

  const handleGiveUpOk = () => {
    stopAndReturnHome();
  };

  const handleSuccessNext = () => {
    // steps:
    // 0: summary
    // 1: coins
    // 2: random reward (item OR story) → then home
    if (successStep < 2) {
      setSuccessStep((s) => s + 1);
    } else {
      stopAndReturnHome();
    }
  };

  // Pull first task name for copy
  const firstTaskTitle =
    parsedTasks.length > 0 ? parsedTasks[0].title ?? parsedTasks[0].text ?? "" : "";

  // (Optional) placeholder names if you want to show a random item/story label
  const possibleItems = ["Bow", "Mug", "Cozy Sweater", "Toy Mouse"];
  const possibleStories = ["Chapter 1: First Meeting", "Chapter 2: Morning Light", "New Memory Unlocked"];

  const randomItemName =
    possibleItems[Math.floor(Math.random() * possibleItems.length)];
  const randomStoryName =
    possibleStories[Math.floor(Math.random() * possibleStories.length)];

  return (
    <View style={styles.container}>
      {/* big time pill */}
      <View style={styles.timePill}>
        <Text style={styles.timeText}>{formatTime(secondsLeft)}</Text>
      </View>

      {/* simple task bars */}
      <View style={styles.tasksWrapper}>
        {parsedTasks.slice(0, 2).map((t) => (
          <View key={t.id} style={styles.taskBar} />
        ))}
      </View>

      {/* pet circle placeholder */}
      <View style={styles.petCircle} />

      {/* Stop / Cancel bar */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={pauseTimer}
          style={[styles.bottomBtn, styles.stopBtn]}
        >
          <Text style={[styles.bottomText, { color: "#FFFFFF" }]}>Stop</Text>
        </Pressable>

        <Pressable
          onPress={cancelSession}
          style={[styles.bottomBtn, styles.cancelBtn]}
        >
          <Text style={[styles.bottomText, { color: "#111827" }]}>Cancel</Text>
        </Pressable>
      </View>

      {/* ---------- PAUSE POPUP ---------- */}
      <Modal
        visible={overlay === "pause"}
        transparent
        animationType="fade"
        onRequestClose={resumeTimer}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>You are almost there!</Text>
            <Text style={styles.pauseText}>Don&apos;t give up!</Text>

            <Image
              source={require("@/assets/pets/cat1.png")}
              style={styles.pausePet}
              resizeMode="contain"
            />

            <View style={styles.pauseButtonsRow}>
              <Pressable
                onPress={resumeTimer}
                style={[styles.pauseBtn, styles.pauseBackBtn]}
              >
                <Text style={styles.pauseBackText}>Back</Text>
              </Pressable>
              <Pressable
                onPress={handleGiveUp}
                style={[styles.pauseBtn, styles.pauseQuitBtn]}
              >
                <Text style={styles.pauseQuitText}>Quit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---------- GIVE-UP POPUP ---------- */}
      <Modal
        visible={overlay === "giveUp"}
        transparent
        animationType="fade"
        onRequestClose={handleGiveUpOk}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>You can do it next time!</Text>
            <Text style={styles.pauseText}>
              Your FocuPet will be cheering for you.
            </Text>

            <Image
              source={require("@/assets/pets/cat1.png")}
              style={styles.pausePet}
              resizeMode="contain"
            />

            <View style={styles.singleBtnRow}>
              <Pressable
                onPress={handleGiveUpOk}
                style={[styles.pauseBtn, styles.pauseBackBtn]}
              >
                <Text style={styles.pauseBackText}>Ok</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---------- SUCCESS FLOW POPUP ---------- */}
      <Modal
        visible={overlay === "success"}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessNext}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <Image
              source={require("@/assets/pets/cat1.png")}
              style={styles.successPet}
              resizeMode="contain"
            />

            {successStep === 0 && (
              <>
                <Text style={styles.successTitle}>You made it!</Text>
                <Text style={styles.successBody}>
                  You have focused for {formatTime(initialSeconds)}.
                </Text>
                {firstTaskTitle ? (
                  <Text style={styles.successBodySmall}>
                    Great job finishing:{" "}
                    <Text style={{ fontWeight: "800" }}>{firstTaskTitle}</Text>
                  </Text>
                ) : null}
              </>
            )}

            {successStep === 1 && (
              <>
                <Text style={styles.successTitle}>Good Job!</Text>
                <Text style={styles.successBody}>You&apos;ve earned:</Text>
                <Text style={styles.successReward}>+ 20 coins</Text>
              </>
            )}

            {successStep === 2 && rewardType === "item" && (
              <>
                <Text style={styles.successTitle}>Good Job!</Text>
                <Text style={styles.successBody}>
                  You&apos;ve earned a secret item.
                </Text>
                <View style={styles.itemBox} />
                <Text style={styles.successBodySmall}>
                  {randomItemName}
                </Text>
              </>
            )}

            {successStep === 2 && rewardType === "story" && (
              <>
                <Text style={styles.successTitle}>Good Job!</Text>
                <Text style={styles.successBody}>
                  You have unlocked a new story.
                </Text>
                <Text style={styles.successBodySmall}>
                  {randomStoryName}
                </Text>
                <Text style={[styles.successBodySmall, { marginTop: 8 }]}>
                  You can view it in the Story tab later.
                </Text>
              </>
            )}

            <Pressable
              onPress={handleSuccessNext}
              style={styles.successNextBtn}
            >
              <Text style={styles.successNextText}>
                {successStep === 2 ? "Back Home" : "Next"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  pauseCard: {
    width: "80%",
    borderRadius: 24,
    backgroundColor: "#FDF2C7",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  pauseTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  pauseText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  pausePet: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  pauseButtonsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginTop: 6,
  },
  singleBtnRow: {
    width: "60%",
    marginTop: 8,
  },
  pauseBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pauseBackBtn: {
    backgroundColor: "#9CAAF8",
    marginRight: 8,
  },
  pauseQuitBtn: {
    backgroundColor: "#1F2A44",
    marginLeft: 8,
  },
  pauseBackText: {
    color: "#111827",
    fontWeight: "800",
  },
  pauseQuitText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  successCard: {
    width: "80%",
    borderRadius: 24,
    backgroundColor: "#FFF9DC",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 18,
  },
  successPet: {
    width: 180,
    height: 160,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },
  successBody: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 4,
  },
  successBodySmall: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    color: "#4B5563",
  },
  successReward: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 6,
    marginBottom: 6,
  },
  itemBox: {
    width: 80,
    height: 100,
    borderRadius: 16,
    backgroundColor: "#FDE68A",
    marginTop: 10,
  },
  successNextBtn: {
    marginTop: 18,
    backgroundColor: "#9CAAF8",
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 10,
  },
  successNextText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
});