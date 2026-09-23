import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";

import { useDarkMode } from "../../../hooks/useToggleTheme";
import {
  getProfile,
  type Profile,
} from "../../../database/repositories/profileRepository";

type SelectedFile = {
  uri: string;
  name: string;
  size: number;
  mimeType?: string;
};

const AVATARS = {
  avatar1: require("@/assets/images/avatars/angry-face.png"),
  avatar2: require("@/assets/images/avatars/happy-face.png"),
  avatar3: require("@/assets/images/avatars/hello.png"),
  avatar4: require("@/assets/images/avatars/kitten.png"),
  avatar5: require("@/assets/images/avatars/monkey.png"),
  avatar6: require("@/assets/images/avatars/panda.png"),
};

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes <= 0) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const getFileIcon = (mimeType?: string): keyof typeof Ionicons.glyphMap => {
  if (!mimeType) {
    return "document-outline";
  }

  if (mimeType.startsWith("image/")) {
    return "image-outline";
  }

  if (mimeType.startsWith("video/")) {
    return "videocam-outline";
  }

  if (mimeType.startsWith("audio/")) {
    return "musical-notes-outline";
  }

  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("text")
  ) {
    return "document-text-outline";
  }

  if (
    mimeType.includes("zip") ||
    mimeType.includes("compressed") ||
    mimeType.includes("rar")
  ) {
    return "archive-outline";
  }

  return "document-outline";
};

const getFileTypeLabel = (mimeType?: string) => {
  if (!mimeType) {
    return "File";
  }

  if (mimeType.startsWith("image/")) {
    return "Image";
  }

  if (mimeType.startsWith("video/")) {
    return "Video";
  }

  if (mimeType.startsWith("audio/")) {
    return "Audio";
  }

  if (mimeType.includes("pdf")) {
    return "PDF";
  }

  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return "Spreadsheet";
  }

  if (mimeType.includes("word") || mimeType.includes("document")) {
    return "Document";
  }

  if (mimeType.includes("zip") || mimeType.includes("compressed")) {
    return "Archive";
  }

  return "File";
};

const SendScreen = () => {
  const router = useRouter();
  const { isDark } = useDarkMode();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isPicking, setIsPicking] = useState(false);

  const onAccentColor = isDark ? "#061b3a" : "#ffffff";

  // --------------------------------------------------
  // Load profile from SQLite
  // --------------------------------------------------
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedProfile = await getProfile();

        setProfile(savedProfile);
      } catch (error) {
        console.error("Failed to load ShareNami profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  // --------------------------------------------------
  // Get correct avatar from saved avatar_id
  // --------------------------------------------------
  const avatarSource = useMemo(() => {
    if (!profile?.avatar_id) {
      return AVATARS.avatar3;
    }

    return (
      AVATARS[profile.avatar_id as keyof typeof AVATARS] ?? AVATARS.avatar3
    );
  }, [profile?.avatar_id]);

  // --------------------------------------------------
  // Calculate total selected file size
  // --------------------------------------------------
  const totalSize = useMemo(() => {
    return files.reduce((total, file) => total + (file.size || 0), 0);
  }, [files]);

  // --------------------------------------------------
  // Select files
  // --------------------------------------------------
  const pickFiles = async () => {
    try {
      setIsPicking(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const selectedFiles: SelectedFile[] = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name,
        size: asset.size ?? 0,
        mimeType: asset.mimeType,
      }));

      setFiles((currentFiles) => {
        const existingUris = new Set(currentFiles.map((file) => file.uri));

        const newFiles = selectedFiles.filter(
          (file) => !existingUris.has(file.uri),
        );

        return [...currentFiles, ...newFiles];
      });
    } catch (error) {
      console.error("Failed to select files:", error);

      Alert.alert(
        "Unable to select files",
        "Something went wrong while selecting your files. Please try again.",
      );
    } finally {
      setIsPicking(false);
    }
  };

  // --------------------------------------------------
  // Remove individual file
  // --------------------------------------------------
  const removeFile = (uri: string) => {
    setFiles((currentFiles) => currentFiles.filter((file) => file.uri !== uri));
  };

  // --------------------------------------------------
  // Clear all files
  // --------------------------------------------------
  const clearFiles = () => {
    setFiles([]);
  };

  // --------------------------------------------------
  // Continue to sharing session
  // --------------------------------------------------
 
const handleContinue = () => {
  if (files.length === 0) {
    Alert.alert(
      "No files selected",
      "Please select at least one file before continuing.",
    );

    return;
  }

  router.push({
    pathname: "/(send)/session",
    params: {
      files: JSON.stringify(files),
    },
  });
};



  // --------------------------------------------------
  // File item
  // --------------------------------------------------
 
