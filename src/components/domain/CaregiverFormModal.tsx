import { useEffect, useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Button, Modal, SelectField, Switch, TextField } from "@/components/ui";
import { useInviteCaregiver, useRemoveCaregiver, useUpdateCaregiver } from "@/hooks/useCaregivers";
import type { AlertChannel, Caregiver, CaregiverLevel, CaregiverPermissions, CaregiverRelationType } from "@/types";
import { MessagePreview } from "./MessagePreview";
import { channelLabels, relationTypeLabels } from "./StatusLabels";

interface CaregiverFormModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  /** Sem cuidador = convite novo. Com cuidador = edição. */
  caregiver?: Caregiver | null;
  /** Nível do convite novo. Na edição vale o nível já salvo. */
  level?: CaregiverLevel;
}

const fullPermissions: CaregiverPermissions = { receivesAlerts: true, canViewHealth: false, canViewRoutine: true };
const alertsOnly: CaregiverPermissions = { receivesAlerts: true, canViewHealth: false, canViewRoutine: false };

const waitOptions = [1, 2, 3, 5, 10].map((m) => ({ value: String(m), label: `${m} minuto${m > 1 ? "s" : ""}` }));

/** Canais que a pessoa pode receber. Contato de apoio não tem o app. */
const channelsFor = (level: CaregiverLevel): AlertChannel[] => (level === "cuidador" ? ["app", "whatsapp", "sms"] : ["whatsapp", "sms"]);

/** Monta a lista em ordem: o preferido primeiro e, se pedido, os outros como reserva. */
function buildChannels(level: CaregiverLevel, preferred: AlertChannel, fallback: boolean): AlertChannel[] {
  const all = channelsFor(level);
  return fallback ? [preferred, ...all.filter((c) => c !== preferred)] : [preferred];
}

