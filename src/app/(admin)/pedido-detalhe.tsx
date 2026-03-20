import { Button } from "@/components/Button/Button";
import { GoBack } from "@/components/GoBack";
import { PEDIDOS_MOCK } from "@/components/ListaPedidos";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useTheme } from "@/hook/useTheme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

export default function DetalhePedido() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const router = useRouter();


  // Busca os dados do pedido específico
  const pedido = PEDIDOS_MOCK.find((p) => p.id === id);


  function handleGoBack() {
    router.push("/(admin)/pedido");
  }

  if (!pedido) {
    return (
      <View style={styles.center}>
        <Text>Pedido não encontrado</Text>
        <GoBack onPress={handleGoBack} />
      </View>
    );
  }

  return (
    <ScreenContainer >
      {/* Header com Botão de Voltar */}
      <View style={styles.header}>
        <GoBack onPress={handleGoBack} />
        <View style={{ flex: 1 }}> {/* Adicionei flex: 1 para ajudar no alinhamento */}
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {`Pedido ${pedido.numeroPedido}`}
          </Text>

        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Lista de Produtos do Pedido */}
      <FlatList
        data={pedido.itens}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.productCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={[styles.productName, { color: colors.text }]}>{item.nome}</Text>
              <Text style={styles.productQty}>{item.quantidade}x unidades</Text>
            </View>
            <Text style={[styles.productPrice, { color: colors.text }]}>
              R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
            </Text>
          </View>
        )}

      />

      {/* Botão de Gerar Comprovante fixo no rodapé */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total do Pedido</Text>
          <Text style={[styles.totalValue, { color: colors.primary || '#000' }]}>
            R$ {pedido.total.toFixed(2).replace('.', ',')}
          </Text>
        </View>
        <Button
          backgroundColor={colors.primary}
          preset="comprovante" // Ou um preset específico que você criou
          onPress={() => console.log("Gerando PDF...")}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({

  headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  headerSubtitle: { fontSize: 12, color: '#666', textAlign: 'center' },
  listContent: { marginTop: 16 },
  productCard: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  productImage: { width: 50, height: 50, borderRadius: 8 },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontWeight: 'bold', fontSize: 14 },
  productQty: { fontSize: 12, color: '#666' },
  productPrice: { fontWeight: 'bold' },
  totalContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalValue: { fontSize: 22, fontWeight: 'bold' },
  footer: {
    paddingBottom: 40,
  },
  header: {

  },
  center: {

  }
});