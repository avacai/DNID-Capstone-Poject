import { Tabs } from "expo-router";
import BottomDock from "@/components/BottomDock";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { position: "absolute" }, // allow our custom bar to overlay nicely
      }}
      tabBar={(props) => <BottomDock {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="store" options={{ title: "Store" }} />
      <Tabs.Screen name="task" options={{ title: "Tasks" }} />
      <Tabs.Screen name="story" options={{ title: "Story" }} />
    </Tabs>
  );
}