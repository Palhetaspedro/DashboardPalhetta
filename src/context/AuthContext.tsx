import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../services/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller" | "buyer";
  plan: string;
  avatar: string;
  phone: string;
  active: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Record<string, any>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if already logged in on mount
  useEffect(() => {
    if (api.isAuthenticated()) {
      api
        .getMe()
        .then(({ user }) => setUser(user))
        .catch(() => api.clearTokens())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await api.login(email, password);
    setUser(user);
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const { user } = await api.register(name, email, password, phone);
    setUser(user);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const updateProfile = async (data: Record<string, any>) => {
    if (!user) return;
    const { user: updated } = await api.updateUser(user.id, data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
