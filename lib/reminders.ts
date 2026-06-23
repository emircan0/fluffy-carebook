import {
  Timestamp,
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { firebaseConfigError } from './auth';
import { firestore, hasFirebaseConfig } from './firebase';
import type { Reminder, ReminderRecurrence, ReminderType } from '../types/app';

export const reminderTypeLabels: Record<ReminderType, string> = {
  vaccine: 'Aşı',
  internal_parasite: 'İç parazit',
  external_parasite: 'Dış parazit',
  medicine: 'İlaç',
  vet: 'Veteriner',
  other: 'Diğer',
};

export const reminderRecurrenceLabels: Record<ReminderRecurrence, string> = {
  none: 'Tek sefer',
  daily: 'Günlük',
  weekly: 'Haftalık',
  monthly: 'Aylık',
  yearly: 'Yıllık',
};

export const reminderTypeIcons: Record<ReminderType, string> = {
  vaccine: '💉',
  internal_parasite: '🛡️',
  external_parasite: '🐾',
  medicine: '💊',
  vet: '🩺',
  other: '📌',
};

export type CreateReminderInput = {
  petId: string;
  title: string;
  reminderType: ReminderType;
  remindAt: Date;
  recurrence?: ReminderRecurrence;
  notifyEnabled?: boolean;
};

export type UpdateReminderInput = {
  petId: string;
  reminderId: string;
  title: string;
  reminderType: ReminderType;
  remindAt: Date;
  recurrence: ReminderRecurrence;
  notifyEnabled: boolean;
  isActive: boolean;
};

export const reminderMessages = {
  missingAuth: 'Hatırlatıcı işlemleri için giriş yapmalısınız.',
  missingTitle: 'Hatırlatıcı başlığı zorunlu.',
  missingDate: 'Hatırlatıcı tarihi zorunlu.',
  editOnly: 'Bu işlem için owner veya editor rolü gerekir.',
  invalidDate: 'Tarih formatı geçerli değil.',
};

function requireFirestore() {
  if (!hasFirebaseConfig || !firestore) {
    throw new Error(firebaseConfigError);
  }

  return firestore;
}

function parseReminder(id: string, data: Record<string, unknown>): Reminder {
  return {
    id,
    petId: typeof data.petId === 'string' ? data.petId : '',
    title: typeof data.title === 'string' ? data.title : '',
    reminderType: (data.reminderType as ReminderType | undefined) ?? 'other',
    remindAt: data.remindAt,
    recurrence: (data.recurrence as ReminderRecurrence | undefined) ?? 'none',
    notifyEnabled: data.notifyEnabled !== false,
    isActive: data.isActive !== false,
    isCompleted: data.isCompleted === true,
    completedAt: data.completedAt ?? null,
    completedBy: typeof data.completedBy === 'string' ? data.completedBy : undefined,
    completedByName: typeof data.completedByName === 'string' ? data.completedByName : undefined,
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    deletedAt: data.deletedAt ?? null,
  };
}

export function toReminderDate(value: unknown) {
  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate();
  }

  return null;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffLocalDays(left: Date, right: Date) {
  const leftDay = startOfLocalDay(left);
  const rightDay = startOfLocalDay(right);

  return Math.round((leftDay.getTime() - rightDay.getTime()) / 86_400_000);
}

export function formatReminderDateLabel(value: unknown, now = new Date()) {
  const date = toReminderDate(value);

  if (!date) {
    return '';
  }

  const diffDays = diffLocalDays(date, now);

  if (diffDays === 0) {
    return 'Bugün';
  }

  if (diffDays === 1) {
    return 'Yarın';
  }

  if (diffDays > 1 && diffDays <= 14) {
    return `${diffDays} gün sonra`;
  }

  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export function parseReminderDateInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(reminderMessages.missingDate);
  }

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  if (!dateMatch) {
    throw new Error(reminderMessages.invalidDate);
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const date = new Date(year, month - 1, day, 9, 0, 0, 0);

  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    throw new Error(reminderMessages.invalidDate);
  }

  return date;
}

