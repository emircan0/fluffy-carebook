import { useCallback } from 'react';

import {
  getAuthErrorMessage,
  deactivateCurrentUserAccount,
  loginAsGuest,
  loginWithEmail,
  logout,
  registerWithEmail,
  loginWithGoogleCredential,
  loginWithAppleCredential,
  sendResetEmail,
  updateUserName,
  changeUserPassword,
  deactivateAccountWithPassword,
} from '../lib/auth';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const {
    user,
    profile,
    isAuthLoading,
    authError,
    setAuthError,
    setAuthLoading,
    setAuthState,
  } = useAuthStore();

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      setAuthLoading(true);
      setAuthError(null);

      try {
        const result = await registerWithEmail({ email, password, fullName });
        setAuthState(result.user, result.profile);
      } catch (error) {
        console.error('[useAuth.register] Error:', error);
        setAuthError(getAuthErrorMessage(error));
      } finally {
        setAuthLoading(false);
      }
    },
    [setAuthError, setAuthLoading, setAuthState],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      setAuthLoading(true);
      setAuthError(null);

      try {
        const result = await loginWithEmail({ email, password });
        setAuthState(result.user, result.profile);
      } catch (error) {
        console.error('[useAuth.signIn] Error:', error);
        setAuthError(getAuthErrorMessage(error));
      } finally {
        setAuthLoading(false);
      }
    },
    [setAuthError, setAuthLoading, setAuthState],
  );

  const signInAsGuest = useCallback(async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const result = await loginAsGuest();
      setAuthState(result.user, result.profile);
    } catch (error) {
      console.error('[useAuth.signInAsGuest] Error:', error);
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  }, [setAuthError, setAuthLoading, setAuthState]);

  const signOut = useCallback(async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await logout();
      setAuthState(null, null);
    } catch (error) {
      console.error('[useAuth.signOut] Error:', error);
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  }, [setAuthError, setAuthLoading, setAuthState]);

  const deactivateAccount = useCallback(async () => {
    if (!user?.uid) {
      setAuthError('Hesap islemi icin giris yapmalisiniz.');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      await deactivateCurrentUserAccount(user.uid);
      await logout();
      setAuthState(null, null);
    } catch (error) {
      console.error('[useAuth.deactivateAccount] Error:', error);
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  }, [setAuthError, setAuthLoading, setAuthState, user?.uid]);

  const signInWithGoogle = useCallback(
    async (idToken: string) => {
      setAuthLoading(true);
      setAuthError(null);

      try {
        const result = await loginWithGoogleCredential(idToken);
        setAuthState(result.user, result.profile);
      } catch (error) {
        console.error('[useAuth.signInWithGoogle] Error:', error);
        setAuthError(getAuthErrorMessage(error));
      } finally {
        setAuthLoading(false);
      }
    },
    [setAuthError, setAuthLoading, setAuthState],
  );

  const signInWithApple = useCallback(
    async (idToken: string, rawNonce?: string) => {
      setAuthLoading(true);
      setAuthError(null);

      try {
        const result = await loginWithAppleCredential(idToken, rawNonce);
        setAuthState(result.user, result.profile);
      } catch (error) {
        console.error('[useAuth.signInWithApple] Error:', error);
        setAuthError(getAuthErrorMessage(error));
      } finally {
        setAuthLoading(false);
      }
    },
    [setAuthError, setAuthLoading, setAuthState],
  );

  const resetPassword = useCallback(
    async (email: string) => {
      setAuthLoading(true);
      setAuthError(null);

      try {
        await sendResetEmail(email);
      } catch (error) {
        console.error('[useAuth.resetPassword] Error:', error);
        setAuthError(getAuthErrorMessage(error));
        throw error;
      } finally {
        setAuthLoading(false);
      }
    },
    [setAuthError, setAuthLoading],
  );

  const updateName = useCallback(
    async (newName: string) => {
      setAuthLoading(true);
      setAuthError(null);

      try {
        await updateUserName(newName);
        if (user && profile) {
          setAuthState(user, { ...profile, fullName: newName.trim() });
        }
      } catch (error) {
        console.error('[useAuth.updateName] Error:', error);
        setAuthError(getAuthErrorMessage(error));
        throw error;
      } finally {
        setAuthLoading(false);
      }
    },
    [setAuthError, setAuthLoading, setAuthState, user, profile],
  );

  const changePassword = useCallback(
    async (currentPass: string, newPass: string) => {
      setAuthLoading(true);
      setAuthError(null);

      try {
        await changeUserPassword(currentPass, newPass);
      } catch (error) {
        console.error('[useAuth.changePassword] Error:', error);
        setAuthError(getAuthErrorMessage(error));
        throw error;
      } finally {
        setAuthLoading(false);
      }
    },
    [setAuthError, setAuthLoading],
  );

  const deactivateWithPassword = useCallback(
    async (password: string) => {
      setAuthLoading(true);
      setAuthError(null);

      try {
        await deactivateAccountWithPassword(password);
        await logout();
        setAuthState(null, null);
      } catch (error) {
        console.error('[useAuth.deactivateWithPassword] Error:', error);
        setAuthError(getAuthErrorMessage(error));
        throw error;
      } finally {
        setAuthLoading(false);
      }
    },
    [setAuthError, setAuthLoading, setAuthState],
  );

  return {
    user,
    profile,
    isAuthLoading,
    authError,
    register,
    signIn,
    signInAsGuest,
    signOut,
    deactivateAccount,
    signInWithGoogle,
    signInWithApple,
    resetPassword,
    updateName,
    changePassword,
    deactivateWithPassword,
    setAuthError,
  };
}
