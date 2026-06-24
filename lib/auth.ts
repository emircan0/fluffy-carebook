import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
  EmailAuthProvider,
  updatePassword,
  reauthenticateWithCredential,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type FirestoreError,
} from 'firebase/firestore';

import { firebaseAuth, firestore, hasFirebaseConfig } from './firebase';
import {
  defaultNotificationPreferences,
  normalizeNotificationPreferences,
} from './notificationPreferences';
import i18n from './i18n';
import type { NotificationPreferences } from '../types/app';

export type UserProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  accountStatus: 'active' | 'inactive';
  deactivatedAt: unknown | null;
  isAnonymous: boolean;
  onboardingCompleted: boolean;
  onboardingCompletedAt: unknown | null;
  notificationPreferences: NotificationPreferences;
  notificationPreferencesUpdatedAt: unknown | null;
};

type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export const firebaseConfigError =
  'Firebase config is missing.';
export const accountInactiveError =
  'Account is inactive.';

function requireFirebase() {
  if (!hasFirebaseConfig || !firebaseAuth || !firestore) {
    throw new Error(firebaseConfigError);
  }

  return {
    auth: firebaseAuth,
    db: firestore,
  };
}

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error && error.message === firebaseConfigError) {
    return i18n.t('auth.firebaseConfigError') || firebaseConfigError;
  }

  if (error instanceof Error && error.message === accountInactiveError) {
    return i18n.t('auth.accountInactiveError') || accountInactiveError;
  }

  const code = (error as { code?: string } | undefined)?.code;

  switch (code) {
    case 'auth/email-already-in-use':
      return i18n.t('auth.emailInUse');
    case 'auth/invalid-email':
      return i18n.t('auth.invalidEmail');
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return i18n.t('auth.invalidCredential');
    case 'auth/weak-password':
      return i18n.t('auth.weakPassword');
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return i18n.t('auth.operationNotAllowed');
    case 'permission-denied':
      return i18n.t('auth.permissionDenied');
    default:
      return i18n.t('auth.defaultError');
  }
}

function profileFromUser(user: User, fullName?: string | null): UserProfile {
  return {
    id: user.uid,
    email: user.email ?? null,
    fullName: fullName ?? user.displayName ?? (user.isAnonymous ? i18n.t('auth.guestUser') : null),
    avatarUrl: user.photoURL ?? null,
    accountStatus: 'active',
    deactivatedAt: null,
    isAnonymous: user.isAnonymous ?? false,
    onboardingCompleted: false,
    onboardingCompletedAt: null,
    notificationPreferences: defaultNotificationPreferences,
    notificationPreferencesUpdatedAt: null,
  };
}

export async function ensureUserProfile(user: User, fullName?: string | null): Promise<UserProfile> {
  const { db } = requireFirebase();
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    const data = snapshot.data() as Partial<UserProfile>;

    return {
      id: user.uid,
      email: typeof data.email === 'string' ? data.email : user.email,
      fullName: typeof data.fullName === 'string' ? data.fullName : user.displayName ?? null,
      avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : user.photoURL ?? null,
      accountStatus: data.accountStatus === 'inactive' ? 'inactive' : 'active',
      deactivatedAt: data.deactivatedAt ?? null,
      isAnonymous: data.isAnonymous === true || user.isAnonymous,
      onboardingCompleted: data.onboardingCompleted === true,
      onboardingCompletedAt: data.onboardingCompletedAt ?? null,
      notificationPreferences: normalizeNotificationPreferences(data.notificationPreferences),
      notificationPreferencesUpdatedAt: data.notificationPreferencesUpdatedAt ?? null,
    };
  }

  const profile = profileFromUser(user, fullName);

  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return profile;
}

function assertActiveProfile(profile: UserProfile) {
  if (profile.accountStatus === 'inactive') {
    throw new Error(accountInactiveError);
  }
}

export async function registerWithEmail({ email, password, fullName }: RegisterInput) {
  const { auth } = requireFirebase();
  const trimmedName = fullName.trim();
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

  if (trimmedName) {
    await updateProfile(credential.user, { displayName: trimmedName });
  }

  const profile = await ensureUserProfile(credential.user, trimmedName || null);
  assertActiveProfile(profile);

  return {
    user: credential.user,
    profile,
  };
}

export async function loginWithEmail({ email, password }: LoginInput) {
  const { auth } = requireFirebase();
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const profile = await ensureUserProfile(credential.user);
  assertActiveProfile(profile);

  return {
    user: credential.user,
    profile,
  };
}

export async function loginAsGuest() {
  const { auth } = requireFirebase();
  const credential = await signInAnonymously(auth);
  const profile = await ensureUserProfile(credential.user, i18n.t('auth.guestUser'));
  assertActiveProfile(profile);

  return {
    user: credential.user,
    profile,
  };
}

export async function deactivateCurrentUserAccount(userId: string) {
  if (!userId) {
    throw new Error(i18n.t('auth.loginRequired'));
  }

  const { db } = requireFirebase();
  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    accountStatus: 'inactive',
    deactivatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function logout() {
  const { auth } = requireFirebase();
  await signOut(auth);
}

export async function sendResetEmail(email: string) {
  const { auth } = requireFirebase();
  await sendPasswordResetEmail(auth, email.trim());
}

export function subscribeToAuthState(
  onChange: (user: User | null) => void,
  onError: (error: FirestoreError | Error) => void,
) {
  const { auth } = requireFirebase();

  return onAuthStateChanged(auth, onChange, onError);
}

export async function loginWithGoogleCredential(idToken: string) {
  const { auth } = requireFirebase();
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  const profile = await ensureUserProfile(result.user);
  assertActiveProfile(profile);

  return {
    user: result.user,
    profile,
  };
}

export async function loginWithAppleCredential(idToken: string, rawNonce?: string) {
  const { auth } = requireFirebase();
  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({
    idToken,
    rawNonce,
  });
  const result = await signInWithCredential(auth, credential);
  const profile = await ensureUserProfile(result.user);
  assertActiveProfile(profile);

  return {
    user: result.user,
    profile,
  };
}

export async function updateUserName(newName: string) {
  const { auth, db } = requireFirebase();
  const user = auth.currentUser;
  if (!user) throw new Error(i18n.t('auth.sessionClosed') || 'Oturum acik degil.');

  const trimmedName = newName.trim();
  if (!trimmedName) throw new Error(i18n.t('auth.nameEmpty') || 'Isim bos olamaz.');

  await updateProfile(user, { displayName: trimmedName });

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    fullName: trimmedName,
    updatedAt: serverTimestamp(),
  });
}

export async function changeUserPassword(currentPass: string, newPass: string) {
  const { auth } = requireFirebase();
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error(i18n.t('auth.sessionClosed') || 'Oturum acik degil veya e-posta yok.');

  const credential = EmailAuthProvider.credential(user.email, currentPass);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPass);
}

export async function deactivateAccountWithPassword(password: string) {
  const { auth, db } = requireFirebase();
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error(i18n.t('auth.sessionClosed') || 'Oturum acik degil veya e-posta yok.');

  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    accountStatus: 'inactive',
    deactivatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
