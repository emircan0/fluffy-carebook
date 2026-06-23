import { useMutation } from '@tanstack/react-query';

import { updateNotificationPreferences } from '../notifications';
import { useAuthStore } from '../../store/authStore';
import type { NotificationPreferences } from '../../types/app';

export function useUpdateNotificationPreferences() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);

  return useMutation({
    mutationFn: (preferences: NotificationPreferences) => (
      updateNotificationPreferences(user?.uid ?? '', preferences)
    ),
    onSuccess: (_result, preferences) => {
      if (profile) {
        setProfile({
          ...profile,
          notificationPreferences: preferences,
          notificationPreferencesUpdatedAt: new Date(),
        });
      }
    },
  });
}
