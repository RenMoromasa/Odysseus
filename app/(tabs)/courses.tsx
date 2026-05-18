import { CourseCard } from '@/components/ui/course-card';
import { SearchBar } from '@/components/ui/search-bar';
import { ScrollFade } from '@/components/ui/scroll-fade';
import { TabEnterAnimation } from '@/components/ui/tab-enter-animation';
import { AppColors, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentPlan } from '@/hooks/use-student-plan';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

/** 'all' means "show every course regardless of semester" */
type SemFilter = string | 'all';

export default function CoursesScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];
  const router = useRouter();
  const { catalog, state, getCourse, getTagById, getAllTags, getCourseGrade } = useStudentPlan();

  // ── state ──────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [activeSem, setActiveSem] = useState<SemFilter>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const semScrollRef = useRef<ScrollView>(null);

  // ── derived: ordered semesters from student plan ───────────────────────────
  const semesters = useMemo(
    () => [...state.semesters].sort((a, b) => a.year - b.year || a.term - b.term),
    [state.semesters]
  );

  // ── courseIds in the active semester ──────────────────────────────────────
  const semesterCourseIds = useMemo<Set<string>>(() => {
    if (activeSem === 'all') return new Set<string>();
    const sem = semesters.find(s => s.id === activeSem);
    return new Set((sem?.courses ?? []).map(sc => sc.courseId));
  }, [activeSem, semesters]);

  // ── base pool: either full catalog or courses in selected semester ─────────
  const baseCourses = useMemo(() => {
    if (activeSem === 'all') return catalog;
    return catalog.filter(c => semesterCourseIds.has(c.id));
  }, [activeSem, catalog, semesterCourseIds]);

  // ── tags available in the current base pool ────────────────────────────────
  const allTags = getAllTags();
  const availableTagIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of baseCourses) {
      for (const t of c.tags) ids.add(t);
    }
    return ids;
  }, [baseCourses]);
  const visibleTags = useMemo(
    () => allTags.filter(t => availableTagIds.has(t.id)),
    [allTags, availableTagIds]
  );

  // ── final filtered list ────────────────────────────────────────────────────
  const filteredCourses = useMemo(() => {
    let courses = baseCourses;
    if (search.trim()) {
      const q = search.toLowerCase();
      courses = courses.filter(
        c =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    if (activeTag) {
      courses = courses.filter(c => c.tags.includes(activeTag));
    }
    return courses;
  }, [baseCourses, search, activeTag]);

  // ── helpers ────────────────────────────────────────────────────────────────
  const termLabel = (term: number) => {
    if (term === 1) return '1st Sem';
    if (term === 2) return '2nd Sem';
    return 'Summer';
  };

  const yearOrdinal = (year: number) => {
    const suffixes = ['', '1st', '2nd', '3rd', '4th'];
    return suffixes[year] ?? `${year}th`;
  };

  // Clear tag filter whenever the semester changes
  const handleSemSelect = (id: SemFilter) => {
    setActiveSem(id);
    setActiveTag(null);
  };

  return (
    <TabEnterAnimation style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* ── Fixed header ─────────────────────────────────────────────────── */}
      <View style={styles.headerWrap}>
        <Text style={[styles.title, { color: colors.text }]}>Course Catalog</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {filteredCourses.length} of {catalog.length} courses
        </Text>

        {/* Search */}
        <View style={styles.searchWrap}>
          <SearchBar value={search} onChangeText={setSearch} />
        </View>

        {/* ── Semester selector row ─── */}
        <ScrollView
          ref={semScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.semRow}
        >
          {/* All chip */}
          <Pressable
            style={[
              styles.semChip,
              {
                backgroundColor: activeSem === 'all' ? colors.accent : colors.surfaceLight,
                borderColor: activeSem === 'all' ? colors.accent : colors.border,
              },
            ]}
            onPress={() => handleSemSelect('all')}
          >
            <Ionicons
              name="layers-outline"
              size={13}
              color={activeSem === 'all' ? '#FFF' : colors.textMuted}
            />
            <Text
              style={[
                styles.semChipText,
                { color: activeSem === 'all' ? '#FFF' : colors.textSecondary },
              ]}
            >
              All
            </Text>
          </Pressable>

          {/* Per-semester chips */}
          {semesters.map(sem => {
            const isActive = activeSem === sem.id;
            return (
              <Pressable
                key={sem.id}
                style={[
                  styles.semChip,
                  {
                    backgroundColor: isActive ? colors.accentSoft : colors.surfaceLight,
                    borderColor: isActive ? colors.accent + '70' : colors.border,
                  },
                ]}
                onPress={() => handleSemSelect(sem.id)}
              >
                {/* Year bubble */}
                <View
                  style={[
                    styles.semYearBubble,
                    { backgroundColor: isActive ? colors.accent : colors.border },
                  ]}
                >
                  <Text style={[styles.semYearBubbleText, { color: isActive ? '#FFF' : colors.textMuted }]}>
                    {sem.year}
                  </Text>
                </View>
                <View style={styles.semChipLabels}>
                  <Text
                    style={[styles.semChipYear, { color: isActive ? colors.accent : colors.textMuted }]}
                  >
                    {yearOrdinal(sem.year)} Year
                  </Text>
                  <Text
                    style={[styles.semChipTerm, { color: isActive ? colors.accentLight : colors.textSecondary }]}
                  >
                    {termLabel(sem.term)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Tag filter chips ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <Pressable
            style={[
              styles.chip,
              {
                backgroundColor: activeTag === null ? colors.accent : colors.surfaceLight,
                borderColor: activeTag === null ? colors.accent : colors.border,
              },
            ]}
            onPress={() => setActiveTag(null)}
          >
            <Text style={[styles.chipText, { color: activeTag === null ? '#FFF' : colors.textSecondary }]}>
              All Tags
            </Text>
          </Pressable>
          {visibleTags.map(tag => (
            <Pressable
              key={tag.id}
              style={[
                styles.chip,
                {
                  backgroundColor: activeTag === tag.id ? tag.color + '28' : colors.surfaceLight,
                  borderColor: activeTag === tag.id ? tag.color + '60' : colors.border,
                },
              ]}
              onPress={() => setActiveTag(activeTag === tag.id ? null : tag.id)}
            >
              <View style={[styles.chipDot, { backgroundColor: tag.color }]} />
              <Text
                style={[
                  styles.chipText,
                  { color: activeTag === tag.id ? tag.color : colors.textSecondary },
                ]}
              >
                {tag.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ── Course list ───────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {/* Active semester banner */}
        {activeSem !== 'all' && (() => {
          const sem = semesters.find(s => s.id === activeSem)!;
          return (
            <View style={[styles.semBanner, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}>
              <Ionicons name="calendar" size={14} color={colors.accent} />
              <Text style={[styles.semBannerText, { color: colors.accent }]}>
                {sem.label} · {sem.courses.length} courses
              </Text>
            </View>
          );
        })()}

        {filteredCourses.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No courses found</Text>
          </View>
        ) : (
          filteredCourses.map(course => {
            const tag = getTagById(course.tags[0]);
            const grade = getCourseGrade(course.id);
            return (
              <CourseCard
                key={course.id}
                course={course}
                tag={tag}
                grade={grade}
                onPress={() =>
                  router.push({
                    pathname: '/(modals)/course-detail-modal',
                    params: { courseId: course.id },
                  })
                }
              />
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Scroll-fade overlay */}
      <ScrollFade color={colors.background} />
    </TabEnterAnimation>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  headerWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  title: { fontSize: FontSizes.xxl, fontWeight: '800' },
  subtitle: { fontSize: FontSizes.sm, marginTop: Spacing.xs, marginBottom: Spacing.md },
  searchWrap: { marginBottom: Spacing.md },

  // Semester selector
  semRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  semChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
  semYearBubble: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  semYearBubbleText: { fontSize: 10, fontWeight: '800' },
  semChipLabels: { flexDirection: 'column' },
  semChipYear: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  semChipTerm: { fontSize: FontSizes.xs, fontWeight: '600' },
  semChipText: { fontSize: FontSizes.sm, fontWeight: '600' },

  // Tag chips
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.full, borderWidth: 1,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: FontSizes.sm, fontWeight: '600' },

  // Course list
  list: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xs },

  // Active semester banner
  semBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.md, borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  semBannerText: { fontSize: FontSizes.xs, fontWeight: '700' },

  // Empty
  empty: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2, gap: Spacing.md,
  },
  emptyText: { fontSize: FontSizes.md, fontWeight: '500' },
});
