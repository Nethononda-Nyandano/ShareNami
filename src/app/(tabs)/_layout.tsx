import React, { useCallback } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { useDarkMode } from "../../../hooks/useToggleTheme";
import "../../../global.css";

type IconName = keyof typeof Ionicons.glyphMap;

type TabConfig = {
  label: string;
  active: IconName;
  inactive: IconName;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  index: {
    label: "Home",
    active: "home",
    inactive: "home-outline",
  },

  transfers: {
    label: "Transfers",
    active: "swap-horizontal",
    inactive: "swap-horizontal-outline",
  },

  received: {
    label: "Received",
    active: "download",
    inactive: "download-outline",
  },

  settings: {
    label: "Settings",
    active: "settings",
    inactive: "settings-outline",
  },
};

const COLORS = {
  light: {
    active: "#06d6a0",
    inactive: "#78716c",

    glassBackground: "rgba(255, 255, 255, 0.55)",
    glassBorder: "rgba(255, 255, 255, 0.80)",
    glassHighlight: "rgba(255, 255, 255, 0.95)",

    shadow: "#1e293b",
  },

  dark: {
    active: "#06d6a0",
    inactive: "#d9e6ec",

    glassBackground: "rgba(6, 27, 58, 1)",
    glassBorder: "rgba(50, 50, 100, 0.6)",
    glassHighlight: "rgba(255, 255, 255, 0.22)",

    shadow: "#000000",
  },
} as const;

const BAR_HEIGHT = 76;

function GlassTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // IMPORTANT:
  // useDarkMode() returns { isDark }
  const { isDark } = useDarkMode();

  const colors = isDark ? COLORS.dark : COLORS.light;

  const handleTabPress = useCallback(
    (routeKey: string, routeName: string) => {
      const event = navigation.emit({
        type: "tabPress",
        target: routeKey,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    },
    [navigation],
  );

  const handleTabLongPress = useCallback(
    (routeKey: string) => {
      navigation.emit({
        type: "tabLongPress",
        target: routeKey,
      });
    },
    [navigation],
  );

  const renderTab = (
    route: (typeof state.routes)[number],
    index: number,
  ) => {
    const config = TAB_CONFIG[route.name];

    if (!config) {
      return null;
    }

    const isFocused = state.index === index;

    return (
      <Pressable
        key={route.key}
        onPress={() =>
          handleTabPress(route.key, route.name)
        }
        onLongPress={() =>
          handleTabLongPress(route.key)
        }
        accessibilityRole="tab"
        accessibilityState={{
          selected: isFocused,
        }}
        accessibilityLabel={config.label}
        style={({ pressed }) => [
          styles.tabItem,
          pressed && styles.tabItemPressed,
        ]}
      >
        <Ionicons
          name={
            isFocused
              ? config.active
              : config.inactive
          }
          size={22}
          color={
            isFocused
              ? colors.active
              : colors.inactive
          }
        />

        <Text
          numberOfLines={1}
          style={[
            styles.tabLabel,
            {
              color: isFocused
                ? colors.active
                : colors.inactive,

              fontWeight: isFocused
                ? "700"
                : "500",
            },
          ]}
        >
          {config.label}
        </Text>
      </Pressable>
    );
  };

  const tabs = state.routes.filter(
    (route) =>
      route.name === "index" ||
      route.name === "transfers" ||
      route.name === "received" ||
      route.name === "settings",
  );

  const blurTint =
    Platform.OS === "ios"
      ? isDark
        ? "systemUltraThinMaterialDark"
        : "systemUltraThinMaterialLight"
      : isDark
        ? "dark"
        : "light";

  const blurIntensity =
    Platform.OS === "ios" ? 85 : 100;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <BlurView
        intensity={blurIntensity}
        tint={blurTint}
        style={styles.blurContainer}
      >
        <View
          style={[
            styles.glassSurface,
            {
              backgroundColor:
                colors.glassBackground,

              borderColor:
                colors.glassBorder,
            },
          ]}
        >
          {/* Top glass highlight */}
          <View
            pointerEvents="none"
            style={[
              styles.glassHighlight,
              {
                backgroundColor:
                  colors.glassHighlight,
              },
            ]}
          />

          <View style={styles.tabsRow}>
            {tabs.map((route) => {
              const index =
                state.routes.findIndex(
                  (item) =>
                    item.key === route.key,
                );

              return renderTab(route, index);
            })}
          </View>
        </View>
      </BlurView>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <GlassTabBar {...props} />
      )}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />

      <Tabs.Screen
        name="transfers"
        options={{
          title: "Transfers",
        }}
      />

      <Tabs.Screen
        name="received"
        options={{
          title: "Received",
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",

    left: 16,
    right: 16,

    height: BAR_HEIGHT,

    zIndex: 50,
  },

  blurContainer: {
    flex: 1,

    overflow: "hidden",

    borderRadius: 32,

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.18,

    shadowRadius: 18,

    elevation: 16,
  },

  glassSurface: {
    flex: 1,

    overflow: "hidden",

    borderRadius: 32,

    borderWidth: StyleSheet.hairlineWidth * 2,
  },

  glassHighlight: {
    position: "absolute",

    top: 0,
    left: 24,
    right: 24,

    height: 1,
  },

  tabsRow: {
    flex: 1,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-around",

    paddingHorizontal: 4,
  },

  tabItem: {
    flex: 1,

    height: BAR_HEIGHT,

    alignItems: "center",

    justifyContent: "center",

    gap: 3,
  },

  tabItemPressed: {
    opacity: 0.6,
  },

  tabLabel: {
    fontFamily: "poppin-medium",
    fontSize: 10,
    marginTop: 2,
  },
});