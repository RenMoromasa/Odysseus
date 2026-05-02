import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { StudentPlanProvider } from '@/hooks/use-student-plan';
import { AppColors } from '@/constants/theme';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

// ─── Auth-aware navigation guard ─────────────────────────────────────────────
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inModalsGroup = segments[0] === '(modals)';

    if (!user && !inAuthGroup) {
      // Not logged in and trying to access protected routes — redirect to welcome
      router.replace('/(auth)/welcome');
} else if (user && inAuthGroup) {
      // Logged in but on auth screens
      // Check if user needs to complete onboarding (first time or not onboarded)
      if (profile && !profile.isOnboarded) {
        // Show student type selection modal for first-time setup
        router.replace('/(modals)/student-type-modal');
      } else {
        // User completed onboarding — redirect to main app
        router.replace('/(tabs)');
      }
    } else if (user && !inModalsGroup && profile && !profile.isOnboarded) {
      // User is on tabs but hasn't completed onboarding — redirect to student type
      router.replace('/(modals)/student-type-modal');
    }
  }, [user, profile, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F1117' }}>
        <ActivityIndicator size="large" color="#7C6AFF" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = AppColors[colorScheme];

  const navTheme = colorScheme === 'dark'
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.background,
          card: colors.surface,
          border: colors.border,
          primary: colors.accent,
          text: colors.text,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.surface,
          border: colors.border,
          primary: colors.accent,
          text: colors.text,
        },
      };

  return (
    <AuthProvider>
      <StudentPlanProvider>
        <ThemeProvider value={navTheme}>
          <AuthGate>
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                headerTitleStyle: { fontWeight: '700' },
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(modals)" options={{ headerShown: false, presentation: 'modal' }} />
            </Stack>
          </AuthGate>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </StudentPlanProvider>
    </AuthProvider>
  );
}
