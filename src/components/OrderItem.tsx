import { useState } from "react";
import { Order, SellerOrder, URGENCY_COLOR } from "../data/mockData";
import { useTheme, fmt } from "../hooks/useApp";
import { Button, EmojiThumb, StatusBadge } from "./ui";

// ─── Buyer order row ──────────────────────────────────────────────────────────

export function OrderItem({ order }: { order: Order }) {
  const theme = useTheme();
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov
          ? theme.dark
            ? "rgba(40,35,80,0.9)"
            : "rgba(255,255,255,0.95)"
          : theme.cardBg,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${hov ? "rgba(139,92,246,0.2)" : theme.borderCol}`,
        borderRadius: 14,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        transition: "all 0.22s ease",
        transform: hov ? "translateY(-1px)" : "none",
        boxShadow: hov
          ? "0 8px 32px rgba(139,92,246,0.12)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        cursor: "pointer",
      }}
    >
      <EmojiThumb emoji={order.thumb} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 13.5,
            color: theme.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {order.product}
        </div>
        <div style={{ fontSize: 11.5, color: theme.textSecondary, marginTop: 2 }}>
          {order.specs}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 5,
          flexShrink: 0,
        }}
      >
        <StatusBadge status={order.status} />
        <span
          style={{ fontSize: 13, fontWeight: 700, color: theme.textPrimary }}
        >
          {fmt(order.price)}
        </span>
        <span style={{ fontSize: 11, color: theme.textSecondary }}>{order.date}</span>
      </div>

      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <Button variant="outline" size="sm">Ver</Button>
        <Button variant="outline" size="sm">↓</Button>
      </div>
    </div>
  );
}

// ─── Seller order row ─────────────────────────────────────────────────────────

export function SellerOrderItem({ order }: { order: SellerOrder }) {
  const theme = useTheme();
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov
          ? theme.dark
            ? "rgba(40,35,80,0.9)"
            : "rgba(255,255,255,0.95)"
          : theme.cardBg,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${hov ? "rgba(139,92,246,0.25)" : theme.borderCol}`,
        borderRadius: 14,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        transition: "all 0.22s ease",
        transform: hov ? "translateY(-1px)" : "none",
        boxShadow: hov
          ? "0 8px 32px rgba(139,92,246,0.12)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        cursor: "pointer",
      }}
    >
      <EmojiThumb
        emoji={order.thumb}
        badge="•"
        badgeColor={URGENCY_COLOR[order.urgency]}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: theme.textPrimary }}>
          {order.product}
        </div>
        <div style={{ fontSize: 11.5, color: theme.textSecondary, marginTop: 1 }}>
          {order.specs}
        </div>
        <div style={{ fontSize: 11, color: "#a78bfa", marginTop: 3 }}>
          📍 {order.location} · 🗓 {order.delivery}
        </div>
      </div>

      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: theme.textPrimary }}>
          {fmt(order.price)}
        </div>
        <Button variant="primary" size="sm" style={{ marginTop: 6 }}>
          Aceitar
        </Button>
      </div>
    </div>
  );
}
