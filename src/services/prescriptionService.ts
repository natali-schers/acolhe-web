import { apiConfig } from "./config";
import { http } from "./http";
import { prescriptions } from "@/mocks/db";
import { createId, mockResponse } from "@/mocks/helpers";
import type { CreatePrescriptionInput, Prescription, User } from "@/types";

export const prescriptionService = {
  async listByPatient(patientId: string): Promise<Prescription[]> {
    if (!apiConfig.useMocks) return http.get<Prescription[]>(`/patients/${patientId}/prescriptions`);
    return mockResponse(
      prescriptions.filter((p) => p.patientId === patientId).sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    );
  },

  /** Cria, assina e envia a receita para o app do paciente. */
  async createAndSign(input: CreatePrescriptionInput, doctor: User): Promise<Prescription> {
    if (!apiConfig.useMocks) return http.post<Prescription>(`/patients/${input.patientId}/prescriptions`, input);
    const created: Prescription = {
      ...input,
      id: createId("rx"),
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorCrm: doctor.crm ?? "",
      issuedAt: new Date().toISOString(),
      title: input.items.length > 1 ? "Receita" : `Receita de ${input.items[0]?.medication ?? "medicamento"}`,
      status: "ativa",
      signed: true,
    };
    prescriptions.push(created);
    return mockResponse(created, 900);
  },
};
