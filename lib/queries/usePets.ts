import { useQuery } from '@tanstack/react-query';

import { hasFirebaseConfig } from '../firebase';
import { listMemberPets } from '../pets';
import { useAuthStore } from '../../store/authStore';

export function usePets() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['pets', user?.uid],
    enabled: Boolean(hasFirebaseConfig && user?.uid),
    queryFn: () => listMemberPets(user?.uid ?? ''),
  });
}
