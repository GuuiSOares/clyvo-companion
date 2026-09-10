import { PET_SPECIES, type PetSpecies } from '../constants/petSpecies';
import type { ApiPage, ApiPet, ApiPetBody } from '../types/api';
import type { Pet } from '../types/pet';
import { apiRequest } from './httpClient';

function parseSpecies(value: string): PetSpecies | undefined {
  return (PET_SPECIES as readonly string[]).includes(value)
    ? (value as PetSpecies)
    : undefined;
}

export function mapApiPet(pet: ApiPet): Pet {
  return {
    id: String(pet.idPet),
    idPet: pet.idPet,
    idUsuario: pet.idUsuario,
    nome: pet.nomePet,
    especie: parseSpecies(pet.especie),
    dtNascimento: pet.dtNascimento?.slice(0, 10) ?? '',
  };
}

function toBody(input: {
  idUsuario: number;
  nome: string;
  especie: PetSpecies;
  dtNascimento: string;
}): ApiPetBody {
  return {
    idUsuario: input.idUsuario,
    nomePet: input.nome,
    especie: input.especie,
    dtNascimento: input.dtNascimento,
  };
}

export async function listPets(idUsuario: number): Promise<Pet[]> {
  const page = await apiRequest<ApiPage<ApiPet>>(
    `/pets?idUsuario=${idUsuario}&page=0&size=50`
  );
  return (page.content ?? []).map(mapApiPet);
}

export async function createPet(input: {
  idUsuario: number;
  nome: string;
  especie: PetSpecies;
  dtNascimento: string;
}): Promise<Pet> {
  const created = await apiRequest<ApiPet>('/pets', {
    method: 'POST',
    body: toBody(input),
  });
  return mapApiPet(created);
}

export async function updatePet(
  idPet: number,
  input: {
    idUsuario: number;
    nome: string;
    especie: PetSpecies;
    dtNascimento: string;
  }
): Promise<void> {
  await apiRequest<void>(`/pets/${idPet}`, {
    method: 'PUT',
    body: toBody(input),
  });
}

export async function deletePet(idPet: number): Promise<void> {
  await apiRequest<void>(`/pets/${idPet}`, { method: 'DELETE' });
}
