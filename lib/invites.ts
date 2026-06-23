import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { firebaseConfigError, type UserProfile } from './auth';
import { firestore, hasFirebaseConfig } from './firebase';
import type { PetInvite, PetRole } from '../types/app';

type InviteRole = Extract<PetRole, 'editor' | 'viewer'>;

export type CreateInviteInput = {
  petId: string;
  role: InviteRole;
  invitedByName: string | null;
};

export const inviteMessages = {
  memberLimit: 'Ucretsiz planda en fazla 2 bakici ekleyebilirsin.',
  ownerOnly: 'Sadece owner davet olusturabilir.',
  invalidInvite: 'Davet bulunamadi.',
  expiredInvite: 'Davet suresi dolmus.',
  acceptedInvite: 'Bu davet daha once kabul edilmis.',
};

function requireFirestore() {
  if (!hasFirebaseConfig || !firestore) {
    throw new Error(firebaseConfigError);
  }

  return firestore;
}

function generateInviteToken() {
  const cryptoApi = globalThis.crypto;

  if (cryptoApi?.getRandomValues) {
    const bytes = new Uint8Array(18);
    cryptoApi.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  // Fallback for React Native / Expo Go where globalThis.crypto is not available
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 36; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function parseInvite(id: string, data: Record<string, unknown>): PetInvite {
  return {
    id,
    token: typeof data.token === 'string' ? data.token : id,
    petId: typeof data.petId === 'string' ? data.petId : '',
    petName: typeof data.petName === 'string' ? data.petName : '',
    invitedBy: typeof data.invitedBy === 'string' ? data.invitedBy : '',
    invitedByName: typeof data.invitedByName === 'string' ? data.invitedByName : null,
    role: data.role as InviteRole,
    status: data.status as PetInvite['status'],
    acceptedBy: typeof data.acceptedBy === 'string' ? data.acceptedBy : null,
    createdAt: data.createdAt,
    expiresAt: data.expiresAt,
    acceptedAt: data.acceptedAt ?? null,
  };
}

function isExpired(expiresAt: unknown) {
  if (expiresAt instanceof Timestamp) {
    return expiresAt.toMillis() <= Date.now();
  }

  return false;
}

export function getInviteErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Davet islemi tamamlanamadi. Lutfen tekrar deneyin.';
}

export async function getInvite(token: string) {
  const db = requireFirestore();
  const inviteSnapshot = await getDoc(doc(db, 'invites', token));

  if (!inviteSnapshot.exists()) {
    throw new Error(inviteMessages.invalidInvite);
  }

  return parseInvite(inviteSnapshot.id, inviteSnapshot.data());
}

export async function createInvite(
  userId: string,
  profile: UserProfile | null,
  input: CreateInviteInput,
) {
  if (!userId) {
    throw new Error('Davet olusturmak icin giris yapmalisiniz.');
  }

  const db = requireFirestore();
  const token = generateInviteToken();
  const inviteRef = doc(db, 'invites', token);
  const petRef = doc(db, 'pets', input.petId);
  const memberRef = doc(db, 'pets', input.petId, 'members', userId);
  const membersQuery = query(
    collection(db, 'pets', input.petId, 'members'),
    where('status', '==', 'active'),
  );
  const activeMembersSnapshot = await getDocs(membersQuery);

  if (activeMembersSnapshot.size >= 2) {
    throw new Error(inviteMessages.memberLimit);
  }

  await runTransaction(db, async (transaction) => {
    const [petSnapshot, memberSnapshot] = await Promise.all([
      transaction.get(petRef),
      transaction.get(memberRef),
    ]);

    if (!petSnapshot.exists()) {
      throw new Error('Pet bulunamadi.');
    }

    if (!memberSnapshot.exists() || memberSnapshot.data().role !== 'owner') {
      throw new Error(inviteMessages.ownerOnly);
    }

    const petData = petSnapshot.data();
    const expiresAt = Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000);

    transaction.set(inviteRef, {
      id: token,
      token,
      petId: input.petId,
      petName: typeof petData.name === 'string' ? petData.name : '',
      invitedBy: userId,
      invitedByName: profile?.fullName || profile?.email || null,
      role: input.role,
      status: 'pending',
      acceptedBy: null,
      createdAt: serverTimestamp(),
      expiresAt,
      acceptedAt: null,
    });
  });

  return getInvite(token);
}

export async function acceptInvite(userId: string, profile: UserProfile | null, token: string) {
  if (!userId) {
    throw new Error('Daveti kabul etmek icin giris yapmalisiniz.');
  }

  const db = requireFirestore();
  const inviteRef = doc(db, 'invites', token);

  return runTransaction(db, async (transaction) => {
    const inviteSnapshot = await transaction.get(inviteRef);

    if (!inviteSnapshot.exists()) {
      throw new Error(inviteMessages.invalidInvite);
    }

    const invite = parseInvite(inviteSnapshot.id, inviteSnapshot.data());

    if (invite.status === 'accepted' && invite.acceptedBy === userId) {
      return invite;
    }

    if (invite.status !== 'pending') {
      throw new Error(inviteMessages.acceptedInvite);
    }

    if (isExpired(invite.expiresAt)) {
      throw new Error(inviteMessages.expiredInvite);
    }

    const memberRef = doc(db, 'pets', invite.petId, 'members', userId);
    const activeMembersQuery = query(
      collection(db, 'pets', invite.petId, 'members'),
      where('status', '==', 'active'),
    );
    const activeMembersSnapshot = await getDocs(activeMembersQuery);
    const memberSnapshot = await transaction.get(memberRef);
    const alreadyActive = memberSnapshot.exists() && memberSnapshot.data().status === 'active';

    if (!alreadyActive && activeMembersSnapshot.size >= 2) {
      throw new Error(inviteMessages.memberLimit);
    }

    if (!alreadyActive) {
      transaction.set(memberRef, {
        userId,
        role: invite.role,
        status: 'active',
        invitedBy: invite.invitedBy,
        inviteToken: token,
        email: profile?.email ?? null,
        fullName: profile?.fullName ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
        joinedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    transaction.update(inviteRef, {
      status: 'accepted',
      acceptedBy: userId,
      acceptedAt: serverTimestamp(),
    });

    return {
      ...invite,
      status: 'accepted',
      acceptedBy: userId,
    } satisfies PetInvite;
  });
}
