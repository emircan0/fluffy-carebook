import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteReminder } from '../reminders';
import { useAuthStore } from '../../store/authStore';

type DeleteReminderInput = {
  petId: string;
  reminderId: string;
};

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (input: DeleteReminderInput) =>
      deleteReminder(user?.uid ?? '', input.petId, input.reminderId),
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({ queryKey: ['reminders', input.petId] });
      void queryClient.invalidateQueries({ queryKey: ['todayDashboard', input.petId] });
    },
  });
}
