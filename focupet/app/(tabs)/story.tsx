import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  ScrollView,
} from "react-native";
import { BlurView } from 'expo-blur'; // Optional: Use if you have expo-blur installed

const { width, height } = Dimensions.get("window");

// --- 1. Shared Color Palette ---
const COLORS = {
  bg: '#FFFFFF',
  text: '#3D4C79',       // Dark Navy (Primary text)
  boardBg: '#3D4C79',    // Dark Navy (Board background)
  cardUnlocked: '#F2E1AC', // Sand/Cream (Unlocked story)
  cardLocked: '#9EB7E5',   // Periwinkle (Locked story)
  tag: '#E8F0B8',          // Pale Lime (Tags)
  modalBg: '#FFFFFF',
};

// --- 2. Animations ---

// Background Floating Particles
const FloatingParticle = ({ delay, color, size, startX }: { delay: number; color: string; size: number; startX: number }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 12000 + Math.random() * 5000,
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
    outputRange: [startX, startX + 30, startX - 30],
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

// Animated Story Card (Tilt + Float)
const StoryCard = ({ story, index, onPress }: { story: any; index: number; onPress: () => void }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000 + (index * 500), // Stagger animations
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000 + (index * 500),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8], // Subtle float up and down
  });

  // Rotate slightly based on index
  const rotate = `${(index % 2 === 0 ? 1 : -1) * 2}deg`;

  return (
    <Pressable
      disabled={!story.unlocked}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.storyCard,
          !story.unlocked ? styles.storyCardLocked : styles.storyCardUnlocked,
          {
            transform: [{ translateY }, { rotate }],
            opacity: story.unlocked ? 1 : 0.6
          }
        ]}
      >
        <Text style={[
          styles.cardText,
          !story.unlocked && styles.cardTextLocked
        ]}>
          {story.unlocked ? story.title : "Locked Story"}
        </Text>

        {/* Lock Icon Placeholder if locked */}
        {!story.unlocked && (
          <View style={styles.lockIcon}>
            <Text style={{fontSize: 20}}>🔒</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

// --- 3. Main Component ---

// Mock Stories
const STORIES = [
  {
    id: 1,
    title: "Morning Light",
    body: "Your FocuPet wakes up and explores the study room. The sun filters through the dusty window, illuminating floating dust motes that look like tiny stars...",
    unlocked: true,
  },
  {
    id: 2,
    title: "First Focus Session",
    body: "Today your FocuPet watched you complete a full session. It sat quietly by your side, mimicking your focus with its own tiny book...",
    unlocked: false,
  },
  {
    id: 3,
    title: "Secret Drawer",
    body: "Behind old books, your FocuPet finds a tiny drawer containing a golden key and a note from the previous owner...",
    unlocked: false,
  },
];

export default function StoryScreen() {
  const [activeStory, setActiveStory] = useState<any>(null);
  const [scaleAnim] = useState(new Animated.Value(0));

  // Animate Modal Open
  useEffect(() => {
    if (activeStory) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [activeStory]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background Particles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <FloatingParticle delay={0} color={COLORS.cardLocked} size={140} startX={30} />
        <FloatingParticle delay={2000} color={COLORS.tag} size={100} startX={width - 50} />
        <FloatingParticle delay={4000} color={COLORS.cardUnlocked} size={120} startX={width / 2} />
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>

        {/* Title Tag */}
        <View style={styles.titleTagWrapper}>
          <View style={styles.titleTag}>
            <Text style={styles.titleText}>Stories</Text>
          </View>
          {/* Tape Effect */}
          <View style={styles.tape} />
        </View>

        {/* The Navy Board */}
        <View style={styles.board}>
          <ScrollView
            contentContainerStyle={styles.boardScroll}
            showsVerticalScrollIndicator={false}
          >
            {STORIES.map((story, i) => (
              <StoryCard
                key={story.id}
                story={story}
                index={i}
                onPress={() => setActiveStory(story)}
              />
            ))}
          </ScrollView>

          {/* Bottom Arrows */}
          <View style={styles.arrowsRow}>
            <Pressable style={styles.arrowButton}>
              <Text style={styles.arrowText}>←</Text>
            </Pressable>
            <Pressable style={styles.arrowButton}>
              <Text style={styles.arrowText}>→</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* STORY MODAL */}
      <Modal visible={!!activeStory} transparent animationType="none">
        <View style={styles.modalOverlay}>
          {/* Animated Modal Container */}
          <Animated.View
            style={[
              styles.modalBoard,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            {/* Modal Tag */}
            <View style={styles.modalTag}>
              <Text style={styles.modalTagText}>
                {activeStory?.title || "Story"}
              </Text>
            </View>

            {/* Tape for Tag */}
            <View style={styles.modalTape} />

            {/* Close Button */}
            <Pressable
              style={styles.closeButton}
              onPress={() => setActiveStory(null)}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>

            {/* White Paper Content */}
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalStoryText}>
                  {activeStory?.body}
                </Text>
              </ScrollView>
            </View>

            {/* Bottom Decorative Note */}
            <View style={styles.bottomNote} />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg, // White background
  },
  content: {
    flex: 1,
    paddingTop: 80,
    alignItems: "center",
  },

  // -------- TITLE TAG --------
  titleTagWrapper: {
    position: "absolute",
    top: 50,
    zIndex: 10,
    alignItems: 'center',
  },
  titleTag: {
    backgroundColor: COLORS.tag, // Pale Lime
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 16,
    transform: [{ rotate: "-4deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  tape: {
    position: 'absolute',
    top: -10,
    width: 60,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    transform: [{ rotate: "4deg" }],
  },
  titleText: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 0.5,
  },

  // -------- NAVY BOARD --------
  board: {
    width: "85%",
    height: "75%",
    backgroundColor: COLORS.boardBg, // Dark Navy
    borderRadius: 36,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-between", // Space between list and arrows
    shadowColor: COLORS.boardBg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginTop: 20,
  },
  boardScroll: {
    alignItems: 'center',
    paddingBottom: 20,
    gap: 20, // Space between cards
    width: '100%',
  },

  // -------- STORY CARDS --------
  storyCard: {
    width: 240,
    height: 90,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  storyCardUnlocked: {
    backgroundColor: COLORS.cardUnlocked, // Sand
  },
  storyCardLocked: {
    backgroundColor: COLORS.cardLocked, // Periwinkle
  },
  cardText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: 'center',
  },
  cardTextLocked: {
    opacity: 0.7,
  },
  lockIcon: {
    marginTop: 4,
    opacity: 0.5,
  },

  // -------- ARROWS --------
  arrowsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    paddingBottom: 10,
  },
  arrowButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.tag,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: -2,
  },

  // -------- MODAL --------
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(61, 76, 121, 0.6)", // Navy tint
    justifyContent: "center",
    alignItems: "center",
  },
  modalBoard: {
    width: "85%",
    height: "65%",
    backgroundColor: COLORS.boardBg,
    borderRadius: 36,
    paddingTop: 30,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },

  modalTag: {
    position: "absolute",
    top: -15,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: COLORS.tag,
    borderRadius: 12,
    transform: [{ rotate: "-4deg" }],
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  modalTagText: {
    fontWeight: '800',
    color: COLORS.text,
  },
  modalTape: {
    position: "absolute",
    top: -25,
    width: 50,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.6)",
    transform: [{ rotate: "2deg" }],
    zIndex: 3,
  },

  closeButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: COLORS.tag,
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  modalContent: {
    width: "88%",
    height: "75%", // Taller content area
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginTop: 30, // Push down below close button
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalStoryText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    fontWeight: '500',
  },

  bottomNote: {
    width: "50%",
    height: 40,
    backgroundColor: COLORS.cardUnlocked,
    borderRadius: 12,
    position: "absolute",
    bottom: 20,
    transform: [{ rotate: "-3deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});