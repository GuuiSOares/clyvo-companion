export const WELLNESS_OPTIONS = [
  {
    value: 'Normal',
    label: 'Tudo normal',
    hint: 'Comportamento de sempre, bom apetite e energia',
  },
  {
    value: 'Quieto',
    label: 'Mais quieto que o normal',
    hint: 'Menos ativo, mas sem sinais graves',
  },
  {
    value: 'Agitado',
    label: 'Muito agitado',
    hint: 'Inquieto, dificuldade para descansar',
  },
  {
    value: 'Fraco',
    label: 'Fraco ou cansado',
    hint: 'Pouca energia, parece debilitado',
  },
  {
    value: 'Ruim',
    label: 'Algo me preocupa',
    hint: 'Piora visível — vale avisar a clínica',
  },
] as const;

export type PetActivityLevel = (typeof WELLNESS_OPTIONS)[number]['value'];

export function getWellnessLabel(value: PetActivityLevel) {
  const option = WELLNESS_OPTIONS.find((item) => item.value === value);
  return option?.label ?? value;
}

export function getWellnessHint(value: PetActivityLevel) {
  const option = WELLNESS_OPTIONS.find((item) => item.value === value);
  return option?.hint ?? '';
}
