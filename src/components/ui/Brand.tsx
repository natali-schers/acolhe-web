import { HeartPulse } from "lucide-react";
import styles from "./Brand.module.css";
import { cx } from "@/utils/cx";

interface BrandProps {
  size?: "md" | "lg";
  inverted?: boolean;
}

/** Logo do Acolhe. */
export function Brand({ size = "md", inverted = false }: BrandProps) {
  return (
    <span className={cx(styles.brand, styles[size], inverted && styles.inverted)}>
      <span className={styles.mark}>
        <HeartPulse size={size === "lg" ? 26 : 22} aria-hidden />
      </span>
      <span>
        <strong>Acolhe</strong>
      </span>
    </span>
  );
}
