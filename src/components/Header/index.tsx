import { useTheme } from "@/hook/useTheme";
import { Text, View } from "react-native";

interface HeaderProps {
    title: string;
    description?: string;
}


export function Header({ title, description }: HeaderProps) {
    const { colors } = useTheme();

    return (
        <View  style={[{ marginBottom: 16, flexDirection: "row", alignItems: "center",  }]}>
            <View >
                <Text style={[{ fontSize: 20, fontWeight: "bold" }, { color: colors.primary }]}>
                    {title}
                </Text>
                <Text style={[{ color: colors.textSecondary }]}>
                    {description}
                </Text>
            </View> 
        </View>
    );
}   