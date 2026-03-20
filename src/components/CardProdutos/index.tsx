import { useTheme } from "@/hook/useTheme";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

interface CardProdutosProps {
    name: string;
    price: number;
    imageUrl: string;
    onpress?: () => void;
}

export function CardProdutos({ name, price, imageUrl, onpress }: CardProdutosProps) {
    const { colors } = useTheme();

    return (
        <TouchableOpacity style={[styles.container, { borderColor: colors.border }]} onPress={onpress}>
            <Image
                source={{ uri: imageUrl }}
                style={StyleSheet.absoluteFillObject} // Faz a imagem ocupar o card todo
                resizeMode="cover" // Garante que ela preencha sem distorcer ou sobrar espaço
            />
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <Text style={[styles.nameText, { color: colors.textLight }]}>{name}</Text>
                    <Text style={[styles.priceText, { color: colors.textLight }]}>${price.toFixed(2)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}