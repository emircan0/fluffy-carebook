export type ExpenseCategory = 'food' | 'vet' | 'medicine' | 'accessory' | 'other';

export type Expense = {
  id: string;
  petId: string;
  amount: number;
  category: ExpenseCategory;
  date: unknown; // Firestore Timestamp
  title: string;
  notes: string | null;
  createdBy: string;
  createdAt: unknown;
  updatedAt: unknown;
  deletedAt: unknown | null;
};
