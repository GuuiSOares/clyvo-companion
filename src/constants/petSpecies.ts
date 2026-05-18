export const PET_SPECIES = [
  'Cachorro',
  'Gato',
  'Peixe',
  'Pássaro',
  'Coelho',
  'Hamster',
  'Outro',
] as const;

export type PetSpecies = (typeof PET_SPECIES)[number];

export const PET_SPECIES_OPTIONS: { value: PetSpecies; icon: string }[] = [
  { value: 'Cachorro', icon: '🐕' },
  { value: 'Gato', icon: '🐈' },
  { value: 'Peixe', icon: '🐠' },
  { value: 'Pássaro', icon: '🐦' },
  { value: 'Coelho', icon: '🐰' },
  { value: 'Hamster', icon: '🐹' },
  { value: 'Outro', icon: '🐾' },
];

export function formatPetSpecies(especie?: PetSpecies, raca?: string) {
  if (especie && raca) return `${especie} · ${raca}`;
  if (especie) return especie;
  return raca ?? '';
}
