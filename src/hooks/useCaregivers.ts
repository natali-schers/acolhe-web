import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { caregiverService } from "@/services";
import type { Caregiver, InviteCaregiverInput } from "@/types";

export function useCaregivers(patientId: string) {
  return useQuery({
    queryKey: queryKeys.caregivers(patientId),
    queryFn: () => caregiverService.listByPatient(patientId),
  });
}

export function useInviteCaregiver(patientId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteCaregiverInput) => caregiverService.invite(input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.caregivers(patientId) }),
  });
}

export function useUpdateCaregiver(patientId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<Caregiver> }) => caregiverService.update(id, changes),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.caregivers(patientId) }),
  });
}

export function useReorderCaregivers(patientId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => caregiverService.reorder(patientId, orderedIds),
    onSuccess: (list) => client.setQueryData(queryKeys.caregivers(patientId), list),
  });
}

export function useRemoveCaregiver(patientId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => caregiverService.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.caregivers(patientId) }),
  });
}
