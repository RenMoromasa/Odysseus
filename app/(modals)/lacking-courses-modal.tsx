import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentPlan } from '@/hooks/use-student-plan';
import { AppColors, Spacing, FontSizes, Radii } from '@/constants/theme';
import { TagBadge } from '@/components/ui/tag-badge';
import { Course } from '@/constants/types';

type LackingCourse = {
  course: Course;
  status: 'ready' | 'blocked';
  missingPrereqs: { id: string; code: string; name: string }[];
  tagName: string;
  tagColor: string;
};

export default function LackingCoursesModal() {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];
  const router = useRouter();
  const {
    catalog, state, getCourse, getTagById, isCourseCompleted,
  } = useStudentPlan();

  const [filter, setFilter] = useState<'all' | 'ready' | 'blocked'>('all');

  // Get all courses the student has NOT passed
  const lackingCourses = useMemo(() => {
    // Collect passed course IDs (completed with a passing grade)
    const passedIds = new Set<string>();
    for (const sem of state.semesters) {
      for (const sc of sem.courses) {
        if (sc.grade && sc.grade !== '5.00') {
          passedIds.add(sc.courseId);
        }
      }
    }

    const result: LackingCourse[] = [];

    for (const course of catalog) {
      if (passedIds.has(course.id)) continue;

      // Check if all prerequisites are passed
      const missingPrereqs = course.prerequisites
        .filter(prereqId => !passedIds.has(prereqId))
        .map(prereqId => {
          const prereq = getCourse(prereqId);
          return {
            id: prereqId,
            code: prereq?.code ?? prereqId,
            name: prereq?.name ?? 'Unknown',
          };
        });

      const tag = getTagById(course.tags[0]);
      const status = missingPrereqs.length === 0 ? 'ready' : 'blocked';

      result.push({
        course,
        status,
        missingPrereqs,
        tagName: tag?.name ?? 'Other',
        tagColor: tag?.color ?? colors.accent,
      });
    }

    // Sort: ready first, then blocked; within each group alphabetically by code
    return result.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'ready' ? -1 : 1;
      return a.course.code.localeCompare(b.course.code);
    });
  }, [catalog, state.semesters, getCourse, getTagById]);

  const readyCourses = lackingCourses.filter(c => c.status === 'ready');
  const blockedCourses = lackingCourses.filter(c => c.status === 'blocked');

  const filteredCourses = filter === 'all' ? lackingCourses
    : filter === 'ready' ? readyCourses
    : blockedCourses;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>Lacking Courses</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {lackingCourses.length} course{lackingCourses.length !== 1 ? 's' : ''} remaining to graduate
            </Text>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close-circle" size={32} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Summary chips */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryChip, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
            <Text style={[styles.summaryChipText, { color: colors.accent }]}>
              {readyCourses.length} Ready
            </Text>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: colors.warningSoft }]}>
            <Ionicons name="lock-closed" size={16} color={colors.warning} />
            <Text style={[styles.summaryChipText, { color: colors.warning }]}>
              {blockedCourses.length} Blocked
            </Text>
          </View>
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {(['all', 'ready', 'blocked'] as const).map(f => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterTab,
                {
                  backgroundColor: filter === f ? colors.accent : colors.surfaceLight,
                  borderColor: filter === f ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={[
                styles.filterTabText,
                { color: filter === f ? '#FFF' : colors.textSecondary },
              ]}>
                {f === 'all' ? `All (${lackingCourses.length})`
                  : f === 'ready' ? `Ready (${readyCourses.length})`
                  : `Blocked (${blockedCourses.length})`}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Course list */}
        {filteredCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle" size={48} color={colors.accent} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {filter === 'all' ? 'All courses completed!' : `No ${filter} courses`}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {filter === 'all'
                ? "You've passed every course in your prospectus."
                : filter === 'ready'
                  ? 'All remaining courses have unmet prerequisites.'
                  : 'All remaining courses are ready to take!'}
            </Text>
          </View>
        ) : (
          <View style={styles.courseList}>
            {filteredCourses.map((item) => (
              <Pressable
                key={item.course.id}
                style={({ pressed }) => [
                  styles.courseCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: item.status === 'ready'
                      ? colors.accent + '30'
                      : colors.glassBorder,
                  },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => router.push({
                  pathname: '/(modals)/course-detail-modal',
                  params: { courseId: item.course.id },
                })}
              >
                <View style={[styles.cardStrip, {
                  backgroundColor: item.status === 'ready' ? colors.accent : colors.warning,
                }]} />
                <View style={styles.cardContent}>
                  {/* Top row: code + status */}
                  <View style={styles.cardTopRow}>
                    <Text style={[styles.cardCode, { color: colors.textMuted }]}>
                      {item.course.code}
                    </Text>
                    <View style={styles.cardBadges}>
                      {item.status === 'ready' ? (
                        <View style={[styles.statusPill, { backgroundColor: colors.accentSoft }]}>
                          <Ionicons name="checkmark-circle" size={12} color={colors.accent} />
                          <Text style={[styles.statusPillText, { color: colors.accent }]}>Ready</Text>
                        </View>
                      ) : (
                        <View style={[styles.statusPill, { backgroundColor: colors.warningSoft }]}>
                          <Ionicons name="lock-closed" size={12} color={colors.warning} />
                          <Text style={[styles.statusPillText, { color: colors.warning }]}>Blocked</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Course name */}
                  <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={2}>
                    {item.course.name}
                  </Text>

                  {/* Bottom row: units + tag */}
                  <View style={styles.cardBottomRow}>
                    <Text style={[styles.cardUnits, { color: colors.textMuted }]}>
                      {item.course.credits} units
                    </Text>
                    <TagBadge name={item.tagName} color={item.tagColor} size="sm" />
                  </View>

                  {/* Missing prereqs */}
                  {item.missingPrereqs.length > 0 && (
                    <View style={[styles.prereqSection, { borderTopColor: colors.border }]}>
                      <Text style={[styles.prereqLabel, { color: colors.textMuted }]}>
                        Missing prerequisites:
                      </Text>
                      <View style={styles.prereqList}>
                        {item.missingPrereqs.map(prereq => (
                          <View
                            key={prereq.id}
                            style={[styles.prereqChip, { backgroundColor: colors.warningSoft }]}
                          >
                            <Text style={[styles.prereqChipText, { color: colors.warning }]}>
                              {prereq.code}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  title: { fontSize: FontSizes.xxl, fontWeight: '800' },
  subtitle: { fontSize: FontSizes.sm, marginTop: 4 },

  // Summary
  summaryRow: {
    flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md,
  },
  summaryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
  },
  summaryChipText: { fontSize: FontSizes.sm, fontWeight: '700' },

  // Filter
  filterRow: {
    flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.lg,
  },
  filterTab: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radii.md, borderWidth: 1,
  },
  filterTabText: { fontSize: FontSizes.xs, fontWeight: '600' },

  // Empty
  emptyState: {
    alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm,
  },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: '700' },
  emptySubtitle: { fontSize: FontSizes.sm, textAlign: 'center' },

  // Course cards
  courseList: { gap: Spacing.sm },
  courseCard: {
    flexDirection: 'row', borderRadius: Radii.md, borderWidth: 1,
    overflow: 'hidden',
  },
  cardStrip: { width: 3 },
  cardContent: { flex: 1, padding: Spacing.md },
  cardTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cardCode: {
    fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase',
  },
  cardBadges: { flexDirection: 'row', gap: Spacing.xs },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radii.full,
  },
  statusPillText: { fontSize: 10, fontWeight: '700' },
  cardName: { fontSize: FontSizes.sm, fontWeight: '600', marginTop: 4, lineHeight: 18 },
  cardBottomRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 6,
  },
  cardUnits: { fontSize: 10, fontWeight: '500' },

  // Prereq section
  prereqSection: {
    marginTop: Spacing.sm, paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  prereqLabel: { fontSize: 10, fontWeight: '600', marginBottom: 4 },
  prereqList: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  prereqChip: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radii.sm,
  },
  prereqChipText: { fontSize: 10, fontWeight: '700' },
});
