// app/onboarding/quiz.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { QUIZ_QUESTIONS, QuizOption } from "./quizConfig";
import { determinePetFromAnswers } from "./quizLogic";
import { MaterialIcons } from "@expo/vector-icons";

export default function QuizScreen() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(QuizOption | null)[]>(
    Array(QUIZ_QUESTIONS.length).fill(null)
  );
  const question = QUIZ_QUESTIONS[currentIndex];
  const selected = answers[currentIndex];

  const handleSelect = (option: QuizOption) => {
    const next = [...answers];
    next[currentIndex] = option;
    setAnswers(next);
  };

  const handleNext = () => {
    if (!selected) return;

    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    // Last question → decide pet and go to next onboarding step
    const pickedOptions = answers.filter(
      (a): a is QuizOption => a !== null
    );
    const pet = determinePetFromAnswers(pickedOptions);
    console.log("Chosen pet:", pet);

    // For now: go to a stub screen with the chosen pet.
    // Later you'll route to color select screen.
    router.push({
      pathname: "/onboarding/color",
      params: { pet },
    });
  };

  const canGoNext = !!selected;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* small header "Question" + progress dots */}
        <View style={styles.topRow}>
          <Text style={styles.smallLabel}>Question</Text>
          <View style={styles.dotsRow}>
            {QUIZ_QUESTIONS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Blue card */}
        <View style={styles.card}>
          <Text style={styles.questionText}>{question.text}</Text>

          <View style={styles.optionsList}>
            {question.options.map((opt) => {
              const isSelected = selected?.id === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => handleSelect(opt)}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                >
                  <Text style={styles.optionText}>{opt.label}</Text>
                  <View style={styles.checkbox}>
                    {isSelected && (
                      <MaterialIcons
                        name="check"
                        size={18}
                        color="#111827"
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[styles.nextButton, !canGoNext && { opacity: 0.4 }]}
            disabled={!canGoNext}
            onPress={handleNext}
          >
            <Text style={styles.nextText}>
              {currentIndex === QUIZ_QUESTIONS.length - 1
                ? "Hatch my FocuPet"
                : "Next"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFDF5",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFDF5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  topRow: {
    width: "100%",
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  smallLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  dotActive: {
    backgroundColor: "#9CAAF8",
  },
  card: {
    width: "100%",
    borderRadius: 26,
    backgroundColor: "#2D3C90", // deep blue
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  questionText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#F9FAFB",
    marginBottom: 16,
  },
  optionsList: {
    marginTop: 4,
  },
  optionCard: {
    backgroundColor: "#F6E29A", // sticky-note yellow
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: "#9CAAF8",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    marginRight: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FBBF24",
  },
  nextButton: {
    marginTop: 20,
    alignSelf: "center",
    borderRadius: 20,
    backgroundColor: "#9CAAF8",
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  nextText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
});