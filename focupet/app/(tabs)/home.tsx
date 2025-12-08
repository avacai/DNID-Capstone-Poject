import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  Animated,
  Modal,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import TaskModal, { SessionTask } from "@/components/TaskModal";
import TimerModal from "@/components/TimerModal";
import { useRouter } from "expo-router";
import CoinBar from "@/components/CoinBar";
import { useOnboarding, PetType } from "@/hooks/useOnboarding";

// Asset Map
const PET_IMAGES: Record<PetType, any> = {
  Cat: require("@/assets/pets/cat_1.png"),
  Dog: require("@/assets/pets/dog_1.png"),
  Duck: require("@/assets/pets/duck_1.png"),
  Seal: require("@/assets/pets/seal_1.png"),
};

// --- Color Palette ---
const COLORS = {
  boardBg: '#3D4C79',    // Navy
  accent1: '#E8F0B8',    // Pale Lime
  accent2: '#F2E1AC',    // Sand/Cream
  inputBg: '#FFFDF5',
  text: '#3D4C79',
};

export default function Home() {
  const [step, setStep] = useState<"none" | "tasks" | "timer" | "profile">("none");
  const router = useRouter();

  // 1. Get Global State
  const { petType, petName, setPetName } = useOnboarding();
  const fallbackType: PetType = petType ?? "Dog";
  const petSource = PET_IMAGES[fallbackType];

  // 2. Local state for editing (Initialized with global name)
  const [editName, setEditName] = useState(petName || "FocuPet");

  // Sync: If the global name changes (e.g. just arrived from Name screen), update local edit state
  useEffect(() => {
    if (petName) {
      setEditName(petName);
    }
  }, [petName]);

  const handleSaveProfile = () => {
    setPetName(editName); // Save back to global store
    setStep("none");
  };

  const [sessionTasks, setSessionTasks] = useState<SessionTask[]>([]);
  const [sessionMinutes, setSessionMinutes] = useState(25);

  // Animation for Start Button
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const handleTasksDone = (tasks: SessionTask[]) => {
    setSessionTasks(tasks);
    setStep("timer");
  };

  const handleTimerStart = (minutes: number) => {
    setSessionMinutes(minutes);
    setStep("none");
    router.push({
      pathname: "/session",
      params: {
        minutes: String(minutes),
        tasks: JSON.stringify(sessionTasks),
      },
    });
  };

  return (
    <ImageBackground
      source={require("@/assets/bg/background1.png")}
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Top Icons Row */}
        <View style={styles.topRow}>
          {/* Profile Button */}
          <Pressable onPress={() => setStep("profile")}>
            <Image
              source={require("@/assets/ui/profile_1.png")}
              style={styles.icon}
            />
          </Pressable>

          <Pressable onPress={() => console.log("Settings")}>
            <Image
              source={require("@/assets/ui/setting.png")}
              style={styles.icon}
            />
          </Pressable>
        </View>

        {/* Coin Bar */}
        <View style={styles.coinRow}>
          <CoinBar
            coins={120}
            onPressPlus={() => console.log("Open store")}
          />
        </View>

        {/* Pet Area */}
        <View style={styles.petWrapper}>
          <Image source={petSource} style={styles.petImage} />
        </View>

        {/* Start Button */}
        <View style={styles.startWrapper}>
          <Pressable
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={() => setStep("tasks")}
          >
            <Animated.Image
              source={require("@/assets/ui/start_b.png")}
              style={[styles.startImage, { transform: [{ scale }] }]}
            />
          </Pressable>
        </View>

        {/* --- MODALS --- */}

        {/* 1. Task Selection Modal */}
        <Modal
          visible={step === "tasks"}
          transparent
          animationType="fade"
          onRequestClose={() => setStep("none")}
        >
          <TaskModal
            initialTasks={sessionTasks}
            onNext={handleTasksDone}
            onClose={() => setStep("none")}
          />
        </Modal>

        {/* 2. Timer Setup Modal */}
        <Modal
          visible={step === "timer"}
          transparent
          animationType="fade"
          onRequestClose={() => setStep("none")}
        >
          <TimerModal
            initialMinutes={sessionMinutes}
            onBack={() => setStep("tasks")}
            onStart={handleTimerStart}
          />
        </Modal>

        {/* 3. Edit Pet Profile Modal */}
        <Modal
          visible={step === "profile"}
          transparent
          animationType="fade"
          onRequestClose={() => setStep("none")}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.profileBoard}>
              {/* Header Tag */}
              <View style={styles.profileTag}>
                <Text style={styles.profileTagText}>Edit Pet</Text>
              </View>
              <View style={styles.tape} />

              {/* Close Button */}
              <Pressable style={styles.closeButton} onPress={() => setStep("none")}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>

              {/* Content Container */}
              <View style={styles.profileContent}>

                {/* Pet Display Row */}
                <View style={styles.petDisplayRow}>
                  {/* Spacer to balance the arrow */}
                  <View style={{width: 40}} />

                  {/* The Pet */}
                  <View style={styles.petCircle}>
                    <Image source={petSource} style={styles.modalPetImage} />
                  </View>

                  {/* Locked Arrow */}
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrowIcon}>→</Text>
                    <View style={styles.lockBadge}>
                      <Text style={{fontSize: 10}}>🔒</Text>
                    </View>
                  </View>
                </View>

                {/* Name Input */}
                <Text style={styles.label}>Pet Name</Text>
                <TextInput
                  style={styles.nameInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter name..."
                  placeholderTextColor="rgba(61, 76, 121, 0.4)"
                />

                {/* Save Button */}
                <Pressable
                  style={({pressed}) => [
                    styles.saveButton,
                    pressed && { opacity: 0.8, transform: [{scale: 0.98}] }
                  ]}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>

              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  bgImage: { width: "100%", height: "100%", resizeMode: "cover" },
  container: { flex: 1, alignItems: "center", paddingTop: 60 },

  // Top Row
  topRow: {
    width: "85%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: { width: 54, height: 54, resizeMode: "contain" },

  coinRow: { marginTop: 10, alignItems: "center" },
  petWrapper: { marginTop: 100, alignItems: "center", justifyContent: "center" },
  petImage: { width: 260, height: 260, resizeMode: "contain" },
  startWrapper: { position: 'absolute', bottom: 120 },
  startImage: { width: 280, height: 80, resizeMode: "contain" },

  // --- Profile Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(61, 76, 121, 0.5)", // Navy tint
    justifyContent: "center",
    alignItems: "center",
  },
  profileBoard: {
    width: "85%",
    backgroundColor: COLORS.boardBg,
    borderRadius: 32,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  // Header Tag
  profileTag: {
    position: "absolute",
    top: -15,
    backgroundColor: COLORS.accent1, // Lime
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 16,
    transform: [{ rotate: "-3deg" }],
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileTagText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  tape: {
    position: "absolute",
    top: -25,
    width: 50,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.6)",
    transform: [{ rotate: "3deg" }],
    zIndex: 3,
  },
  // Close Button
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    backgroundColor: COLORS.accent1,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeText: { fontSize: 16, fontWeight: "900", color: COLORS.text },

  // Content
  profileContent: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  petDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  petCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: COLORS.accent2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalPetImage: {
    width: 90,
    height: 90,
    resizeMode: "contain",
  },
  arrowContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5, // Locked look
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  arrowIcon: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '900',
  },
  lockBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: COLORS.accent2,
    borderRadius: 8,
    padding: 2,
  },
  // Input
  label: {
    alignSelf: 'flex-start',
    marginLeft: 10,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 14,
    opacity: 0.9,
  },
  nameInput: {
    width: '100%',
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.accent2, // Sand
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },
});