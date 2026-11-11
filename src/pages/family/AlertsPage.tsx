import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button, PageHeader, Tabs } from "@/components/ui";
import { AlertsTable, QueryState } from "@/components/domain";
import { useActivePatientId } from "@/hooks/useActivePatient";
import { useAlerts } from "@/hooks/useCare";
import { useCaregivers } from "@/hooks/useCaregivers";
import type { Caregiver, EmergencyAlert } from "@/types";
import { formatDuration, formatShortDate, formatTime } from "@/utils/date";
import { exportCsv } from "@/utils/exportCsv";

type Filter = "todos" | "30dias" | "resolvidos";

const filters: { id: Filter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "30dias", label: "Últimos 30 dias" },
  { id: "resolvidos", label: "Resolvidos" },
];

function applyFilter(alerts: EmergencyAlert[], filter: Filter) {
  if (filter === "resolvidos") return alerts.filter((a) => a.status === "resolvido");
  if (filter === "30dias") return alerts.filter((a) => Date.now() - new Date(a.createdAt).getTime() < 30 * 86_400_000);
  return alerts;
}

function exportAlerts(alerts: EmergencyAlert[], caregivers: Caregiver[]) {
  const names = new Map(caregivers.map((c) => [c.id, c.name]));
  exportCsv(
    "acolhe-alertas.csv",
    ["Data", "Hora", "Quem acionou", "Quem assumiu", "Canal", "Tempo de resposta", "Situação"],
    alerts.map((a) => [
      formatShortDate(a.createdAt), formatTime(a.createdAt), a.triggeredBy,
      a.assumedByCaregiverId ? names.get(a.assumedByCaregiverId) ?? "" : "",
      a.recipients.find((r) => r.caregiverId === a.assumedByCaregiverId)?.channel ?? "",
      a.responseTimeSeconds != null ? formatDuration(a.responseTimeSeconds) : "", a.status,
    ]),
  );
}

export function AlertsPage() {
  const patientId = useActivePatientId();
  const alertsQuery = useAlerts(patientId);
  const caregiversQuery = useCaregivers(patientId);
  const [filter, setFilter] = useState<Filter>("todos");
  const filtered = useMemo(() => applyFilter(alertsQuery.data ?? [], filter), [alertsQuery.data, filter]);

  return (
    <>
      <PageHeader
        eyebrow="Segurança"
        title="Histórico de alertas"
        description="Acompanhe os pedidos de ajuda e o tempo de resposta da rede."
        actions={
          <Button variant="secondary" icon={<Download size={18} />} disabled={!filtered.length} onClick={() => exportAlerts(filtered, caregiversQuery.data ?? [])}>
            Exportar
          </Button>
        }
      />
      <Tabs variant="pills" label="Filtrar alertas" items={filters} value={filter} onChange={setFilter} />
      <QueryState query={alertsQuery}>{() => <AlertsTable alerts={filtered} caregivers={caregiversQuery.data ?? []} />}</QueryState>
    </>
  );
}
