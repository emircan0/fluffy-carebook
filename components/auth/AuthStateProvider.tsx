import { useEffect } from 'react';
import type { ReactNode } from 'react';

import {
  ensureUserProfile,
  firebaseConfigError,
  getAuthErrorMessage,
  logout,
  subscribeToAuthState,
} from '../../lib/auth';
import { hasFirebaseConfig } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';

type AuthStateProviderProps = {
  children: ReactNode;
};

export function AuthStateProvider({ children }: AuthStateProviderProps) {
  useEffect(() => {
    const { setAuthError, setAuthLoading, setAuthState } = useAuthStore.getState();

    if (!hasFirebaseConfig) {
      setAuthState(null, null);
      setAuthError(firebaseConfigError);
      setAuthLoading(false);
      return undefined;
    }

    setAuthLoading(true);

    const unsubscribe = subscribeToAuthState(
      (user) => {
        if (!user) {
          setAuthState(null, null);
          setAuthLoading(false);
          return;
        }

        ensureUserProfile(user)
          .then((profile) => {
            if (profile.accountStatus === 'inactive') {
              void logout();
              setAuthState(null, null);
              return;
            }

            setAuthState(user, profile);
          })
          .catch((error) => {
            setAuthState(user, null);
            setAuthError(getAuthErrorMessage(error));
          })
          .finally(() => {
            setAuthLoading(false);
          });
      },
      (error) => {
        setAuthState(null, null);
        setAuthError(getAuthErrorMessage(error));
        setAuthLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return <>{children}</>;
}
