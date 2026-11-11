import { apiConfig } from "./config";
import { http } from "./http";
import { adherence, caregivers, patients, users } from "@/mocks/db";
import { createId, mockError, mockResponse } from "@/mocks/helpers";
import type { Caregiver, Patient, RegisterCaregiverInput, RegisterInput, Session } from "@/types";
import { getInitials } from "@/utils/text";

export interface LoginInput {
  email: string;
  password: string;
}

const fullPermissions = { receivesAlerts: true, canViewHealth: true, canViewRoutine: true };
const alertsOnly = { receivesAlerts: true, canViewHealth: false, canViewRoutine: false };

function nextOrder(patientId: string) {
  return caregivers.filter((c) => c.patientId === patientId).length + 1;
}

/** Vincula a pessoa que está se cadastrando a uma pessoa cuidada (por código ou criando uma nova). */
function resolvePatient(input: RegisterCaregiverInput): Patient | string {
  if (input.patientCode) {
    const found = patients.find((p) => p.inviteCode === input.patientCode);
    return found ?? "Código não encontrado. Confira os 6 números no app da pessoa cuidada.";
  }
  if (input.newPatient) {
    const { name, birthYear, city } = input.newPatient;
    const created: Patient = {
      id: createId("p"), name, fullName: name, initials: getInitials(name),
      age: new Date().getFullYear() - birthYear, city, address: "", status: "estavel",
      lastActivityAt: new Date().toISOString(), batteryLevel: 100, adherence30d: 0,
      inviteCode: String(Math.floor(100000 + Math.random() * 900000)),
    };
    patients.push(created);
    adherence.push({ patientId: created.id, periodDays: 30, taken: 0, scheduled: 0, late: 0, notes: 0, daily: [] });
    return created;
  }
  return "Informe o código ou os dados da pessoa cuidada.";
}

export const authService = {
  async login({ email, password }: LoginInput): Promise<Session> {
    if (!apiConfig.useMocks) return http.post<Session>("/auth/login", { email, password });

    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found || found.password !== password) return mockError("E-mail ou senha incorretos.");
    const { password: _ignored, ...user } = found;
    void _ignored;
    return mockResponse({ token: `mock-token-${user.id}`, user });
  },

  /** Cria a conta de quem cuida (familiar, vizinho...) ou do médico e já devolve a sessão. */
  async register(input: RegisterInput): Promise<Session> {
    if (!apiConfig.useMocks) return http.post<Session>("/auth/register", input);

    const email = input.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === email)) return mockError("Já existe uma conta com este e-mail.");

    const id = createId("u");
    const base = { id, name: input.name.trim(), initials: getInitials(input.name), email, password: input.password };

    if (input.role === "medico") {
      users.push({ ...base, role: "medico", crm: `CRM ${input.crm}-${input.uf}`, specialty: input.specialty, patientIds: [] });
    } else {
      const patient = resolvePatient(input);
      if (typeof patient === "string") return mockError(patient);

      const me: Caregiver = {
        id: createId("c"), patientId: patient.id, name: base.name.split(" ")[0], initials: base.initials,
        relation: "Cuidador(a)", relationType: "familiar", phone: input.phone, order: nextOrder(patient.id),
        status: "ativo", permissions: fullPermissions, level: "cuidador", channels: ["app", "whatsapp", "sms"], waitMinutes: 2,
      };
      caregivers.push(me);
      input.supportContacts.forEach((contact) => {
        caregivers.push({
          id: createId("c"), patientId: patient.id, name: contact.name.trim(), initials: getInitials(contact.name),
          relation: "Contato de apoio", relationType: "outro", phone: contact.phone, order: nextOrder(patient.id),
          status: "convite_pendente", permissions: alertsOnly, level: "apoio", channels: ["whatsapp", "sms"], waitMinutes: 5,
        });
      });
      users.push({ ...base, role: "familiar", phone: input.phone, patientIds: [patient.id] });
    }

    const { password: _ignored, ...user } = users[users.length - 1];
    void _ignored;
    return mockResponse({ token: `mock-token-${user.id}`, user }, 900);
  },

  async logout(): Promise<void> {
    if (!apiConfig.useMocks) return http.post<void>("/auth/logout");
    return mockResponse(undefined, 100);
  },
};
