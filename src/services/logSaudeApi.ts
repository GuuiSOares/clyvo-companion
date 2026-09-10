import type { ApiLogSaude, ApiLogSaudeBody, ApiPage } from '../types/api';
import type { HealthMetric } from '../constants/healthMetrics';
import { mapApiLog, nowSaoPauloIso, type HealthLog } from '../utils/healthLog';
import { apiRequest } from './httpClient';

function toBody(input: {
  idPet: number;
  metrica: HealthMetric;
  vlMetrica: number;
  observations: string;
  dtRegistro?: string;
}): ApiLogSaudeBody {
  return {
    idPet: input.idPet,
    dtRegistro: input.dtRegistro ?? nowSaoPauloIso(),
    vlMetrica: input.vlMetrica,
    metrica: input.metrica,
    obs: input.observations,
  };
}

export async function listHealthLogs(idPet?: number): Promise<HealthLog[]> {
  const query = idPet
    ? `/logs-saude?idPet=${idPet}&page=0&size=50`
    : '/logs-saude?page=0&size=50';
  const page = await apiRequest<ApiPage<ApiLogSaude>>(query);
  return (page.content ?? []).map(mapApiLog);
}

export async function createHealthLog(input: {
  idPet: number;
  metrica: HealthMetric;
  vlMetrica: number;
  observations: string;
}): Promise<HealthLog> {
  const created = await apiRequest<ApiLogSaude>('/logs-saude', {
    method: 'POST',
    body: toBody(input),
  });
  return mapApiLog(created);
}

export async function updateHealthLog(
  idLog: number,
  input: {
    idPet: number;
    metrica: HealthMetric;
    vlMetrica: number;
    observations: string;
    dtRegistro: string;
  }
): Promise<void> {
  await apiRequest<void>(`/logs-saude/${idLog}`, {
    method: 'PUT',
    body: toBody(input),
  });
}

export async function deleteHealthLog(idLog: number): Promise<void> {
  await apiRequest<void>(`/logs-saude/${idLog}`, { method: 'DELETE' });
}
