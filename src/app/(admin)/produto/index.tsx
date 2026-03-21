import { Button } from "@/components/Button/Button";
import { Header } from "@/components/Header";
import { ListaProdutos } from "@/components/ListaProdutos";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useProdutos } from "@/hook/useProdutos";
import { useTheme } from "@/hook/useTheme";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";

const Produto = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { produtos, loading, recarregar } = useProdutos();

  // Recarrega toda vez que a tela receber foco
  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [])
  );

  function handleNovoProduto() {
    router.push('/(admin)/produto/novoProduto');
  }

  return (
    <ScreenContainer>
      <View>
        <Header title="Produtos" description="Gerencie os produtos" />
        <Button color={colors.buttonText} backgroundColor={colors.primary} preset="adicionar" onPress={handleNovoProduto} />
      </View>
      <View style={{ marginTop: 16 }}>
        <ListaProdutos produtos={produtos} loading={loading} />
      </View>
    </ScreenContainer>
  );
};

export default Produto;