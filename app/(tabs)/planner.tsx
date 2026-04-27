import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentPlan } from '@/hooks/use-student-plan';
import { AppColors, Spacing, FontSizes, Radii } from '@/constants/theme';
import { GlassCard } from '@/components/ui/glass-card';
import { TagBadge } from '@/components/ui/tag-badge';

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Semester Planner</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Long-press a course to move it between semesters
          </Text>
        </View>

        {/* Timeline */}
        {state.semesters.map((semester, index) => {
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
                    size={16}
                    color="#FFF"
                  />
                </View>
                <View style={styles.semesterInfo}>
                  <Text style={[styles.semesterLabel, { color: colors.text }]}>
                    {semester.label}
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
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(semester.status) + '18' },
                ]}>
                  <Text style={[styles.statusText, { color: getStatusColor(semester.status) }]}>
                    {semester.status === 'in-progress' ? 'Current' :
                     semester.status === 'completed' ? 'Done' : 'Planned'}
                  </Text>
                </View>
              </View>

              {/* Course list in semester */}
              <View style={styles.courseList}>
                {semester.courses.map((sc) => {
                  const course = getCourse(sc.courseId);
                  if (!course) return null;
                  const tag = getTagById(course.tags[0]);
                  const conflicts = checkPrerequisiteConflicts(semester.id, sc.courseId);
                  const hasConflict = conflicts.length > 0;

                  return (
                    <Pressable
                      key={sc.courseId}
                      onPress={() => router.push({
                        pathname: '/course-detail-modal',
                        params: { courseId: course.id },
                      })}
                      onLongPress={() => {
                        if (semester.status !== 'completed') {
                          setMoveModal({ courseId: sc.courseId, fromSemesterId: semester.id });
                        }
                      }}
                      style={({ pressed }) => [
                        styles.courseItem,
                        {
                          backgroundColor: colors.surface,
                          borderColor: hasConflict ? colors.danger + '50' : colors.glassBorder,
                        },
                        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                      ]}
                    >
                      <View style={[styles.courseStrip, { backgroundColor: tag?.color ?? colors.accent }]} />
                      <View style={styles.courseContent}>
                        <View style={styles.courseRow}>
                          <View style={styles.courseLeft}>
                            <Text style={[styles.courseCode, { color: colors.textSecondary }]}>
                              {course.code}
                            </Text>
                            <Text style={[styles.courseName, { color: colors.text }]} numberOfLines={1}>
                              {course.name}
                            </Text>
                          </View>
                          <View style={styles.courseRight}>
                            {sc.grade && (
                              <View style={[styles.gradePill, { backgroundColor: colors.successSoft }]}>
                                <Text style={[styles.gradeText, { color: colors.success }]}>{sc.grade}</Text>
                              </View>
                            )}
                            {hasConflict && (
                              <Ionicons name="warning" size={16} color={colors.danger} />
                            )}
                            {tag && <TagBadge name={tag.name} color={tag.color} size="sm" />}
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}

                {/* Add course button for non-completed semesters */}
                {semester.status !== 'completed' && (
                  <Pressable
                    style={[styles.addCourseBtn, { borderColor: colors.border }]}
                    onPress={() => router.push({
                      pathname: '/add-course-modal',
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

        <View style={{ height: 100 }} />
      </ScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingTop: Spacing.xxl + Spacing.lg },
  header: { marginBottom: Spacing.xl },
  title: { fontSize: FontSizes.xxl, fontWeight: '800' },
  subtitle: { fontSize: FontSizes.sm, marginTop: Spacing.xs },
  semesterBlock: { marginBottom: Spacing.md, position: 'relative' },
  timelineConnector: {
    position: 'absolute', left: 15, top: -12, width: 2, height: 12,
  },
  semesterHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  timelineDot: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  semesterInfo: { flex: 1 },
  semesterLabel: { fontSize: FontSizes.md, fontWeight: '700' },
  semesterMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: FontSizes.xs, fontWeight: '500' },
  metaDot: { fontSize: FontSizes.xs },
  statusBadge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radii.full,
  },
  statusText: { fontSize: FontSizes.xs, fontWeight: '700' },
  courseList: {
    marginLeft: 15, paddingLeft: Spacing.lg, borderLeftWidth: 2,
    borderLeftColor: 'rgba(128,128,128,0.15)',
  },
  courseItem: {
    flexDirection: 'row', borderRadius: Radii.md, borderWidth: 1,
    overflow: 'hidden', marginBottom: Spacing.xs,
  },
  courseStrip: { width: 4 },
  courseContent: { flex: 1, padding: Spacing.sm + 2 },
  courseRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  courseLeft: { flex: 1, marginRight: Spacing.sm },
  courseCode: { fontSize: FontSizes.xs, fontWeight: '600', letterSpacing: 0.3 },
  courseName: { fontSize: FontSizes.sm, fontWeight: '600', marginTop: 1 },
  courseRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  gradePill: {
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: Radii.sm,
  },
  gradeText: { fontSize: FontSizes.xs, fontWeight: '700' },
  addCourseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.xs, paddingVertical: Spacing.sm,
    borderRadius: Radii.md, borderWidth: 1, borderStyle: 'dashed',
    marginBottom: Spacing.sm,
  },
  addCourseText: { fontSize: FontSizes.sm, fontWeight: '500' },
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
