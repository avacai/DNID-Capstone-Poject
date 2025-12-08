// app/onboarding/login.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { api, setAuthToken } from "@/lib/api";
import { useOnboarding, PetType } from "@/hooks/useOnboarding";

const { width, height } = Dimensions.get("window");

// --- 1. Shared Color Palette ---
const COLORS = {
  bg: '#FFFFFF',
  text: '#3D4C79',       // Dark Navy
  primary: '#9EB7E5',    // Periwinkle
  accent1: '#E8F0B8',    // Pale Lime
  accent2: '#F2E1AC',    // Sand/Cream
  inputBg: '#FFFDF5',
  error: '#FF6B6B',
  // Original Button Color preserved
  originalButton: '#9CAAF8',
  originalButtonText: '#111827',
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

// The "Focus Friends" Animated Logo (Mini Version)
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

// --- 3. Main Login Screen ---

export default function LoginScreen() {
  const router = useRouter();
  const { setPetType } = useOnboarding();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res: any = await api.login(email.trim(), password.trim());
      console.log("LOGIN SUCCESS", res);

      setAuthToken(res.token);
      if (res?.gamedata?.pet?.type) {
        setPetType(res.gamedata.pet.type as PetType);
      }

      router.replace("/(tabs)/home");
    } catch (e: any) {
      console.log("Login error", e);
      setError("Email or password is incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Animation Layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <FloatingParticle delay={0} color={COLORS.accent1} size={120} startX={50} />
        <FloatingParticle delay={2000} color={COLORS.accent2} size={80} startX={width - 80} />
        <FloatingParticle delay={4000} color={COLORS.primary} size={100} startX={width / 2} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Logo Header */}
          <AnimatedLogo />

          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Log in to your FocusPet account</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={[styles.loginButton, !canSubmit && { opacity: 0.5 }]}
              disabled={!canSubmit || loading}
              onPress={handleLogin}
            >
              {loading ? (
                <ActivityIndicator color="#111827" />
              ) : (
                <Text style={styles.loginText}>Log In</Text>
              )}
            </Pressable>

            <Pressable onPress={() => router.back()} style={styles.backLink}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  // Logo Styles
  logoContainer: {
    width: 100,
    height: 100,
    marginBottom: 20,
    position: 'relative',
  },
  logoCircle: {
    position: 'absolute',
    borderRadius: 999,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoBig: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.primary,
    bottom: 0,
    left: 10,
  },
  logoMedium: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.accent1,
    top: 5,
    right: 15,
  },
  logoSmall: {
    width: 26,
    height: 26,
    backgroundColor: COLORS.accent2,
    top: 45,
    right: 0,
  },
  logoSparkle: {
    position: 'absolute',
    top: -5,
    left: 0,
    fontSize: 20,
    color: COLORS.accent2,
  },
  // Card Styles
  card: {
    width: width * 0.82, // Matches original approx width
    borderRadius: 24,
    backgroundColor: COLORS.accent2, // Sand/Cream background for card
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  input: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: COLORS.bg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
  },
  error: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.error,
    textAlign: "center",
  },
  // RESTORED ORIGINAL BUTTON STYLES
  loginButton: {
    marginTop: 20,
    width: "100%",
    borderRadius: 20,
    backgroundColor: "#9CAAF8", // Original Blue
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827", // Original Dark Text
  },
  backLink: {
    marginTop: 12,
    alignSelf: "center",
    padding: 10,
  },
  backText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "600",
    opacity: 0.6,
  },
});