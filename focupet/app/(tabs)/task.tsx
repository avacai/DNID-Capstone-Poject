import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  // ImageBackground,  // <- you can delete this if unused
} from "react-native";

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const initialTasks: Task[] = [
  { id: "1", title: "Task 1", completed: false },
  { id: "2", title: "Task 2", completed: false },
  { id: "3", title: "Task 3", completed: false },
  { id: "4", title: "Task 4", completed: false },
];

export default function TasksScreen() {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require("@/assets/ui/Rectangle 20.png")}
            style={styles.headerCurve}
            resizeMode="cover"
          />

          <View style={styles.headerTextWrapper}>
            <Text style={styles.headerTitle}>My Tasks</Text>
            <Text style={styles.headerSubtitle}>{todayLabel}</Text>
          </View>
        </View>

        {/* light green strip */}
        <View style={styles.greenStrip} />

        {/* task list */}
        <View style={styles.tasksList}>
          {tasks.map((task) => (
            <Pressable
              key={task.id}
              style={styles.taskRow}
              onPress={() => toggleTask(task.id)}
            >
              <View style={styles.taskBar} />
              {/* check circle */}
              <View
                style={[
                  styles.checkCircle,
                  task.completed && styles.checkCircleCompleted,
                ]}
              >
                {task.completed && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </Pressable>
          ))}
        </View>

        {/* bottom yellow card */}
        <View style={styles.bottomCard}>
          <Text style={styles.bottomTitle}>What’s your tasks today?</Text>

          <View style={styles.bottomOptionRow}>
            <View style={styles.smallPlusCircle}>
              <Text style={styles.smallPlusText}>＋</Text>
              {/* later: replace with your plus PNG */}
            </View>
            <Text style={styles.bottomOptionText}>Today</Text>
          </View>

          <View style={styles.bottomOptionRow}>
            <View style={styles.smallPlusCircle}>
              <Text style={styles.smallPlusText}>＋</Text>
            </View>
            <Text style={styles.bottomOptionText}>Add an media</Text>
          </View>

          {/* big plus button on bottom-right */}
          <Pressable
            style={styles.bigPlusButton}
            onPress={() => console.log("Open add-task modal")}
          >
            <Text style={styles.bigPlusText}>＋</Text>
            {/* later: swap with your big outlined plus PNG */}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF5",
  },
  scrollContent: {
    paddingBottom: 40,
  },

header: {
  width: "100%",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  height: 160,              // ⬅️ increase if your curve is taller
  overflow: "hidden",
  paddingLeft: 24,
},

headerCurve: {
  position: "absolute",
  top: -40,                // ⬅️ adjust this to slide the curve up/down
  width: "110%",
  height: 230,             // ⬅️ match your new PNG height
  resizeMode: "stretch",
},

headerTextWrapper: {
  position: "absolute",
  top: 75,                 // ⬅️ move text DOWN or UP
  left: 30,
},

  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },

  // light green strip right under the header
  greenStrip: {
    height: 26,
    backgroundColor: "#E7F1A7",
    marginTop: 30,
  },

  // TASK ROWS
  tasksList: {
    paddingHorizontal: 32,
    paddingTop: 24,
    gap: 14,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskBar: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#B9C5F7",
  },
  checkCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    borderColor: "#B9C5F7",
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDF5",
  },
  checkCircleCompleted: {
    backgroundColor: "#FFE7A4",
  },
  checkMark: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1F2A44",
  },

  // BOTTOM YELLOW CARD
  bottomCard: {
    marginTop: 24,
    marginHorizontal: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 24,
    backgroundColor: "#F7E39F",
    position: "relative",
  },
  bottomTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4B5563",
    marginBottom: 16,
  },
  bottomOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  smallPlusCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#A0B1F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  smallPlusText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    lineHeight: 14,
  },
  bottomOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },

  // big plus button in bottom-right of card
  bigPlusButton: {
    position: "absolute",
    right: 18,
    bottom: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#A0B1F3",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  bigPlusText: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111827",
    lineHeight: 34,
  },
});