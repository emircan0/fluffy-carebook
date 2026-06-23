import { useQuery } from '@tanstack/react-query';
import { fetchExpenses } from '../expenses';
import { hasFirebaseConfig } from '../firebase';

export function useExpenses(petId: string | null) {
  return useQuery({
    queryKey: ['expenses', petId],
    queryFn: async () => {
      if (!petId) return [];
      return fetchExpenses(petId);
    },
    enabled: !!petId && hasFirebaseConfig,
  });
}
