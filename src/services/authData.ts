import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  API_CREDENTIALS_KEY,
  API_TOKENS_KEY,
  AUTH_ACCOUNTS_KEY,
  AUTH_SESSION_KEY,
} from '../constants/storage';
import type { AuthSession } from '../types/auth';
import type { ApiTokens } from './httpClient';
import { ApiError, setApiTokens, setApiTokensListener } from './httpClient';
import { loginWithApi, registerTutor } from './authApi';
import { isValidEmail, isValidPassword, normalizeEmail } from '../utils/validation';

async function persistTokens(tokens: ApiTokens | null): Promise<void> {
  try {
    if (!tokens) {
      await SecureStore.deleteItemAsync(API_TOKENS_KEY);
      return;
    }

    await SecureStore.setItemAsync(API_TOKENS_KEY, JSON.stringify(tokens));
  } catch {
    // Sem SecureStore o app segue com o token só na memória da sessão.
  }
}

setApiTokensListener((next) => {
  void persistTokens(next);
});

async function clearStoredTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(API_TOKENS_KEY);
  } catch {
    // Logout local não depende do SecureStore.
  }
}

async function persistSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
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

async function loadApiTokens(): Promise<ApiTokens | null> {
  try {
    const stored = await SecureStore.getItemAsync(API_TOKENS_KEY);
    if (!stored) return null;

    const tokens = JSON.parse(stored) as ApiTokens;
    if (!tokens?.accessToken || !tokens?.refreshToken || !tokens?.expiresAt) {
      return null;
    }
    return tokens;
  } catch {
    return null;
  }
}

export async function restoreApiSession(): Promise<AuthSession | null> {
  await AsyncStorage.removeItem(API_CREDENTIALS_KEY);

  const [tokens, session] = await Promise.all([loadApiTokens(), loadAuthSession()]);

  if (!tokens || !session) {
    await clearAuthData();
    return null;
  }

  setApiTokens(tokens);
  return session;
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
          'Cadastro indisponível no momento. Entre com a conta de demonstração: maria@email.com / senha123.',
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
    const auth = await loginWithApi(normalizedEmail, password);

    if (auth.tpPerfil !== 'TUTOR') {
      setApiTokens(null);
      return {
        ok: false,
        message: 'Este aplicativo é do tutor. Use uma conta com perfil TUTOR.',
      };
    }

    const session = toSession(auth);
    await persistSession(session);
    return { ok: true, session };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Não foi possível entrar.',
    };
  }
}

export async function logoutAuth(): Promise<void> {
  setApiTokens(null);
  try {
    await AsyncStorage.multiRemove([AUTH_SESSION_KEY, API_CREDENTIALS_KEY]);
  } catch {
    // Sessão em memória já foi limpa no AuthContext.
  }
  await clearStoredTokens();
}

export async function clearAuthData(): Promise<void> {
  setApiTokens(null);
  try {
    await AsyncStorage.multiRemove([AUTH_ACCOUNTS_KEY, AUTH_SESSION_KEY, API_CREDENTIALS_KEY]);
  } catch {
    // Ignora falha de limpeza local.
  }
  await clearStoredTokens();
}
