import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hook/useTheme";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Promocao {
  id: string;
  titulo: string;
  descricao: string | null;
  foto_url: string | null;
  cor: string | null;
}

const { width, height } = Dimensions.get("window");

export default function Inicio() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [indexAtivo, setIndexAtivo] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function carregarPromocoes() {
    setLoading(true);
    const { data } = await supabase
      .from("promocoes")
      .select("id, titulo, descricao, foto_url, cor")
      .eq("ativo", true)
      .order("created_at", { ascending: false });

    setPromocoes(data ?? []);
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    const { data } = await supabase
      .from("promocoes")
      .select("id, titulo, descricao, foto_url, cor")
      .eq("ativo", true)
      .order("created_at", { ascending: false });

    setPromocoes(data ?? []);
    setIndexAtivo(0);
    flatListRef.current?.scrollToIndex({ index: 0, animated: false });
    setRefreshing(false);
  }

  useFocusEffect(
    useCallback(() => {
      carregarPromocoes();
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (promocoes.length <= 1) return;

      intervalRef.current = setInterval(() => {
        setIndexAtivo((prev) => {
          const proximo = (prev + 1) % promocoes.length;
          flatListRef.current?.scrollToIndex({ index: proximo, animated: true });
          return proximo;
        });
      }, 4000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [promocoes])
  );

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndexAtivo(index);
  }

  const primeiroNome = user?.name?.split(" ")[0] ?? "você";
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={["#C4452D"]}
          />
        }
        scrollEnabled={promocoes.length === 0 || loading}
      >
        {promocoes.length === 0 && !loading ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhuma promoção ativa no momento.{"\n"}Puxe para baixo para atualizar.
            </Text>
          </View>
        ) : (
          <>
            {/* Carrossel fullscreen */}
            <FlatList
              ref={flatListRef}
              data={promocoes}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#fff"
                  colors={["#C4452D"]}
                />
              }
              renderItem={({ item }) => (
                <View style={styles.slide}>
                  {item.foto_url ? (
                    <Image
                      source={{ uri: item.foto_url }}
                      style={styles.imagem}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.imagem, { backgroundColor: item.cor ?? colors.primary }]} />
                  )}
                  <View style={styles.gradienteRodape} />
                  <View style={[styles.textoRodape, { paddingBottom: insets.bottom + 80 }]}>
                    <Text style={styles.tituloPromo}>{item.titulo}</Text>
                    {item.descricao ? (
                      <Text style={styles.descPromo} numberOfLines={2}>{item.descricao}</Text>
                    ) : null}
                  </View>
                </View>
              )}
            />

            {/* Saudação no topo */}
            <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]}>
              <View style={styles.gradienteTopo} />
              <Text style={styles.saudacaoText}>{saudacao},</Text>
              <Text style={styles.nomeText}>{primeiroNome} 👋</Text>
            </View>

            {/* Dots */}
            {promocoes.length > 1 && (
              <View style={[styles.dots, { bottom: insets.bottom + 56 }]}>
                {promocoes.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: i === indexAtivo ? "#fff" : "rgba(255,255,255,0.4)",
                        width: i === indexAtivo ? 20 : 8,
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyText: { fontSize: 15, textAlign: "center" },
  slide: { width, height },
  imagem: { width: "100%", height: "100%" },
  gradienteRodape: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  gradienteTopo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  textoRodape: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  tituloPromo: { fontSize: 26, fontWeight: "800", color: "#fff", marginBottom: 6 },
  descPromo: { fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 22 },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  saudacaoText: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "400" },
  nomeText: { fontSize: 24, color: "#fff", fontWeight: "800" },
  dots: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: { height: 8, borderRadius: 4 },
});