import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

import { useAuthStore } from '../../store/authStore';

export function RouteGuard() {
  const router = useRouter();
  const segments = useSegments();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  const routeGroup = segments[0];
  const inAuthGroup = routeGroup === '(auth)';
  const inOnboarding = routeGroup === 'onboarding';

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user && !inAuthGroup) {
      router.replace('/login');
      return;
    }

    if (user && profile && !profile.onboardingCompleted && !inAuthGroup && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    if (user && inAuthGroup) {
      router.replace(profile?.onboardingCompleted ? '/' : '/onboarding');
    }
  }, [inAuthGroup, inOnboarding, isAuthLoading, profile, router, user]);

  return null;
}
