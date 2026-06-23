export type Measurement = {
  id: string;
  petId: string;
  weight: number; // in kg
  height: number | null; // in cm (optional)
  date: unknown; // Firestore Timestamp or Date when parsed
  notes: string | null;
  createdBy: string;
  createdAt: unknown;
  updatedAt: unknown;
  deletedAt: unknown | null;
};
