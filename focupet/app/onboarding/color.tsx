import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import type { PetType } from "./quizConfig";

const COLORS = ["#F6AFC9", "#B5C5FF", "#E6C8FF"];

export default function ColorScreen() {
  const router = useRouter();
  const { pet } = useLocalSearchParams<{ pet: PetType }>(); // 👈 get pet from quiz
  const [selected, setSelected] = useState<number | null>(null);

  const handleHatch = () => {
    if (selected === null) return;

    const color = COLORS[selected];

    router.push({
      pathname: "/onboarding/name",
      params: { pet, color }, // pass both along
    });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.question}>What color is your pet?</Text>

      <View style={styles.colorRow}>
        {COLORS.map((c, idx) => (
          <Pressable
            key={c}
            onPress={() => setSelected(idx)}
            style={[
              styles.colorBubble,
              { backgroundColor: c },
              idx === selected && styles.colorBubbleSelected,
            ]}
          />
        ))}
      </View>

      <Pressable
        style={[styles.hatchButton, selected === null && { opacity: 0.5 }]}
        disabled={selected === null}
        onPress={() => router.push("/onboarding/name")}
      >
        <Text style={styles.hatchText}>Hatch</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  question: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 40,
  },
  colorRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 40,
  },
  colorBubble: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  colorBubbleSelected: {
    borderWidth: 4,
    borderColor: "#31457B",
  },
  hatchButton: {
    marginTop: 8,
    width: 140,
    borderRadius: 22,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#9CAAF8",
  },
  hatchText: {
    fontWeight: "800",
    fontSize: 16,
    color: "#111827",
  },
});