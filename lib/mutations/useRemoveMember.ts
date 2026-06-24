import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDoc, doc } from 'firebase/firestore';

import { useAuthStore } from '../../store/authStore';
import { firestore, hasFirebaseConfig } from '../firebase';
import { firebaseConfigError } from '../auth';

export function useRemoveMember(petId: string | undefined) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.uid);

  return useMutation({
    mutationFn: async (memberId: string) => {
      if (!userId) throw new Error('Üye silmek için giriş yapmalısınız.');
      if (!petId) throw new Error('Pet ID bulunamadı.');
      if (!hasFirebaseConfig || !firestore) throw new Error(firebaseConfigError);

      const memberRef = doc(firestore, 'pets', petId, 'members', memberId);
      await deleteDoc(memberRef);
    },
    onSuccess: () => {
      if (petId) {
        // Invalidate queries so the member list updates instantly
        queryClient.invalidateQueries({ queryKey: ['petMembers', petId] });
        queryClient.invalidateQueries({ queryKey: ['pet', petId, userId] });
      }
    },
  });
}
