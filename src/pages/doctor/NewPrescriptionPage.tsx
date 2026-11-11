import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, ShieldCheck, Trash2 } from "lucide-react";
import styles from "./NewPrescriptionPage.module.css";
import { Banner } from "@/components/domain";
import { Button, Card, Eyebrow, IconBadge, Modal, PageHeader, SelectField, Switch, TextAreaField, TextField } from "@/components/ui";
import { useCurrentUser } from "@/contexts/AuthContext";
import { useCreatePrescription } from "@/hooks/useCare";
import { usePatient } from "@/hooks/usePatients";
import { paths } from "@/routes/paths";
import type { PrescriptionItem } from "@/types";

const frequencyOptions = ["1 comprimido após o almoço", "1 comprimido a cada 12 horas", "1 comprimido a cada 8 horas", "1 comprimido pela manhã", "1 comprimido à noite"];
const durationOptions = ["Uso contínuo", "7 dias", "14 dias", "30 dias", "90 dias"];

const emptyItem = (): PrescriptionItem => ({ medication: "", dose: "", frequency: frequencyOptions[0], duration: durationOptions[0], suggestConfirmation: true });

export function NewPrescriptionPage() {
  const { patientId = "" } = useParams();
  const doctor = useCurrentUser();
  const navigate = useNavigate();
  const { data: patient } = usePatient(patientId);
  const createPrescription = useCreatePrescription(patientId, doctor);

  const [items, setItems] = useState<PrescriptionItem[]>([emptyItem()]);
  const [instructions, setInstructions] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [sent, setSent] = useState(false);

  const updateItem = (index: number, changes: Partial<PrescriptionItem>) =>
    setItems((list) => list.map((item, i) => (i === index ? { ...item, ...changes } : item)));

  const valid = items.every((i) => i.medication.trim() && i.dose.trim());

  const handleReview = (e: FormEvent) => {
    e.preventDefault();
    if (valid) setConfirming(true);
  };

  const handleSign = async () => {
    await createPrescription.mutateAsync({ patientId, items, instructions });
    setConfirming(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className={styles.done}>
        <IconBadge tone="success" round size={72}><ShieldCheck size={34} /></IconBadge>
        <h1>Receita enviada</h1>
        <p>A receita foi assinada e já aparece no aplicativo de {patient?.name ?? "paciente"} e para a rede de cuidadores autorizada.</p>
        <Button onClick={() => navigate(`${paths.doctor.patient(patientId)}?aba=receitas`)}>Ver receitas do paciente</Button>
      </div>
    );
  }

  return (
    <>
      <Link to={paths.doctor.patient(patientId)} className={styles.back}><ArrowLeft size={18} /> Voltar ao perfil</Link>
      <PageHeader eyebrow="Nova receita" title={`Prescrever para ${patient?.fullName ?? "..."}`} description="Revise os dados antes de assinar e enviar." />

      <form className={styles.layout} onSubmit={handleReview}>
        <Card>
          <h2 className={styles.formTitle}>Dados da prescrição</h2>
          {items.map((item, index) => (
            <fieldset key={index} className={styles.item}>
              <legend>Medicamento {items.length > 1 ? index + 1 : ""}</legend>
              <div className={styles.row}>
                <TextField label="Medicamento" value={item.medication} onChange={(e) => updateItem(index, { medication: e.target.value })} placeholder="Ex.: Metformina" required />
                <TextField label="Dose" value={item.dose} onChange={(e) => updateItem(index, { dose: e.target.value })} placeholder="Ex.: 850 mg" required />
              </div>
              <div className={styles.row}>
                <SelectField label="Frequência" value={item.frequency} onChange={(e) => updateItem(index, { frequency: e.target.value })} options={frequencyOptions.map((o) => ({ value: o, label: o }))} />
                <SelectField label="Duração" value={item.duration} onChange={(e) => updateItem(index, { duration: e.target.value })} options={durationOptions.map((o) => ({ value: o, label: o }))} />
              </div>
              <Switch
                label="Sugerir confirmação de tomada"
                description="O app pergunta se a pessoa tomou este remédio. A família pode mudar isso nas configurações."
                checked={item.suggestConfirmation ?? false}
                onChange={(v) => updateItem(index, { suggestConfirmation: v })}
              />
              {items.length > 1 && (
                <Button variant="ghost" icon={<Trash2 size={16} />} onClick={() => setItems((l) => l.filter((_, i) => i !== index))}>Remover medicamento</Button>
              )}
            </fieldset>
          ))}
          <Button variant="secondary" icon={<Plus size={18} />} onClick={() => setItems((l) => [...l, emptyItem()])}>Adicionar medicamento</Button>
          <TextAreaField label="Orientações para o paciente" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Ex.: Tomar 1 comprimido após o almoço. Não tomar em jejum." />
          <Banner tone="warning" icon={<ShieldCheck size={20} />} title="Esta receita ficará disponível no aplicativo assim que for assinada." />
        </Card>

        <Card className={styles.summary}>
          <Eyebrow>Resumo</Eyebrow>
          {items.map((i, idx) => (
            <div key={idx} className={styles.summaryItem}>
              <h3>{i.medication || "Medicamento"} {i.dose}</h3>
              <p>{i.frequency} • {i.duration}</p>
              <p>{i.suggestConfirmation ? "O app pede confirmação de tomada (sugestão)" : "Sem confirmação de tomada"}</p>
            </div>
          ))}
          <hr />
          <span><b>Paciente</b><small>{patient?.fullName}</small></span>
          <span><b>Prescritor</b><small>{doctor.name} • {doctor.crm}</small></span>
          <Button type="submit" fullWidth icon={<ShieldCheck size={18} />} disabled={!valid}>Assinar e enviar</Button>
        </Card>
      </form>

      <Modal open={confirming} onClose={() => setConfirming(false)} title="Confirme o envio da receita" centered>
        <Eyebrow>Assinatura digital</Eyebrow>
        <p className={styles.modalText}>
          A receita será assinada como <b>{doctor.name}, {doctor.crm}</b> e enviada para {patient?.name} e sua rede de cuidadores.
        </p>
        <div className={styles.signature}>{doctor.name.replace(/^Dr\.?\s*/, "")}<span>Assinatura digital verificada</span></div>
        <Button fullWidth onClick={handleSign} loading={createPrescription.isPending}>Confirmar, assinar e enviar</Button>
        <Button fullWidth variant="secondary" style={{ marginTop: 8 }} onClick={() => setConfirming(false)}>Voltar e revisar</Button>
      </Modal>
    </>
  );
}
