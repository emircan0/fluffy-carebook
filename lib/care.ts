import {
  Timestamp,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { firebaseConfigError, type UserProfile } from './auth';
import { firestore, hasFirebaseConfig } from './firebase';
import type {
  CareEvent,
  CareEventStatus,
  CareEventType,
  CareScheduleType,
  CareTask,
} from '../types/app';

export const careEventLabels: Record<CareEventType, string> = {
  food: 'Mama',
  medicine: 'Ilac',
  litter: 'Kum',
  water: 'Su',
  walk: 'Yuruyus',
  bath: 'Banyo',
  grooming: 'Tuy/Tarama',
  other: 'Diger',
};

export const careScheduleLabels: Record<CareScheduleType, string> = {
  none: 'Tek sefer',
  daily: 'Gunluk',
  weekly: 'Haftalik',
  monthly: 'Aylik',
};

export type CreateCareTaskInput = {
  petId: string;
  title: string;
  eventType: CareEventType;
  scheduleType: CareScheduleType;
  dueTime?: string;
  allowMultiplePerDay: boolean;
  notifyEnabled: boolean;
};

export const careMessages = {
  missingAuth: 'Bakim islemleri icin giris yapmalisiniz.',
  missingTitle: 'Gorev basligi zorunlu.',
  editOnly: 'Bu işlem için yetkin yok.',
  alreadyDone: 'Bu görev bugün zaten işaretlenmiş.',
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

function parseCareTask(id: string, data: Record<string, unknown>): CareTask {
  return {
    id,
    petId: typeof data.petId === 'string' ? data.petId : '',
    title: typeof data.title === 'string' ? data.title : '',
    eventType: data.eventType as CareEventType,
    scheduleType: (data.scheduleType as CareScheduleType | undefined) ?? 'none',
    dueTime: typeof data.dueTime === 'string' ? data.dueTime : null,
    isActive: data.isActive !== false,
    allowMultiplePerDay: data.allowMultiplePerDay === true,
    notifyEnabled: data.notifyEnabled === true,
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    deletedAt: data.deletedAt ?? null,
  };
}

function parseCareEvent(id: string, data: Record<string, unknown>): CareEvent {
  return {
    id,
    petId: typeof data.petId === 'string' ? data.petId : '',
    taskId: typeof data.taskId === 'string' ? data.taskId : '',
    taskTitle: typeof data.taskTitle === 'string' ? data.taskTitle : '',
    userId: typeof data.userId === 'string' ? data.userId : '',
    userName: typeof data.userName === 'string' ? data.userName : null,
    eventType: data.eventType as CareEventType,
    status: (data.status as CareEventStatus | undefined) ?? 'done',
    doneAt: data.doneAt,
    occurrenceKey: typeof data.occurrenceKey === 'string' ? data.occurrenceKey : null,
    clientEventId: typeof data.clientEventId === 'string' ? data.clientEventId : '',
    note: typeof data.note === 'string' ? data.note : null,
    createdAt: data.createdAt,
  };
}

function getWeekNumber(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function getOccurrenceKey(scheduleType: CareScheduleType, date = new Date()) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  if (scheduleType === 'daily') {
    return `${year}-${month}-${day}`;
  }

  if (scheduleType === 'weekly') {
    return `${year}-W${pad(getWeekNumber(date))}`;
  }

  if (scheduleType === 'monthly') {
    return `${year}-${month}`;
  }

  return `${year}-${month}-${day}-${date.getTime()}`;
}

function generateClientEventId(userId: string, taskId: string) {
  return `${userId}_${taskId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function safeDocumentId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function getCareErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Bakim islemi tamamlanamadi. Lutfen tekrar deneyin.';
}

export async function listCareTasks(petId: string) {
  const db = requireFirestore();
  const tasksQuery = query(collection(db, 'pets', petId, 'careTasks'), where('isActive', '==', true));
  const snapshot = await getDocs(tasksQuery);

  return snapshot.docs
    .map((taskDoc) => parseCareTask(taskDoc.id, taskDoc.data()))
    .filter((task) => task.deletedAt === null);
}

export async function listCareEvents(petId: string) {
  const db = requireFirestore();
  const eventsQuery = query(
    collection(db, 'pets', petId, 'careEvents'),
    orderBy('doneAt', 'desc'),
    limit(20),
  );
  const snapshot = await getDocs(eventsQuery);

  return snapshot.docs.map((eventDoc) => parseCareEvent(eventDoc.id, eventDoc.data()));
}

export async function createCareTask(userId: string, input: CreateCareTaskInput) {
  if (!userId) {
    throw new Error(careMessages.missingAuth);
  }

  const title = input.title.trim();

  if (!title) {
    throw new Error(careMessages.missingTitle);
  }

  const db = requireFirestore();
  const taskRef = doc(collection(db, 'pets', input.petId, 'careTasks'));
  const memberRef = doc(db, 'pets', input.petId, 'members', userId);

  await runTransaction(db, async (transaction) => {
    const memberSnapshot = await transaction.get(memberRef);
    const memberRole = memberSnapshot.exists() ? memberSnapshot.data().role : null;

    if (!memberSnapshot.exists() || !['owner', 'editor'].includes(memberRole)) {
      throw new Error(careMessages.editOnly);
    }

    transaction.set(taskRef, {
      id: taskRef.id,
      petId: input.petId,
      title,
      eventType: input.eventType,
      scheduleType: input.scheduleType,
      dueTime: normalizeText(input.dueTime),
      isActive: true,
      allowMultiplePerDay: input.allowMultiplePerDay,
      notifyEnabled: input.notifyEnabled,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      deletedAt: null,
    });
  });

  return taskRef.id;
}

export async function markCareEvent(
  userId: string,
  profile: UserProfile | null,
  task: CareTask,
  status: CareEventStatus = 'done',
) {
  if (!userId) {
    throw new Error(careMessages.missingAuth);
  }

  const db = requireFirestore();
  const memberRef = doc(db, 'pets', task.petId, 'members', userId);
  const occurrenceKey = getOccurrenceKey(task.scheduleType);
  const eventRef = task.allowMultiplePerDay
    ? doc(collection(db, 'pets', task.petId, 'careEvents'))
    : doc(db, 'pets', task.petId, 'careEvents', safeDocumentId(`${task.id}_${occurrenceKey}`));

  await runTransaction(db, async (transaction) => {
    const [memberSnapshot, existingEventSnapshot] = await Promise.all([
      transaction.get(memberRef),
      task.allowMultiplePerDay ? Promise.resolve(null) : transaction.get(eventRef),
    ]);
    const memberRole = memberSnapshot.exists() ? memberSnapshot.data().role : null;

    if (!memberSnapshot.exists() || !['owner', 'editor'].includes(memberRole)) {
      throw new Error(careMessages.editOnly);
    }

    if (existingEventSnapshot?.exists()) {
      throw new Error(careMessages.alreadyDone);
    }

    transaction.set(eventRef, {
      id: eventRef.id,
      petId: task.petId,
      taskId: task.id,
      taskTitle: task.title,
      userId,
      userName: profile?.fullName || profile?.email || null,
      eventType: task.eventType,
      status,
      doneAt: Timestamp.now(),
      occurrenceKey,
      clientEventId: generateClientEventId(userId, task.id),
      note: null,
      createdAt: serverTimestamp(),
    });
  });

  return eventRef.id;
}