const renderFile = ({ item }: { item: SelectedFile }) => {
  const icon = getFileIcon(item.mimeType);
  const typeLabel = getFileTypeLabel(item.mimeType);
  const isImage = item.mimeType?.startsWith("image/");

  return (
    <View className="flex-row items-center rounded-2xl px-3 py-3 mb-3 bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10">
      {/* File Preview */}
      <View className="w-14 h-14 rounded-xl overflow-hidden mr-3 bg-accent/15 items-center justify-center">
        {isImage ? (
          <Image
            source={{ uri: item.uri }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Ionicons name={icon} size={26} color="#06d6a0" />
        )}
      </View>

      {/* File Information */}
      <View className="flex-1 mr-2">
        <Text
          numberOfLines={1}
          className="font-dm-semibold text-[14px] text-primary dark:text-primary-dark"
        >
          {item.name}
        </Text>

        <Text className="font-dm-regular text-[12px] text-primary/45 dark:text-primary-dark/45 mt-1">
          {typeLabel} • {formatFileSize(item.size)}
        </Text>
      </View>

      {/* Remove */}
      <Pressable
        onPress={() => removeFile(item.uri)}
        hitSlop={10}
        className="w-9 h-9 rounded-full items-center justify-center"
      >
        <Ionicons
          name="close-circle"
          size={22}
          color={isDark ? "#d9e6ec" : "#78716c"}
        />
      </Pressable>
    </View>
  );
};



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
        {/* --------------------------------------- */}
        {/* HEADER */}
        {/* --------------------------------------- */}

        <View className="flex-row items-center justify-between px-6 pt-2 pb-4">
          {/* Back */}
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="w-10 h-10 rounded-full items-center justify-center bg-primary/5 dark:bg-white/5"
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={isDark ? "#ffffff" : "#073b4c"}
            />
          </Pressable>

          {/* Logo */}
          <View className="items-center">
            <Text className="font-dm-semibold text-xl text-primary dark:text-accent">
              {profile?.display_name}
            </Text>

            
          </View>

          {/* Profile Avatar */}
          <View className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent">
            {profileLoading ? (
              <View className="flex-1 items-center justify-center bg-primary/5 dark:bg-white/5">
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

        {/* --------------------------------------- */}
        {/* CONTENT */}
        {/* --------------------------------------- */}

        <View className="flex-1 px-6">
          {/* Title */}
          <View className="mt-3 mb-6">
            <Text className="font-dm-bold text-[28px] text-primary dark:text-primary-dark">
              Send Files
            </Text>

            <Text className="font-dm-regular text-[14px] leading-[21px] text-primary/50 dark:text-primary-dark/50 mt-2">
              Select the photos, videos or files you want to share.
            </Text>
          </View>

          {/* ------------------------------------- */}
          {/* SELECT FILES */}
          {/* ------------------------------------- */}

          <Pressable
            onPress={pickFiles}
            disabled={isPicking}
            className="rounded-3xl border-2 border-dashed border-accent/40 bg-accent/5 dark:bg-accent/10 items-center justify-center py-8 px-6"
          >
            <View className="w-16 h-16 rounded-2xl bg-accent/15 items-center justify-center mb-4">
              {isPicking ? (
                <ActivityIndicator size="small" color="#06d6a0" />
              ) : (
                <Ionicons
                  name="cloud-upload-outline"
                  size={32}
                  color="#06d6a0"
                />
              )}
            </View>

            <Text className="font-dm-bold text-[17px] text-primary dark:text-primary-dark">
              {isPicking ? "Selecting files..." : "Choose files"}
            </Text>

            <Text className="font-dm-regular text-[13px] text-primary/45 dark:text-primary-dark/45 mt-2 text-center">
              Select one or multiple files from your device
            </Text>
          </Pressable>

          {/* ------------------------------------- */}
          {/* SELECTED FILES HEADER */}
          {/* ------------------------------------- */}

          {files.length > 0 && (
            <View className="flex-row items-center justify-between mt-7 mb-4">
              <View>
                <Text className="font-dm-bold text-[18px] text-primary dark:text-primary-dark">
                  Selected Files
                </Text>

                <Text className="font-dm-regular text-[12px] text-primary/45 dark:text-primary-dark/45 mt-1">
                  {files.length} {files.length === 1 ? "file" : "files"} •{" "}
                  {formatFileSize(totalSize)}
                </Text>
              </View>

              <Pressable onPress={clearFiles} hitSlop={8}>
                <Text className="font-dm-medium text-[13px] text-accent">
                  Clear all
                </Text>
              </Pressable>
            </View>
          )}

          {/* ------------------------------------- */}
          {/* FILE LIST */}
          {/* ------------------------------------- */}

          <FlatList
            data={files}
            keyExtractor={(item) => item.uri}
            renderItem={renderFile}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 20,
            }}
            ListEmptyComponent={
              <View className="items-center justify-center py-8">
                <View className="w-14 h-14 rounded-full bg-primary/5 dark:bg-white/5 items-center justify-center mb-3">
                  <Ionicons
                    name="documents-outline"
                    size={25}
                    color="#06d6a0"
                  />
                </View>

                <Text className="font-dm-medium text-[14px] text-primary/50 dark:text-primary-dark/50">
                  No files selected
                </Text>

                <Text className="font-dm-regular text-[12px] text-primary/35 dark:text-primary-dark/35 mt-1 text-center">
                  Your selected files will appear here.
                </Text>
              </View>
            }
          />

          {/* ------------------------------------- */}
          {/* CONTINUE */}
          {/* ------------------------------------- */}

          <View className="pb-5 pt-2">
            <Pressable
              onPress={handleContinue}
              disabled={files.length === 0}
              className={`flex-row items-center justify-center w-full h-14 rounded-2xl ${
                files.length > 0
                  ? "bg-accent"
                  : "bg-primary/10 dark:bg-white/10"
              }`}
            >
              <Text
                className={`font-dm-bold text-sm ${
                  files.length > 0
                    ? "text-on-accent"
                    : "text-primary/30 dark:text-primary-dark/30"
                }`}
              >
                Continue
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color={
                  files.length > 0
                    ? "#ffffff"
                    : isDark
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(7,59,76,0.3)"
                }
                style={{
                  marginLeft: 7,
                }}
              />
            </Pressable>

            <Text className="font-dm-regular text-[11px] text-primary/35 dark:text-primary-dark/35 text-center mt-3">
              Files stay on your device until you connect with a receiver.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SendScreen;
