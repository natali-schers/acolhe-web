import { apiConfig } from "./config";
import { http } from "./http";
import { timeline } from "@/mocks/db";
import { createId, mockResponse } from "@/mocks/helpers";
import type { CreateNoteInput, TimelineEntry } from "@/types";

export const timelineService = {
  async listByPatient(patientId: string, limit?: number): Promise<TimelineEntry[]> {
    if (!apiConfig.useMocks) {
      return http.get<TimelineEntry[]>(`/patients/${patientId}/timeline${limit ? `?limit=${limit}` : ""}`);
    }
    const list = timeline.filter((t) => t.patientId === patientId).sort((a, b) => b.at.localeCompare(a.at));
    return mockResponse(limit ? list.slice(0, limit) : list);
  },

  async createNote(input: CreateNoteInput, authorName: string): Promise<TimelineEntry> {
    if (!apiConfig.useMocks) return http.post<TimelineEntry>(`/patients/${input.patientId}/timeline`, input);
    const entry: TimelineEntry = { ...input, id: createId("t"), at: new Date().toISOString(), authorName };
    timeline.push(entry);
    return mockResponse(entry);
  },
};