export function formatReminderDateInput(value: unknown) {
  const date = toReminderDate(value);

  if (!date) {
    return '';
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

export function getUpcomingReminders(reminders: Reminder[], now = new Date(), daysAhead = 30) {
  const start = startOfLocalDay(now);
  const end = new Date(start);
  end.setDate(start.getDate() + daysAhead);

  return reminders
    .filter((reminder) => reminder.isActive && reminder.deletedAt === null)
    .filter((reminder) => {
      const remindAt = toReminderDate(reminder.remindAt);

      return remindAt ? remindAt >= start && remindAt <= end : false;
    })
    .sort((left, right) => {
      const leftTime = toReminderDate(left.remindAt)?.getTime() ?? 0;
      const rightTime = toReminderDate(right.remindAt)?.getTime() ?? 0;

      return leftTime - rightTime;
    });
}

export function getReminderErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Hatırlatıcı işlemi tamamlanamadı. Lütfen tekrar deneyin.';
}

export async function listReminders(petId: string) {
  const db = requireFirestore();
  const remindersQuery = query(
    collection(db, 'pets', petId, 'reminders'),
    where('isActive', '==', true),
  );
  const snapshot = await getDocs(remindersQuery);

  return snapshot.docs
    .map((reminderDoc) => parseReminder(reminderDoc.id, reminderDoc.data()))
    .filter((reminder) => reminder.deletedAt === null)
    .sort((left, right) => {
      const leftTime = toReminderDate(left.remindAt)?.getTime() ?? 0;
      const rightTime = toReminderDate(right.remindAt)?.getTime() ?? 0;

      return leftTime - rightTime;
    });
}

export async function createReminder(userId: string, input: CreateReminderInput) {
  if (!userId) {
    throw new Error(reminderMessages.missingAuth);
  }

  const title = input.title.trim();

  if (!title) {
    throw new Error(reminderMessages.missingTitle);
  }

  const db = requireFirestore();
  const reminderRef = doc(collection(db, 'pets', input.petId, 'reminders'));
  const memberRef = doc(db, 'pets', input.petId, 'members', userId);

  await runTransaction(db, async (transaction) => {
    const memberSnapshot = await transaction.get(memberRef);
    const memberRole = memberSnapshot.exists() ? memberSnapshot.data().role : null;

    if (!memberSnapshot.exists() || !['owner', 'editor'].includes(memberRole)) {
      throw new Error(reminderMessages.editOnly);
    }

    transaction.set(reminderRef, {
      id: reminderRef.id,
      petId: input.petId,
      title,
      reminderType: input.reminderType,
      remindAt: Timestamp.fromDate(input.remindAt),
      recurrence: input.recurrence ?? 'none',
      notifyEnabled: input.notifyEnabled ?? true,
      isActive: true,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      deletedAt: null,
    });
  });

  return reminderRef.id;
}

export async function updateReminder(userId: string, input: UpdateReminderInput) {
  if (!userId) {
    throw new Error(reminderMessages.missingAuth);
  }

  const title = input.title.trim();

  if (!title) {
    throw new Error(reminderMessages.missingTitle);
  }

  const db = requireFirestore();
  const reminderRef = doc(db, 'pets', input.petId, 'reminders', input.reminderId);
  const memberRef = doc(db, 'pets', input.petId, 'members', userId);

  await runTransaction(db, async (transaction) => {
    const memberSnapshot = await transaction.get(memberRef);
    const memberRole = memberSnapshot.exists() ? memberSnapshot.data().role : null;

    if (!memberSnapshot.exists() || !['owner', 'editor'].includes(memberRole)) {
      throw new Error(reminderMessages.editOnly);
    }

    transaction.update(reminderRef, {
      title,
      reminderType: input.reminderType,
      remindAt: Timestamp.fromDate(input.remindAt),
      recurrence: input.recurrence,
      notifyEnabled: input.notifyEnabled,
      isActive: input.isActive,
      updatedAt: serverTimestamp(),
    });
  });

  return input.reminderId;
}

export async function deleteReminder(userId: string, petId: string, reminderId: string) {
  if (!userId) {
    throw new Error(reminderMessages.missingAuth);
  }

  const db = requireFirestore();
  const reminderRef = doc(db, 'pets', petId, 'reminders', reminderId);
  const memberRef = doc(db, 'pets', petId, 'members', userId);

  await runTransaction(db, async (transaction) => {
    const memberSnapshot = await transaction.get(memberRef);
    const memberRole = memberSnapshot.exists() ? memberSnapshot.data().role : null;

    if (!memberSnapshot.exists() || !['owner', 'editor'].includes(memberRole)) {
      throw new Error(reminderMessages.editOnly);
    }

    transaction.update(reminderRef, {
      isActive: false,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function toggleReminderComplete(
  userId: string,
  petId: string,
  reminderId: string,
  isCompleted: boolean,
  userName: string | null,
) {
  if (!userId) {
    throw new Error(reminderMessages.missingAuth);
  }

  const db = requireFirestore();
  const reminderRef = doc(db, 'pets', petId, 'reminders', reminderId);
  const memberRef = doc(db, 'pets', petId, 'members', userId);

  await runTransaction(db, async (transaction) => {
    const memberSnapshot = await transaction.get(memberRef);
    const memberRole = memberSnapshot.exists() ? memberSnapshot.data().role : null;

    if (!memberSnapshot.exists() || !['owner', 'editor'].includes(memberRole)) {
      throw new Error(reminderMessages.editOnly);
    }

    transaction.update(reminderRef, {
      isCompleted,
      completedAt: isCompleted ? serverTimestamp() : null,
      completedBy: isCompleted ? userId : null,
      completedByName: isCompleted ? userName : null,
      updatedAt: serverTimestamp(),
    });
  });
}
