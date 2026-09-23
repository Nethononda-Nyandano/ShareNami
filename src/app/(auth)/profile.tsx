import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Device from "expo-device";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";

import { useDarkMode } from "../../../hooks/useToggleTheme";

import {
  getProfile,
  saveProfile}
  from "../../../database/repositories/profileRepository"

const AVATARS = [
  {
    id: "avatar1",
    image: require("@/assets/images/avatars/angry-face.png"),
  },
  {
    id: "avatar2",
    image: require("@/assets/images/avatars/happy-face.png"),
  },
  {
    id: "avatar3",
    image: require("@/assets/images/avatars/hello.png"),
  },
  {
    id: "avatar4",
    image: require("@/assets/images/avatars/kitten.png"),
  },
  {
    id: "avatar5",
    image: require("@/assets/images/avatars/monkey.png"),
  },
  {
    id: "avatar6",
    image: require("@/assets/images/avatars/panda.png"),
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark } = useDarkMode();

  const [displayName, setDisplayName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("avatar1");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const backgroundColor = isDark ? "#061b3a" : "#ffffff";

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        // --------------------------------------------------
        // LOAD PROFILE FROM SQLITE
        // --------------------------------------------------

        const profile = await getProfile();

        if (profile) {
          setDeviceId(profile.device_id);
          setDisplayName(profile.display_name);

          if (
            AVATARS.some(
              (avatar) => avatar.id === profile.avatar_id,
            )
          ) {
            setSelectedAvatar(profile.avatar_id);
          }

          return;
        }

        // --------------------------------------------------
        // CREATE DEVICE ID FOR NEW PROFILE
        // --------------------------------------------------

        const newDeviceId = Crypto.randomUUID();

        setDeviceId(newDeviceId);

        // --------------------------------------------------
        // INITIAL DISPLAY NAME
        // --------------------------------------------------

        const model = Device.modelName;

        if (model) {
          setDisplayName(model);
        }
      } catch (error) {
        console.error(
          "Failed to initialize ShareNami profile:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    initializeProfile();
  }, []);

  // --------------------------------------------------
  // DEVICE INFORMATION
  // --------------------------------------------------

  const deviceName =
    Device.modelName ||
    Device.deviceName ||
    "Your device";

  const manufacturer = Device.manufacturer;

  // --------------------------------------------------
  // SELECTED AVATAR
  // --------------------------------------------------

  const selectedAvatarData =
    AVATARS.find(
      (avatar) => avatar.id === selectedAvatar,
    ) || AVATARS[0];

  // --------------------------------------------------
  // SAVE PROFILE
  // --------------------------------------------------

  const handleContinue = async () => {
    const trimmedName = displayName.trim();

    if (
      !trimmedName ||
      !selectedAvatar ||
      !deviceId
    ) {
      return;
    }

    try {
      setSaving(true);

      // --------------------------------------------------
      // SAVE TO SQLITE
      // --------------------------------------------------

      await saveProfile(
        deviceId,
        trimmedName,
        selectedAvatar,
      );

      console.log("ShareNami profile saved:", {
        deviceId,
        displayName: trimmedName,
        avatarId: selectedAvatar,
      });

      // --------------------------------------------------
      // REDIRECT TO TABS
      // --------------------------------------------------

      router.replace("/(tabs)");
    } catch (error) {
      console.error(
        "Failed to save ShareNami profile:",
        error,
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor,
        }}
      >
        <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
          <ActivityIndicator
            size="large"
            color="#06d6a0"
          />

          <Text className="font-dm-regular text-sm text-primary/60 dark:text-primary-dark/60 mt-4">
            Setting up ShareNami...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // --------------------------------------------------
  // SCREEN
  // --------------------------------------------------

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor,
      }}
    >
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={backgroundColor}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        {/* --------------------------------------------------
            HEADER
        -------------------------------------------------- */}

        <View className="items-center flex-row justify-between px-6 bg-background dark:bg-background-dark pt-2">
          <View className="items-center">
            {isDark ? (
              <Image
                source={require("@/assets/images/logo/logoDark.png")}
                className="w-16 h-14"
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require("@/assets/images/logo/logo.png")}
                className="w-16 h-14"
                resizeMode="contain"
              />
            )}

            <Text className="font-dm-extrabold text-xl text-primary dark:text-primary-dark">
              <Text className="border-b-2 border-on-accent dark:border-on-accent-dark">
                Share
              </Text>

              <Text className="text-accent dark:text-accent-dark">
                Nami
              </Text>
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1 bg-background dark:bg-background-dark"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 30,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* --------------------------------------------------
              DESCRIPTION
          -------------------------------------------------- */}

          <View>
            <Text className="font-dm-regular text-primary/60 dark:text-primary-dark/60 mt-3 leading-[21px]">
              Choose a name and avatar other{" "}
              <Text className="text-profile font-dm-semibold">
                ShareNami
              </Text>{" "}
              users will see when you connect and share
              files.
            </Text>
          </View>

          {/* --------------------------------------------------
              AVATAR PREVIEW
          -------------------------------------------------- */}

          <View className="items-center mt-7">
            <View className="relative">
              <View className="w-28 h-28 rounded-full bg-accent/10 items-center justify-center border-4 border-accent/20 overflow-hidden">
                <Image
                  source={selectedAvatarData.image}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>

              <View className="absolute -right-1 -bottom-1 w-9 h-9 rounded-full bg-accent items-center justify-center border-4 border-background dark:border-background-dark">
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={
                    isDark
                      ? "#061b3a"
                      : "#ffffff"
                  }
                />
              </View>
            </View>

            <Text className="font-dm-semibold text-sm text-primary dark:text-primary-dark mt-4">
              Your ShareNami avatar
            </Text>

            <Text className="font-dm-regular text-xs text-primary/45 dark:text-primary-dark/45 mt-1">
              Choose one that represents you
            </Text>
          </View>

          {/* --------------------------------------------------
              AVATAR SELECTION
          -------------------------------------------------- */}

          <View className="mt-7">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-dm-semibold text-sm text-primary dark:text-primary-dark">
                Choose an avatar
              </Text>

              <Text className="font-dm-medium text-xs text-primary/40 dark:text-primary-dark/40">
                {AVATARS.length} available
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {AVATARS.map((avatar) => {
                const isSelected =
                  selectedAvatar === avatar.id;

                return (
                  <Pressable
                    key={avatar.id}
                    onPress={() =>
                      setSelectedAvatar(avatar.id)
                    }
                    className="mb-4"
                    style={{
                      width: "30%",
                    }}
                  >
                    <View
                      className={`aspect-square rounded-2xl items-center justify-center overflow-hidden ${
                        isSelected
                          ? "border-2 border-accent bg-accent/10"
                          : "border border-primary/10 dark:border-primary-dark/10 bg-primary/5 dark:bg-primary-dark/5"
                      }`}
                    >
                      <Image
                        source={avatar.image}
                        className="w-full h-full"
                        resizeMode="cover"
                      />

                      {isSelected && (
                        <View className="absolute right-1 top-1 w-6 h-6 rounded-full bg-accent items-center justify-center">
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={
                              isDark
                                ? "#061b3a"
                                : "#ffffff"
                            }
                          />
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* --------------------------------------------------
              DISPLAY NAME
          -------------------------------------------------- */}

          <View className="mt-7">
            <Text className="font-dm-semibold text-sm text-primary dark:text-primary-dark mb-3">
              Display name
            </Text>

            <View className="flex-row items-center rounded-2xl border border-primary/10 dark:border-primary-dark/10 bg-primary/5 dark:bg-primary-dark/5 px-4 h-14">
              <Ionicons
                name="person-outline"
                size={20}
                color={
                  isDark
                    ? "rgba(255,255,255,0.45)"
                    : "rgba(7,59,76,0.45)"
                }
              />

              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
                placeholderTextColor={
                  isDark
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(7,59,76,0.35)"
                }
                className="flex-1 ml-3 font-dm-medium text-base text-primary dark:text-primary-dark"
                maxLength={30}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>

            <View className="flex-row items-center justify-between mt-2">
              <Text className="font-dm-regular text-xs text-primary/40 dark:text-primary-dark/40">
                This is how your name will appear to nearby
                users.
              </Text>

              <Text className="font-dm-regular text-xs text-primary/30 dark:text-primary-dark/30">
                {displayName.length}/30
              </Text>
            </View>
          </View>

          {/* --------------------------------------------------
              PUSH BUTTON TO BOTTOM
          -------------------------------------------------- */}

          <View className="flex-1 min-h-10" />

          {/* --------------------------------------------------
              CONTINUE
          -------------------------------------------------- */}

          <Pressable
            onPress={handleContinue}
            disabled={
              !displayName.trim() ||
              !deviceId ||
              saving
            }
            className={`h-14 rounded-2xl flex-row items-center justify-center ${
              displayName.trim() &&
              deviceId &&
              !saving
                ? "bg-accent active:opacity-80"
                : "bg-accent/40"
            }`}
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color="#ffffff"
              />
            ) : (
              <>
                <Text className="font-dm-bold text-sm text-on-accent">
                  Continue
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#ffffff"
                  style={{
                    marginLeft: 7,
                  }}
                />
              </>
            )}
          </Pressable>

          <Text className="font-dm-regular text-center text-xs text-primary/35 dark:text-primary-dark/35 mt-4">
            Share. Scan. Send.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}