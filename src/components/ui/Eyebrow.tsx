import type { ReactNode } from "react";

/** Texto pequeno em caixa alta acima dos títulos ("HOJE", "ALERTAS"...). */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p style={{ margin: "0 0 8px", color: "var(--color-primary)", fontSize: 12, fontWeight: 700, letterSpacing: "1.35px", textTransform: "uppercase" }}>
      {children}
    </p>
  );
}
