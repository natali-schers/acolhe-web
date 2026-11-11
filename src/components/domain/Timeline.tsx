import { Check, FileText, Footprints, Pill, Siren, TriangleAlert } from "lucide-react";
import styles from "./Timeline.module.css";
import type { TimelineEntry, TimelineEntryType } from "@/types";
import { formatDayAndTime, formatTime, isSameDay } from "@/utils/date";
import { cx } from "@/utils/cx";

const icons: Record<TimelineEntryType, typeof Check> = {
  medicacao: Pill,
  anotacao: FileText,
  sintoma: TriangleAlert,
  atividade: Footprints,
  alerta: Siren,
};

interface TimelineProps {
  entries: TimelineEntry[];
  /** Mostra "Hoje, 14:20" em vez de só a hora. */
  showDay?: boolean;
  showAuthor?: boolean;
}

export function Timeline({ entries, showDay = false, showAuthor = true }: TimelineProps) {
  return (
    <ol className={cx(styles.list, showDay && styles.wide)}>
      {entries.map((entry) => {
        const Icon = entry.type === "medicacao" ? Check : icons[entry.type];
        const sameDay = isSameDay(new Date(entry.at), new Date());
        return (
          <li key={entry.id} className={cx(styles.item, entry.warn && styles.warn)}>
            <time dateTime={entry.at}>{showDay || !sameDay ? formatDayAndTime(entry.at) : formatTime(entry.at)}</time>
            <span className={styles.dot} aria-hidden><Icon size={16} /></span>
            <div>
              <h4>{entry.title}</h4>
              <p>{entry.description}</p>
              {showAuthor && <small>{entry.type === "medicacao" ? "Confirmado por" : "Adicionado por"} {entry.authorName}</small>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
