import type { ApiLoginBody, ApiUsuario, ApiUsuarioBody } from '../types/api';
import { apiRequest, setApiCredentials } from './httpClient';

export async function loginWithApi(email: string, senha: string): Promise<ApiUsuario> {
  const body: ApiLoginBody = { email, senha };
  const user = await apiRequest<ApiUsuario>('/auth/login', {
    method: 'POST',
    body,
    auth: false,
  });

  setApiCredentials({ email, senha });
  return user;
}

export async function fetchCurrentUser(): Promise<ApiUsuario> {
  return apiRequest<ApiUsuario>('/auth/me');
}

export async function logoutFromApi(): Promise<void> {
  try {
    await apiRequest<void>('/auth/logout', { method: 'POST' });
  } finally {
    setApiCredentials(null);
  }
}

export async function registerTutor(input: {
  nomeUsuario: string;
  email: string;
  senha: string;
}): Promise<ApiUsuario> {
  const body: ApiUsuarioBody = {
    nomeUsuario: input.nomeUsuario,
    email: input.email,
    senha: input.senha,
    tpPerfil: 'TUTOR',
  };

  return apiRequest<ApiUsuario>('/usuarios', {
    method: 'POST',
    body,
    auth: false,
  });
}
