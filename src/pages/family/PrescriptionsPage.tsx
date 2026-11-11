import { useState } from "react";
import grid from "@/components/layout/grid.module.css";
import { Button, EmptyState, PageHeader } from "@/components/ui";
import { AppointmentCard, PrescriptionCard, QueryState } from "@/components/domain";
import { useActivePatient } from "@/hooks/useActivePatient";
import { usePatientAppointments, usePrescriptions } from "@/hooks/useCare";

export function PrescriptionsPage() {
  const { data: patient } = useActivePatient();
  const patientId = patient?.id ?? "";
  const prescriptions = usePrescriptions(patientId);
  const appointments = usePatientAppointments(patientId);
  const [showOld, setShowOld] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Tratamento"
        title="Receitas e consultas"
        description={patient ? `Documentos e próximos compromissos de ${patient.name}.` : undefined}
      />
      <div className={grid.even}>
        <section>
          <div className={grid.sectionTitle}>
            <h2>{showOld ? "Todas as receitas" : "Receitas ativas"}</h2>
            <Button variant="ghost" onClick={() => setShowOld((v) => !v)}>{showOld ? "Ver só as ativas" : "Ver anteriores"}</Button>
          </div>
          <QueryState query={prescriptions}>
            {(list) => {
              const visible = showOld ? list : list.filter((p) => p.status === "ativa");
              return visible.length ? visible.map((p) => <PrescriptionCard key={p.id} prescription={p} />) : <EmptyState title="Nenhuma receita ativa" />;
            }}
          </QueryState>
        </section>
        <section>
          <div className={grid.sectionTitle}>
            <h2>Próximas consultas</h2>
          </div>
          <QueryState query={appointments}>
            {(list) => {
              const upcoming = list.filter((a) => new Date(a.at) > new Date());
              return upcoming.length
                ? upcoming.map((a) => <AppointmentCard key={a.id} appointment={a} />)
                : <EmptyState title="Nenhuma consulta marcada" description="As consultas agendadas pelo médico aparecem aqui." />;
            }}
          </QueryState>
        </section>
      </div>
    </>
  );
}
