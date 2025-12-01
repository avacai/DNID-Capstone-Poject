import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import ImageButton from "@/components/ImageButton";

export default function StartScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.logoDots}>
        {/* replace later with your dots PNG if you want */}
        <View style={styles.dotLarge} />
        <View style={styles.dotSmall} />
        <View style={styles.dotTiny} />
      </View>

        <View style={styles.buttons}>
          <ImageButton
            label="Sign Up"
            onPress={() => router.push("/onboarding/question1")}
            style={{ marginBottom: 12 }}
          />

          <ImageButton
            label="Login"
            onPress={() => router.push("/onboarding/question1")}
          />
        </View>
    </View>
  );
}

const baseButton = {
  width: 180,
  paddingVertical: 12,
  borderRadius: 22,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  logoDots: {
    position: "absolute",
    top: 140,
    alignItems: "center",
  },
  dotLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E0E4F8",
  },
  dotSmall: {
    position: "absolute",
    right: -26,
    top: 6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E8ECFF",
  },
  dotTiny: {
    position: "absolute",
    left: -18,
    bottom: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F1F3FF",
  },
  buttons: {
    position: "absolute",
    bottom: 150,
    gap: 16,
  },
  button: baseButton,
  primary: {
    ...baseButton,
    backgroundColor: "#9CAAF8",
  },
  primaryText: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 16,
  },
  secondary: {
    ...baseButton,
    borderWidth: 2,
    borderColor: "#9CAAF8",
    backgroundColor: "#FFFDF5",
  },
  secondaryText: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 16,
  },
});
