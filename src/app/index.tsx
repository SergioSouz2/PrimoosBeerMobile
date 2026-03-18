import { useTheme } from "@/hook/useTheme";
import { Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 22,
        }}
      >
        PRIMOOS 🍻
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: colors.button,
          padding: 14,
          borderRadius: 12,
          marginTop: 20,
        }}
      >
        <Text style={{ color: colors.buttonText }}>
          Fazer pedido
        </Text>
      </TouchableOpacity>
    </View>
  );
}