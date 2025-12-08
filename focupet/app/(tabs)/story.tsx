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
  Image,
  Platform,
} from "react-native";
import { useOnboarding, PetType } from "@/hooks/useOnboarding";

const { width, height } = Dimensions.get("window");

// --- 1. Shared Color Palette ---
const COLORS = {
  bg: '#FFFFFF',
  text: '#3D4C79',       // Dark Navy
  boardBg: '#3D4C79',    // Navy Board
  cardUnlocked: '#F2E1AC', // Sand
  cardLocked: '#9EB7E5',   // Periwinkle
  tag: '#E8F0B8',          // Pale Lime
  white: '#FFFFFF',
};

// --- 2. Assets ---
const PET_IMAGES: Record<PetType, any> = {
  Cat: require("@/assets/pets/cat_1.png"),
  Dog: require("@/assets/pets/dog_1.png"),
  Duck: require("@/assets/pets/duck_1.png"),
  Seal: require("@/assets/pets/seal_1.png"),
};

// --- 3. Animation Components ---

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

// Peeking Pet Component
const PeekingPet = ({ source }: { source: any }) => {
  const peekAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Make the pet peek up and down slowly
    Animated.loop(
      Animated.sequence([
        Animated.timing(peekAnim, { toValue: -10, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(peekAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.peekingContainer, { transform: [{ translateY: peekAnim }] }]}>
      <Image source={source} style={styles.peekingImage} resizeMode="contain" />
    </Animated.View>
  );
};

// Animated Story Card (Tilt + Shake on Lock)
const StoryCard = ({ story, index, onPress }: { story: any; index: number; onPress: () => void }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current; // New shake value

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000 + (index * 500),
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

  const handlePress = () => {
    if (story.unlocked) {
      onPress();
    } else {
      // Trigger Shake Animation for Locked Items
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  };

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const rotate = `${(index % 2 === 0 ? 1 : -1) * 1.5}deg`;

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.storyCard,
          !story.unlocked ? styles.storyCardLocked : styles.storyCardUnlocked,
          {
            transform: [
              { translateY },
              { rotate },
              { translateX: shakeAnim } // Shake effect
            ],
            opacity: story.unlocked ? 1 : 0.8
          }
        ]}
      >
        <Text style={[
          styles.cardText,
          !story.unlocked && styles.cardTextLocked
        ]}>
          {story.unlocked ? story.title : "Locked Memory"}
        </Text>

        {!story.unlocked && (
          <View style={styles.lockIcon}>
            <Text style={{fontSize: 18}}>🔒</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

// --- 4. Main Component ---

// Mock Stories
const STORIES = [
  {
    id: 1,
    title: "Morning Light",
    body: "Your FocuPet wakes up and explores the study room. The sun filters through the dusty window, illuminating floating dust motes that look like tiny stars. It seems ready to start a productive day!",
    unlocked: true,
  },
  {
    id: 2,
    title: "First Focus Session",
    body: "Today your FocuPet watched you complete a full session. It sat quietly by your side, mimicking your focus with its own tiny book.",
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

  // Get User Pet
  const { petType } = useOnboarding();
  const fallback: PetType = petType ?? "Cat";
  const petSource = PET_IMAGES[fallback];

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

      <View style={styles.content}>

        {/* Title Tag */}
        <View style={styles.titleTagWrapper}>
          <View style={styles.titleTag}>
            <Text style={styles.titleText}>Memories</Text>
          </View>
          <View style={styles.tape} />
        </View>

        {/* Peeking Pet (Behind the board) */}
        <PeekingPet source={petSource} />

        {/* The Navy Board */}
        <View style={styles.board}>

          {/* Decorative Stickers */}
          <Text style={[styles.sticker, { top: 10, left: 10, transform: [{rotate: '-15deg'}] }]}>⭐</Text>
          <Text style={[styles.sticker, { bottom: 60, right: 15, transform: [{rotate: '10deg'}] }]}>🐾</Text>

          {/* CHANGED: Added style to ScrollView directly to take up flexible space */}
          <ScrollView
            style={styles.scrollContainer}
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
            <View style={styles.pageIndicator}>
              <Text style={styles.pageText}>1 / 1</Text>
            </View>
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
              <Text style={styles.modalTagText} numberOfLines={1}>
                {activeStory?.title || "Story"}
              </Text>
            </View>

            <View style={styles.modalTape} />

            {/* Close Button */}
            <Pressable
              style={styles.closeButton}
              onPress={() => setActiveStory(null)}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>

            {/* Paper Content */}
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalStoryText}>
                  {activeStory?.body}
                </Text>
              </ScrollView>

              {/* Pet Stamp at bottom of letter */}
              <View style={styles.stampContainer}>
                 <Image source={petSource} style={styles.stampImage} />
              </View>
            </View>

            {/* Decorative Bottom */}
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
    backgroundColor: COLORS.bg,
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
    zIndex: 20, // Above pet
    alignItems: 'center',
  },
  titleTag: {
    backgroundColor: COLORS.tag,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 16,
    transform: [{ rotate: "-3deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  tape: {
    position: 'absolute',
    top: -10,
    width: 60,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.5)',
    transform: [{ rotate: "2deg" }],
  },
  titleText: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 0.5,
  },

  // -------- PEEKING PET --------
  peekingContainer: {
    position: 'absolute',
    top: 100, // Just above the board
    zIndex: 5, // Behind title, front of board? No, behind board
    elevation: 5,
  },
  peekingImage: {
    width: 120,
    height: 120,
  },

  // -------- NAVY BOARD --------
  board: {
    width: "88%",
    height: "72%",
    backgroundColor: COLORS.boardBg,
    borderRadius: 36,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: COLORS.boardBg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginTop: 60, // Space for pet
    position: 'relative',
    zIndex: 10, // In front of pet body
  },

  // CHANGED: Helper style to let ScrollView expand
  scrollContainer: {
    width: '100%',
    flex: 1, // This allows it to fill space between header and footer
    marginTop: 10,
    marginBottom: 10,
  },

  // CHANGED: Center content vertically
  boardScroll: {
    alignItems: 'center',
    justifyContent: 'center', // Center vertically
    flexGrow: 1, // Grow to fill the view so centering works
    gap: 20, // Increased gap slightly
    width: '100%',
  },

  sticker: {
    position: 'absolute',
    fontSize: 24,
    opacity: 0.8,
  },

  // -------- STORY CARDS --------
  storyCard: {
    width: '100%',
    height: 85,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  storyCardUnlocked: {
    backgroundColor: COLORS.cardUnlocked,
  },
  storyCardLocked: {
    backgroundColor: COLORS.cardLocked,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: 'center',
  },
  cardTextLocked: {
    opacity: 0.6,
    color: '#FFF',
  },
  lockIcon: {
    marginTop: 2,
    opacity: 0.6,
  },

  // -------- ARROWS --------
  arrowsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    width: "90%",
    paddingBottom: 5,
  },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: -2,
  },
  pageIndicator: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pageText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },

  // -------- MODAL --------
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(61, 76, 121, 0.6)",
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
    top: -18,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.tag,
    borderRadius: 16,
    transform: [{ rotate: "-2deg" }],
    zIndex: 2,
    borderWidth: 3,
    borderColor: '#FFF',
    maxWidth: '80%',
  },
  modalTagText: {
    fontWeight: '900',
    color: COLORS.text,
    fontSize: 16,
  },
  modalTape: {
    position: "absolute",
    top: -28,
    width: 50,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.6)",
    transform: [{ rotate: "2deg" }],
    zIndex: 3,
  },

  closeButton: {
    position: "absolute",
    top: 16,
    right: 16, // Moved to right for better UX
    backgroundColor: COLORS.tag,
    width: 36,
    height: 36,
    borderRadius: 18,
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
    height: "78%",
    backgroundColor: "#FFF9F0", // Slightly warmer paper
    borderRadius: 24,
    marginTop: 30,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden', // Clip the stamp
  },
  modalStoryText: {
    fontSize: 17,
    color: COLORS.text,
    lineHeight: 26,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  stampContainer: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    opacity: 0.2,
    transform: [{ rotate: '-10deg' }],
  },
  stampImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    tintColor: COLORS.text, // Make it look like an ink stamp
  },

  bottomNote: {
    width: "50%",
    height: 30,
    backgroundColor: COLORS.cardUnlocked,
    borderRadius: 10,
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