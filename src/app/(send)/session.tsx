
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { useLocalSearchParams, useRouter } from "expo-router";

import "../../../global.css";

import { getProfile } from "../../../database/repositories/profileRepository";
import {
  addTransferFile,
  createTransfer,
} from "../../../database/repositories/transferRepository";
import {
  createExpiry,
  generateSessionId,
} from "../../../utils/transferSession";

import { useDarkMode } from "../../../hooks/useToggleTheme";

const AVATARS = {
  avatar1: require("../../../assets/images/avatars/angry-face.png"),
  avatar2: require("../../../assets/images/avatars/happy-face.png"),
  avatar3: require("../../../assets/images/avatars/hello.png"),
  avatar4: require("../../../assets/images/avatars/kitten.png"),
  avatar5: require("../../../assets/images/avatars/monkey.png"),
  avatar6: require("../../../assets/images/avatars/panda.png"),
};

type SelectedFile = {
  uri: string;
  name: string;
  size: number;
  mimeType?: string;
};

export default function SendSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    files?: string;
  }>();

  const { isDark } = useDarkMode();

  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");
  const [qrValue, setQrValue] = useState("");

  const [expiresAt, setExpiresAt] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(600);

  const [receiverName, setReceiverName] = useState<string | null>(null);
  const [receiverAvatarId, setReceiverAvatarId] = useState<string | null>(
    null,
  );

  const files = useMemo<SelectedFile[]>(() => {
    if (!params.files) {
      return [];
    }

    try {
      const parsed = JSON.parse(params.files);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed;
    } catch {
      return [];
    }
  }, [params.files]);

  const receiverAvatar = useMemo(() => {
    if (!receiverAvatarId) {
      return AVATARS.avatar3;
    }

    return (
      AVATARS[receiverAvatarId as keyof typeof AVATARS] ?? AVATARS.avatar3
    );
  }, [receiverAvatarId]);

  useEffect(() => {
    let mounted = true;

    async function prepareSession() {
      try {
        const profile = await getProfile();

        if (!profile) {
          Alert.alert(
            "Profile required",
            "Please create your ShareNami profile before sending files.",
            [
              {
                text: "OK",
                onPress: () => router.replace("/profile"),
              },
            ],
          );

          return;
        }

        if (files.length === 0) {
          Alert.alert(
            "No files selected",
            "Please select at least one file before starting a transfer.",
            [
              {
                text: "OK",
                onPress: () => router.back(),
              },
            ],
          );

          return;
        }

        const newSessionId = generateSessionId();
        const newExpiresAt = createExpiry(10);

        await createTransfer({
          sessionId: newSessionId,
          deviceId: profile.device_id,
          status: "waiting",
          createdAt: new Date().toISOString(),
          expiresAt: newExpiresAt,
        });

        for (const file of files) {
          await addTransferFile({
            sessionId: newSessionId,
            fileUri: file.uri,
            fileName: file.name,
            fileSize: file.size ?? 0,
            mimeType: file.mimeType,
          });
        }

        const payload = {
          app: "ShareNami",
          version: 1,
          type: "transfer",
          sessionId: newSessionId,
          deviceId: profile.device_id,
          displayName: profile.display_name,
          avatarId: profile.avatar_id,
          expiresAt: newExpiresAt,
        };

        if (!mounted) {
          return;
        }

        setSessionId(newSessionId);
        setExpiresAt(newExpiresAt);
        setQrValue(JSON.stringify(payload));
      } catch (error) {
        console.error("Failed to create transfer session:", error);

        Alert.alert(
          "Transfer error",
          "We could not create the transfer session. Please try again.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ],
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    prepareSession();

    return () => {
      mounted = false;
    };
  }, [files, router]);

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const updateCountdown = () => {
      const expires = new Date(expiresAt).getTime();
      const seconds = Math.max(
        0,
        Math.floor((expires - Date.now()) / 1000),
      );

      setRemainingSeconds(seconds);

      if (seconds === 0) {
        Alert.alert(
          "Session expired",
          "This transfer session has expired. Please start a new transfer.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ],
        );
      }
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, router]);

  /*
   * Receiver identity will be supplied here once the local-network
   * handshake is implemented.
   *
   * Expected handshake:
   *
   * {
   *   type: "receiver_identity",
   *   sessionId: "...",
   *   displayName: "Thabo",
   *   avatarId: "avatar4"
   * }
   *
   * Then:
   *
   * setReceiverName(payload.displayName);
   * setReceiverAvatarId(payload.avatarId);
   */

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const handleCancel = () => {
    Alert.alert(
      "Cancel transfer?",
      "The current transfer session will be cancelled.",
      [
        {
          text: "Keep waiting",
          style: "cancel",
        },
        {
          text: "Cancel transfer",
          style: "destructive",
          onPress: () => router.back(),
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1 }}
        className="bg-background dark:bg-background-dark"
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={isDark ? "#06d6a0" : "#073b4c"}
          />

          <Text className="font-dm-medium text-[14px] text-primary/60 dark:text-primary-dark/60 mt-4">
            Preparing transfer...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="bg-background dark:bg-background-dark"
    >
      <View className="flex-1 px-5">
        {/* Header */}
        <View className="flex-row items-center pt-3 pb-4">
          <Pressable
            onPress={handleCancel}
            className="w-10 h-10 rounded-full items-center justify-center bg-primary/5 dark:bg-primary-dark/5"
          >
            <Ionicons
              name="close"
              size={23}
              color={isDark ? "#ffffff" : "#073b4c"}
            />
          </Pressable>

          <View className="flex-1 ml-3">
            <Text className="font-dm-bold text-[20px] text-primary dark:text-primary-dark">
              Send Files
            </Text>

            <Text className="font-dm-regular text-[12px] text-primary/50 dark:text-primary-dark/50 mt-0.5">
              Scan this QR code from another device
            </Text>
          </View>
        </View>

        {/* QR section */}
        <View className="flex-1 items-center justify-center">
          <View className="items-center">
            <View className="w-[250px] h-[250px] rounded-[28px] bg-white items-center justify-center shadow-sm">
              {qrValue ? (
                <QRCode
                  value={qrValue}
                  size={205}
                  backgroundColor="#ffffff"
                  color="#073b4c"
                />
              ) : (
                <ActivityIndicator
                  size="large"
                  color="#06d6a0"
                />
              )}
            </View>

            <Text className="font-dm-semibold text-[15px] text-primary dark:text-primary-dark mt-6">
              Scan to connect
            </Text>

            <Text className="font-dm-regular text-[13px] text-primary/50 dark:text-primary-dark/50 text-center mt-1 px-8">
              Ask the receiver to scan this QR code with ShareNami.
            </Text>
          </View>

          {/* Recipient */}
          <View className="w-full flex-row items-center mt-8">
            <View className="w-11 h-11 rounded-full bg-accent/15 items-center justify-center overflow-hidden">
              {receiverName ? (
                <Image
                  source={receiverAvatar}
                  className="w-11 h-11"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name="person-add-outline"
                  size={21}
                  color="#06d6a0"
                />
              )}
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-dm-medium text-[11px] text-primary/45 dark:text-primary-dark/45">
                RECIPIENT
              </Text>

              {receiverName ? (
                <>
                  <Text className="font-dm-semibold text-[14px] text-primary dark:text-primary-dark mt-0.5">
                    {receiverName}
                  </Text>

                  <Text className="font-dm-regular text-[12px] text-accent mt-0.5">
                    Connected · ready to receive
                  </Text>
                </>
              ) : (
                <Text className="font-dm-semibold text-[14px] text-primary/50 dark:text-primary-dark/50 mt-0.5">
                  Waiting for receiver...
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Bottom session info */}
        <View className="pb-5">
          <View className="rounded-2xl bg-primary/[0.04] dark:bg-primary-dark/[0.05] px-4 py-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-9 h-9 rounded-full bg-accent/15 items-center justify-center">
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color="#06d6a0"
                  />
                </View>

                <View className="ml-3">
                  <Text className="font-dm-medium text-[11px] text-primary/45 dark:text-primary-dark/45">
                    SESSION EXPIRES
                  </Text>

                  <Text className="font-dm-semibold text-[14px] text-primary dark:text-primary-dark mt-0.5">
                    {formattedTime}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="font-dm-medium text-[10px] text-primary/40 dark:text-primary-dark/40">
                  SESSION
                </Text>

                <Text className="font-dm-medium text-[10px] text-primary/60 dark:text-primary-dark/60 mt-0.5">
                  {sessionId || "Creating..."}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-center mt-4">
            <View className="w-2 h-2 rounded-full bg-accent mr-2" />

            <Text className="font-dm-regular text-[11px] text-primary/45 dark:text-primary-dark/45">
              Your files stay on this device until connected
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

