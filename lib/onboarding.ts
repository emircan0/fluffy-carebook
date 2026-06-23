import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';

import { firebaseConfigError } from './auth';
import { firestore, hasFirebaseConfig } from './firebase';

export const onboardingMessages = {
  missingAuth: 'Kurulumu tamamlamak için giriş yapmalısınız.',
  completed: 'Kurulum tamamlandı.',
};

function requireFirestore() {
  if (!hasFirebaseConfig || !firestore) {
    throw new Error(firebaseConfigError);
  }

  return firestore;
}

export async function completeOnboarding(userId: string) {
  if (!userId) {
    throw new Error(onboardingMessages.missingAuth);
  }

  const db = requireFirestore();
  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    onboardingCompleted: true,
    onboardingCompletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function getOnboardingErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Kurulum tamamlanamadı. Lütfen tekrar deneyin.';
}
