import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { useGame } from "@/src/context/GameContext";

export default function Tasks() {
  const { tasks, addTask, completeTask, refreshTasks } = useGame();

  const [text, setText] = useState("");

  // refresh tasks from backend when page opens
  useEffect(() => {
    refreshTasks();
  }, []);

  const handleAdd = async () => {
    const t = text.trim();
    if (!t) return;
    await addTask(t);
    setText("");
  };

  const handleToggle = async (id: number, currentlyDone: boolean) => {
    if (!currentlyDone) {
      // marking task complete
      await completeTask(id);
    }
    // no "undo" yet — backend supports only complete
  };

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
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable
          onPress={handleAdd}
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
        keyExtractor={(t) => String(t.id)}
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
            <Pressable onPress={() => handleToggle(item.id, item.completed)} style={{ flex: 1 }}>
              <Text
                style={{
                  textDecorationLine: item.completed ? "line-through" : "none",
                }}
              >
                {item.title}
              </Text>
            </Pressable>
            <Text
              style={{
                color: item.completed ? "#16a34a" : "#6b7280",
                fontWeight: "600",
              }}
            >
              {item.completed ? "Done" : "Tap to Complete"}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: "#6b7280" }}>No tasks yet.</Text>}
      />
    </View>
  );
}
