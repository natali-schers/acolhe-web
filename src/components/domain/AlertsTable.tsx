import { Check, Clock, Siren, X } from "lucide-react";
import table from "./Table.module.css";
import { Avatar, StatusTag } from "@/components/ui";
import { channelLabels, ChannelTag } from "./StatusLabels";
import type { Caregiver, EmergencyAlert } from "@/types";
import { formatDuration, formatShortDate, formatTime } from "@/utils/date";

interface AlertsTableProps {
  alerts: EmergencyAlert[];
  caregivers: Caregiver[];
}

function ResultTag({ alert }: { alert: EmergencyAlert }) {
  switch (alert.status) {
    case "resolvido": return <StatusTag tone="success" icon={<Check size={15} />}>{alert.resultNote ?? "Resolvido"}</StatusTag>;
    case "assumido": return <StatusTag tone="info" icon={<Clock size={15} />}>Em atendimento</StatusTag>;
    case "enviado": return <StatusTag tone="danger" icon={<Siren size={15} />}>Aguardando</StatusTag>;
    default: return <StatusTag icon={<X size={15} />}>Cancelado</StatusTag>;
  }
}

export function AlertsTable({ alerts, caregivers }: AlertsTableProps) {
  const byId = new Map(caregivers.map((c) => [c.id, c]));
  return (
    <div className={table.wrap}>
      <table className={table.table}>
        <thead>
          <tr>
            <th>Data e hora</th>
            <th>Quem acionou</th>
            <th>Quem assumiu</th>
            <th>Canal</th>
            <th>Tempo de resposta</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => {
            const assumed = alert.assumedByCaregiverId ? byId.get(alert.assumedByCaregiverId) : undefined;
            const via = alert.recipients.find((r) => r.caregiverId === alert.assumedByCaregiverId);
            return (
              <tr key={alert.id}>
                <td><b>{formatShortDate(alert.createdAt)}</b><small>{formatTime(alert.createdAt)}</small></td>
                <td>{alert.triggeredBy}</td>
                <td>
                  {assumed ? (
                    <span className={table.person}><Avatar initials={assumed.initials} size="xs" />{assumed.name}</span>
                  ) : "—"}
                </td>
                <td>
                  {via?.channel ? <ChannelTag channel={via.channel} /> : "—"}
                  {alert.offline && <small>Pessoa sem internet</small>}
                  {via?.failedChannels?.length ? <small>Antes tentou: {via.failedChannels.map((c) => channelLabels[c]).join(", ")}</small> : null}
                </td>
                <td>{alert.responseTimeSeconds != null ? formatDuration(alert.responseTimeSeconds) : "—"}</td>
                <td><ResultTag alert={alert} /></td>
              </tr>
            );
          })}
          {alerts.length === 0 && (
            <tr><td colSpan={6} className={table.empty}>Nenhum alerta neste período.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
