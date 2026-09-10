import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CREDENTIALS_KEY, AUTH_ACCOUNTS_KEY, AUTH_SESSION_KEY } from '../constants/storage';
import type { AuthSession } from '../types/auth';
import type { ApiCredentials } from './httpClient';
import { ApiError, setApiCredentials } from './httpClient';
import { fetchCurrentUser, loginWithApi, logoutFromApi, registerTutor } from './authApi';
import { isValidEmail, isValidPassword, normalizeEmail } from '../utils/validation';

async function persistSession(session: AuthSession, senha: string): Promise<void> {
  const credentials: ApiCredentials = { email: session.email, senha };
  await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  await AsyncStorage.setItem(API_CREDENTIALS_KEY, JSON.stringify(credentials));
  setApiCredentials(credentials);
}

function toSession(user: {
  idUsuario: number;
  nomeUsuario: string;
  email: string;
  tpPerfil: AuthSession['tpPerfil'];
}): AuthSession {
  return {
    idUsuario: user.idUsuario,
    nomeUsuario: user.nomeUsuario,
    email: user.email,
    tpPerfil: user.tpPerfil,
  };
}

export async function loadAuthSession(): Promise<AuthSession | null> {
  const stored = await AsyncStorage.getItem(AUTH_SESSION_KEY);
  if (!stored) return null;

  const session = JSON.parse(stored) as AuthSession;
  if (!session?.email || !session.idUsuario) return null;
  return session;
}

export async function loadApiCredentials(): Promise<ApiCredentials | null> {
  const stored = await AsyncStorage.getItem(API_CREDENTIALS_KEY);
  if (!stored) return null;
  return JSON.parse(stored) as ApiCredentials;
}

export async function restoreApiSession(): Promise<AuthSession | null> {
  const credentials = await loadApiCredentials();
  if (!credentials) {
    await clearAuthData();
    return null;
  }

  setApiCredentials(credentials);

  try {
    const user = await fetchCurrentUser();
    if (user.tpPerfil !== 'TUTOR') {
      await clearAuthData();
      setApiCredentials(null);
      return null;
    }

    const session = toSession(user);
    await persistSession(session, credentials.senha);
    return session;
  } catch {
    await clearAuthData();
    setApiCredentials(null);
    return null;
  }
}

export async function registerAccount(
  nomeUsuario: string,
  email: string,
  password: string
): Promise<{ ok: true; session: AuthSession } | { ok: false; message: string }> {
  const trimmedName = nomeUsuario.trim();
  const normalizedEmail = normalizeEmail(email);

  if (!trimmedName) {
    return { ok: false, message: 'Informe seu nome para criar a conta.' };
  }

  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, message: 'Informe um e-mail válido.' };
  }

  if (!isValidPassword(password)) {
    return { ok: false, message: 'A senha deve ter pelo menos 6 caracteres.' };
  }

  try {
    await registerTutor({
      nomeUsuario: trimmedName,
      email: normalizedEmail,
      senha: password,
    });
    return loginAccount(normalizedEmail, password);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return {
        ok: false,
        message:
          'A API ainda não libera cadastro pelo app. Entre com a conta de teste: maria@email.com / senha123.',
      };
    }

    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Não foi possível criar a conta.',
    };
  }
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

  try {
    const user = await loginWithApi(normalizedEmail, password);

    if (user.tpPerfil !== 'TUTOR') {
      setApiCredentials(null);
      return {
        ok: false,
        message: 'Este aplicativo é do tutor. Use uma conta com perfil TUTOR.',
      };
    }

    const session = toSession(user);
    await persistSession(session, password);
    return { ok: true, session };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Não foi possível entrar.',
    };
  }
}

export async function logoutAuth(): Promise<void> {
  try {
    await logoutFromApi();
  } catch {
    setApiCredentials(null);
  }

  await AsyncStorage.multiRemove([AUTH_SESSION_KEY, API_CREDENTIALS_KEY]);
}

export async function clearAuthData(): Promise<void> {
  setApiCredentials(null);
  await AsyncStorage.multiRemove([AUTH_ACCOUNTS_KEY, AUTH_SESSION_KEY, API_CREDENTIALS_KEY]);
}
