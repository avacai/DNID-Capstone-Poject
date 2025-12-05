// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { View } from "react-native";
import { GameProvider } from "@/src/context/GameContext";

// Ensures we start at loading (first onboarding screen)
export const unstable_settings = {
  initialRouteName: "onboarding/loading",
};

export default function RootLayout() {
  return (
    <GameProvider>
      <View style={{ flex: 1, backgroundColor: "#FFFDF5" }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#FFFDF5" },
          }}
        >
          {/* Tabbed screens (Home, Store, Tasks, Story) */}
          <Stack.Screen name="(tabs)" />

          {/* Onboarding screens (loading + start) */}
          <Stack.Screen name="onboarding" />

          {/* Session flow (timer run screen) */}
          <Stack.Screen name="session" />
        </Stack>
      </View>
    </GameProvider>
  );
}
