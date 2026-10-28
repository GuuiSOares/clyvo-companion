import { API_BASE_URL, API_REQUEST_TIMEOUT_MS } from '../constants/api';
import type { ApiAuthTokenResponse } from '../types/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export type ApiTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

const REFRESH_SKEW_MS = 60_000;

let tokens: ApiTokens | null = null;
let refreshPromise: Promise<ApiTokens | null> | null = null;
let onTokensChange: ((next: ApiTokens | null) => void) | null = null;

export function setApiTokens(next: ApiTokens | null) {
  tokens = next;
  onTokensChange?.(next);
}

export function getApiTokens() {
  return tokens;
}

export function setApiTokensListener(listener: ((next: ApiTokens | null) => void) | null) {
  onTokensChange = listener;
}

export function tokensFromAuthResponse(data: ApiAuthTokenResponse): ApiTokens {
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + data.expiresIn * 1000,
  };
}

function readErrorMessage(data: unknown, status: number) {
  if (data && typeof data === 'object') {
    const payload = data as { message?: string; error?: string; detail?: string };
    if (payload.message) return payload.message;
    if (payload.detail) return payload.detail;
    if (payload.error) return payload.error;
  }

  if (status === 401) return 'E-mail ou senha incorretos.';
  if (status === 403) return 'Você não tem permissão para esta ação.';
  if (status === 404) return 'Registro não encontrado.';
  return 'Não foi possível concluir. Tente de novo.';
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  skipRefresh?: boolean;
};

async function refreshApiTokens(): Promise<ApiTokens | null> {
  if (!tokens?.refreshToken) {
    setApiTokens(null);
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  const currentRefresh = tokens.refreshToken;

  refreshPromise = (async () => {
    try {
      const data = await apiRequest<ApiAuthTokenResponse>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken: currentRefresh },
        auth: false,
        skipRefresh: true,
      });
      const next = tokensFromAuthResponse(data);
      setApiTokens(next);
      return next;
    } catch {
      setApiTokens(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function ensureAccessToken(): Promise<string | null> {
  if (!tokens?.accessToken) {
    return null;
  }

  if (tokens.expiresAt - Date.now() > REFRESH_SKEW_MS) {
    return tokens.accessToken;
  }

  const refreshed = await refreshApiTokens();
  return refreshed?.accessToken ?? null;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, skipRefresh = false } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const accessToken = skipRefresh ? tokens?.accessToken ?? null : await ensureAccessToken();
    if (!accessToken) {
      throw new ApiError('Faça login para continuar.', 401);
    }
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'O servidor demorou para responder. Se for a primeira vez, aguarde e tente de novo.',
        0
      );
    }
    throw new ApiError('Não foi possível conectar. Verifique a internet e tente de novo.', 0);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 && auth && !skipRefresh) {
    const refreshed = await refreshApiTokens();
    if (refreshed?.accessToken) {
      return apiRequest<T>(path, { ...options, skipRefresh: true });
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new ApiError(readErrorMessage(data, response.status), response.status);
  }

  return data as T;
}
