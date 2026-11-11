/** Hooks de leitura e escrita dos dados de cuidado: alertas, remédios, rotina, consultas e receitas. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import {
  alertService, appointmentService, careRulesService, medicationService, prescriptionService, timelineService,
} from "@/services";
import type { CareRules, CreateNoteInput, CreatePrescriptionInput, User } from "@/types";

export function useAlerts(patientId: string) {
  return useQuery({ queryKey: queryKeys.alerts(patientId), queryFn: () => alertService.listByPatient(patientId) });
}

/** Consulta a cada 15 s. Com backend, troque por WebSocket ou push. */
export function useActiveAlert(patientId: string) {
  return useQuery({
    queryKey: queryKeys.activeAlert(patientId),
    queryFn: () => alertService.getActive(patientId),
    refetchInterval: 15_000,
    enabled: Boolean(patientId),
  });
}

export function useMedications(patientId: string) {
  return useQuery({ queryKey: queryKeys.medications(patientId), queryFn: () => medicationService.listByPatient(patientId) });
}

export function useTodayDoses(patientId: string) {
  return useQuery({ queryKey: queryKeys.todayDoses(patientId), queryFn: () => medicationService.listTodayDoses(patientId) });
}

export function useAdherence(patientId: string) {
  return useQuery({ queryKey: queryKeys.adherence(patientId), queryFn: () => medicationService.getAdherence(patientId) });
}

export function useTimeline(patientId: string, limit?: number) {
  return useQuery({
    queryKey: queryKeys.timeline(patientId, limit),
    queryFn: () => timelineService.listByPatient(patientId, limit),
  });
}

export function useCreateNote(patientId: string, authorName: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNoteInput) => timelineService.createNote(input, authorName),
    onSuccess: () => client.invalidateQueries({ queryKey: ["timeline", patientId] }),
  });
}

export function usePatientAppointments(patientId: string) {
  return useQuery({
    queryKey: queryKeys.patientAppointments(patientId),
    queryFn: () => appointmentService.listByPatient(patientId),
  });
}

export function useDoctorAppointments(doctorId: string) {
  return useQuery({
    queryKey: queryKeys.doctorAppointments(doctorId),
    queryFn: () => appointmentService.listByDoctor(doctorId),
  });
}

export function usePrescriptions(patientId: string) {
  return useQuery({ queryKey: queryKeys.prescriptions(patientId), queryFn: () => prescriptionService.listByPatient(patientId) });
}

export function useCreatePrescription(patientId: string, doctor: User) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePrescriptionInput) => prescriptionService.createAndSign(input, doctor),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.prescriptions(patientId) }),
  });
}

/** Alerta aberto pela página pública de resposta. Atualiza a cada 10 s para refletir quem já assumiu. */
export function useAlert(alertId: string) {
  return useQuery({
    queryKey: queryKeys.alert(alertId),
    queryFn: () => alertService.getById(alertId),
    refetchInterval: 10_000,
    staleTime: 0,
  });
}

export function useRespondToAlert(alertId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ caregiverId, status }: { caregiverId: string; status: "assumiu" | "recusou" }) =>
      alertService.respond(alertId, caregiverId, status),
    onSuccess: (alert) => {
      client.setQueryData(queryKeys.alert(alertId), alert);
      client.invalidateQueries({ queryKey: ["alerts", alert.patientId] });
    },
  });
}

export function useResolveAlert(alertId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (resultNote: string) => alertService.resolve(alertId, resultNote),
    onSuccess: (alert) => {
      client.setQueryData(queryKeys.alert(alertId), alert);
      client.invalidateQueries({ queryKey: ["alerts", alert.patientId] });
    },
  });
}

export function useCareRules(patientId: string) {
  return useQuery({
    queryKey: queryKeys.careRules(patientId),
    queryFn: () => careRulesService.get(patientId),
    enabled: Boolean(patientId),
  });
}

export function useSaveCareRules(patientId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (rules: CareRules) => careRulesService.save(rules),
    onSuccess: (rules) => client.setQueryData(queryKeys.careRules(patientId), rules),
  });
}
