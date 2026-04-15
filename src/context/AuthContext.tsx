import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabase";

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

async function fetchUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    name: profile.name ?? user.email ?? "",
    email: user.email ?? "",
    role: (profile.role as AuthUser["role"]) ?? "buyer",
    plan: profile.plan ?? "Grátis",
    avatar: profile.avatar ?? "",
    phone: profile.phone ?? "",
    active: profile.active ?? true,
  } as AuthUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUser().then((u) => setUser(u));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } },
    });
    if (error) throw new Error(error.message);
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        name,
        phone: phone ?? "",
        role: "buyer",
        plan: "Grátis",
        active: true,
      });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: Record<string, any>) => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return;

    const { error } = await supabase.from("profiles").update(data).eq("id", authUser.id);
    if (error) throw new Error(error.message);

    const updated = await fetchUser();
    if (updated) setUser(updated);
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
