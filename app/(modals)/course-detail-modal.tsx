import { TagBadge } from '@/components/ui/tag-badge';
import { CustomAlert } from '@/components/ui/custom-alert';
import { AppColors, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentPlan } from '@/hooks/use-student-plan';
import { isFailingGrade, isPassingGrade, isFreeElective } from '@/constants/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
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
  const [gradeSaved, setGradeSaved] = useState(false);
  const [dropAlert, setDropAlert] = useState(false);

  // Free elective custom name
  const semesterCourse = semester?.courses.find(c => c.courseId === courseId);
  const [customNameInput, setCustomNameInput] = useState(semesterCourse?.customName ?? '');
  const [customNameSaved, setCustomNameSaved] = useState(false);

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textMuted }]}>Course not found</Text>
      </View>
    );
  }

  const tag = getTagById(course.tags[0]);
  const conflicts = semester ? checkPrerequisiteConflicts(semester.id, course.id) : [];
  const isFreeElec = isFreeElective(course);

  // Grade color logic
  const getGradeColor = (g?: string) => {
    if (!g) return colors.textMuted;
    if (g === 'NC') return colors.warning;
    if (g === '5.00') return colors.danger;
    if (isPassingGrade(g)) return colors.success;
    return colors.textMuted;
  };

  const getGradeBgColor = (g?: string) => {
    if (!g) return colors.surfaceLight;
    if (g === 'NC') return colors.warningSoft;
    if (g === '5.00') return colors.dangerSoft;
    if (isPassingGrade(g)) return colors.successSoft;
    return colors.surfaceLight;
  };

  const handleSetGrade = () => {
    if (!semester) return;
    const trimmed = gradeInput.trim().toUpperCase();

    // Handle NC
    if (trimmed === 'NC') {
      setGradeInput('NC');
      setGradeError('');
      dispatch({ type: 'SET_GRADE', semesterId: semester.id, courseId: course.id, grade: 'NC' });
      setGradeSaved(true);
      return;
    }

    const num = parseFloat(trimmed);
    if (isNaN(num) || num < 1.0 || num > 5.0) {
      setGradeError('Enter a grade between 1.00 and 5.00, or NC');
      return;
    }
    const formatted = num.toFixed(2);
    setGradeInput(formatted);
    setGradeError('');
    dispatch({ type: 'SET_GRADE', semesterId: semester.id, courseId: course.id, grade: formatted });
    setGradeSaved(true);
  };

  const handleRemoveCourse = () => {
    setDropAlert(true);
  };

  const confirmRemoveCourse = () => {
    if (!semester) return;
    dispatch({ type: 'REMOVE_COURSE_FROM_SEMESTER', semesterId: semester.id, courseId: course.id });
    setDropAlert(false);
    router.back();
  };

  const handleClearGrade = () => {
    if (!semester) return;
    setGradeInput('');
    setGradeError('');
    dispatch({ type: 'CLEAR_GRADE', semesterId: semester.id, courseId: course.id });
  };

  const handleSaveCustomName = () => {
    if (!semester) return;
    dispatch({ type: 'SET_CUSTOM_NAME', semesterId: semester.id, courseId: course.id, customName: customNameInput.trim() });
    setCustomNameSaved(true);
    setTimeout(() => setCustomNameSaved(false), 1500);
  };

  // Quick grade buttons
  const quickGrades = ['1.00', '1.25', '1.50', '1.75', '2.00', '2.25', '2.50', '2.75', '3.00', '5.00', 'NC'];

  const handleQuickGrade = (g: string) => {
    if (!semester) return;
    setGradeInput(g);
    setGradeError('');
    dispatch({ type: 'SET_GRADE', semesterId: semester.id, courseId: course.id, grade: g });
    setGradeSaved(true);
  };

  // Saved grade color for the modal
  const savedGradeColor = getGradeColor(gradeInput);
  const savedGradeLabel = gradeInput === 'NC' ? 'NC (No Credit)' : gradeInput;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Course identity — close button lives on the same row as the course code */}
        <View style={[styles.identity, { borderColor: tag?.color ?? colors.accent }]}>
          <View style={styles.codeRow}>
            <Text style={[styles.code, { color: tag?.color ?? colors.accent }]}>{course.code}</Text>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="close-circle" size={28} color={colors.textMuted} />
            </Pressable>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {semesterCourse?.customName || course.name}
          </Text>
          <View style={styles.badges}>
            {tag && <TagBadge name={tag.name} color={tag.color} size="md" />}
            <View style={[styles.creditBadge, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.creditText, { color: colors.textSecondary }]}>
                {course.credits} Credits
              </Text>
            </View>
            {grade && (
              <View style={[styles.creditBadge, { backgroundColor: getGradeBgColor(grade) }]}>
                <Text style={[styles.creditText, { color: getGradeColor(grade), fontWeight: '800' }]}>
                  {grade}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Free Elective Custom Name */}
        {isFreeElec && semester && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Custom Name</Text>
            <Text style={[styles.freeElecHint, { color: colors.textMuted }]}>
              Set a name for this free elective (e.g. the actual subject you enrolled in)
            </Text>
            <View style={styles.gradeRow}>
              <TextInput
                style={[styles.gradeInput, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                }]}
                value={customNameInput}
                onChangeText={setCustomNameInput}
                onSubmitEditing={handleSaveCustomName}
                placeholder="e.g. Filipino Literature"
                placeholderTextColor={colors.textMuted}
                returnKeyType="done"
              />
              <Pressable
                style={[styles.gradeSaveBtn, { backgroundColor: colors.accent }]}
                onPress={handleSaveCustomName}
              >
                <Text style={styles.gradeSaveBtnText}>
                  {customNameSaved ? '✓' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

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
              const prereqColor = getGradeColor(prereqGrade);
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
                    <Text style={[styles.prereqGrade, { color: prereqColor }]}>
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
                placeholder="e.g. 1.75 or NC"
                placeholderTextColor={colors.textMuted}
                keyboardType="default"
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

            {/* Quick grade buttons */}
            <View style={styles.quickGradeGrid}>
              {quickGrades.map(g => {
                const isSelected = gradeInput === g;
                const qColor = getGradeColor(g);
                const qBg = getGradeBgColor(g);
                return (
                  <Pressable
                    key={g}
                    style={[
                      styles.quickGradeBtn,
                      {
                        backgroundColor: isSelected ? qColor : qBg,
                        borderColor: qColor + '40',
                      },
                    ]}
                    onPress={() => handleQuickGrade(g)}
                  >
                    <Text style={[
                      styles.quickGradeText,
                      { color: isSelected ? '#FFF' : qColor },
                    ]}>
                      {g}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.gradeHint, { color: colors.textMuted }]}>
              1.00 = Highest · 3.00 = Passing · 5.00 = Failed · NC = No Credit
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
                  router.push({ pathname: '/(modals)/add-course-modal', params: { courseId: course.id } });
                }, 300);
              }}
            >
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={styles.addBtnText}>Add to Plan</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* ── Grade Saved Confirmation Modal ──────────────────────────────── */}
      <Modal
        visible={gradeSaved}
        transparent
        animationType="fade"
        onRequestClose={() => setGradeSaved(false)}
      >
        <Pressable
          style={styles.savedOverlay}
          onPress={() => setGradeSaved(false)}
        >
          <Pressable style={[styles.savedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Icon */}
            <View style={[styles.savedIconWrap, { backgroundColor: getGradeBgColor(gradeInput) }]}>
              <Ionicons
                name={isFailingGrade(gradeInput) ? 'alert-circle' : 'checkmark-circle'}
                size={40}
                color={savedGradeColor}
              />
            </View>

            {/* Text */}
            <Text style={[styles.savedTitle, { color: colors.text }]}>Grade Saved!</Text>
            <Text style={[styles.savedSubtitle, { color: colors.textSecondary }]}>
              Your grade for{' '}
              <Text style={{ fontWeight: '700', color: colors.text }}>{course.code}</Text>
              {' '}has been recorded as{' '}
              <Text style={{ fontWeight: '800', color: savedGradeColor }}>{savedGradeLabel}</Text>.
            </Text>

            {/* Confirm button */}
            <Pressable
              style={[styles.savedBtn, { backgroundColor: colors.accent }]}
              onPress={() => setGradeSaved(false)}
            >
              <Text style={styles.savedBtnText}>Got it</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Drop Course Confirmation ──────────────────────────────── */}
      <CustomAlert
        visible={dropAlert}
        title="Drop Course?"
        message={`Are you sure you want to drop ${course.code} from your plan? This will also clear any saved grade.`}
        icon="trash"
        iconColor={colors.danger}
        buttons={[
          { text: 'Cancel', style: 'cancel' },
          { text: 'Drop', style: 'destructive', onPress: confirmRemoveCourse },
        ]}
        onDismiss={() => setDropAlert(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg },
  errorText: { fontSize: FontSizes.md, textAlign: 'center', marginTop: Spacing.xxl },
  identity: {
    paddingBottom: Spacing.lg, marginBottom: Spacing.lg,
    borderBottomWidth: 2,
    paddingTop: Spacing.xl + Spacing.md,
  },
  codeRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.xs,
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
  freeElecHint: { fontSize: FontSizes.xs, marginBottom: Spacing.sm, lineHeight: 16 },
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
  gradeHint: { fontSize: FontSizes.xs, marginTop: Spacing.sm },
  quickGradeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.sm,
  },
  quickGradeBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radii.md, borderWidth: 1,
    minWidth: 52, alignItems: 'center',
  },
  quickGradeText: { fontSize: FontSizes.sm, fontWeight: '700' },
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
  savedOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: Spacing.lg,
  },
  savedCard: {
    width: '100%', borderRadius: Radii.xl, borderWidth: 1,
    padding: Spacing.xl, alignItems: 'center', gap: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 12,
  },
  savedIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  savedTitle: { fontSize: FontSizes.xl, fontWeight: '800' },
  savedSubtitle: {
    fontSize: FontSizes.md, textAlign: 'center', lineHeight: 22,
  },
  savedBtn: {
    marginTop: Spacing.sm, width: '100%', alignItems: 'center',
    paddingVertical: Spacing.md, borderRadius: Radii.md,
  },
  savedBtnText: { color: '#FFF', fontWeight: '700', fontSize: FontSizes.md },
});
