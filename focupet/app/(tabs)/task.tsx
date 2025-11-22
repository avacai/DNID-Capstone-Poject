import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Task = { id: string; title: string; done: boolean };

export default function Tasks() {
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  // load/save to device
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("tasks");
      if (raw) setTasks(JSON.parse(raw));
    })();
  }, []);
  useEffect(() => {
    AsyncStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    const t = text.trim();
    if (!t) return;
    setTasks(prev => [{ id: Date.now().toString(), title: t, done: false }, ...prev]);
    setText("");
  };
  const toggle = (id: string) =>
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: string) =>
    setTasks(prev => prev.filter(t => t.id !== id));

  return (
    <View style={{ flex: 1, padding: 20, gap: 12, backgroundColor: "#FFFBF2" }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Tasks</Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add a task…"
          style={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />
        <Pressable
          onPress={addTask}
          style={{
            backgroundColor: "#A5B4FC",
            paddingHorizontal: 14,
            justifyContent: "center",
            borderRadius: 12,
          }}
        >
          <Text style={{ fontWeight: "600" }}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 12,
              borderRadius: 12,
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#e5e7eb",
              justifyContent: "space-between",
            }}
          >
            <Pressable onPress={() => toggle(item.id)} style={{ flex: 1 }}>
              <Text style={{ textDecorationLine: item.done ? "line-through" : "none" }}>
                {item.title}
              </Text>
            </Pressable>
            <Pressable onPress={() => remove(item.id)}>
              <Text style={{ color: "#ef4444", fontWeight: "600" }}>Delete</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: "#6b7280" }}>No tasks yet.</Text>}
      />
    </View>
  );
}