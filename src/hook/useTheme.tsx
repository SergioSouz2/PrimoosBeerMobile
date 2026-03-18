import { useTheme as useNavTheme } from "@react-navigation/native";

export function useTheme() {
  const theme = useNavTheme();
  return theme;
}