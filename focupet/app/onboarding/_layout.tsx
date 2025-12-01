import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "loading",
};

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="loading" />
      <Stack.Screen name="start" />
      <Stack.Screen name="question1" />
      <Stack.Screen name="question2" />
      <Stack.Screen name="question3" />
      <Stack.Screen name="color" />
      <Stack.Screen name="name" />
      <Stack.Screen name="done" />
    </Stack>
  );
}