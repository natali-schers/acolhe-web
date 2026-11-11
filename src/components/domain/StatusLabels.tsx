import { Check, Clock, MessageCircle, MessageSquare, Siren, Smartphone, TriangleAlert } from "lucide-react";
import { StatusTag } from "@/components/ui";
import type { AlertChannel, CaregiverLevel, CaregiverStatus, DoseStatus, PatientStatus } from "@/types";

export function PatientStatusTag({ status, note }: { status: PatientStatus; note?: string }) {
  if (status === "em_alerta") return <StatusTag tone="danger" icon={<Siren size={15} />}>Em alerta</StatusTag>;
  if (status === "atencao") return <StatusTag tone="warning" icon={<TriangleAlert size={15} />}>{note ?? "Requer atenção"}</StatusTag>;
  return <StatusTag tone="success" icon={<Check size={15} />}>Estável</StatusTag>;
}

export function DoseStatusTag({ status }: { status: DoseStatus }) {
  const map = {
    tomado: <StatusTag tone="success" icon={<Check size={15} />}>Tomado</StatusTag>,
    pendente: <StatusTag tone="warning" icon={<Clock size={15} />}>Pendente</StatusTag>,
    atrasado: <StatusTag tone="danger" icon={<TriangleAlert size={15} />}>Atrasado</StatusTag>,
    adiado: <StatusTag tone="info" icon={<Clock size={15} />}>Adiado</StatusTag>,
  } satisfies Record<DoseStatus, React.ReactNode>;
  return map[status];
}

export function CaregiverStatusTag({ status }: { status: CaregiverStatus }) {
  if (status === "convite_pendente") return <StatusTag tone="warning" icon={<Clock size={15} />}>Convite enviado</StatusTag>;
  if (status === "pausado") return <StatusTag>Pausado</StatusTag>;
  return <StatusTag tone="success" icon={<Check size={15} />}>Ativo</StatusTag>;
}

export const relationTypeLabels = {
  familiar: "Familiar",
  vizinho: "Vizinho(a)",
  amigo: "Amigo(a)",
  cuidador_profissional: "Cuidador(a) profissional",
  outro: "Outro",
} as const;

export const channelLabels: Record<AlertChannel, string> = {
  app: "Aplicativo",
  whatsapp: "WhatsApp",
  sms: "SMS",
};

export const levelLabels: Record<CaregiverLevel, string> = {
  cuidador: "Cuidador(a)",
  apoio: "Contato de apoio",
};

const channelIcons: Record<AlertChannel, typeof Smartphone> = { app: Smartphone, whatsapp: MessageCircle, sms: MessageSquare };

/** Canal sempre com ícone E texto, para não depender só de cor ou símbolo. */
export function ChannelTag({ channel, tone = "neutral" }: { channel: AlertChannel; tone?: "neutral" | "info" | "success" | "danger" }) {
  const Icon = channelIcons[channel];
  return <StatusTag tone={tone} icon={<Icon size={15} />}>{channelLabels[channel]}</StatusTag>;
}
