
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useDarkMode } from "../../../hooks/useToggleTheme";

import {
  getProfile,
  type Profile,
} from "../../../database/repositories/profileRepository";

const AVATARS = {
  avatar1: require("@/assets/images/avatars/angry-face.png"),
  avatar2: require("@/assets/images/avatars/happy-face.png"),
  avatar3: require("@/assets/images/avatars/hello.png"),
  avatar4: require("@/assets/images/avatars/kitten.png"),
  avatar5: require("@/assets/images/avatars/monkey.png"),
  avatar6: require("@/assets/images/avatars/panda.png"),
};

const ReceiveSessionScreen = () => {
  const router = useRouter();
  const { isDark } = useDarkMode();

  const params = useLocalSearchParams<{
    sessionId?: string;
    deviceId?: string;
    displayName?: string;
    avatarId?: string;
    expiresAt?: string;
  }>();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [accepting, setAccepting] =
    useState(false);

  const [expired, setExpired] =
    useState(false);

  const sessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0]
    : params.sessionId;

  const deviceId = Array.isArray(params.deviceId)
    ? params.deviceId[0]
    : params.deviceId;

  const displayName = Array.isArray(
    params.displayName,
  )
    ? params.displayName[0]
    : params.displayName;

  const avatarId = Array.isArray(
    params.avatarId,
  )
    ? params.avatarId[0]
    : params.avatarId;

  const expiresAt = Array.isArray(
    params.expiresAt,
  )
    ? params.expiresAt[0]
    : params.expiresAt;

  const senderAvatar = useMemo(() => {
    if (!avatarId) {
      return AVATARS.avatar3;
    }

    return (
      AVATARS[
        avatarId as keyof typeof AVATARS
      ] ?? AVATARS.avatar3
    );
  }, [avatarId]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedProfile = await getProfile();
        setProfile(savedProfile);
      } catch (error) {
        console.error(
          "Failed to load receiver profile:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (!expiresAt) {
      setExpired(true);
      return;
    }

    const checkExpiration = () => {
      const expirationTime =
        new Date(expiresAt).getTime();

      if (
        Number.isNaN(expirationTime) ||
        expirationTime <= Date.now()
      ) {
        setExpired(true);
      } else {
        setExpired(false);
      }
    };

    checkExpiration();

    const interval = setInterval(
      checkExpiration,
      1000,
    );

    return () => clearInterval(interval);
  }, [expiresAt]);

  const remainingTime = useMemo(() => {
    if (!expiresAt) {
      return "Expired";
    }

    const expirationTime =
      new Date(expiresAt).getTime();

    const difference =
      expirationTime - Date.now();

    if (difference <= 0) {
      return "Expired";
    }

    const totalSeconds = Math.floor(
      difference / 1000,
    );

    const minutes = Math.floor(
      totalSeconds / 60,
    );

    const seconds =
      totalSeconds % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, [expiresAt, expired]);

  const handleBack = () => {
    router.back();
  };

  const handleAccept = async () => {
    if (expired) {
      Alert.alert(
        "Session expired",
        "Ask the sender to create a new transfer session.",
      );

      return;
    }

    if (!sessionId || !deviceId) {
      Alert.alert(
        "Invalid session",
        "The transfer session information is incomplete.",
      );

      return;
    }

    try {
      setAccepting(true);

      /*
       * Networking will be implemented next.
       *
       * We currently have:
       * - sessionId
       * - sender deviceId
       * - sender displayName
       * - sender avatarId
       * - expiresAt
       *
       * The next step is discovering the sender
       * on the local network and establishing the
       * transfer connection.
       */

      Alert.alert(
        "Ready to connect",
        "The transfer session is valid. Local device connection will be implemented next.",
        [
          {
            text: "OK",
            onPress: () => setAccepting(false),
          },
        ],
      );
    } catch (error) {
      console.error(
        "Failed to accept transfer:",
        error,
      );

      Alert.alert(
        "Unable to receive",
        "Something went wrong while preparing the transfer.",
      );

      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
        <StatusBar
          barStyle={
            isDark
              ? "light-content"
              : "dark-content"
          }
          backgroundColor={
            isDark
              ? "#061b3a"
              : "#ffffff"
          }
        />

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#06d6a0"
          />

          <Text className="font-dm-medium text-[14px] text-primary/50 dark:text-primary-dark/50 mt-4">
            Preparing transfer...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (expired) {
    return (
      <SafeAreaView  style={{flex:1}}>
        <StatusBar
          barStyle={
            isDark
              ? "light-content"
              : "dark-content"
          }
          backgroundColor={
            isDark
              ? "#061b3a"
              : "#ffffff"
          }
        />

        <View className="flex-1 px-6 bg-background dark:bg-background-dark">
          <View className="flex-row items-center pt-3">
            <Pressable
              onPress={handleBack}
              className="w-11 h-11 rounded-full items-center justify-center bg-primary/5 dark:bg-white/5"
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={
                  isDark
                    ? "#ffffff"
                    : "#073b4c"
                }
              />
            </Pressable>

            <Text className="flex-1 font-dm-bold text-[20px] text-primary dark:text-primary-dark text-center mr-11">
              Receive
            </Text>
          </View>

          <View className="flex-1 items-center justify-center">
            <View className="w-24 h-24 rounded-3xl bg-primary/5 dark:bg-white/5 items-center justify-center mb-6">
              <Ionicons
                name="time-outline"
                size={48}
                color={
                  isDark
                    ? "#ffffff"
                    : "#073b4c"
                }
              />
            </View>

            <Text className="font-dm-bold text-[24px] text-primary dark:text-primary-dark text-center">
              Session expired
            </Text>

            <Text className="font-dm-regular text-[14px] leading-[21px] text-primary/50 dark:text-primary-dark/50 text-center mt-3 max-w-[320px]">
              This transfer session is no longer
              available. Ask the sender to create
              a new QR code.
            </Text>

            <Pressable
              onPress={() =>
                router.replace(
                  "/(receive)",
                )
              }
              className="mt-7 px-8 py-4 rounded-2xl bg-accent active:opacity-80"
            >
              <Text className="font-dm-bold text-white">
                Scan New QR
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{flex:1}}>
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={
          isDark
            ? "#061b3a"
            : "#ffffff"
        }
      />

      <View className="flex-1 px-6 bg-background dark:bg-background-dark">
        {/* Header */}
        <View className="flex-row items-center pt-3">
          <Pressable
            onPress={handleBack}
            className="w-11 h-11 rounded-full items-center justify-center bg-primary/5 dark:bg-white/5"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={
                isDark
                  ? "#ffffff"
                  : "#073b4c"
              }
            />
          </Pressable>

          <Text className="flex-1 font-dm-bold text-[20px] text-primary dark:text-primary-dark text-center mr-11">
            Receive
          </Text>
        </View>

        {/* Main content */}
        <View className="flex-1 justify-center">
          {/* Sender */}
          <View className="items-center">
            <View className="w-28 h-28 rounded-[32px] overflow-hidden bg-accent/15">
              <Image
                source={senderAvatar}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            <Text className="font-dm-bold text-[26px] text-primary dark:text-primary-dark text-center mt-6">
              {displayName || "ShareNami user"}
            </Text>

            <Text className="font-dm-regular text-[14px] leading-[21px] text-primary/50 dark:text-primary-dark/50 text-center mt-2 max-w-[320px]">
              wants to send files to you.
            </Text>
          </View>

          {/* Session card */}
          <View className="mt-8 rounded-3xl p-5 bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10">
            {/* Sender */}
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-accent/15 items-center justify-center">
                <Ionicons
                  name="person-outline"
                  size={23}
                  color="#06d6a0"
                />
              </View>

              <View className="flex-1 ml-3">
                <Text className="font-dm-medium text-[12px] text-primary/45 dark:text-primary-dark/45">
                  SENDING FROM
                </Text>

                <Text
                  numberOfLines={1}
                  className="font-dm-semibold text-[16px] text-primary dark:text-primary-dark mt-1"
                >
                  {displayName ||
                    "ShareNami user"}
                </Text>
              </View>
            </View>

            <View className="h-px bg-primary/10 dark:bg-white/10 my-5" />

            {/* Session */}
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-accent/15 items-center justify-center">
                <Ionicons
                  name="key-outline"
                  size={23}
                  color="#06d6a0"
                />
              </View>

              <View className="flex-1 ml-3">
                <Text className="font-dm-medium text-[12px] text-primary/45 dark:text-primary-dark/45">
                  SESSION
                </Text>

                <Text
                  numberOfLines={1}
                  className="font-dm-semibold text-[13px] text-primary dark:text-primary-dark mt-1"
                >
                  {sessionId ||
                    "Unknown session"}
                </Text>
              </View>
            </View>

            <View className="h-px bg-primary/10 dark:bg-white/10 my-5" />

            {/* Expiration */}
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-accent/15 items-center justify-center">
                <Ionicons
                  name="time-outline"
                  size={23}
                  color="#06d6a0"
                />
              </View>

              <View className="flex-1 ml-3">
                <Text className="font-dm-medium text-[12px] text-primary/45 dark:text-primary-dark/45">
                  SESSION EXPIRES IN
                </Text>

                <Text className="font-dm-bold text-[16px] text-accent mt-1">
                  {remainingTime}
                </Text>
              </View>
            </View>
          </View>

          {/* Receiver */}
          {profile && (
            <View className="flex-row items-center justify-center mt-6">
              <View className="w-8 h-8 rounded-full bg-accent/15 items-center justify-center">
                <Ionicons
                  name="person-outline"
                  size={16}
                  color="#06d6a0"
                />
              </View>

              <Text className="font-dm-medium text-[13px] text-primary/55 dark:text-primary-dark/55 ml-2">
                Receiving as{" "}
                {profile.display_name}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom actions */}
        <View className="pb-5">
          <View className="flex-row items-center justify-center mb-4">
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color="#06d6a0"
            />

            <Text className="font-dm-regular text-[12px] text-primary/45 dark:text-primary-dark/45 ml-2">
              Temporary secure transfer session
            </Text>
          </View>

          <Pressable
            onPress={handleAccept}
            disabled={accepting}
            className={`w-full rounded-2xl py-4 items-center justify-center ${
              accepting
                ? "bg-accent/50"
                : "bg-accent active:opacity-80"
            }`}
          >
            {accepting ? (
              <ActivityIndicator
                size="small"
                color="#ffffff"
              />
            ) : (
              <View className="flex-row items-center">
                <Ionicons
                  name="download-outline"
                  size={21}
                  color="#ffffff"
                />

                <Text className="font-dm-bold text-[15px] text-white ml-2">
                  Accept Transfer
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={handleBack}
            disabled={accepting}
            className="w-full items-center justify-center py-4 mt-1"
          >
            <Text className="font-dm-semibold text-[14px] text-primary/50 dark:text-primary-dark/50">
              Decline
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReceiveSessionScreen;

