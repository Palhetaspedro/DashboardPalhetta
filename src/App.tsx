import { AppProvider, useApp, useTheme } from "./hooks/useApp";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage    from "./pages/OrdersPage";
import DisputesPage  from "./pages/DisputesPage";
import ProductsPage  from "./pages/ProductsPage";
import SettingsPage  from "./pages/SettingsPage";
import AuthPage      from "./pages/AuthPage";

// ─── Page router ──────────────────────────────────────────────────────────────
function Router() {
  const { currentPage } = useApp();

  const pages: Record<string, JSX.Element> = {
    dashboard: <DashboardPage />,
    orders:    <OrdersPage    />,
    disputes:  <DisputesPage  />,
    products:  <ProductsPage  />,
    settings:  <SettingsPage  />,
  };

  return pages[currentPage] ?? <DashboardPage />;
}

// ─── Shell ────────────────────────────────────────────────────────────────────
function Shell() {
  const theme = useTheme();
  const { user, loading } = useAuth();

  // Loading or not logged in
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: theme.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, color: theme.textSecondary }}>
          Carregando...
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif",
        color: theme.textPrimary,
        transition: "background 0.4s ease",
      }}
    >
      {/* Noise texture overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 60px",
        }}
      >
        <Navbar />
        <Router />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 3px; }
        button { font-family: inherit; }
        select option { background: white; color: #1e1b4b; }
        input::placeholder { color: rgba(107,114,128,0.7); }
        @media (max-width: 768px) {
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Entry point ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </AppProvider>
  );
}
