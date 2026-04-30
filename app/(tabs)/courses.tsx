import { CourseCard } from '@/components/ui/course-card';
import { SearchBar } from '@/components/ui/search-bar';
import { AppColors, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentPlan } from '@/hooks/use-student-plan';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function CoursesScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];
  const router = useRouter();
  const { catalog, getCourse, getTagById, getAllTags, getCourseGrade } = useStudentPlan();

  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = getAllTags();

  const filteredCourses = useMemo(() => {
    let courses = catalog;
    if (search.trim()) {
      const q = search.toLowerCase();
      courses = courses.filter(c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    if (activeTag) {
      courses = courses.filter(c => c.tags.includes(activeTag));
    }
    return courses;
  }, [catalog, search, activeTag]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={styles.headerWrap}>
        <Text style={[styles.title, { color: colors.text }]}>Course Catalog</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {catalog.length} courses available
        </Text>

        <View style={styles.searchWrap}>
          <SearchBar value={search} onChangeText={setSearch} />
        </View>

        {/* Tag filter chips */}
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
            <Text style={[
              styles.chipText,
              { color: activeTag === null ? '#FFF' : colors.textSecondary },
            ]}>
              All
            </Text>
          </Pressable>
          {allTags.map(tag => (
            <Pressable
              key={tag.id}
              style={[
                styles.chip,
                {
                  backgroundColor: activeTag === tag.id ? tag.color + '30' : colors.surfaceLight,
                  borderColor: activeTag === tag.id ? tag.color + '50' : colors.border,
                },
              ]}
              onPress={() => setActiveTag(activeTag === tag.id ? null : tag.id)}
            >
              <View style={[styles.chipDot, { backgroundColor: tag.color }]} />
              <Text style={[
                styles.chipText,
                { color: activeTag === tag.id ? tag.color : colors.textSecondary },
              ]}>
                {tag.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filteredCourses.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No courses found
            </Text>
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
                onPress={() => router.push({
                  pathname: '/(modals)/course-detail-modal',
                  params: { courseId: course.id },
                })}
              />
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: FontSizes.xxl, fontWeight: '800' },
  subtitle: { fontSize: FontSizes.sm, marginTop: Spacing.xs, marginBottom: Spacing.md },
  searchWrap: { marginBottom: Spacing.md },
  chipRow: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.full, borderWidth: 1,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: FontSizes.sm, fontWeight: '600' },
  list: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  empty: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2, gap: Spacing.md,
  },
  emptyText: { fontSize: FontSizes.md, fontWeight: '500' },
});
