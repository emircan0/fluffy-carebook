import { useMutation } from '@tanstack/react-query';

import { registerPushToken } from '../notifications';
import { useAuthStore } from '../../store/authStore';

export function useRegisterPushToken() {
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: () => registerPushToken(user?.uid ?? ''),
  });
}
