import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { StudentPlanProvider } from '@/hooks/use-student-plan';
import { AppColors } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

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
    <StudentPlanProvider>
      <ThemeProvider value={navTheme}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="course-detail-modal"
            options={{ presentation: 'modal', title: 'Course Details', headerShown: false }}
          />
          <Stack.Screen
            name="add-course-modal"
            options={{ presentation: 'modal', title: 'Add Course', headerShown: false }}
          />
          <Stack.Screen
            name="manage-tags-modal"
            options={{ presentation: 'modal', title: 'Manage Tags', headerShown: false }}
          />
          <Stack.Screen
            name="confirm-reset-modal"
            options={{ presentation: 'modal', title: 'Reset Schedule', headerShown: false }}
          />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </StudentPlanProvider>
  );
}
