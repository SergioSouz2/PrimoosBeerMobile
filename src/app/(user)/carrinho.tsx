import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { useCarrinho } from "@/context/CarrinhoContext";
import { useTheme } from "@/hook/useTheme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Carrinho() {
  const { colors } = useTheme();
  const { items, total, incrementar, decrementar, remover, limpar } = useCarrinho();
  const { user } = useAuth();
  const router = useRouter();
  const [finalizando, setFinalizando] = useState(false);

  async function handleFinalizar() {
    if (items.length === 0) return;

    Alert.alert(
      "Confirmar pedido",
      `Total: R$ ${total.toFixed(2).replace(".", ",")}\n\nDeseja finalizar o pedido?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            setFinalizando(true);

            // Cria o pedido
            const { data: pedido, error: pedidoError } = await supabase
              .from("pedidos")
              .insert({ user_id: user?.id, status: "preparando", total })
              .select("id")
              .single();

            if (pedidoError || !pedido) {
              Alert.alert("Erro", "Não foi possível criar o pedido.");
              setFinalizando(false);
              return;
            }

            // Cria os itens do pedido
            const itens = items.map((item) => ({
              pedido_id: pedido.id,
              produto_id: item.produto_id,
              quantidade: item.quantidade,
              preco_unitario: item.preco,
            }));

            const { error: itensError } = await supabase
              .from("pedido_itens")
              .insert(itens);

            if (itensError) {
              Alert.alert("Erro", "Não foi possível salvar os itens do pedido.");
              setFinalizando(false);
              return;
            }

            // Atualiza o estoque de cada produto
            for (const item of items) {
              await supabase.rpc("decrementar_estoque", {
                p_produto_id: item.produto_id,
                p_quantidade: item.quantidade,
              });
            }

            limpar();
            setFinalizando(false);

            Alert.alert(
              "Pedido realizado!",
              `Seu pedido #${pedido.id.slice(0, 8).toUpperCase()} foi enviado com sucesso.`,
              [{ text: "Ok", onPress: () => router.replace("/(user)/inicio") }]
            );
          },
        },
      ]
    );
  }

  const s = styles(colors);

  if (items.length === 0) {
    return (
      <ScreenContainer>
        <Text style={s.pageTitle}>Carrinho</Text>
        <View style={s.emptyContainer}>
          <Ionicons name="cart-outline" size={72} color={colors.textSecondary} />
          <Text style={[s.emptyTitle, { color: colors.textPrimary }]}>Carrinho vazio</Text>
          <Text style={[s.emptyText, { color: colors.textSecondary }]}>
            Adicione produtos para continuar
          </Text>
          <TouchableOpacity
            style={[s.btnVerProdutos, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(user)/produto")}
          >
            <Text style={s.btnVerProdutosText}>Ver produtos</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={s.headerRow}>
        <Text style={s.pageTitle}>Carrinho</Text>
        <TouchableOpacity onPress={() => Alert.alert("Limpar carrinho", "Remover todos os itens?", [
          { text: "Cancelar", style: "cancel" },
          { text: "Limpar", style: "destructive", onPress: limpar },
        ])}>
          <Text style={[s.limparText, { color: colors.error }]}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.produto_id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={[s.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {item.foto ? (
              <Image source={{ uri: item.foto }} style={s.itemFoto} />
            ) : (
              <View style={[s.itemFotoPlaceholder, { backgroundColor: colors.inputBackground }]}>
                <Ionicons name="beer-outline" size={24} color={colors.textSecondary} />
              </View>
            )}

            <View style={s.itemInfo}>
              <Text style={[s.itemNome, { color: colors.textPrimary }]} numberOfLines={2}>
                {item.nome}
              </Text>
              <Text style={[s.itemPreco, { color: colors.primary }]}>
                R$ {(item.preco * item.quantidade).toFixed(2).replace(".", ",")}
              </Text>
            </View>

            <View style={s.itemControles}>
              <TouchableOpacity
                style={[s.ctrlBtn, { borderColor: colors.border }]}
                onPress={() => decrementar(item.produto_id)}
              >
                <Ionicons name={item.quantidade === 1 ? "trash-outline" : "remove"} size={16} color={item.quantidade === 1 ? colors.error : colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[s.ctrlQty, { color: colors.textPrimary }]}>{item.quantidade}</Text>
              <TouchableOpacity
                style={[s.ctrlBtn, { borderColor: colors.border }]}
                onPress={() => incrementar(item.produto_id)}
              >
                <Ionicons name="add" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Footer com total e botão */}
      <View style={[s.footer, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <View style={s.totalRow}>
          <Text style={[s.totalLabel, { color: colors.textSecondary }]}>
            {items.reduce((s, i) => s + i.quantidade, 0)} itens
          </Text>
          <Text style={[s.totalVal, { color: colors.primary }]}>
            R$ {total.toFixed(2).replace(".", ",")}
          </Text>
        </View>
        <TouchableOpacity
          style={[s.btnFinalizar, { backgroundColor: colors.primary }]}
          onPress={handleFinalizar}
          disabled={finalizando}
        >
          {finalizando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={s.btnFinalizarText}>Finalizar pedido</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    pageTitle: { fontSize: 24, fontWeight: "800", color: colors.textPrimary },
    limparText: { fontSize: 14, fontWeight: "600" },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
    emptyTitle: { fontSize: 20, fontWeight: "800", marginTop: 8 },
    emptyText: { fontSize: 14, textAlign: "center" },
    btnVerProdutos: { marginTop: 16, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
    btnVerProdutosText: { color: "#fff", fontSize: 15, fontWeight: "700" },
    itemCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 12, gap: 12 },
    itemFoto: { width: 64, height: 64, borderRadius: 10, resizeMode: "cover" },
    itemFotoPlaceholder: { width: 64, height: 64, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    itemInfo: { flex: 1, gap: 4 },
    itemNome: { fontSize: 14, fontWeight: "600", lineHeight: 18 },
    itemPreco: { fontSize: 16, fontWeight: "800" },
    itemControles: { flexDirection: "row", alignItems: "center", gap: 8 },
    ctrlBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: "center", justifyContent: "center" },
    ctrlQty: { fontSize: 16, fontWeight: "700", minWidth: 24, textAlign: "center" },
    footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, borderTopWidth: 1, gap: 12 },
    totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    totalLabel: { fontSize: 14 },
    totalVal: { fontSize: 24, fontWeight: "800" },
    btnFinalizar: { height: 52, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    btnFinalizarText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  });