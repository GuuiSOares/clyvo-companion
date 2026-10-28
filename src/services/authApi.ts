import type { ApiAuthTokenResponse, ApiLoginBody, ApiUsuario, ApiUsuarioBody } from '../types/api';
import { apiRequest, setApiTokens, tokensFromAuthResponse } from './httpClient';

export async function loginWithApi(email: string, senha: string): Promise<ApiAuthTokenResponse> {
  const body: ApiLoginBody = { email, senha };
  const data = await apiRequest<ApiAuthTokenResponse>('/auth/login', {
    method: 'POST',
    body,
    auth: false,
  });

  setApiTokens(tokensFromAuthResponse(data));
  return data;
}

export async function fetchCurrentUser(): Promise<ApiUsuario> {
  return apiRequest<ApiUsuario>('/auth/me');
}

export async function logoutFromApi(): Promise<void> {
  try {
    await apiRequest<void>('/auth/logout', { method: 'POST' });
  } finally {
    setApiTokens(null);
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
