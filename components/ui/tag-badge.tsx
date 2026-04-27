import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Radii, Spacing, FontSizes } from '@/constants/theme';

interface TagBadgeProps {
  name: string;
  color: string;
  size?: 'sm' | 'md';
}

export function TagBadge({ name, color, size = 'sm' }: TagBadgeProps) {
  const isSmall = size === 'sm';
  return (
    <View style={[
      styles.badge,
      { backgroundColor: color + '20', borderColor: color + '40' },
      isSmall ? styles.badgeSm : styles.badgeMd,
    ]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[
        styles.text,
        { color },
        isSmall ? styles.textSm : styles.textMd,
      ]} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    gap: 4,
  },
  badgeMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: FontSizes.xs,
  },
  textMd: {
    fontSize: FontSizes.sm,
  },
});
