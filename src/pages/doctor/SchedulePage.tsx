import { useMemo, useState } from "react";
import grid from "@/components/layout/grid.module.css";
import { EmptyState, PageHeader, Tabs } from "@/components/ui";
import { AppointmentCard, QueryState } from "@/components/domain";
import { useCurrentUser } from "@/contexts/AuthContext";
import { useDoctorAppointments } from "@/hooks/useCare";
import { usePatients } from "@/hooks/usePatients";
import type { Appointment } from "@/types";
import { formatLongDate, formatRelativeDay, isSameDay } from "@/utils/date";

type Range = "hoje" | "semana" | "todas";

const ranges: { id: Range; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Próximos 7 dias" },
  { id: "todas", label: "Todas" },
];

function filterByRange(list: Appointment[], range: Range) {
  const now = new Date();
  if (range === "hoje") return list.filter((a) => isSameDay(new Date(a.at), now));
  if (range === "semana") return list.filter((a) => {
    const diff = new Date(a.at).getTime() - new Date(now.toDateString()).getTime();
    return diff >= 0 && diff < 8 * 86_400_000;
  });
  return list;
}

function groupByDay(list: Appointment[]) {
  const groups = new Map<string, Appointment[]>();
  list.forEach((a) => {
    const key = new Date(a.at).toDateString();
    groups.set(key, [...(groups.get(key) ?? []), a]);
  });
  return [...groups.values()];
}

export function SchedulePage() {
  const user = useCurrentUser();
  const appointmentsQuery = useDoctorAppointments(user.id);
  const { data: patients = [] } = usePatients(user.patientIds);
  const [range, setRange] = useState<Range>("semana");
  const names = useMemo(() => new Map(patients.map((p) => [p.id, p.fullName])), [patients]);

  return (
    <>
      <PageHeader eyebrow="Área médica" title="Agenda" description="Suas consultas presenciais e online." />
      <Tabs variant="pills" label="Período" items={ranges} value={range} onChange={setRange} />
      <QueryState query={appointmentsQuery}>
        {(list) => {
          const days = groupByDay(filterByRange(list, range));
          if (!days.length) return <EmptyState title="Nenhuma consulta neste período" />;
          return days.map((day) => (
            <section key={day[0].id} style={{ marginBottom: 18 }}>
              <div className={grid.sectionTitle}>
                <h2>
                  {["Hoje", "Amanhã", "Ontem"].includes(formatRelativeDay(day[0].at))
                    ? <>{formatRelativeDay(day[0].at)} <small className={grid.muted} style={{ fontSize: 15, fontWeight: 400 }}>• {formatLongDate(day[0].at)}</small></>
                    : formatLongDate(day[0].at)}
                </h2>
              </div>
              {day.map((a) => <AppointmentCard key={a.id} appointment={a} patientName={names.get(a.patientId)} />)}
            </section>
          ));
        }}
      </QueryState>
    </>
  );
}
