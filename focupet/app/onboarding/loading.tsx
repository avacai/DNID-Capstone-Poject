import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

// Color Palette
const COLORS = {
  bg: "#FFFFFF",
  text: "#3D4C79", // Dark Navy
  primary: "#9EB7E5", // Periwinkle
  accent1: "#E8F0B8", // Pale Lime
  accent2: "#F2E1AC", // Sand/Cream
  barBg: "#F8FAFC",
  barBorder: "#E2E8F0",
};

// --- Sub-component for Floating Particles ---
const FloatingParticle = ({ color, size, startX }) => {
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
        }),
      ])
    ).start();
  }, [animValue]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [height, -100], // Move from bottom to top
  });

  const translateX = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [startX, startX + 50, startX - 50], // Wiggle
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
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

// --- Sub-component for a single "Boop" ---
const Boop = ({ x, y, rotation, onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() => onComplete());
  }, [fadeAnim, scaleAnim, onComplete]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x - 20,
        top: y - 20,
        transform: [{ rotate: `${rotation}deg` }, { scale: scaleAnim }],
        opacity: fadeAnim,
      }}
    >
      <Text style={{ fontSize: 40, color: COLORS.primary }}>🐾</Text>
    </Animated.View>
  );
};

// --- Main Component ---
export default function LoadingScreen() {
  const router = useRouter();

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Waking up the friends...");
  const [boops, setBoops] = useState([]);

  // Animation Refs for Logo
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const pulseAnim3 = useRef(new Animated.Value(1)).current;

  // Animation Ref for Walking Paws
  const walkAnim = useRef(new Animated.Value(0)).current;

  // 1. Loading Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = Math.random() * (prev > 30 && prev < 70 ? 2 : 0.8);
        return Math.min(prev + increment, 100);
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 🔁 When loading reaches 100%, navigate to onboarding
  useEffect(() => {
    if (loadingProgress >= 100) {
      const t = setTimeout(() => {
        router.replace("/onboarding/start");
      }, 600); // small pause so "Ready to focus!" shows
      return () => clearTimeout(t);
    }
  }, [loadingProgress, router]);

  // 2. Text Logic
  useEffect(() => {
    if (loadingProgress < 30) setLoadingText("Waking up the friends...");
    else if (loadingProgress < 60) setLoadingText("Brewing focus potion...");
    else if (loadingProgress < 90) setLoadingText("Chasing away distractions...");
    else setLoadingText("Ready to focus!");
  }, [loadingProgress]);

  // 3. Logo Animations (Pulsing) + Walking paws
  useEffect(() => {
    const createPulse = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1.1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

    createPulse(pulseAnim1, 0).start();
    createPulse(pulseAnim2, 500).start();
    createPulse(pulseAnim3, 1000).start();

    Animated.loop(
      Animated.timing(walkAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [pulseAnim1, pulseAnim2, pulseAnim3, walkAnim]);

  // 4. Handle Touch (Boop)
  const handlePress = (evt) => {
    const newBoop = {
      id: Date.now(),
      x: evt.nativeEvent.pageX,
      y: evt.nativeEvent.pageY,
      rotation: Math.random() * 60 - 30,
    };
    setBoops((prev) => [...prev, newBoop]);
  };

  const removeBoop = (id) => {
    setBoops((prev) => prev.filter((b) => b.id !== id));
  };

  // Interpolation for walking paws
  const pawTranslateY = walkAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [10, 0, 0, -10],
  });
  const pawOpacity = walkAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Touch Handler Layer */}
      <TouchableOpacity
        activeOpacity={1}
        style={StyleSheet.absoluteFill}
        onPress={handlePress}
      >
        {/* Background Particles */}
        <FloatingParticle color={COLORS.accent1} size={120} startX={50} />
        <FloatingParticle
          color={COLORS.accent2}
          size={80}
          startX={width - 100}
        />
        <FloatingParticle color={COLORS.accent1} size={150} startX={width / 2} />

        {/* Main Content Container */}
        <View style={styles.contentContainer}>
          {/* Logo Animation */}
          <View style={styles.logoContainer}>
            <Animated.View
              style={[styles.circle, styles.circleBig, { transform: [{ scale: pulseAnim1 }] }]}
            />
            <Animated.View
              style={[styles.circle, styles.circleMedium, { transform: [{ scale: pulseAnim2 }] }]}
            />
            <Animated.View
              style={[styles.circle, styles.circleSmall, { transform: [{ scale: pulseAnim3 }] }]}
            />
            <Text style={styles.sparkle}>✨</Text>
          </View>

          {/* Text Info */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{loadingText}</Text>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${loadingProgress}%` },
                ]}
              />
              <View
                style={[
                  styles.avatarContainer,
                  { left: `${Math.min(loadingProgress, 92)}%` },
                ]}
              >
                <Text style={{ fontSize: 20 }}>🐱</Text>
              </View>
            </View>

            <Text style={styles.percentText}>
              {Math.round(loadingProgress)}%
            </Text>
          </View>
        </View>

        {/* Bottom Walking Paws */}
        <View style={styles.walkingPawsContainer}>
          {[0, 1, 2, 3].map((i) => (
            <Animated.Text
              key={i}
              style={[
                styles.walkingPaw,
                {
                  opacity: pawOpacity,
                  transform: [{ translateY: pawTranslateY }],
                },
              ]}
            >
              🐾
            </Animated.Text>
          ))}
        </View>

        {/* Boops Render */}
        {boops.map((boop) => (
          <Boop
            key={boop.id}
            x={boop.x}
            y={boop.y}
            rotation={boop.rotation}
            onComplete={() => removeBoop(boop.id)}
          />
        ))}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    paddingHorizontal: 30,
  },
  logoContainer: {
    width: 150,
    height: 150,
    marginBottom: 40,
    position: "relative",
  },
  circle: {
    position: "absolute",
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  circleBig: {
    width: 90,
    height: 90,
    backgroundColor: COLORS.primary,
    bottom: 0,
    left: 10,
  },
  circleMedium: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.accent1,
    top: 10,
    right: 10,
  },
  circleSmall: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.accent2,
    top: 70,
    right: -10,
  },
  sparkle: {
    position: "absolute",
    top: -10,
    left: 0,
    fontSize: 30,
    color: COLORS.accent2,
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
    textAlign: "center",
  },
  progressTrack: {
    width: "100%",
    height: 50,
    backgroundColor: COLORS.barBg,
    borderColor: COLORS.barBorder,
    borderWidth: 1,
    borderRadius: 25,
    overflow: "hidden",
    justifyContent: "center",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  avatarContainer: {
    position: "absolute",
    width: 40,
    height: 40,
    backgroundColor: "#FFF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    marginLeft: -20,
  },
  percentText: {
    marginTop: 10,
    color: COLORS.text,
    opacity: 0.7,
    fontWeight: "600",
  },
  walkingPawsContainer: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
  },
  walkingPaw: {
    fontSize: 30,
    color: COLORS.accent1,
    marginHorizontal: 15,
  },
});