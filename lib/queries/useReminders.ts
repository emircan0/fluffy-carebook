import { useQuery } from '@tanstack/react-query';

import { hasFirebaseConfig } from '../firebase';
import { listReminders } from '../reminders';

export function useReminders(petId: string | undefined) {
  return useQuery({
    queryKey: ['reminders', petId],
    enabled: Boolean(hasFirebaseConfig && petId),
    queryFn: () => listReminders(petId ?? ''),
  });
}
