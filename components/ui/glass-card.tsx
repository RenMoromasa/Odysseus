import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { AppColors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GlassCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'accent';
  noPadding?: boolean;
}

export function GlassCard({ style, variant = 'default', noPadding, children, ...props }: GlassCardProps) {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];

  const bgColor = variant === 'elevated'
    ? colors.surfaceLight
    : variant === 'accent'
    ? colors.accentSoft
    : colors.surface;

  const borderColor = variant === 'accent'
    ? colors.accent + '30'
    : colors.glassBorder;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
        },
        !noPadding && styles.padding,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  padding: {
    padding: Spacing.md,
  },
});
