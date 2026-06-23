import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createReminder, type CreateReminderInput } from '../reminders';
import { useAuthStore } from '../../store/authStore';

export function useCreateReminder() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (input: CreateReminderInput) => createReminder(user?.uid ?? '', input),
    onSuccess: (_reminderId, input) => {
      void queryClient.invalidateQueries({ queryKey: ['reminders', input.petId] });
      void queryClient.invalidateQueries({ queryKey: ['todayDashboard', input.petId] });
    },
  });
}
