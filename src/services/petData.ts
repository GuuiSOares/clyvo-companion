import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TUTOR_NAME_KEY,
  TUTOR_PROFILE_KEY,
  PETS_STORAGE_KEY,
  LAST_CHECKIN_KEY,
} from '../constants/storage';
import { clearAuthData } from './authData';
import type { Pet, CheckinRecord } from '../types/pet';

export async function loadPets(): Promise<Pet[]> {
  const stored = await AsyncStorage.getItem(PETS_STORAGE_KEY);
  if (!stored) return [];
  return JSON.parse(stored) as Pet[];
}

export async function savePets(pets: Pet[]): Promise<void> {
  await AsyncStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(pets));
}

export function getHighlightedPet(pets: Pet[], lastCheckin: CheckinRecord | null): Pet | null {
  if (pets.length === 0) return null;
  if (lastCheckin) {
    const fromCheckin = pets.find((pet) => pet.id === lastCheckin.petId);
    if (fromCheckin) return fromCheckin;
  }
  return pets[0];
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
  await clearAuthData();
  await AsyncStorage.multiRemove([
    TUTOR_NAME_KEY,
    TUTOR_PROFILE_KEY,
    PETS_STORAGE_KEY,
    LAST_CHECKIN_KEY,
  ]);
}
