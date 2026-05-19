import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Radii, Spacing, FontSizes } from '@/constants/theme';
import { TagBadge } from './tag-badge';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Course, Tag, isFailingGrade, isPassingGrade } from '@/constants/types';

interface CourseCardProps {
  course: Course;
  tag?: Tag;
  grade?: string;
  customName?: string;
  compact?: boolean;
  showPrereqWarning?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function CourseCard({
  course, tag, grade, customName, compact, showPrereqWarning, onPress, onLongPress,
}: CourseCardProps) {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];
  const tagColor = tag?.color ?? colors.accent;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: showPrereqWarning ? colors.danger + '60' : colors.glassBorder,
        },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        compact && styles.compact,
      ]}
    >
      {/* Left accent strip */}
      <View style={[styles.accentStrip, { backgroundColor: tagColor }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.code, { color: colors.textSecondary }]}>{course.code}</Text>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={compact ? 1 : 2}>
              {customName || course.name}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.creditBadge, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.creditText, { color: colors.textSecondary }]}>
                {course.credits}
              </Text>
              <Text style={[styles.creditLabel, { color: colors.textMuted }]}>cr</Text>
            </View>
          </View>
        </View>

        {!compact && (
          <View style={styles.footer}>
            <View style={styles.tags}>
              {tag && <TagBadge name={tag.name} color={tag.color} size="sm" />}
            </View>
            <View style={styles.meta}>
              {grade && (
                <View style={[styles.gradeBadge, {
                  backgroundColor: grade === 'NC' ? colors.warningSoft
                    : grade === '5.00' ? colors.dangerSoft
                    : isPassingGrade(grade) ? colors.successSoft
                    : colors.surfaceLight,
                }]}>
                  <Text style={[styles.gradeText, {
                    color: grade === 'NC' ? colors.warning
                      : grade === '5.00' ? colors.danger
                      : isPassingGrade(grade) ? colors.success
                      : colors.textMuted,
                  }]}>{grade}</Text>
                </View>
              )}
              {showPrereqWarning && (
                <Ionicons name="warning" size={16} color={colors.danger} />
              )}
              {course.prerequisites.length > 0 && !showPrereqWarning && (
                <View style={styles.prereqIndicator}>
                  <Ionicons name="git-branch-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.prereqCount, { color: colors.textMuted }]}>
                    {course.prerequisites.length}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radii.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  compact: {
    marginBottom: Spacing.xs,
  },
  accentStrip: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  code: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    lineHeight: 20,
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.sm,
    gap: 2,
  },
  creditText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  creditLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tags: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  gradeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  gradeText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  prereqIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  prereqCount: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
});
