import {
  collectionGroup,
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';

import { firebaseConfigError } from './auth';
import type { UserProfile } from './auth';
import { firestore, hasFirebaseConfig } from './firebase';
import type {
  MemberStatus,
  Pet,
  PetGender,
  PetMemberWithProfile,
  PetRole,
  PetSpecies,
} from '../types/app';

export type CreatePetInput = {
  name: string;
  species: PetSpecies;
  breed?: string;
  gender?: PetGender;
  birthDate?: string;
  microchipNo?: string;
  notes?: string;
};

export const petErrorMessages = {
  missingAuth: 'Pet islemleri icin giris yapmalisiniz.',
  missingName: 'Pet adi zorunlu.',
  missingSpecies: 'Pet turu zorunlu.',
};

function requireFirestore() {
  if (!hasFirebaseConfig || !firestore) {
    throw new Error(firebaseConfigError);
  }

  return firestore;
}

function normalizeText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeBirthDate(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parsePet(id: string, data: Record<string, unknown>): Pet {
  return {
    id,
    name: typeof data.name === 'string' ? data.name : '',
    species: data.species as PetSpecies,
    breed: typeof data.breed === 'string' ? data.breed : null,
    gender: (data.gender as PetGender | undefined) ?? 'unknown',
    birthDate: typeof data.birthDate === 'string' ? data.birthDate : null,
    microchipNo: typeof data.microchipNo === 'string' ? data.microchipNo : null,
    photoUrl: typeof data.photoUrl === 'string' ? data.photoUrl : null,
    notes: typeof data.notes === 'string' ? data.notes : null,
    ownerId: typeof data.ownerId === 'string' ? data.ownerId : '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    deletedAt: data.deletedAt ?? null,
  };
}

export function getPetErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Pet islemi tamamlanamadi. Lutfen tekrar deneyin.';
}

export async function listOwnerPets(userId: string) {
  if (!userId) {
    throw new Error(petErrorMessages.missingAuth);
  }

  const db = requireFirestore();
  const petsRef = collection(db, 'pets');
  const petsQuery = query(petsRef, where('ownerId', '==', userId));
  const snapshot = await getDocs(petsQuery);

  return snapshot.docs
    .map((petDoc) => parsePet(petDoc.id, petDoc.data()))
    .filter((pet) => pet.deletedAt === null);
}

export async function listMemberPets(userId: string) {
  if (!userId) {
    throw new Error(petErrorMessages.missingAuth);
  }

  const db = requireFirestore();
  const membersQuery = query(
    collectionGroup(db, 'members'),
    where('userId', '==', userId),
    where('status', '==', 'active'),
  );
  const memberSnapshot = await getDocs(membersQuery);
  const petIds = Array.from(
    new Set(
      memberSnapshot.docs
        .map((memberDoc) => memberDoc.ref.parent.parent?.id)
        .filter((petId): petId is string => Boolean(petId)),
    ),
  );
  const pets = await Promise.all(
    petIds.map(async (petId) => {
      const petSnapshot = await getDoc(doc(db, 'pets', petId));

      if (!petSnapshot.exists()) {
        return null;
      }

      return parsePet(petSnapshot.id, petSnapshot.data());
    }),
  );

  return pets.filter((pet): pet is Pet => Boolean(pet && pet.deletedAt === null));
}

export async function getPetById(petId: string) {
  const db = requireFirestore();
  const petSnapshot = await getDoc(doc(db, 'pets', petId));

  if (!petSnapshot.exists()) {
    throw new Error('Pet bulunamadi.');
  }

  return parsePet(petSnapshot.id, petSnapshot.data());
}

export async function getCurrentUserMember(petId: string, userId: string) {
  const db = requireFirestore();
  const memberSnapshot = await getDoc(doc(db, 'pets', petId, 'members', userId));

  if (!memberSnapshot.exists()) {
    return null;
  }

  const data = memberSnapshot.data();

  return {
    userId,
    role: data.role as PetRole,
    status: data.status as MemberStatus,
    invitedBy: typeof data.invitedBy === 'string' ? data.invitedBy : null,
    joinedAt: data.joinedAt,
    updatedAt: data.updatedAt,
  };
}

export async function listPetMembers(petId: string) {
  const db = requireFirestore();
  const membersSnapshot = await getDocs(collection(db, 'pets', petId, 'members'));
  const members = membersSnapshot.docs.map((memberDoc) => {
      const data = memberDoc.data();

      return {
        userId: memberDoc.id,
        role: data.role as PetRole,
        status: data.status as MemberStatus,
        invitedBy: typeof data.invitedBy === 'string' ? data.invitedBy : null,
        joinedAt: data.joinedAt,
        updatedAt: data.updatedAt,
        email: typeof data.email === 'string' ? data.email : null,
        fullName: typeof data.fullName === 'string' ? data.fullName : null,
        avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : null,
      } satisfies PetMemberWithProfile;
    });

  return members;
}

export async function createPet(userId: string, profile: UserProfile | null, input: CreatePetInput) {
  if (!userId) {
    throw new Error(petErrorMessages.missingAuth);
  }

  const name = input.name.trim();

  if (!name) {
    throw new Error(petErrorMessages.missingName);
  }

  if (!input.species) {
    throw new Error(petErrorMessages.missingSpecies);
  }

  const db = requireFirestore();
  const petRef = doc(collection(db, 'pets'));
  const memberRef = doc(db, 'pets', petRef.id, 'members', userId);
  const now = serverTimestamp();
  const petData = {
    id: petRef.id,
    name,
    species: input.species,
    breed: normalizeText(input.breed),
    gender: input.gender ?? 'unknown',
    birthDate: normalizeBirthDate(input.birthDate),
    microchipNo: normalizeText(input.microchipNo),
    photoUrl: null,
    notes: normalizeText(input.notes),
    ownerId: userId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  const memberData = {
    userId,
    role: 'owner',
    status: 'active',
    invitedBy: null,
    email: profile?.email ?? null,
    fullName: profile?.fullName ?? null,
    avatarUrl: profile?.avatarUrl ?? null,
    joinedAt: now,
    updatedAt: now,
  };
  const batch = writeBatch(db);

  batch.set(petRef, petData);
  batch.set(memberRef, memberData);

  await batch.commit();

  return {
    ...petData,
    createdAt: null,
    updatedAt: null,
  };
}
