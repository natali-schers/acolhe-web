import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText, Pill, Plus, TriangleAlert, Video } from "lucide-react";
import styles from "./PatientProfilePage.module.css";
import grid from "@/components/layout/grid.module.css";
import { Avatar, Button, Card, CardHeader, EmptyState, Eyebrow, IconBadge, StatusTag, Tabs } from "@/components/ui";
import {
  AlertsTable, AppointmentCard, Banner, ListRow, PatientStatusTag, PrescriptionCard, QueryState, RoutineReport,
} from "@/components/domain";
import { useAlerts, useMedications, usePatientAppointments, usePrescriptions, useTimeline } from "@/hooks/useCare";
import { useCaregivers } from "@/hooks/useCaregivers";
import { usePatient } from "@/hooks/usePatients";
import { paths } from "@/routes/paths";
import type { Patient } from "@/types";
import { formatDayAndTime } from "@/utils/date";

type TabId = "resumo" | "receitas" | "rotina" | "consultas" | "alertas";

const tabs: { id: TabId; label: string }[] = [
  { id: "resumo", label: "Resumo" },
  { id: "receitas", label: "Receitas" },
  { id: "rotina", label: "Rotina e anotações" },
  { id: "consultas", label: "Consultas" },
  { id: "alertas", label: "Alertas" },
];

export function PatientProfilePage() {
  const { patientId = "" } = useParams();
  const patientQuery = usePatient(patientId);
  const [params, setParams] = useSearchParams();
  const tab = (tabs.some((t) => t.id === params.get("aba")) ? params.get("aba") : "resumo") as TabId;
  const navigate = useNavigate();

  return (
    <>
      <Link to={paths.doctor.patients} className={styles.back}><ArrowLeft size={18} /> Todos os pacientes</Link>
      <QueryState query={patientQuery}>
        {(patient) => (
          <>
            <div className={styles.head}>
              <Avatar initials={patient.initials} size="xl" />
              <div className={styles.headText}>
                <Eyebrow>Paciente</Eyebrow>
                <h1>{patient.fullName}</h1>
                <p>{patient.age} anos • {patient.city}</p>
              </div>
              <PatientStatusTag status={patient.status} note={patient.status === "estavel" ? undefined : "Requer atenção"} />
              <Button icon={<Plus size={18} />} onClick={() => navigate(paths.doctor.newPrescription(patient.id))}>Nova receita</Button>
            </div>
            <Tabs label="Seções do paciente" items={tabs} value={tab} onChange={(id) => setParams({ aba: id }, { replace: true })} />
            {tab === "resumo" && <SummaryTab patient={patient} onOpenTab={(id) => setParams({ aba: id })} />}
            {tab === "receitas" && <PrescriptionsTab patientId={patient.id} />}
            {tab === "rotina" && <RoutineReport patientId={patient.id} />}
            {tab === "consultas" && <AppointmentsTab patientId={patient.id} />}
            {tab === "alertas" && <AlertsTab patientId={patient.id} />}
          </>
        )}
      </QueryState>
    </>
  );
}

function SummaryTab({ patient, onOpenTab }: { patient: Patient; onOpenTab: (id: TabId) => void }) {
  const timeline = useTimeline(patient.id);
  const meds = useMedications(patient.id);
  const appointments = usePatientAppointments(patient.id);
  const next = appointments.data?.find((a) => new Date(a.at) > new Date());

  return (
    <div className={grid.main}>
      <Card>
        <CardHeader eyebrow="Atenção" title="Anotações importantes" />
        <QueryState query={timeline}>
          {(entries) => {
            const important = entries.filter((e) => e.warn).slice(0, 3);
            return (
              <>
                {important.map((e) => (
                  <Banner
                    key={e.id}
                    tone="warning"
                    icon={<TriangleAlert size={20} />}
                    title={e.title}
                    description={`${formatDayAndTime(e.at)} • Adicionado por ${e.authorName}`}
                    action={<Button variant="secondary" size="sm" onClick={() => onOpenTab("rotina")}>Ver detalhes</Button>}
                  />
                ))}
                <Banner tone="neutral" icon={<FileText size={20} />} title={`${patient.adherence30d}% das doses no horário`} description="Adesão nos últimos 30 dias" />
              </>
            );
          }}
        </QueryState>
      </Card>

      <Card>
        <Eyebrow>Próxima consulta</Eyebrow>
        {next ? (
          <>
            <h2 style={{ margin: "0 0 4px" }}>{formatDayAndTime(next.at)}</h2>
            <p className={grid.muted}>{next.mode === "online" ? "Consulta online" : next.location} • {next.durationMinutes} minutos</p>
            {next.mode === "online" && <Button fullWidth icon={<Video size={18} />}>Entrar na sala</Button>}
          </>
        ) : (
          <EmptyState title="Nenhuma consulta marcada" />
        )}
      </Card>

      <Card>
        <CardHeader eyebrow="Tratamento atual" title="Medicamentos" action={<Button variant="ghost" onClick={() => onOpenTab("receitas")}>Ver receitas</Button>} />
        <QueryState query={meds}>
          {(list) => list.length ? list.map((m) => (
            <ListRow
              key={m.id}
              leading={<IconBadge><Pill size={22} /></IconBadge>}
              title={`${m.name} ${m.dose}`}
              subtitle={`${m.frequency} • ${m.continuousUse ? "Uso contínuo" : "Temporário"}`}
              trailing={<StatusTag tone={m.adherence30d >= 90 ? "success" : "warning"}>{m.adherence30d}% de adesão</StatusTag>}
            />
          )) : <EmptyState title="Nenhum medicamento cadastrado" />}
        </QueryState>
      </Card>
    </div>
  );
}

function PrescriptionsTab({ patientId }: { patientId: string }) {
  const query = usePrescriptions(patientId);
  return (
    <QueryState query={query}>
      {(list) => list.length ? <div>{list.map((p) => <PrescriptionCard key={p.id} prescription={p} />)}</div> : <EmptyState title="Nenhuma receita emitida" />}
    </QueryState>
  );
}

function AppointmentsTab({ patientId }: { patientId: string }) {
  const query = usePatientAppointments(patientId);
  return (
    <QueryState query={query}>
      {(list) => list.length ? <div>{list.map((a) => <AppointmentCard key={a.id} appointment={a} />)}</div> : <EmptyState title="Nenhuma consulta" />}
    </QueryState>
  );
}

function AlertsTab({ patientId }: { patientId: string }) {
  const alerts = useAlerts(patientId);
  const caregivers = useCaregivers(patientId);
  return <QueryState query={alerts}>{(list) => <AlertsTable alerts={list} caregivers={caregivers.data ?? []} />}</QueryState>;
}
