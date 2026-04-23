import { ScreenContainer } from "@/components/ScreenContainer";
import { useTheme } from "@/hook/useTheme";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function Verificar2FA() {
    const { colors } = useTheme();
    const router = useRouter();
    const { factorId } = useLocalSearchParams<{ factorId: string }>();

    const [codigo, setCodigo] = useState("");
    const [verificando, setVerificando] = useState(false);

    async function handleVerificar() {
        if (codigo.length !== 6) {
            Alert.alert("Atenção", "Digite o código de 6 dígitos.");
            return;
        }

        setVerificando(true);

        // Cria o challenge
        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });

        if (challengeError || !challengeData) {
            Alert.alert("Erro", "Não foi possível iniciar a verificação.");
            setVerificando(false);
            return;
        }

        // Verifica o código
        const { error: verifyError } = await supabase.auth.mfa.verify({
            factorId,
            challengeId: challengeData.id,
            code: codigo,
        });

        setVerificando(false);

        if (verifyError) {
            Alert.alert("Código inválido", "O código digitado está incorreto. Tente novamente.");
            setCodigo("");
            return;
        }

        // Autenticação completa — redireciona
        router.replace("/");
    }

    async function handleCancelar() {
        await supabase.auth.signOut();
        router.replace("/(auth)/login");
    }

    const s = styles(colors);

    return (
        <ScreenContainer>
            <View style={s.content}>
                {/* Ícone */}
                <View style={[s.iconCircle, { backgroundColor: colors.primary + "22" }]}>
                    <Text style={{ fontSize: 36 }}>🔐</Text>
                </View>

                <Text style={s.title}>Verificação em duas etapas</Text>
                <Text style={[s.subtitle, { color: colors.textSecondary }]}>
                    Abra o Google Authenticator ou Authy e digite o código de 6 dígitos gerado para este app.
                </Text>

                <TextInput
                    style={[s.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="000000"
                    placeholderTextColor={colors.textSecondary}
                    value={codigo}
                    onChangeText={(t) => setCodigo(t.replace(/\D/g, "").slice(0, 6))}
                    keyboardType="number-pad"
                    maxLength={6}
                    textAlign="center"
                    autoFocus
                />

                <TouchableOpacity
                    style={[s.btn, { backgroundColor: colors.primary }]}
                    onPress={handleVerificar}
                    disabled={verificando}
                >
                    {verificando ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={s.btnText}>Verificar</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleCancelar} style={s.btnCancelar}>
                    <Text style={[s.btnCancelarText, { color: colors.textSecondary }]}>
                        Cancelar e voltar ao login
                    </Text>
                </TouchableOpacity>
            </View>
        </ScreenContainer>
    );
}

const styles = (colors: any) =>
    StyleSheet.create({
        content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
        iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 24 },
        title: { fontSize: 24, fontWeight: "800", color: colors.textPrimary, textAlign: "center", marginBottom: 10 },
        subtitle: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 32 },
        input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 32, fontWeight: "700", letterSpacing: 12, marginBottom: 20, width: "100%" },
        btn: { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", width: "100%", marginBottom: 16 },
        btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
        btnCancelar: { padding: 8 },
        btnCancelarText: { fontSize: 13 },
    });