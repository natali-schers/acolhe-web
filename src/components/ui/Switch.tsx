import styles from "./Switch.module.css";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function Switch({ checked, onChange, label, description }: SwitchProps) {
  return (
    <label className={styles.row}>
      <span className={styles.text}>
        <b>{label}</b>
        {description && <small>{description}</small>}
      </span>
      <input type="checkbox" role="switch" className={styles.input} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.track} aria-hidden />
    </label>
  );
}
