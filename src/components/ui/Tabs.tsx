import styles from "./Tabs.module.css";
import { cx } from "@/utils/cx";

export interface TabItem<T extends string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  variant?: "underline" | "pills" | "segmented";
}

export function Tabs<T extends string>({ items, value, onChange, label, variant = "underline" }: TabsProps<T>) {
  return (
    <div className={cx(styles.tabs, styles[variant])} role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          aria-selected={value === item.id}
          className={cx(styles.tab, value === item.id && styles.active)}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
