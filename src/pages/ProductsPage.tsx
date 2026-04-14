import { useState } from "react";
import { useTheme, fmt } from "../hooks/useApp";
import { Card, SectionLabel, Button } from "../components/ui";
import { FEATURED_PRODUCTS } from "../data/mockData";

// Expand the product catalog for this page
const ALL_PRODUCTS = [
  ...FEATURED_PRODUCTS,
  { name: "Sony WH-1000XM6", emoji: "🎧", price: 2_199, oldPrice: 2_799, specs: "ANC · 40h · Hi-Res · Bluetooth 5.3", discount: 21 },
  { name: "Samsung OLED S95D", emoji: "📺", price: 14_990, oldPrice: 17_500, specs: '55" · 4K · 144Hz · Neural Quantum', discount: 14 },
  { name: "iPad Pro M4",       emoji: "📲", price: 12_490, oldPrice: 13_999, specs: '13" · 256GB · OLED · Apple Pencil Pro', discount: 11 },
  { name: "DJI Osmo Pocket 4", emoji: "🎥", price: 4_299,  oldPrice: 4_999,  specs: "4K120 · 3-Axis · Micro Sensor",          discount: 14 },
];

const CATEGORIES = ["Todos", "Câmeras", "Áudio", "Computadores", "Mobile", "TV & Vídeo"];

export default function ProductsPage() {
  const theme = useTheme();
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [hovIdx, setHovIdx] = useState<number | null>(null);

  const filtered = ALL_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>
            Catálogo de Produtos
          </h1>
          <p style={{ fontSize: 13, color: theme.textSecondary, margin: "4px 0 0" }}>
            {filtered.length} produtos disponíveis
          </p>
        </div>
        <Button variant="primary">＋ Solicitar Produto</Button>
      </div>

      {/* Search + Category */}
      <Card style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produtos..."
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
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  background: category === cat
                    ? "linear-gradient(135deg,#7c3aed,#3b82f6)"
                    : "transparent",
                  color: category === cat ? "white" : theme.textSecondary,
                  border: `1px solid ${category === cat ? "transparent" : theme.borderCol}`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 12,
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
        </div>
      </Card>

      {/* Product grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
        {filtered.map((p, i) => (
          <div
            key={p.name}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
            style={{
              background: hovIdx === i
                ? theme.dark ? "rgba(40,35,80,0.95)" : "rgba(255,255,255,0.98)"
                : theme.cardBg,
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: `1px solid ${hovIdx === i ? "rgba(139,92,246,0.25)" : theme.borderCol}`,
              borderRadius: 18,
              padding: 20,
              transition: "all 0.24s ease",
              transform: hovIdx === i ? "translateY(-4px)" : "none",
              boxShadow: hovIdx === i
                ? "0 12px 40px rgba(139,92,246,0.15)"
                : theme.cardShadow,
              cursor: "pointer",
            }}
          >
            {/* Emoji display */}
            <div
              style={{
                width: "100%",
                height: 100,
                borderRadius: 12,
                background: "linear-gradient(135deg,#ede9fe,#dbeafe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                marginBottom: 14,
                transition: "transform 0.24s ease",
                transform: hovIdx === i ? "scale(1.06)" : "scale(1)",
              }}
            >
              {p.emoji}
            </div>

            <div style={{ fontWeight: 700, fontSize: 14, color: theme.textPrimary }}>
              {p.name}
            </div>
            <div style={{ fontSize: 11.5, color: theme.textSecondary, marginTop: 4, lineHeight: 1.4 }}>
              {p.specs}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: theme.textPrimary }}>
                {fmt(p.price)}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 7px",
                  background: "rgba(74,222,128,0.12)",
                  color: "#16a34a",
                  borderRadius: 20,
                }}
              >
                −{p.discount}%
              </span>
            </div>
            <div
              style={{
                fontSize: 11,
                color: theme.textSecondary,
                textDecoration: "line-through",
                marginTop: 2,
              }}
            >
              {fmt(p.oldPrice)}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Button variant="primary" fullWidth size="sm">
                Pedir
              </Button>
              <Button variant="outline" size="sm">♡</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
