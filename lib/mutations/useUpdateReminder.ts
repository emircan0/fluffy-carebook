import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateReminder, type UpdateReminderInput } from '../reminders';
import { useAuthStore } from '../../store/authStore';

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (input: UpdateReminderInput) => updateReminder(user?.uid ?? '', input),
    onSuccess: (_reminderId, input) => {
      void queryClient.invalidateQueries({ queryKey: ['reminders', input.petId] });
      void queryClient.invalidateQueries({ queryKey: ['todayDashboard', input.petId] });
    },
  });
}
