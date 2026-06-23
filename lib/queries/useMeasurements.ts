import { useQuery } from '@tanstack/react-query';
import { fetchMeasurements } from '../measurements';
import { hasFirebaseConfig } from '../firebase';

export function useMeasurements(petId: string | null) {
  return useQuery({
    queryKey: ['measurements', petId],
    queryFn: async () => {
      if (!petId) return [];
      return fetchMeasurements(petId);
    },
    enabled: !!petId && hasFirebaseConfig,
  });
}
