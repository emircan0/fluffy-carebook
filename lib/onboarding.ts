import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';

import { firebaseConfigError } from './auth';
import { firestore, hasFirebaseConfig } from './firebase';

import i18n from './i18n';

export const onboardingMessages = {
  get missingAuth() { return i18n.t('onboarding.missingAuth'); },
  get completed() { return i18n.t('onboarding.completed'); },
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

  return i18n.t('onboarding.genericError');
}
