import { GoBack } from "@/components/GoBack";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useCarrinho } from "@/context/CarrinhoContext";
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

export default function ProdutoDetalheUsuario() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTheme();
    const router = useRouter();
    const { adicionar, items } = useCarrinho();

    const [produto, setProduto] = useState<Produto | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantidade, setQuantidade] = useState(1);

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
            setLoading(false);
        }

        carregarProduto();
    }, [id]);

    function handleAdicionar() {
        if (!produto) return;

        for (let i = 0; i < quantidade; i++) {
            adicionar({
                produto_id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                foto: produto.foto,
            });
        }

        Alert.alert(
            "Adicionado!",
            `${quantidade}x ${produto.nome} adicionado ao carrinho.`,
            [
                { text: "Continuar comprando", style: "cancel" },
                { text: "Ver carrinho", onPress: () => router.push("/(user)/carrinho") },
            ]
        );
    }

    const itemNoCarrinho = items.find((i) => i.produto_id === id);

    const s = styles(colors);

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!produto) return null;

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Header */}
                <View style={s.header}>
                    <GoBack onPress={() => router.back()} />
                    <View style={{ width: 40 }} />
                </View>

                {/* Foto */}
                {produto.foto ? (
                    <Image source={{ uri: produto.foto }} style={s.foto} />
                ) : (
                    <View style={[s.fotoPlaceholder, { backgroundColor: colors.surface }]}>
                        <Ionicons name="beer-outline" size={80} color={colors.textSecondary} />
                    </View>
                )}

                {/* Info */}
                <View style={s.info}>
                    <Text style={[s.nome, { color: colors.textPrimary }]}>{produto.nome}</Text>
                    <Text style={[s.preco, { color: colors.primary }]}>
                        R$ {produto.preco.toFixed(2).replace(".", ",")}
                    </Text>

                    {/* Estoque */}
                    <View style={[s.estoqueBadge, { backgroundColor: produto.estoque > 5 ? colors.success + "22" : colors.accent + "22" }]}>
                        <Text style={[s.estoqueText, { color: produto.estoque > 5 ? colors.success : colors.accent }]}>
                            {produto.estoque > 5 ? `${produto.estoque} unidades disponíveis` : `Apenas ${produto.estoque} unidades restantes`}
                        </Text>
                    </View>

                    {/* Seletor de quantidade */}
                    <Text style={[s.label, { color: colors.textSecondary }]}>Quantidade</Text>
                    <View style={s.quantidadeRow}>
                        <TouchableOpacity
                            style={[s.qtyBtn, { borderColor: colors.border }]}
                            onPress={() => setQuantidade((q) => Math.max(1, q - 1))}
                        >
                            <Ionicons name="remove" size={20} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={[s.qtyVal, { color: colors.textPrimary }]}>{quantidade}</Text>
                        <TouchableOpacity
                            style={[s.qtyBtn, { borderColor: colors.border }]}
                            onPress={() => setQuantidade((q) => Math.min(produto.estoque, q + 1))}
                        >
                            <Ionicons name="add" size={20} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Total */}
                    <View style={[s.totalRow, { borderColor: colors.border }]}>
                        <Text style={[s.totalLabel, { color: colors.textSecondary }]}>Total</Text>
                        <Text style={[s.totalVal, { color: colors.primary }]}>
                            R$ {(produto.preco * quantidade).toFixed(2).replace(".", ",")}
                        </Text>
                    </View>

                    {/* Já no carrinho */}
                    {itemNoCarrinho && (
                        <View style={[s.jaNoCarrinho, { backgroundColor: colors.success + "22" }]}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            <Text style={[s.jaNoCarrinhoText, { color: colors.success }]}>
                                {itemNoCarrinho.quantidade}x já no carrinho
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Botão fixo */}
            <View style={[s.footer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TouchableOpacity
                    style={[s.btnAdicionar, { backgroundColor: colors.primary }]}
                    onPress={handleAdicionar}
                >
                    <Ionicons name="cart-outline" size={20} color="#fff" />
                    <Text style={s.btnAdicionarText}>Adicionar ao carrinho</Text>
                </TouchableOpacity>
            </View>
        </ScreenContainer>
    );
}

const styles = (colors: any) =>
    StyleSheet.create({
        header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
        foto: { width: "100%", height: 260, borderRadius: 16, resizeMode: "cover", marginBottom: 20 },
        fotoPlaceholder: { width: "100%", height: 260, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 20 },
        info: { paddingHorizontal: 4 },
        nome: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
        preco: { fontSize: 28, fontWeight: "800", marginBottom: 12 },
        estoqueBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 20 },
        estoqueText: { fontSize: 13, fontWeight: "600" },
        label: { fontSize: 13, fontWeight: "600", marginBottom: 10 },
        quantidadeRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 },
        qtyBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center" },
        qtyVal: { fontSize: 20, fontWeight: "800", minWidth: 32, textAlign: "center" },
        totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, paddingTop: 16, marginBottom: 12 },
        totalLabel: { fontSize: 16, fontWeight: "600" },
        totalVal: { fontSize: 24, fontWeight: "800" },
        jaNoCarrinho: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 10, marginTop: 4 },
        jaNoCarrinhoText: { fontSize: 13, fontWeight: "600" },
        footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, borderTopWidth: 1 },
        btnAdicionar: { height: 52, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
        btnAdicionarText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    });