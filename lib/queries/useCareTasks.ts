import { useQuery } from '@tanstack/react-query';

import { hasFirebaseConfig } from '../firebase';
import { listCareTasks } from '../care';

export function useCareTasks(petId: string | undefined) {
  return useQuery({
    queryKey: ['careTasks', petId],
    enabled: Boolean(hasFirebaseConfig && petId),
    queryFn: () => listCareTasks(petId ?? ''),
  });
}
