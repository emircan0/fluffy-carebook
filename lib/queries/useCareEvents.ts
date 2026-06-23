import { useQuery } from '@tanstack/react-query';

import { hasFirebaseConfig } from '../firebase';
import { listCareEvents } from '../care';

export function useCareEvents(petId: string | undefined) {
  return useQuery({
    queryKey: ['careEvents', petId],
    enabled: Boolean(hasFirebaseConfig && petId),
    queryFn: () => listCareEvents(petId ?? ''),
  });
}
