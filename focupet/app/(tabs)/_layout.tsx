import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="story" options={{ title: "Story" }} />
      <Tabs.Screen name="store" options={{ title: "Store" }} />
    </Tabs>
  );
}