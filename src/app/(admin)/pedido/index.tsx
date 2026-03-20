import { Button } from "@/components/Button/Button";
import { Header } from "@/components/Header";
import { ListaPedidos } from "@/components/ListaPedidos";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useTheme } from "@/hook/useTheme";
import { useRouter } from "expo-router";
import { View } from "react-native";

const Pedido = () => {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <ScreenContainer>
      <View>
        <Header title="Pedidos" description="Gerencie os pedidos dos clientes" />
        <Button
          color={colors.buttonText}
          backgroundColor={colors.primary}
          preset="criar"
        />
      </View>
      <View style={{ marginTop: 16 }}>
        <ListaPedidos />
      </View>
    </ScreenContainer>
  );
};

export default Pedido;