export type UserRole = "familiar" | "medico";

export interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  /** Registro profissional, apenas para médicos. */
  crm?: string;
  /** Pacientes que este usuário acompanha. */
  patientIds: string[];
  phone?: string;
  /** Especialidade, apenas para médicos. */
  specialty?: string;
}

export interface Session {
  token: string;
  user: User;
}

/** Cadastro de quem cuida (familiar, vizinho, amigo...). */
export interface RegisterCaregiverInput {
  role: "familiar";
  name: string;
  email: string;
  phone: string;
  password: string;
  /** Código de 6 dígitos mostrado no app da pessoa cuidada. */
  patientCode?: string;
  /** Usado quando a pessoa cuidada ainda não tem cadastro. */
  newPatient?: { name: string; birthYear: number; city: string };
  /** Contatos de nível 2: recebem alertas por WhatsApp/SMS, sem instalar o app. */
  supportContacts: { name: string; phone: string }[];
}

export interface RegisterDoctorInput {
  role: "medico";
  name: string;
  email: string;
  password: string;
  crm: string;
  uf: string;
  specialty: string;
}

export type RegisterInput = RegisterCaregiverInput | RegisterDoctorInput;
