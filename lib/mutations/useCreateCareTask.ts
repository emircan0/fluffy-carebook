import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createCareTask, type CreateCareTaskInput } from '../care';
import { useAuthStore } from '../../store/authStore';

export function useCreateCareTask() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (input: CreateCareTaskInput) => createCareTask(user?.uid ?? '', input),
    onSuccess: (_taskId, input) => {
      void queryClient.invalidateQueries({ queryKey: ['careTasks', input.petId] });
      void queryClient.invalidateQueries({ queryKey: ['todayDashboard', input.petId] });
    },
  });
}
