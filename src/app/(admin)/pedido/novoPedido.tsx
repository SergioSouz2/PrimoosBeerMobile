import { GoBack } from "@/components/GoBack";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { Produto, useProdutos } from "@/hook/useProdutos";
import { useTheme } from "@/hook/useTheme";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface ItemPedido {
    id: string;
    nome: string;
    preco: number;
    image: string;
    quantidade: number;
}

export default function NovoPedido() {
    const router = useRouter();
    const { colors } = useTheme();
    const { user } = useAuth();
    const { produtos: listaProdutos, loading: loadingProdutos } = useProdutos();
    const [itens, setItens] = useState<(Produto & { quantidade: number })[]>([]);
    const [loading, setLoading] = useState(false);

    function handleQuantidade(id: string, valor: string) {
        const quantidade = parseInt(valor) || 0;
        setItens((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantidade } : item))
        );
    }

    const itensSelecionados = itens.filter((i) => i.quantidade > 0);
    const total = itensSelecionados.reduce(
        (acc, item) => acc + item.preco * item.quantidade,
        0
    );

    async function handleConfirmar() {
        if (itensSelecionados.length === 0) return;

        setLoading(true);

        try {
            // 1. Cria o pedido
            const { data: pedido, error: erroPedido } = await supabase
                .from("pedidos")
                .insert({
                    user_id: user?.id,
                    status: "pendente",
                    total,
                })
                .select()
                .single();

            if (erroPedido || !pedido) {
                Alert.alert("Erro", "Não foi possível criar o pedido.");
                return;
            }

            // 2. Insere os itens do pedido
            const itensParaInserir = itensSelecionados.map((item) => ({
                pedido_id: pedido.id,
                produto_id: item.id,
                quantidade: item.quantidade,
                preco_unitario: item.preco,
            }));

            const { error: erroItens } = await supabase
                .from("pedido_itens")
                .insert(itensParaInserir);

            if (erroItens) {
                Alert.alert("Erro", "Não foi possível salvar os itens do pedido.");
                return;
            }

            Alert.alert("Sucesso! 🎉", "Pedido criado com sucesso!", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (err) {
            console.error(err);
            Alert.alert("Erro", "Algo deu errado.");
        } finally {
            setLoading(false);
        }


    }

    useEffect(() => {
        setItens(listaProdutos.map((p) => ({ ...p, quantidade: 0 })));
    }, [listaProdutos]);

    return (
        <ScreenContainer>
            {/* Header */}
            <View style={styles.header}>
                <GoBack onPress={() => router.back()} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Novo Pedido
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Lista de Produtos */}
            <FlatList
                data={itens}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: colors.inputBackground,
                                borderColor: item.quantidade > 0 ? colors.primary : colors.border,
                            },
                        ]}
                    >
                        <Image source={{ uri: item.foto ?? undefined }} style={styles.image} />
                        <View style={styles.info}>
                            <Text style={[styles.nome, { color: colors.text }]} numberOfLines={2}>
                                {item.nome}
                            </Text>
                            <Text style={[styles.preco, { color: colors.primary }]}>
                                R$ {item.preco.toFixed(2).replace(".", ",")}
                            </Text>
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    borderColor: item.quantidade > 0 ? colors.primary : colors.border,
                                    color: colors.text,
                                    backgroundColor: colors.surface,
                                },
                            ]}
                            keyboardType="numeric"
                            value={item.quantidade > 0 ? String(item.quantidade) : ""}
                            onChangeText={(v) => handleQuantidade(item.id, v)}
                            placeholder="0"
                            placeholderTextColor={colors.textSecondary}
                            maxLength={3}
                        />
                    </View>
                )}
            />

            {/* Rodapé */}
            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
                <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                    <Text style={[styles.totalValue, { color: colors.primary }]}>
                        R$ {total.toFixed(2).replace(".", ",")}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.botaoConfirmar,
                        {
                            backgroundColor: itensSelecionados.length > 0 ? colors.primary : colors.border,
                        },
                    ]}
                    onPress={handleConfirmar}
                    disabled={itensSelecionados.length === 0 || loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.buttonText} />
                    ) : (
                        <Text style={[styles.botaoTexto, { color: colors.buttonText }]}>
                            Confirmar Pedido {itensSelecionados.length > 0 ? `(${itensSelecionados.length})` : ""}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    headerTitle: { fontSize: 20, fontWeight: "bold" },
    listContent: { paddingBottom: 16, gap: 12 },
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    image: { width: 56, height: 56, borderRadius: 8 },
    info: { flex: 1 },
    nome: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
    preco: { fontSize: 13, fontWeight: "bold" },
    input: {
        width: 52,
        height: 40,
        borderWidth: 1.5,
        borderRadius: 8,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
    },
    footer: {
        paddingTop: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        gap: 12,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalLabel: { fontSize: 16, fontWeight: "600" },
    totalValue: { fontSize: 22, fontWeight: "bold" },
    botaoConfirmar: {
        height: 52,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    botaoTexto: { fontSize: 16, fontWeight: "bold" },
});