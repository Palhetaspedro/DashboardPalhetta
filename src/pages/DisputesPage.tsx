import { useState, useEffect } from "react";
import { useTheme } from "../hooks/useApp";
import { api } from "../services/api";
import { Card, SectionLabel, Button, StatusBadge } from "../components/ui";
import { DisputeStatus } from "../data/mockData";

interface Dispute {
  id: string;
  product: string;
  status: DisputeStatus;
  created_at: string;
  reason: string;
  user_name: string;
  order_product?: string;
}

function DisputeCard({ d, onDelete }: { d: Dispute; onDelete: (id: string) => void }) {
  const theme = useTheme();
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov
          ? theme.dark ? "rgba(40,35,80,0.9)" : "rgba(255,255,255,0.95)"
          : theme.cardBg,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid rgba(248,113,113,${hov ? 0.25 : 0.15})`,
        borderRadius: 14,
        padding: "16px 18px",
        transition: "all 0.22s ease",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov
          ? "0 8px 28px rgba(248,113,113,0.12)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: theme.textPrimary }}>{d.order_product || "Disputa"}</div>
          <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 3 }}>#{d.id.slice(0, 8)}</div>
        </div>
        <StatusBadge status={d.status} />
      </div>

      <div
        style={{
          padding: "8px 12px",
          background: theme.dark ? "rgba(248,113,113,0.08)" : "rgba(248,113,113,0.06)",
          borderRadius: 8,
          fontSize: 12.5,
          color: theme.textPrimary,
          marginBottom: 12,
        }}
      >
        {d.reason}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11.5, color: theme.textSecondary }}>
          🗓 {new Date(d.created_at).toLocaleDateString("pt-BR")}
        </span>
        <Button variant="ghost" size="sm" onClick={() => onDelete(d.id)} style={{ color: "#f87171" }}>
          Remover
        </Button>
      </div>
    </div>
  );
}

export default function DisputesPage() {
  const theme = useTheme();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newReason, setNewReason] = useState("");

  useEffect(() => {
    api.getDisputes()
      .then(({ disputes: d }) => setDisputes(d as Dispute[]))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDispute(id);
      setDisputes((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    if (!newReason.trim() || newReason.length < 3) {
      setError("Motivo deve ter ao menos 3 caracteres");
      return;
    }
    try {
      const { dispute } = await api.createDispute({ reason: newReason });
      setDisputes((prev) => [dispute, ...prev]);
      setNewReason("");
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const open = disputes.filter((d) => d.status === "open");
  const review = disputes.filter((d) => d.status === "review");
  const resolved = disputes.filter((d) => d.status === "resolved");

  if (loading) {
    return <div style={{ textAlign: "center", padding: 40, color: theme.textSecondary }}>Carregando...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>
            Disputas
          </h1>
          <p style={{ fontSize: 13, color: theme.textSecondary, margin: "4px 0 0" }}>
            {disputes.length} disputas no total · {open.length} abertas
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: 12.5 }}>
          {error}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { label: "Abertas",     value: open.length,     icon: "🔴", color: "#f87171" },
          { label: "Em Análise",  value: review.length,   icon: "🟡", color: "#fbbf24" },
          { label: "Resolvidas",  value: resolved.length, icon: "🟢", color: "#4ade80" },
        ].map((s) => (
          <Card key={s.label} hover style={{ padding: 18 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* New dispute form */}
      <Card>
        <SectionLabel>Abrir Nova Disputa</SectionLabel>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            placeholder="Descreva o motivo da disputa..."
            style={{
              flex: 1,
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
          <Button variant="primary" onClick={handleCreate}>Criar Disputa</Button>
        </div>
      </Card>

      {/* Open disputes */}
      {open.length > 0 && (
        <Card>
          <SectionLabel>Abertas</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
            {open.map((d) => <DisputeCard key={d.id} d={d} onDelete={handleDelete} />)}
          </div>
        </Card>
      )}

      {/* In review */}
      {review.length > 0 && (
        <Card>
          <SectionLabel>Em Análise</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
            {review.map((d) => <DisputeCard key={d.id} d={d} onDelete={handleDelete} />)}
          </div>
        </Card>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <Card>
          <SectionLabel>Resolvidas</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
            {resolved.map((d) => <DisputeCard key={d.id} d={d} onDelete={handleDelete} />)}
          </div>
        </Card>
      )}

      {disputes.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: theme.textSecondary, fontSize: 14 }}>
          Nenhuma disputa encontrada
        </div>
      )}
    </div>
  );
}
