import type { User } from 'firebase/auth';
import { create } from 'zustand';

import type { UserProfile } from '../lib/auth';

type AuthStore = {
  user: User | null;
  profile: UserProfile | null;
  isAuthLoading: boolean;
  authError: string | null;
  setAuthLoading: (isAuthLoading: boolean) => void;
  setAuthError: (authError: string | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setAuthState: (user: User | null, profile: UserProfile | null) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  isAuthLoading: true,
  authError: null,
  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
  setAuthError: (authError) => set({ authError }),
  setProfile: (profile) => set({ profile }),
  setAuthState: (user, profile) => set({ user, profile, authError: null }),
}));
