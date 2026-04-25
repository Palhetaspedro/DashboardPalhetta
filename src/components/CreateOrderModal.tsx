import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme, fmt } from "../hooks/useApp";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui";
import { createSale } from "../data/sales";

const PRODUCTS = [
  { name: "Sony A7 IV",        specs: "33MP · Full-Frame · 4K60fps · Wi-Fi 6",        price: 19_490, category: "Câmeras",      emoji: "📷" },
  { name: "MacBook Pro M4",    specs: "16GB · 512GB · 14'' · ProMotion 120Hz",         price: 18_999, category: "Computadores", emoji: "💻" },
  { name: "iPhone 16 Pro",     specs: "256GB · Titânio · A18 Pro · Camera 48MP",       price:  9_299, category: "Mobile",       emoji: "📱" },
  { name: "DJI Air 3S",        specs: "4K · 46min · Obstacle Avoidance",               price:  7_890, category: "Câmeras",      emoji: "🚁" },
  { name: "Sony WH-1000XM6",   specs: "ANC · 40h · Hi-Res · Bluetooth 5.3",           price:  2_199, category: "Áudio",        emoji: "🎧" },
  { name: "Samsung OLED S95D", specs: '55" · 4K · 144Hz · Neural Quantum',            price: 14_990, category: "TV & Vídeo",   emoji: "📺" },
  { name: "iPad Pro M4",       specs: '13" · 256GB · OLED · Apple Pencil Pro',         price: 12_490, category: "Mobile",       emoji: "📲" },
  { name: "DJI Osmo Pocket 4", specs: "4K120 · 3-Axis · Micro Sensor",                price:  4_299, category: "Câmeras",      emoji: "📸" },
];

const CATEGORIES = ["Todos", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];

export default function CreateOrderModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const theme = useTheme();
  const { user } = useAuth();

  const [step, setStep] = useState<"select" | "confirm">("select");
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof PRODUCTS[0] | null>(null);
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ✅ Bloqueia scroll do body enquanto modal está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const filtered = PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Todos" || p.category === category;
    return matchSearch && matchCat;
  });

  const reset = () => {
    setSelected(null);
    setQty(1);
    setStep("select");
    setSearch("");
    setCategory("Todos");
    setError("");
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!selected || !user) return;
    setSubmitting(true);
    setError("");
    try {
      await createSale({
        product: selected.name,
        specs: selected.specs,
        amount: selected.price * qty,
        status: "pending",
        thumb: selected.emoji,
        seller_id: "",
        buyer_id: user.id,
        seller_name: "",
        buyer_name: user.name,
      });
      reset();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const modalBg = theme.dark ? "rgba(30,27,63,0.97)" : "rgba(255,255,255,0.97)";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 10,
    border: `1px solid ${theme.borderCol}`,
    background: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    color: theme.textPrimary,
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  // ✅ createPortal garante que o modal é renderizado direto no <body>,
  //    escapando de qualquer stacking context do layout (footer, sidebar, etc.)
  return createPortal(
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        // ✅ zIndex altíssimo — fica acima de tudo
        zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          // ✅ maxHeight + overflowY: scroll interno no painel
          maxHeight: "88vh",
          overflowY: "auto",
          background: modalBg,
          borderRadius: 20,
          padding: 28,
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          position: "relative",
          zIndex: 10000,
        }}
      >
        {step === "select" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: theme.textPrimary }}>
              Criar Pedido
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: theme.textSecondary }}>
              Selecione um produto para criar seu pedido.
            </p>

            {/* Search */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto..."
              style={inputStyle}
            />

            {/* Category filter */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    background: category === cat ? "linear-gradient(135deg,#7c3aed,#3b82f6)" : "transparent",
                    color: category === cat ? "white" : theme.textSecondary,
                    border: `1px solid ${category === cat ? "transparent" : theme.borderCol}`,
                    borderRadius: 8,
                    padding: "4px 12px",
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((p) => {
                const isSel = selected?.name === p.name;
                return (
                  <div
                    key={p.name}
                    onClick={() => { setSelected(p); setQty(1); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      borderRadius: 12,
                      cursor: "pointer",
                      background: isSel
                        ? "rgba(124,58,237,0.12)"
                        : theme.dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                      border: `1px solid ${isSel ? "rgba(124,58,237,0.3)" : theme.borderCol}`,
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{p.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: theme.textPrimary }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                        {p.specs}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: theme.textPrimary }}>
                        {fmt(p.price)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: 20, color: theme.textSecondary, fontSize: 13 }}>
                  Nenhum produto encontrado
                </div>
              )}
            </div>

            {/* Quantity */}
            {selected && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 600 }}>QTD:</span>
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    border: `1px solid ${theme.borderCol}`,
                    background: "transparent", color: theme.textPrimary,
                    fontSize: 16, cursor: "pointer", fontFamily: "inherit", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >−</button>
                <span style={{ fontSize: 15, fontWeight: 700, color: theme.textPrimary, minWidth: 20, textAlign: "center" }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    border: `1px solid ${theme.borderCol}`,
                    background: "transparent", color: theme.textPrimary,
                    fontSize: 16, cursor: "pointer", fontFamily: "inherit", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >＋</button>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#a78bfa", marginLeft: "auto" }}>
                  Total: {fmt(selected.price * qty)}
                </span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <Button variant="primary" fullWidth size="md" onClick={() => selected && setStep("confirm")}>
                Continuar
              </Button>
              <Button variant="outline" size="md" onClick={handleClose}>Cancelar</Button>
            </div>
          </div>
        ) : (
          /* Confirmation step */
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: theme.textPrimary }}>
              Confirmar Pedido
            </h3>

            {selected && (
              <div
                style={{
                  padding: 16, borderRadius: 14,
                  background: theme.dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                  border: `1px solid ${theme.borderCol}`,
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 36 }}>{selected.emoji}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: theme.textPrimary }}>
                      {selected.name}
                    </div>
                    <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                      {selected.specs}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: theme.textSecondary }}>
                  <span>Quantidade: {qty}</span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: theme.textPrimary }}>
                    {fmt(selected.price * qty)}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <span style={{ fontSize: 13, color: "#f87171", textAlign: "center" }}>{error}</span>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={handleSubmit}
                style={submitting ? { opacity: 0.6, cursor: "wait" } : undefined}
              >
                {submitting ? "Criando..." : "Confirmar Pedido"}
              </Button>
              <Button variant="outline" size="md" onClick={() => setStep("select")}>Voltar</Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    // ✅ Renderiza direto no document.body — fora de qualquer hierarquia de layout
    document.body
  );
}