import { apiConfig } from "./config";
import { http } from "./http";
import { careRules, medications } from "@/mocks/db";
import { mockResponse } from "@/mocks/helpers";
import type { CareRules } from "@/types";

/** Padrão sugerido: confirmar remédios de uso contínuo, avisar a pessoa principal após 30 min. */
export function buildDefaultRules(patientId: string): CareRules {
  return {
    patientId,
    medications: medications
      .filter((m) => m.patientId === patientId)
      .map((m) => ({ medicationId: m.id, requiresConfirmation: true, toleranceMinutes: 30, notifyWho: "principal", repeatReminder: true })),
    levels: { reminders: "normal", delays: "urgente" },
    noActivityAlert: false,
    noActivityHours: 12,
    voiceReminders: true,
  };
}

export const careRulesService = {
  async get(patientId: string): Promise<CareRules> {
    if (!apiConfig.useMocks) return http.get<CareRules>(`/patients/${patientId}/care-rules`);
    return mockResponse(careRules.find((r) => r.patientId === patientId) ?? buildDefaultRules(patientId));
  },

  async save(rules: CareRules): Promise<CareRules> {
    if (!apiConfig.useMocks) return http.put<CareRules>(`/patients/${rules.patientId}/care-rules`, rules);
    const index = careRules.findIndex((r) => r.patientId === rules.patientId);
    if (index >= 0) careRules[index] = rules;
    else careRules.push(rules);
    return mockResponse(rules);
  },
};
