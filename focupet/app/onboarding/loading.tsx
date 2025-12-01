import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

export default function LoadingScreen() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace("/onboarding/start");
    }, 1500); // 1.5s fake loading
    return () => clearTimeout(t);
  }, [router]);

  return (
    <View style={styles.container}>
      {/* TODO: swap with your real logo animation later */}
      <Image
        source={require("@/assets/ui/temDot.png")}
        style={styles.logo}
      />
      <ActivityIndicator size="large" color="#9CAAF8" />
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
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
    resizeMode: "contain",
  },
});