import type { ReactNode } from "react";
import { LoaderCircle, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "./Button";
import { IconBadge } from "./IconBadge";

const center = { textAlign: "center", padding: "28px 16px", color: "var(--color-text-muted)" } as const;

export function Loading({ label = "Carregando..." }: { label?: string }) {
  return (
    <div style={center} role="status">
      <LoaderCircle size={28} style={{ animation: "spin .9s linear infinite" }} aria-hidden />
      <p>{label}</p>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}

export function ErrorState({ message = "Não foi possível carregar.", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div style={center} role="alert">
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <IconBadge tone="danger" round><TriangleAlert size={22} /></IconBadge>
      </div>
      <p>{message}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>Tentar de novo</Button>}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div style={center}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <IconBadge tone="success" round size={52}>{icon ?? <ShieldCheck size={24} />}</IconBadge>
      </div>
      <b style={{ color: "var(--color-text)" }}>{title}</b>
      {description && <p style={{ margin: 4 }}>{description}</p>}
      {action}
    </div>
  );
}
