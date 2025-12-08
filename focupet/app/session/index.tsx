import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Image,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { SessionTask } from "@/components/TaskModal";
import { useOnboarding, PetType } from "@/hooks/useOnboarding";

const { width, height } = Dimensions.get("window");

// --- 1. Shared Color Palette ---
const COLORS = {
  bg: '#FFFFFF',
  text: '#3D4C79',       // Dark Navy
  primary: '#9EB7E5',    // Periwinkle
  accent1: '#E8F0B8',    // Pale Lime
  accent2: '#F2E1AC',    // Sand/Cream
  stopBtn: '#1F2A44',    // Darker Navy for Stop
};

// --- 2. Assets ---
const PET_IMAGES: Record<PetType, any> = {
  Cat: require("@/assets/pets/cat_1.png"),
  Dog: require("@/assets/pets/dog_1.png"),
  Duck: require("@/assets/pets/duck_1.png"),
  Seal: require("@/assets/pets/seal_1.png"),
};

// --- 3. Helper Functions ---
function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// --- 4. Animation Components ---
const FloatingParticle = ({ delay, color, size, startX }: { delay: number; color: string; size: number; startX: number }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 10000 + Math.random() * 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [animValue]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [height, -100],
  });

  const translateX = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [startX, startX + 40, startX - 40],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.3,
        transform: [{ translateY }, { translateX }],
      }}
    />
  );
};

type Overlay = "none" | "pause" | "giveUp" | "success";
type RewardType = "item" | "story";

