import { useTheme } from "@/hook/useTheme";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TextInput, View } from "react-native";
import { Button } from "./Button/Button";

export function FormLogin() {
    const { colors } = useTheme();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        if (!email || !password) {
            Alert.alert("Atenção", "Preencha email e senha.");
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        setLoading(false);

        if (error) {
            Alert.alert("Erro ao entrar", "Email ou senha incorretos.");
            return;
        }

        // Verifica se o usuário precisa completar o 2FA
        if (data.session?.user) {
            const { data: factorsData } = await supabase.auth.mfa.listFactors();
            const totpFactor = factorsData?.totp?.find((f) => f.status === "verified");

            if (totpFactor) {
                // Usuário já tem 2FA configurado — pede o código
                router.replace({
                    pathname: "/(auth)/Verificar2fa",
                    params: { factorId: totpFactor.id },
                });
            } else {
                // Usuário ainda não configurou 2FA — vai para configuração
                router.replace("/(auth)/Configurar2fa");
            }
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Senha"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <View style={styles.buttonContainer}>
                {loading ? (
                    <ActivityIndicator color={colors.primary} size="large" />
                ) : (
                    <Button backgroundColor={colors.button} onPress={handleLogin} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: "100%" },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    buttonContainer: {
        marginTop: 12,
        borderRadius: 8,
        overflow: "hidden",
    },
});