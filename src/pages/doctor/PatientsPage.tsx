import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import styles from "./PatientsPage.module.css";
import table from "@/components/domain/Table.module.css";
import { Avatar, PageHeader } from "@/components/ui";
import { PatientStatusTag, QueryState } from "@/components/domain";
import { useCurrentUser } from "@/contexts/AuthContext";
import { useDoctorAppointments } from "@/hooks/useCare";
import { usePatients } from "@/hooks/usePatients";
import { paths } from "@/routes/paths";
import { formatDayAndTime, isSameDay } from "@/utils/date";

export function PatientsPage() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const patientsQuery = usePatients(user.patientIds);
  const appointmentsQuery = useDoctorAppointments(user.id);
  const [search, setSearch] = useState("");

  const appointments = appointmentsQuery.data ?? [];
  const todayCount = appointments.filter((a) => isSameDay(new Date(a.at), new Date())).length;
  const nextFor = (patientId: string) => appointments.find((a) => a.patientId === patientId && new Date(a.at) > new Date());

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = patientsQuery.data ?? [];
    const sorted = [...list].sort((a, b) => Number(b.status !== "estavel") - Number(a.status !== "estavel"));
    return term ? sorted.filter((p) => p.fullName.toLowerCase().includes(term)) : sorted;
  }, [patientsQuery.data, search]);

  return (
    <>
      <PageHeader eyebrow="Área médica" title="Seus pacientes" description="Acompanhe quem precisa de atenção e os próximos atendimentos." />
      <div className={styles.stats}>
        <div><b>{patientsQuery.data?.length ?? "–"}</b><span>Pacientes ativos</span></div>
        <div><b>{todayCount}</b><span>Consultas hoje</span></div>
        <div className={styles.attention}><b>{patientsQuery.data?.filter((p) => p.status !== "estavel").length ?? "–"}</b><span>Precisam de atenção</span></div>
      </div>

      <label className={styles.search}>
        <Search size={18} aria-hidden />
        <span className="sr-only">Buscar paciente</span>
        <input placeholder="Buscar paciente pelo nome" value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>

      <QueryState query={patientsQuery}>
        {() => (
          <div className={table.wrap}>
            <table className={`${table.table} ${styles.table}`}>
              <thead>
                <tr><th>Paciente</th><th>Situação</th><th>Adesão</th><th>Próxima consulta</th><th><span className="sr-only">Abrir</span></th></tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const next = nextFor(p.id);
                  return (
                    <tr key={p.id} onClick={() => navigate(paths.doctor.patient(p.id))} className={styles.clickable}>
                      <td>
                        <span className={table.person}>
                          <Avatar initials={p.initials} tone={p.status === "estavel" ? "info" : "primary"} />
                          <span><b>{p.fullName}</b><small>{p.age} anos</small></span>
                        </span>
                      </td>
                      <td><PatientStatusTag status={p.status} note={p.attentionNote} /></td>
                      <td><b>{p.adherence30d}%</b><small>Últimos 30 dias</small></td>
                      <td>{next ? <><b>{formatDayAndTime(next.at)}</b><small>{next.mode === "online" ? "Consulta online" : "Presencial"}</small></> : "—"}</td>
                      <td>
                        <button className={styles.open} aria-label={`Abrir ${p.fullName}`} onClick={(e) => { e.stopPropagation(); navigate(paths.doctor.patient(p.id)); }}>
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={5} className={table.empty}>Nenhum paciente encontrado.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </QueryState>
    </>
  );
}
