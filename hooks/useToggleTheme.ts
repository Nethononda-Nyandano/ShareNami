import { useColorScheme } from "react-native";

export function useDarkMode() {
  const colorScheme = useColorScheme();

  const activeScheme = colorScheme === "dark" ? "dark" : "light";

  return {
    colorScheme: activeScheme,
    isDark: activeScheme === "dark",
  };
}
