import { useTheme } from "@/hook/useTheme";
import { Text, TouchableOpacity, View } from "react-native";
import { Pedido } from "../ListaPedidos";
import { styles } from "./styles";

interface CardProdutosProps {
    pedido: Pedido;
    onPress?: () => void;
}

export function CardPedidos({ pedido, onPress }: CardProdutosProps) {
    const { colors } = useTheme();

    const getStatusColor = () => {
        switch (pedido.status) {
            case "entregue": return "#4ade80";
            case "preparando": return "#fbbf24";
            case "cancelado": return "#ef4444";
            default: return "#94a3b8";
        }
    };

    return (
        <TouchableOpacity onPress={onPress} style={[styles.container, { backgroundColor: colors.inputBackground || '#F3F4F6', borderColor: colors.border || '#E5E7EB' }]}>
            {/* Linha Superior: Numero e Status */}
            <View style={styles.header}>
                <Text style={[styles.nameText, { color: colors.text }]}>
                    Pedido {pedido.numeroPedido}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                    <Text style={styles.statusText}>{pedido.status}</Text>
                </View>
            </View>

            {/* Linha Inferior: Data e Preço */}
            <View style={styles.footerRow}>
                <Text style={[styles.dateText, { color: colors.textSecondary || '#666' }]}>
                    {pedido.data.toLocaleDateString('pt-BR')} às {pedido.data.getHours()}:{pedido.data.getMinutes()}
                </Text>
                <Text style={[styles.priceText, { color: colors.primary || '#000' }]}>
                    R$ {pedido.total.toFixed(2).replace('.', ',')}
                </Text>
            </View>
        </TouchableOpacity>
    );
}