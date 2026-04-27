import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Radii, Spacing, FontSizes } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ConflictAlertProps {
  courseCode: string;
  missingPrereqs: string[];
  onPress?: () => void;
}

export function ConflictAlert({ courseCode, missingPrereqs, onPress }: ConflictAlertProps) {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, { backgroundColor: colors.dangerSoft, borderColor: colors.danger + '30' }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.danger + '20' }]}>
        <Ionicons name="alert-circle" size={20} color={colors.danger} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.danger }]}>
          Prerequisite Conflict
        </Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
          <Text style={{ fontWeight: '600' }}>{courseCode}</Text> requires{' '}
          {missingPrereqs.join(', ')} to be completed first.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  desc: {
    fontSize: FontSizes.xs,
    lineHeight: 16,
  },
});
