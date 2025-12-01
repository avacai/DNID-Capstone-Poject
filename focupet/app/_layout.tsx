import { Stack } from "expo-router";
import { View } from "react-native";

export const unstable_settings = {
  initialRouteName: "onboarding"   // 👈 correct!
};

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFDF5" }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FFFDF5" },
        }}
      >
        <Stack.Screen name="onboarding" />   {/* 👈 loads onboarding flow first */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="session" />
      </Stack>
    </View>
  );
}
