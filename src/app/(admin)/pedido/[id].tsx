import { Button } from "@/components/Button/Button";
import { GoBack } from "@/components/GoBack";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useTheme } from "@/hook/useTheme";
import { supabase } from "@/lib/supabase";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from "react-native";

interface ItemPedido {
    id: string;
    quantidade: number;
    preco_unitario: number;
    produtos: {
        nome: string;
        foto: string | null;
    };
}

interface Pedido {
    id: string;
    status: string;
    total: number;
    created_at: string;
    pedido_itens: ItemPedido[];
}

export default function DetalhePedido() {
    const { id } = useLocalSearchParams();
    const { colors } = useTheme();
    const router = useRouter();
    const [pedido, setPedido] = useState<Pedido | null>(null);
    const [loading, setLoading] = useState(true);
    const [gerando, setGerando] = useState(false);

    useEffect(() => {
        async function carregarPedido() {
            const { data, error } = await supabase
                .from("pedidos")
                .select(`
          id, status, total, created_at,
          pedido_itens (
            id, quantidade, preco_unitario,
            produtos ( nome, foto )
          )
        `)
                .eq("id", id)
                .single();

            if (error) { console.error(error); setLoading(false); return; }
            setPedido(data as any);
            setLoading(false);
        }
        carregarPedido();
    }, [id]);

    function gerarHtml(pedido: Pedido, dataFormatada: string): string {
        const itensHtml = pedido.pedido_itens.map((item) => {
            const subtotal = (item.preco_unitario * item.quantidade).toFixed(2).replace(".", ",");
            return `<tr>
      <td>${item.produtos?.nome ?? "Produto"}</td>
      <td style="text-align:center">${item.quantidade}x</td>
      <td style="text-align:right">R$ ${subtotal}</td>
    </tr>`;
        }).join("");

        return `<html><head><meta charset="utf-8"/>
    <style>
      body{font-family:Arial,sans-serif;padding:32px;color:#1a1a1a}
      .header{text-align:center;margin-bottom:24px}
      .header h1{color:#C4452D;font-size:28px;margin:0}
      .header p{color:#666;margin:4px 0}
      hr{border:none;border-top:1px solid #eee;margin:16px 0}
      .info p{margin:4px 0;font-size:14px}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th{text-align:left;padding:8px 0;border-bottom:2px solid #eee;font-size:14px}
      td{padding:10px 0;border-bottom:1px solid #f5f5f5;font-size:14px}
      .total{display:flex;justify-content:space-between;margin-top:16px}
      .total-label{font-size:18px;font-weight:bold}
      .total-value{font-size:22px;font-weight:bold;color:#C4452D}
      .footer{text-align:center;margin-top:32px;color:#999;font-size:12px}
    </style>
    </head><body>
    <div class="header"><h1>Primoos Beer</h1><p>Comprovante de Venda</p></div>
    <hr/>
    <div class="info">
      <p><b>Pedido:</b> #${pedido.id.slice(0, 8).toUpperCase()}</p>
      <p><b>Data:</b> ${dataFormatada}</p>
      <p><b>Status:</b> ${pedido.status}</p>
    </div>
    <hr/>
    <table>
      <thead><tr><th>Produto</th><th style="text-align:center">Qtd</th><th style="text-align:right">Subtotal</th></tr></thead>
      <tbody>${itensHtml}</tbody>
    </table>
    <hr/>
    <div class="total">
      <span class="total-label">Total</span>
      <span class="total-value">R$ ${pedido.total.toFixed(2).replace(".", ",")}</span>
    </div>
    <div class="footer"><p>Obrigado pela preferencia!</p></div>
    </body></html>`;
    }

    async function handleGerarComprovante() {
        if (!pedido) return;
        setGerando(true);

        const data = new Date(pedido.created_at);
        const dataFormatada = `${data.toLocaleDateString("pt-BR")} as ${String(data.getHours()).padStart(2, "0")}:${String(data.getMinutes()).padStart(2, "0")}`;

        try {
            const html = gerarHtml(pedido, dataFormatada);
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, {
                mimeType: "application/pdf",
                dialogTitle: "Compartilhar Comprovante",
            });
        } catch (err) {
        } finally {
            setGerando(false);
        }
    }

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!pedido) {
        return (
            <View style={styles.center}>
                <Text style={{ color: colors.text }}>Pedido não encontrado</Text>
                <GoBack onPress={() => router.back()} />
            </View>
        );
    }

    const data = new Date(pedido.created_at);
    const dataFormatada = `${data.toLocaleDateString("pt-BR")} às ${String(data.getHours()).padStart(2, "0")}:${String(data.getMinutes()).padStart(2, "0")}`;

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <GoBack onPress={() => router.back()} />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        Pedido #{pedido.id.slice(0, 8).toUpperCase()}
                    </Text>
                    <Text style={[styles.headerData, { color: colors.textSecondary }]}>
                        {dataFormatada}
                    </Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={pedido.pedido_itens}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={[styles.productCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                        {item.produtos?.foto ? (
                            <Image source={{ uri: item.produtos.foto }} style={styles.productImage} />
                        ) : (
                            <View style={[styles.productImage, { backgroundColor: colors.border, alignItems: "center", justifyContent: "center" }]}>
                                <Text>📦</Text>
                            </View>
                        )}
                        <View style={styles.productInfo}>
                            <Text style={[styles.productName, { color: colors.text }]}>{item.produtos?.nome}</Text>
                            <Text style={[styles.productQty, { color: colors.textSecondary }]}>{item.quantidade}x unidades</Text>
                        </View>
                        <Text style={[styles.productPrice, { color: colors.text }]}>
                            R$ {(item.preco_unitario * item.quantidade).toFixed(2).replace(".", ",")}
                        </Text>
                    </View>
                )}
            />

            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={[styles.totalLabel, { color: colors.text }]}>Total do Pedido</Text>
                    <Text style={[styles.totalValue, { color: colors.primary }]}>
                        R$ {pedido.total.toFixed(2).replace(".", ",")}
                    </Text>
                </View>
                <Button
                    backgroundColor={colors.primary}
                    preset="comprovante"
                    onPress={handleGerarComprovante}
                />
                {gerando && <ActivityIndicator style={{ marginTop: 8 }} color={colors.primary} />}
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    headerTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center" },
    headerData: { fontSize: 12, textAlign: "center" },
    listContent: { marginTop: 16 },
    productCard: { borderWidth: 1, flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, marginBottom: 10 },
    productImage: { width: 50, height: 50, borderRadius: 8 },
    productInfo: { flex: 1, marginLeft: 12 },
    productName: { fontWeight: "bold", fontSize: 14 },
    productQty: { fontSize: 12 },
    productPrice: { fontWeight: "bold" },
    totalContainer: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#eee", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    totalLabel: { fontSize: 16, fontWeight: "600" },
    totalValue: { fontSize: 22, fontWeight: "bold" },
    footer: { paddingBottom: 40 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
});