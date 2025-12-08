import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
// Restoring your component import
import ImageButton from "@/components/ImageButton";

const { width, height } = Dimensions.get("window");

// --- 1. Shared Color Palette ---
const COLORS = {
  bg: '#FFFFFF',
  text: '#3D4C79',       // Dark Navy
  primary: '#9EB7E5',    // Periwinkle
  accent1: '#E8F0B8',    // Pale Lime
  accent2: '#F2E1AC',    // Sand/Cream
};

// --- 2. Animation Components ---

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
        opacity: 0.4,
        transform: [{ translateY }, { translateX }],
      }}
    />
  );
};

// The "Focus Friends" Animated Logo
const AnimatedLogo = () => {
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createPulse = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1.15, duration: 1500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    };

    createPulse(pulse1, 0);
    createPulse(pulse2, 500);
    createPulse(pulse3, 1000);
  }, []);

  return (
    <View style={styles.logoContainer}>
      {/* Big Circle (Periwinkle) */}
      <Animated.View style={[styles.logoCircle, styles.logoBig, { transform: [{ scale: pulse1 }] }]} />
      {/* Medium Circle (Lime) */}
      <Animated.View style={[styles.logoCircle, styles.logoMedium, { transform: [{ scale: pulse2 }] }]} />
      {/* Small Circle (Sand) */}
      <Animated.View style={[styles.logoCircle, styles.logoSmall, { transform: [{ scale: pulse3 }] }]} />
      {/* Sparkle */}
      <Text style={styles.logoSparkle}>✨</Text>
    </View>
  );
};

// --- 3. Main Start Screen ---

export default function StartScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background Animation Layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <FloatingParticle delay={0} color={COLORS.accent1} size={140} startX={40} />
        <FloatingParticle delay={2000} color={COLORS.accent2} size={90} startX={width - 60} />
        <FloatingParticle delay={4000} color={COLORS.primary} size={110} startX={width / 2} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>

        {/* Animated Logo (Replaces static dots) */}
        <View style={styles.logoWrapper}>
          <AnimatedLogo />
        </View>

        {/* Buttons - USING YOUR ORIGINAL COMPONENT */}
        <View style={styles.buttons}>
          <ImageButton
            label="Sign Up"
            onPress={() => router.push("/onboarding/quiz")}
            style={{ marginBottom: 12 }}
          />

          <ImageButton
            label="Login"
            onPress={() => router.push("/onboarding/login")}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Logo Styles
  logoWrapper: {
    marginBottom: 100, // Push logo up slightly
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 160,
    height: 160,
    position: 'relative',
  },
  logoCircle: {
    position: 'absolute',
    borderRadius: 999,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  logoBig: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.primary,
    bottom: 0,
    left: 10,
  },
  logoMedium: {
    width: 70,
    height: 70,
    backgroundColor: COLORS.accent1,
    top: 10,
    right: 20,
  },
  logoSmall: {
    width: 45,
    height: 45,
    backgroundColor: COLORS.accent2,
    top: 75,
    right: 0,
  },
  logoSparkle: {
    position: 'absolute',
    top: -10,
    left: -10,
    fontSize: 32,
    color: COLORS.accent2,
  },
  // Button Styles container
  buttons: {
    position: "absolute",
    bottom: 100,
    alignItems: 'center',
  },
});