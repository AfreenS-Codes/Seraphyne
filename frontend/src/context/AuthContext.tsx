import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi } from "../api/client";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isDemo = typeof window !== "undefined" && window.location.search.includes("demo=true");
  const [user, setUser] = useState<User | null>(() =>
    isDemo ? { id: "demo-user", email: "demo@seraphyne.app", name: "Dr. Aanya Rao", role: "student" } : null
  );
  const [loading, setLoading] = useState(!isDemo);

  useEffect(() => {
    if (isDemo) return;
    const token = localStorage.getItem("seraphyne_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem("seraphyne_token");
      })
      .finally(() => setLoading(false));
  }, [isDemo]);

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password);
    localStorage.setItem("seraphyne_token", res.token);
    setUser(res.user);
  }

  async function signup(email: string, password: string, name: string) {
    const res = await authApi.signup(email, password, name);
    localStorage.setItem("seraphyne_token", res.token);
    setUser(res.user);
  }

  function logout() {
    localStorage.removeItem("seraphyne_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
