import { Text, TouchableOpacity } from "react-native";
import { styles } from "./style";

interface ButtonProps { 
    title: string;
    color?: string;
    onPress: () => void;
}



export function Button({ title, color, onPress }: ButtonProps) {
    return <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
        <Text style={styles.buttonText}>{title} </Text>
    </TouchableOpacity>;
}