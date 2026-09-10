import type { ApiPerfil } from './api';

export type AuthSession = {
  idUsuario: number;
  nomeUsuario: string;
  email: string;
  tpPerfil: ApiPerfil;
};

export type StoredAuthAccount = {
  email: string;
  password: string;
  createdAt: string;
};
