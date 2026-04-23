import { GoBack } from "@/components/GoBack";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useTheme } from "@/hook/useTheme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
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

export default function ProdutoDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  // Campos editáveis
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");

  useEffect(() => {
    async function carregarProduto() {
      const { data, error } = await supabase
        .from("produtos")
        .select("id, nome, preco, estoque, foto")
        .eq("id", id)
        .single();

      if (error || !data) {
        Alert.alert("Erro", "Produto não encontrado.");
        router.back();
        return;
      }

      setProduto(data);
      setNome(data.nome);
      setPreco(data.preco.toString());
      setEstoque(data.estoque.toString());
      setLoading(false);
    }

    carregarProduto();
  }, [id]);

  async function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "O nome do produto é obrigatório.");
      return;
    }

    const precoNum = parseFloat(preco.replace(",", "."));
    const estoqueNum = parseInt(estoque);

    if (isNaN(precoNum) || precoNum < 0) {
      Alert.alert("Atenção", "Informe um preço válido.");
      return;
    }
    if (isNaN(estoqueNum) || estoqueNum < 0) {
      Alert.alert("Atenção", "Informe uma quantidade de estoque válida.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase
      .from("produtos")
      .update({ nome: nome.trim(), preco: precoNum, estoque: estoqueNum })
      .eq("id", id);

    setSalvando(false);

    if (error) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
      return;
    }

    setProduto((prev) => prev ? { ...prev, nome: nome.trim(), preco: precoNum, estoque: estoqueNum } : prev);
    setEditando(false);
  }

  async function handleExcluir() {
    Alert.alert(
      "Excluir produto",
      `Tem certeza que deseja excluir "${produto?.nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setExcluindo(true);
            const { error } = await supabase.from("produtos").delete().eq("id", id);
            setExcluindo(false);

            if (error) {
              Alert.alert("Erro", "Não foi possível excluir o produto.");
              return;
            }

            router.replace("/(admin)/produto");
          },
        },
      ]
    );
  }

  function handleCancelarEdicao() {
    if (!produto) return;
    setNome(produto.nome);
    setPreco(produto.preco.toString());
    setEstoque(produto.estoque.toString());
    setEditando(false);
  }

  const s = styles(colors);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!produto) return null;

  const estoqueStatus = produto.estoque === 0
    ? { label: "Sem estoque", color: colors.error }
    : produto.estoque <= 5
      ? { label: "Estoque baixo", color: colors.accent }
      : { label: "Em estoque", color: colors.success };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <View style={s.header}>
          <GoBack onPress={() => router.back()} />
          <Text style={[s.headerTitle, { color: colors.text }]}>
            {editando ? "Editar produto" : "Detalhes do produto"}
          </Text>
          <TouchableOpacity onPress={editando ? handleCancelarEdicao : () => setEditando(true)} style={s.editBtn}>
            <Ionicons
              name={editando ? "close-outline" : "create-outline"}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Banner com foto */}
        <View style={s.bannerContainer}>
          {produto.foto ? (
            <Image source={{ uri: produto.foto }} style={s.banner} />
          ) : (
            <View style={[s.bannerPlaceholder, { backgroundColor: colors.surface }]}>
              <Ionicons name="beer-outline" size={64} color={colors.textSecondary} />
            </View>
          )}

          {/* Badge de estoque sobre a foto */}
          <View style={[s.estoqueBadge, { backgroundColor: estoqueStatus.color }]}>
            <Text style={s.estoqueBadgeText}>{estoqueStatus.label}</Text>
          </View>
        </View>

        {/* Conteúdo */}
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {editando ? (
            <>
              <Text style={[s.label, { color: colors.textSecondary }]}>Nome</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.textPrimary }]}
                value={nome}
                onChangeText={setNome}
                placeholder="Nome do produto"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[s.label, { color: colors.textSecondary }]}>Preço (R$)</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.textPrimary }]}
                value={preco}
                onChangeText={setPreco}
                placeholder="0,00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />

              <Text style={[s.label, { color: colors.textSecondary }]}>Estoque (unidades)</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.textPrimary }]}
                value={estoque}
                onChangeText={setEstoque}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />

              <TouchableOpacity
                style={[s.btnSalvar, { backgroundColor: colors.primary }]}
                onPress={handleSalvar}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.btnSalvarText}>Salvar alterações</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[s.nomeProduto, { color: colors.text }]}>{produto.nome}</Text>

              <View style={s.infoRow}>
                <View style={s.infoItem}>
                  <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Preço</Text>
                  <Text style={[s.infoValue, { color: colors.primary }]}>
                    R$ {produto.preco.toFixed(2).replace(".", ",")}
                  </Text>
                </View>
                <View style={[s.infoDivider, { backgroundColor: colors.border }]} />
                <View style={s.infoItem}>
                  <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Estoque</Text>
                  <Text style={[s.infoValue, { color: estoqueStatus.color }]}>
                    {produto.estoque} un.
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Botão excluir */}
        {!editando && (
          <TouchableOpacity
            style={[s.btnExcluir, { borderColor: colors.error }]}
            onPress={handleExcluir}
            disabled={excluindo}
          >
            {excluindo ? (
              <ActivityIndicator color={colors.error} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
                <Text style={[s.btnExcluirText, { color: colors.error }]}>Excluir produto</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    headerTitle: { fontSize: 16, fontWeight: "700" },
    editBtn: { width: 40, alignItems: "flex-end" },
    bannerContainer: { borderRadius: 16, overflow: "hidden", marginBottom: 16, position: "relative" },
    banner: { width: "100%", height: 220, resizeMode: "cover" },
    bannerPlaceholder: { width: "100%", height: 220, alignItems: "center", justifyContent: "center", borderRadius: 16 },
    estoqueBadge: { position: "absolute", bottom: 12, right: 12, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    estoqueBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
    card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
    nomeProduto: { fontSize: 22, fontWeight: "800", marginBottom: 16 },
    infoRow: { flexDirection: "row", alignItems: "center" },
    infoItem: { flex: 1, alignItems: "center", gap: 4 },
    infoDivider: { width: 1, height: 40 },
    infoLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
    infoValue: { fontSize: 22, fontWeight: "800" },
    label: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
    input: { height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, fontSize: 15 },
    btnSalvar: { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 20 },
    btnSalvarText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    btnExcluir: { height: 50, borderRadius: 12, borderWidth: 1.5, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    btnExcluirText: { fontSize: 15, fontWeight: "700" },
  });