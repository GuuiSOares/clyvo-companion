export const ACTIVITY_LEVELS = ['Normal', 'Quieto', 'Agitado', 'Fraco', 'Ruim'] as const;

export type PetActivityLevel = (typeof ACTIVITY_LEVELS)[number];
