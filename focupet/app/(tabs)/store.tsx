import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Dimensions,
  Modal,
  Text,
  Animated,
  Easing,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import CoinBar from "@/components/CoinBar";
import { useOnboarding, PetType } from "@/hooks/useOnboarding";
import { api } from "@/lib/api";

const { width, height } = Dimensions.get("window");

// --- 0. API CONFIGURATION ---
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5050' : 'http://localhost:5050';

// --- 1. Mappings ---
const ITEM_MAP: Record<string, any> = {
  // Ensure you have these assets
  "star_wand": { type: 'image', source: require("@/assets/items/star_wand.png") },
  "milk_bowl": { type: 'icon', source: "🥛" },
  "bow_pink": { type: 'icon', source: "🎀" },
  "collar_blue": { type: 'icon', source: "🔵" },
  "toy_mouse": { type: 'icon', source: "🐭" },
  "bone": { type: 'icon', source: "🦴" },
  "collar_red": { type: 'icon', source: "🔴" },
  "hat_yellow": { type: 'icon', source: "🧢" },
  "dog_ball": { type: 'icon', source: "🎾" },
  "rain_boots": { type: 'icon', source: "👢" },
  "bow_green": { type: 'icon', source: "💚" },
  "tophat": { type: 'icon', source: "🎩" },
  "glasses": { type: 'icon', source: "👓" },
  "sweater_blue": { type: 'icon', source: "👕" },
  "fish_toy": { type: 'icon', source: "🐟" },
};

// --- 2. Shared Color Palette ---
const COLORS = {
  bg: '#FFFFFF',
  text: '#3D4C79',
  primary: '#9EB7E5',
  accent1: '#E8F0B8',
  accent2: '#F2E1AC',
  cardBg: '#FFFDF5',
  modalBg: '#3D4C79',
  alertBg: '#FF8A80', // Soft Red for Alerts
};

// --- 3. Assets ---
const PET_IMAGES: Record<PetType, any> = {
  Cat: require("@/assets/pets/cat_1.png"),
  Dog: require("@/assets/pets/dog_1.png"),
  Duck: require("@/assets/pets/duck_1.png"),
  Seal: require("@/assets/pets/seal_1.png"),
};

// --- 4. Animation Components ---
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

const HORIZONTAL_PADDING = 24;
const CARD_GAP = 16;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

