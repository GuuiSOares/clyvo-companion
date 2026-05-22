import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_ACCOUNTS_KEY, AUTH_SESSION_KEY } from '../constants/storage';
import type { AuthSession, StoredAuthAccount } from '../types/auth';
import { isValidEmail, isValidPassword, normalizeEmail } from '../utils/validation';

export async function loadAccounts(): Promise<StoredAuthAccount[]> {
  const stored = await AsyncStorage.getItem(AUTH_ACCOUNTS_KEY);
  if (!stored) return [];
  return JSON.parse(stored) as StoredAuthAccount[];
}

async function saveAccounts(accounts: StoredAuthAccount[]): Promise<void> {
  await AsyncStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function loadAuthSession(): Promise<AuthSession | null> {
  const stored = await AsyncStorage.getItem(AUTH_SESSION_KEY);
  if (!stored) return null;
  return JSON.parse(stored) as AuthSession;
}

async function persistSession(email: string): Promise<void> {
  const session: AuthSession = { email };
  await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function hasRegisteredAccount(): Promise<boolean> {
  const accounts = await loadAccounts();
  return accounts.length > 0;
}

export async function registerAccount(
  email: string,
  password: string
): Promise<{ ok: true; session: AuthSession } | { ok: false; message: string }> {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, message: 'Informe um e-mail válido.' };
  }

  if (!isValidPassword(password)) {
    return { ok: false, message: 'A senha deve ter pelo menos 6 caracteres.' };
  }

  const accounts = await loadAccounts();
  if (accounts.length > 0) {
    return {
      ok: false,
      message:
        'Este aparelho já possui uma conta. Faça login ou use "Limpar todos os dados" em Meu Perfil para recomeçar.',
    };
  }

  const exists = accounts.some((account) => account.email === normalizedEmail);
  if (exists) {
    return { ok: false, message: 'Já existe uma conta com este e-mail.' };
  }

  const newAccount: StoredAuthAccount = {
    email: normalizedEmail,
    password,
    createdAt: new Date().toISOString(),
  };

  await saveAccounts([newAccount]);
  await persistSession(normalizedEmail);

  return { ok: true, session: { email: normalizedEmail } };
}

export async function loginAccount(
  email: string,
  password: string
): Promise<{ ok: true; session: AuthSession } | { ok: false; message: string }> {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, message: 'Informe um e-mail válido.' };
  }

  if (!password.trim()) {
    return { ok: false, message: 'Informe sua senha.' };
  }

  const accounts = await loadAccounts();
  const account = accounts.find((item) => item.email === normalizedEmail);

  if (!account || account.password !== password) {
    return { ok: false, message: 'E-mail ou senha incorretos.' };
  }

  await persistSession(normalizedEmail);
  return { ok: true, session: { email: normalizedEmail } };
}

export async function logoutAuth(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
}

export async function clearAuthData(): Promise<void> {
  await AsyncStorage.multiRemove([AUTH_ACCOUNTS_KEY, AUTH_SESSION_KEY]);
}
