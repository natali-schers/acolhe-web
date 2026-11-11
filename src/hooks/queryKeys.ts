/** Chaves do React Query em um só lugar, para facilitar invalidação de cache. */
export const queryKeys = {
  patients: (ids: string[]) => ["patients", ids] as const,
  patient: (id: string) => ["patient", id] as const,
  caregivers: (patientId: string) => ["caregivers", patientId] as const,
  alerts: (patientId: string) => ["alerts", patientId] as const,
  activeAlert: (patientId: string) => ["alerts", patientId, "active"] as const,
  medications: (patientId: string) => ["medications", patientId] as const,
  todayDoses: (patientId: string) => ["doses", patientId, "today"] as const,
  adherence: (patientId: string) => ["adherence", patientId] as const,
  timeline: (patientId: string, limit?: number) => ["timeline", patientId, limit ?? "all"] as const,
  patientAppointments: (patientId: string) => ["appointments", "patient", patientId] as const,
  doctorAppointments: (doctorId: string) => ["appointments", "doctor", doctorId] as const,
  alert: (alertId: string) => ["alert", alertId] as const,
  careRules: (patientId: string) => ["careRules", patientId] as const,
  prescriptions: (patientId: string) => ["prescriptions", patientId] as const,
};
