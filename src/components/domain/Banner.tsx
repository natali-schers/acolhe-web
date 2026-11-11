import type { ReactNode } from "react";
import styles from "./Banner.module.css";
import { cx } from "@/utils/cx";

interface BannerProps {
  tone?: "success" | "warning" | "danger" | "primary" | "neutral";
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  live?: boolean;
}

/** Faixa de aviso: alerta em andamento, receita nova, consentimento... */
export function Banner({ tone = "success", icon, title, description, action, live }: BannerProps) {
  return (
    <div className={cx(styles.banner, styles[tone])} role={live ? "status" : undefined}>
      <span aria-hidden className={styles.icon}>{icon}</span>
      <span className={styles.text}>
        <b>{title}</b>
        {description && <small>{description}</small>}
      </span>
      {action}
    </div>
  );
}
