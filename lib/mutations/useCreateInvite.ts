import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createInvite, type CreateInviteInput } from '../invites';
import { useAuthStore } from '../../store/authStore';

export function useCreateInvite() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  return useMutation({
    mutationFn: (input: CreateInviteInput) => createInvite(user?.uid ?? '', profile, input),
    onSuccess: (invite) => {
      void queryClient.invalidateQueries({ queryKey: ['invite', invite.token] });
    },
  });
}
