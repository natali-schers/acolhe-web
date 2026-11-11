import { useState } from "react";
import grid from "@/components/layout/grid.module.css";
import { Avatar, Button, Card, CardHeader, PageHeader, Switch, TextField } from "@/components/ui";
import { CareRulesCard } from "@/components/domain";
import { useActivePatient } from "@/hooks/useActivePatient";
import { useCurrentUser } from "@/contexts/AuthContext";

/** Configurações da conta. Por enquanto as preferências ficam só na tela (sem salvar no backend). */
export function SettingsPage() {
  const user = useCurrentUser();
  const isDoctor = user.role === "medico";
  const { data: patient } = useActivePatient();
  const [prefs, setPrefs] = useState({ alertsWhatsapp: true, alertsSms: true, alertsEmail: true, dailySummary: !isDoctor, missedDose: !isDoctor });
  const [saved, setSaved] = useState(false);
  const toggle = (key: keyof typeof prefs) => (v: boolean) => { setPrefs((p) => ({ ...p, [key]: v })); setSaved(false); };

  return (
    <>
      <PageHeader eyebrow="Conta" title="Configurações" description={isDoctor ? "Seus dados e como você quer ser avisado." : "Seus dados, como você quer ser avisado e as regras de cuidado da pessoa que você acompanha."} />
      <div className={grid.even}>
        <Card>
          <CardHeader title="Seus dados" />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar initials={user.initials} size="lg" />
            <div><b>{user.name}</b><p style={{ margin: 0, color: "var(--color-text-muted)" }}>{isDoctor ? user.crm : "Familiar responsável"}</p></div>
          </div>
          <TextField label="E-mail" defaultValue={user.email} type="email" />
          <TextField label="Celular" defaultValue="(11) 98888-1111" type="tel" />
        </Card>
        <Card>
          <CardHeader title="Notificações" />
          <Switch label="Alertas de emergência por WhatsApp" description="A mensagem traz um link para responder ao alerta." checked={prefs.alertsWhatsapp} onChange={toggle("alertsWhatsapp")} />
          <Switch label="Alertas de emergência por SMS" description="Recomendado. Funciona mesmo sem internet." checked={prefs.alertsSms} onChange={toggle("alertsSms")} />
          <Switch label="Alertas por e-mail" checked={prefs.alertsEmail} onChange={toggle("alertsEmail")} />
          {!isDoctor && <Switch label="Resumo diário" description="Um resumo do dia às 21h." checked={prefs.dailySummary} onChange={toggle("dailySummary")} />}
          {!isDoctor && <Switch label="Remédio não confirmado" description="Avisa quando uma dose passa 30 min sem confirmação." checked={prefs.missedDose} onChange={toggle("missedDose")} />}
          <Button fullWidth style={{ marginTop: 16 }} onClick={() => setSaved(true)}>{saved ? "Preferências salvas" : "Salvar preferências"}</Button>
        </Card>
      </div>
      {!isDoctor && patient && <CareRulesCard patientId={patient.id} patientName={patient.name} />}
    </>
  );
}
