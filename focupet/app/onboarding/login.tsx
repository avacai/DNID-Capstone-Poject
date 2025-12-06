// app/onboarding/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { api, setAuthToken } from "@/lib/api";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // backend expects password too
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

          // success → save token
          setAuthToken(res.token);
          // later you can store res.user globally if you want
          // e.g. setCurrentUser(res.user)

          // go straight to home tabs
          router.replace("/(tabs)/home");
      // later you can store res.user.id somewhere global if needed
      // e.g. setCurrentUser(res.user)

      // go straight to home tabs
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
  card: {
    width: "82%",
    borderRadius: 24,
    backgroundColor: "#F7E39F",
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#4B5563",
  },
  label: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  input: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#A0B1F3",
    backgroundColor: "#FFFDF5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
  },
  error: {
    marginTop: 10,
    fontSize: 12,
    color: "#B91C1C",
  },
  loginButton: {
    marginTop: 20,
    width: "100%",
    borderRadius: 20,
    backgroundColor: "#9CAAF8",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  backLink: {
    marginTop: 12,
    alignSelf: "center",
  },
  backText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
  },
});