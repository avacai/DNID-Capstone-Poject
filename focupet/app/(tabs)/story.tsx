// app/(tabs)/story.tsx
import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useGame } from "@/src/context/GameContext";

export default function StoryScreen() {
  const { game } = useGame();

  const progress = game?.storyProgress ?? 0;
  const stories = game?.stories ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Story</Text>

      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>Story Progress</Text>
        <Text style={styles.progressValue}>{progress}</Text>
        <Text style={styles.progressHint}>
          Focus sessions slowly unlock new chapters.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Chapters</Text>

      {stories.length === 0 ? (
        <Text style={styles.emptyText}>
          No chapters unlocked yet. Start a focus session to begin your story!
        </Text>
      ) : (
        <FlatList
          data={stories}
          keyExtractor={(s, idx) => String(s.id ?? idx)}
          renderItem={({ item }) => (
            <View style={styles.storyRow}>
              <Text style={styles.storyTitle}>{item.title ?? "Story"}</Text>
              <Text style={styles.storyStatus}>
                {item.unlocked ? "Unlocked" : "Locked"}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF5",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: "#B9C5F7",
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 14,
    color: "#111827",
  },
  progressValue: {
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },
  progressHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#374151",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptyText: {
    color: "#6B7280",
  },
  storyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  storyStatus: {
    fontSize: 14,
    color: "#4B5563",
  },
});
