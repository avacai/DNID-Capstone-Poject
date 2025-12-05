// app/(tabs)/store.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Dimensions,
  Modal,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import CoinBar from "@/components/CoinBar";
import { useGame } from "@/src/context/GameContext";

type StoreItem = {
  id: string;
  name: string;
  price: number;
  petType: string;
  category: string;
  type: string;
};

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 32;
const CARD_GAP = 18;
const CARD_WIDTH =
  (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2; // two columns

export default function StoreScreen() {
  const router = useRouter();
  const { game, user, purchaseItem } = useGame();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingItem, setPendingItem] = useState<StoreItem | null>(null);
  const [isBuying, setIsBuying] = useState(false);

  const coins = game?.currency ?? 0;

  // Items from backend (filtered by pet type in /api/game/state)
  const storeItems: StoreItem[] = useMemo(
    () => (Array.isArray(game?.store) ? (game!.store as StoreItem[]) : []),
    [game]
  );

  const handlePressItem = (item: StoreItem) => {
    setPendingItem(item);
    setConfirmVisible(true);
  };

  const handleCancelBuy = () => {
    if (isBuying) return;
    setConfirmVisible(false);
    setPendingItem(null);
  };

  const handleConfirmBuy = async () => {
    if (!pendingItem || !user) {
      setConfirmVisible(false);
      setPendingItem(null);
      return;
    }

    try {
      setIsBuying(true);
      await purchaseItem(pendingItem.id);
      // success – backend + GameContext update coins & inventory
      setConfirmVisible(false);
      setPendingItem(null);
    } catch (e: any) {
      console.warn("Purchase failed", e);
      // you can swap this for a nicer in-UI toast later
      alert(e?.message ?? "Purchase failed");
    } finally {
      setIsBuying(false);
    }
  };

  const renderHeader = () => (
    <>
      {/* Top row: close button + coin bar */}
      <View style={styles.topRow}>
        <Pressable
          onPress={() => router.push("/(tabs)/home")}
          hitSlop={10}
          style={styles.closeButton}
        >
          <Image
            source={require("@/assets/ui/exit_b.png")}
            style={styles.closeIcon}
          />
        </Pressable>

        <CoinBar
          coins={coins}
          onPressPlus={() => console.log("Open coin purchase from Store")}
        />
      </View>

      {/* Pet circle */}
      <View style={styles.petCircleWrapper}>
        <View style={styles.petCircle} />
      </View>

      {/* Light green separator */}
      <View style={styles.separator} />
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={storeItems}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.itemCard}
            onPress={() => handlePressItem(item)}
          >
            {/* Keep yellow tile look; small text for clarity */}
            <View style={{ flex: 1, justifyContent: "flex-end", padding: 10 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "700" }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text style={{ fontSize: 12 }}>{item.price}★</Text>
            </View>
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Confirmation modal */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelBuy}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Selected item info */}
            {pendingItem && (
              <>
                <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
                  {pendingItem.name}
                </Text>
                <Text style={{ marginBottom: 16, fontSize: 16 }}>
                  Price: {pendingItem.price}★
                </Text>
              </>
            )}

            {/* yellow item block */}
            <View style={styles.modalItemPreview}>
              {/* later: place item image here */}
            </View>

            {/* buttons row */}
            <View style={styles.modalButtonsRow}>
              <Pressable
                style={styles.modalButtonCancel}
                onPress={handleCancelBuy}
                disabled={isBuying}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.modalButtonBuy}
                onPress={handleConfirmBuy}
                disabled={isBuying}
              >
                <Text style={styles.modalButtonBuyText}>
                  {isBuying ? "Buying..." : "Buy"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF5",
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 40,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  closeButton: {
    width: 52,
    height: 52,
  },
  closeIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  petCircleWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  petCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#DFE1E4",
  },
  separator: {
    height: 24,
    backgroundColor: "#E7F1A7", // soft green bar
    marginBottom: 24,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: CARD_GAP,
  },
  itemCard: {
    width: CARD_WIDTH,
    height: 150,
    borderRadius: 18,
    backgroundColor: "#F6E9B8", // soft yellow like your mock
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)", // dim background
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "80%",
    borderRadius: 24,
    backgroundColor: "#A4B8F7", // soft blue like your mock
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: "center",
  },
  modalItemPreview: {
    width: 180,
    height: 220,
    borderRadius: 20,
    backgroundColor: "#FBE8A6", // pale yellow item slot
    marginBottom: 28,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButtonCancel: {
    flex: 1,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#C3D4FF",
    paddingVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  modalButtonBuy: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 20,
    backgroundColor: "#FBE8A6",
    paddingVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  modalButtonCancelText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2A44",
  },
  modalButtonBuyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2A44",
  },
});
