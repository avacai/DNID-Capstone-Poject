// app/login.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useGame } from "@/src/context/GameContext";

export default function LoginScreen() {
  const { login, loading } = useGame();
  const router = useRouter();
  const [email, setEmail] = useState("alice@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    try {
      await login(email, password);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      setError(e.message || "Login failed");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFDF5",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 24 }}>
        FocuPet Login
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: "#e5e7eb",
          marginBottom: 12,
        }}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: "#e5e7eb",
          marginBottom: 16,
        }}
      />

      {error && (
        <Text style={{ color: "#dc2626", marginBottom: 8 }}>{error}</Text>
      )}

      <Pressable
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: "#A5B4FC",
          borderRadius: 12,
          paddingVertical: 12,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ fontWeight: "700", color: "#111827" }}>Login</Text>
        )}
      </Pressable>
    </View>
  );
}