export default function StoreScreen() {
  const router = useRouter();
  // Get Global Currency State
  const { petType, currency, setCurrency } = useOnboarding();
  const fallback: PetType = petType ?? "Cat";
  const petSource = PET_IMAGES[fallback];

  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false); // NEW: Alert State

  const [pendingItem, setPendingItem] = useState<any | null>(null);

  // FETCH STORE ITEMS
  useEffect(() => {
    const fetchStore = async () => {
      try {
        const userId = 1; // Replace with dynamic logic if needed
        const res = await fetch(`${API_URL}/api/store/list?userId=${userId}`);
        const data = await res.json();
        if (data.ok) {
          setStoreItems(data.store);
        }
      } catch (e) {
        console.error("Failed to load store:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, []);

  const handlePressItem = (item: any) => {
    setPendingItem(item);
    setConfirmVisible(true);
  };

  const handleCancelBuy = () => {
    setConfirmVisible(false);
    setPendingItem(null);
  };

  const handleConfirmBuy = async () => {
    if (!pendingItem) return;

    // 1. Check if user has enough money (Frontend Check)
    if (currency < pendingItem.price) {
      setConfirmVisible(false); // Close buy modal
      setAlertVisible(true);    // Show alert modal
      return;
    }

    try {
      // 2. Call API to Purchase
      const res = await api.purchase(1, pendingItem.id);

      if (res.ok) {
        // 3. Update Global Currency
        setCurrency(res.currency);
        console.log("Purchase success!");
      } else {
        // If backend rejects it (double check)
        setConfirmVisible(false);
        setAlertVisible(true);
        return;
      }
    } catch(e) {
      console.log(e);
    }
    setConfirmVisible(false);
    setPendingItem(null);
  };

  const renderItemVisual = (itemId: string, style: any) => {
    const mapped = ITEM_MAP[itemId];
    if (!mapped) return <Text style={{fontSize: 40}}>📦</Text>;
    if (mapped.type === 'image') {
      return <Image source={mapped.source} style={style} resizeMode="contain" />;
    } else {
      return <Text style={{fontSize: 50, marginBottom: 10}}>{mapped.source}</Text>;
    }
  };

  const renderHeader = () => (
    <View>
      <View style={styles.topRow}>
        <Pressable
          onPress={() => router.push("/(tabs)/home")}
          style={styles.closeButton}
        >
          <Image
            source={require("@/assets/ui/exit_b.png")}
            style={styles.closeIcon}
          />
        </Pressable>

        <CoinBar
          coins={currency} // Use global currency
          onPressPlus={() => console.log("Open coin purchase")}
        />
      </View>

      <View style={styles.centerArea}>
        <View style={styles.petCircle}>
           <Image source={petSource} style={styles.petImage} resizeMode="contain" />
        </View>
        <View style={styles.separator} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <FloatingParticle delay={0} color={COLORS.accent1} size={140} startX={40} />
        <FloatingParticle delay={2000} color={COLORS.accent2} size={100} startX={width - 50} />
        <FloatingParticle delay={4000} color={COLORS.primary} size={120} startX={width / 2} />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.text} />
          <Text style={{marginTop: 10, color: COLORS.text, fontWeight: '600'}}>Loading Shop...</Text>
        </View>
      ) : (
        <FlatList
          data={storeItems}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.itemCard,
                pressed && { transform: [{ scale: 0.96 }] }
              ]}
              onPress={() => handlePressItem(item)}
            >
              {renderItemVisual(item.id, styles.itemImage)}

              <View style={styles.priceTag}>
                <Text style={styles.priceText}>{item.price} 🐾</Text>
              </View>
            </Pressable>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* BUY MODAL */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelBuy}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.tape} />

            <Text style={styles.modalTitle}>Buy Item?</Text>

            <View style={styles.modalItemPreview}>
              {pendingItem && renderItemVisual(pendingItem.id, styles.modalItemImage)}
            </View>

            <Text style={styles.modalItemName}>{pendingItem?.name}</Text>
            <Text style={styles.modalPrice}>{pendingItem?.price} 🐾</Text>

            <View style={styles.modalButtonsRow}>
              <Pressable style={[styles.modalBtn, styles.modalCancel]} onPress={handleCancelBuy}>
                <Text style={styles.modalBtnTextDark}>No</Text>
              </Pressable>

              <Pressable style={[styles.modalBtn, styles.modalBuy]} onPress={handleConfirmBuy}>
                <Text style={styles.modalBtnTextLight}>Yes!</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ALERT MODAL (Not Enough Coins) */}
      <Modal
        visible={alertVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAlertVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {/* REMOVED COMMENT TO FIX TEXT ERROR */}
          <View style={[styles.modalCard, { backgroundColor: COLORS.accent2 }]}>

            <Text style={[styles.modalTitle, { color: COLORS.text }]}>Oh no!</Text>

            <View style={styles.alertIconContainer}>
               <Text style={{fontSize: 60}}>💸</Text>
            </View>

            <Text style={[styles.alertText, { marginBottom: 4 }]}>Not enough coins.</Text>
            <Text style={[styles.alertText, { fontSize: 14, opacity: 0.7 }]}>Complete more tasks to earn!</Text>

            <Pressable
              style={[styles.modalBtn, styles.modalBuy, { marginTop: 24, width: '100%' }]}
              onPress={() => setAlertVisible(false)}
            >
              <Text style={styles.modalBtnTextLight}>Okay</Text>
            </Pressable>

          </View>
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 60,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
  },
  closeIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  centerArea: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  petCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: COLORS.accent2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.accent2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  petImage: {
    width: 140,
    height: 140,
  },
  separator: {
    width: "60%",
    height: 6,
    backgroundColor: COLORS.accent1,
    borderRadius: 3,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: CARD_GAP,
  },
  itemCard: {
    width: CARD_WIDTH,
    height: 140,
    borderRadius: 24,
    backgroundColor: COLORS.accent2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  itemImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  itemIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(61, 76, 121, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "80%",
    borderRadius: 32,
    backgroundColor: COLORS.modalBg,
    padding: 30,
    alignItems: "center",
    position: 'relative',
    shadowColor: COLORS.modalBg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  tape: {
    position: 'absolute',
    top: -15,
    width: 60,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ rotate: '-2deg' }],
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: '#FFF',
    marginBottom: 20,
  },
  modalItemPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: COLORS.accent1,
  },
  modalItemImage: {
    width: 70,
    height: 70,
  },
  modalItemIcon: {
    fontSize: 50,
  },
  modalItemName: {
    fontSize: 18,
    fontWeight: "800",
    color: '#FFF',
    marginBottom: 4,
  },
  modalPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.accent2,
    marginBottom: 24,
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalCancel: {
    backgroundColor: '#FFF',
  },
  modalBuy: {
    backgroundColor: COLORS.accent1,
  },
  modalBtnTextDark: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  modalBtnTextLight: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  // Alert specific
  alertIconContainer: {
    marginBottom: 16,
  },
  alertText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: 'center',
  },
});