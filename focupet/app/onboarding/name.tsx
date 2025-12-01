import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState("");

  const randomNames = ["Luna", "Mochi", "Pumpkin", "Milo"];

  const setRandom = () => {
    const pick =
      randomNames[Math.floor(Math.random() * randomNames.length)];
    setName(pick);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Congratulations,</Text>
      <Text style={styles.title}>you hatched a baby [pet]!</Text>

      {/* placeholder circle for pet */}
      <View style={styles.petCircle} />

      <TextInput
        placeholder="Enter a name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#9CA3AF"
      />

      <Pressable onPress={setRandom} style={styles.randomButton}>
        <Text style={styles.randomText}>Random</Text>
      </Pressable>

      <Pressable
        style={[styles.nextButton, !name && { opacity: 0.5 }]}
        disabled={!name}
        onPress={() => router.push("/onboarding/done")}
      >
        <Text style={styles.nextText}>Next</Text>
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
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  petCircle: {
    marginTop: 30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#E1E1E5",
  },
  input: {
    marginTop: 24,
    width: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#9CAAF8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
  },
  randomButton: {
    marginTop: 8,
  },
  randomText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  nextButton: {
    marginTop: 30,
    width: 120,
    borderRadius: 22,
    paddingVertical: 9,
    alignItems: "center",
    backgroundColor: "#9CAAF8",
  },
  nextText: {
    fontWeight: "800",
    fontSize: 15,
    color: "#111827",
  },
});