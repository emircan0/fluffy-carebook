import { useQuery } from '@tanstack/react-query';

import { hasFirebaseConfig } from '../firebase';
import { getCurrentUserMember, getPetById } from '../pets';
import { useAuthStore } from '../../store/authStore';

export function usePet(petId: string | undefined) {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['pet', petId, user?.uid],
    enabled: Boolean(hasFirebaseConfig && petId && user?.uid),
    queryFn: async () => {
      const [pet, member] = await Promise.all([
        getPetById(petId ?? ''),
        getCurrentUserMember(petId ?? '', user?.uid ?? ''),
      ]);

      return { pet, member };
    },
  });
}
