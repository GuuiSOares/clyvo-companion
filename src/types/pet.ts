import type { PetActivityLevel } from '../constants/activityLevels';
import type { PetSpecies } from '../constants/petSpecies';

export type Pet = {
  id: string;
  nome: string;
  raca: string;
  especie?: PetSpecies;
  peso?: string;
  fotoUri?: string;
};

export type PetVitals = {
  ultimaVacina: string;
};

export type CheckinRecord = {
  petId: string;
  petName: string;
  activity: PetActivityLevel;
  observations: string;
  date: string;
};