export default function SessionScreen() {
  const router = useRouter();
  // Get user's pet type
  const { petType } = useOnboarding();
  const fallbackType: PetType = petType ?? "Cat";
  const petSource = PET_IMAGES[fallbackType];

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

  // Pet "Breathing" Animation
  const breathAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (overlay === 'none' && !finished) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
          Animated.timing(breathAnim, { toValue: 1, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        ])
      ).start();
    } else {
      breathAnim.setValue(1); // Reset when paused/finished
    }
  }, [overlay, finished]);

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
    // steps: 0: summary -> 1: coins -> 2: random reward -> home
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
      <StatusBar barStyle="dark-content" />

      {/* Background Particles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <FloatingParticle delay={0} color={COLORS.accent1} size={140} startX={40} />
        <FloatingParticle delay={2000} color={COLORS.accent2} size={100} startX={width - 50} />
        <FloatingParticle delay={4000} color={COLORS.primary} size={120} startX={width / 2} />
      </View>

      {/* Big Time Pill */}
      <View style={styles.timePill}>
        <Text style={styles.timeText}>{formatTime(secondsLeft)}</Text>
      </View>

      {/* Task Bars */}
      <View style={styles.tasksWrapper}>
        {parsedTasks.slice(0, 2).map((t) => (
          <View key={t.id} style={styles.taskBar}>
            <Text style={styles.taskText} numberOfLines={1}>{t.title}</Text>
          </View>
        ))}
      </View>

      {/* Pet Placeholder (Replaced Grey Circle) */}
      <Animated.View style={[styles.petContainer, { transform: [{ scale: breathAnim }] }]}>
        <Image source={petSource} style={styles.petImage} resizeMode="contain" />
      </Animated.View>

      {/* Stop / Cancel bar */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={pauseTimer}
          style={({pressed}) => [
            styles.bottomBtn,
            styles.stopBtn,
            pressed && { opacity: 0.9 }
          ]}
        >
          <Text style={[styles.bottomText, { color: "#FFFFFF" }]}>Stop</Text>
        </Pressable>

        <Pressable
          onPress={cancelSession}
          style={({pressed}) => [
            styles.bottomBtn,
            styles.cancelBtn,
            pressed && { opacity: 0.9 }
          ]}
        >
          <Text style={[styles.bottomText, { color: COLORS.text }]}>Cancel</Text>
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
          <View style={styles.popupCard}>
            <Text style={styles.popupTitle}>You are almost there!</Text>
            <Text style={styles.popupText}>Don&apos;t give up!</Text>

            <Image source={petSource} style={styles.popupPet} resizeMode="contain" />

            <View style={styles.popupButtonsRow}>
              <Pressable
                onPress={resumeTimer}
                style={[styles.popupBtn, styles.popupBackBtn]}
              >
                <Text style={styles.popupBackText}>Back</Text>
              </Pressable>
              <Pressable
                onPress={handleGiveUp}
                style={[styles.popupBtn, styles.popupQuitBtn]}
              >
                <Text style={styles.popupQuitText}>Quit</Text>
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
          <View style={styles.popupCard}>
            <Text style={styles.popupTitle}>You can do it next time!</Text>
            <Text style={styles.popupText}>
              Your FocuPet will be cheering for you.
            </Text>

            <Image source={petSource} style={styles.popupPet} resizeMode="contain" />

            <View style={styles.singleBtnRow}>
              <Pressable
                onPress={handleGiveUpOk}
                style={[styles.popupBtn, styles.popupBackBtn]}
              >
                <Text style={styles.popupBackText}>Ok</Text>
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

            {/* Tape Decoration */}
            <View style={styles.tape} />

            <Image source={petSource} style={styles.successPet} resizeMode="contain" />

            {successStep === 0 && (
              <>
                <Text style={styles.successTitle}>You made it!</Text>
                <Text style={styles.successBody}>
                  You have focused for {formatTime(initialSeconds)}.
                </Text>
                {firstTaskTitle ? (
                  <Text style={styles.successBodySmall}>
                    Great job finishing:{"\n"}
                    <Text style={{ fontWeight: "800" }}>{firstTaskTitle}</Text>
                  </Text>
                ) : null}
              </>
            )}

            {successStep === 1 && (
              <>
                <Text style={styles.successTitle}>Good Job!</Text>
                <Text style={styles.successBody}>You&apos;ve earned:</Text>
                <Text style={styles.successReward}>+ 20 coins 🐾</Text>
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
                <Text style={[styles.successBodySmall, { marginTop: 8, opacity: 0.7 }]}>
                  You can view it in the Story tab later.
                </Text>
              </>
            )}

            <Pressable
              onPress={handleSuccessNext}
              style={({pressed}) => [
                styles.successNextBtn,
                pressed && { transform: [{scale: 0.98}] }
              ]}
            >
              <Text style={styles.successNextText}>
                {successStep === 2 ? "Back Home" : "Next →"}
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
    backgroundColor: COLORS.bg,
    alignItems: "center",
    paddingTop: 80,
  },
  // Time Pill
  timePill: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 12,
    marginBottom: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  timeText: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 1,
    color: '#FFFFFF',
  },
  // Task Bars
  tasksWrapper: {
    width: "80%",
    gap: 12,
    marginBottom: 40,
  },
  taskBar: {
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.accent2, // Sand
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  taskText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  // Pet Container
  petContainer: {
    width: 240,
    height: 240,
    borderRadius: 120,
    // backgroundColor: '#FFF', // Optional: Circle behind pet
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  petImage: {
    width: 200,
    height: 200,
  },
  // Bottom Bar
  bottomBar: {
    flexDirection: "row",
    width: "85%",
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  bottomBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stopBtn: {
    backgroundColor: COLORS.stopBtn,
  },
  cancelBtn: {
    backgroundColor: COLORS.primary,
  },
  bottomText: {
    fontSize: 18,
    fontWeight: "800",
  },

  // --- MODALS ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(61, 76, 121, 0.5)", // Navy Tint
    alignItems: "center",
    justifyContent: "center",
  },

  // Popup Card (Pause/GiveUp)
  popupCard: {
    width: "85%",
    borderRadius: 32,
    backgroundColor: COLORS.accent2, // Sand
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    color: COLORS.text,
  },
  popupText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
    color: COLORS.text,
    fontWeight: '600',
  },
  popupPet: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  popupButtonsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 12,
  },
  singleBtnRow: {
    width: "100%",
    marginTop: 10,
  },
  popupBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  popupBackBtn: {
    backgroundColor: COLORS.primary, // Periwinkle
  },
  popupQuitBtn: {
    backgroundColor: COLORS.stopBtn, // Navy
  },
  popupBackText: {
    color: '#FFFFFF',
    fontWeight: "800",
    fontSize: 16,
  },
  popupQuitText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },

  // Success Card
  successCard: {
    width: "85%",
    borderRadius: 32,
    backgroundColor: COLORS.boardBg, // Navy Board
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    position: 'relative',
    shadowColor: COLORS.boardBg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  tape: {
    position: 'absolute',
    top: -15,
    width: 80,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ rotate: '-2deg' }],
  },
  successPet: {
    width: 160,
    height: 160,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
    color: '#FFFFFF',
  },
  successBody: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 4,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  successBodySmall: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    color: COLORS.accent1, // Lime
    fontWeight: '600',
  },
  successReward: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 10,
    color: COLORS.accent2, // Sand
  },
  itemBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.accent2,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  successNextBtn: {
    marginTop: 30,
    backgroundColor: COLORS.accent1, // Lime
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  successNextText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
});