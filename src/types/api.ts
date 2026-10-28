export type ApiPerfil = 'TUTOR' | 'VETERINARIO';

export type ApiUsuario = {
  idUsuario: number;
  nomeUsuario: string;
  email: string;
  tpPerfil: ApiPerfil;
};

export type ApiLoginBody = {
  email: string;
  senha: string;
};

export type ApiAuthTokenResponse = ApiUsuario & {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

export type ApiRefreshBody = {
  refreshToken: string;
};

export type ApiUsuarioBody = {
  nomeUsuario: string;
  email: string;
  senha: string;
  tpPerfil: ApiPerfil;
};

export type ApiPage<T> = {
  content: T[];
};

export type ApiPet = {
  idPet: number;
  idUsuario: number;
  nomePet: string;
  especie: string;
  dtNascimento: string;
  dtCadastro?: string;
};

export type ApiPetBody = {
  idUsuario: number;
  nomePet: string;
  especie: string;
  dtNascimento: string;
};

export type ApiLogSaude = {
  idLog: number;
  idPet: number;
  nomePet?: string;
  dtRegistro: string;
  vlMetrica: number;
  metrica: string;
  obs: string;
};

export type ApiLogSaudeBody = {
  idPet: number;
  dtRegistro: string;
  vlMetrica: number;
  metrica: string;
  obs: string;
};
