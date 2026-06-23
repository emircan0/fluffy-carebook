import { useQuery } from '@tanstack/react-query';

import { hasFirebaseConfig } from '../firebase';
import { getInvite } from '../invites';

export function useInvite(token: string | undefined) {
  return useQuery({
    queryKey: ['invite', token],
    enabled: Boolean(hasFirebaseConfig && token),
    queryFn: () => getInvite(token ?? ''),
  });
}
