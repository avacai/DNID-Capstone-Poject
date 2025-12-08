import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";

const { width, height } = Dimensions.get("window");

// --- 1. Shared Color Palette ---
const COLORS = {
  bg: '#FFFFFF',
  text: '#3D4C79',       // Dark Navy
  primary: '#9EB7E5',    // Periwinkle
  accent1: '#E8F0B8',    // Pale Lime
  accent2: '#F2E1AC',    // Sand/Cream
  cardBg: '#F8FAFC',
  completed: '#E2E8F0',
  inputBg: '#FFFDF5',
};

// --- 2. Animated Components ---

// Background Floating Particles
const FloatingParticle = ({ delay, color, size, startX }: { delay: number; color: string; size: number; startX: number }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 10000 + Math.random() * 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [animValue]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [height, -100],
  });

  const translateX = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [startX, startX + 40, startX - 40],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.3,
        transform: [{ translateY }, { translateX }],
      }}
    />
  );
};

// Animated Task Row
const TaskRow = ({ task, onToggle }: { task: any, onToggle: (id: string) => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(task.completed ? 1 : 0)).current;

  // Animate checkmark when completion status changes
  useEffect(() => {
    Animated.timing(checkAnim, {
      toValue: task.completed ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.bounce,
    }).start();
  }, [task.completed]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onToggle(task.id);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.taskRow, { transform: [{ scale: scaleAnim }] }]}>
        {/* Task Bar */}
        <View style={[styles.taskBar, task.completed && styles.taskBarCompleted]}>
           <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
             {task.title}
           </Text>
        </View>

        {/* Check Circle */}
        <View style={[styles.checkCircle, task.completed && styles.checkCircleActive]}>
          <Animated.Text
            style={[
              styles.checkMark,
              {
                opacity: checkAnim,
                transform: [{ scale: checkAnim }]
              }
            ]}
          >
            ✓
          </Animated.Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// --- 3. Main Screen ---

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const initialTasks: Task[] = [
  { id: "1", title: "Morning Meditation", completed: true },
  { id: "2", title: "Complete Project Proposal", completed: false },
];

const SUGGESTIONS = [
  "Feed Pet 🐱",
  "Drink Water 💧",
  "Read 10 Pages 📖",
  "Stretch 🧘‍♀️"
];

export default function TasksScreen() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskText, setNewTaskText] = useState("");

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const addTask = (title: string) => {
    if (!title.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false,
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskText(""); // Clear input
    Keyboard.dismiss();
  };

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background Particles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <FloatingParticle delay={0} color={COLORS.accent1} size={150} startX={20} />
        <FloatingParticle delay={2000} color={COLORS.accent2} size={100} startX={width - 50} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.headerCurve} />
            <View style={styles.headerTextWrapper}>
              <Text style={styles.headerTitle}>My Tasks</Text>
              <Text style={styles.headerSubtitle}>{todayLabel}</Text>
            </View>
          </View>

          {/* Decorative Green Strip */}
          <View style={styles.greenStrip} />

          {/* Task List */}
          <View style={styles.tasksList}>
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} />
            ))}
          </View>

          {/* INPUT AREA (Yellow Card) */}
          <View style={styles.bottomCard}>
            <Text style={styles.bottomTitle}>Create new task</Text>

            {/* Input Field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Type your task here..."
                placeholderTextColor="#9CA3AF"
                value={newTaskText}
                onChangeText={setNewTaskText}
              />
            </View>

            {/* Suggested Tasks Chips */}
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionLabel}>Suggested:</Text>
              <View style={styles.chipsRow}>
                {SUGGESTIONS.map((s, i) => (
                  <Pressable
                    key={i}
                    style={({pressed}) => [
                      styles.chip,
                      pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }
                    ]}
                    onPress={() => addTask(s)}
                  >
                    <Text style={styles.chipText}>{s}</Text>
                    <Text style={styles.chipPlus}>+</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Big Plus Button to Submit Input */}
            <Pressable
              style={({ pressed }) => [
                styles.bigPlusButton,
                pressed && { transform: [{ scale: 0.95 }] },
                // Disable visuals if input is empty
                !newTaskText.trim() && { opacity: 0.5, backgroundColor: '#A0B1F3' }
              ]}
              onPress={() => addTask(newTaskText)}
              disabled={!newTaskText.trim()}
            >
              <Text style={styles.bigPlusText}>＋</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingBottom: 120, // Extra padding for Nav Bar
  },

  // HEADER STYLES
  headerContainer: {
    width: "100%",
    height: 180,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  headerCurve: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: COLORS.accent2, // Sand Color
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTextWrapper: {
    marginTop: 80,
    paddingLeft: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    opacity: 0.7,
  },

  // DECORATIVE STRIP
  greenStrip: {
    height: 32,
    backgroundColor: COLORS.accent1, // Lime Color
    marginTop: -20,
    marginBottom: 20,
    marginHorizontal: 24,
    borderRadius: 16,
    opacity: 0.8,
  },

  // TASK LIST STYLES
  tasksList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
  },
  taskBar: {
    flex: 1,
    height: 56,
    borderRadius: 20,
    backgroundColor: COLORS.primary, // Periwinkle
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  taskBarCompleted: {
    backgroundColor: COLORS.completed,
    shadowOpacity: 0,
    elevation: 0,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  taskTitleCompleted: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  checkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginLeft: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg,
  },
  checkCircleActive: {
    backgroundColor: COLORS.accent2, // Sand
    borderColor: COLORS.accent2,
  },
  checkMark: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  // BOTTOM CARD (INPUT) STYLES
  bottomCard: {
    marginTop: 32,
    marginHorizontal: 24,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 32,
    backgroundColor: COLORS.accent2, // Sand
    position: "relative",
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  bottomTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 16,
  },
  inputContainer: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    width: '80%', // Leave room for the big button
  },
  textInput: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
    minHeight: 24,
  },

  // Suggestions
  suggestionsContainer: {
    marginBottom: 8,
  },
  suggestionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    opacity: 0.6,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    maxWidth: '80%', // Keep away from the plus button
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
  },
  chipPlus: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
  },

  // Big Plus Button
  bigPlusButton: {
    position: "absolute",
    right: 20,
    bottom: 20, // Aligned to bottom
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  bigPlusText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: -4,
  },
});