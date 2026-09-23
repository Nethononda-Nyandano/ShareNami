import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  FlatList,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDarkMode } from "../../hooks/useToggleTheme";

const { width } = Dimensions.get("window");

type Slide = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

export const SLIDES: Slide[] = [
  {
    key: "share",
    icon: "folder-open",
    title: "Share",
    description:
      "Pick the photos, videos or files you want to send. Nothing leaves your phone until a receiver connects.",
  },
  {
    key: "scan",
    icon: "qr-code",
    title: "Scan",
    description:
      "ShareNami generates a QR code for a temporary session. The receiver scans it to connect,no internet required.",
  },
  {
    key: "send",
    icon: "paper-plane",
    title: "Send",
    description:
      "Files transfer directly between the two devices over your local network. Fast, private, and offline.",
  },
];

export default function GetStartedScreen() {
  const router = useRouter();
  const { isDark } = useDarkMode();
  const listRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onAccentColor = isDark ? "#061b3a" : "#ffffff";

  const isLastSlide = activeIndex === SLIDES.length - 1;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== activeIndex) setActiveIndex(index);
  };

  const goToOnboardingEnd = () => {
    router.replace("/profile");
  };

  const handleNext = () => {
    if (isLastSlide) {
      goToOnboardingEnd();
      return;
    }
    listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={{ width }} className="items-center justify-center px-9">
      <View className="w-32 h-32 rounded-full items-center justify-center mb-8 bg-accent/20">
        <Ionicons
          name={item.icon}
          size={56}
          className="text-accent dark:text-accent-dark"
          color="#06d6a0"
        />
      </View>
      <Text className="font-dm-bold text-[26px] text-primary dark:text-primary-dark mb-3">
        {item.title}
      </Text>
      <Text className="font-dm-regular text-[15px] leading-[22px] text-primary/60 dark:text-primary-dark/60 text-center">
        {item.description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1 }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={onAccentColor}
      />
      <View className="bg-background dark:bg-background-dark flex-1">
        <View className="flex-row items-center justify-between px-6 pt-2 pb-1">
          <View className="items-center">
            {isDark ? (
              <Image
                source={require("@/assets/images/logo/logoDark.png")}
                className="object-contain w-16 h-14 "
              />
            ) : (
              <Image
                source={require("@/assets/images/logo/logo.png")}
                className="object-contain w-16 h-14"
              />
            )}
            <Text className="font-dm-extrabold text-xl text-primary dark:text-primary-dark">
              <Text className="border-b-2 border-on-accent dark:border-on-accent-dark">
                Share
              </Text>
              <Text className="text-accent dark:text-accent-dark">Nami</Text>
            </Text>
          </View>

          {!isLastSlide && (
            <Pressable onPress={goToOnboardingEnd} hitSlop={12}>
              <Text className="font-dm-medium text-[15px] text-primary/50 dark:text-primary-dark/50">
                Skip
              </Text>
            </Pressable>
          )}
        </View>

        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(item) => item.key}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          bounces={false}
        />

        <View className="px-6 pb-4 items-center">
          <View className="flex-row items-center justify-center mb-6">
            {SLIDES.map((slide, index) => (
              <View
                key={slide.key}
                className={`h-2 rounded-full mx-1 ${
                  index === activeIndex
                    ? "w-[22px] bg-accent dark:bg-accent-dark"
                    : "w-2 bg-primary/15 dark:bg-primary-dark/15"
                }`}
              />
            ))}
          </View>

          <Pressable
            className="flex-row items-center justify-center w-full py-4 h-14 rounded-2xl bg-accent"
            onPress={handleNext}
          >
            <Text className="font-dm-bold text-sm text-on-accent ">
              {isLastSlide ? "Get Started" : "Next"}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={"white"}
              style={{ marginLeft: 6 }}
            />
          </Pressable>

          <Text className="font-dm-regular mt-3.5 text-xs text-primary/40 tracking-wider">
            Share. Scan. Send.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
