import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useOnboarding, PetType } from "../../hooks/useOnboarding"; // Adjust path if needed
import { RefreshCcw } from "lucide-react-native"; // Make sure to install lucide-react-native or use VectorIcons

const { width, height } = Dimensions.get("window");

// --- Assets ---
const PET_IMAGES: Record<string, any> = {
  Cat: require("@/assets/pets/cat_1.png"),
  Dog: require("@/assets/pets/dog_1.png"),
  Duck: require("@/assets/pets/duck_1.png"),
  Seal: require("@/assets/pets/seal_1.png"),
};

// --- Colors ---
const COLORS = {
  bg: '#FFFFFF',
  boardBg: '#3D4C79',    // Navy
  text: '#3D4C79',
  textLight: '#FFFFFF',
  primary: '#9EB7E5',    // Periwinkle
  accent1: '#E8F0B8',    // Pale Lime
  accent2: '#F2E1AC',    // Sand
  inputBg: '#FFFDF5',
};

// --- Floating Particle Animation ---
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

export default function NameScreen() {
  const router = useRouter();
  const { petType, setPetName } = useOnboarding();

  // Fallback to 'Cat' if petType is null for previewing
  const currentPetType = (petType || "Cat") as PetType;
  const petImageSource = PET_IMAGES[currentPetType];

  const [name, setName] = useState("");

  // Animation for the pet bouncing
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -15, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
      ])
    ).start();
  }, []);

  const randomNames = ["Luna", "Mochi", "Pumpkin", "Milo", "Coco", "Bear"];

  const setRandom = () => {
    const pick = randomNames[Math.floor(Math.random() * randomNames.length)];
    setName(pick);
  };

  const onNext = () => {
    setPetName(name);
    // Navigate to Home or Done screen
    router.push("/(tabs)/home");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background Particles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <FloatingParticle delay={0} color={COLORS.accent1} size={140} startX={40} />
        <FloatingParticle delay={2000} color={COLORS.accent2} size={100} startX={width - 50} />
        <FloatingParticle delay={4000} color={COLORS.primary} size={120} startX={width / 2} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}
      >
        {/* Navy Card */}
        <View style={styles.card}>
          {/* Tape Decoration */}
          <View style={styles.tape} />

          <Text style={styles.title}>Congratulations!</Text>
          <Text style={styles.subtitle}>You hatched a baby {currentPetType}!</Text>

          {/* Animated Pet Image (Replaces Grey Circle) */}
          <Animated.View style={[styles.petContainer, { transform: [{ translateY: bounceAnim }] }]}>
            <Image
              source={petImageSource}
              style={styles.petImage}
            />
          </Animated.View>

          {/* Name Input Area */}
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Name your new friend..."
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
            {/* Random Button inside input area or next to it */}
            <Pressable onPress={setRandom} style={styles.randomButton}>
              <Text style={styles.randomIcon}>🎲</Text>
            </Pressable>
          </View>

          {/* Next Button */}
          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              !name && { opacity: 0.5 },
              pressed && { transform: [{ scale: 0.96 }] }
            ]}
            disabled={!name}
            onPress={onNext}
          >
            <Text style={styles.nextText}>Meet {name || "..."} →</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: width * 0.85,
    backgroundColor: COLORS.boardBg,
    borderRadius: 32,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
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
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.accent1, // Lime color for subtitle
    marginBottom: 30,
    textAlign: 'center',
  },
  petContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 6,
    borderColor: COLORS.accent2, // Sand border
    overflow: 'hidden',
  },
  petImage: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
  inputWrapper: {
    width: '100%',
    position: 'relative',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.inputBg,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    paddingRight: 50, // Space for random button
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  randomButton: {
    position: 'absolute',
    right: 12,
    top: 10,
    padding: 5,
  },
  randomIcon: {
    fontSize: 20,
  },
  nextButton: {
    width: '100%',
    backgroundColor: COLORS.primary, // Periwinkle
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  nextText: {
    fontSize: 18,
    fontWeight: "800",
    color: '#FFFFFF',
  },
});