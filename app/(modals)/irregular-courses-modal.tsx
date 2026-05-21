import { GlassCard } from "@/components/ui/glass-card";
import { AppColors, FontSizes, Radii, Spacing } from "@/constants/theme";
import { Course } from "@/constants/types";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useStudentPlan } from "@/hooks/use-student-plan";
import { fetchCourseCatalog } from "@/services/catalog";
import { getCurrentSemester, isSemesterMatching } from "@/utils/semester";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GroupedSemester {
  year: number;
  term: number;
  label: string;
  courses: Course[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function termLabel(term: number) {
  if (term === 1) return "1st Semester";
  if (term === 2) return "2nd Semester";
  return "Summer";
}

function termOrder(term: number) {
  // sort: 1 → 2 → 3 (summer)
  return term;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function IrregularCoursesModal() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const colors = AppColors[colorScheme];
  const { updateProfile } = useAuth();
  const { catalog, dispatch, state: planState } = useStudentPlan();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load courses ──
  useEffect(() => {
    if (catalog.length > 0) {
      setAvailableCourses(catalog);
      setIsLoading(false);
    } else {
      fetchCourseCatalog("BS Computer Science")
        .then((courses) => setAvailableCourses(courses))
        .catch(() => setError("Failed to load courses"))
        .finally(() => setIsLoading(false));
    }
  }, [catalog]);

  // ── Build year/semester groups sorted by year → term → course code ──
  const groupedSemesters = useMemo<GroupedSemester[]>(() => {
    const courseMap = new Map(availableCourses.map((c) => [c.id, c]));
    const query = searchQuery.toLowerCase();

    // Build group map keyed by "year-term"
    const groupMap = new Map<string, GroupedSemester>();

    for (const semester of planState.semesters) {
      const key = `${semester.year}-${semester.term}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          year: semester.year,
          term: semester.term,
          label: `Year ${semester.year} — ${termLabel(semester.term)}`,
          courses: [],
        });
      }
    }

    // Assign courses from catalog to their semester groups
    // Use catalog ordering (which is already by semester assignment)
    for (const semester of planState.semesters) {
      const key = `${semester.year}-${semester.term}`;
      const group = groupMap.get(key);
      if (!group) continue;

      for (const sc of semester.courses) {
        const course = courseMap.get(sc.courseId);
        if (!course) continue;
        if (!group.courses.find((c) => c.id === course.id)) {
          group.courses.push(course);
        }
      }
    }

    // If no semester structure, fall back to flat catalog
    if (planState.semesters.length === 0) {
      const fallback: GroupedSemester = {
        year: 1,
        term: 1,
        label: "All Courses",
        courses: [...availableCourses],
      };
      if (query) {
        fallback.courses = fallback.courses.filter(
          (c) =>
            c.code.toLowerCase().includes(query) ||
            c.name.toLowerCase().includes(query)
        );
      }
      return fallback.courses.length > 0 ? [fallback] : [];
    }

    // Filter by search, sort courses by code within each group
    const result = Array.from(groupMap.values())
      .map((group) => ({
        ...group,
        courses: group.courses
          .filter(
            (c) =>
              !query ||
              c.code.toLowerCase().includes(query) ||
              c.name.toLowerCase().includes(query)
          )
          .sort((a, b) => a.code.localeCompare(b.code)),
      }))
      .filter((g) => g.courses.length > 0)
      .sort((a, b) =>
        a.year !== b.year ? a.year - b.year : termOrder(a.term) - termOrder(b.term)
      );

    return result;
  }, [availableCourses, planState.semesters, searchQuery]);

  // ── Prerequisite resolution ──
  const getAllPrerequisites = (courseIds: string[]): string[] => {
    const prereqSet = new Set<string>();
    const courseMap = new Map(availableCourses.map((c) => [c.id, c]));
    const findPrereqs = (ids: string[]) => {
      for (const id of ids) {
        const course = courseMap.get(id);
        if (course && course.prerequisites.length > 0) {
          for (const prereqId of course.prerequisites) {
            if (!prereqSet.has(prereqId)) {
              prereqSet.add(prereqId);
              findPrereqs([prereqId]);
            }
          }
        }
      }
    };
    findPrereqs(courseIds);
    return Array.from(prereqSet);
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSkip = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ isOnboarded: true, studentType: "irregular" });
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Failed to proceed");
      setIsSaving(false);
    }
  };

  const handleContinue = async () => {
    if (selectedCourses.length === 0) {
      setError("Please select at least one course");
      return;
    }
    setIsSaving(true);
    try {
      const allPrerequisites = getAllPrerequisites(selectedCourses);
      const finalCourses = [...new Set([...selectedCourses, ...allPrerequisites])]; // dedupe
      const currentSem = getCurrentSemester();

      if (planState.semesters.length > 0) {
        const currentSemIndex = planState.semesters.findIndex((s) =>
          isSemesterMatching(s.term, currentSem.term)
        );
        const targetSemIndex = currentSemIndex >= 0 ? currentSemIndex : 0;
        const targetSem = planState.semesters[targetSemIndex];

        // Clear the target semester first to avoid build-up from repeat visits
        dispatch({ type: "CLEAR_SEMESTER_COURSES", semesterId: targetSem.id });

        for (const courseId of finalCourses) {
          dispatch({ type: "ADD_COURSE_TO_SEMESTER", semesterId: targetSem.id, courseId });
          dispatch({ type: "SET_GRADE", semesterId: targetSem.id, courseId, grade: "3.00" });
        }
      }

      await updateProfile({ isOnboarded: true, studentType: "irregular" });
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Failed to save courses");
      setIsSaving(false);
    }
  };

  // ── Derived counts ──
  const selectedCount = selectedCourses.length;
  const prerequisiteCount = getAllPrerequisites(selectedCourses).length;
  const totalCount = selectedCount + prerequisiteCount;

  // ── Loading state ──
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="school" size={28} color={colors.accent} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            What courses have you completed?
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select the courses you've already taken — we'll auto-add their prerequisites.
          </Text>
        </View>

        {/* ── Info Banner ── */}
        <View style={[styles.infoBanner, { backgroundColor: colors.accentSoft, borderColor: colors.accent + "40" }]}>
          <Ionicons name="information-circle" size={16} color={colors.accent} />
          <Text style={[styles.infoText, { color: colors.accent }]}>
            Selected courses will be marked in-progress with a default grade (3.00).
          </Text>
        </View>

        {/* ── Error Banner ── */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: colors.dangerSoft, borderColor: colors.danger + "50" }]}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        )}

        {/* ── Search Bar ── */}
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by code or name…"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {/* ── Grouped Course List ── */}
        {groupedSemesters.length > 0 ? (
          groupedSemesters.map((group) => (
            <View key={`${group.year}-${group.term}`} style={styles.group}>
              {/* Section header */}
              <View style={styles.groupHeader}>
                <View style={[styles.groupDot, { backgroundColor: colors.accent }]} />
                <Text style={[styles.groupTitle, { color: colors.text }]}>{group.label}</Text>
                <View style={[styles.groupCount, { backgroundColor: colors.surfaceLight }]}>
                  <Text style={[styles.groupCountText, { color: colors.textMuted }]}>
                    {group.courses.length}
                  </Text>
                </View>
              </View>

              {/* Course cards */}
              <GlassCard noPadding>
                {group.courses.map((course, idx) => {
                  const isSelected = selectedCourses.includes(course.id);
                  const isLast = idx === group.courses.length - 1;
                  return (
                    <Pressable
                      key={course.id}
                      onPress={() => handleSelectCourse(course.id)}
                      style={({ pressed }) => [
                        styles.courseRow,
                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                        isSelected && { backgroundColor: colors.accentSoft },
                        pressed && { opacity: 0.75 },
                      ]}
                    >
                      {/* Checkbox */}
                      <View style={[
                        styles.checkbox,
                        {
                          borderColor: isSelected ? colors.accent : colors.border,
                          backgroundColor: isSelected ? colors.accent : "transparent",
                        },
                      ]}>
                        {isSelected && <Ionicons name="checkmark" size={13} color="#fff" />}
                      </View>

                      {/* Info */}
                      <View style={styles.courseInfo}>
                        <View style={styles.courseTopRow}>
                          <Text style={[styles.courseCode, { color: colors.accent }]}>
                            {course.code}
                          </Text>
                          <Text style={[styles.courseCredits, { color: colors.textMuted }]}>
                            {course.credits} unit{course.credits !== 1 ? "s" : ""}
                          </Text>
                        </View>
                        <Text style={[styles.courseName, { color: colors.text }]} numberOfLines={2}>
                          {course.name}
                        </Text>
                        {course.prerequisites.length > 0 && (
                          <Text style={[styles.prereqText, { color: colors.textMuted }]} numberOfLines={1}>
                            Prereq: {course.prerequisites.join(", ")}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </GlassCard>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No courses found</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Sticky Footer ── */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {selectedCount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              {selectedCount} selected
            </Text>
            {prerequisiteCount > 0 && (
              <Text style={[styles.prereqBadge, { color: colors.accent }]}>
                + {prerequisiteCount} prereq{prerequisiteCount !== 1 ? "s" : ""} auto-added
              </Text>
            )}
          </View>
        )}
        <View style={styles.footerButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.skipBtn,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleSkip}
            disabled={isSaving}
          >
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.continueBtn,
              {
                backgroundColor: colors.accent,
                opacity: pressed || selectedCourses.length === 0 ? 0.6 : 1,
              },
            ]}
            onPress={handleContinue}
            disabled={isSaving || selectedCourses.length === 0}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.continueBtnText}>
                Continue{totalCount > 0 ? ` (${totalCount})` : ""}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  // ── Header ──
  header: { alignItems: "center", marginBottom: Spacing.lg, paddingTop: Spacing.lg + Spacing.xl + Spacing.md },
  iconBadge: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: "center", justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xl, fontWeight: "800",
    textAlign: "center", marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSizes.sm, textAlign: "center", lineHeight: 20,
  },

  // ── Banners ──
  infoBanner: {
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radii.md, borderWidth: 1,
    marginBottom: Spacing.md,
  },
  infoText: { flex: 1, fontSize: FontSizes.xs, fontWeight: "500", lineHeight: 17 },
  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radii.md, borderWidth: 1,
    marginBottom: Spacing.md,
  },
  errorText: { flex: 1, fontSize: FontSizes.xs, fontWeight: "500" },

  // ── Search ──
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
    paddingHorizontal: Spacing.md, borderRadius: Radii.lg, borderWidth: 1.5,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1, paddingVertical: 12, fontSize: FontSizes.md,
  },

  // ── Groups ──
  group: { marginBottom: Spacing.lg },
  groupHeader: {
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  groupDot: { width: 8, height: 8, borderRadius: 4 },
  groupTitle: { fontSize: FontSizes.md, fontWeight: "700", flex: 1 },
  groupCount: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radii.full,
  },
  groupCountText: { fontSize: FontSizes.xs, fontWeight: "600" },

  // ── Course rows ──
  courseRow: {
    flexDirection: "row", alignItems: "flex-start",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
    marginTop: 1, flexShrink: 0,
  },
  courseInfo: { flex: 1 },
  courseTopRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 2,
  },
  courseCode: { fontSize: FontSizes.sm, fontWeight: "700" },
  courseCredits: { fontSize: FontSizes.xs, fontWeight: "500" },
  courseName: { fontSize: FontSizes.sm, lineHeight: 18, marginBottom: 2 },
  prereqText: { fontSize: FontSizes.xs, lineHeight: 16 },

  // ── Empty ──
  emptyState: {
    alignItems: "center", paddingVertical: Spacing.xxl, gap: Spacing.md,
  },
  emptyText: { fontSize: FontSizes.md, fontWeight: "500" },

  // ── Footer ──
  footer: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth, gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  summaryText: { fontSize: FontSizes.sm, fontWeight: "500" },
  prereqBadge: { fontSize: FontSizes.sm, fontWeight: "700" },
  footerButtons: { flexDirection: "row", gap: Spacing.md },
  skipBtn: {
    flex: 1, paddingVertical: 14, borderRadius: Radii.lg,
    alignItems: "center", borderWidth: 1.5,
  },
  skipText: { fontSize: FontSizes.md, fontWeight: "600" },
  continueBtn: {
    flex: 2, paddingVertical: 14, borderRadius: Radii.lg,
    alignItems: "center", justifyContent: "center",
  },
  continueBtnText: { fontSize: FontSizes.md, fontWeight: "700", color: "#fff" },
});
