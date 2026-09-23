import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useDarkMode } from "../../../hooks/useToggleTheme";
import {
  getProfile,
  type Profile,
} from "../../../database/repositories/profileRepository";
import { useRouter } from "expo-router";

const AVATARS = {
  avatar1: require("@/assets/images/avatars/angry-face.png"),
  avatar2: require("@/assets/images/avatars/happy-face.png"),
  avatar3: require("@/assets/images/avatars/hello.png"),
  avatar4: require("@/assets/images/avatars/kitten.png"),
  avatar5: require("@/assets/images/avatars/monkey.png"),
  avatar6: require("@/assets/images/avatars/panda.png"),
};

const Index = () => {
  const { isDark } = useDarkMode();
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const onAccentColor = isDark ? "#061b3a" : "#ffffff";

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await getProfile();
      setProfile(savedProfile);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const avatarSource =AVATARS[profile?.avatar_id as keyof typeof AVATARS];
      

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-background-dark"
      style={{ flex: 1 }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={onAccentColor}
      />

      <View className="flex-1 bg-background dark:bg-background-dark">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
          {/* Greeting */}
          <View className="mb-8">
            <Text className="font-dm-regular text-[15px] text-primary/50 dark:text-primary-dark/50">
              Welcome back,
            </Text>

            {loading ? (
              <View className="mt-2">
                <ActivityIndicator size="small" color="#06d6a0" />
              </View>
            ) : (
              <Text className="font-dm-bold text-[28px] text-primary dark:text-primary-dark mt-1">
                {profile?.display_name || "ShareNami User"}
              </Text>
            )}

            <Text className="font-dm-regular text-[14px] text-primary/50 dark:text-primary-dark/50 mt-2">
              What would you like to do today?
            </Text>
          </View>

          {/* Profile avatar */}
          <View className="w-14 h-14 rounded-full mb-7 overflow-hidden border-2 border-accent">
            {loading ? (
              <View className="flex-1 items-center justify-center bg-primary/5 dark:bg-white/10">
                <ActivityIndicator size="small" color="#06d6a0" />
              </View>
            ) : (
              <Image
                source={avatarSource}
                className="w-full h-full"
                resizeMode="cover"
              />
            )}
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1 px-6 pt-5">
          {/* Send */}
          <Pressable
            className="bg-accent rounded-3xl p-6 mb-4"
            onPress={()=>router.navigate("/(send)")}
            android_ripple={{
              color: "rgba(255,255,255,0.15)",
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center mb-5">
                  <Ionicons name="paper-plane" size={25} color="#ffffff" />
                </View>

                <Text className="font-dm-bold text-[22px] text-white">
                  Send Files
                </Text>

                <Text className="font-dm-regular text-[14px] text-white/75 mt-1">
                  Share photos, videos and files
                </Text>
              </View>

              <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </View>
            </View>
          </Pressable>

          {/* Receive */}
          <Pressable
            className="rounded-3xl p-6 mb-8 bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10"
            onPress={()=>router.navigate("/(receive)")}
            android_ripple={{
              color: "rgba(6,214,160,0.08)",
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="w-12 h-12 rounded-2xl bg-accent/15 items-center justify-center mb-5">
                  <Ionicons name="qr-code" size={25} color="#06d6a0" />
                </View>

                <Text className="font-dm-bold text-[22px] text-primary dark:text-primary-dark">
                  Receive Files
                </Text>

                <Text className="font-dm-regular text-[14px] text-primary/50 dark:text-primary-dark/50 mt-1">
                  Create a session and receive files
                </Text>
              </View>

              <View className="w-11 h-11 rounded-full bg-accent/10 items-center justify-center">
                <Ionicons name="arrow-forward" size={20} color="#06d6a0" />
              </View>
            </View>
          </Pressable>

          {/* Recent Transfers */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-dm-bold text-[19px] text-primary dark:text-primary-dark">
              Recent Transfers
            </Text>

            <Text className="font-dm-medium text-[13px] text-accent">
              View all
            </Text>
          </View>

          {/* Empty state */}
          <View className="items-center justify-center py-8">
            <View className="w-14 h-14 rounded-full bg-primary/5 dark:bg-white/5 items-center justify-center mb-3">
              <Ionicons name="swap-horizontal" size={25} color="#06d6a0" />
            </View>

            <Text className="font-dm-medium text-[15px] text-primary/60 dark:text-primary-dark/60">
              No transfers yet
            </Text>

            <Text className="font-dm-regular text-[13px] text-primary/35 dark:text-primary-dark/35 mt-1 text-center">
              Your recent file transfers will appear here.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Index;
