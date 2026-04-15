import { useState, useEffect } from "react";
import { useApp, useTheme, fmt } from "../hooks/useApp";
import { useAuth } from "../context/AuthContext";
import { Card, SectionLabel, Button, StatusBadge } from "../components/ui";
import { OrderItem, SellerOrderItem } from "../components/OrderItem";
import { OrderStatus } from "../data/mockData";
import { getSales, updateSale, Sale } from "../data/sales";
import CreateOrderModal from "../components/CreateOrderModal";

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "Todos",       value: ""        },
  { label: "Pendente",    value: "pending"       },
  { label: "Pago",        value: "paid"       },
  { label: "Processando", value: "processing" },
  { label: "Enviado",     value: "shipped"    },
  { label: "Entregue",    value: "delivered"  },
  { label: "Cancelado",   value: "cancelled"  },
];

export default function OrdersPage() {
  const { showCreateOrder, openCreateOrder, closeCreateOrder } = useApp();
  const theme = useTheme();
  const { user } = useAuth();
  const isBuyerView = user?.role === "buyer";

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSales();
  }, [filter, user?.id, user?.role]);

  const loadSales = () => {
    setLoading(true);
    getSales(filter || undefined)
      .then(({ sales: s }) => setSales(s))
      .catch((err: unknown) => setError(String(err)))
      .finally(() => setLoading(false));
  };

  const filtered = sales.filter((o) =>
    o.product.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateSale(id, { status: newStatus });
      setSales((prev) => prev.map((s) => s.id === id ? { ...s, status: newStatus as any } : s));
    } catch (err: unknown) {
      setError(String(err));
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: 40, color: theme.textSecondary }}>Carregando...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>
            {isBuyerView ? "Meus Pedidos" : "Pedidos Disponíveis"}
          </h1>
          <p style={{ fontSize: 13, color: theme.textSecondary, margin: "4px 0 0" }}>
            {isBuyerView
              ? `${filtered.length} pedidos encontrados`
              : `${filtered.length} pedidos aguardando`}
          </p>
        </div>
        {error && <span style={{ color: "#f87171", fontSize: 13 }}>{error}</span>}
        {isBuyerView && (
          <Button variant="primary" onClick={openCreateOrder}>＋ Novo Pedido</Button>
        )}
      </div>

      {isBuyerView ? (
        <>
          {/* Search + Filters */}
          <Card style={{ padding: "14px 18px" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar pedido ou produto..."
                style={{
                  flex: 1,
                  minWidth: 200,
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: `1px solid ${theme.borderCol}`,
                  background: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                  color: theme.textPrimary,
                  fontSize: 13,
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    style={{
                      background:
                        filter === tab.value
                          ? "linear-gradient(135deg,#7c3aed,#3b82f6)"
                          : "transparent",
                      color: filter === tab.value ? "white" : theme.textSecondary,
                      border: `1px solid ${filter === tab.value ? "transparent" : theme.borderCol}`,
                      borderRadius: 8,
                      padding: "6px 14px",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Orders list */}
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: theme.textSecondary }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <div style={{ fontSize: 14 }}>Nenhum pedido encontrado</div>
                </div>
              ) : (
                filtered.map((o) => (
                  <div key={o.id} style={{ position: "relative" }}>
                    <OrderItem order={{
                      id: o.id,
                      product: o.product,
                      specs: o.specs,
                      status: o.status as OrderStatus,
                      price: o.amount,
                      thumb: o.thumb || "📦",
                      date: new Date(o.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
                    }} />
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Summary row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { label: "Total Gasto",   value: fmt(filtered.reduce((a, o) => a + o.amount, 0)), icon: "💰", color: "#a78bfa" },
              { label: "Em Andamento",  value: `${filtered.filter((o) => o.status === "pending" || o.status === "processing").length} pedidos`,  icon: "🔄", color: "#60a5fa" },
              { label: "Concluídos",    value: `${filtered.filter((o) => o.status === "delivered" || o.status === "paid").length} pedidos`, icon: "✅", color: "#4ade80" },
            ].map((s) => (
              <Card key={s.label} hover style={{ padding: 18 }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{s.label}</div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        /* Seller view */
        <Card>
          <SectionLabel>Pedidos Disponíveis para Aceite</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: theme.textSecondary }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                <div style={{ fontSize: 14 }}>Nenhum pedido disponível</div>
              </div>
            ) : (
              filtered.map((o) => (
                <SellerOrderItem key={o.id} order={{
                  id: o.id,
                  product: o.product,
                  specs: o.specs,
                  location: o.buyer_name || "—",
                  delivery: "—",
                  price: o.amount,
                  thumb: o.thumb || "📦",
                  urgency: "medium",
                }} />
              ))
            )}
          </div>
        </Card>
      )}

      {/* Create Order Modal */}
      <CreateOrderModal
        open={showCreateOrder}
        onClose={closeCreateOrder}
        onSuccess={loadSales}
      />
    </div>
  );
}
