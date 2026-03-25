import { ScreenContainer } from "@/components/ScreenContainer";
import { useTheme } from "@/hook/useTheme";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Periodo = "hoje" | "semana" | "mes";

interface Metricas {
  faturamento: number;
  totalPedidos: number;
  cancelados: number;
  faturamentoAnterior: number;
  totalPedidosAnterior: number;
}

interface StatusCount {
  entregue: number;
  preparando: number;
  cancelado: number;
}

interface ProdutoVendido {
  nome: string;
  quantidade: number;
}

interface PedidosPorHora {
  hora: number;
  total: number;
}

const { width } = Dimensions.get("window");
const BAR_WIDTH = (width - 32 - 28 - 16 * 9) / 10;

function getIntervalo(periodo: Periodo): { inicio: string; fimAnterior: string; inicioAnterior: string } {
  const agora = new Date();
  const fmt = (d: Date) => d.toISOString();

  if (periodo === "hoje") {
    const inicio = new Date(agora); inicio.setHours(0, 0, 0, 0);
    const inicioAnterior = new Date(inicio); inicioAnterior.setDate(inicio.getDate() - 1);
    const fimAnterior = new Date(inicio); fimAnterior.setMilliseconds(-1);
    return { inicio: fmt(inicio), fimAnterior: fmt(fimAnterior), inicioAnterior: fmt(inicioAnterior) };
  }
  if (periodo === "semana") {
    const inicio = new Date(agora); inicio.setDate(agora.getDate() - 7); inicio.setHours(0, 0, 0, 0);
    const inicioAnterior = new Date(inicio); inicioAnterior.setDate(inicio.getDate() - 7);
    const fimAnterior = new Date(inicio); fimAnterior.setMilliseconds(-1);
    return { inicio: fmt(inicio), fimAnterior: fmt(fimAnterior), inicioAnterior: fmt(inicioAnterior) };
  }
  const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const inicioAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
  const fimAnterior = new Date(inicio); fimAnterior.setMilliseconds(-1);
  return { inicio: fmt(inicio), fimAnterior: fmt(fimAnterior), inicioAnterior: fmt(inicioAnterior) };
}

function calcVariacao(atual: number, anterior: number): string {
  if (anterior === 0) return "";
  const pct = ((atual - anterior) / anterior) * 100;
  const sinal = pct >= 0 ? "+" : "";
  return `${sinal}${pct.toFixed(0)}%`;
}

