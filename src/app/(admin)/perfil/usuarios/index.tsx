import { GoBack } from "@/components/GoBack";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useTheme } from "@/hook/useTheme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Usuario {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

export default function Usuarios() {
    const { colors } = useTheme();
    const router = useRouter();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);

    async function carregarUsuarios() {
        setLoading(true);
        const { data, error } = await supabase
            .from("users")
            .select("id, name, email, role, created_at")
            .order("created_at", { ascending: false });

        if (error) { Alert.alert("Erro", "Não foi possível carregar os usuários."); setLoading(false); return; }
        setUsuarios(data);
        setLoading(false);
    }

    useFocusEffect(useCallback(() => { carregarUsuarios(); }, []));

    async function handleRemover(usuario: Usuario) {
        Alert.alert(
            "Remover usuário",
            `Tem certeza que deseja remover ${usuario.name}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Remover",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase
                            .from("users")
                            .delete()
                            .eq("id", usuario.id);

                        if (error) { Alert.alert("Erro", "Não foi possível remover o usuário."); return; }
                        carregarUsuarios();
                    },
                },
            ]
        );
    }

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <GoBack onPress={() => router.back()} />
                <Text style={[styles.title, { color: colors.text }]}>Usuários</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push("/(admin)/perfil/usuarios/novo")}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={usuarios}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                                <Text style={styles.avatarText}>
                                    {item.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.info}>
                                <Text style={[styles.nome, { color: colors.text }]}>{item.name}</Text>
                                <Text style={[styles.email, { color: colors.textSecondary }]}>{item.email}</Text>
                                <View style={[styles.roleBadge, { backgroundColor: item.role === "admin" ? colors.primary : colors.accent }]}>
                                    <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
                                </View>
                            </View>
                            {item.role !== "admin" && (
                                <TouchableOpacity onPress={() => handleRemover(item)}>
                                    <Ionicons name="trash-outline" size={22} color={colors.error} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    title: { fontSize: 20, fontWeight: "bold" },
    addButton: { width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    listContent: { gap: 12, paddingBottom: 100 },
    card: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1, gap: 12 },
    avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    info: { flex: 1 },
    nome: { fontWeight: "bold", fontSize: 15 },
    email: { fontSize: 12, marginBottom: 4 },
    roleBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
    roleText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
});