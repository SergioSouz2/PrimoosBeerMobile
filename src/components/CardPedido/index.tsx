import { Pedido } from "@/hook/usePedidos";
import { useTheme } from "@/hook/useTheme";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

interface CardPedidosProps {
    pedido: Pedido;
    onPress?: () => void;
}

export function CardPedidos({ pedido, onPress }: CardPedidosProps) {
    const { colors } = useTheme();

    const getStatusColor = () => {
        switch (pedido.status) {
            case "entregue": return "#4ade80";
            case "preparando": return "#fbbf24";
            case "cancelado": return "#ef4444";
            default: return "#94a3b8";
        }
    };

    const data = new Date(pedido.created_at);
    const dataFormatada = data.toLocaleDateString("pt-BR");
    const horas = String(data.getHours()).padStart(2, "0");
    const minutos = String(data.getMinutes()).padStart(2, "0");

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.container, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
        >
            {/* Linha Superior: ID e Status */}
            <View style={styles.header}>
                <Text style={[styles.nameText, { color: colors.text }]}>
                    Pedido #{pedido.id.slice(0, 8).toUpperCase()}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                    <Text style={styles.statusText}>{pedido.status.toUpperCase()}</Text>
                </View>
            </View>

            {/* Linha Inferior: Data e Total */}
            <View style={styles.footerRow}>
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                    {dataFormatada} às {horas}:{minutos}
                </Text>
                <Text style={[styles.priceText, { color: colors.primary }]}>
                    R$ {pedido.total.toFixed(2).replace(".", ",")}
                </Text>
            </View>
        </TouchableOpacity>
    );
}