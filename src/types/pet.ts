import type { PetSpecies } from '../constants/petSpecies';

export type Pet = {
  id: string;
  idPet: number;
  idUsuario: number;
  nome: string;
  especie?: PetSpecies;
  dtNascimento: string;
};

export type CheckinRecord = {
  petId: string;
  petName: string;
  metrica: string;
  vlMetrica: number;
  observations: string;
  date: string;
};
