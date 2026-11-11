import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { Download } from "lucide-react";
import table from "@/components/domain/Table.module.css";
import { Avatar, Button, Card, CardHeader, PageHeader, StatusTag } from "@/components/ui";
import { PatientStatusTag, QueryState } from "@/components/domain";
import { useCurrentUser } from "@/contexts/AuthContext";
import { queryKeys } from "@/hooks/queryKeys";
import { usePatients } from "@/hooks/usePatients";
import { paths } from "@/routes/paths";
import { medicationService } from "@/services";
import { exportCsv } from "@/utils/exportCsv";

export function ReportsPage() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const patientsQuery = usePatients(user.patientIds);
  const adherenceQueries = useQueries({
    queries: user.patientIds.map((id) => ({
      queryKey: queryKeys.adherence(id),
      queryFn: () => medicationService.getAdherence(id),
    })),
  });
  const adherenceById = new Map(adherenceQueries.filter((q) => q.data).map((q) => [q.data!.patientId, q.data!]));

  const handleExport = () => {
    const rows = (patientsQuery.data ?? []).map((p) => {
      const a = adherenceById.get(p.id);
      return [p.fullName, p.age, a ? `${Math.round((a.taken / a.scheduled) * 100)}%` : "", a?.late ?? "", a?.notes ?? "", p.status];
    });
    exportCsv("acolhe-relatorio-pacientes.csv", ["Paciente", "Idade", "Adesão 30 dias", "Doses atrasadas", "Anotações", "Situação"], rows);
  };

  return (
    <>
      <PageHeader
        eyebrow="Área médica"
        title="Relatórios"
        description="Adesão ao tratamento dos seus pacientes nos últimos 30 dias."
        actions={<Button variant="secondary" icon={<Download size={18} />} onClick={handleExport}>Exportar CSV</Button>}
      />
      <Card padded={false}>
        <div style={{ padding: "22px 22px 0" }}><CardHeader eyebrow="Últimos 30 dias" title="Adesão por paciente" /></div>
        <QueryState query={patientsQuery}>
          {(patients) => (
            <div style={{ overflowX: "auto" }}>
              <table className={table.table}>
                <thead>
                  <tr><th>Paciente</th><th>Adesão</th><th>Doses tomadas</th><th>Atrasadas</th><th>Anotações</th><th>Situação</th></tr>
                </thead>
                <tbody>
                  {patients.map((p) => {
                    const a = adherenceById.get(p.id);
                    const percent = a ? Math.round((a.taken / a.scheduled) * 100) : null;
                    return (
                      <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => navigate(`${paths.doctor.patient(p.id)}?aba=rotina`)}>
                        <td><span className={table.person}><Avatar initials={p.initials} size="sm" /><b>{p.fullName}</b></span></td>
                        <td>{percent != null ? <StatusTag tone={percent >= 90 ? "success" : "warning"}>{percent}%</StatusTag> : "…"}</td>
                        <td>{a ? `${a.taken} de ${a.scheduled}` : "…"}</td>
                        <td>{a?.late ?? "…"}</td>
                        <td>{a?.notes ?? "…"}</td>
                        <td><PatientStatusTag status={p.status} note={p.attentionNote} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </QueryState>
      </Card>
    </>
  );
}
