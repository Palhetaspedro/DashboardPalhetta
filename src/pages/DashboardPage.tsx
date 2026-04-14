import { useState, useEffect } from "react";
import { useApp, useTheme, fmt } from "../hooks/useApp";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Card, SectionLabel, Button } from "../components/ui";
import ProgressCircle from "../components/ProgressCircle";
import CountdownTimer from "../components/CountdownTimer";
import { OrderItem, SellerOrderItem } from "../components/OrderItem";
import { OrderStatus } from "../data/mockData";

interface Sale {
  id: string;
  product: string;
  specs: string;
  amount: number;
  status: string;
  thumb: string;
  created_at: string;
  seller_name?: string;
  buyer_name?: string;
}

export default function DashboardPage() {
  const { mode } = useApp();
  const theme = useTheme();
  const { user } = useAuth();
  const isBuyer = mode === "buyer";

  const [stats, setStats] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getSalesStats().catch(() => null),
      api.getSales().catch(() => ({ sales: [] })),
    ]).then(([s, r]) => {
      setStats(s);
      setRecentSales((r?.sales ?? []).slice(0, 5) as Sale[]);
    }).finally(() => setLoading(false));
  }, [mode, user?.id]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: 40, color: theme.textSecondary }}>Carregando...</div>;
  }

  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalSales = stats?.totalSales ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ── TOP ROW ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 18,
        }}
      >
        {/* Summary card */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <SectionLabel>{isBuyer ? "Gasto Mensal" : "Receita Mensal"}</SectionLabel>
              <h2
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  margin: "0 0 4px",
                  color: theme.textPrimary,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {fmt(totalRevenue)}
              </h2>
              {stats?.monthlyRevenue?.length ? (
                <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>
                  ▲ {stats.monthlyRevenue[0].total} este mês
                </span>
              ) : (
                <span style={{ fontSize: 12, color: theme.textSecondary }}>
                  Sem dados ainda
                </span>
              )}
            </div>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: "linear-gradient(135deg,#ede9fe,#dbeafe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              {isBuyer ? "🛍️" : "📦"}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 18,
              paddingTop: 16,
              borderTop: `1px solid ${theme.borderCol}`,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: theme.textSecondary }}>Pedidos</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary }}>{totalSales}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: theme.textSecondary }}>Ticket Médio</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary }}>
                {totalSales > 0 ? fmt(totalRevenue / totalSales) : "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: theme.textSecondary }}>Concluídos</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary }}>
                {stats?.byStatus?.filter((s: any) => s.status === "delivered" || s.status === "paid").reduce((a: number, s: any) => a + s.count, 0) ?? 0}
              </div>
            </div>
          </div>
        </Card>

        {/* Progress widget */}
        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <SectionLabel>{isBuyer ? "Score de Compra" : "Desempenho"}</SectionLabel>
          <ProgressCircle pct={isBuyer ? 78 : 91} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12.5, color: theme.textPrimary, fontWeight: 600 }}>
              {isBuyer ? "Comprador Ouro" : "Vendedor Elite"}
            </div>
            <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
              Top {isBuyer ? "22%" : "9%"} na plataforma
            </div>
          </div>
        </Card>

        {/* CTA / countdown */}
        {isBuyer ? (
          <div
            style={{
              background: "linear-gradient(145deg,#7c3aed,#2563eb)",
              borderRadius: 18,
              padding: 22,
              position: "relative",
              overflow: "hidden",
              color: "white",
            }}
          >
            <div
              style={{
                position: "absolute", top: -20, right: -20,
                width: 100, height: 100, borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <div
              style={{
                position: "absolute", bottom: -30, left: -10,
                width: 80, height: 80, borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
              }}
            />

            <p style={{ fontSize: 11.5, margin: "0 0 10px", opacity: 0.7, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Criar Pedido
            </p>

            <button
              style={{
                width: "100%",
                padding: "11px 0",
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: 12,
                color: "white",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                fontFamily: "inherit",
                letterSpacing: "0.03em",
                transition: "all 0.2s",
              }}
            >
              ＋ Criar Pedido
            </button>
          </div>
        ) : (
          <Card>
            <SectionLabel>Próxima Janela</SectionLabel>
            <CountdownTimer />
            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 10,
                background: theme.dark
                  ? "rgba(139,92,246,0.1)"
                  : "rgba(139,92,246,0.06)",
                border: `1px solid ${theme.borderCol}`,
              }}
            >
              <div style={{ fontSize: 12, color: theme.textSecondary }}>
                Pedidos disponíveis agora
              </div>
              <div
                style={{ fontSize: 24, fontWeight: 800, color: theme.textPrimary, marginTop: 2 }}
              >
                {recentSales.length}{" "}
                <span style={{ fontSize: 14, color: "#a78bfa", fontWeight: 500 }}>pedidos</span>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 11.5, color: theme.textSecondary }}>
              Volume total:{" "}
              <strong style={{ color: theme.textPrimary }}>
                {fmt(recentSales.reduce((a, o) => a + o.amount, 0))}
              </strong>
            </div>
          </Card>
        )}
      </div>

      {/* ── ORDERS ─────────────────────────────────────────────── */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <SectionLabel style={{ margin: 0 }}>
            {isBuyer ? "Pedidos Recentes" : "Pedidos Disponíveis"}
          </SectionLabel>
          <Button variant="outline" size="sm">Ver Todos →</Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recentSales.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: theme.textSecondary, fontSize: 14 }}>
              Nenhum pedido ainda. {isBuyer ? "Faça seu primeiro pedido!" : "Aguardando pedidos..."}
            </div>
          ) : (
            recentSales.map((o) => (
              <OrderItem key={o.id} order={{
                id: o.id,
                product: o.product,
                specs: o.specs,
                status: o.status as OrderStatus,
                price: o.amount,
                thumb: o.thumb || "📦",
                date: new Date(o.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
              }} />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
