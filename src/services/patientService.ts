import { apiConfig } from "./config";
import { http } from "./http";
import { patients } from "@/mocks/db";
import { mockError, mockResponse } from "@/mocks/helpers";
import type { Patient } from "@/types";

export const patientService = {
  async list(patientIds: string[]): Promise<Patient[]> {
    if (!apiConfig.useMocks) return http.get<Patient[]>("/patients");
    return mockResponse(patients.filter((p) => patientIds.includes(p.id)));
  },

  /** Procura a pessoa cuidada pelo código de 6 dígitos mostrado no app dela. */
  async findByCode(code: string): Promise<Patient | null> {
    if (!apiConfig.useMocks) return http.get<Patient | null>(`/patients/by-code/${code}`);
    return mockResponse(patients.find((p) => p.inviteCode === code) ?? null);
  },

  async getById(id: string): Promise<Patient> {
    if (!apiConfig.useMocks) return http.get<Patient>(`/patients/${id}`);
    const patient = patients.find((p) => p.id === id);
    return patient ? mockResponse(patient) : mockError("Paciente não encontrado.");
  },
};
