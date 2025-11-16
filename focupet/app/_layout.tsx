import { Stack } from "expo-router";

export const unstable_settings = { initialRouteName: "onboarding/loading" };

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
