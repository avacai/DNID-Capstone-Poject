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
import { api } from "@/lib/api"; // Import your API helper

// ... (Keep existing Asset Map and Colors) ...
// Asset Map
const PET_IMAGES: Record<PetType, any> = {
  Cat: require("@/assets/pets/cat_1.png"),
  Dog: require("@/assets/pets/dog_1.png"),
  Duck: require("@/assets/pets/duck_1.png"),
  Seal: require("@/assets/pets/seal_1.png"),
};

const COLORS = {
  boardBg: '#3D4C79',    // Navy
  accent1: '#E8F0B8',    // Pale Lime
  accent2: '#F2E1AC',    // Sand/Cream
  inputBg: '#FFFDF5',
  text: '#3D4C79',
  white: '#FFFFFF',
  danger: '#FF8A80',     // Soft Red for Logout
};

// ... (Keep CuteToggle component) ...
const CuteToggle = ({ value, onValueChange }: { value: boolean, onValueChange: () => void }) => {
  const animX = useRef(new Animated.Value(value ? 22 : 2)).current;

  useEffect(() => {
    Animated.timing(animX, {
      toValue: value ? 22 : 2,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <Pressable onPress={onValueChange} style={[styles.toggleContainer, { backgroundColor: value ? COLORS.accent1 : '#E5E7EB' }]}>
      <Animated.View style={[styles.toggleThumb, { transform: [{ translateX: animX }] }]} />
    </Pressable>
  );
};

export default function Home() {
  const [step, setStep] = useState<"none" | "tasks" | "timer" | "profile" | "settings">("none");
  const router = useRouter();

  // 1. Get Global State (Added currency & setCurrency)
  const { petType, petName, setPetName, currency, setCurrency, setPetType } = useOnboarding();
  const fallbackType: PetType = petType ?? "Dog";
  const petSource = PET_IMAGES[fallbackType];

  // --- FETCH DATA ON MOUNT ---
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const res = await api.getGameData(); // Calls /api/gamedata
        if (res.ok && res.gamedata) {
          setCurrency(res.gamedata.currency || 0); // Sync currency
          if (res.gamedata.pet?.type) {
             setPetType(res.gamedata.pet.type); // Sync pet type if needed
          }
        }
      } catch (e) {
        console.log("Failed to fetch gamedata:", e);
      }
    };
    fetchGameData();
  }, []);

  // 2. Profile Logic
  const [editName, setEditName] = useState(petName || "FocuPet");
  useEffect(() => {
    if (petName) setEditName(petName);
  }, [petName]);

  const handleSaveProfile = () => {
    setPetName(editName);
    setStep("none");
  };

  // 3. Settings Logic
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [notifications, setNotifications] = useState(false);

  const handleLogout = () => {
    setStep("none");
    router.replace("/onboarding/login");
  };

  // 4. Session Logic
  const [sessionTasks, setSessionTasks] = useState<SessionTask[]>([]);
  const [sessionMinutes, setSessionMinutes] = useState(25);

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
          <Pressable onPress={() => setStep("profile")}>
            <Image
              source={require("@/assets/ui/profile_1.png")}
              style={styles.icon}
            />
          </Pressable>

          <Pressable onPress={() => setStep("settings")}>
            <Image
              source={require("@/assets/ui/setting.png")}
              style={styles.icon}
            />
          </Pressable>
        </View>

        {/* Coin Bar (Now uses real currency!) */}
        <View style={styles.coinRow}>
          <CoinBar
            coins={currency} // Updated to use state
            onPressPlus={() => router.push("/(tabs)/store")}
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

        {/* --- MODALS (Kept same as before) --- */}
        {/* Task Selection Modal */}
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

        {/* Timer Setup Modal */}
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

        {/* Edit Pet Profile Modal */}
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
              <View style={styles.profileTag}>
                <Text style={styles.profileTagText}>Edit Pet</Text>
              </View>
              <View style={styles.tape} />

              <Pressable style={styles.closeButton} onPress={() => setStep("none")}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>

              <View style={styles.profileContent}>
                <View style={styles.petDisplayRow}>
                  <View style={{width: 40}} />
                  <View style={styles.petCircle}>
                    <Image source={petSource} style={styles.modalPetImage} />
                  </View>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrowIcon}>→</Text>
                    <View style={styles.lockBadge}><Text style={{fontSize: 10}}>🔒</Text></View>
                  </View>
                </View>

                <Text style={styles.label}>Pet Name</Text>
                <TextInput
                  style={styles.nameInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter name..."
                  placeholderTextColor="rgba(61, 76, 121, 0.4)"
                />

                <Pressable
                  style={({pressed}) => [styles.saveButton, pressed && { opacity: 0.8, transform: [{scale: 0.98}] }]}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* SETTINGS MODAL */}
        <Modal
          visible={step === "settings"}
          transparent
          animationType="fade"
          onRequestClose={() => setStep("none")}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.profileBoard}>

              <View style={[styles.profileTag, { backgroundColor: COLORS.accent2 }]}>
                <Text style={styles.profileTagText}>Settings</Text>
              </View>
              <View style={[styles.tape, { transform: [{ rotate: "2deg" }] }]} />

              <Pressable style={styles.closeButton} onPress={() => setStep("none")}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>

              <View style={styles.settingsContent}>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Sound Effects</Text>
                  <CuteToggle value={soundEnabled} onValueChange={() => setSoundEnabled(!soundEnabled)} />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Background Music</Text>
                  <CuteToggle value={musicEnabled} onValueChange={() => setMusicEnabled(!musicEnabled)} />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Notifications</Text>
                  <CuteToggle value={notifications} onValueChange={() => setNotifications(!notifications)} />
                </View>

                <View style={styles.divider} />

                <Pressable
                  style={({pressed}) => [styles.logoutButton, pressed && { opacity: 0.8 }]}
                  onPress={handleLogout}
                >
                  <Text style={styles.logoutText}>Log Out</Text>
                </Pressable>

                <Text style={styles.versionText}>v1.0.0 Focus Friends</Text>

              </View>
            </View>
          </View>
        </Modal>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  bgImage: { width: "100%", height: "100%", resizeMode: "cover" },
  container: { flex: 1, alignItems: "center", paddingTop: 60 },
  topRow: { width: "85%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  icon: { width: 54, height: 54, resizeMode: "contain" },
  coinRow: { marginTop: 10, alignItems: "center" },
  petWrapper: { marginTop: 100, alignItems: "center", justifyContent: "center" },
  petImage: { width: 260, height: 260, resizeMode: "contain" },
  startWrapper: { position: 'absolute', bottom: 120 },
  startImage: { width: 280, height: 80, resizeMode: "contain" },

  // --- Modal Base Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(61, 76, 121, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileBoard: {
    width: "85%",
    backgroundColor: COLORS.boardBg,
    borderRadius: 32,
    paddingTop: 45,
    paddingBottom: 30,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  profileTag: {
    position: "absolute",
    top: -15,
    backgroundColor: COLORS.accent1,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 16,
    transform: [{ rotate: "-3deg" }],
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileTagText: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  tape: {
    position: "absolute",
    top: -25,
    width: 50,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.6)",
    transform: [{ rotate: "3deg" }],
    zIndex: 3,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeText: { fontSize: 16, fontWeight: "900", color: COLORS.white },

  // --- Profile Content ---
  profileContent: { width: "100%", alignItems: "center", paddingHorizontal: 20 },
  petDisplayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  petCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFF', borderWidth: 4, borderColor: COLORS.accent2, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  modalPetImage: { width: 90, height: 90, resizeMode: "contain" },
  arrowContainer: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', opacity: 0.5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  arrowIcon: { fontSize: 24, color: '#FFF', fontWeight: '900' },
  lockBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: COLORS.accent2, borderRadius: 8, padding: 2 },
  label: { alignSelf: 'flex-start', marginLeft: 10, color: '#FFF', fontWeight: '700', marginBottom: 6, fontSize: 14, opacity: 0.9 },
  nameInput: { width: '100%', backgroundColor: COLORS.inputBg, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 24, textAlign: 'center' },
  saveButton: { backgroundColor: COLORS.accent2, paddingVertical: 12, paddingHorizontal: 40, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  saveButtonText: { fontSize: 16, fontWeight: "900", color: COLORS.text },

  // --- Settings Specific Styles ---
  settingsContent: {
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  toggleContainer: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    padding: 2,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  divider: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 10,
    width: '100%',
  },
  logoutButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  versionText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 20,
    fontWeight: '600',
  }
});