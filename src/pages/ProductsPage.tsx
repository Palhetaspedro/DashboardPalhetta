import { useState, useRef, useCallback } from "react";
import { useTheme, fmt } from "../hooks/useApp";
import { Card, SectionLabel, Button } from "../components/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice: number;
  specs: string;
  discount: number;
  category: string;
  image: string; // base64 or URL
}

const CATEGORIES = ["Todos", "Câmeras", "Áudio", "Computadores", "Mobile", "TV & Vídeo"];

const INITIAL_PRODUCTS: Product[] = [
  { id: "1", name: "Sony A7 IV", price: 19_490, oldPrice: 22_199, specs: "33MP · Full-Frame · 4K60fps · Wi-Fi 6", discount: 12, category: "Câmeras", image: "" },
  { id: "2", name: "MacBook Pro M4", price: 18_999, oldPrice: 21_500, specs: "16GB · 512GB · 14'' · ProMotion 120Hz", discount: 12, category: "Computadores", image: "" },
  { id: "3", name: "iPhone 16 Pro", price: 9_299, oldPrice: 10_499, specs: "256GB · Titânio · A18 Pro · Camera 48MP", discount: 11, category: "Mobile", image: "" },
  { id: "4", name: "DJI Air 3S", price: 7_890, oldPrice: 8_999, specs: "4K · 46min · Obstacle Avoidance", discount: 12, category: "Câmeras", image: "" },
  { id: "5", name: "Sony WH-1000XM6", price: 2_199, oldPrice: 2_799, specs: "ANC · 40h · Hi-Res · Bluetooth 5.3", discount: 21, category: "Áudio", image: "" },
  { id: "6", name: "Samsung OLED S95D", price: 14_990, oldPrice: 17_500, specs: '55" · 4K · 144Hz · Neural Quantum', discount: 14, category: "TV & Vídeo", image: "" },
  { id: "7", name: "iPad Pro M4", price: 12_490, oldPrice: 13_999, specs: '13" · 256GB · OLED · Apple Pencil Pro', discount: 11, category: "Mobile", image: "" },
  { id: "8", name: "DJI Osmo Pocket 4", price: 4_299, oldPrice: 4_999, specs: "4K120 · 3-Axis · Micro Sensor", discount: 14, category: "Câmeras", image: "" },
];

const emptyProduct = (): Omit<Product, "id"> => ({
  name: "",
  price: 0,
  oldPrice: 0,
  specs: "",
  discount: 0,
  category: "Todos",
  image: "",
});

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto",
          background: "var(--modal-bg, #1e1b3f)", borderRadius: 20, padding: 28,
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Product Form (add/edit) ─────────────────────────────────────────────────

interface ProductFormProps {
  initial?: Omit<Product, "id">;
  onSave: (data: Omit<Product, "id">) => void;
  onCancel: () => void;
}

