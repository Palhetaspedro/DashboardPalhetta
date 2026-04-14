// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type DisputeStatus = "open" | "review" | "resolved";
export type Urgency = "high" | "medium" | "low";

export interface Order {
  id: string;
  product: string;
  specs: string;
  status: OrderStatus;
  price: number;
  thumb: string;
  date: string;
}

export interface Dispute {
  id: string;
  product: string;
  status: DisputeStatus;
  date: string;
  reason: string;
}

export interface SellerOrder {
  id: string;
  product: string;
  specs: string;
  location: string;
  delivery: string;
  price: number;
  thumb: string;
  urgency: Urgency;
}

export interface SellerStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

// ─── Status Config ────────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  OrderStatus | DisputeStatus,
  { label: string; color: string; bg: string }
> = {
  pending:    { label: "Pendente",    color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  paid:       { label: "Pago",        color: "#4ade80", bg: "rgba(74,222,128,0.12)"  },
  processing: { label: "Processando", color: "#fb923c", bg: "rgba(251,146,60,0.12)"  },
  shipped:    { label: "Enviado",     color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  delivered:  { label: "Entregue",    color: "#22c55e", bg: "rgba(34,197,94,0.12)"  },
  cancelled:  { label: "Cancelado",   color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  refunded:   { label: "Reembolsado", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  open:       { label: "Aberta",      color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  review:     { label: "Em Análise",  color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  resolved:   { label: "Resolvida",   color: "#4ade80", bg: "rgba(74,222,128,0.12)"  },
};

export const URGENCY_COLOR: Record<Urgency, string> = {
  high:   "#f87171",
  medium: "#fb923c",
  low:    "#4ade80",
};

// ─── Buyer Data ───────────────────────────────────────────────────────────────

export const BUYER_ORDERS: Order[] = [
  {
    id: "ORD-0041",
    product: "Câmera Sony A7 IV",
    specs: "33MP · Full-Frame · 4K60",
    status: "paid",
    price: 19_490,
    thumb: "📷",
    date: "12 Abr 2026",
  },
  {
    id: "ORD-0039",
    product: "Monitor LG UltraWide",
    specs: '34" · 144Hz · QHD',
    status: "processing",
    price: 4_899,
    thumb: "🖥️",
    date: "10 Abr 2026",
  },
  {
    id: "ORD-0037",
    product: "Teclado Keychron Q5",
    specs: "96% · Gateron Pro · RGB",
    status: "shipped",
    price: 1_290,
    thumb: "⌨️",
    date: "08 Abr 2026",
  },
  {
    id: "ORD-0034",
    product: "SSD Samsung 990 Pro",
    specs: "2TB · NVMe Gen4 · 7.4GB/s",
    status: "paid",
    price: 899,
    thumb: "💾",
    date: "05 Abr 2026",
  },
  {
    id: "ORD-0031",
    product: "Headphones Sony XM6",
    specs: "ANC · 40h · Hi-Res",
    status: "cancelled",
    price: 2_199,
    thumb: "🎧",
    date: "01 Abr 2026",
  },
];

export const DISPUTES: Dispute[] = [
  {
    id: "DSP-007",
    product: "AirPods Pro 2",
    status: "open",
    date: "11 Abr 2026",
    reason: "Item não recebido",
  },
  {
    id: "DSP-006",
    product: "iPad Air 5",
    status: "review",
    date: "03 Abr 2026",
    reason: "Produto divergente",
  },
  {
    id: "DSP-005",
    product: "Apple Watch S9",
    status: "resolved",
    date: "28 Mar 2026",
    reason: "Defeito de fabricação",
  },
];

export const FEATURED_PRODUCTS = [
  { name: "Sony A7 IV",       emoji: "📷", price: 19_490, oldPrice: 22_199, specs: "33MP · Full-Frame · 4K60fps · Wi-Fi 6",   discount: 12 },
  { name: "MacBook Pro M4",   emoji: "💻", price: 18_999, oldPrice: 21_500, specs: "16GB · 512GB · 14'' · ProMotion 120Hz",    discount: 12 },
  { name: "iPhone 16 Pro",    emoji: "📱", price: 9_299,  oldPrice: 10_499, specs: "256GB · Titânio · A18 Pro · Camera 48MP", discount: 11 },
  { name: "DJI Air 3S",       emoji: "🚁", price: 7_890,  oldPrice: 8_999,  specs: "4K · 46min · Obstacle Avoidance",         discount: 12 },
];

// ─── Seller Data ──────────────────────────────────────────────────────────────

export const SELLER_ORDERS: SellerOrder[] = [
  {
    id: "PED-0092",
    product: "iPhone 15 Pro Max",
    specs: "256GB · Titânio Natural",
    location: "São Paulo, SP",
    delivery: "16 Abr 2026",
    price: 9_299,
    thumb: "📱",
    urgency: "high",
  },
  {
    id: "PED-0091",
    product: "MacBook Air M3",
    specs: "16GB · 512GB · Meia-noite",
    location: "Brasília, DF",
    delivery: "18 Abr 2026",
    price: 11_490,
    thumb: "💻",
    urgency: "medium",
  },
  {
    id: "PED-0089",
    product: "Apple Watch Ultra 2",
    specs: "49mm · GPS+Cell · Titânio",
    location: "Rio de Janeiro, RJ",
    delivery: "20 Abr 2026",
    price: 6_999,
    thumb: "⌚",
    urgency: "low",
  },
  {
    id: "PED-0088",
    product: "iPad Pro M4",
    specs: "13'' · 256GB · Wi-Fi+Cell",
    location: "Belo Horizonte, MG",
    delivery: "22 Abr 2026",
    price: 12_490,
    thumb: "📲",
    urgency: "medium",
  },
];

export const SELLER_STATS: SellerStat[] = [
  { label: "Aceitos Hoje",   value: "7",     icon: "✅", color: "#4ade80" },
  { label: "Em Entrega",     value: "12",    icon: "🚚", color: "#60a5fa" },
  { label: "Avaliação",      value: "4.94",  icon: "⭐", color: "#fbbf24" },
  { label: "Taxa Conclusão", value: "98.2%", icon: "🏆", color: "#a78bfa" },
];
