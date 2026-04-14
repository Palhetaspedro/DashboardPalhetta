import React, { CSSProperties, ReactNode, useState } from "react";
import { useTheme } from "../hooks/useApp";
import { STATUS_CONFIG, OrderStatus, DisputeStatus } from "../data/mockData";

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  fullWidth?: boolean;
  style?: CSSProperties;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  fullWidth,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const [hov, setHov] = useState(false);

  const padding = { sm: "5px 12px", md: "9px 18px", lg: "12px 24px" }[size];
  const fontSize = { sm: 11.5, md: 13, lg: 14 }[size];

  const base: CSSProperties = {
    fontFamily: "inherit",
    fontWeight: 600,
    borderRadius: 10,
    cursor: "pointer",
    transition: "all 0.2s",
    letterSpacing: "0.02em",
    padding,
    fontSize,
    width: fullWidth ? "100%" : undefined,
    border: "none",
  };

  const variants: Record<string, CSSProperties> = {
    primary: {
      background: hov
        ? "linear-gradient(135deg,#6d28d9,#2563eb)"
        : "linear-gradient(135deg,#7c3aed,#3b82f6)",
      color: "white",
      boxShadow: hov
        ? "0 6px 20px rgba(124,58,237,0.45)"
        : "0 4px 14px rgba(124,58,237,0.35)",
      transform: hov ? "translateY(-1px)" : "none",
    },
    outline: {
      background: "transparent",
      color: "#7c3aed",
      border: `1px solid ${theme.borderCol}`,
      opacity: hov ? 0.8 : 1,
    },
    ghost: {
      background: hov
        ? theme.dark
          ? "rgba(139,92,246,0.15)"
          : "rgba(139,92,246,0.08)"
        : "transparent",
      color: theme.textSecondary,
      border: "none",
    },
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: OrderStatus | DisputeStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 20,
        color: cfg.color,
        background: cfg.bg,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, style, hover = false, onClick }: CardProps) {
  const theme = useTheme();
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        background: hov ? (theme.dark ? "rgba(40,35,80,0.95)" : "rgba(255,255,255,0.95)") : theme.cardBg,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: `1px solid ${hov ? "rgba(139,92,246,0.22)" : theme.borderCol}`,
        borderRadius: 18,
        padding: 22,
        boxShadow: hov
          ? "0 10px 36px rgba(139,92,246,0.14)"
          : theme.cardShadow,
        transform: hov ? "translateY(-2px)" : "none",
        transition: "all 0.22s ease",
        cursor: onClick || hover ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <p
      style={{
        fontSize: 11.5,
        color: theme.textSecondary,
        margin: "0 0 14px",
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        fontWeight: 600,
      }}
    >
      {children}
    </p>
  );
}

// ─── Emoji thumbnail ──────────────────────────────────────────────────────────

export function EmojiThumb({
  emoji,
  size = 44,
  badge,
  badgeColor,
}: {
  emoji: string;
  size?: number;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.23),
        background: "linear-gradient(135deg,#ede9fe,#dbeafe)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.5,
        flexShrink: 0,
        position: "relative",
      }}
    >
      {emoji}
      {badge && (
        <span
          style={{
            position: "absolute",
            top: -3,
            right: -3,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: badgeColor ?? "#4ade80",
            border: "2px solid white",
          }}
        />
      )}
    </div>
  );
}
