
import { useEffect, useState } from "react";
import {
  Stack,
  usePathname,
  useRouter,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import {
  useFonts,
  DMSans_400Regular,
  DMSans_700Bold,
  DMSans_300Light,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_800ExtraBold,
} from "@expo-google-fonts/dm-sans";

import "../../global.css";

import { initializeDatabase } from "../../database/schema";
import { getProfile } from "../../database/repositories/profileRepository";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const [databaseReady, setDatabaseReady] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_700Bold,
    DMSans_300Light,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_800ExtraBold,
  });

  // -----------------------------------------
  // Initialize SQLite
  // -----------------------------------------
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeDatabase();

        setDatabaseReady(true);
      } catch (error) {
        console.error(
          "Failed to initialize ShareNami database:",
          error,
        );
      }
    };

    initializeApp();
  }, []);

  // -----------------------------------------
  // Check profile ONLY on initial route
  // -----------------------------------------
  useEffect(() => {
    if (!databaseReady) {
      return;
    }

    const checkProfile = async () => {
      try {
        const profile = await getProfile();

        console.log(
          "ShareNami profile:",
          profile,
        );

        console.log(
          "Current pathname:",
          pathname,
        );

        /*
         * IMPORTANT
         *
         * We ONLY perform the initial-user redirect
         * while the user is on "/".
         *
         * Once the user navigates to:
         *
         * /send
         * /(tabs)
         * /profile
         * etc.
         *
         * this code will NOT redirect them.
         */

        if (pathname === "/") {
          if (profile) {
            router.replace("/(tabs)");
          }
        }
      } catch (error) {
        console.error(
          "Failed to check ShareNami profile:",
          error,
        );
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfile();
  }, [databaseReady, pathname, router]);

  // -----------------------------------------
  // Hide splash screen
  // -----------------------------------------
  useEffect(() => {
    if (
      (loaded || error) &&
      databaseReady &&
      !checkingProfile
    ) {
      SplashScreen.hideAsync();
    }
  }, [
    loaded,
    error,
    databaseReady,
    checkingProfile,
  ]);

  // -----------------------------------------
  // Keep splash visible while loading
  // -----------------------------------------
  if (
    (!loaded && !error) ||
    !databaseReady ||
    checkingProfile
  ) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

