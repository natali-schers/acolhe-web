import type { ReactNode } from "react";
import styles from "./ListRow.module.css";

interface ListRowProps {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
}

/** Linha de lista: ícone, título, subtítulo e algo à direita (tag, botão...). */
export function ListRow({ leading, title, subtitle, trailing }: ListRowProps) {
  return (
    <div className={styles.row}>
      {leading}
      <span className={styles.text}>
        <b>{title}</b>
        {subtitle && <small>{subtitle}</small>}
      </span>
      {trailing}
    </div>
  );
}