function ProductForm({ initial, onSave, onCancel }: ProductFormProps) {
  const theme = useTheme();
  const [form, setForm] = useState(initial ?? emptyProduct());
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);

  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: 10,
    border: `1px solid ${theme.borderCol}`,
    background: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    color: theme.textPrimary, fontSize: 13, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: theme.textSecondary, marginBottom: 4,
    letterSpacing: "0.04em", display: "block",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: theme.textPrimary }}>
        {initial ? "Editar Produto" : "Novo Produto"}
      </h3>

      {/* Image upload */}
      <div>
        <span style={labelStyle}>IMAGEM DO PRODUTO</span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: 80, height: 80, borderRadius: 14,
              background: "linear-gradient(135deg,#ede9fe,#dbeafe)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", overflow: "hidden", flexShrink: 0,
              border: `2px dashed ${theme.borderCol}`,
            }}
          >
            {form.image ? (
              <img src={form.image} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 28, color: "#7c3aed" }}>＋</span>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageFile} style={{ display: "none" }} />
          <div>
            <div style={{ fontSize: 12, color: theme.textSecondary }}>Clique para selecionar uma imagem</div>
            <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>JPG, PNG ou WebP</div>
            {form.image && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                style={{ background: "none", border: "none", color: "#f87171", fontSize: 12, cursor: "pointer", padding: 0, marginTop: 4, fontFamily: "inherit" }}
              >
                Remover imagem
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <label style={labelStyle}>NOME DO PRODUTO</label>
        <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: iPhone 16 Pro" style={inputStyle} />
      </div>

      {/* Specs */}
      <div>
        <label style={labelStyle}>ESPECIFICAÇÕES</label>
        <input value={form.specs} onChange={(e) => set("specs", e.target.value)} placeholder="Ex: 256GB · Titânio · A18 Pro" style={inputStyle} />
      </div>

      {/* Price row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>PREÇO (R$)</label>
          <input type="number" value={form.price || ""} onChange={(e) => set("price", Number(e.target.value))} placeholder="0,00" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>PREÇO ANTIGO (R$)</label>
          <input type="number" value={form.oldPrice || ""} onChange={(e) => set("oldPrice", Number(e.target.value))} placeholder="0,00" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>DESCONTO (%)</label>
          <input type="number" value={form.discount} onChange={(e) => set("discount", Number(e.target.value))} placeholder="0" style={inputStyle} />
        </div>
      </div>

      {/* Category */}
      <div>
        <label style={labelStyle}>CATEGORIA</label>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          {CATEGORIES.filter((c) => c !== "Todos").map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <Button variant="primary" fullWidth size="md" onClick={() => onSave(form)}>Salvar</Button>
        <Button variant="outline" size="md" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}

// ─── Delete confirmation ──────────────────────────────────────────────────────

function DeleteConfirm({ productName, onConfirm, onCancel }: { productName: string; onConfirm: () => void; onCancel: () => void }) {
  const theme = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "center" }}>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: theme.textPrimary }}>Excluir Produto</h3>
      <p style={{ margin: 0, fontSize: 13, color: theme.textSecondary }}>
        Tem certeza que deseja excluir <strong style={{ color: theme.textPrimary }}>{productName}</strong>? Esta ação não pode ser desfeita.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="primary" fullWidth size="md" onClick={onConfirm} style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)" }}>Excluir</Button>
        <Button variant="outline" size="md" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [hovIdx, setHovIdx] = useState<number | null>(null);

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Todos" || p.category === category;
    return matchSearch && matchCat;
  });

  const openAdd = () => { setEditProduct(null); setFormOpen(true); };
  const openEdit = (p: Product) => { setEditProduct(p); setFormOpen(true); };

  const handleSave = (data: Omit<Product, "id">) => {
    if (editProduct) {
      setProducts((prev) => prev.map((p) => (p.id === editProduct.id ? { ...data, id: editProduct.id } : p)));
    } else {
      setProducts((prev) => [...prev, { ...data, id: String(Date.now()) }]);
    }
    setFormOpen(false);
    setEditProduct(null);
  };

  const handleDelete = () => {
    if (deleteProduct) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
      setDeleteProduct(null);
    }
  };

  // Inject CSS variable for modal background
  const modalBg = theme.dark ? "rgba(30,27,63,0.97)" : "rgba(255,255,255,0.97)";

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
        <Button variant="primary" onClick={openAdd}>＋ Adicionar Produto</Button>
      </div>

      {/* Search + Category */}
      <Card style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produtos..."
            style={{
              flex: 1, minWidth: 200, padding: "8px 14px", borderRadius: 10,
              border: `1px solid ${theme.borderCol}`,
              background: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              color: theme.textPrimary, fontSize: 13, fontFamily: "inherit", outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  background: category === cat ? "linear-gradient(135deg,#7c3aed,#3b82f6)" : "transparent",
                  color: category === cat ? "white" : theme.textSecondary,
                  border: `1px solid ${category === cat ? "transparent" : theme.borderCol}`,
                  borderRadius: 8, padding: "6px 14px", fontSize: 12,
                  fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
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
            key={p.id}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
            style={{
              background: hovIdx === i ? (theme.dark ? "rgba(40,35,80,0.95)" : "rgba(255,255,255,0.98)") : theme.cardBg,
              backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
              border: `1px solid ${hovIdx === i ? "rgba(139,92,246,0.25)" : theme.borderCol}`,
              borderRadius: 18, padding: 20, transition: "all 0.24s ease",
              transform: hovIdx === i ? "translateY(-4px)" : "none",
              boxShadow: hovIdx === i ? "0 12px 40px rgba(139,92,246,0.15)" : theme.cardShadow,
              cursor: "pointer",
            }}
          >
            {/* Image or placeholder */}
            <div
              style={{
                width: "100%", height: 100, borderRadius: 12,
                background: p.image ? "transparent" : "linear-gradient(135deg,#ede9fe,#dbeafe)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 14, transition: "transform 0.24s ease", overflow: "hidden",
                transform: hovIdx === i ? "scale(1.06)" : "scale(1)",
              }}
            >
              {p.image ? (
                <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 40, opacity: 0.35 }}>🛍️</span>
              )}
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
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", background: "rgba(74,222,128,0.12)", color: "#16a34a", borderRadius: 20 }}>
                −{p.discount}%
              </span>
            </div>
            {p.oldPrice > 0 && (
              <div style={{ fontSize: 11, color: theme.textSecondary, textDecoration: "line-through", marginTop: 2 }}>
                {fmt(p.oldPrice)}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Button variant="outline" size="sm" onClick={() => openEdit(p)}>Editar</Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteProduct(p)}
                style={{ color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}
              >
                🗑
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditProduct(null); }}>
        <div style={{ background: modalBg, borderRadius: 16 }}>
          <ProductForm
            initial={editProduct ? { ...editProduct } : undefined}
            onSave={handleSave}
            onCancel={() => { setFormOpen(false); setEditProduct(null); }}
          />
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteProduct} onClose={() => setDeleteProduct(null)}>
        <div style={{ background: modalBg, borderRadius: 16 }}>
          {deleteProduct && (
            <DeleteConfirm
              productName={deleteProduct.name}
              onConfirm={handleDelete}
              onCancel={() => setDeleteProduct(null)}
            />
          )}
        </div>
      </Modal>

      <style>{`
        :root { --modal-bg: ${modalBg}; }
      `}</style>
    </div>
  );
}
