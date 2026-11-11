import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import styles from "./Button.module.css";
import { cx } from "@/utils/cx";

export type ButtonVariant = "primary" | "secondary" | "danger" | "dangerOutline" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "md" | "sm";
  fullWidth?: boolean;
  icon?: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = "primary", size = "md", fullWidth, icon, loading, className, children, type = "button", disabled, ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], styles[size], fullWidth && styles.full, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <LoaderCircle size={18} className={styles.spin} aria-hidden /> : icon}
      {children}
    </button>
  );
}
