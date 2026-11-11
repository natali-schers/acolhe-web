import type { ReactNode } from "react";
import styles from "./StatusTag.module.css";
import { cx } from "@/utils/cx";

export type Tone = "neutral" | "success" | "warning" | "info" | "danger" | "primary";

interface StatusTagProps {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
}

export function StatusTag({ tone = "neutral", icon, children }: StatusTagProps) {
  return (
    <span className={cx(styles.tag, styles[tone])}>
      {icon}
      {children}
    </span>
  );
}
