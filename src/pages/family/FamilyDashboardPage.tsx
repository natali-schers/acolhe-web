import { Link } from "react-router-dom";
import { BatteryMedium, ChevronRight, Clock, Pill, Siren, Video } from "lucide-react";
import grid from "@/components/layout/grid.module.css";
import styles from "./FamilyDashboardPage.module.css";
import { Avatar, Button, Card, CardHeader, EmptyState, IconBadge, PageHeader } from "@/components/ui";
import { AdherenceDonut, Banner, DoseStatusTag, ListRow, PatientStatusTag, QueryState, Timeline } from "@/components/domain";
import { useCurrentUser } from "@/contexts/AuthContext";
import { useActivePatient } from "@/hooks/useActivePatient";
import {
  useActiveAlert, useAdherence, useAlerts, useMedications, usePatientAppointments, useTimeline, useTodayDoses,
} from "@/hooks/useCare";
import { paths } from "@/routes/paths";
import type { Patient } from "@/types";
import { formatDayAndTime, formatTime, formatTimeAgo, formatWeekdayHeader } from "@/utils/date";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export function FamilyDashboardPage() {
  const user = useCurrentUser();
  const patientQuery = useActivePatient();

  return (
    <>
      <PageHeader
        eyebrow={formatWeekdayHeader()}
        title={`${greeting()}, ${user.name.split(" ")[0]}`}
        description={patientQuery.data ? `Veja como está ${patientQuery.data.name} hoje.` : undefined}
      />
      <QueryState query={patientQuery}>{(patient) => <Dashboard patient={patient} />}</QueryState>
    </>
  );
}

function Dashboard({ patient }: { patient: Patient }) {
  const { data: activeAlert } = useActiveAlert(patient.id);

  return (
    <>
      <div className={styles.overview}>
        <div className={styles.summary}>
          <Avatar initials={patient.initials} size="lg" />
          <div>
            <h2>{patient.fullName}</h2>
            {patient.status === "estavel" ? (
              <p className={styles.ok}><span className={styles.dot} /> Tudo bem agora</p>
            ) : (
              <PatientStatusTag status={patient.status} note={patient.attentionNote} />
            )}
          </div>
        </div>
        <div className={styles.stat}>
          <Clock size={22} aria-hidden />
          <span><small>ÚLTIMA ATIVIDADE</small><b>{formatTimeAgo(patient.lastActivityAt)}</b></span>
        </div>
        <div className={styles.stat}>
          <BatteryMedium size={22} aria-hidden />
          <span><small>BATERIA DO CELULAR</small><b>{patient.batteryLevel}% • {patient.batteryLevel > 30 ? "Boa" : "Baixa"}</b></span>
        </div>
      </div>

      {activeAlert && (
        <Banner
          live
          tone={activeAlert.status === "assumido" ? "success" : "danger"}
          icon={<Siren size={22} />}
          title={activeAlert.status === "assumido" ? "Alerta em atendimento" : `${patient.name} pediu ajuda`}
          description={`Enviado ${formatDayAndTime(activeAlert.createdAt).toLowerCase()}. Todos da rede foram avisados.`}
          action={<Link to={paths.family.alerts}>Ver alerta</Link>}
        />
      )}

      <div className={grid.main}>
        <NextCare patientId={patient.id} />
        <AdherenceCard patientId={patient.id} />
        <RecentNotes patientId={patient.id} />
        <LastAlertCard patientId={patient.id} />
      </div>
    </>
  );
}

function NextCare({ patientId }: { patientId: string }) {
  const doses = useTodayDoses(patientId);
  const meds = useMedications(patientId);
  const appointments = usePatientAppointments(patientId);
  const nextAppointment = appointments.data?.find((a) => new Date(a.at) > new Date());

  return (
    <Card>
      <CardHeader eyebrow="Hoje" title="Próximos cuidados" action={<Link to={paths.family.prescriptions} className={styles.link}>Ver todos <ChevronRight size={18} /></Link>} />
      <QueryState query={doses}>
        {(list) => (
          <>
            {list.filter((d) => d.status !== "tomado").map((dose) => {
              const med = meds.data?.find((m) => m.id === dose.medicationId);
              return (
                <ListRow
                  key={dose.id}
                  leading={<IconBadge><Pill size={22} /></IconBadge>}
                  title={med ? `${med.name} ${med.dose}` : "Remédio"}
                  subtitle={`Hoje, às ${formatTime(dose.scheduledAt)} • ${med?.instructions ?? ""}`}
                  trailing={<DoseStatusTag status={dose.status} />}
                />
              );
            })}
            {nextAppointment && (
              <ListRow
                leading={<IconBadge tone="info"><Video size={22} /></IconBadge>}
                title={`Consulta com ${nextAppointment.doctorName}`}
                subtitle={`${formatDayAndTime(nextAppointment.at)} • ${nextAppointment.mode === "online" ? "Online" : "Presencial"}`}
                trailing={<Link to={paths.family.prescriptions}><Button variant="secondary" size="sm">Ver consulta</Button></Link>}
              />
            )}
            {list.every((d) => d.status === "tomado") && !nextAppointment && (
              <EmptyState title="Nada pendente hoje" description="Todos os remédios foram tomados." />
            )}
          </>
        )}
      </QueryState>
    </Card>
  );
}

function AdherenceCard({ patientId }: { patientId: string }) {
  const query = useAdherence(patientId);
  return (
    <Card>
      <CardHeader eyebrow="Últimos 30 dias" title="Adesão aos remédios" />
      <QueryState query={query}>
        {(a) => {
          const percent = Math.round((a.taken / a.scheduled) * 100);
          return (
            <>
              <AdherenceDonut percent={percent} />
              <p className={`${grid.center} ${grid.muted}`}>
                {percent >= 85 ? "Ótimo resultado." : "Vale conversar sobre a rotina."} {a.taken} de {a.scheduled} doses tomadas.
              </p>
            </>
          );
        }}
      </QueryState>
    </Card>
  );
}

function RecentNotes({ patientId }: { patientId: string }) {
  const query = useTimeline(patientId, 3);
  return (
    <Card>
      <CardHeader eyebrow="Atividade" title="Anotações recentes" action={<Link to={paths.family.routine} className={styles.link}>Ver rotina <ChevronRight size={18} /></Link>} />
      <QueryState query={query}>{(entries) => <Timeline entries={entries} />}</QueryState>
    </Card>
  );
}

function LastAlertCard({ patientId }: { patientId: string }) {
  const query = useAlerts(patientId);
  return (
    <Card>
      <CardHeader eyebrow="Alertas" title="Últimos registros" />
      <QueryState query={query}>
        {(alerts) => {
          const recent = alerts.find((a) => Date.now() - new Date(a.createdAt).getTime() < 7 * 86_400_000);
          return recent ? (
            <EmptyState icon={<Siren size={24} />} title="Houve um alerta nesta semana" description={formatDayAndTime(recent.createdAt)} action={<Link to={paths.family.alerts}>Ver histórico</Link>} />
          ) : (
            <EmptyState
              title="Nenhum alerta recente"
              description={alerts[0] ? `O último foi ${formatTimeAgo(alerts[0].createdAt).toLowerCase()}.` : "Nenhum alerta registrado."}
              action={<Link to={paths.family.alerts} className={styles.link}>Ver histórico</Link>}
            />
          );
        }}
      </QueryState>
    </Card>
  );
}
