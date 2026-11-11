/**
 * "Banco de dados" em memória usado enquanto não existe backend.
 * Os serviços em src/services leem e escrevem aqui quando VITE_USE_MOCKS=true.
 * As datas são relativas a hoje para a demonstração parecer sempre atual.
 */
import type {
  AdherenceSummary, Appointment, Caregiver, CareRules, EmergencyAlert, Medication, MedicationDose,
  Patient, Prescription, TimelineEntry, User,
} from "@/types";
import { daysFromToday, minutesAgo, todayAt } from "@/utils/date";

export const users: (User & { password: string })[] = [
  { id: "u-ana", name: "Ana Souza", initials: "AN", email: "ana@exemplo.com", password: "12345678", role: "familiar", patientIds: ["p-maria"] },
  { id: "u-paulo", name: "Dr. Paulo Mendes", initials: "PM", email: "paulo@exemplo.com", password: "12345678", role: "medico", crm: "CRM 123456-SP", patientIds: ["p-maria", "p-jose", "p-helena"] },
];

export const patients: Patient[] = [
  {
    id: "p-maria", name: "Dona Maria", fullName: "Maria Aparecida Souza", initials: "MA", age: 78,
    city: "São Paulo, SP", address: "Rua das Flores, 120", status: "atencao", inviteCode: "482910", phone: "(11) 94444-0000",
    attentionNote: "Relatou tontura", lastActivityAt: minutesAgo(8), batteryLevel: 72, adherence30d: 92,
  },
  {
    id: "p-jose", name: "Seu José", fullName: "José da Silva", initials: "JS", age: 69,
    city: "São Paulo, SP", address: "Av. Brasil, 455", status: "estavel",
    lastActivityAt: minutesAgo(35), batteryLevel: 54, adherence30d: 88,
  },
  {
    id: "p-helena", name: "Dona Helena", fullName: "Helena Costa", initials: "HC", age: 82,
    city: "Santo André, SP", address: "Rua Ipê, 33", status: "estavel",
    lastActivityAt: minutesAgo(90), batteryLevel: 91, adherence30d: 97,
  },
];

const fullPermissions = { receivesAlerts: true, canViewHealth: true, canViewRoutine: true };
/** Contato de apoio (nível 2): só recebe alertas, não instala o app. */
const alertsOnly = { receivesAlerts: true, canViewHealth: false, canViewRoutine: false };

export const caregivers: Caregiver[] = [
  { id: "c-ana", patientId: "p-maria", name: "Ana", initials: "AN", relation: "Filha", relationType: "familiar", phone: "(11) 98888-1111", order: 1, status: "ativo", permissions: fullPermissions, level: "cuidador", channels: ["app", "whatsapp", "sms"], waitMinutes: 2 },
  { id: "c-carlos", patientId: "p-maria", name: "Carlos", initials: "CA", relation: "Neto", relationType: "familiar", phone: "(11) 97777-2222", order: 2, status: "ativo", permissions: fullPermissions, level: "cuidador", channels: ["app", "whatsapp", "sms"], waitMinutes: 3 },
  { id: "c-beatriz", patientId: "p-maria", name: "Beatriz", initials: "BE", relation: "Vizinha (casa 118)", relationType: "vizinho", phone: "(11) 96666-3333", order: 3, status: "ativo", permissions: alertsOnly, level: "apoio", channels: ["whatsapp", "sms"], waitMinutes: 5 },
  { id: "c-jorge", patientId: "p-maria", name: "Seu Jorge", initials: "JO", relation: "Amigo da igreja", relationType: "amigo", phone: "(11) 95555-4444", order: 4, status: "convite_pendente", permissions: alertsOnly, level: "apoio", channels: ["sms"], waitMinutes: 5 },
];

