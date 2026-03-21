import { GoBack } from "@/components/GoBack";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useTheme } from "@/hook/useTheme";
import { supabase } from "@/lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
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

export default function NovoProduto() {
    const router = useRouter();
    const { colors } = useTheme();

    const [nome, setNome] = useState("");
    const [preco, setPreco] = useState("");
    const [estoque, setEstoque] = useState("");
    const [foto, setFoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSelecionarImagem() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permissão necessária", "Precisamos acessar sua galeria.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setFoto(result.assets[0].uri);
        }
    }

    async function uploadImagem(uri: string): Promise<string | null> {
        const fileName = `produto_${Date.now()}.jpg`;
        const filePath = `produtos/${fileName}`;

        const formData = new FormData();
        formData.append("file", {
            uri,
            name: fileName,
            type: "image/jpeg",
        } as any);

        const { data, error } = await supabase.storage
            .from("produtos")
            .upload(filePath, formData, {
                contentType: "multipart/form-data",
            });

        if (error) {
            console.error("Erro upload:", error);
            return null;
        }

        const { data: urlData } = supabase.storage
            .from("produtos")
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    }

    async function handleSalvar() {
        if (!nome || !preco || !estoque) {
            Alert.alert("Atenção", "Preencha todos os campos.");
            return;
        }

        setLoading(true);

        try {
            let fotoUrl: string | null = null;

            if (foto) {
                fotoUrl = await uploadImagem(foto);
            }

            const { error } = await supabase.from("produtos").insert({
                nome,
                preco: parseFloat(preco.replace(",", ".")),
                estoque: parseInt(estoque),
                foto: fotoUrl,
            });

            if (error) {
                Alert.alert("Erro", "Não foi possível salvar o produto.");
                console.error(error);
                return;
            }

            Alert.alert("Sucesso", "Produto cadastrado com sucesso!", [
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
            {/* Header */}
            <View style={styles.header}>
                <GoBack onPress={() => router.back()} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Novo Produto
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Upload de Imagem */}
            <TouchableOpacity
                style={[styles.imagePicker, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}
                onPress={handleSelecionarImagem}
            >
                {foto ? (
                    <Image source={{ uri: foto }} style={styles.imagemSelecionada} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Text style={{ fontSize: 36 }}>📷</Text>
                        <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>
                            Toque para adicionar foto
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Campos */}
            <View style={styles.form}>
                <Text style={[styles.label, { color: colors.text }]}>Nome</Text>
                <TextInput
                    style={[styles.input, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                    placeholder="Ex: Cerveja Heineken 330ml"
                    placeholderTextColor={colors.textSecondary}
                    value={nome}
                    onChangeText={setNome}
                />

                <Text style={[styles.label, { color: colors.text }]}>Preço (R$)</Text>
                <TextInput
                    style={[styles.input, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                    placeholder="Ex: 6,90"
                    placeholderTextColor={colors.textSecondary}
                    value={preco}
                    onChangeText={setPreco}
                    keyboardType="decimal-pad"
                />

                <Text style={[styles.label, { color: colors.text }]}>Estoque</Text>
                <TextInput
                    style={[styles.input, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                    placeholder="Ex: 100"
                    placeholderTextColor={colors.textSecondary}
                    value={estoque}
                    onChangeText={setEstoque}
                    keyboardType="numeric"
                />
            </View>

            {/* Botão Salvar */}
            <TouchableOpacity
                style={[styles.botao, { backgroundColor: colors.primary }]}
                onPress={handleSalvar}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={colors.buttonText} />
                ) : (
                    <Text style={[styles.botaoTexto, { color: colors.buttonText }]}>
                        Salvar Produto
                    </Text>
                )}
            </TouchableOpacity>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    headerTitle: { fontSize: 20, fontWeight: "bold" },
    imagePicker: {
        width: "100%",
        height: 180,
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: "dashed",
        overflow: "hidden",
        marginBottom: 24,
    },
    imagemSelecionada: { width: "100%", height: "100%" },
    imagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
    imagePlaceholderText: { fontSize: 14 },
    form: { gap: 8, marginBottom: 24 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 15,
        marginBottom: 12,
    },
    botao: {
        height: 52,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    botaoTexto: { fontSize: 16, fontWeight: "bold" },
});