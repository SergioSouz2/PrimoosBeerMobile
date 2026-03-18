import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { darkColors, lightColors } from "./colors";

export const LightTheme: ReactNavigation.Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...lightColors,

    background: lightColors.background,
    card: lightColors.surface,
    text: lightColors.textPrimary,
    border: lightColors.border,
    primary: lightColors.primary,
  },
};

export const DarkAppTheme: ReactNavigation.Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    ...darkColors,

    background: darkColors.background,
    card: darkColors.surface,
    text: darkColors.textPrimary,
    border: darkColors.border,
    primary: darkColors.primary,
  },
};