import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import styles from "./CareRulesCard.module.css";
import { Button, Card, CardHeader, SelectField, Switch } from "@/components/ui";
import { QueryState } from "./QueryState";
import { useCareRules, useMedications, useSaveCareRules } from "@/hooks/useCare";
import { buildDefaultRules } from "@/services";
import type { CareRules, Medication, MedicationRule, NoticeLevel, NotifyWho } from "@/types";

const toleranceOptions = [15, 30, 60, 120].map((m) => ({ value: String(m), label: m < 60 ? `${m} minutos` : `${m / 60} hora${m > 60 ? "s" : ""}` }));

const notifyOptions: { value: NotifyWho; label: string }[] = [
  { value: "ninguem", label: "Ninguém, só lembrar a pessoa de novo" },
  { value: "principal", label: "Só o cuidador principal" },
  { value: "todos", label: "Todos os cuidadores" },
];

const levelOptions: { value: NoticeLevel; label: string }[] = [
  { value: "discreto", label: "Discreto: só uma notificação" },
  { value: "normal", label: "Normal: notificação com som" },
  { value: "urgente", label: "Urgente: alarme que repete até alguém ver" },
];

const hoursOptions = [6, 12, 24].map((h) => ({ value: String(h), label: `${h} horas` }));

/** Junta as regras salvas com os remédios atuais: remédio novo entra com a regra padrão. */
function withAllMedications(rules: CareRules, medications: Medication[]): CareRules {
  const defaults = buildDefaultRules(rules.patientId);
  const byId = new Map(rules.medications.map((r) => [r.medicationId, r]));
  return {
    ...rules,
    medications: medications.map((m) => byId.get(m.id) ?? defaults.medications.find((d) => d.medicationId === m.id) ?? {
      medicationId: m.id, requiresConfirmation: true, toleranceMinutes: 30, notifyWho: "principal", repeatReminder: true,
    }),
  };
}

interface FormProps {
  initial: CareRules;
  medications: Medication[];
  saving: boolean;
  onSave: (rules: CareRules) => Promise<unknown>;
}

function CareRulesForm({ initial, medications, saving, onSave }: FormProps) {
  const [rules, setRules] = useState(initial);
  const [saved, setSaved] = useState(false);

  const change = (updater: (r: CareRules) => CareRules) => { setRules(updater); setSaved(false); };
  const changeMed = (id: string, patch: Partial<MedicationRule>) =>
    change((r) => ({ ...r, medications: r.medications.map((m) => (m.medicationId === id ? { ...m, ...patch } : m)) }));

  const reset = () => change(() => withAllMedications({ ...buildDefaultRules(rules.patientId), medications: [] }, medications));
  const save = async () => { await onSave(rules); setSaved(true); };

  return (
    <>
      <fieldset className={styles.section}>
        <legend>Confirmação de remédios</legend>
        <p className={styles.hint}>Escolha o que o app pergunta e quem é avisado. Cada remédio tem sua regra.</p>
        {medications.map((med) => {
          const rule = rules.medications.find((r) => r.medicationId === med.id)!;
          return (
            <fieldset key={med.id} className={styles.med}>
              <legend>{med.name} {med.dose}</legend>
              <Switch
                label="Precisa confirmar que tomou?"
                description={`O app pergunta depois do horário (${med.times.join(", ")}).`}
                checked={rule.requiresConfirmation}
                onChange={(v) => changeMed(med.id, { requiresConfirmation: v })}
              />
              {rule.requiresConfirmation && (
                <div className={styles.medSub}>
                  <div className={styles.pair}>
                    <SelectField
                      label="Esperar quanto tempo?"
                      value={String(rule.toleranceMinutes)}
                      onChange={(e) => changeMed(med.id, { toleranceMinutes: Number(e.target.value) })}
                      options={toleranceOptions}
                    />
                    <SelectField
                      label="Se não confirmar, avisar"
                      value={rule.notifyWho}
                      onChange={(e) => changeMed(med.id, { notifyWho: e.target.value as NotifyWho })}
                      options={notifyOptions}
                    />
                  </div>
                  <Switch label="Lembrar a pessoa de novo" description="Repete o lembrete uma vez antes de avisar alguém." checked={rule.repeatReminder} onChange={(v) => changeMed(med.id, { repeatReminder: v })} />
                </div>
              )}
            </fieldset>
          );
        })}
        {medications.length === 0 && <p className={styles.hint}>Quando houver remédios cadastrados, as regras aparecem aqui.</p>}
      </fieldset>

      <fieldset className={styles.section}>
        <legend>Tipos de aviso</legend>
        <p className={styles.hint}>Três níveis, do mais discreto ao mais forte. Emergências são sempre urgentes.</p>
        <div className={styles.pair}>
          <SelectField label="Lembretes do dia a dia" value={rules.levels.reminders} onChange={(e) => change((r) => ({ ...r, levels: { ...r.levels, reminders: e.target.value as NoticeLevel } }))} options={levelOptions} />
          <SelectField label="Remédio atrasado" value={rules.levels.delays} onChange={(e) => change((r) => ({ ...r, levels: { ...r.levels, delays: e.target.value as NoticeLevel } }))} options={levelOptions} />
        </div>
        <SelectField label="Emergência (botão de ajuda)" value="urgente" disabled onChange={() => undefined} options={[levelOptions[2]]} hint="Não pode ser alterado, por segurança." />
      </fieldset>

      <fieldset className={styles.section}>
        <legend>Outros avisos</legend>
        <Switch
          label="Avisar se o celular ficar parado por muito tempo"
          description="Experimental. Pode errar se a pessoa deixar o celular de lado. Desligado por padrão."
          checked={rules.noActivityAlert}
          onChange={(v) => change((r) => ({ ...r, noActivityAlert: v }))}
        />
        {rules.noActivityAlert && (
          <div className={styles.medSub}>
            <SelectField label="Avisar depois de" value={String(rules.noActivityHours)} onChange={(e) => change((r) => ({ ...r, noActivityHours: Number(e.target.value) }))} options={hoursOptions} />
          </div>
        )}
        <Switch label="Lembretes falados em voz alta" description="O app lê o lembrete para a pessoa cuidada." checked={rules.voiceReminders} onChange={(v) => change((r) => ({ ...r, voiceReminders: v }))} />
      </fieldset>

      <div className={styles.footer}>
        {saved && <span className={styles.saved} role="status"><Check size={16} aria-hidden /> Regras salvas. O app da pessoa cuidada já usa as novas regras.</span>}
        <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={reset}>Restaurar padrão</Button>
        <Button onClick={save} loading={saving}>Salvar regras</Button>
      </div>
    </>
  );
}

export function CareRulesCard({ patientId, patientName }: { patientId: string; patientName: string }) {
  const rulesQuery = useCareRules(patientId);
  const medsQuery = useMedications(patientId);
  const save = useSaveCareRules(patientId);

  return (
    <Card style={{ marginTop: 22 }}>
      <CardHeader eyebrow={`Cuidado de ${patientName}`} title="Regras de cuidado" />
      <QueryState query={rulesQuery}>
        {(rules) => (
          <QueryState query={medsQuery}>
            {(meds) => (
              <CareRulesForm initial={withAllMedications(rules, meds)} medications={meds} saving={save.isPending} onSave={(r) => save.mutateAsync(r)} />
            )}
          </QueryState>
        )}
      </QueryState>
    </Card>
  );
}
