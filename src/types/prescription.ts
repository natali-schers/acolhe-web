export interface PrescriptionItem {
  medication: string;
  dose: string;
  frequency: string;
  duration: string;
  /** O médico sugere que o app pergunte se a pessoa tomou. A família decide nas configurações. */
  suggestConfirmation?: boolean;
}

export type PrescriptionStatus = "ativa" | "encerrada";

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorCrm: string;
  issuedAt: string;
  title: string;
  items: PrescriptionItem[];
  instructions: string;
  status: PrescriptionStatus;
  signed: boolean;
}

export interface CreatePrescriptionInput {
  patientId: string;
  items: PrescriptionItem[];
  instructions: string;
}
