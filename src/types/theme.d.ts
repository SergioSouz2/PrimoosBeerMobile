import { DefaultTheme } from "@react-navigation/native";

export type AppThemeColors = Omit<
  typeof DefaultTheme.colors,
  "notification" | "card" | "text"
> & {
  secondary: string;
  accent: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textLight: string;
  inputBackground: string;
  button: string;
  buttonText: string;
  error: string;
  success: string;
};

declare global {
  namespace ReactNavigation {
    interface Theme {
      colors: AppThemeColors & Pick<typeof DefaultTheme.colors, "notification" | "card" | "text">;
    }
  }
}
