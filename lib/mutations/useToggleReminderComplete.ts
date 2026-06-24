import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toggleReminderComplete } from '../reminders';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';

export type ToggleReminderCompleteInput = {
  petId: string;
  reminderId: string;
  isCompleted: boolean;
};

export function useToggleReminderComplete() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const { t } = useTranslation();
  const userName = profile?.fullName || profile?.email || user?.email || t('auth.guestUser', 'Kullanıcı');

  return useMutation({
    mutationFn: (input: ToggleReminderCompleteInput) =>
      toggleReminderComplete(user?.uid ?? '', input.petId, input.reminderId, input.isCompleted, userName),
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({ queryKey: ['reminders', input.petId] });
      void queryClient.invalidateQueries({ queryKey: ['todayDashboard', input.petId] });
    },
  });
}
