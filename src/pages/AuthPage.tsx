import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useApp";

export default function AuthPage() {
  const { login, register } = useAuth();
  const theme = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name || name.length < 2) {
          setError("Nome deve ter ao menos 2 caracteres");
          setLoading(false);
          return;
        }
        await register(name, email, password, phone);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        padding: 24,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: theme.cardBg,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${theme.borderCol}`,
          borderRadius: 24,
          padding: 40,
          boxShadow: theme.cardShadow,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: "white",
              fontWeight: 800,
              boxShadow: "0 4px 12px rgba(124,58,237,0.35)",
            }}
          >
            P
          </div>
          <span style={{ fontWeight: 800, fontSize: 40, color: theme.textPrimary }}>
            PalheTTa
          </span>
        </div>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: theme.textPrimary,
            margin: "0 0 4px",
            letterSpacing: "-0.02em",
          }}
        >
          {isLogin ? "Entrar" : "Criar Conta"}
        </h2>
        <p style={{ fontSize: 13, color: theme.textSecondary, margin: "0 0 24px" }}>
          {isLogin
            ? "Acesse sua conta para continuar"
            : "Registre-se para começar a usar a plataforma"}
        </p>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.2)",
              color: "#f87171",
              fontSize: 12.5,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, display: "block", marginBottom: 6 }}>
                Nome
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required={!isLogin}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1px solid ${theme.borderCol}`,
                  background: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                  color: theme.textPrimary,
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, display: "block", marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${theme.borderCol}`,
                background: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                color: theme.textPrimary,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, display: "block", marginBottom: 6 }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${theme.borderCol}`,
                background: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                color: theme.textPrimary,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>

          {!isLogin && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, display: "block", marginBottom: 6 }}>
                Telefone (opcional)
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 (11) 99999-0000"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1px solid ${theme.borderCol}`,
                  background: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                  color: theme.textPrimary,
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 0",
              background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
              border: "none",
              borderRadius: 12,
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.03em",
              boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
              opacity: loading ? 0.7 : 1,
              marginTop: 4,
            }}
          >
            {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar Conta"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: theme.textSecondary,
            marginTop: 24,
            marginBottom: 0,
          }}
        >
          {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#7c3aed",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "inherit",
              padding: 0,
            }}
          >
            {isLogin ? "Registre-se" : "Entrar"}
          </button>
        </p>

      </div>
    </div>
  );
}
