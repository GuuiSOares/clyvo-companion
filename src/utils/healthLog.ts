import type { ApiLogSaude } from '../types/api';
import type { CheckinRecord } from '../types/pet';
import { formatMetricValue, type HealthMetric } from '../constants/healthMetrics';

export type HealthLog = {
  id: string;
  idLog: number;
  idPet: number;
  nomePet: string;
  dtRegistro: string;
  metrica: HealthMetric | string;
  vlMetrica: number;
  observations: string;
};

export function mapApiLog(log: ApiLogSaude): HealthLog {
  const vlMetrica = Number(log.vlMetrica);

  return {
    id: String(log.idLog),
    idLog: log.idLog,
    idPet: log.idPet,
    nomePet: log.nomePet ?? '',
    dtRegistro: log.dtRegistro,
    metrica: log.metrica,
    vlMetrica: Number.isFinite(vlMetrica) ? vlMetrica : 0,
    observations: log.obs?.trim() ?? '',
  };
}

export function formatLogDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso.slice(0, 10);
  }
  return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

export function formatLogSummary(log: Pick<HealthLog, 'metrica' | 'vlMetrica'>) {
  return formatMetricValue(log.metrica, log.vlMetrica);
}

export function nowSaoPauloIso() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00';

  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
}

export function toCheckinRecord(log: HealthLog): CheckinRecord {
  return {
    petId: String(log.idPet),
    petName: log.nomePet,
    metrica: log.metrica,
    vlMetrica: log.vlMetrica,
    observations: log.observations,
    date: formatLogDate(log.dtRegistro),
  };
}

export function getLatestLogForPet(logs: HealthLog[], idPet: number) {
  return logs.find((log) => log.idPet === idPet) ?? null;
}
