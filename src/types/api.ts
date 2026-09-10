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

export type ApiUsuarioBody = {
  nomeUsuario: string;
  email: string;
  senha: string;
  tpPerfil: ApiPerfil;
};
