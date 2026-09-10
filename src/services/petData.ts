import AsyncStorage from '@react-native-async-storage/async-storage';
import { LAST_CHECKIN_KEY } from '../constants/storage';
import { loadAuthSession } from './authData';
import { listPets } from './petApi';
import type { Pet, CheckinRecord } from '../types/pet';

export async function loadPets(): Promise<Pet[]> {
  const session = await loadAuthSession();
  if (!session?.idUsuario) return [];
  return listPets(session.idUsuario);
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
