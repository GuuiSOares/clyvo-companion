import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createHealthLog, deleteHealthLog, listHealthLogs, updateHealthLog } from '../services/logSaudeApi';
import type { HealthMetric } from '../constants/healthMetrics';

export const HEALTH_LOGS_QUERY_KEY = ['logs-saude'] as const;

export function useHealthLogsQuery(idPet?: number) {
  return useQuery({
    queryKey: [...HEALTH_LOGS_QUERY_KEY, idPet ?? 'all'],
    queryFn: () => listHealthLogs(idPet && idPet > 0 ? idPet : undefined),
    enabled: idPet === undefined || idPet > 0,
  });
}

export function useHealthLogMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: HEALTH_LOGS_QUERY_KEY });

  const create = useMutation({
    mutationFn: (input: {
      idPet: number;
      metrica: HealthMetric;
      vlMetrica: number;
      observations: string;
    }) => createHealthLog(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (input: {
      idLog: number;
      idPet: number;
      metrica: HealthMetric;
      vlMetrica: number;
      observations: string;
      dtRegistro: string;
    }) =>
      updateHealthLog(input.idLog, {
        idPet: input.idPet,
        metrica: input.metrica,
        vlMetrica: input.vlMetrica,
        observations: input.observations,
        dtRegistro: input.dtRegistro,
      }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (idLog: number) => deleteHealthLog(idLog),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
