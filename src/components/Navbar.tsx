import { useState } from "react";
import { useApp, useTheme } from "../hooks/useApp";
import { useAuth } from "../context/AuthContext";
import { LogoNavbar } from "../components/Logo";

const NAV_ITEMS: Record<string, { id: string; icon: string; label: string; roles?: string[] }[]> = {
  admin: [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "orders",    icon: "📦", label: "Pedidos"   },
    { id: "disputes",  icon: "⚖️",  label: "Disputas"  },
    { id: "products",  icon: "🛍️", label: "Produtos"  },
    { id: "settings",  icon: "⚙️",  label: "Ajustes"   },
  ],
  seller: [
    { id: "dashboard",   icon: "⊞", label: "Dashboard" },
    { id: "seller-admin", icon: "📊", label: "Painel"    },
    { id: "orders",      icon: "📦", label: "Pedidos"   },
    { id: "products",    icon: "🛍️", label: "Produtos"  },
    { id: "disputes",    icon: "⚖️",  label: "Disputas"  },
    { id: "settings",    icon: "⚙️",  label: "Ajustes"   },
  ],
  buyer: [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "orders",    icon: "📦", label: "Pedidos"   },
    { id: "products",  icon: "🛍️", label: "Produtos"  },
    { id: "settings",  icon: "⚙️",  label: "Ajustes"   },
  ],
};

export default function Navbar() {
  const { mode, setMode, toggleDark, dark, currentPage, setCurrentPage } = useApp();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);

  if (!user) return null;

  const initial = user.name.charAt(0).toUpperCase();
  const roleLabel = { admin: "Admin", seller: "Vendedor", buyer: "Comprador" }[user.role] || user.role;

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 0",
        marginBottom: 28,
        borderBottom: `1px solid ${theme.borderCol}`,
        flexWrap: "wrap",
      }}
    >
      {/* Logo */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        onClick={() => setCurrentPage("dashboard")}
      >
        <LogoNavbar dark={dark} />
        <span
          style={{
            fontWeight: 800,
            fontSize: 17,
            color: theme.textPrimary,
            letterSpacing: "-0.02em",
          }}
        >
          Palhetta
        </span>
      </div>

      {/* Page links */}
      <div style={{ display: "flex", gap: 2, marginLeft: 16 }}>
        {(NAV_ITEMS[user.role] ?? NAV_ITEMS.buyer).map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                background: active
                  ? dark
                    ? "rgba(139,92,246,0.2)"
                    : "rgba(139,92,246,0.1)"
                  : "transparent",
                border: "none",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12.5,
                fontWeight: active ? 700 : 500,
                color: active ? "#7c3aed" : theme.textSecondary,
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 13 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Icons */}
      <div style={{ display: "flex", gap: 4 }}>
        {[
          { icon: "🔔", action: () => setNotifOpen((o) => !o), badge: 3 },
          {
            icon: dark ? "☀️" : "🌙",
            action: toggleDark,
            badge: 0,
          },
        ].map(({ icon, action, badge }, i) => (
          <button
            key={i}
            onClick={action}
            style={{
              position: "relative",
              width: 36,
              height: 36,
              borderRadius: 10,
              background: dark
                ? "rgba(255,255,255,0.07)"
                : "rgba(0,0,0,0.04)",
              border: `1px solid ${theme.borderCol}`,
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
          >
            {icon}
            {badge > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#ef4444",
                  color: "white",
                  fontSize: 9,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid white",
                }}
              >
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 4 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "linear-gradient(135deg,#a78bfa,#60a5fa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 700,
            color: "white",
            boxShadow: "0 2px 8px rgba(124,58,237,0.25)",
          }}
        >
          {initial}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: theme.textPrimary,
              lineHeight: 1.2,
            }}
          >
            {user.name}
          </span>
          <span style={{ fontSize: 10.5, color: theme.textSecondary }}>
            {roleLabel} · {user.plan}
          </span>
        </div>
        <button
          onClick={logout}
          title="Sair"
          style={{
            background: "transparent",
            border: "none",
            color: "#f87171",
            fontSize: 16,
            cursor: "pointer",
            marginLeft: 4,
            padding: "4px 8px",
            borderRadius: 6,
            transition: "opacity 0.15s",
          }}
        >
          🚪
        </button>
      </div>

      {/* Notification dropdown */}
      {notifOpen && (
        <div
          style={{
            position: "fixed",
            top: 70,
            right: 24,
            zIndex: 100,
            background: dark ? "rgba(20,16,50,0.97)" : "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${theme.borderCol}`,
            borderRadius: 14,
            padding: 16,
            width: 280,
            boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: theme.textSecondary,
              marginBottom: 12,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Notificações
          </div>
          {[
            { msg: "Pedido confirmado", time: "há 5min",  dot: "#4ade80" },
            { msg: "Disputa atualizada",  time: "há 1h",   dot: "#fb923c" },
            { msg: "Novo produto disponível",     time: "há 3h",   dot: "#60a5fa" },
          ].map((n, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                padding: "8px 0",
                borderBottom:
                  i < 2 ? `1px solid ${theme.borderCol}` : "none",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: n.dot,
                  marginTop: 4,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: 12.5, color: theme.textPrimary }}>
                  {n.msg}
                </div>
                <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                  {n.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
