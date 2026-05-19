import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentPlan } from '@/hooks/use-student-plan';
import { AppColors, Spacing, FontSizes, Radii } from '@/constants/theme';
import { TagBadge } from '@/components/ui/tag-badge';
import { ScrollFade } from '@/components/ui/scroll-fade';
import { TabEnterAnimation } from '@/components/ui/tab-enter-animation';
import { CustomAlert } from '@/components/ui/custom-alert';

export default function PlannerScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];
  const router = useRouter();
  const {
    state, dispatch, getCourse, getTagById, getSemesterGPA,
    checkPrerequisiteConflicts,
  } = useStudentPlan();

  const [moveModal, setMoveModal] = useState<{
    courseId: string;
    fromSemesterId: string;
  } | null>(null);

  // ─── Collapsible year state ─────────────────────────────────────────────────
  // Group semesters by year
  const yearGroups = useMemo(() => {
    const groups: { year: number; label: string; semesters: typeof state.semesters }[] = [];
    for (const sem of state.semesters) {
      let group = groups.find(g => g.year === sem.year);
      if (!group) {
        group = { year: sem.year, label: `Year ${sem.year}`, semesters: [] };
        groups.push(group);
      }
      group.semesters.push(sem);
    }
    return groups.sort((a, b) => a.year - b.year);
  }, [state.semesters]);

  // Default expanded: the year with an in-progress semester, or the first planned year
  const defaultExpandedYear = useMemo(() => {
    const inProgressYear = state.semesters.find(s => s.status === 'in-progress')?.year;
    if (inProgressYear) return inProgressYear;
    const plannedYear = state.semesters.find(s => s.status === 'planned')?.year;
    return plannedYear ?? 1;
  }, [state.semesters]);

  const [expandedYears, setExpandedYears] = useState<Set<number>>(
    () => new Set([defaultExpandedYear])
  );

  const toggleYear = (year: number) => {
    setExpandedYears(prev => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  // ─── Edit mode (batch drop) ─────────────────────────────────────────────────
  const [editMode, setEditMode] = useState(false);
  const [selectedForDrop, setSelectedForDrop] = useState<Set<string>>(new Set());
  const [dropAlert, setDropAlert] = useState<{ visible: boolean; names: string[] }>({ visible: false, names: [] });

  const toggleEditMode = () => {
    if (editMode) {
      setSelectedForDrop(new Set());
    }
    setEditMode(!editMode);
  };

  const toggleCourseForDrop = (semesterId: string, courseId: string) => {
    const key = `${semesterId}::${courseId}`;
    setSelectedForDrop(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleBatchDrop = () => {
    if (selectedForDrop.size === 0) return;
    const courseNames = Array.from(selectedForDrop).map(key => {
      const courseId = key.split('::')[1];
      return getCourse(courseId)?.code ?? courseId;
    });
    setDropAlert({ visible: true, names: courseNames });
  };

  const confirmDrop = () => {
    for (const key of selectedForDrop) {
      const [semesterId, courseId] = key.split('::');
      dispatch({ type: 'REMOVE_COURSE_FROM_SEMESTER', semesterId, courseId });
    }
    setSelectedForDrop(new Set());
    setEditMode(false);
    setDropAlert({ visible: false, names: [] });
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const handleMoveCourse = (toSemesterId: string) => {
    if (!moveModal) return;
    dispatch({
      type: 'MOVE_COURSE',
      fromSemesterId: moveModal.fromSemesterId,
      toSemesterId,
      courseId: moveModal.courseId,
    });
    setMoveModal(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in-progress': return 'ellipsis-horizontal-circle';
      default: return 'time-outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in-progress': return colors.accent;
      default: return colors.textMuted;
    }
  };

  const getYearSummary = (semesters: typeof state.semesters) => {
    let totalCredits = 0;
    let completedSems = 0;
    for (const sem of semesters) {
      if (sem.status === 'completed') completedSems++;
      for (const sc of sem.courses) {
        const c = getCourse(sc.courseId);
        if (c) totalCredits += c.credits;
      }
    }
    return { totalCredits, completedSems, totalSems: semesters.length };
  };

  const getYearStatus = (semesters: typeof state.semesters) => {
    if (semesters.every(s => s.status === 'completed')) return 'completed';
    if (semesters.some(s => s.status === 'in-progress')) return 'in-progress';
    return 'planned';
  };

  return (
    <TabEnterAnimation style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>Semester Planner</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {editMode ? 'Select courses to drop' : 'Tap a year to expand · Long-press to move'}
              </Text>
            </View>
            <Pressable
              onPress={toggleEditMode}
              style={[
                styles.editBtn,
                {
                  backgroundColor: editMode ? colors.danger + '18' : colors.surfaceLight,
                  borderColor: editMode ? colors.danger + '40' : colors.border,
                },
              ]}
            >
              <Ionicons
                name={editMode ? 'close' : 'create-outline'}
                size={16}
                color={editMode ? colors.danger : colors.textSecondary}
              />
              <Text style={[
                styles.editBtnText,
                { color: editMode ? colors.danger : colors.textSecondary },
              ]}>
                {editMode ? 'Cancel' : 'Edit'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Year Accordions */}
        {yearGroups.map((yearGroup) => {
          const isExpanded = expandedYears.has(yearGroup.year);
          const summary = getYearSummary(yearGroup.semesters);
          const yearStatus = getYearStatus(yearGroup.semesters);

          return (
            <View key={yearGroup.year} style={styles.yearBlock}>
              {/* Year Header — Tap to expand/collapse */}
              <Pressable
                onPress={() => toggleYear(yearGroup.year)}
                style={({ pressed }) => [
                  styles.yearHeader,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isExpanded ? colors.accent + '40' : colors.glassBorder,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={[styles.yearDot, { backgroundColor: getStatusColor(yearStatus) }]}>
                  <Text style={styles.yearDotText}>{yearGroup.year}</Text>
                </View>
                <View style={styles.yearInfo}>
                  <Text style={[styles.yearLabel, { color: colors.text }]}>
                    {yearGroup.label}
                  </Text>
                  <Text style={[styles.yearMeta, { color: colors.textMuted }]}>
                    {summary.totalSems} semesters · {summary.totalCredits} credits
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(yearStatus) + '18' },
                ]}>
                  <Text style={[styles.statusText, { color: getStatusColor(yearStatus) }]}>
                    {yearStatus === 'in-progress' ? 'Current' :
                     yearStatus === 'completed' ? 'Done' : 'Planned'}
                  </Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textMuted}
                  style={{ marginLeft: Spacing.xs }}
                />
              </Pressable>

              {/* Expanded Semester Content */}
              {isExpanded && yearGroup.semesters.map((semester, index) => {
                const semGPA = getSemesterGPA(semester.id);
                const totalCredits = semester.courses.reduce((sum, sc) => {
                  const c = getCourse(sc.courseId);
                  return sum + (c?.credits ?? 0);
                }, 0);

                return (
                  <View key={semester.id} style={styles.semesterBlock}>
                    {/* Timeline connector */}
                    {index > 0 && (
                      <View style={[styles.timelineConnector, { backgroundColor: colors.border }]} />
                    )}

                    {/* Semester header */}
                    <View style={styles.semesterHeader}>
                      <View style={[styles.timelineDot, { backgroundColor: getStatusColor(semester.status) }]}>
                        <Ionicons
                          name={getStatusIcon(semester.status) as any}
                          size={14}
                          color="#FFF"
                        />
                      </View>
                      <View style={styles.semesterInfo}>
                        <Text style={[styles.semesterLabel, { color: colors.text }]}>
                          {semester.shortLabel}
                        </Text>
                        <View style={styles.semesterMeta}>
                          <Text style={[styles.metaText, { color: colors.textMuted }]}>
                            {totalCredits} credits
                          </Text>
                          {semester.status === 'completed' && semGPA > 0 && (
                            <>
                              <Text style={[styles.metaDot, { color: colors.border }]}>·</Text>
                              <Text style={[styles.metaText, { color: colors.success }]}>
                                GPA {semGPA.toFixed(2)}
                              </Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Course list */}
                    <View style={styles.courseList}>
                      {semester.courses.map((sc) => {
                        const course = getCourse(sc.courseId);
                        if (!course) return null;
                        const tag = getTagById(course.tags[0]);
                        const conflicts = checkPrerequisiteConflicts(semester.id, sc.courseId);
                        const hasConflict = conflicts.length > 0;
                        const dropKey = `${semester.id}::${sc.courseId}`;
                        const isSelectedForDrop = selectedForDrop.has(dropKey);
                        const canEdit = editMode && semester.status !== 'completed';

                        return (
                          <Pressable
                            key={`${semester.id}-${sc.courseId}`}
                            onPress={() => {
                              if (canEdit) {
                                toggleCourseForDrop(semester.id, sc.courseId);
                              } else if (!editMode) {
                                router.push({
                                  pathname: '/(modals)/course-detail-modal',
                                  params: { courseId: course.id },
                                });
                              }
                            }}
                            onLongPress={() => {
                              if (!editMode && semester.status !== 'completed') {
                                setMoveModal({ courseId: sc.courseId, fromSemesterId: semester.id });
                              }
                            }}
                            style={({ pressed }) => [
                              styles.courseItem,
                              {
                                backgroundColor: isSelectedForDrop
                                  ? colors.danger + '12'
                                  : colors.surface,
                                borderColor: isSelectedForDrop
                                  ? colors.danger + '50'
                                  : hasConflict
                                    ? colors.danger + '50'
                                    : colors.glassBorder,
                              },
                              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                            ]}
                          >
                            <View style={[styles.courseStrip, { backgroundColor: tag?.color ?? colors.accent }]} />
                            <View style={styles.courseContent}>
                              <View style={styles.courseTopRow}>
                                <Text style={[styles.courseCode, { color: colors.textMuted }]}>
                                  {course.code}
                                </Text>
                                <View style={styles.courseRight}>
                                  {sc.grade && (
                                    <View style={[styles.gradePill, {
                                      backgroundColor: sc.grade === 'NC' ? colors.warningSoft
                                        : sc.grade === '5.00' ? colors.dangerSoft
                                        : colors.successSoft,
                                    }]}>
                                      <Text style={[styles.gradeText, {
                                        color: sc.grade === 'NC' ? colors.warning
                                          : sc.grade === '5.00' ? colors.danger
                                          : colors.success,
                                      }]}>{sc.grade}</Text>
                                    </View>
                                  )}
                                  {hasConflict && !editMode && (
                                    <Ionicons name="warning" size={14} color={colors.danger} />
                                  )}
                                </View>
                              </View>
                              <Text style={[styles.courseName, { color: colors.text }]} numberOfLines={1}>
                                {sc.customName || course.name}
                              </Text>
                              <View style={styles.courseBottomRow}>
                                <Text style={[styles.courseCredits, { color: colors.textMuted }]}>
                                  {course.credits} units
                                </Text>
                                {!editMode && tag && <TagBadge name={tag.name} color={tag.color} size="sm" />}
                              </View>
                            </View>

                            {/* Edit mode checkbox — right side */}
                            {editMode && (
                              <View style={styles.checkboxWrap}>
                                {semester.status === 'completed' ? (
                                  <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
                                ) : (
                                  <Ionicons
                                    name={isSelectedForDrop ? 'checkbox' : 'square-outline'}
                                    size={22}
                                    color={isSelectedForDrop ? colors.danger : colors.textMuted}
                                  />
                                )}
                              </View>
                            )}
                          </Pressable>
                        );
                      })}

                      {/* Add course button — hidden in edit mode */}
                      {!editMode && semester.status !== 'completed' && (
                        <Pressable
                          style={[styles.addCourseBtn, { borderColor: colors.border }]}
                          onPress={() => router.push({
                            pathname: '/(modals)/add-course-modal',
                            params: { semesterId: semester.id },
                          })}
                        >
                          <Ionicons name="add" size={18} color={colors.textMuted} />
                          <Text style={[styles.addCourseText, { color: colors.textMuted }]}>
                            Add Course
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Drop Button — visible in edit mode with selections */}
      {editMode && selectedForDrop.size > 0 && (
        <View style={[styles.floatingDropBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.dropBarText, { color: colors.text }]}>
            {selectedForDrop.size} course{selectedForDrop.size > 1 ? 's' : ''} selected
          </Text>
          <Pressable
            style={[styles.dropBtn, { backgroundColor: colors.danger }]}
            onPress={handleBatchDrop}
          >
            <Ionicons name="trash" size={16} color="#FFF" />
            <Text style={styles.dropBtnText}>Drop Selected</Text>
          </Pressable>
        </View>
      )}

      {/* Move Course Modal */}
      <Modal
        visible={moveModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMoveModal(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMoveModal(null)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Move to Semester
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {moveModal ? getCourse(moveModal.courseId)?.name : ''}
            </Text>

            <ScrollView style={styles.modalList}>
              {state.semesters
                .filter(s => s.id !== moveModal?.fromSemesterId && s.status !== 'completed')
                .map(sem => (
                  <Pressable
                    key={sem.id}
                    style={[styles.modalOption, { borderColor: colors.border }]}
                    onPress={() => handleMoveCourse(sem.id)}
                  >
                    <Ionicons
                      name={getStatusIcon(sem.status) as any}
                      size={18}
                      color={getStatusColor(sem.status)}
                    />
                    <Text style={[styles.modalOptionText, { color: colors.text }]}>
                      {sem.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </Pressable>
                ))
              }
            </ScrollView>

            <Pressable
              style={[styles.modalCancel, { backgroundColor: colors.surfaceLight }]}
              onPress={() => setMoveModal(null)}
            >
              <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Drop confirmation alert */}
      <CustomAlert
        visible={dropAlert.visible}
        title="Drop Courses"
        message={`Are you sure you want to drop ${dropAlert.names.length} course${dropAlert.names.length !== 1 ? 's' : ''}?\n\n${dropAlert.names.join(', ')}`}
        icon="trash-outline"
        iconColor={colors.danger}
        buttons={[
          { text: 'Cancel', style: 'cancel' },
          { text: 'Drop', style: 'destructive', onPress: confirmDrop },
        ]}
        onDismiss={() => setDropAlert({ visible: false, names: [] })}
      />

      {/* Scroll-fade overlay */}
      <ScrollFade color={colors.background} />
    </TabEnterAnimation>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingTop: Spacing.xxl + Spacing.lg },
  header: { marginBottom: Spacing.xl },
  headerRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
  },
  title: { fontSize: FontSizes.xxl, fontWeight: '800' },
  subtitle: { fontSize: FontSizes.sm, marginTop: Spacing.xs },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.full, borderWidth: 1,
  },
  editBtnText: { fontSize: FontSizes.sm, fontWeight: '600' },

  // Year accordion
  yearBlock: { marginBottom: Spacing.sm },
  yearHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderRadius: Radii.lg, borderWidth: 1,
  },
  yearDot: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  yearDotText: { fontSize: FontSizes.md, fontWeight: '800', color: '#FFF' },
  yearInfo: { flex: 1 },
  yearLabel: { fontSize: FontSizes.lg, fontWeight: '700' },
  yearMeta: { fontSize: FontSizes.xs, marginTop: 2, fontWeight: '500' },
  statusBadge: {
    paddingHorizontal: Spacing.sm + 2, paddingVertical: 4, borderRadius: Radii.full,
  },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Semester (inside expanded year)
  semesterBlock: { marginTop: Spacing.md, marginLeft: Spacing.xs, position: 'relative' },
  timelineConnector: {
    position: 'absolute', left: 13, top: -10, width: 2, height: 10,
  },
  semesterHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginBottom: Spacing.sm, paddingVertical: Spacing.xs,
  },
  timelineDot: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  semesterInfo: { flex: 1 },
  semesterLabel: { fontSize: FontSizes.md, fontWeight: '700' },
  semesterMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: FontSizes.xs, fontWeight: '500' },
  metaDot: { fontSize: FontSizes.xs },

  // Course items
  courseList: {
    marginLeft: 13, paddingLeft: Spacing.md, borderLeftWidth: 2,
    borderLeftColor: 'rgba(128,128,128,0.12)',
    gap: Spacing.xs + 2,
  },
  courseItem: {
    flexDirection: 'row', borderRadius: Radii.md, borderWidth: 1,
    overflow: 'hidden', alignItems: 'center',
  },
  checkboxWrap: {
    paddingRight: Spacing.md, justifyContent: 'center', alignItems: 'center',
  },
  courseStrip: { width: 3, alignSelf: 'stretch' },
  courseContent: { flex: 1, paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.md },
  courseTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  courseCode: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  courseName: { fontSize: FontSizes.sm, fontWeight: '600', marginTop: 3, lineHeight: 18 },
  courseBottomRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 4,
  },
  courseCredits: { fontSize: 10, fontWeight: '500' },
  courseRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  gradePill: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radii.sm,
  },
  gradeText: { fontSize: 10, fontWeight: '800' },
  addCourseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.xs, paddingVertical: Spacing.sm + 2,
    borderRadius: Radii.md, borderWidth: 1, borderStyle: 'dashed',
  },
  addCourseText: { fontSize: FontSizes.xs, fontWeight: '600' },

  // Floating drop bar
  floatingDropBar: {
    position: 'absolute', bottom: 90, left: Spacing.md, right: Spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.md,
    borderRadius: Radii.xl, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 10,
  },
  dropBarText: { fontSize: FontSizes.sm, fontWeight: '600' },
  dropBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
  },
  dropBtnText: { fontSize: FontSizes.sm, fontWeight: '700', color: '#FFF' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: Spacing.lg,
  },
  modalContent: {
    width: '100%', maxHeight: '70%', borderRadius: Radii.xl, padding: Spacing.lg,
  },
  modalTitle: { fontSize: FontSizes.xl, fontWeight: '800', marginBottom: 4 },
  modalSubtitle: { fontSize: FontSizes.sm, marginBottom: Spacing.lg },
  modalList: { maxHeight: 300 },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, borderBottomWidth: 1,
  },
  modalOptionText: { fontSize: FontSizes.md, fontWeight: '500', flex: 1 },
  modalCancel: {
    alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radii.md, marginTop: Spacing.md,
  },
  modalCancelText: { fontSize: FontSizes.md, fontWeight: '600' },
});
