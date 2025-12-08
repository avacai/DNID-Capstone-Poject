import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import {
  QUIZ_QUESTIONS,
  type QuizOption,
} from "../../lib/quizConfig"; // Adjust path if needed
import { determinePetFromAnswers } from "../../lib/quizLogic"; // Adjust path if needed
import { useOnboarding } from "../../hooks/useOnboarding"; // Adjust path if needed
import { api } from "../../lib/api"; // Adjust path if needed

const { width, height } = Dimensions.get("window");

// --- Color Palette ---
const COLORS = {
  bg: '#FFFFFF',
  boardBg: '#3D4C79',    // Navy
  optionBg: '#F2E1AC',   // Sand
  optionSelected: '#E8F0B8', // Lime
  text: '#3D4C79',
  textLight: '#FFFFFF',
  primary: '#9EB7E5',    // Periwinkle
  dotInactive: 'rgba(255,255,255,0.3)',
  dotActive: '#E8F0B8',
};

// --- Animations ---

// Background Floating Particles
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

export default function QuizScreen() {
  const router = useRouter();
  const { setPetType } = useOnboarding();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(QuizOption | null)[]>(
    Array(QUIZ_QUESTIONS.length).fill(null)
  );

  // Animation values for slide transition
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const question = QUIZ_QUESTIONS[currentIndex];
  const selected = answers[currentIndex];
  const canGoNext = !!selected;

  const animateTransition = (callback: () => void) => {
    Animated.sequence([
      // Fade out & slide left
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -50, duration: 200, useNativeDriver: true }),
      ]),
      // Update state
      Animated.timing(slideAnim, { toValue: 50, duration: 0, useNativeDriver: true }), // Reset position
    ]).start(() => {
      callback();
      // Fade in & slide to center
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleSelect = (option: QuizOption) => {
    const next = [...answers];
    next[currentIndex] = option;
    setAnswers(next);
  };

  const handleNext = async () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      animateTransition(() => setCurrentIndex((i) => i + 1));
      return;
    }

    // Finish Quiz
    const pickedOptions = answers.filter((a): a is QuizOption => a !== null);
    const pet = determinePetFromAnswers(pickedOptions);
    setPetType(pet);

    try {
      await api.petInit(pet);
    } catch (e) {
      console.log("petInit error", e);
    }

    router.push("/onboarding/color"); // Or wherever you go next
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Background Particles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <FloatingParticle delay={0} color={COLORS.optionSelected} size={140} startX={40} />
        <FloatingParticle delay={2000} color={COLORS.optionBg} size={100} startX={width - 50} />
        <FloatingParticle delay={4000} color={COLORS.primary} size={120} startX={width / 2} />
      </View>

      <View style={styles.container}>

        {/* Header: Progress Dots */}
        <View style={styles.topRow}>
          <Text style={styles.questionLabel}>Question {currentIndex + 1}</Text>
          <View style={styles.dotsRow}>
            {QUIZ_QUESTIONS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === currentIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* The Navy Board Card */}
        <View style={styles.board}>
          {/* Tape Decoration */}
          <View style={styles.tape} />

          {/* Animated Question Content */}
          <Animated.View
            style={[
              styles.contentWrapper,
              { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }
            ]}
          >
            <Text style={styles.questionText}>{question.text}</Text>

            <View style={styles.optionsList}>
              {question.options.map((opt) => {
                const isSelected = selected?.id === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => handleSelect(opt)}
                    style={({ pressed }) => [
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                      pressed && { transform: [{ scale: 0.98 }] }
                    ]}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {opt.label}
                    </Text>

                    {/* Checkbox Circle */}
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && (
                        <MaterialIcons name="check" size={16} color={COLORS.text} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Next Button */}
          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              !canGoNext && { opacity: 0.5 },
              pressed && { transform: [{ scale: 0.96 }] }
            ]}
            disabled={!canGoNext}
            onPress={handleNext}
          >
            <Text style={styles.nextText}>
              {currentIndex === QUIZ_QUESTIONS.length - 1 ? "Hatch FocuPet ✨" : "Next →"}
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
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  // Header
  topRow: {
    width: "100%",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    opacity: 0.6,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotInactive: {
    backgroundColor: '#D1D5DB', // Light Grey
  },
  dotActive: {
    backgroundColor: COLORS.primary, // Periwinkle
    width: 20, // Stretch active dot
  },

  // Navy Board
  board: {
    width: "100%",
    borderRadius: 32,
    backgroundColor: COLORS.boardBg, // Navy
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    position: 'relative',
    shadowColor: COLORS.boardBg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  tape: {
    position: 'absolute',
    top: -15,
    width: 80,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ rotate: '-3deg' }],
  },
  contentWrapper: {
    width: '100%',
  },

  // Text
  questionText: {
    fontSize: 22,
    fontWeight: "900",
    color: '#FFF',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 28,
  },

  // Options
  optionsList: {
    gap: 12,
    width: '100%',
  },
  optionCard: {
    backgroundColor: COLORS.optionBg, // Sand
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionCardSelected: {
    backgroundColor: COLORS.optionSelected, // Lime
    borderWidth: 2,
    borderColor: '#FFF',
    transform: [{ scale: 1.02 }],
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginRight: 10,
  },
  optionTextSelected: {
    fontWeight: "800",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(61, 76, 121, 0.3)',
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },

  // Button
  nextButton: {
    marginTop: 32,
    width: '80%',
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary, // Periwinkle
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  nextText: {
    fontSize: 18,
    fontWeight: "800",
    color: '#FFF',
  },
});