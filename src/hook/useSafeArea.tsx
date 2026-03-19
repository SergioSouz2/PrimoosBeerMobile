import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useSafeArea() {
  const insets = useSafeAreaInsets();

  return {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingHorizontal: 16, // padrão seu app
  };
}