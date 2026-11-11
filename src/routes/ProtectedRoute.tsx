import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";
import { paths } from "./paths";

export function homePathFor(role: UserRole) {
  return role === "medico" ? paths.doctor.root : paths.family.root;
}

/** Só deixa entrar quem está logado e tem o perfil certo. */
export function ProtectedRoute({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to={paths.login} replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to={homePathFor(user.role)} replace />;
  return <>{children}</>;
}
