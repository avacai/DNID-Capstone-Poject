// components/TaskModal.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";

export type SessionTask = { id: string; title: string };

type Props = {
  initialTasks?: SessionTask[];
  onNext: (tasks: SessionTask[]) => void;
  onClose: () => void;
};

export default function TaskModal({ initialTasks = [], onNext, onClose }: Props) {
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState<SessionTask[]>(initialTasks);

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setTasks((prev) => [{ id: Date.now().toString(), title: t }, ...prev]);
    setText("");
  };
  const remove = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <View style={styles.card}>
        {/* plus icon placeholder – you can replace with PNG */}
        <View style={styles.plusCircle}>
          <Text style={{ fontSize: 28, fontWeight: "800" }}>＋</Text>
        </View>

        <Text style={styles.title}>
          Tasks you want to focus in this session
        </Text>

        {/* input row */}
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Add a task…"
            value={text}
            onChangeText={setText}
            onSubmitEditing={add}
            style={styles.input}
          />
          <Pressable onPress={add} style={styles.addButton}>
            <Text style={{ fontSize: 22, fontWeight: "800" }}>＋</Text>
          </Pressable>
        </View>

        {/* tasks list */}
        <FlatList
          data={tasks}
          keyExtractor={(t) => t.id}
          style={{ maxHeight: 220, marginTop: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View style={styles.taskRow}>
              <Text style={{ fontSize: 16 }}>{item.title}</Text>
              <Pressable onPress={() => remove(item.id)}>
                <Text style={{ fontWeight: "700", color: "#374151" }}>
                  Remove
                </Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: "#6b7280", marginTop: 6 }}>
              No tasks yet. Add one above.
            </Text>
          }
        />

        {/* bottom button */}
        <Pressable
          onPress={() => onNext(tasks)}
          style={styles.nextButton}
        >
          <Text style={styles.nextLabel}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-end",
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#F6E9B8",
    borderRadius: 22,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  plusCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#A0B1F3",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -50,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#B9C5F7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#A0B1F3",
    alignItems: "center",
    justifyContent: "center",
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#B9C5F7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  nextButton: {
    marginTop: 16,
    alignSelf: "center",
    backgroundColor: "#A0B1F3",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 18,
  },
  nextLabel: {
    fontSize: 20,
    fontWeight: "800",
  },
});