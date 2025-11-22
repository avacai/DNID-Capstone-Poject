import { View, Image, Pressable } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BAR_HEIGHT = 88;      // Figma dock height
const ICON_SIZE = 62;       // Figma icon size
const ICON_OPACITY_INACTIVE = 0.55;

const icons = {
  home: require("@/assets/ui/home.png"),
  store: require("@/assets/ui/store.png"),
  task: require("@/assets/ui/task.png"),
  story: require("@/assets/ui/story.png"),
};

export default function BottomDock({
  state, descriptors, navigation,
}: BottomTabBarProps) {
  const inset = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        left: 0, right: 0, bottom: 0,
        // total height includes safe-area inset
        height: BAR_HEIGHT + inset.bottom,
        paddingBottom: inset.bottom || 12,
        paddingHorizontal: 16,
        justifyContent: "flex-end",
        backgroundColor: "transparent",
      }}
    >
      {/* rounded blue base */}
      <View
        style={{
          height: BAR_HEIGHT,
          backgroundColor: "#A0B1F3",
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          paddingHorizontal: 28,
          // little “lift” shadow
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -2 },
          justifyContent: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const src = icons[route.name as keyof typeof icons];

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={({ pressed }) => ({
                  alignItems: "center",
                  justifyContent: "center",
                  width: ICON_SIZE + 12, // tap target
                  height: ICON_SIZE + 12,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
                hitSlop={12}
              >
                <Image
                  source={src}
                  resizeMode="contain"
                  style={{
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    opacity: isFocused ? 1 : ICON_OPACITY_INACTIVE,
                  }}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}