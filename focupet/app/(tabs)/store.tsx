import React, { useState } from "react";
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

type StoreItem = {
  id: string;
};

const PLACEHOLDER_ITEMS: StoreItem[] = Array.from({ length: 20 }).map(
  (_, i) => ({
    id: String(i + 1),
  })
);

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 32;
const CARD_GAP = 18;
const CARD_WIDTH =
  (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2; // two columns

export default function StoreScreen() {
  const router = useRouter();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingItem, setPendingItem] = useState<StoreItem | null>(null);

  const handlePressItem = (item: StoreItem) => {
    setPendingItem(item);
    setConfirmVisible(true);
  };

  const handleCancelBuy = () => {
    setConfirmVisible(false);
    setPendingItem(null);
  };

  const handleConfirmBuy = () => {
    // TODO: deduct coins & unlock item
    console.log("Buying item", pendingItem?.id);
    setConfirmVisible(false);
    setPendingItem(null);
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
          {/* Replace with your close PNG if you have one */}
          <Image
            source={require("@/assets/ui/exit_b.png")}
            style={styles.closeIcon}
          />
        </Pressable>

        <CoinBar
          coins={120}
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
        data={PLACEHOLDER_ITEMS}
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
            {/* later: show real item art / price here */}
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
      />
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelBuy}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* yellow item block */}
            <View style={styles.modalItemPreview}>
              {/* later: place item image here */}
            </View>

            {/* buttons row */}
            <View style={styles.modalButtonsRow}>
              <Pressable style={styles.modalButtonCancel} onPress={handleCancelBuy}>
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.modalButtonBuy} onPress={handleConfirmBuy}>
                <Text style={styles.modalButtonBuyText}>Buy</Text>
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