export function CaregiverFormModal({ open, onClose, patientId, patientName, caregiver, level: newLevel = "cuidador" }: CaregiverFormModalProps) {
  const invite = useInviteCaregiver(patientId);
  const update = useUpdateCaregiver(patientId);
  const remove = useRemoveCaregiver(patientId);
  const editing = Boolean(caregiver);
  const level: CaregiverLevel = caregiver?.level ?? newLevel;
  const isSupport = level === "apoio";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("");
  const [relationType, setRelationType] = useState<CaregiverRelationType>("familiar");
  const [permissions, setPermissions] = useState<CaregiverPermissions>(fullPermissions);
  const [paused, setPaused] = useState(false);
  const [preferred, setPreferred] = useState<AlertChannel>("app");
  const [fallback, setFallback] = useState(true);
  const [waitMinutes, setWaitMinutes] = useState(3);

  useEffect(() => {
    if (!open) return;
    const lvl = caregiver?.level ?? newLevel;
    setName(caregiver?.name ?? "");
    setPhone(caregiver?.phone ?? "");
    setRelation(caregiver?.relation ?? "");
    setRelationType(caregiver?.relationType ?? (lvl === "apoio" ? "vizinho" : "familiar"));
    setPermissions(caregiver?.permissions ?? (lvl === "apoio" ? alertsOnly : fullPermissions));
    setPaused(caregiver?.status === "pausado");
    setPreferred(caregiver?.channels[0] ?? (lvl === "apoio" ? "whatsapp" : "app"));
    setFallback(caregiver ? caregiver.channels.length > 1 : true);
    setWaitMinutes(caregiver?.waitMinutes ?? (lvl === "apoio" ? 5 : 3));
  }, [open, caregiver, newLevel]);

  const setPermission = (key: keyof CaregiverPermissions) => (value: boolean) => setPermissions((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const channels = buildChannels(level, preferred, fallback);
    if (caregiver) {
      const status = caregiver.status === "convite_pendente" ? caregiver.status : paused ? "pausado" : "ativo";
      await update.mutateAsync({ id: caregiver.id, changes: { name, phone, relation, relationType, permissions, status, channels, waitMinutes } });
    } else {
      await invite.mutateAsync({ patientId, name, phone, relation, relationType, permissions, level, channels, waitMinutes });
    }
    onClose();
  };

  const handleRemove = async () => {
    if (!caregiver) return;
    if (!window.confirm(`Remover ${caregiver.name} da rede? Essa pessoa deixará de receber alertas.`)) return;
    await remove.mutateAsync(caregiver.id);
    onClose();
  };

  const valid = name.trim() && phone.trim() && relation.trim();
  const title = editing ? `Editar ${caregiver?.name}` : isSupport ? "Adicionar contato de apoio" : "Convidar cuidador";

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {!editing && (
        <p style={{ color: "var(--color-text-muted)", margin: "0 0 4px" }}>
          {isSupport
            ? `Vizinho, amigo ou parente distante que ajuda ${patientName} só em emergências. Recebe o alerta por WhatsApp ou SMS, sem instalar nada e sem ver rotina ou receitas.`
            : `Alguém da família ou de confiança que acompanha ${patientName} pelo aplicativo. Recebe um convite por SMS para baixar o app.`}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        <TextField
          label={isSupport ? "Celular (com WhatsApp, se tiver)" : "Celular"}
          type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="(11) 90000-0000" autoComplete="tel"
        />
        <SelectField
          label="Tipo de vínculo"
          value={relationType}
          onChange={(e) => setRelationType(e.target.value as CaregiverRelationType)}
          options={Object.entries(relationTypeLabels).map(([value, label]) => ({ value, label }))}
        />
        <TextField label="Como aparece na rede" value={relation} onChange={(e) => setRelation(e.target.value)} required placeholder="Ex.: Filha, Vizinha do 118, Amigo da igreja" />

        <SelectField
          label="Como avisar primeiro"
          value={preferred}
          onChange={(e) => setPreferred(e.target.value as AlertChannel)}
          options={channelsFor(level).map((c) => ({ value: c, label: channelLabels[c] }))}
          hint="O aviso chega por este canal primeiro."
        />
        <Switch
          label="Se não funcionar, tentar os outros canais"
          description={`Ex.: sem internet, o aviso segue por ${isSupport ? "SMS" : "WhatsApp e SMS"}.`}
          checked={fallback}
          onChange={setFallback}
        />
        <SelectField
          label="Esperar quanto tempo antes de avisar a próxima pessoa?"
          value={String(waitMinutes)}
          onChange={(e) => setWaitMinutes(Number(e.target.value))}
          options={waitOptions}
        />

        {!isSupport && (
          <>
            <Switch label="Recebe alertas de emergência" description="É avisado quando alguém aperta o botão de ajuda." checked={permissions.receivesAlerts} onChange={setPermission("receivesAlerts")} />
            <Switch label="Pode ver a rotina" description="Remédios tomados, anotações e atividades." checked={permissions.canViewRoutine} onChange={setPermission("canViewRoutine")} />
            <Switch label="Pode ver dados de saúde" description="Receitas, consultas e relatórios médicos." checked={permissions.canViewHealth} onChange={setPermission("canViewHealth")} />
          </>
        )}
        {editing && caregiver?.status !== "convite_pendente" && (
          <Switch label="Pausar temporariamente" description="Ex.: viagem ou férias. Não recebe alertas enquanto estiver pausado." checked={paused} onChange={setPaused} />
        )}

        <MessagePreview channel={preferred} patientName={patientName} needsApp={!isSupport} kind={editing ? "alerta" : "convite"} />

        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          {editing && (
            <Button variant="dangerOutline" icon={<Trash2 size={18} />} onClick={handleRemove} loading={remove.isPending}>Remover</Button>
          )}
          <Button type="submit" style={{ flex: 1 }} disabled={!valid} loading={invite.isPending || update.isPending}>
            {editing ? "Salvar alterações" : "Enviar convite"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
