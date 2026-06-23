import { useMutation, useQueryClient } from '@tanstack/react-query';

import { completeOnboarding } from '../onboarding';
import { useAuthStore } from '../../store/authStore';

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);

  return useMutation({
    mutationFn: () => completeOnboarding(user?.uid ?? ''),
    onSuccess: () => {
      if (profile) {
        setProfile({
          ...profile,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
        });
      }

      void queryClient.invalidateQueries({ queryKey: ['pets', user?.uid] });
    },
  });
}
