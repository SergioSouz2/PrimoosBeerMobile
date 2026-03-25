import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hook/useTheme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function Perfil() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [loadingUsuario, setLoadingUsuario] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  async function handleLogout() {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  async function handleAlterarFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos acessar sua galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setLoadingAvatar(true);

    try {
      const uri = result.assets[0].uri;
      const fileName = `avatar_${user?.id}_${Date.now()}.jpg`;
      const filePath = `avatars/${fileName}`;

      const formData = new FormData();
      formData.append("file", { uri, name: fileName, type: "image/jpeg" } as any);

      const { error: uploadError } = await supabase.storage
        .from("produtos")
        .upload(filePath, formData, { contentType: "multipart/form-data" });

      if (uploadError) { Alert.alert("Erro", "Não foi possível fazer upload da foto."); return; }

      const { data: urlData } = supabase.storage.from("produtos").getPublicUrl(filePath);

      await supabase.from("users").update({ avatar_url: urlData.publicUrl }).eq("id", user?.id);

      Alert.alert("Sucesso", "Foto atualizada! Reinicie o app para ver a mudança.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAvatar(false);
    }
  }




  async function handleGerenciarUsuario() {
    router.push("/(admin)/perfil/usuarios")
  }

  const iniciais = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={[styles.pageTitle, { color: colors.text }]}>Perfil</Text>

        {/* Avatar + Info */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity onPress={handleAlterarFoto} style={styles.avatarContainer}>
            {loadingAvatar ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarIniciais}>{iniciais}</Text>
              </View>
            )}
            <View style={[styles.avatarEditBadge, { backgroundColor: colors.primary }]}>
              <Text style={{ color: "#fff", fontSize: 10 }}>✏️</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Gerenciar Usuários */}
        <TouchableOpacity
          style={[styles.gerenciarButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleGerenciarUsuario}
        >
          <Ionicons name="people-outline" size={24} color={colors.primary} />
          <Text style={[styles.gerenciarTexto, { color: colors.text }]}>Gerenciar Usuários</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.botaoLogout, { borderColor: colors.error }]}
          onPress={handleLogout}
        >
          <Text style={[styles.botaoLogoutTexto, { color: colors.error }]}>Sair do App</Text>
        </TouchableOpacity>

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24, alignItems: "center" },
  avatarContainer: { position: "relative", marginBottom: 12 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  avatarIniciais: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  avatarEditBadge: { position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 8 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  input: { width: "100%", height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, marginBottom: 12 },
  botao: { width: "100%", height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  botaoTexto: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  botaoLogout: { height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1.5, marginBottom: 40 },
  botaoLogoutTexto: { fontSize: 16, fontWeight: "600" },
  gerenciarButton: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 8, borderWidth: 1, gap: 12, marginBottom: 24 },
  gerenciarTexto: { flex: 1, fontSize: 16, fontWeight: "600" },
});