import { create } from 'zustand';

type AppState = {
  selectedPetId: string | null;
  isPremium: boolean;
  setSelectedPetId: (petId: string | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedPetId: null,
  isPremium: false,
  setSelectedPetId: (selectedPetId) => set({ selectedPetId }),
}));
