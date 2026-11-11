import { useCurrentUser } from "@/contexts/AuthContext";
import { usePatient } from "./usePatients";

/**
 * Paciente acompanhado pelo familiar logado.
 * Hoje é o primeiro da lista; quando houver mais de um, dá para trocar por um seletor.
 */
export function useActivePatientId() {
  const user = useCurrentUser();
  return user.patientIds[0];
}

export function useActivePatient() {
  return usePatient(useActivePatientId());
}
