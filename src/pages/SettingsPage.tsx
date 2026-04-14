import { useState } from "react";
import { useApp, useTheme } from "../hooks/useApp";
import { useAuth } from "../context/AuthContext";
import { Card, SectionLabel, Button } from "../components/ui";
import { api } from "../services/api";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 42,
        height: 24,
        borderRadius: 12,
        background: on ? "linear-gradient(135deg,#7c3aed,#3b82f6)" : "rgba(0,0,0,0.15)",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "white",
          transition: "left 0.2s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
}

interface SettingRow {
  label: string;
  description: string;
  key: string;
}

const NOTIFICATION_SETTINGS: SettingRow[] = [
  { label: "Pedidos atualizados",    description: "Receba notificações sobre mudanças de status", key: "orders"    },
  { label: "Disputas abertas",       description: "Alertas sobre novas disputas ou atualizações",  key: "disputes"  },
  { label: "Promoções e ofertas",    description: "Novidades e descontos de produtos",              key: "promos"    },
  { label: "Mensagens de usuários",  description: "Quando alguém te enviar uma mensagem",          key: "messages"  },
];

const PRIVACY_SETTINGS: SettingRow[] = [
  { label: "Perfil público",         description: "Outros usuários podem ver seu perfil",     key: "public"   },
  { label: "Histórico de compras",   description: "Compartilhar histórico anonimizado",        key: "history"  },
  { label: "Autenticação 2 fatores", description: "Segurança extra na sua conta",              key: "twofa"    },
];

export default function SettingsPage() {
  const { dark, toggleDark, mode, setMode } = useApp();
  const theme = useTheme();
  const { user, updateProfile, logout } = useAuth();

  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    orders: true, disputes: true, promos: false, messages: true,
  });
  const [privacy, setPrivacy] = useState<Record<string, boolean>>({
    public: true, history: false, twofa: true,
  });

  // Password change
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  // Profile fields
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [profileMsg, setProfileMsg] = useState("");

  const toggle = (
    state: Record<string, boolean>,
    setState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
    key: string
  ) => setState((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSaveProfile = async () => {
    setProfileMsg("");
    try {
      await updateProfile({ name, phone });
      setProfileMsg("Perfil atualizado!");
    } catch (err: any) {
      setProfileMsg(err.message);
    }
  };

  const handleChangePassword = async () => {
    setPwMsg("");
    if (!user) return;
    if (newPw.length < 6) {
      setPwMsg("Nova senha deve ter ao menos 6 caracteres");
      return;
    }
    try {
      await api.updatePassword(user.id, currentPw, newPw);
      setPwMsg("Senha atualizada com sucesso");
      setCurrentPw("");
      setNewPw("");
    } catch (err: any) {
      setPwMsg(err.message);
    }
  };

  const settingRow = (
    row: SettingRow,
    state: Record<string, boolean>,
    setState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  ) => (
    <div
      key={row.key}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 0",
        borderBottom: `1px solid ${theme.borderCol}`,
      }}
    >
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: theme.textPrimary }}>{row.label}</div>
        <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{row.description}</div>
      </div>
      <Toggle on={state[row.key]} onToggle={() => toggle(state, setState, row.key)} />
    </div>
  );

  if (!user) return null;

  const initial = user.name.charAt(0).toUpperCase();
  const roleLabel = { admin: "Admin", seller: "Vendedor", buyer: "Comprador" }[user.role] || user.role;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 680 }}>

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>
          Ajustes
        </h1>
        <p style={{ fontSize: 13, color: theme.textSecondary, margin: "4px 0 0" }}>
          Gerencie sua conta e preferências
        </p>
      </div>

      {/* Profile */}
      <Card>
        <SectionLabel>Perfil</SectionLabel>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: "linear-gradient(135deg,#a78bfa,#60a5fa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              color: "white",
              boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
            }}
          >
            {initial}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: theme.textPrimary }}>{user.name}</div>
            <div style={{ fontSize: 12.5, color: theme.textSecondary, marginTop: 2 }}>{user.email} · {roleLabel} · {user.plan}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Nome completo", value: name, onChange: setName },
            { label: "Email",         value: user.email },
            { label: "Telefone",      value: phone, onChange: setPhone },
            { label: "CPF",           value: "•••.•••.•••-••"      },
          ].map((field: any) => (
            <div key={field.label}>
              <div style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 4, letterSpacing: "0.04em" }}>
                {field.label.toUpperCase()}
              </div>
              <input
                value={field.value}
                onChange={field.onChange ? (e: any) => field.onChange(e.target.value) : undefined}
                readOnly={!field.onChange}
                style={{
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
                }}
              />
            </div>
          ))}
        </div>

        {profileMsg && (
          <div style={{ marginTop: 12, fontSize: 12.5, color: profileMsg.includes("sucesso") ? "#4ade80" : "#f87171" }}>
            {profileMsg}
          </div>
        )}
        <div style={{ marginTop: 16 }}>
          <Button variant="primary" size="sm" onClick={handleSaveProfile}>Salvar Alterações</Button>
        </div>
      </Card>

      {/* Password */}
      <Card>
        <SectionLabel>Alterar Senha</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 4, letterSpacing: "0.04em" }}>SENHA ATUAL</div>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
              style={{
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
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 4, letterSpacing: "0.04em" }}>NOVA SENHA</div>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={{
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
              }}
            />
          </div>
          {pwMsg && (
            <div style={{ fontSize: 12.5, color: pwMsg.toLowerCase().includes("sucesso") ? "#4ade80" : "#f87171" }}>
              {pwMsg}
            </div>
          )}
          <div>
            <Button variant="primary" size="sm" onClick={handleChangePassword}>Alterar Senha</Button>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <SectionLabel>Aparência</SectionLabel>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: theme.textPrimary }}>Modo Escuro</div>
            <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>Tema noturno para conforto visual</div>
          </div>
          <Toggle on={dark} onToggle={toggleDark} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 0",
            borderTop: `1px solid ${theme.borderCol}`,
            marginTop: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: theme.textPrimary }}>Modo Padrão</div>
            <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>Alterne entre Comprador e Vendedor</div>
          </div>
          <div
            style={{
              display: "flex",
              background: theme.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
              borderRadius: 10,
              padding: 3,
              gap: 2,
            }}
          >
            {(["buyer", "seller"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  background: mode === m ? "linear-gradient(135deg,#7c3aed,#3b82f6)" : "transparent",
                  color: mode === m ? "white" : theme.textSecondary,
                  border: "none",
                  borderRadius: 8,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {m === "buyer" ? "Comprador" : "Vendedor"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <SectionLabel>Notificações</SectionLabel>
        {NOTIFICATION_SETTINGS.map((row) => settingRow(row, notifs, setNotifs))}
      </Card>

      {/* Privacy */}
      <Card>
        <SectionLabel>Privacidade & Segurança</SectionLabel>
        {PRIVACY_SETTINGS.map((row) => settingRow(row, privacy, setPrivacy))}
        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <Button variant="outline" size="sm" style={{ color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }} onClick={logout}>
            Sair da Conta
          </Button>
        </div>
      </Card>
    </div>
  );
}
