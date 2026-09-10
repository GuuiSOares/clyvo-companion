import AsyncStorage from '@react-native-async-storage/async-storage';
import { TUTOR_NAME_KEY, TUTOR_PROFILE_KEY } from '../constants/storage';
import type { TutorProfile } from '../types/tutor';
import { loadAuthSession } from './authData';

export function hasTutorProfile(profile: TutorProfile | null): boolean {
  return !!profile?.nome?.trim();
}

export async function loadTutorProfile(): Promise<TutorProfile | null> {
  const session = await loadAuthSession();
  if (!session) return null;

  const stored = await AsyncStorage.getItem(TUTOR_PROFILE_KEY);
  if (stored) {
    return JSON.parse(stored) as TutorProfile;
  }

  const legacyName = await AsyncStorage.getItem(TUTOR_NAME_KEY);
  if (legacyName?.trim()) {
    const profile: TutorProfile = {
      nome: legacyName.trim(),
      email: session.email,
    };
    await saveTutorProfile(profile);
    return profile;
  }

  if (session.nomeUsuario?.trim()) {
    return {
      nome: session.nomeUsuario.trim(),
      email: session.email,
    };
  }

  return null;
}

export async function saveTutorProfile(profile: TutorProfile): Promise<void> {
  const session = await loadAuthSession();
  if (!session) return;

  const payload: TutorProfile = {
    ...profile,
    email: session.email,
  };

  await AsyncStorage.setItem(TUTOR_PROFILE_KEY, JSON.stringify(payload));
  await AsyncStorage.setItem(TUTOR_NAME_KEY, payload.nome);
}
