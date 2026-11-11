import { apiConfig } from "./config";
import { http } from "./http";
import { adherence, doses, medications } from "@/mocks/db";
import { mockError, mockResponse } from "@/mocks/helpers";
import type { AdherenceSummary, Medication, MedicationDose } from "@/types";
import { isSameDay } from "@/utils/date";

export const medicationService = {
  async listByPatient(patientId: string): Promise<Medication[]> {
    if (!apiConfig.useMocks) return http.get<Medication[]>(`/patients/${patientId}/medications`);
    return mockResponse(medications.filter((m) => m.patientId === patientId));
  },

  async listTodayDoses(patientId: string): Promise<MedicationDose[]> {
    if (!apiConfig.useMocks) return http.get<MedicationDose[]>(`/patients/${patientId}/doses?date=today`);
    const today = new Date();
    return mockResponse(
      doses
        .filter((d) => d.patientId === patientId && isSameDay(new Date(d.scheduledAt), today))
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    );
  },

  async getAdherence(patientId: string): Promise<AdherenceSummary> {
    if (!apiConfig.useMocks) return http.get<AdherenceSummary>(`/patients/${patientId}/adherence?days=30`);
    const summary = adherence.find((a) => a.patientId === patientId);
    return summary ? mockResponse(summary) : mockError("Sem dados de adesão.");
  },
};
