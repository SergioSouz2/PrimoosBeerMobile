import { useTheme } from "@/hook/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";

interface GoBackProps {
    onPress?: () => void; // Caso queira exibir um texto ao lado do ícone
}

export function GoBack({ onPress }: GoBackProps) {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress} // Volta para a tela anteriors
            activeOpacity={0.7}
            style={[styles.container, { backgroundColor: colors.inputBackground || '#F3F4F6' }]}
        >
            <Ionicons
                name="chevron-back"
                size={24}
                color={colors.text || "#000"}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        borderRadius: 20, // Faz o botão ser circular
        justifyContent: "center",
        alignItems: "center",
        // Sombra centralizada (como nos seus cards)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,

    },
});