export const medications: Medication[] = [
  { id: "m-losartana", patientId: "p-maria", name: "Losartana", dose: "50 mg", frequency: "A cada 12 horas", instructions: "1 comprimido", times: ["08:00", "20:00"], continuousUse: true, adherence30d: 96 },
  { id: "m-metformina", patientId: "p-maria", name: "Metformina", dose: "850 mg", frequency: "Após o almoço", instructions: "1 comprimido depois do almoço. Não tomar em jejum.", times: ["12:30"], continuousUse: true, adherence30d: 88 },
  { id: "m-sinvastatina", patientId: "p-jose", name: "Sinvastatina", dose: "20 mg", frequency: "À noite", instructions: "1 comprimido", times: ["21:00"], continuousUse: true, adherence30d: 88 },
];

export const doses: MedicationDose[] = [
  { id: "d1", medicationId: "m-losartana", patientId: "p-maria", scheduledAt: todayAt(8, 0), status: "tomado", confirmedBy: "Dona Maria" },
  { id: "d2", medicationId: "m-metformina", patientId: "p-maria", scheduledAt: todayAt(12, 30), status: "tomado", confirmedBy: "Dona Maria" },
  { id: "d3", medicationId: "m-losartana", patientId: "p-maria", scheduledAt: todayAt(20, 0), status: "pendente" },
];

export const timeline: TimelineEntry[] = [
  { id: "t1", patientId: "p-maria", at: todayAt(14, 20), type: "sintoma", title: "Passou mal após a Metformina", description: "Relatou tontura leve depois do almoço. Os sintomas passaram após repouso.", authorName: "Ana", warn: true },
  { id: "t2", patientId: "p-maria", at: todayAt(12, 35), type: "medicacao", title: "Metformina tomada", description: "850 mg • Depois do almoço", authorName: "Dona Maria" },
  { id: "t3", patientId: "p-maria", at: todayAt(10, 15), type: "atividade", title: "Caminhada da manhã", description: "20 minutos no quarteirão", authorName: "Dona Maria" },
  { id: "t4", patientId: "p-maria", at: todayAt(8, 2), type: "medicacao", title: "Losartana tomada", description: "50 mg • No horário", authorName: "Dona Maria" },
  { id: "t5", patientId: "p-maria", at: daysFromToday(-1, 19, 40), type: "anotacao", title: "Jantou bem", description: "Comeu sopa e fruta. Dormiu cedo.", authorName: "Carlos" },
];

export const alerts: EmergencyAlert[] = [
  {
    id: "a1", patientId: "p-maria", createdAt: daysFromToday(-42, 18, 42), triggeredBy: "Dona Maria", status: "resolvido",
    recipients: [{ caregiverId: "c-ana", status: "assumiu", updatedAt: daysFromToday(-42, 18, 43), channel: "app" }],
    assumedByCaregiverId: "c-ana", responseTimeSeconds: 84, resolvedAt: daysFromToday(-42, 19, 5), resultNote: "Tudo bem",
  },
  {
    id: "a2", patientId: "p-maria", createdAt: daysFromToday(-87, 7, 15), triggeredBy: "Dona Maria", status: "resolvido",
    recipients: [
      { caregiverId: "c-ana", status: "enviado", updatedAt: daysFromToday(-87, 7, 15), channel: "sms", failedChannels: ["app", "whatsapp"] },
      { caregiverId: "c-carlos", status: "assumiu", updatedAt: daysFromToday(-87, 7, 18), channel: "whatsapp" },
    ],
    assumedByCaregiverId: "c-carlos", responseTimeSeconds: 188, resolvedAt: daysFromToday(-87, 7, 40), resultNote: "Resolvido",
  },
  {
    id: "a3", patientId: "p-maria", createdAt: daysFromToday(-130, 21, 5), triggeredBy: "Dona Maria", status: "resolvido", offline: true,
    recipients: [
      { caregiverId: "c-ana", status: "enviado", updatedAt: daysFromToday(-130, 21, 5), channel: "sms", failedChannels: ["app"] },
      { caregiverId: "c-beatriz", status: "assumiu", updatedAt: daysFromToday(-130, 21, 11), channel: "whatsapp" },
    ],
    assumedByCaregiverId: "c-beatriz", responseTimeSeconds: 360, resolvedAt: daysFromToday(-130, 21, 40), resultNote: "Queda sem gravidade",
  },
];

