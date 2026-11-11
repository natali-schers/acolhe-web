/** Regras de cuidado: o que o app pergunta, quando avisa e quem é avisado. Editáveis em Configurações. */
export type NoticeLevel = "discreto" | "normal" | "urgente";

export type NotifyWho = "ninguem" | "principal" | "todos";

export interface MedicationRule {
  medicationId: string;
  /** "Precisa confirmar que tomou?" */
  requiresConfirmation: boolean;
  /** Minutos sem confirmação até a regra agir. */
  toleranceMinutes: number;
  notifyWho: NotifyWho;
  /** Repete o lembrete uma vez depois da tolerância. */
  repeatReminder: boolean;
}

export interface CareRules {
  patientId: string;
  medications: MedicationRule[];
  levels: { reminders: NoticeLevel; delays: NoticeLevel };
  /** Experimental: avisa se o celular ficar parado por muito tempo. */
  noActivityAlert: boolean;
  noActivityHours: number;
  /** Lembretes falados em voz alta no app da pessoa cuidada. */
  voiceReminders: boolean;
}
