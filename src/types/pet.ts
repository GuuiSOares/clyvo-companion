export type Pet = {
  id: string;
  nome: string;
  raca: string;
  fotoUri: string;
};

export type PetVitals = {
  peso: string;
  ultimaVacina: string;
  statusCirurgia: string;
};

export type CheckinRecord = {
  petId: string;
  petName: string;
  activity: string;
  observations: string;
  date: string;
};
