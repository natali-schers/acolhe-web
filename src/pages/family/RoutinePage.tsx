import { useState } from "react";
import { Plus, Printer } from "lucide-react";
import { Button, Card, CardHeader, PageHeader, StatusTag } from "@/components/ui";
import { NoteFormModal, RoutineReport } from "@/components/domain";
import { useCurrentUser } from "@/contexts/AuthContext";
import { useActivePatientId } from "@/hooks/useActivePatient";

export function RoutinePage() {
  const user = useCurrentUser();
  const patientId = useActivePatientId();
  const [noteOpen, setNoteOpen] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Acompanhamento"
        title="Rotina e relatórios"
        description="Veja os cuidados, sintomas e a adesão ao tratamento."
        actions={
          <>
            <Button variant="secondary" icon={<Printer size={18} />} onClick={() => window.print()}>Imprimir / PDF</Button>
            <Button icon={<Plus size={18} />} onClick={() => setNoteOpen(true)}>Nova anotação</Button>
          </>
        }
      />
      <RoutineReport patientId={patientId} />
      <NoteFormModal open={noteOpen} onClose={() => setNoteOpen(false)} patientId={patientId} authorName={user.name.split(" ")[0]} />
      <Card style={{ marginTop: 20 }}>
        <CardHeader eyebrow="Dica" title="Quem pode ver estas anotações?" action={<StatusTag tone="primary">Rede + médico</StatusTag>} />
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
          As anotações aparecem para todos da rede de cuidadores com permissão de ver a rotina e para o médico responsável.
        </p>
      </Card>
    </>
  );
}
