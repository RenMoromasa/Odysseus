import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentPlan } from '@/hooks/use-student-plan';
import { AppColors, Spacing, FontSizes, Radii } from '@/constants/theme';
import { getPHDate } from '@/utils/semester';
import { GlassCard } from '@/components/ui/glass-card';
import { ConflictAlert } from '@/components/ui/conflict-alert';
import { CourseCard } from '@/components/ui/course-card';
import { GPARing } from '@/components/ui/gpa-ring';
import { ScrollFade } from '@/components/ui/scroll-fade';
import { TabEnterAnimation } from '@/components/ui/tab-enter-animation';

export default function DashboardScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];
  const router = useRouter();
  const {
    state, catalog, getCourse, getTagById, calculateGPA,
    checkPrerequisiteConflicts, isCourseCompleted, estimateGraduation,
  } = useStudentPlan();

  const gpaData = calculateGPA();

  // ── Live time-of-day greeting ──────────────────────────────────────────────
  const [greeting, setGreeting] = useState(() => getTimeOfDay());
  useEffect(() => {
    // Re-check every minute in case the user keeps the app open across hours
    const id = setInterval(() => setGreeting(getTimeOfDay()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Lacking courses summary
  const lackingSummary = useMemo(() => {
    const passedIds = new Set<string>();
    for (const sem of state.semesters) {
      for (const sc of sem.courses) {
        if (sc.grade && sc.grade !== '5.00' && sc.grade !== 'NC') passedIds.add(sc.courseId);
      }
    }
    let ready = 0;
    let blocked = 0;
    for (const course of catalog) {
      if (passedIds.has(course.id)) continue;
      const allPrereqsMet = course.prerequisites.every(id => passedIds.has(id));
      if (allPrereqsMet) ready++;
      else blocked++;
    }
    return { total: ready + blocked, ready, blocked };
  }, [catalog, state.semesters]);
  const currentSemester = state.semesters.find(s => s.status === 'in-progress');
  const completedSemesters = state.semesters.filter(s => s.status === 'completed');

  // Check if there are auto-graded courses (grade 3.00)
  const hasAutoGradedCourses = state.semesters.some(sem =>
    sem.courses.some(c => c.grade === '3.00')
  );

  // Find prerequisite conflicts in current and planned semesters
  const conflicts = useMemo(() => {
    const result: { courseId: string; semesterId: string; missing: string[] }[] = [];
    for (const sem of state.semesters) {
      if (sem.status === 'completed') continue;
      for (const sc of sem.courses) {
        const missing = checkPrerequisiteConflicts(sem.id, sc.courseId);
        if (missing.length > 0) {
          result.push({ courseId: sc.courseId, semesterId: sem.id, missing });
        }
      }
    }
    return result;
  }, [state.semesters, checkPrerequisiteConflicts]);

  const progressPercent = gpaData.totalCredits > 0
    ? Math.round((gpaData.completedCredits / gpaData.totalCredits) * 100)
    : 0;

  const gradEstimate = estimateGraduation();

  return (
    <TabEnterAnimation style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Good {greeting},
            </Text>
            <Text style={[styles.name, { color: colors.text }]}>
              {state.studentInfo.name}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={[styles.avatar, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}
          >
            <Ionicons name="person" size={22} color={colors.accent} />
          </Pressable>
        </View>

        {/* Auto-Grade Warning */}
        {hasAutoGradedCourses && (
          <View style={[styles.warningBanner, { backgroundColor: colors.warningSoft, borderColor: colors.warning }]}>
            <Ionicons name="alert-circle" size={18} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.warningTitle, { color: colors.warning }]}>Auto-populated grades</Text>
              <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                Grades were automatically set to 3.00 during setup. Update them as you complete your courses.
              </Text>
            </View>
          </View>
        )}

        {/* GPA Card */}
        <GlassCard style={styles.gpaCard}>
          <GPARing gpa={gpaData.overall} />
          <View style={styles.gpaStats}>
            <View style={styles.gpaStat}>
              <Text style={[styles.gpaStatValue, { color: colors.text }]}>{gpaData.completedCredits}</Text>
              <Text style={[styles.gpaStatLabel, { color: colors.textMuted }]}>Units Done</Text>
            </View>
            <View style={[styles.gpaDivider, { backgroundColor: colors.border }]} />
            <View style={styles.gpaStat}>
              <Text style={[styles.gpaStatValue, { color: colors.text }]}>{gpaData.totalCredits}</Text>
              <Text style={[styles.gpaStatLabel, { color: colors.textMuted }]}>Total Units</Text>
            </View>
            <View style={[styles.gpaDivider, { backgroundColor: colors.border }]} />
            <View style={styles.gpaStat}>
              <Text style={[styles.gpaStatValue, { color: colors.accent }]}>{progressPercent}%</Text>
              <Text style={[styles.gpaStatLabel, { color: colors.textMuted }]}>Progress</Text>
            </View>
          </View>
        </GlassCard>

        {/* Graduation Progress Card */}
        <Pressable
          onPress={() => lackingSummary.total > 0 ? router.push('/(tabs)/lacking') : null}
          style={({ pressed }) => [lackingSummary.total > 0 && pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
        >
          <GlassCard style={styles.gradCard}>
            {/* Title row */}
            <View style={styles.gradHeader}>
              <View style={styles.gradLeft}>
                <Ionicons name="school" size={18} color={colors.accent} />
                <Text style={[styles.gradTitle, { color: colors.text }]}>Graduation Progress</Text>
              </View>
              {lackingSummary.total > 0 && (
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              )}
            </View>

            {/* Estimated graduation */}
            {gradEstimate.label !== '—' && (
              <View style={styles.gradEstimateRow}>
                <View style={styles.gradEstimateLeft}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.gradEstimateLabel, { color: colors.textSecondary }]}>
                    Est. Graduation
                  </Text>
                </View>
                <View style={styles.gradEstimateRight}>
                  <Text style={[styles.gradEstimateValue, { color: colors.text }]}>
                    {gradEstimate.label}
                  </Text>
                  <View style={[
                    styles.gradEstimateBadge,
                    { backgroundColor: gradEstimate.delayed ? colors.warningSoft : colors.accentSoft },
                  ]}>
                    <View style={[
                      styles.gradEstimateDot,
                      { backgroundColor: gradEstimate.delayed ? colors.warning : colors.accent },
                    ]} />
                    <Text style={[
                      styles.gradEstimateBadgeText,
                      { color: gradEstimate.delayed ? colors.warning : colors.accent },
                    ]}>
                      {gradEstimate.onTrackLabel}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Units progress bar */}
            <View style={styles.gradUnitsRow}>
              <Text style={[styles.gradUnitsLabel, { color: colors.textSecondary }]}>Units</Text>
              <Text style={[styles.gradUnitsValue, { color: colors.accent }]}>
                {gpaData.completedCredits} / {gpaData.totalCredits}
              </Text>
            </View>
            <View style={[styles.gradTrack, { backgroundColor: colors.surfaceLight }]}>
              <View style={[styles.gradFill, {
                backgroundColor: colors.accent,
                width: `${progressPercent}%` as any,
              }]} />
            </View>

            {/* Course breakdown row */}
            {lackingSummary.total > 0 && (
              <>
                <View style={[styles.gradDivider, { backgroundColor: colors.border }]} />
                <View style={styles.gradCoursesRow}>
                  <Text style={[styles.gradCoursesLabel, { color: colors.textSecondary }]}>
                    Courses remaining
                  </Text>
                  <Text style={[styles.gradCoursesValue, { color: colors.text }]}>
                    {lackingSummary.total}
                  </Text>
                </View>
                <View style={[styles.gradTrack, { backgroundColor: colors.surfaceLight }]}>
                  <View style={[styles.gradFill, {
                    backgroundColor: colors.accent,
                    flex: lackingSummary.ready,
                  }]} />
                  <View style={[styles.gradFill, {
                    backgroundColor: colors.warning,
                    flex: lackingSummary.blocked,
                  }]} />
                </View>
                <View style={styles.gradLegend}>
                  <View style={styles.gradLegendItem}>
                    <View style={[styles.gradLegendDot, { backgroundColor: colors.accent }]} />
                    <Text style={[styles.gradLegendText, { color: colors.textMuted }]}>
                      {lackingSummary.ready} ready
                    </Text>
                  </View>
                  <View style={styles.gradLegendItem}>
                    <View style={[styles.gradLegendDot, { backgroundColor: colors.warning }]} />
                    <Text style={[styles.gradLegendText, { color: colors.textMuted }]}>
                      {lackingSummary.blocked} blocked
                    </Text>
                  </View>
                </View>
              </>
            )}
          </GlassCard>
        </Pressable>

        {/* Current Semester */}
        {currentSemester && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Current Semester
              </Text>
              <View style={[styles.semBadge, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.semBadgeText, { color: colors.accent }]}>
                  {currentSemester.shortLabel}
                </Text>
              </View>
            </View>
            {currentSemester.courses.map((sc) => {
              const course = getCourse(sc.courseId);
              if (!course) return null;
              const tag = getTagById(course.tags[0]);
              const hasConflict = conflicts.some(c => c.courseId === sc.courseId);
              return (
                <CourseCard
                  key={sc.courseId}
                  course={course}
                  tag={tag}
                  grade={sc.grade}
                  showPrereqWarning={hasConflict}
                  onPress={() => router.push({
                    pathname: '/(modals)/course-detail-modal',
                    params: { courseId: course.id },
                  })}
                />
              );
            })}
          </View>
        )}

        {/* Prerequisite Warnings */}
        {conflicts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Prerequisite Alerts
            </Text>
            {conflicts.slice(0, 3).map((conflict) => {
              const course = getCourse(conflict.courseId);
              if (!course) return null;
              const missingNames = conflict.missing.map(id => {
                const c = getCourse(id);
                return c?.code ?? id;
              });
              return (
                <ConflictAlert
                  key={`${conflict.semesterId}-${conflict.courseId}`}
                  courseCode={course.code}
                  missingPrereqs={missingNames}
                  onPress={() => router.push({
                    pathname: '/(modals)/course-detail-modal',
                    params: { courseId: course.id },
                  })}
                />
              );
            })}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '30' }]}
              onPress={() => router.push('/(modals)/add-course-modal')}
            >
              <Ionicons name="add-circle" size={24} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.accent }]}>Add Course</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.secondarySoft, borderColor: colors.secondary + '30' }]}
              onPress={() => router.push('/(tabs)/planner')}
            >
              <Ionicons name="calendar" size={24} color={colors.secondary} />
              <Text style={[styles.actionText, { color: colors.secondary }]}>View Plan</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.successSoft, borderColor: colors.success + '30' }]}
              onPress={() => router.push('/(tabs)/courses')}
            >
              <Ionicons name="book" size={24} color={colors.success} />
              <Text style={[styles.actionText, { color: colors.success }]}>Catalog</Text>
            </Pressable>
          </View>
        </View>

        {/* Completed Semesters Summary */}
        {completedSemesters.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Completed</Text>
            {completedSemesters.map(sem => {
              const credits = sem.courses.reduce((sum, sc) => {
                const c = getCourse(sc.courseId);
                return sum + (c?.credits ?? 0);
              }, 0);
              return (
                <GlassCard key={sem.id} style={styles.completedSem}>
                  <View style={styles.completedRow}>
                    <View style={[styles.checkCircle, { backgroundColor: colors.successSoft }]}>
                      <Ionicons name="checkmark" size={14} color={colors.success} />
                    </View>
                    <View style={styles.completedInfo}>
                      <Text style={[styles.completedLabel, { color: colors.text }]}>{sem.label}</Text>
                      <Text style={[styles.completedMeta, { color: colors.textMuted }]}>
                        {sem.courses.length} courses · {credits} units
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Scroll-fade overlay */}
      <ScrollFade color={colors.background} />
    </TabEnterAnimation>
  );
}

function getTimeOfDay(): string {
  const h = getPHDate().getHours();
  if (h >= 5  && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 22) return 'evening';
  return 'night';
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingTop: Spacing.xxl + Spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: { fontSize: FontSizes.md, fontWeight: '500' },
  name: { fontSize: FontSizes.xxl, fontWeight: '800', marginTop: 2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
  },
  gpaCard: { alignItems: 'center', paddingVertical: Spacing.xl, marginBottom: Spacing.sm },
  // Graduation Progress card
  gradCard: { marginBottom: Spacing.lg },
  gradHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  gradLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  gradTitle: { fontSize: FontSizes.sm, fontWeight: '700' },
  gradUnitsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6,
  },
  gradUnitsLabel: { fontSize: FontSizes.xs, fontWeight: '500' },
  gradUnitsValue: { fontSize: FontSizes.md, fontWeight: '800' },
  gradTrack: {
    height: 8, borderRadius: 4, overflow: 'hidden', flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  gradFill: { height: '100%' },
  gradDivider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.sm },
  gradCoursesRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6,
  },
  gradCoursesLabel: { fontSize: FontSizes.xs, fontWeight: '500' },
  gradCoursesValue: { fontSize: FontSizes.md, fontWeight: '800' },
  gradLegend: { flexDirection: 'row', gap: Spacing.lg, marginTop: 2 },
  gradLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gradLegendDot: { width: 8, height: 8, borderRadius: 4 },
  gradLegendText: { fontSize: FontSizes.xs, fontWeight: '500' },
  // Graduation estimate
  gradEstimateRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  gradEstimateLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gradEstimateLabel: { fontSize: FontSizes.xs, fontWeight: '500' },
  gradEstimateRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  gradEstimateValue: { fontSize: FontSizes.sm, fontWeight: '700' },
  gradEstimateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radii.full,
  },
  gradEstimateDot: { width: 6, height: 6, borderRadius: 3 },
  gradEstimateBadgeText: { fontSize: 10, fontWeight: '700' },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  warningTitle: { fontSize: FontSizes.sm, fontWeight: '600', marginBottom: 2 },
  warningText: { fontSize: FontSizes.xs, lineHeight: 16 },
  gpaStats: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: Spacing.lg, gap: Spacing.md,
  },
  gpaStat: { alignItems: 'center', flex: 1 },
  gpaStatValue: { fontSize: FontSizes.xl, fontWeight: '800' },
  gpaStatLabel: { fontSize: FontSizes.xs, fontWeight: '500', marginTop: 2 },
  gpaDivider: { width: 1, height: 30 },
  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', marginBottom: Spacing.sm },
  semBadge: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
  },
  semBadgeText: { fontSize: FontSizes.xs, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radii.md, gap: Spacing.xs, borderWidth: 1,
  },
  actionText: { fontSize: FontSizes.xs, fontWeight: '600' },
  completedSem: { marginBottom: Spacing.sm },
  completedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  completedInfo: { flex: 1 },
  completedLabel: { fontSize: FontSizes.md, fontWeight: '600' },
  completedMeta: { fontSize: FontSizes.xs, marginTop: 2 },
});
