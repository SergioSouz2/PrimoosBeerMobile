import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";
import { styles } from "./style";

interface ButtonProps {
    preset?: "login" | "criar" | "adicionar";
    backgroundColor?: string;
    color?: string;
    onPress?: () => void;
}



export function Button({ backgroundColor, onPress, preset = "login", color }: ButtonProps) {
    preset = preset || "login";
    return (<>
        {
            preset === "login" && (
                <TouchableOpacity style={[styles.button, { backgroundColor: backgroundColor }]} onPress={onPress}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            )}

        {
            preset === "criar" && (
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.criarButton, { backgroundColor: backgroundColor }]}
                >
                    <Ionicons name="add-circle-outline" size={24} color={color} />

                    <Text style={styles.criarButtonText}>
                        Criar
                    </Text>
                </TouchableOpacity>
            )
        }
        {
            preset === "adicionar" && (
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.criarButton, { backgroundColor: backgroundColor }]}
                >
                    <Ionicons name="add-circle-outline" size={24} color={color} />

                    <Text style={styles.criarButtonText}>
                        Adicionar
                    </Text>
                </TouchableOpacity>
            )
        }
    </>

    )



}