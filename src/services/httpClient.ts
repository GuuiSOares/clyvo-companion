import { API_BASE_URL, API_REQUEST_TIMEOUT_MS } from '../constants/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export type ApiCredentials = {
  email: string;
  senha: string;
};

let credentials: ApiCredentials | null = null;

export function setApiCredentials(next: ApiCredentials | null) {
  credentials = next;
}

export function getApiCredentials() {
  return credentials;
}

function encodeBasicAuth(email: string, senha: string) {
  return `Basic ${globalThis.btoa(`${email}:${senha}`)}`;
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
  credentialsOverride?: ApiCredentials;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, credentialsOverride } = options;
  const creds = credentialsOverride ?? credentials;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    if (!creds) {
      throw new ApiError('Faça login para continuar.', 401);
    }
    headers.Authorization = encodeBasicAuth(creds.email, creds.senha);
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
