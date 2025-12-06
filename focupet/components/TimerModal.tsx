import React, { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Image, Animated} from "react-native";

type Props = {
  initialMinutes?: number;
  onBack: () => void;
  onStart: (minutes: number) => void;
};

export default function TimerModal({
  initialMinutes = 25,
  onBack,
  onStart,
}: Props) {
  const [minutes, setMinutes] = useState(initialMinutes);

  const inc = () => setMinutes((m) => Math.min(180, m + 5));
  const dec = () => setMinutes((m) => Math.max(5, m - 5));
  const startScale = useRef(new Animated.Value(1)).current;
  const backScale = useRef(new Animated.Value(1)).current;

  const pressIn = (anim: Animated.Value) =>
    Animated.spring(anim, { toValue: 0.94, useNativeDriver: true }).start();

  const pressOut = (anim: Animated.Value) =>
    Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onBack} />

      <View style={styles.card}>
        <Text style={styles.title}>Time you want to deep focus</Text>

        <View style={styles.timeBox}>
          <Text style={styles.timeText}>
            {String(minutes).padStart(2, "0")}:00
          </Text>
        </View>

        <View style={styles.controlsRow}>
          <Pressable onPress={dec} style={styles.circleBtn}>
            <Text style={styles.circleLabel}>−</Text>
          </Pressable>
          <Pressable onPress={inc} style={styles.circleBtn}>
            <Text style={styles.circleLabel}>＋</Text>
          </Pressable>
        </View>

        <View style={styles.buttonRow}>
         <Pressable
            onPressIn={() => pressIn(backScale)}
            onPressOut={() => pressOut(backScale)}
            onPress={onBack}
          >
            <Animated.Image
              source={require("@/assets/ui/button_back.png")}
              style={[styles.backButton, { transform: [{ scale: backScale }] }]}
              resizeMode="contain"
            />
          </Pressable>

         <Pressable
            onPressIn={() => pressIn(startScale)}
            onPressOut={() => pressOut(startScale)}
            onPress={() => onStart(minutes)}
          >
            <Animated.Image
              source={require("@/assets/ui/button_start.png")}
              style={[styles.startButton, { transform: [{ scale: startScale }] }]}
              resizeMode="contain"
            />
          </Pressable>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-end",
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#F6E9B8",
    borderRadius: 22,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
    fontSize: 16,
  },
  timeBox: {
    alignSelf: "center",
    backgroundColor: "#B9C5F7",
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  timeText: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 1,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 18,
  },
  circleBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#B9C5F7",
    alignItems: "center",
    justifyContent: "center",
  },
  circleLabel: {
    fontSize: 28,
    fontWeight: "900",
  },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 25,
      width: "100%",
      alignSelf: "center",
    },

    startButton: {
      width: 160,
      height: 70,
    },

    backButton: {
      width: 160,
      height: 70,
    },

  longBtn: {
    backgroundColor: "#A0B1F3",
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: "center",
  },
  longLabel: {
    fontSize: 20,
    fontWeight: "800",
  },
});