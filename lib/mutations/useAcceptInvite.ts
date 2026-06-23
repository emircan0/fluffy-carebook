import { useMutation, useQueryClient } from '@tanstack/react-query';

import { acceptInvite } from '../invites';
import { useAuthStore } from '../../store/authStore';

export function useAcceptInvite() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  return useMutation({
    mutationFn: (token: string) => acceptInvite(user?.uid ?? '', profile, token),
    onSuccess: (invite) => {
      void queryClient.invalidateQueries({ queryKey: ['invite', invite.token] });
      void queryClient.invalidateQueries({ queryKey: ['pets', user?.uid] });
    },
  });
}
