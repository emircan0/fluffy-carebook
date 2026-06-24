import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import i18n from './i18n';
import { firebaseConfigError } from './auth';
import { firestore, hasFirebaseConfig } from './firebase';
import type { Measurement } from '../types/app';

export type CreateMeasurementInput = {
  petId: string;
  weight: number;
  height: number | null;
  date: Date;
  notes?: string;
};

export type UpdateMeasurementInput = {
  petId: string;
  measurementId: string;
  weight: number;
  height: number | null;
  date: Date;
  notes?: string;
};

function requireFirestore() {
  if (!hasFirebaseConfig || !firestore) {
    throw new Error(firebaseConfigError);
  }
  return firestore;
}

function parseMeasurement(id: string, data: Record<string, unknown>): Measurement {
  return {
    id,
    petId: typeof data.petId === 'string' ? data.petId : '',
    weight: typeof data.weight === 'number' ? data.weight : 0,
    height: typeof data.height === 'number' ? data.height : null,
    date: data.date,
    notes: typeof data.notes === 'string' ? data.notes : null,
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    deletedAt: data.deletedAt ?? null,
  };
}

export async function fetchMeasurements(petId: string): Promise<Measurement[]> {
  const db = requireFirestore();
  const ref = collection(db, 'pets', petId, 'measurements');
  const q = query(ref, where('deletedAt', '==', null));
  
  const snapshot = await getDocs(q);
  const list = snapshot.docs.map(doc => parseMeasurement(doc.id, doc.data()));

  const getTime = (dateVal: any): number => {
    if (dateVal && typeof dateVal === 'object' && typeof dateVal.toDate === 'function') {
      return dateVal.toDate().getTime();
    }
    if (dateVal && typeof dateVal === 'object' && typeof dateVal.seconds === 'number') {
      return dateVal.seconds * 1000;
    }
    return new Date(dateVal).getTime();
  };

  return list.sort((a, b) => getTime(b.date) - getTime(a.date));
}

export async function createMeasurement({
  petId,
  weight,
  height,
  date,
  notes,
}: CreateMeasurementInput) {
  const db = requireFirestore();
  const { firebaseAuth: auth } = await import('./firebase');
  const user = auth?.currentUser;

  if (!user) {
    throw new Error(i18n.t('pet.authRequiredForMeasurement'));
  }

  const ref = collection(db, 'pets', petId, 'measurements');
  const newRef = doc(ref);

  await runTransaction(db, async (transaction) => {
    transaction.set(newRef, {
      id: newRef.id,
      petId,
      weight,
      height: height || null,
      date,
      notes: notes || null,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      deletedAt: null,
    });
  });

  return newRef.id;
}