export default function Relatorio() {
  const { colors } = useTheme();
  const [periodo, setPeriodo] = useState<Periodo>("hoje");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [metricas, setMetricas] = useState<Metricas>({
    faturamento: 0, totalPedidos: 0, cancelados: 0,
    faturamentoAnterior: 0, totalPedidosAnterior: 0,
  });
  const [statusCount, setStatusCount] = useState<StatusCount>({ entregue: 0, preparando: 0, cancelado: 0 });
  const [maisVendidos, setMaisVendidos] = useState<ProdutoVendido[]>([]);
  const [pedidosPorHora, setPedidosPorHora] = useState<PedidosPorHora[]>([]);

  const fetchDados = useCallback(async () => {
    const { inicio, inicioAnterior, fimAnterior } = getIntervalo(periodo);

    // Pedidos do período atual
    const { data: pedidos } = await supabase
      .from("pedidos")
      .select("id, status, total, created_at")
      .gte("created_at", inicio);

    // Pedidos do período anterior (para variação)
    const { data: pedidosAnt } = await supabase
      .from("pedidos")
      .select("total, status")
      .gte("created_at", inicioAnterior)
      .lte("created_at", fimAnterior);

    if (pedidos) {
      // ✅ FILTRA só entregues
      const pedidosEntregues = pedidos.filter((p) => p.status === "entregue");

      // ✅ FATURAMENTO CORRETO
      const faturamento = pedidosEntregues.reduce((s, p) => s + (p.total ?? 0), 0);

      const cancelados = pedidos.filter((p) => p.status === "cancelado").length;
      const entregue = pedidosEntregues.length;
      const preparando = pedidos.filter((p) => p.status === "preparando").length;

      // ⚠️ IMPORTANTE: pedidosAnt precisa ter status no select
      const pedidosAntEntregues = (pedidosAnt ?? []).filter((p: any) => p.status === "entregue");

      const faturamentoAnterior = pedidosAntEntregues.reduce((s, p) => s + (p.total ?? 0), 0);
      const totalPedidosAnterior = pedidosAnt?.length ?? 0;

      setMetricas({
        faturamento,
        totalPedidos: pedidos.length,
        cancelados,
        faturamentoAnterior,
        totalPedidosAnterior
      });

      setStatusCount({ entregue, preparando, cancelado: cancelados });

      // Pedidos por hora (NÃO MEXE — já está certo)
      if (periodo === "hoje") {
        const horas: Record<number, number> = {};
        pedidos.forEach((p) => {
          const h = new Date(p.created_at).getHours();
          horas[h] = (horas[h] ?? 0) + 1;
        });

        if (Object.keys(horas).length > 0) {
          const horasExistentes = Object.keys(horas).map(Number).sort((a, b) => a - b);
          const min = horasExistentes[0];
          const max = horasExistentes[horasExistentes.length - 1];
          const horasArr: PedidosPorHora[] = Array.from(
            { length: max - min + 1 },
            (_, i) => ({ hora: min + i, total: horas[min + i] ?? 0 })
          );
          setPedidosPorHora(horasArr);
        } else {
          setPedidosPorHora([]);
        }
      } else {
        setPedidosPorHora([]);
      }
    }

    // Mais vendidos via pedido_itens
    const ids = (pedidos ?? []).map((p) => p.id);
    if (ids.length > 0) {
      const { data: itens } = await supabase
        .from("pedido_itens")
        .select("produto_id, quantidade, produtos(nome)")
        .in("pedido_id", ids);

      if (itens) {
        const agrupado: Record<string, { nome: string; quantidade: number }> = {};
        itens.forEach((item: any) => {
          const nome = item.produtos?.nome ?? "Produto";
          if (!agrupado[item.produto_id]) agrupado[item.produto_id] = { nome, quantidade: 0 };
          agrupado[item.produto_id].quantidade += item.quantidade ?? 0;
        });
        const ranking = Object.values(agrupado)
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 5);
        setMaisVendidos(ranking);
      }
    } else {
      setMaisVendidos([]);
    }
  }, [periodo]);

  useEffect(() => {
    setLoading(true);
    fetchDados().finally(() => setLoading(false));
  }, [fetchDados]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDados();
    setRefreshing(false);
  };

  const maxHora = Math.max(...pedidosPorHora.map((h) => h.total), 1);
  const maxVendido = Math.max(...maisVendidos.map((p) => p.quantidade), 1);
  const totalStatus = statusCount.entregue + statusCount.preparando + statusCount.cancelado;
  const pct = (n: number) => totalStatus > 0 ? Math.round((n / totalStatus) * 100) : 0;

  const varFaturamento = calcVariacao(metricas.faturamento, metricas.faturamentoAnterior);
  const varPedidos = calcVariacao(metricas.totalPedidos, metricas.totalPedidosAnterior);
  const pctCancelados = metricas.totalPedidos > 0
    ? ((metricas.cancelados / metricas.totalPedidos) * 100).toFixed(1)
    : "0";

  const s = styles(colors);

  return (
    <ScreenContainer>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.pageTitle}>Relatórios</Text>
            <Text style={s.pageSub}>Distribuidora de Bebidas</Text>
          </View>
          <View style={s.dateBadge}>
            <Text style={s.dateDay}>{new Date().getDate()}</Text>
            <Text style={s.dateMonth}>
              {new Date().toLocaleString("pt-BR", { month: "short" }).toUpperCase().replace(".", "")}
            </Text>
          </View>
        </View>

        {/* Filtros */}
        <View style={s.filterRow}>
          {(["hoje", "semana", "mes"] as Periodo[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[s.chip, periodo === p && s.chipActive]}
              onPress={() => setPeriodo(p)}
            >
              <Text style={[s.chipText, periodo === p && s.chipTextActive]}>
                {p === "hoje" ? "Hoje" : p === "semana" ? "Semana" : "Mês"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Métricas */}
            <View style={s.metricsRow}>
              <View style={s.metricCard}>
                <Text style={s.metricLabel}>Faturamento</Text>
                <Text style={s.metricVal}>
                  R$ {metricas.faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </Text>
                {varFaturamento ? (
                  <Text style={[s.metricSub, { color: metricas.faturamento >= metricas.faturamentoAnterior ? colors.success : colors.error }]}>
                    {varFaturamento}
                  </Text>
                ) : null}
              </View>

              <View style={s.metricCard}>
                <Text style={s.metricLabel}>Pedidos</Text>
                <Text style={s.metricVal}>{metricas.totalPedidos}</Text>
                {varPedidos ? (
                  <Text style={[s.metricSub, { color: metricas.totalPedidos >= metricas.totalPedidosAnterior ? colors.success : colors.error }]}>
                    {varPedidos}
                  </Text>
                ) : null}
              </View>

              <View style={s.metricCard}>
                <Text style={s.metricLabel}>Cancelados</Text>
                <Text style={[s.metricVal, { color: colors.error }]}>{metricas.cancelados}</Text>
                <Text style={[s.metricSub, { color: colors.error }]}>{pctCancelados}%</Text>
              </View>
            </View>

            <View style={s.divider} />

            {/* Gráfico por hora (só no "hoje") */}
            {periodo === "hoje" && (
              <>
                <Text style={s.sectionTitle}>Pedidos por hora</Text>
                <View style={s.chartCard}>
                  <View style={s.chartBars}>
                    {pedidosPorHora.map((item) => (
                      <View key={item.hora} style={s.barCol}>
                        <View
                          style={[
                            s.barFill,
                            {
                              height: Math.max((item.total / maxHora) * 80, 4),
                              backgroundColor: item.total === Math.max(...pedidosPorHora.map(h => h.total))
                                ? colors.primary
                                : item.total > maxHora * 0.5
                                  ? colors.accent
                                  : colors.border + "55",
                            },
                          ]}
                        />
                        <Text style={s.barHora}>{item.hora}h</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={s.divider} />
              </>
            )}

            {/* Status dos pedidos */}
            <Text style={s.sectionTitle}>Status dos pedidos</Text>
            <View style={s.statusGrid}>
              {[
                { label: "Entregue", valor: statusCount.entregue, cor: colors.success },
                { label: "Preparando", valor: statusCount.preparando, cor: "#fbbf24" },
                { label: "Cancelado", valor: statusCount.cancelado, cor: colors.error },
              ].map((item) => (
                <View key={item.label} style={s.statusCard}>
                  <View style={[s.statusDot, { backgroundColor: item.cor }]} />
                  <Text style={s.statusVal}>{item.valor}</Text>
                  <Text style={s.statusLabel}>{item.label}</Text>
                  <Text style={[s.statusPct, { color: item.cor }]}>{pct(item.valor)}%</Text>
                </View>
              ))}
            </View>

            <View style={s.divider} />

            {/* Mais vendidos */}
            <Text style={s.sectionTitle}>Mais vendidos</Text>
            {maisVendidos.length === 0 ? (
              <Text style={s.emptyText}>Nenhum dado disponível</Text>
            ) : (
              maisVendidos.map((produto, i) => (
                <View key={i} style={s.prodRow}>
                  <Text style={s.prodLabel} numberOfLines={1}>{produto.nome}</Text>
                  <View style={s.prodTrack}>
                    <View
                      style={[
                        s.prodBar,
                        {
                          width: `${(produto.quantidade / maxVendido) * 100}%`,
                          backgroundColor: i === 0 ? colors.primary : i === 1 ? colors.primary : colors.accent,
                        },
                      ]}
                    />
                  </View>
                  <Text style={s.prodQty}>{produto.quantidade} un.</Text>
                </View>
              ))
            )}

            <View style={{ height: 32 }} />
          </>
        )}
      </ScrollView>
    </ScreenContainer>

  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 16 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    pageTitle: { fontSize: 24, fontWeight: "800", color: colors.text },
    pageSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    dateBadge: { backgroundColor: colors.secondary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: "center" },
    dateDay: { fontSize: 18, fontWeight: "800", color: "#fff", lineHeight: 20 },
    dateMonth: { fontSize: 10, color: colors.accent, fontWeight: "700", letterSpacing: 1 },
    filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
    chip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: colors.border },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: 12, fontWeight: "700", color: colors.secondary },
    chipTextActive: { color: "#fff" },
    metricsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
    metricCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border + "44" },
    metricLabel: { fontSize: 9, color: colors.textSecondary, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 },
    metricVal: { fontSize: 16, fontWeight: "800", color: colors.text },
    metricSub: { fontSize: 10, fontWeight: "700", marginTop: 2 },
    divider: { height: 1, backgroundColor: colors.border + "44", marginVertical: 16 },
    sectionTitle: { fontSize: 15, fontWeight: "800", color: colors.text, marginBottom: 12 },
    chartCard: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border + "44", padding: 14, marginBottom: 4 },
    chartBars: { flexDirection: "row", alignItems: "flex-end", height: 80, gap: 6 },
    barCol: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
    barFill: { width: "100%", borderRadius: 4 },
    barHora: { fontSize: 8, color: colors.textSecondary, marginTop: 4, fontWeight: "600" },
    statusGrid: { flexDirection: "row", gap: 8, marginBottom: 4 },
    statusCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: colors.border + "44" },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 6 },
    statusVal: { fontSize: 20, fontWeight: "800", color: colors.text },
    statusLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: "600", marginTop: 2 },
    statusPct: { fontSize: 11, fontWeight: "700", marginTop: 2 },
    prodRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    prodLabel: { fontSize: 12, color: colors.textSecondary, width: 80, textAlign: "right" },
    prodTrack: { flex: 1, backgroundColor: colors.border + "44", borderRadius: 4, height: 9, overflow: "hidden" },
    prodBar: { height: 9, borderRadius: 4 },
    prodQty: { fontSize: 11, fontWeight: "700", color: colors.text, width: 48, textAlign: "right" },
    emptyText: { fontSize: 13, color: colors.textSecondary, textAlign: "center", marginVertical: 16 },
  });