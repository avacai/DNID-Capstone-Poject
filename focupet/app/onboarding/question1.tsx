import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

const OPTIONS = ["Shy", "Outgoing"] as const;

export default function Question1Screen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.ribbon}>Question</Text>
        <Text style={styles.title}>Which best describes you?</Text>

        {OPTIONS.map((opt) => (
          <Pressable
            key={opt}
            style={[
              styles.answerCard,
              selected === opt && styles.answerCardSelected,
            ]}
            onPress={() => setSelected(opt)}
          >
            <Text style={styles.answerText}>{opt}</Text>
          </Pressable>
        ))}

        <Pressable
          style={[
            styles.nextButton,
            !selected && { opacity: 0.5 },
          ]}
          disabled={!selected}
          onPress={() => router.push("/onboarding/question2")}
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
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 20,
  },
  answerCard: {
    backgroundColor: "#F7E39F",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  answerCardSelected: {
    borderWidth: 3,
    borderColor: "#9CAAF8",
  },
  answerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  nextButton: {
    marginTop: 6,
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
