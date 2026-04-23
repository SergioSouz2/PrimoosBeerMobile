import { ScreenContainer } from "@/components/ScreenContainer";
import { useTheme } from "@/hook/useTheme";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function Configurar2FA() {
    const { colors } = useTheme();
    const router = useRouter();

    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [factorId, setFactorId] = useState<string | null>(null);
    const [codigo, setCodigo] = useState("");
    const [loading, setLoading] = useState(true);
    const [verificando, setVerificando] = useState(false);

    useEffect(() => {
        async function enrollTotp() {
            const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });

            if (error || !data) {
                Alert.alert("Erro", "Não foi possível configurar o 2FA.");
                setLoading(false);
                return;
            }

            setQrCode(data.totp.qr_code);
            setSecret(data.totp.secret);
            setFactorId(data.id);
            setLoading(false);
        }

        enrollTotp();
    }, []);

    async function handleVerificar() {
        if (codigo.length !== 6) {
            Alert.alert("Atenção", "Digite o código de 6 dígitos do app.");
            return;
        }

        if (!factorId) return;

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

        Alert.alert(
            "2FA ativado!",
            "Autenticação em dois fatores configurada com sucesso.",
            [{ text: "Continuar", onPress: () => router.replace("/") }]
        );
    }

    const s = styles(colors);

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScreenContainer>
            <Text style={s.title}>Configurar 2FA</Text>
            <Text style={s.subtitle}>
                Escaneie o QR code abaixo com o Google Authenticator ou Authy para ativar a autenticação em dois fatores.
            </Text>

            {/* QR Code */}
            {qrCode && (
                <View style={s.qrContainer}>
                    <Image
                        source={{ uri: qrCode }}
                        style={s.qrCode}
                        resizeMode="contain"
                    />
                </View>
            )}

            {/* Chave manual */}
            {secret && (
                <View style={[s.secretBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[s.secretLabel, { color: colors.textSecondary }]}>
                        Ou insira a chave manualmente:
                    </Text>
                    <Text style={[s.secretText, { color: colors.textPrimary }]} selectable>
                        {secret}
                    </Text>
                </View>
            )}

            {/* Input do código */}
            <Text style={[s.inputLabel, { color: colors.textSecondary }]}>
                Digite o código gerado pelo app para confirmar:
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
            />

            <TouchableOpacity
                style={[s.btn, { backgroundColor: colors.primary }]}
                onPress={handleVerificar}
                disabled={verificando}
            >
                {verificando ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={s.btnText}>Confirmar e ativar</Text>
                )}
            </TouchableOpacity>
        </ScreenContainer>
    );
}

const styles = (colors: any) =>
    StyleSheet.create({
        title: { fontSize: 26, fontWeight: "800", color: colors.textPrimary, textAlign: "center", marginBottom: 8 },
        subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: "center", lineHeight: 20, marginBottom: 24 },
        qrContainer: { alignItems: "center", marginBottom: 16 },
        qrCode: { width: 200, height: 200 },
        secretBox: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 24 },
        secretLabel: { fontSize: 12, marginBottom: 6 },
        secretText: { fontSize: 14, fontWeight: "700", letterSpacing: 1, textAlign: "center" },
        inputLabel: { fontSize: 13, marginBottom: 8 },
        input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 24, fontWeight: "700", letterSpacing: 8, marginBottom: 16 },
        btn: { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
        btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    });