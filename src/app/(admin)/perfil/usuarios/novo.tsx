import { GoBack } from "@/components/GoBack";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useTheme } from "@/hook/useTheme";
import { supabaseAdmin } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function NovoUsuario() {
    const { colors } = useTheme();
    const router = useRouter();
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleCriar() {
        if (!nome || !email || !senha) {
            Alert.alert("Atenção", "Preencha todos os campos.");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabaseAdmin.auth.signUp({
                email,
                password: senha,
                options: { data: { name: nome } },
            });

            if (error) { Alert.alert("Erro", error.message); return; }



            Alert.alert("Sucesso! 🎉", `Usuário ${nome} criado com sucesso!`, [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (err) {
            console.error(err);
            Alert.alert("Erro", "Algo deu errado.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <GoBack onPress={() => router.back()} />
                <Text style={[styles.title, { color: colors.text }]}>Novo Usuário</Text>
                <View style={{ width: 40 }} />
            </View>

            <TextInput
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                placeholder="Nome completo"
                placeholderTextColor={colors.textSecondary}
                value={nome}
                onChangeText={setNome}
            />
            <TextInput
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                placeholder="Senha"
                placeholderTextColor={colors.textSecondary}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
            />

            <TouchableOpacity
                style={[styles.botao, { backgroundColor: colors.primary }]}
                onPress={handleCriar}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Criar Usuário</Text>}
            </TouchableOpacity>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
    title: { fontSize: 20, fontWeight: "bold" },
    input: { height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, marginBottom: 12 },
    botao: { height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 8 },
    botaoTexto: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});