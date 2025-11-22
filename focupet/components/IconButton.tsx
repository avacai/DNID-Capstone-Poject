// components/IconButton.tsx
import { Image, Pressable, View } from "react-native";

type Props = {
  source: any;               // require(...) result
  size?: number;             // icon box size
  onPress?: () => void;
  bg?: string;               // bubble color
};

export default function IconButton({ source, onPress, size = 44, bg = "#B9C5F7" }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => ({
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: bg, alignItems: "center", justifyContent: "center",
        transform: [{ scale: pressed ? 0.94 : 1 }],
        shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
      })}
    >
      <Image source={source} style={{ width: size * 0.6, height: size * 0.6, resizeMode: "contain" }} />
    </Pressable>
  );
}