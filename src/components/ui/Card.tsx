import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";
import { cx } from "@/utils/cx";
import { Eyebrow } from "./Eyebrow";

interface CardProps extends HTMLAttributes<HTMLElement> {
  padded?: boolean;
}

export function Card({ padded = true, className, children, ...rest }: CardProps) {
  return (
    <section className={cx(styles.card, padded && styles.padded, className)} {...rest}>
      {children}
    </section>
  );
}

interface CardHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ eyebrow, title, action }: CardHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className={styles.title}>{title}</h2>
      </div>
      {action}
    </div>
  );
}
