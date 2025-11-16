import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarIcon: ({ color, size }) => {
          const icons = {
            home: 'home',
            story: 'book',
            store: 'cart',
          };
          const name = icons[route.name] ?? 'ellipse';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="story" options={{ title: 'Story' }} />
      <Tabs.Screen name="store" options={{ title: 'Store' }} />
    </Tabs>
  );
}