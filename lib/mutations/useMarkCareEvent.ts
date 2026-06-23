import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markCareEvent } from '../care';
import { useAuthStore } from '../../store/authStore';
import type { CareTask } from '../../types/app';

export function useMarkCareEvent(petId: string | undefined) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  return useMutation({
    mutationFn: (task: CareTask) => markCareEvent(user?.uid ?? '', profile, task),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['careEvents', petId] });
      void queryClient.invalidateQueries({ queryKey: ['careTasks', petId] });
      void queryClient.invalidateQueries({ queryKey: ['todayDashboard', petId] });
    },
  });
}
