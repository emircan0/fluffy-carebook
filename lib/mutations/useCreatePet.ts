import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPet, type CreatePetInput } from '../pets';
import { useAuthStore } from '../../store/authStore';

export function useCreatePet() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  return useMutation({
    mutationFn: (input: CreatePetInput) => createPet(user?.uid ?? '', profile, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pets', user?.uid] });
    },
  });
}
