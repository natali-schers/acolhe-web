import { apiConfig } from "./config";
import { http } from "./http";
import { appointments } from "@/mocks/db";
import { mockResponse } from "@/mocks/helpers";
import type { Appointment } from "@/types";

const byDate = (a: Appointment, b: Appointment) => a.at.localeCompare(b.at);

export const appointmentService = {
  async listByPatient(patientId: string): Promise<Appointment[]> {
    if (!apiConfig.useMocks) return http.get<Appointment[]>(`/patients/${patientId}/appointments`);
    return mockResponse(appointments.filter((a) => a.patientId === patientId).sort(byDate));
  },

  async listByDoctor(doctorId: string): Promise<Appointment[]> {
    if (!apiConfig.useMocks) return http.get<Appointment[]>(`/doctors/${doctorId}/appointments`);
    return mockResponse(appointments.filter((a) => a.doctorId === doctorId).sort(byDate));
  },
};
