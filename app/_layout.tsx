import { useEffect, useMemo } from 'react';
import { Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

import { AuthStateProvider } from '../components/auth/AuthStateProvider';
import { RouteGuard } from '../components/auth/RouteGuard';
import '../lib/i18n';
import { queryClient } from '../lib/queryClient';
import { colors, radius, shadows, typography, fontWeight } from '../lib/theme';
import { useAuthStore } from '../store/authStore';

function RootLayoutContent() {
  const segments = useSegments();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  const routeGroup = segments[0];
  const inAuthGroup = routeGroup === '(auth)';
  const inOnboarding = routeGroup === 'onboarding';

  const isMismatched = useMemo(() => {
    if (isAuthLoading) {
      return true;
    }

    if (!user) {
      return !inAuthGroup;
    }

    if (!profile) {
      return true;
    }

    if (!profile.onboardingCompleted) {
      return !inOnboarding;
    }

    if (inAuthGroup || inOnboarding) {
      return true;
    }

    return false;
  }, [user, profile, isAuthLoading, inAuthGroup, inOnboarding]);

  // Reanimated Shared Values
  const logoScale = useSharedValue(1);
  const heartScale = useSharedValue(1);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.4);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(15);
  const spinnerOpacity = useSharedValue(0);

  useEffect(() => {
    // Gentle pulse for the entire logo box
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      ),
      -1,
    );

    // Double beat heartbeat for the heart icon
    heartScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 120 }),
        withTiming(1, { duration: 90 }),
        withTiming(1.2, { duration: 120 }),
        withTiming(1, { duration: 670 }),
      ),
      -1,
    );

    // Ripple wave scaling out and fading
    ringScale.value = withRepeat(
      withTiming(2.2, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
    );
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 0 }),
        withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
      ),
      -1,
    );

    // Slide up and fade in the app title
    textOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }),
    );
    textTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) }),
    );

    // Delay the spinner to keep it clean on fast boots
    spinnerOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 500 }),
    );
  }, [logoScale, heartScale, ringScale, ringOpacity, textOpacity, textTranslateY, spinnerOpacity]);

  // Animated Styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const spinnerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: spinnerOpacity.value,
  }));

  return (
    <>
      <RouteGuard />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
      {isMismatched && (
        <View style={styles.splashContainer}>
          <View style={styles.logoOuterWrap}>
            {/* Ripple Ring Wave */}
            <Animated.View style={[styles.rippleRing, ringAnimatedStyle]} />

            {/* Logo Box */}
            <Animated.View style={[styles.logoBox, logoAnimatedStyle]}>
              <Animated.View style={heartAnimatedStyle}>
                <Feather name="heart" size={32} color={colors.accent} />
              </Animated.View>
            </Animated.View>
          </View>

          {/* App Title */}
          <Animated.Text style={[styles.splashText, textAnimatedStyle]}>
            Fluffy Carebook
          </Animated.Text>

          {/* Loading indicator */}
          <Animated.View style={spinnerAnimatedStyle}>
            <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 28 }} />
          </Animated.View>
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthStateProvider>
        <RootLayoutContent />
        <StatusBar style="dark" />
      </AuthStateProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  logoOuterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
    position: 'relative',
    marginBottom: 8,
  },
  rippleRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent + '20',
  },
  logoBox: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent + '30',
    borderRadius: radius.xl,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    width: 72,
    ...shadows.accent,
    zIndex: 2,
  },
  splashText: {
    color: colors.textPrimary,
    fontSize: typography.titleLg,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
});
