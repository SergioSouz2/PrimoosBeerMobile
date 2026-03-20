import { ThemeProvider } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

import { DarkAppTheme, LightTheme } from "@/theme/theme";
import { useEffect } from "react";

export default function Layout() {
  const scheme = useColorScheme();


  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");

  }, []);


  return (
    <ThemeProvider value={scheme === "dark" ? DarkAppTheme : LightTheme}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ThemeProvider>
  );
}