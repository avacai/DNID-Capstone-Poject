import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

const OPTIONS = ["Answer", "Answer", "Answer", "Answer"];

export default function Question3Screen() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.ribbon}>Question</Text>
        <Text style={styles.title}>How do you like to spend your time?</Text>

        {OPTIONS.map((opt, index) => (
          <Pressable
            key={index}
            style={[
              styles.answerBar,
              selected === index && styles.answerBarSelected,
            ]}
            onPress={() => setSelected(index)}
          >
            <Text style={styles.answerText}>{opt}</Text>
          </Pressable>
        ))}

        <Pressable
          style={[
            styles.nextButton,
            selected === null && { opacity: 0.5 },
          ]}
          disabled={selected === null}
          onPress={() => router.push("/onboarding/color")}
        >
          <Text style={styles.nextText}>Next</Text>
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
    justifyContent: "center",
  },
  card: {
    width: 260,
    borderRadius: 26,
    backgroundColor: "#31457B",
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 22,
  },
  ribbon: {
    position: "absolute",
    top: 10,
    left: 18,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: "#F7E39F",
    borderRadius: 10,
    fontWeight: "700",
    fontSize: 13,
  },
  title: {
    color: "#F9FAFB",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 16,
  },
  answerBar: {
    backgroundColor: "#F7E39F",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  answerBarSelected: {
    borderWidth: 3,
    borderColor: "#9CAAF8",
  },
  answerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  nextButton: {
    marginTop: 10,
    alignSelf: "center",
    width: 120,
    borderRadius: 20,
    backgroundColor: "#9CAAF8",
    paddingVertical: 8,
    alignItems: "center",
  },
  nextText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
});