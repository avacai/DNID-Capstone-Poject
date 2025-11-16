import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";

export default function Loading() {
  const router = useRouter();
  const [showButtons, setShowButtons] = useState(false);

  // animated values
  const scale = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const fadeBtns = useRef(new Animated.Value(0)).current;
  const slideBtns = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // logo: scale in + rotate a bit
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 800, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(300), // pretend your logo animation is finishing
    ]).start(() => {
      setShowButtons(true);
      // fade/slide in buttons
      Animated.parallel([
        Animated.timing(fadeBtns, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(slideBtns, { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    });
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["-15deg", "0deg"] });

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFBF2", alignItems: "center", justifyContent: "center", padding: 24 }}>
      {/* Placeholder “logo” circle—swap with your SVG/image later */}
      <Animated.View
        style={{
          width: 140, height: 140, borderRadius: 70,
          backgroundColor: "#C7D2FE", // soft indigo
          transform: [{ scale }, { rotate: spin }],
          shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }
        }}
      />
      {/* Buttons */}
      {showButtons && (
        <Animated.View style={{ width: "100%", gap: 12, marginTop: 28, opacity: fadeBtns, transform: [{ translateY: slideBtns }] }}>
          <Pressable
            onPress={() => router.push("/onboarding/start")}
            style={{ backgroundColor: "#A5B4FC", paddingVertical: 14, borderRadius: 14, alignItems: "center" }}
          >
            <Text style={{ color: "#111827", fontSize: 16, fontWeight: "600" }}>Login</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/onboarding/start")}
            style={{ backgroundColor: "#CBD5E1", paddingVertical: 14, borderRadius: 14, alignItems: "center" }}
          >
            <Text style={{ color: "#111827", fontSize: 16, fontWeight: "600" }}>Sign Up</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
