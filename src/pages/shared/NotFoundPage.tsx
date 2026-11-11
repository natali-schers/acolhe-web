import { Link } from "react-router-dom";
import { Brand } from "@/components/ui";

export function NotFoundPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
      <div>
        <Brand size="lg" />
        <h1 style={{ fontSize: 34, marginTop: 32 }}>Página não encontrada</h1>
        <p style={{ color: "var(--color-text-muted)" }}>O endereço pode ter mudado ou não existe mais.</p>
        <Link to="/">Voltar ao início</Link>
      </div>
    </main>
  );
}
