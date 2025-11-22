import { Stack } from "expo-router";
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="loading" />
      <Stack.Screen name="start" />
      {/* add the other onboarding steps here */}
    </Stack>
  );
}