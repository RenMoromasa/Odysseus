import { Stack } from 'expo-router';
import React from 'react';
import { AppColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ModalsLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = AppColors[colorScheme];

  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="course-detail-modal" />
      <Stack.Screen name="add-course-modal" />
      <Stack.Screen name="manage-tags-modal" />
      <Stack.Screen name="confirm-reset-modal" />
      <Stack.Screen name="lacking-courses-modal" />
    </Stack>
  );
}
