import { Stack } from "expo-router";
import { View } from "react-native";

export const unstable_settings = { initialRouteName: "onboarding/loading" };

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFDF5" }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FFFDF5" }, // applies to all screens inside
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="session" />
      </Stack>
    </View>
  );
}
