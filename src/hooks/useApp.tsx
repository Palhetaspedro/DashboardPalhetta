import { createContext, useContext, useState, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Mode = "buyer" | "seller";

interface AppContextValue {
  mode: Mode;
  setMode: (m: Mode) => void;
  dark: boolean;
  toggleDark: () => void;
  currentPage: string;
  setCurrentPage: (p: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("buyer");
  const [dark, setDark] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        dark,
        toggleDark: () => setDark((d) => !d),
        currentPage,
        setCurrentPage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────
export function useTheme() {
  const { dark } = useApp();

  return {
    dark,
    bg: dark
      ? "linear-gradient(145deg,#0f0a1e 0%,#12102b 50%,#0a1628 100%)"
      : "linear-gradient(145deg,#f5f3ff 0%,#eff6ff 50%,#f0fdf4 100%)",
    cardBg: dark ? "rgba(30,27,63,0.7)" : "rgba(255,255,255,0.72)",
    textPrimary: dark ? "#e9e5ff" : "#1e1b4b",
    textSecondary: dark ? "#7c7aaa" : "#6b7280",
    borderCol: dark
      ? "rgba(139,92,246,0.2)"
      : "rgba(139,92,246,0.12)",
    cardShadow: dark
      ? "0 4px 24px rgba(0,0,0,0.4)"
      : "0 4px 24px rgba(139,92,246,0.07)",
  } as const;
}

// ─── Shared style builders ────────────────────────────────────────────────────
export function card(theme: ReturnType<typeof useTheme>): React.CSSProperties {
  return {
    background: theme.cardBg,
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: `1px solid ${theme.borderCol}`,
    borderRadius: 18,
    padding: 22,
    boxShadow: theme.cardShadow,
  };
}

export const btnGrad: React.CSSProperties = {
  background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
  border: "none",
  borderRadius: 10,
  padding: "10px 20px",
  fontSize: 13,
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
  fontFamily: "inherit",
  letterSpacing: "0.02em",
  boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
};

export function btnOutline(theme: ReturnType<typeof useTheme>): React.CSSProperties {
  return {
    background: "transparent",
    border: `1px solid ${theme.borderCol}`,
    borderRadius: 8,
    padding: "5px 12px",
    fontSize: 12,
    color: "#7c3aed",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
  };
}

// ─── Utility ──────────────────────────────────────────────────────────────────
export const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
