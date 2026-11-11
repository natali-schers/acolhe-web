import { apiConfig } from "./config";
import { http } from "./http";
import { caregivers } from "@/mocks/db";
import { createId, mockError, mockResponse } from "@/mocks/helpers";
import type { Caregiver, InviteCaregiverInput } from "@/types";
import { getInitials } from "@/utils/text";

export const caregiverService = {
  async listByPatient(patientId: string): Promise<Caregiver[]> {
    if (!apiConfig.useMocks) return http.get<Caregiver[]>(`/patients/${patientId}/caregivers`);
    return mockResponse(caregivers.filter((c) => c.patientId === patientId).sort((a, b) => a.order - b.order));
  },

  /** Convida alguém para a rede: familiar, vizinho, amigo... */
  async invite(input: InviteCaregiverInput): Promise<Caregiver> {
    if (!apiConfig.useMocks) return http.post<Caregiver>(`/patients/${input.patientId}/caregivers`, input);
    const order = caregivers.filter((c) => c.patientId === input.patientId).length + 1;
    const created: Caregiver = {
      ...input,
      id: createId("c"),
      initials: getInitials(input.name),
      order,
      status: "convite_pendente",
    };
    caregivers.push(created);
    return mockResponse(created);
  },

  async update(id: string, changes: Partial<Omit<Caregiver, "id" | "patientId">>): Promise<Caregiver> {
    if (!apiConfig.useMocks) return http.patch<Caregiver>(`/caregivers/${id}`, changes);
    const index = caregivers.findIndex((c) => c.id === id);
    if (index < 0) return mockError("Cuidador não encontrado.");
    caregivers[index] = { ...caregivers[index], ...changes };
    return mockResponse(caregivers[index]);
  },

  /** Muda a ordem de acionamento nos alertas. Recebe os ids na nova ordem. */
  async reorder(patientId: string, orderedIds: string[]): Promise<Caregiver[]> {
    if (!apiConfig.useMocks) return http.put<Caregiver[]>(`/patients/${patientId}/caregivers/order`, { orderedIds });
    orderedIds.forEach((id, i) => {
      const c = caregivers.find((x) => x.id === id);
      if (c) c.order = i + 1;
    });
    return this.listByPatient(patientId);
  },

  async remove(id: string): Promise<void> {
    if (!apiConfig.useMocks) return http.delete<void>(`/caregivers/${id}`);
    const index = caregivers.findIndex((c) => c.id === id);
    if (index >= 0) caregivers.splice(index, 1);
    return mockResponse(undefined);
  },
};
