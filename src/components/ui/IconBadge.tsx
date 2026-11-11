import type { ReactNode } from "react";
import type { Tone } from "./StatusTag";

const toneVars: Record<Tone, [string, string]> = {
  primary: ["--color-primary-soft", "--color-primary"],
  info: ["--color-info-soft", "--color-info"],
  success: ["--color-success-soft", "--color-success"],
  warning: ["--color-warning-soft", "--color-warning"],
  danger: ["--color-danger-soft", "--color-danger"],
  neutral: ["--color-surface-muted", "--color-text-muted"],
};

interface IconBadgeProps {
  children: ReactNode;
  tone?: Tone;
  size?: number;
  round?: boolean;
}

/** Ícone dentro de um quadrado (ou círculo) colorido. */
export function IconBadge({ children, tone = "primary", size = 46, round = false }: IconBadgeProps) {
  const [bg, fg] = toneVars[tone];
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, flex: "none", display: "grid", placeItems: "center",
        borderRadius: round ? "50%" : 13, background: `var(${bg})`, color: `var(${fg})`,
      }}
    >
      {children}
    </span>
  );
}
