export function normalizePetWeight(peso: string): string {
  const trimmed = peso.trim();
  if (!trimmed) return trimmed;

  const withKg = trimmed.match(/^([\d.,]+)\s*kg$/i);
  if (withKg) {
    return `${withKg[1].replace(',', '.')} kg`;
  }

  const onlyNumber = trimmed.match(/^([\d.,]+)$/);
  if (onlyNumber) {
    return `${onlyNumber[1].replace(',', '.')} kg`;
  }

  if (/kg/i.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}

export function formatPetWeight(peso?: string, emptyLabel = 'Peso não informado'): string {
  const trimmed = peso?.trim();
  if (!trimmed) return emptyLabel;
  return normalizePetWeight(trimmed);
}
