import { useTheme } from "@/hook/useTheme";
import { Text, View } from "react-native";
import { Button } from "../Button/Button";

interface HeaderProps {
    title: string;
    description?: string;
}


export function Header({ title, description }: HeaderProps) {
    const { colors } = useTheme();
    
    return (
        <View  style={[{ padding: 16,  flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
            <View >
                <Text style={[{ fontSize: 20, fontWeight: "bold" }, { color: colors.textPrimary }]}>
                    {title}
                </Text>
                <Text style={[{ color: colors.textSecondary }]}>
                    {description}
                </Text>
            </View> 
            <Button color={colors.buttonText} backgroundColor={colors.primary} title="Criar" preset="criar"/>
        </View>
    );
}   