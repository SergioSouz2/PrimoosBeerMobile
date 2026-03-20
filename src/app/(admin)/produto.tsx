import { Button } from "@/components/Button/Button";
import { Header } from "@/components/Header";
import { ListaProdutos } from "@/components/ListaProdutos";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useTheme } from "@/hook/useTheme";
import { View } from "react-native";

const Produto = () => {
  const { colors } = useTheme();

  return <ScreenContainer>
    <View >
      <Header title="Produtos" description="Gerencie os produtos" />
      <Button color={colors.buttonText} backgroundColor={colors.primary} preset="adicionar" />
    </View>

    <View style={{ marginTop: 16 }}>
      <ListaProdutos />
    </View>
  </ScreenContainer>;
}


export default Produto;