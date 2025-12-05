// components/SessionCompleteModal.tsx
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Image,
} from "react-native";

type Props = {
  visible: boolean;
  coinsEarned: number;
  expEarned: number;
  onClose: () => void;
};

export default function SessionCompleteModal({
  visible,
  coinsEarned,
  expEarned,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          {/* Icon / pet reaction placeholder */}
          <View style={styles.iconCircle}>
            {/* You can swap this with a real pet image later */}
            <Image
              source={require("@/assets/ui/coin1.png")}
              style={{ width: 40, height: 40, resizeMode: "contain" }}
            />
          </View>

          <Text style={styles.title}>Session Complete!</Text>

          <Text style={styles.subTitle}>
            Great job staying focused. Here’s what you earned:
          </Text>

          <View style={styles.rewardsRow}>
            <View style={styles.rewardBubble}>
              <Text style={styles.rewardLabel}>Coins</Text>
              <Text style={styles.rewardValue}>+{coinsEarned}</Text>
            </View>

            <View style={styles.rewardBubble}>
              <Text style={styles.rewardLabel}>Pet EXP</Text>
              <Text style={styles.rewardValue}>+{expEarned}</Text>
            </View>
          </View>

          <Pressable onPress={onClose} style={styles.mainButton}>
            <Text style={styles.mainButtonLabel}>Back to Home</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#F6E9B8",
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    alignItems: "center",
  },
  iconCircle: {
    position: "absolute",
    top: -35,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#A0B1F3",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#374151",
    marginBottom: 16,
  },
  rewardsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginBottom: 20,
    gap: 12,
  },
  rewardBubble: {
    flex: 1,
    backgroundColor: "#B9C5F7",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardLabel: {
    fontSize: 14,
    color: "#111827",
  },
  rewardValue: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "900",
  },
  mainButton: {
    marginTop: 4,
    backgroundColor: "#A0B1F3",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 18,
  },
  mainButtonLabel: {
    fontSize: 18,
    fontWeight: "800",
  },
});
