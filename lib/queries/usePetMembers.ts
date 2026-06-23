import { useQuery } from '@tanstack/react-query';

import { hasFirebaseConfig } from '../firebase';
import { listPetMembers } from '../pets';

export function usePetMembers(petId: string | undefined) {
  return useQuery({
    queryKey: ['petMembers', petId],
    enabled: Boolean(hasFirebaseConfig && petId),
    queryFn: () => listPetMembers(petId ?? ''),
  });
}
