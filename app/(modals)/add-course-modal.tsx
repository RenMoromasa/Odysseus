import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentPlan } from '@/hooks/use-student-plan';
import { AppColors, Spacing, FontSizes, Radii } from '@/constants/theme';
import { SearchBar } from '@/components/ui/search-bar';

export default function AddCourseModal() {
  const params = useLocalSearchParams<{ semesterId?: string; courseId?: string }>();
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];
  const router = useRouter();
  const { state, dispatch, catalog, getCourse, getTagById, checkPrerequisiteConflicts } = useStudentPlan();

  const [search, setSearch] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(
    () => new Set(params.courseId ? [params.courseId] : [])
  );
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | undefined>(params.semesterId);

  const toggleCourse = (id: string) => {
    setSelectedCourseIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Courses already in any semester
  const plannedCourseIds = useMemo(() => {
    const set = new Set<string>();
    for (const sem of state.semesters) {
      for (const sc of sem.courses) set.add(sc.courseId);
    }
    return set;
  }, [state.semesters]);

  const availableCourses = useMemo(() => {
    let courses = catalog.filter(c => !plannedCourseIds.has(c.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      courses = courses.filter(c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
      );
    }
    return courses;
  }, [catalog, search, plannedCourseIds]);

  const nonCompletedSemesters = state.semesters.filter(s => s.status !== 'completed');

  const conflicts = useMemo(() => {
    if (!selectedSemesterId || selectedCourseIds.size === 0) return [];
    const set = new Set<string>();
    for (const id of selectedCourseIds) {
      for (const c of checkPrerequisiteConflicts(selectedSemesterId, id)) set.add(c);
    }
    return Array.from(set);
  }, [selectedSemesterId, selectedCourseIds, checkPrerequisiteConflicts]);

  const canAdd = selectedCourseIds.size > 0 && !!selectedSemesterId;

  const handleAdd = () => {
    if (!canAdd || !selectedSemesterId) return;
    for (const courseId of selectedCourseIds) {
      dispatch({
        type: 'ADD_COURSE_TO_SEMESTER',
        semesterId: selectedSemesterId,
        courseId,
      });
    }
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>Add Course</Text>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close-circle" size={32} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Step 1: Select Semester */}
        <View style={styles.section}>
          <Text style={[styles.stepLabel, { color: colors.accent }]}>① Select Semester</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.semRow}>
            {nonCompletedSemesters.map(sem => (
              <Pressable
                key={sem.id}
                style={[
                  styles.semChip,
                  {
                    backgroundColor: selectedSemesterId === sem.id ? colors.accent : colors.surfaceLight,
                    borderColor: selectedSemesterId === sem.id ? colors.accent : colors.border,
                  },
                ]}
                onPress={() => setSelectedSemesterId(sem.id)}
              >
                <Text style={[
                  styles.semChipText,
                  { color: selectedSemesterId === sem.id ? '#FFF' : colors.textSecondary },
                ]}>
                  {sem.shortLabel}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Step 2: Select Course */}
        <View style={styles.section}>
          <Text style={[styles.stepLabel, { color: colors.accent }]}>② Select Course</Text>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search available courses..." />

          <View style={styles.courseList}>
            {availableCourses.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="checkmark-done-circle" size={36} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  All courses are already planned!
                </Text>
              </View>
            ) : (
              availableCourses.map(course => {
                const tag = getTagById(course.tags[0]);
                const isSelected = selectedCourseIds.has(course.id);
                return (
                  <Pressable
                    key={course.id}
                    style={[
                      styles.courseItem,
                      {
                        backgroundColor: isSelected ? colors.accentSoft : colors.surface,
                        borderColor: isSelected ? colors.accent + '50' : colors.glassBorder,
                      },
                    ]}
                    onPress={() => toggleCourse(course.id)}
                  >
                    <View style={[styles.courseStrip, { backgroundColor: tag?.color ?? colors.accent }]} />
                    <View style={styles.courseContent}>
                      <Text style={[styles.courseCode, { color: colors.textSecondary }]}>{course.code}</Text>
                      <Text style={[styles.courseName, { color: colors.text }]} numberOfLines={1}>
                        {course.name}
                      </Text>
                      <Text style={[styles.courseMeta, { color: colors.textMuted }]}>
                        {course.credits} credits
                        {course.prerequisites.length > 0 && ` · ${course.prerequisites.length} prereq`}
                      </Text>
                    </View>
                    <View style={styles.checkboxWrap}>
                      <Ionicons
                        name={isSelected ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={isSelected ? colors.accent : colors.textMuted}
                      />
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>

        {/* Conflict warning */}
        {conflicts.length > 0 && (
          <View style={[styles.conflictBanner, { backgroundColor: colors.warningSoft, borderColor: colors.warning + '30' }]}>
            <Ionicons name="alert-circle" size={20} color={colors.warning} />
            <Text style={[styles.conflictText, { color: colors.warning }]}>
              Prerequisites not met: {conflicts.map(id => getCourse(id)?.code ?? id).join(', ')}
            </Text>
          </View>
        )}

        {/* Add button */}
        <Pressable
          style={[
            styles.addBtn,
            {
              backgroundColor: canAdd ? colors.accent : colors.surfaceLight,
              opacity: canAdd ? 1 : 0.5,
            },
          ]}
          onPress={handleAdd}
          disabled={!canAdd}
        >
          <Ionicons name="add-circle" size={20} color={canAdd ? '#FFF' : colors.textMuted} />
          <Text style={[styles.addBtnText, { color: canAdd ? '#FFF' : colors.textMuted }]}>
            {selectedCourseIds.size > 1
              ? `Add ${selectedCourseIds.size} Courses to Plan`
              : 'Add to Plan'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: { fontSize: FontSizes.xxl, fontWeight: '800' },
  section: { marginBottom: Spacing.lg },
  stepLabel: { fontSize: FontSizes.md, fontWeight: '700', marginBottom: Spacing.sm },
  semRow: { gap: Spacing.sm },
  semChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radii.md, borderWidth: 1,
  },
  semChipText: { fontSize: FontSizes.sm, fontWeight: '600' },
  courseList: { marginTop: Spacing.sm, gap: Spacing.xs },
  empty: {
    alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm,
  },
  emptyText: { fontSize: FontSizes.sm },
  courseItem: {
    flexDirection: 'row', alignItems: 'center', borderRadius: Radii.md,
    borderWidth: 1, overflow: 'hidden',
  },
  courseStrip: { width: 4, alignSelf: 'stretch' },
  checkboxWrap: { paddingRight: Spacing.md, paddingLeft: Spacing.xs },
  courseContent: { flex: 1, padding: Spacing.md },
  courseCode: { fontSize: FontSizes.xs, fontWeight: '600', letterSpacing: 0.3 },
  courseName: { fontSize: FontSizes.md, fontWeight: '600', marginTop: 1 },
  courseMeta: { fontSize: FontSizes.xs, marginTop: 3 },
  conflictBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: Radii.md, borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  conflictText: { fontSize: FontSizes.sm, fontWeight: '600', flex: 1 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.md, borderRadius: Radii.md,
    marginBottom: Spacing.xl,
  },
  addBtnText: { fontSize: FontSizes.md, fontWeight: '700' },
});
