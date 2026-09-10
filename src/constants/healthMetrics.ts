export const HEALTH_METRIC_OPTIONS = [
  {
    value: 'peso',
    label: 'Peso',
    unit: 'kg',
    hint: 'Quanto o pet pesa agora. Use quilogramas, como na balança. Ex.: 12,4',
    placeholder: 'Ex: 12,4',
  },
  {
    value: 'alimentacao',
    label: 'Alimentação',
    unit: 'g',
    hint: 'Quanto ele comeu. Use gramas da ração ou do alimento. Ex.: 250',
    placeholder: 'Ex: 250',
  },
  {
    value: 'exercicio',
    label: 'Exercício',
    unit: 'min',
    hint: 'Quanto tempo ele se movimentou hoje, em minutos. Ex.: 30',
    placeholder: 'Ex: 30',
  },
  {
    value: 'temperatura',
    label: 'Temperatura',
    unit: '°C',
    hint: 'Temperatura do corpo, em graus Celsius. Ex.: 38,5',
    placeholder: 'Ex: 38,5',
  },
  {
    value: 'frequencia_cardiaca',
    label: 'Frequência cardíaca',
    unit: 'bpm',
    hint: 'Batimentos do coração por minuto. Ex.: 80',
    placeholder: 'Ex: 80',
  },
] as const;

export type HealthMetric = (typeof HEALTH_METRIC_OPTIONS)[number]['value'];

export function getHealthMetric(value: string) {
  return HEALTH_METRIC_OPTIONS.find((item) => item.value === value);
}

export function getHealthMetricLabel(value: string) {
  return getHealthMetric(value)?.label ?? value;
}

export function getHealthMetricHint(value: string) {
  return getHealthMetric(value)?.hint ?? '';
}

export function isHealthMetric(value: string): value is HealthMetric {
  return !!getHealthMetric(value);
}

export function parseMetricValue(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  if (!normalized) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function formatMetricValue(metrica?: string | null, value?: number | null) {
  const option = getHealthMetric(metrica ?? '');
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return option?.label ?? metrica ?? '—';
  }

  const formatted = Number.isInteger(numeric)
    ? String(numeric)
    : numeric.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

  return option ? `${formatted} ${option.unit}` : formatted;
}

