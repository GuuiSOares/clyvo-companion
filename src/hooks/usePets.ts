import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { createPet, deletePet, listPets, updatePet } from '../services/petApi';
import type { PetSpecies } from '../constants/petSpecies';

export const PETS_QUERY_KEY = ['pets'] as const;

export function usePetsQuery() {
  const { session } = useAuth();
  const idUsuario = session?.idUsuario;

  return useQuery({
    queryKey: [...PETS_QUERY_KEY, idUsuario],
    queryFn: () => listPets(idUsuario!),
    enabled: !!idUsuario,
  });
}

export function usePetMutations() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const idUsuario = session?.idUsuario;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: PETS_QUERY_KEY });

  const create = useMutation({
    mutationFn: (input: { nome: string; especie: PetSpecies; dtNascimento: string }) => {
      if (!idUsuario) throw new Error('Faça login para cadastrar um pet.');
      return createPet({ ...input, idUsuario });
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (input: {
      idPet: number;
      nome: string;
      especie: PetSpecies;
      dtNascimento: string;
    }) => {
      if (!idUsuario) throw new Error('Faça login para atualizar um pet.');
      return updatePet(input.idPet, {
        idUsuario,
        nome: input.nome,
        especie: input.especie,
        dtNascimento: input.dtNascimento,
      });
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (idPet: number) => deletePet(idPet),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
