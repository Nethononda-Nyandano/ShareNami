
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useDarkMode } from "../../../hooks/useToggleTheme";

const ReceiveScreen = () => {
  const router = useRouter();
  const { isDark } = useDarkMode();

  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) return;

    if (
      !permission.granted &&
      permission.canAskAgain
    ) {
      requestPermission();
    }
  }, [permission]);

  const handleBack = () => {
    router.back();
  };

  const handleBarcodeScanned = ({
    data,
  }: {
    data: string;
  }) => {
    if (scanned) return;

    setScanned(true);

    try {
      const payload = JSON.parse(data);

      /*
       * Validate that this is a ShareNami
       * transfer QR code.
       */
      if (
        payload?.app !== "ShareNami" ||
        payload?.version !== 1 ||
        payload?.type !== "transfer" ||
        !payload?.sessionId ||
        !payload?.deviceId ||
        !payload?.displayName ||
        !payload?.avatarId ||
        !payload?.expiresAt
      ) {
        throw new Error(
          "Invalid ShareNami QR code",
        );
      }

      /*
       * Check session expiration.
       */
      const expiresAt = new Date(
        payload.expiresAt,
      ).getTime();

      if (
        Number.isNaN(expiresAt) ||
        expiresAt <= Date.now()
      ) {
        Alert.alert(
          "Session expired",
          "This ShareNami transfer session has expired. Ask the sender to create a new session.",
          [
            {
              text: "Scan Again",
              onPress: () => setScanned(false),
            },
          ],
        );

        return;
      }

      /*
       * Send the session information
       * to the receive confirmation screen.
       */
      router.push({
        pathname: "/(receive)/session",
        params: {
          sessionId: payload.sessionId,
          deviceId: payload.deviceId,
          displayName: payload.displayName,
          avatarId: payload.avatarId,
          expiresAt: payload.expiresAt,
        },
      });
    } catch (error) {
      console.error(
        "Invalid QR code:",
        error,
      );

      Alert.alert(
        "Invalid QR Code",
        "This doesn't appear to be a valid ShareNami transfer QR code.",
        [
          {
            text: "Scan Again",
            onPress: () => setScanned(false),
          },
        ],
      );
    }
  };

  const openSettings = async () => {
    await Linking.openSettings();
  };

  /*
   * Camera permission is still loading.
   */
  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" style={{flex:1}}>
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

        <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
          <Text className="font-dm-medium text-primary dark:text-primary-dark">
            Preparing camera...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * Camera permission denied.
   */
  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" style={{flex:1}}>
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

          {/* Permission */}
          <View className="flex-1 items-center justify-center">
            <View className="w-24 h-24 rounded-3xl bg-accent/15 items-center justify-center mb-6">
              <Ionicons
                name="camera-outline"
                size={46}
                color="#06d6a0"
              />
            </View>

            <Text className="font-dm-bold text-[24px] text-primary dark:text-primary-dark text-center">
              Camera access needed
            </Text>

            <Text className="font-dm-regular text-[14px] leading-[21px] text-primary/50 dark:text-primary-dark/50 text-center mt-3 max-w-[320px]">
              ShareNami needs access to your camera
              to scan the sender's transfer QR code.
            </Text>

            {permission.canAskAgain ? (
              <Pressable
                onPress={requestPermission}
                className="mt-7 px-7 py-4 rounded-2xl bg-accent active:opacity-80"
              >
                <Text className="font-dm-bold text-white">
                  Allow Camera
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={openSettings}
                className="mt-7 px-7 py-4 rounded-2xl bg-accent active:opacity-80"
              >
                <Text className="font-dm-bold text-white">
                  Open Settings
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * QR Scanner.
   */
  return (
    <SafeAreaView className="flex-1 " style={{flex:1}}>
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

      <View className="flex-1 bg-background dark:bg-background-dark">
        {/* Header */}
        <View className="flex-row items-center px-6 pt-3">
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

        {/* Instructions */}
        <View className="px-6 mt-7">
          <Text className="font-dm-bold text-[26px] text-primary dark:text-primary-dark text-center">
            Scan to receive
          </Text>

          <Text className="font-dm-regular text-[14px] leading-[21px] text-primary/50 dark:text-primary-dark/50 text-center mt-2">
            Scan the QR code displayed on the
            sender's device to connect and receive
            files.
          </Text>
        </View>

        {/* Camera */}
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-[340px] aspect-square rounded-[32px] overflow-hidden">
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
              onBarcodeScanned={
                scanned
                  ? undefined
                  : handleBarcodeScanned
              }
            />

            {/* Scanner overlay */}
            <View className="flex-1 items-center justify-center">
              <View className="w-[250px] h-[250px]">
                {/* Top left */}
                <View
                  className="absolute left-0 top-0 w-12 h-12"
                  style={{
                    borderLeftWidth: 4,
                    borderTopWidth: 4,
                    borderColor: "#06d6a0",
                    borderTopLeftRadius: 14,
                  }}
                />

                {/* Top right */}
                <View
                  className="absolute right-0 top-0 w-12 h-12"
                  style={{
                    borderRightWidth: 4,
                    borderTopWidth: 4,
                    borderColor: "#06d6a0",
                    borderTopRightRadius: 14,
                  }}
                />

                {/* Bottom left */}
                <View
                  className="absolute left-0 bottom-0 w-12 h-12"
                  style={{
                    borderLeftWidth: 4,
                    borderBottomWidth: 4,
                    borderColor: "#06d6a0",
                    borderBottomLeftRadius: 14,
                  }}
                />

                {/* Bottom right */}
                <View
                  className="absolute right-0 bottom-0 w-12 h-12"
                  style={{
                    borderRightWidth: 4,
                    borderBottomWidth: 4,
                    borderColor: "#06d6a0",
                    borderBottomRightRadius: 14,
                  }}
                />
              </View>
            </View>
          </View>

          {/* Scanner hint */}
          <View className="flex-row items-center mt-6">
            <Ionicons
              name="scan-outline"
              size={20}
              color="#06d6a0"
            />

            <Text className="font-dm-medium text-[14px] text-primary/60 dark:text-primary-dark/60 ml-2">
              Point your camera at the QR code
            </Text>
          </View>
        </View>

        {/* Security information */}
        <View className="px-6 pb-5">
          <View className="flex-row items-center justify-center">
            <View className="w-8 h-8 rounded-full bg-accent/15 items-center justify-center">
              <Ionicons
                name="shield-checkmark-outline"
                size={17}
                color="#06d6a0"
              />
            </View>

            <Text className="font-dm-regular text-[12px] text-primary/45 dark:text-primary-dark/45 ml-2">
              Transfers use temporary sharing sessions
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReceiveScreen;

