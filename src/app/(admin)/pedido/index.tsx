import { Button } from "@/components/Button/Button";
import { Header } from "@/components/Header";
import { ListaPedidos } from "@/components/ListaPedidos";
import { ScreenContainer } from "@/components/ScreenContainer";
import { usePedidos } from "@/hook/usePedidos";
import { useTheme } from "@/hook/useTheme";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";

const Pedido = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { pedidos, loading, recarregar } = usePedidos();

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [])
  );


  

  return (
    <ScreenContainer>
      <View>
        <Header title="Pedidos" description="Gerencie os pedidos dos clientes" />
        <Button
          color={colors.buttonText}
          backgroundColor={colors.primary}
          preset="criar"
          onPress={() => router.push("/(admin)/pedido/novoPedido")}
        />
      </View>
      <View style={{ marginTop: 16 }}>
        <ListaPedidos pedidos={pedidos} loading={loading} />
      </View>
    </ScreenContainer>
  );
};

export default Pedido;