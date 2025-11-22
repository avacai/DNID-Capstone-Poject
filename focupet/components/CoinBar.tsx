import React from "react";
import { View, Text, Image, Pressable, StyleSheet, ImageBackground } from "react-native";

type CoinBarProps = {
  coins: number;
  onPressPlus: () => void;
  onPressBar?: () => void;
};

export default function CoinBar({ coins, onPressPlus, onPressBar }: CoinBarProps) {
  return (
    <View style={styles.wrapper}>
      {/* Yellow bar (PNG as background) */}
      <Pressable onPress={onPressBar} style={styles.barPressable}>
        <ImageBackground
          source={require("@/assets/ui/yellowBar.png")}  // <-- your yellow PNG
          style={styles.barBG}
          resizeMode="stretch"
        >
          {/* Coin icon on left */}
          <Image
            source={require("@/assets/ui/coin1.png")}
            style={styles.coinIcon}
          />

          {/* Centered text */}
          <Text style={styles.amountText}>{coins}</Text>
        </ImageBackground>
      </Pressable>

      {/* Plus bubble PNG on the right edge */}
      <Pressable
        onPress={onPressPlus}
        style={styles.plusBubble}
        hitSlop={10}
      >
        <Image
          source={require("@/assets/ui/coin_plus.png")} // <-- your plus PNG
          style={styles.plusIcon}
        />
      </Pressable>
    </View>
  );
}


const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },

  barBG: {
    width: 160,     // match PNG size later
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 35, // leave room for coin icon
    paddingRight: 20,
  },

  coinIcon: {
    position: "absolute",
    left: -5,     // overlap slightly if needed
    width: 60,
    height: 60,
    resizeMode: "contain",
  },

  amountText: {
    flex: 1,
    textAlign: "center",
    top: "-2",
    fontSize: 20,
    fontWeight: "900",
    color: "#4A3A12",
  },

  plusBubble: {
    position: "absolute",
    right: -10,   // attach to right edge
    top: 2,
  },

  plusIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
});