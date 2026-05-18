import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TUTOR_NAME_KEY,
  PETS_STORAGE_KEY,
  SELECTED_PET_ID_KEY,
  LAST_CHECKIN_KEY,
  vitalsStorageKey,
} from '../constants/storage';
import type { Pet, PetVitals, CheckinRecord } from '../types/pet';

const defaultVitals: PetVitals = {
  ultimaVacina: 'Não registrada',
};

export async function loadPets(): Promise<Pet[]> {
  const stored = await AsyncStorage.getItem(PETS_STORAGE_KEY);
  if (!stored) return [];
  return JSON.parse(stored) as Pet[];
}

export async function savePets(pets: Pet[]): Promise<void> {
  await AsyncStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(pets));
}

export async function setSelectedPetId(petId: string): Promise<void> {
  await AsyncStorage.setItem(SELECTED_PET_ID_KEY, petId);
}

export async function getActivePet(pets: Pet[]): Promise<Pet | null> {
  if (pets.length === 0) return null;

  const selectedId = await AsyncStorage.getItem(SELECTED_PET_ID_KEY);
  const selected = pets.find((pet) => pet.id === selectedId);
  return selected ?? pets[0];
}

export async function loadPetVitals(petId: string): Promise<PetVitals> {
  const stored = await AsyncStorage.getItem(vitalsStorageKey(petId));
  if (!stored) return { ...defaultVitals };
  return JSON.parse(stored) as PetVitals;
}

export async function savePetVitals(petId: string, vitals: PetVitals): Promise<void> {
  await AsyncStorage.setItem(vitalsStorageKey(petId), JSON.stringify(vitals));
}

export async function loadLastCheckin(): Promise<CheckinRecord | null> {
  const stored = await AsyncStorage.getItem(LAST_CHECKIN_KEY);
  if (!stored) return null;
  return JSON.parse(stored) as CheckinRecord;
}

export async function saveLastCheckin(checkin: CheckinRecord): Promise<void> {
  await AsyncStorage.setItem(LAST_CHECKIN_KEY, JSON.stringify(checkin));
}

export async function clearAllAppData(): Promise<void> {
  const pets = await loadPets();
  const keys = [
    TUTOR_NAME_KEY,
    PETS_STORAGE_KEY,
    SELECTED_PET_ID_KEY,
    LAST_CHECKIN_KEY,
    ...pets.map((pet) => vitalsStorageKey(pet.id)),
  ];
  await AsyncStorage.multiRemove(keys);
}
