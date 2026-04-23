import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hook/useTheme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Promocao {
  id: string;
  titulo: string;
  descricao: string;
  foto_url: string | null;
  created_at: string;
}

export default function Promocao() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loadingLista, setLoadingLista] = useState(true);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const s = styles(colors);

  async function carregarPromocoes() {
    setLoadingLista(true);
    const { data, error } = await supabase
      .from("promocoes")
      .select("id, titulo, descricao, foto_url, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Erro", "Não foi possível carregar as promoções.");
    } else {
      setPromocoes(data ?? []);
    }
    setLoadingLista(false);
  }

  useFocusEffect(
    useCallback(() => {
      carregarPromocoes();
    }, [])
  );

  async function handleSelecionarImagem() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos acessar sua galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImagemUri(result.assets[0].uri);
    }
  }

  async function handleSalvar() {
    if (!titulo.trim()) {
      Alert.alert("Atenção", "Informe o nome da promoção.");
      return;
    }
    if (!imagemUri) {
      Alert.alert("Atenção", "Selecione um banner para a promoção.");
      return;
    }

    setSalvando(true);

    try {
      const fileName = `promocao_${user?.id}_${Date.now()}.jpg`;
      const filePath = `promocoes/${fileName}`;

      const formData = new FormData();
      formData.append("file", {
        uri: imagemUri,
        name: fileName,
        type: "image/jpeg",
      } as any);

      const { error: uploadError } = await supabase.storage
        .from("produtos")
        .upload(filePath, formData, { contentType: "multipart/form-data" });

      if (uploadError) {
        Alert.alert("Erro", "Não foi possível fazer upload do banner.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("produtos")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("promocoes").insert({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        foto_url: urlData.publicUrl,
        user_id: user?.id,
        ativo: true,
      });

      if (insertError) {
        Alert.alert("Erro", "Não foi possível salvar a promoção.");
        return;
      }

      setTitulo("");
      setDescricao("");
      setImagemUri(null);
      await carregarPromocoes();
      Alert.alert("Sucesso", "Promoção criada com sucesso!");
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Algo deu errado. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletar(id: string) {
    Alert.alert("Deletar promoção", "Tem certeza que deseja deletar esta promoção?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Deletar",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("promocoes").delete().eq("id", id);
          if (error) {
            Alert.alert("Erro", "Não foi possível deletar a promoção.");
          } else {
            setPromocoes((prev) => prev.filter((p) => p.id !== id));
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer>
      <FlatList
        data={promocoes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <>
            {/* Header */}
            <Text style={s.pageTitle}>Promoções</Text>
            <Text style={s.pageSub}>Crie e gerencie banners promocionais</Text>

            {/* Formulário */}
            <View style={s.card}>
              {/* Banner */}
              <TouchableOpacity style={s.bannerPicker} onPress={handleSelecionarImagem}>
                {imagemUri ? (
                  <Image source={{ uri: imagemUri }} style={s.bannerPreview} />
                ) : (
                  <View style={s.bannerPlaceholder}>
                    <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
                    <Text style={s.bannerPlaceholderText}>Toque para selecionar o banner</Text>
                    <Text style={[s.bannerPlaceholderSub, { color: colors.textSecondary }]}>
                      Proporção 16:9 recomendada
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {imagemUri && (
                <TouchableOpacity onPress={handleSelecionarImagem} style={s.trocarBanner}>
                  <Ionicons name="refresh-outline" size={14} color={colors.primary} />
                  <Text style={[s.trocarBannerText, { color: colors.primary }]}>Trocar imagem</Text>
                </TouchableOpacity>
              )}

              {/* Nome */}
              <Text style={s.label}>Nome da promoção</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Ex: Promoção de Verão"
                placeholderTextColor={colors.textSecondary}
                value={titulo}
                onChangeText={setTitulo}
              />

              {/* Descrição */}
              <Text style={s.label}>Descrição</Text>
              <TextInput
                style={[s.input, s.inputMultiline, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Descreva a promoção..."
                placeholderTextColor={colors.textSecondary}
                value={descricao}
                onChangeText={setDescricao}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Botão salvar */}
              <TouchableOpacity
                style={[s.btnSalvar, { backgroundColor: colors.primary }]}
                onPress={handleSalvar}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.btnSalvarText}>Criar Promoção</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Título da lista */}
            {promocoes.length > 0 && (
              <Text style={s.sectionTitle}>Promoções ativas</Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loadingLista ? (
            <View style={s.empty}>
              <Ionicons name="pricetag-outline" size={40} color={colors.textSecondary} />
              <Text style={[s.emptyText, { color: colors.textSecondary }]}>
                Nenhuma promoção criada ainda
              </Text>
            </View>
          ) : (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
          )
        }
        renderItem={({ item }) => (
          <View style={[s.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {item.foto_url && (
              <Image source={{ uri: item.foto_url }} style={s.promoBanner} />
            )}
            <View style={s.promoInfo}>
              <View style={{ flex: 1 }}>
                <Text style={[s.promoTitulo, { color: colors.textPrimary }]}>{item.titulo}</Text>
                {item.descricao ? (
                  <Text style={[s.promoDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.descricao}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={() => handleDeletar(item.id)} style={s.btnDeletar}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    pageTitle: { fontSize: 24, fontWeight: "800", color: colors.textPrimary, marginBottom: 2 },
    pageSub: { fontSize: 13, color: colors.textSecondary, marginBottom: 16 },
    card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 24 },
    bannerPicker: { borderRadius: 12, overflow: "hidden", marginBottom: 8, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed" },
    bannerPreview: { width: "100%", height: 180, resizeMode: "cover" },
    bannerPlaceholder: { height: 160, alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.inputBackground },
    bannerPlaceholderText: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
    bannerPlaceholderSub: { fontSize: 11 },
    trocarBanner: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12, alignSelf: "flex-end" },
    trocarBannerText: { fontSize: 12, fontWeight: "600" },
    label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6, marginTop: 12 },
    input: { height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, fontSize: 15 },
    inputMultiline: { height: 88, paddingTop: 12 },
    btnSalvar: { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 20 },
    btnSalvarText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.textPrimary, marginBottom: 12 },
    promoCard: { borderRadius: 14, borderWidth: 1, marginBottom: 12, overflow: "hidden" },
    promoBanner: { width: "100%", height: 150, resizeMode: "cover" },
    promoInfo: { flexDirection: "row", alignItems: "center", padding: 12, gap: 8 },
    promoTitulo: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
    promoDesc: { fontSize: 12, lineHeight: 16 },
    btnDeletar: { padding: 6 },
    empty: { alignItems: "center", gap: 8, marginTop: 24 },
    emptyText: { fontSize: 14 },
  });