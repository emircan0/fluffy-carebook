import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';

import { AuthStateProvider } from '../components/auth/AuthStateProvider';
import { RouteGuard } from '../components/auth/RouteGuard';
import '../lib/i18n';
import { queryClient } from '../lib/queryClient';
import { colors } from '../lib/theme';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthStateProvider>
        <RouteGuard />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
        <StatusBar style="dark" />
      </AuthStateProvider>
    </QueryClientProvider>
  );
}
