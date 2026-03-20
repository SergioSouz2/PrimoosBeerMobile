import { useTheme } from "@/hook/useTheme";
import { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
};

export function ScreenContainer({ children }: Props) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 24,
      }}
      edges={['top', 'left', 'right']}
    >
      {children}
    </SafeAreaView>
  );
}