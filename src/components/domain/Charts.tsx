import styles from "./Charts.module.css";
import { formatShortDate } from "@/utils/date";

/** Rosca com o percentual de adesão aos remédios. */
export function AdherenceDonut({ percent, label = "no horário" }: { percent: number; label?: string }) {
  return (
    <div
      className={styles.donut}
      style={{ background: `conic-gradient(var(--color-success) 0 ${percent}%, var(--color-border-soft) ${percent}%)` }}
      role="img"
      aria-label={`${percent}% ${label}`}
    >
      <div>
        <b>{percent}%</b>
        <small>{label}</small>
      </div>
    </div>
  );
}

/** Barras de adesão diária. Mostra no máximo `bars` barras (agrupando os dias). */
export function AdherenceBarChart({ daily, bars = 10 }: { daily: { date: string; percent: number }[]; bars?: number }) {
  const size = Math.max(1, Math.ceil(daily.length / bars));
  const groups = Array.from({ length: Math.ceil(daily.length / size) }, (_, i) => daily.slice(i * size, i * size + size));
  const values = groups.map((g) => Math.round(g.reduce((s, d) => s + d.percent, 0) / g.length));
  const first = daily[0]?.date;
  const middle = daily[Math.floor(daily.length / 2)]?.date;
  const last = daily[daily.length - 1]?.date;
  const short = (iso?: string) => (iso ? formatShortDate(iso).replace(/ de \d{4}| \d{4}/, "") : "");

  return (
    <div>
      <div className={styles.bars} role="img" aria-label="Gráfico de adesão aos remédios por período">
        {values.map((v, i) => (
          <span key={i} style={{ height: `${v}%` }} title={`${v}%`} />
        ))}
      </div>
      <div className={styles.labels}>
        <span>{short(first)}</span>
        <span>{short(middle)}</span>
        <span>{short(last)}</span>
      </div>
    </div>
  );
}

interface MetricProps {
  value: number | string;
  label: string;
  description?: string;
  tone?: "success" | "warning" | "primary";
}

export function Metric({ value, label, description, tone = "success" }: MetricProps) {
  return (
    <div className={styles.metric}>
      <b style={{ color: `var(--color-${tone})` }}>{value}</b>
      <span>
        {label}
        {description && <small>{description}</small>}
      </span>
    </div>
  );
}
