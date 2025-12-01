import React from "react";
import {
  Pressable,
  ImageBackground,
  Text,
  StyleSheet,
  ViewStyle,
} from "react-native";

type ImageButtonProps = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;        // extra margin / positioning from parent
};

export default function ImageButton({ label, onPress, style }: ImageButtonProps) {
  return (
    <Pressable onPress={onPress} style={style}>
      <ImageBackground
        source={require("@/assets/ui/buttonStart.png")} // 👈 your PNG
        style={styles.button}
        imageStyle={styles.buttonImage}
        resizeMode="contain"
      >
        <Text style={styles.label}>{label}</Text>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 260,          // tweak so it matches your Figma size
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonImage: {
    width: "100%",
    height: "100%",
    borderRadius: 999,   // if you want rounded hitbox
  },
  label: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1F2933",    // dark text on your yellow/blue
  },
});