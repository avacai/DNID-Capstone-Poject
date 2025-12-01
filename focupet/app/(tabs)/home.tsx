import React, { useRef, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  Pressable,
  Animated,
  Modal,
  ImageBackground,
} from "react-native";
import TaskModal, { SessionTask } from "@/components/TaskModal";
import TimerModal from "@/components/TimerModal";
import { useRouter } from "expo-router";
import CoinBar from "@/components/CoinBar";

export default function Home() {
  // which popup is showing?
  const [step, setStep] = useState<"none" | "tasks" | "timer">("none");
  const router = useRouter();

  // data collected from the popups
  const [sessionTasks, setSessionTasks] = useState<SessionTask[]>([]);
  const [sessionMinutes, setSessionMinutes] = useState(25);

  // animation for Start button
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const handleTasksDone = (tasks: SessionTask[]) => {
    setSessionTasks(tasks);
    setStep("timer");
  };

  const handleTimerStart = (minutes: number) => {
    setSessionMinutes(minutes);
    setStep("none");

    // navigate to full session screen
    router.push({
      pathname: "/session",
      params: {
        minutes: String(minutes),
        tasks: JSON.stringify(sessionTasks),
      },
    });
  };

  return (
    <ImageBackground
      source={require("@/assets/bg/background1.png")}
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFDF5" />

        {/* top icons */}
        <View style={styles.topRow}>
          <Pressable onPress={() => console.log("Settings")}>
            <Image
              source={require("@/assets/ui/setting.png")}
              style={styles.icon}
            />
          </Pressable>

          <Pressable onPress={() => console.log("Music toggle")}>
            <Image
              source={require("@/assets/ui/music.png")}
              style={styles.icon}
            />
          </Pressable>
        </View>

        {/* coin bar */}
        <View style={styles.coinRow}>
          <CoinBar
            coins={120} // later this comes from state
            onPressPlus={() => console.log("Open coin purchase / store")}
          />
        </View>

        {/* PET CIRCLE + CAT */}
        <View style={styles.petCircle}>
          <Image
            source={require("@/assets/pets/cat1.png")}
            style={styles.petImage}
            resizeMode="contain"
          />
        </View>

        {/* Start button */}
        <View style={styles.startWrapper}>
          <Pressable
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={() => setStep("tasks")}
          >
            <Animated.Image
              source={require("@/assets/ui/start_b.png")}
              style={[styles.startImage, { transform: [{ scale }] }]}
            />
          </Pressable>
        </View>

        {/* --- TASK POPUP --- */}
        <Modal
          visible={step === "tasks"}
          transparent
          animationType="fade"
          onRequestClose={() => setStep("none")}
        >
          <TaskModal
            initialTasks={sessionTasks}
            onNext={handleTasksDone}
            onClose={() => setStep("none")}
          />
        </Modal>

        {/* --- TIMER POPUP --- */}
        <Modal
          visible={step === "timer"}
          transparent
          animationType="fade"
          onRequestClose={() => setStep("none")}
        >
          <TimerModal
            initialMinutes={sessionMinutes}
            onBack={() => setStep("tasks")}
            onStart={handleTimerStart}
          />
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // full-screen background
  bg: {
    flex: 1,
  },
  bgImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  container: {
    flex: 1,
    backgroundColor: "rgba(255, 253, 245, 0.8)", // soft overlay so UI pops on bg
    alignItems: "center",
    paddingTop: 60,
  },
  topRow: {
    width: "85%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    width: 44,
    height: 44,
    resizeMode: "contain",
  },
  coinRow: {
    marginTop: 16,
    alignItems: "center",
  },

  petCircle: {
    marginTop: 60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(223, 225, 228, 0.95)",
    justifyContent: "flex-end",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  petImage: {
    width: "80%",
    height: "95%",
    marginBottom: -10, // makes paws sit on the “floor” line
  },

  startWrapper: {
    marginTop: 60,
  },
  startImage: {
    width: 300,
    height: 72,
    resizeMode: "contain",
  },
});