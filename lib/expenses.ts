import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
  orderBy,
} from 'firebase/firestore';

import { firebaseConfigError } from './auth';
import { firestore, hasFirebaseConfig } from './firebase';
import type { Expense, ExpenseCategory } from '../types/app';

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  food: 'Mama',
  vet: 'Veteriner',
  medicine: 'İlaç',
  accessory: 'Kum/Aksesuar',
  other: 'Diğer',
};

export const expenseCategoryIcons: Record<ExpenseCategory, string> = {
  food: '🍽️',
  vet: '🩺',
  medicine: '💊',
  accessory: '🧶',
  other: '📌',
};

export const expenseCategoryColors: Record<ExpenseCategory, string> = {
  food: '#F59E0B',
  vet: '#3B82F6',
  medicine: '#10B981',
  accessory: '#8B5CF6',
  other: '#6B7280',
};

export type CreateExpenseInput = {
  petId: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  title: string;
  notes?: string;
};

export type UpdateExpenseInput = {
  petId: string;
  expenseId: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  title: string;
  notes?: string;
};

function requireFirestore() {
  if (!hasFirebaseConfig || !firestore) {
    throw new Error(firebaseConfigError);
  }
  return firestore;
}

function parseExpense(id: string, data: Record<string, unknown>): Expense {
  return {
    id,
    petId: typeof data.petId === 'string' ? data.petId : '',
    amount: typeof data.amount === 'number' ? data.amount : 0,
    category: (data.category as ExpenseCategory) ?? 'other',
    date: data.date,
    title: typeof data.title === 'string' ? data.title : '',
    notes: typeof data.notes === 'string' ? data.notes : null,
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    deletedAt: data.deletedAt ?? null,
  };
}

export async function fetchExpenses(petId: string): Promise<Expense[]> {
  const db = requireFirestore();
  const expensesRef = collection(db, 'pets', petId, 'expenses');
  const q = query(expensesRef, where('deletedAt', '==', null));
  
  const snapshot = await getDocs(q);
  const expenses = snapshot.docs.map(doc => parseExpense(doc.id, doc.data()));

  const getExpenseTime = (dateVal: any): number => {
    if (dateVal && typeof dateVal === 'object' && typeof dateVal.toDate === 'function') {
      return dateVal.toDate().getTime();
    }
    if (dateVal && typeof dateVal === 'object' && typeof dateVal.seconds === 'number') {
      return dateVal.seconds * 1000;
    }
    return new Date(dateVal).getTime();
  };

  return expenses.sort((a, b) => getExpenseTime(b.date) - getExpenseTime(a.date));
}

export async function createExpense({
  petId,
  amount,
  category,
  date,
  title,
  notes,
}: CreateExpenseInput) {
  const db = requireFirestore();
  const { firebaseAuth: auth } = await import('./firebase');
  const user = auth?.currentUser;

  if (!user) {
    throw new Error('Masraf eklemek için giriş yapmalısınız.');
  }

  const expensesRef = collection(db, 'pets', petId, 'expenses');
  const newExpenseRef = doc(expensesRef);

  await runTransaction(db, async (transaction) => {
    transaction.set(newExpenseRef, {
      id: newExpenseRef.id,
      petId,
      amount,
      category,
      date,
      title,
      notes: notes || null,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      deletedAt: null,
    });
  });

  return newExpenseRef.id;
}

export async function deleteExpense(petId: string, expenseId: string) {
  const db = requireFirestore();
  const { firebaseAuth: auth } = await import('./firebase');
  const user = auth?.currentUser;

  if (!user) {
    throw new Error('Masraf silmek için giriş yapmalısınız.');
  }

  const expenseRef = doc(db, 'pets', petId, 'expenses', expenseId);

  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(expenseRef);
    if (!docSnap.exists()) {
      throw new Error('Masraf bulunamadı.');
    }
    
    transaction.update(expenseRef, {
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function updateExpense({
  petId,
  expenseId,
  amount,
  category,
  date,
  title,
  notes,
}: UpdateExpenseInput) {
  const db = requireFirestore();
  const { firebaseAuth: auth } = await import('./firebase');
  const user = auth?.currentUser;

  if (!user) {
    throw new Error('Masraf güncellemek için giriş yapmalısınız.');
  }

  const expenseRef = doc(db, 'pets', petId, 'expenses', expenseId);

  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(expenseRef);
    if (!docSnap.exists()) {
      throw new Error('Masraf bulunamadı.');
    }

    transaction.update(expenseRef, {
      amount,
      category,
      date,
      title,
      notes: notes || null,
      updatedAt: serverTimestamp(),
    });
  });
}
