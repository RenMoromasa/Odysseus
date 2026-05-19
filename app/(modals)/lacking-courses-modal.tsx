import { CourseCard } from '@/components/ui/course-card';
import { ScrollFade } from '@/components/ui/scroll-fade';
import { SearchBar } from '@/components/ui/search-bar';
import { AppColors, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentPlan } from '@/hooks/use-student-plan';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type FilterMode = 'all' | 'ready' | 'blocked';

export default function LackingCoursesModal() {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];
  const router = useRouter();
  const { catalog, state, getCourse, getTagById, getCourseGrade } = useStudentPlan();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');

  // ── passed IDs ────────────────────────────────────────────────────────────
  const passedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const sem of state.semesters) {
      for (const sc of sem.courses) {
        if (sc.grade && sc.grade !== '5.00') ids.add(sc.courseId);
      }
    }
    return ids;
  }, [state.semesters]);

  // ── split into ready / blocked ────────────────────────────────────────────
  const { readyCourses, blockedCourses } = useMemo(() => {
    const ready: typeof catalog = [];
    const blocked: typeof catalog = [];
    for (const course of catalog) {
      if (passedIds.has(course.id)) continue;
      const allPrereqsMet = course.prerequisites.every(id => passedIds.has(id));
      if (allPrereqsMet) ready.push(course);
      else blocked.push(course);
    }
    return { readyCourses: ready, blockedCourses: blocked };
  }, [catalog, passedIds]);

  const totalLacking = readyCourses.length + blockedCourses.length;

  // ── apply search + filter ─────────────────────────────────────────────────
  const applySearch = (list: typeof catalog) => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  };

  const filteredReady   = filter === 'blocked' ? [] : applySearch(readyCourses);
  const filteredBlocked = filter === 'ready'   ? [] : applySearch(blockedCourses);
  const hasResults = filteredReady.length > 0 || filteredBlocked.length > 0;

  // ── filter chip options ───────────────────────────────────────────────────
  const filterOptions: { key: FilterMode; label: string; count: number }[] = [
    { key: 'all',     label: 'All',     count: totalLacking },
    { key: 'ready',   label: 'Ready',   count: readyCourses.length },
    { key: 'blocked', label: 'Blocked', count: blockedCourses.length },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* ── Fixed header ──────────────────────────────────────────────────── */}
      <View style={[styles.headerWrap, { borderBottomColor: colors.border }]}>
        {/* Title row with inline close button — matches course-detail-modal */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>Lacking Subjects</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {totalLacking} course{totalLacking !== 1 ? 's' : ''} left to graduate
            </Text>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close-circle" size={28} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Stats row */}
        <View style={[styles.statsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: colors.accent }]} />
            <Text style={[styles.statValue, { color: colors.text }]}>{readyCourses.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Ready</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: colors.warning }]} />
            <Text style={[styles.statValue, { color: colors.text }]}>{blockedCourses.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Blocked</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.statValue, { color: colors.text }]}>{passedIds.size}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Passed</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <SearchBar value={search} onChangeText={setSearch} />
        </View>

        {/* Filter chips */}
        <View style={styles.chipRow}>
          {filterOptions.map(opt => {
            const isActive = filter === opt.key;
            const accentColor =
              opt.key === 'ready' ? colors.accent :
              opt.key === 'blocked' ? colors.warning :
              colors.textSecondary;
            return (
              <Pressable
                key={opt.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive
                      ? opt.key === 'ready'   ? colors.accentSoft
                      : opt.key === 'blocked' ? colors.warningSoft
                      : colors.surfaceLight
                      : colors.surfaceLight,
                    borderColor: isActive
                      ? opt.key === 'ready'   ? colors.accent + '60'
                      : opt.key === 'blocked' ? colors.warning + '60'
                      : colors.border
                      : colors.border,
                  },
                ]}
                onPress={() => setFilter(opt.key)}
              >
                {opt.key !== 'all' && (
                  <View style={[styles.chipDot, { backgroundColor: accentColor }]} />
                )}
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isActive
                        ? opt.key === 'ready'   ? colors.accent
                        : opt.key === 'blocked' ? colors.warning
                        : colors.text
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
                <View
                  style={[
                    styles.chipBadge,
                    {
                      backgroundColor: isActive
                        ? opt.key === 'ready'   ? colors.accent + '30'
                        : opt.key === 'blocked' ? colors.warning + '30'
                        : colors.border
                        : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipBadgeText,
                      {
                        color: isActive
                          ? opt.key === 'ready'   ? colors.accent
                          : opt.key === 'blocked' ? colors.warning
                          : colors.textMuted
                          : colors.textMuted,
                      },
                    ]}
                  >
                    {opt.count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Scrollable course list ─────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {!hasResults ? (
          <View style={styles.empty}>
            <Ionicons
              name={search ? 'search-outline' : 'checkmark-circle-outline'}
              size={52}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {search ? 'No courses found' : 'All caught up!'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {search
                ? 'Try a different search term.'
                : "You've completed every course in your prospectus."}
            </Text>
          </View>
        ) : (
          <>
            {/* Ready section */}
            {filteredReady.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionDot, { backgroundColor: colors.accent }]} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Ready to Take</Text>
                  <View style={[styles.sectionBadge, { backgroundColor: colors.accentSoft }]}>
                    <Text style={[styles.sectionBadgeText, { color: colors.accent }]}>
                      {filteredReady.length}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                  Prerequisites satisfied — enrol when available
                </Text>
                {filteredReady.map(course => {
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
                })}
              </>
            )}

            {/* Divider */}
            {filteredReady.length > 0 && filteredBlocked.length > 0 && (
              <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
            )}

            {/* Blocked section */}
            {filteredBlocked.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionDot, { backgroundColor: colors.warning }]} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Blocked</Text>
                  <View style={[styles.sectionBadge, { backgroundColor: colors.warningSoft }]}>
                    <Text style={[styles.sectionBadgeText, { color: colors.warning }]}>
                      {filteredBlocked.length}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                  Prerequisites not yet passed
                </Text>
                {filteredBlocked.map(course => {
                  const tag = getTagById(course.tags[0]);
                  const grade = getCourseGrade(course.id);
                  const missingPrereqs = course.prerequisites.filter(
                    id => !passedIds.has(id)
                  );
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      tag={tag}
                      grade={grade}
                      showPrereqWarning={missingPrereqs.length > 0}
                      onPress={() =>
                        router.push({
                          pathname: '/(modals)/course-detail-modal',
                          params: { courseId: course.id },
                        })
                      }
                    />
                  );
                })}
              </>
            )}
          </>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Scroll-fade at top */}
      <ScrollFade color={colors.background} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Fixed header ──────────────────────────────────────────────────────────
  headerWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + Spacing.lg,
    paddingBottom: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  // Title row — close button is inline on the right
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: { fontSize: FontSizes.xxl, fontWeight: '800' },
  subtitle: { fontSize: FontSizes.sm, marginTop: Spacing.xs },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statValue: { fontSize: FontSizes.xl, fontWeight: '800' },
  statLabel: { fontSize: FontSizes.xs, fontWeight: '500' },
  statDivider: { width: 1, alignSelf: 'stretch', marginVertical: 4 },

  // Search
  searchWrap: { marginBottom: Spacing.md },

  // Filter chips
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: FontSizes.sm, fontWeight: '600' },
  chipBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radii.full,
    minWidth: 20,
    alignItems: 'center',
  },
  chipBadgeText: { fontSize: 10, fontWeight: '700' },

  // ── List ──────────────────────────────────────────────────────────────────
  list: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  sectionDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', flex: 1 },
  sectionBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  sectionBadgeText: { fontSize: FontSizes.xs, fontWeight: '700' },
  sectionSubtitle: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  sectionDivider: { height: 1, marginVertical: Spacing.lg },

  // Empty state
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: '700' },
  emptySubtitle: { fontSize: FontSizes.sm, fontWeight: '500', textAlign: 'center' },
});
