import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentPlan } from '@/hooks/use-student-plan';
import { AppColors, Spacing, FontSizes, Radii } from '@/constants/theme';
import { GlassCard } from '@/components/ui/glass-card';
import { GPARing } from '@/components/ui/gpa-ring';
import { CourseCard } from '@/components/ui/course-card';
import { ConflictAlert } from '@/components/ui/conflict-alert';

export default function DashboardScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];
  const router = useRouter();
  const {
    state, getCourse, getTagById, calculateGPA,
    checkPrerequisiteConflicts, isCourseCompleted,
  } = useStudentPlan();

  const gpaData = calculateGPA();
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Good {getTimeOfDay()},
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
              <Text style={[styles.gpaStatLabel, { color: colors.textMuted }]}>Credits Done</Text>
            </View>
            <View style={[styles.gpaDivider, { backgroundColor: colors.border }]} />
            <View style={styles.gpaStat}>
              <Text style={[styles.gpaStatValue, { color: colors.text }]}>{gpaData.totalCredits}</Text>
              <Text style={[styles.gpaStatLabel, { color: colors.textMuted }]}>Total Credits</Text>
            </View>
            <View style={[styles.gpaDivider, { backgroundColor: colors.border }]} />
            <View style={styles.gpaStat}>
              <Text style={[styles.gpaStatValue, { color: colors.accent }]}>{progressPercent}%</Text>
              <Text style={[styles.gpaStatLabel, { color: colors.textMuted }]}>Progress</Text>
            </View>
          </View>
        </GlassCard>

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
                  key={conflict.courseId}
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
                        {sem.courses.length} courses · {credits} credits
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

      {/* Floating Action Button */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={() => router.push('/(modals)/add-course-modal')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
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
  gpaCard: { alignItems: 'center', paddingVertical: Spacing.xl, marginBottom: Spacing.lg },
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
  fab: {
    position: 'absolute', bottom: 90, right: Spacing.lg,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
});
