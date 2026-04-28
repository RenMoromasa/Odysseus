import { TagBadge } from '@/components/ui/tag-badge';
import { AppColors, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentPlan } from '@/hooks/use-student-plan';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default function CourseDetailModal() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];
  const router = useRouter();
  const {
    getCourse, getTagById, isCourseCompleted, getCourseGrade,
    getCourseSemester, checkPrerequisiteConflicts, dispatch, state,
  } = useStudentPlan();

  const course = getCourse(courseId ?? '');
  const grade = getCourseGrade(courseId ?? '');
  const semester = getCourseSemester(courseId ?? '');
  const [gradeInput, setGradeInput] = useState<string>(grade ?? '');
  const [gradeError, setGradeError] = useState<string>('');

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textMuted }]}>Course not found</Text>
      </View>
    );
  }

  const tag = getTagById(course.tags[0]);
  const conflicts = semester ? checkPrerequisiteConflicts(semester.id, course.id) : [];

  const handleSetGrade = () => {
    if (!semester) return;
    const num = parseFloat(gradeInput);
    if (isNaN(num) || num < 1.0 || num > 5.0) {
      setGradeError('Enter a grade between 1.00 and 5.00');
      return;
    }
    const formatted = num.toFixed(2);
    setGradeInput(formatted);
    setGradeError('');
    dispatch({ type: 'SET_GRADE', semesterId: semester.id, courseId: course.id, grade: formatted });
  };

  const handleRemoveCourse = () => {
    if (!semester) return;
    dispatch({ type: 'REMOVE_COURSE_FROM_SEMESTER', semesterId: semester.id, courseId: course.id });
    router.back();
  };

  const handleClearGrade = () => {
    if (!semester) return;
    setGradeInput('');
    setGradeError('');
    dispatch({ type: 'CLEAR_GRADE', semesterId: semester.id, courseId: course.id });
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close-circle" size={32} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Course identity */}
        <View style={[styles.identity, { borderColor: tag?.color ?? colors.accent }]}>
          <Text style={[styles.code, { color: tag?.color ?? colors.accent }]}>{course.code}</Text>
          <Text style={[styles.name, { color: colors.text }]}>{course.name}</Text>
          <View style={styles.badges}>
            {tag && <TagBadge name={tag.name} color={tag.color} size="md" />}
            <View style={[styles.creditBadge, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.creditText, { color: colors.textSecondary }]}>
                {course.credits} Credits
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Description</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {course.description}
          </Text>
        </View>

        {/* Prerequisites */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Prerequisites</Text>
          {course.prerequisites.length === 0 ? (
            <View style={[styles.noPrereq, { backgroundColor: colors.successSoft }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={[styles.noPrereqText, { color: colors.success }]}>
                No prerequisites required
              </Text>
            </View>
          ) : (
            course.prerequisites.map(prereqId => {
              const prereq = getCourse(prereqId);
              if (!prereq) return null;
              const completed = isCourseCompleted(prereqId);
              const prereqGrade = getCourseGrade(prereqId);
              return (
                <View
                  key={prereqId}
                  style={[styles.prereqItem, {
                    backgroundColor: completed ? colors.successSoft : colors.warningSoft,
                    borderColor: completed ? colors.success + '30' : colors.warning + '30',
                  }]}
                >
                  <Ionicons
                    name={completed ? 'checkmark-circle' : 'alert-circle'}
                    size={20}
                    color={completed ? colors.success : colors.warning}
                  />
                  <View style={styles.prereqInfo}>
                    <Text style={[styles.prereqCode, { color: colors.text }]}>
                      {prereq.code}
                    </Text>
                    <Text style={[styles.prereqName, { color: colors.textSecondary }]}>
                      {prereq.name}
                    </Text>
                  </View>
                  {prereqGrade && (
                    <Text style={[styles.prereqGrade, { color: colors.success }]}>
                      {prereqGrade}
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Conflict warning */}
        {conflicts.length > 0 && (
          <View style={[styles.conflictBanner, { backgroundColor: colors.dangerSoft, borderColor: colors.danger + '30' }]}>
            <Ionicons name="warning" size={20} color={colors.danger} />
            <Text style={[styles.conflictText, { color: colors.danger }]}>
              Missing prerequisites: {conflicts.map(id => getCourse(id)?.code ?? id).join(', ')}
            </Text>
          </View>
        )}

      {/* Grade Input */}
        {semester && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Grade</Text>
            <View style={styles.gradeRow}>
              <TextInput
                style={[styles.gradeInput, {
                  backgroundColor: colors.surface,
                  borderColor: gradeError ? colors.danger : colors.border,
                  color: colors.text,
                }]}
                value={gradeInput}
                onChangeText={(text) => { setGradeInput(text); setGradeError(''); }}
                onSubmitEditing={handleSetGrade}
                placeholder="e.g. 1.75"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
              <Pressable
                style={[styles.gradeSaveBtn, { backgroundColor: colors.accent }]}
                onPress={handleSetGrade}
              >
                <Text style={styles.gradeSaveBtnText}>Save</Text>
              </Pressable>
              {gradeInput !== '' && (
                <Pressable
                  style={[styles.gradeClearBtn, { backgroundColor: colors.dangerSoft }]}
                  onPress={handleClearGrade}
                >
                  <Ionicons name="close" size={18} color={colors.danger} />
                </Pressable>
              )}
            </View>
            {gradeError !== '' && (
              <Text style={[styles.gradeErrorText, { color: colors.danger }]}>{gradeError}</Text>
            )}
            <Text style={[styles.gradeHint, { color: colors.textMuted }]}>
              1.00 = Highest · 3.00 = Passing · 5.00 = Failed
            </Text>
          </View>
        )}

        {/* Semester info */}
        {semester && (
          <View style={[styles.semInfo, { backgroundColor: colors.surfaceLight }]}>
            <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.semInfoText, { color: colors.textSecondary }]}>
              Enrolled in {semester.label}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {semester && semester.status !== 'completed' && (
            <Pressable
              style={[styles.removeBtn, { backgroundColor: colors.dangerSoft, borderColor: colors.danger + '30' }]}
              onPress={handleRemoveCourse}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={[styles.removeBtnText, { color: colors.danger }]}>
                Drop Course
              </Text>
            </Pressable>
          )}
          {!semester && (
            <Pressable
              style={[styles.addBtn, { backgroundColor: colors.accent }]}
              onPress={() => {
                router.back();
                setTimeout(() => {
                  router.push({ pathname: '/add-course-modal', params: { courseId: course.id } });
                }, 300);
              }}
            >
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={styles.addBtnText}>Add to Plan</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg },
  errorText: { fontSize: FontSizes.md, textAlign: 'center', marginTop: Spacing.xxl },
  headerRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: Spacing.md },
  identity: {
    paddingBottom: Spacing.lg, marginBottom: Spacing.lg,
    borderBottomWidth: 2,
  },
  code: { fontSize: FontSizes.sm, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  name: { fontSize: FontSizes.xxl, fontWeight: '800', marginTop: Spacing.xs, lineHeight: 34 },
  badges: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, flexWrap: 'wrap' },
  creditBadge: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radii.full,
  },
  creditText: { fontSize: FontSizes.sm, fontWeight: '600' },
  section: { marginBottom: Spacing.lg },
  sectionLabel: {
    fontSize: FontSizes.xs, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: Spacing.sm,
  },
  description: { fontSize: FontSizes.md, lineHeight: 22 },
  noPrereq: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: Radii.md,
  },
  noPrereqText: { fontSize: FontSizes.sm, fontWeight: '600' },
  prereqItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: Radii.md, borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  prereqInfo: { flex: 1 },
  prereqCode: { fontSize: FontSizes.sm, fontWeight: '700' },
  prereqName: { fontSize: FontSizes.xs, marginTop: 1 },
  prereqGrade: { fontSize: FontSizes.md, fontWeight: '800' },
  conflictBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: Radii.md, borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  conflictText: { fontSize: FontSizes.sm, fontWeight: '600', flex: 1 },
  gradeBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.md, borderRadius: Radii.md, borderWidth: 1,
  },
  gradeBtnText: { fontSize: FontSizes.md, fontWeight: '600' },
  gradeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm,
  },
  gradeOption: {
    width: '18%' as any, alignItems: 'center', paddingVertical: Spacing.sm,
    borderRadius: Radii.md, borderWidth: 1,
  },
  gradeOptionText: { fontSize: FontSizes.md, fontWeight: '700' },
  gradeOptionPts: { fontSize: FontSizes.xs, marginTop: 2 },
  semInfo: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: Radii.md, marginBottom: Spacing.lg,
  },
  semInfoText: { fontSize: FontSizes.sm },
  actions: { gap: Spacing.sm, marginBottom: Spacing.xl },
  removeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.md, borderRadius: Radii.md, borderWidth: 1,
  },
  removeBtnText: { fontSize: FontSizes.md, fontWeight: '600' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.md, borderRadius: Radii.md,
  },
  addBtnText: { fontSize: FontSizes.md, fontWeight: '600', color: '#FFF' },
  gradeRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
  },
  gradeInput: {
    flex: 1, padding: Spacing.md, borderRadius: Radii.md,
    borderWidth: 1, fontSize: FontSizes.lg, fontWeight: '700',
  },
  gradeSaveBtn: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  gradeSaveBtnText: { color: '#FFF', fontWeight: '700', fontSize: FontSizes.md },
  gradeClearBtn: {
    width: 40, height: 40, borderRadius: Radii.md,
    alignItems: 'center', justifyContent: 'center',
  },
  gradeErrorText: { fontSize: FontSizes.xs, marginTop: Spacing.xs },
  gradeHint: { fontSize: FontSizes.xs, marginTop: Spacing.xs },
});
