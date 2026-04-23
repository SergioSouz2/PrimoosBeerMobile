import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hook/useTheme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Pedido {
  id: string;
  status: "preparando" | "entregue" | "cancelado";
  total: number;
  created_at: string;
}

export default function Perfil() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function carregarPedidos() {
    setLoading(true);
    const { data } = await supabase
      .from("pedidos")
      .select("id, status, total, created_at")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(20);

    setPedidos(data ?? []);
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await carregarPedidos();
    setRefreshing(false);
  }

  useFocusEffect(
    useCallback(() => {
      carregarPedidos();
    }, [])
  );

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "entregue": return colors.success;
      case "preparando": return colors.accent;
      case "cancelado": return colors.error;
      default: return colors.textSecondary;
    }
  };

  const iniciais = user?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  const s = styles(colors);

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={s.pageTitle}>Perfil</Text>

        {/* Avatar + info */}
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={s.avatar} />
          ) : (
            <View style={[s.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={s.avatarIniciais}>{iniciais}</Text>
            </View>
          )}
          <Text style={[s.userName, { color: colors.textPrimary }]}>{user?.name}</Text>
          <Text style={[s.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        {/* Histórico de pedidos */}
        <Text style={s.sectionTitle}>Meus pedidos</Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : pedidos.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>
              Você ainda não fez nenhum pedido
            </Text>
          </View>
        ) : (
          <FlatList
            data={pedidos}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => {
              const data = new Date(item.created_at);
              const dataFormatada = data.toLocaleDateString("pt-BR");
              const hora = `${String(data.getHours()).padStart(2, "0")}:${String(data.getMinutes()).padStart(2, "0")}`;

              return (
                <View style={[s.pedidoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={s.pedidoHeader}>
                    <Text style={[s.pedidoId, { color: colors.textPrimary }]}>
                      #{item.id.slice(0, 8).toUpperCase()}
                    </Text>
                    <View style={[s.statusBadge, { backgroundColor: getStatusColor(item.status) + "22" }]}>
                      <Text style={[s.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={s.pedidoFooter}>
                    <Text style={[s.pedidoData, { color: colors.textSecondary }]}>
                      {dataFormatada} às {hora}
                    </Text>
                    <Text style={[s.pedidoTotal, { color: colors.primary }]}>
                      R$ {item.total.toFixed(2).replace(".", ",")}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Logout */}
        <TouchableOpacity
          style={[s.btnLogout, { borderColor: colors.error }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[s.btnLogoutText, { color: colors.error }]}>Sair do app</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    pageTitle: { fontSize: 24, fontWeight: "800", color: colors.textPrimary, marginBottom: 16 },
    card: { borderRadius: 16, borderWidth: 1, padding: 20, alignItems: "center", marginBottom: 24 },
    avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    avatarIniciais: { fontSize: 28, fontWeight: "800", color: "#fff" },
    userName: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
    userEmail: { fontSize: 14 },
    sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary, marginBottom: 12 },
    empty: { alignItems: "center", gap: 10, marginTop: 24, marginBottom: 24 },
    emptyText: { fontSize: 14, textAlign: "center" },
    pedidoCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
    pedidoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    pedidoId: { fontSize: 15, fontWeight: "700" },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: "700" },
    pedidoFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    pedidoData: { fontSize: 12 },
    pedidoTotal: { fontSize: 16, fontWeight: "800" },
    btnLogout: { height: 52, borderRadius: 12, borderWidth: 1.5, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24 },
    btnLogoutText: { fontSize: 15, fontWeight: "700" },
  });