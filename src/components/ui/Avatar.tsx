import styles from "./Avatar.module.css";
import { cx } from "@/utils/cx";

interface AvatarProps {
  initials: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  tone?: "primary" | "info" | "light";
  label?: string;
}

export function Avatar({ initials, size = "md", tone = "primary", label }: AvatarProps) {
  return (
    <span className={cx(styles.avatar, styles[size], styles[tone])} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {initials}
    </span>
  );
}
