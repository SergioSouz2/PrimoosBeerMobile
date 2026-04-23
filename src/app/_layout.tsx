import { AuthProvider } from "@/context/AuthContext";
import { CarrinhoProvider } from "@/context/CarrinhoContext";
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
        <CarrinhoProvider>

          <StatusBar style={scheme === "dark" ? "light" : "dark"} />
          <Stack screenOptions={{ headerShown: false }} />
        </CarrinhoProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}