import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function DoneScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        <View style={styles.dotLarge} />
        <View style={styles.dotSmall} />
        <View style={styles.dotTiny} />
      </View>

      <Pressable
        style={styles.button}
        onPress={() => router.replace("/(tabs)/home")}
      >
        <Text style={styles.buttonText}>Done</Text>
      </Pressable>
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
  dots: {
    position: "absolute",
    top: 190,
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
  button: {
    position: "absolute",
    bottom: 160,
    width: 120,
    borderRadius: 22,
    backgroundColor: "#9CAAF8",
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "800",
    fontSize: 15,
    color: "#111827",
  },
});