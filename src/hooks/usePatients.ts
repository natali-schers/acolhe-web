import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { patientService } from "@/services";

export function usePatients(patientIds: string[]) {
  return useQuery({
    queryKey: queryKeys.patients(patientIds),
    queryFn: () => patientService.list(patientIds),
  });
}

export function usePatient(patientId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.patient(patientId ?? ""),
    queryFn: () => patientService.getById(patientId!),
    enabled: Boolean(patientId),
  });
}