export const appointments: Appointment[] = [
  { id: "ap1", patientId: "p-maria", doctorId: "u-paulo", doctorName: "Dr. Paulo Mendes", specialty: "Clínica geral", at: daysFromToday(1, 10, 30), durationMinutes: 30, mode: "online" },
  { id: "ap2", patientId: "p-helena", doctorId: "u-paulo", doctorName: "Dr. Paulo Mendes", specialty: "Clínica geral", at: todayAt(15, 0), durationMinutes: 30, mode: "presencial", location: "Clínica Bem Viver, sala 4" },
  { id: "ap3", patientId: "p-jose", doctorId: "u-paulo", doctorName: "Dr. Paulo Mendes", specialty: "Clínica geral", at: todayAt(16, 30), durationMinutes: 30, mode: "online" },
  { id: "ap4", patientId: "p-jose", doctorId: "u-paulo", doctorName: "Dr. Paulo Mendes", specialty: "Clínica geral", at: daysFromToday(7, 14, 0), durationMinutes: 45, mode: "presencial", location: "Clínica Bem Viver, sala 4" },
  { id: "ap5", patientId: "p-helena", doctorId: "u-paulo", doctorName: "Dr. Paulo Mendes", specialty: "Clínica geral", at: todayAt(9, 0), durationMinutes: 30, mode: "presencial", location: "Clínica Bem Viver, sala 4" },
];

export const prescriptions: Prescription[] = [
  {
    id: "rx1", patientId: "p-maria", doctorId: "u-paulo", doctorName: "Dr. Paulo Mendes", doctorCrm: "CRM 123456-SP",
    issuedAt: daysFromToday(-10, 9, 0), title: "Receita de uso contínuo", status: "ativa", signed: true,
    instructions: "Manter acompanhamento da pressão arterial.",
    items: [
      { medication: "Losartana", dose: "50 mg", frequency: "1 comprimido a cada 12 horas", duration: "Uso contínuo" },
      { medication: "Metformina", dose: "850 mg", frequency: "1 comprimido após o almoço", duration: "Uso contínuo" },
    ],
  },
  {
    id: "rx0", patientId: "p-maria", doctorId: "u-paulo", doctorName: "Dr. Paulo Mendes", doctorCrm: "CRM 123456-SP",
    issuedAt: daysFromToday(-120, 9, 0), title: "Receita de antibiótico", status: "encerrada", signed: true,
    instructions: "Tomar até o fim, mesmo sem sintomas.",
    items: [{ medication: "Amoxicilina", dose: "500 mg", frequency: "1 cápsula a cada 8 horas", duration: "7 dias" }],
  },
];

function buildDaily(seed: number) {
  return Array.from({ length: 30 }, (_, i) => ({
    date: daysFromToday(i - 29),
    percent: Math.min(100, 70 + ((i * seed) % 31)),
  }));
}

export const adherence: AdherenceSummary[] = [
  { patientId: "p-maria", periodDays: 30, taken: 55, scheduled: 60, late: 5, notes: 12, daily: buildDaily(7) },
  { patientId: "p-jose", periodDays: 30, taken: 26, scheduled: 30, late: 4, notes: 3, daily: buildDaily(11) },
  { patientId: "p-helena", periodDays: 30, taken: 58, scheduled: 60, late: 2, notes: 6, daily: buildDaily(5) },
];

/** Regras de cuidado por pessoa cuidada. Criadas sob demanda pelo careRulesService. */
export const careRules: CareRules[] = [];
