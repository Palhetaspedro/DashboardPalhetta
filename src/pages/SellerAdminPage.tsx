import { useState, useEffect } from "react";
import { useTheme, fmt } from "../hooks/useApp";
import { useAuth } from "../context/AuthContext";
import { Card, SectionLabel, Button } from "../components/ui";
import { getSales, getSalesStats, Sale } from "../data/sales";

export default function SellerAdminPage() {
  const theme = useTheme();
  const { user } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSalesStats().catch(() => null),
      getSales().catch(() => ({ sales: [] })),
    ]).then(([s, r]) => {
      setStats(s);
      setSales(r?.sales ?? []);
    }).finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: 40, color: theme.textSecondary }}>Carregando...</div>;
  }

  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalSales = sales.length;
  const delivered = sales.filter((s) => s.status === "delivered").length;
  const pending = sales.filter((s) => s.status === "pending").length;
  const processing = sales.filter((s) => s.status === "processing").length;
  const shipped = sales.filter((s) => s.status === "shipped").length;

  const statusCards = [
    { label: "Pedidos Pendentes", value: `${pending}`, icon: "⏳", color: "#fbbf24" },
    { label: "Em Processamento", value: `${processing}`, icon: "⚙️", color: "#fb923c" },
    { label: "Enviados", value: `${shipped}`, icon: "🚚", color: "#60a5fa" },
    { label: "Concluídos", value: `${delivered}`, icon: "✅", color: "#4ade80" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>
            Painel do Vendedor
          </h1>
          <p style={{ fontSize: 13, color: theme.textSecondary, margin: "4px 0 0" }}>
            Métricas e gestão dos seus pedidos
          </p>
        </div>
      </div>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { label: "Receita Total", value: fmt(totalRevenue), icon: "💰", color: "#a78bfa" },
          { label: "Total de Pedidos", value: `${totalSales}`, icon: "📦", color: "#60a5fa" },
          { label: "Taxa de Conclusão", value: totalSales > 0 ? `${Math.round((delivered / totalSales) * 100)}%` : "—", icon: "🏆", color: "#4ade80" },
        ].map((s) => (
          <Card key={s.label} hover style={{ padding: 18 }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Status breakdown */}
      <Card>
        <SectionLabel>Status dos Pedidos</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {statusCards.map((s) => (
            <div
              key={s.label}
              style={{
                padding: 16,
                borderRadius: 14,
                background: theme.dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                border: `1px solid ${theme.borderCol}`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent orders management */}
      <Card>
        <SectionLabel>Pedidos Recentes</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sales.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: theme.textSecondary, fontSize: 14 }}>
              Nenhum pedido ainda
            </div>
          ) : (
            sales.slice(0, 10).map((o) => (
              <div
                key={o.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: theme.dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.015)",
                  border: `1px solid ${theme.borderCol}`,
                }}
              >
                <span style={{ fontSize: 24 }}>{o.thumb || "📦"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary }}>
                    {o.product}
                  </div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>
                    {o.specs}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: 20,
                    whiteSpace: "nowrap",
                    ...(o.status === "pending"
                      ? { color: "#fbbf24", background: "rgba(251,191,36,0.12)" }
                      : o.status === "paid"
                      ? { color: "#4ade80", background: "rgba(74,222,128,0.12)" }
                      : o.status === "processing"
                      ? { color: "#fb923c", background: "rgba(251,146,60,0.12)" }
                      : o.status === "shipped"
                      ? { color: "#60a5fa", background: "rgba(96,165,250,0.12)" }
                      : o.status === "delivered"
                      ? { color: "#22c55e", background: "rgba(34,197,94,0.12)" }
                      : { color: "#f87171", background: "rgba(248,113,113,0.12)" }),
                  }}
                >
                  {{ pending: "Pendente", paid: "Pago", processing: "Processando", shipped: "Enviado", delivered: "Entregue", cancelled: "Cancelado", refunded: "Reembolsado" }[o.status] || o.status}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: theme.textPrimary, whiteSpace: "nowrap" }}>
                  {fmt(o.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
