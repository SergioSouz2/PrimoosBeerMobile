import { ScreenContainer } from "@/components/ScreenContainer";
import { useCarrinho } from "@/context/CarrinhoContext";
import { useTheme } from "@/hook/useTheme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  foto: string | null;
}

export default function Produtos() {
  const { colors } = useTheme();
  const router = useRouter();
  const { adicionar, totalItens } = useCarrinho();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busca, setBusca] = useState("");

  async function carregarProdutos() {
    setLoading(true);
    const { data } = await supabase
      .from("produtos")
      .select("id, nome, preco, estoque, foto")
      .gt("estoque", 0)
      .order("nome", { ascending: true });
    setProdutos(data ?? []);
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    const { data } = await supabase
      .from("produtos")
      .select("id, nome, preco, estoque, foto")
      .gt("estoque", 0)
      .order("nome", { ascending: true });
    setProdutos(data ?? []);
    setRefreshing(false);
  }

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [])
  );

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const s = styles(colors);

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={s.headerRow}>
        <View>
          <Text style={s.pageTitle}>Produtos</Text>
          <Text style={[s.pageSub, { color: colors.textSecondary }]}>
            {produtos.length} itens disponíveis
          </Text>
        </View>
        <TouchableOpacity
          style={[s.carrinhoBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(user)/carrinho")}
        >
          <Ionicons name="cart-outline" size={22} color="#fff" />
          {totalItens > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{totalItens}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={[s.buscaContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={[s.buscaInput, { color: colors.textPrimary }]}
          placeholder="Buscar produto..."
          placeholderTextColor={colors.textSecondary}
          value={busca}
          onChangeText={setBusca}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca("")}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={produtosFiltrados}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="beer-outline" size={48} color={colors.textSecondary} />
              <Text style={[s.emptyText, { color: colors.textSecondary }]}>
                {busca ? "Nenhum produto encontrado" : "Nenhum produto disponível"}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push({ pathname: "/(user)/produto/[id]", params: { id: item.id } })}
              activeOpacity={0.85}
            >
              {item.foto ? (
                <Image source={{ uri: item.foto }} style={s.foto} />
              ) : (
                <View style={[s.fotoPlaceholder, { backgroundColor: colors.inputBackground }]}>
                  <Ionicons name="beer-outline" size={32} color={colors.textSecondary} />
                </View>
              )}
              <View style={s.cardInfo}>
                <Text style={[s.cardNome, { color: colors.textPrimary }]} numberOfLines={2}>
                  {item.nome}
                </Text>
                <Text style={[s.cardPreco, { color: colors.primary }]}>
                  R$ {item.preco.toFixed(2).replace(".", ",")}
                </Text>
                <TouchableOpacity
                  style={[s.btnAdicionar, { backgroundColor: colors.primary }]}
                  onPress={() => adicionar({ produto_id: item.id, nome: item.nome, preco: item.preco, foto: item.foto })}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
    pageTitle: { fontSize: 24, fontWeight: "800", color: colors.textPrimary },
    pageSub: { fontSize: 12, marginTop: 2 },
    carrinhoBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    badge: { position: "absolute", top: -4, right: -4, backgroundColor: colors.accent, borderRadius: 10, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
    badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
    buscaContainer: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 44, marginBottom: 4 },
    buscaInput: { flex: 1, fontSize: 14 },
    card: { flex: 1, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
    foto: { width: "100%", height: 130, resizeMode: "cover" },
    fotoPlaceholder: { width: "100%", height: 130, alignItems: "center", justifyContent: "center" },
    cardInfo: { padding: 10 },
    cardNome: { fontSize: 13, fontWeight: "600", marginBottom: 4, lineHeight: 18 },
    cardPreco: { fontSize: 16, fontWeight: "800", marginBottom: 8 },
    btnAdicionar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
    empty: { alignItems: "center", gap: 10, marginTop: 60 },
    emptyText: { fontSize: 14 },
  });