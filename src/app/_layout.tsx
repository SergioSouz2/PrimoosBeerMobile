import { AuthProvider } from "@/context/AuthContext";
import { DarkAppTheme, LightTheme } from "@/theme/theme";
import { ThemeProvider } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

export default function Layout() {
  const scheme = useColorScheme();

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={scheme === "dark" ? DarkAppTheme : LightTheme}>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </AuthProvider>
  );
}