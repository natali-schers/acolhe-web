import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { authService, type LoginInput } from "@/services";
import type { RegisterInput, Session, User } from "@/types";
import { SESSION_KEY, storage } from "@/utils/storage";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => storage.get<Session>(SESSION_KEY));

  const login = useCallback(async (input: LoginInput) => {
    const next = await authService.login(input);
    storage.set(SESSION_KEY, next);
    setSession(next);
    return next.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const next = await authService.register(input);
    storage.set(SESSION_KEY, next);
    setSession(next);
    return next.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    storage.remove(SESSION_KEY);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ user: session?.user ?? null, isAuthenticated: Boolean(session), login, register, logout }),
    [session, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}

/** Atalho para páginas protegidas, onde o usuário sempre existe. */
export function useCurrentUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error("Usuário não autenticado");
  return user;
}
