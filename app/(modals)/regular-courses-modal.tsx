import { GlassCard } from "@/components/ui/glass-card";
import { AppColors, FontSizes, Radii, Spacing } from "@/constants/theme";
import { Course } from "@/constants/types";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useStudentPlan } from "@/hooks/use-student-plan";
import { getCurrentSemester } from "@/utils/semester";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function termLabel(term: number) {
  if (term === 1) return "1st Semester";
  if (term === 2) return "2nd Semester";
  return "Summer";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RegularCoursesModal() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const colors = AppColors[colorScheme];
  const { updateProfile } = useAuth();
  const { state: planState, dispatch, catalog } = useStudentPlan();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Populate prospectus on mount ──
  useEffect(() => {
    const hasEmptySemesters = planState.semesters.some((s) => s.courses.length === 0);

    if (planState.semesters.length > 0 && hasEmptySemesters && catalog.length > 0) {
      const currentSem = getCurrentSemester();
      const studentYear = planState.studentInfo.yearLevel;
      const coursesPerSemester = Math.ceil(catalog.length / planState.semesters.length);

      // First pass: add courses to semesters
      for (let i = 0; i < planState.semesters.length; i++) {
        const semester = planState.semesters[i];
        const startIdx = i * coursesPerSemester;
        const endIdx = Math.min(startIdx + coursesPerSemester, catalog.length);
        for (let j = startIdx; j < endIdx; j++) {
          dispatch({ type: "ADD_COURSE_TO_SEMESTER", semesterId: semester.id, courseId: catalog[j].id });
        }
      }

      // Second pass: set statuses and grades
      for (let i = 0; i < planState.semesters.length; i++) {
        const semester = planState.semesters[i];
        if (semester.year !== studentYear) continue;

        const currentTermNum =
          currentSem.term === "summer" ? 3 : currentSem.term === "first" ? 1 : 2;
        const isCurrentSem = semester.term === currentTermNum;
        const isBeforeCurrent = semester.term < currentTermNum;

        if (isCurrentSem) {
          dispatch({ type: "SET_SEMESTER_STATUS", semesterId: semester.id, status: "in-progress" });
        } else if (isBeforeCurrent) {
          dispatch({ type: "SET_SEMESTER_STATUS", semesterId: semester.id, status: "completed" });
          const startIdx = i * coursesPerSemester;
          const endIdx = Math.min(startIdx + coursesPerSemester, catalog.length);
          for (let j = startIdx; j < endIdx; j++) {
            dispatch({ type: "SET_GRADE", semesterId: semester.id, courseId: catalog[j].id, grade: "3.00" });
          }
        }
      }
    }

    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [dispatch, planState.semesters, catalog, planState.studentInfo.yearLevel]);

  // ── Build grouped view: Year → Semester → Courses (sorted by code) ──
  const groupedSemesters = useMemo(() => {
    const courseMap = new Map<string, Course>(catalog.map((c) => [c.id, c]));

    // Collect unique year-term groups in order
    const seen = new Set<string>();
    const groups: {
      year: number;
      term: number;
      label: string;
      courses: Course[];
      status: string;
    }[] = [];

    for (const semester of planState.semesters) {
      const key = `${semester.year}-${semester.term}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Collect courses for this semester across all semester entries with same year+term
      const coursesForGroup: Course[] = [];
      for (const sem of planState.semesters) {
        if (sem.year !== semester.year || sem.term !== semester.term) continue;
        for (const sc of sem.courses) {
          const course = courseMap.get(sc.courseId);
          if (course && !coursesForGroup.find((c) => c.id === course.id)) {
            coursesForGroup.push(course);
          }
        }
      }

      groups.push({
        year: semester.year,
        term: semester.term,
        label: `Year ${semester.year} — ${termLabel(semester.term)}`,
        status: semester.status,
        courses: coursesForGroup.sort((a, b) => a.code.localeCompare(b.code)),
      });
    }

    // Sort by year then term
    return groups.sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.term - b.term
    );
  }, [planState.semesters, catalog]);

  const totalCourseCount = useMemo(() => {
    const ids = new Set<string>();
    groupedSemesters.forEach((g) => g.courses.forEach((c) => ids.add(c.id)));
    return ids.size;
  }, [groupedSemesters]);

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ isOnboarded: true, studentType: "regular" });
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Failed to proceed");
      setIsSaving(false);
    }
  };

  // ── Status pill ──
  const statusConfig = {
    completed: { label: "Completed", color: "#5CDB95", bg: "rgba(92,219,149,0.15)" },
    "in-progress": { label: "In Progress", color: "#FFD166", bg: "rgba(255,209,102,0.15)" },
    planned: { label: "Planned", color: colors.textMuted, bg: colors.surfaceLight },
  } as const;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading your curriculum…
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="book" size={28} color={colors.accent} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Your Curriculum
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We've loaded your full prospectus. Review your courses by year and semester.
          </Text>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="book-outline" size={20} color={colors.accent} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalCourseCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Courses</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.warningSoft }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{groupedSemesters.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Semesters</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.successSoft }]}>
              <Ionicons name="school-outline" size={20} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {Math.max(...groupedSemesters.map((g) => g.year), 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Years</Text>
          </GlassCard>
        </View>

        {/* ── Info Banner ── */}
        <View style={[styles.infoBanner, { backgroundColor: colors.accentSoft, borderColor: colors.accent + "40" }]}>
          <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
          <Text style={[styles.infoText, { color: colors.accent }]}>
            All {totalCourseCount} courses across {groupedSemesters.length} semesters have been added to your plan.
          </Text>
        </View>

        {/* ── Error ── */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: colors.dangerSoft, borderColor: colors.danger + "50" }]}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        )}

        {/* ── Grouped Semester Sections ── */}
        {groupedSemesters.map((group) => {
          const sc = statusConfig[group.status as keyof typeof statusConfig] ?? statusConfig.planned;
          return (
            <View key={`${group.year}-${group.term}`} style={styles.group}>
              {/* Section header */}
              <View style={styles.groupHeader}>
                <View style={[styles.groupDot, { backgroundColor: colors.accent }]} />
                <Text style={[styles.groupTitle, { color: colors.text }]}>{group.label}</Text>
                <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
                </View>
              </View>

              {/* Courses */}
              <GlassCard noPadding>
                {group.courses.length > 0 ? (
                  group.courses.map((course, idx) => {
                    const isLast = idx === group.courses.length - 1;
                    return (
                      <View
                        key={course.id}
                        style={[
                          styles.courseRow,
                          !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                        ]}
                      >
                        <View style={[styles.courseNumBadge, { backgroundColor: colors.accentSoft }]}>
                          <Text style={[styles.courseNumText, { color: colors.accent }]}>
                            {String(idx + 1).padStart(2, "0")}
                          </Text>
                        </View>
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
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyGroup}>
                    <Text style={[styles.emptyGroupText, { color: colors.textMuted }]}>
                      No courses assigned
                    </Text>
                  </View>
                )}
              </GlassCard>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Footer ── */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [
            styles.continueBtn,
            { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleContinue}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.continueBtnText}>Let's Get Started</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </Pressable>
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
  loadingText: {
    marginTop: Spacing.md, textAlign: "center", fontSize: FontSizes.sm,
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
    textAlign: "center", letterSpacing: -0.3,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.sm, textAlign: "center", lineHeight: 20,
  },

  // ── Stats ──
  statsRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: { flex: 1, alignItems: "center", paddingVertical: Spacing.md, gap: 4 },
  statIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  statValue: { fontSize: FontSizes.lg, fontWeight: "800" },
  statLabel: { fontSize: FontSizes.xs, fontWeight: "500", textAlign: "center" },

  // ── Banners ──
  infoBanner: {
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radii.md, borderWidth: 1, marginBottom: Spacing.md,
  },
  infoText: { flex: 1, fontSize: FontSizes.xs, fontWeight: "500", lineHeight: 17 },
  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radii.md, borderWidth: 1, marginBottom: Spacing.md,
  },
  errorText: { flex: 1, fontSize: FontSizes.xs, fontWeight: "500" },

  // ── Groups ──
  group: { marginBottom: Spacing.lg },
  groupHeader: {
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  groupDot: { width: 8, height: 8, borderRadius: 4 },
  groupTitle: { fontSize: FontSizes.md, fontWeight: "700", flex: 1 },
  statusPill: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radii.full,
  },
  statusText: { fontSize: FontSizes.xs, fontWeight: "700" },

  // ── Course rows ──
  courseRow: {
    flexDirection: "row", alignItems: "flex-start",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  courseNumBadge: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  courseNumText: { fontSize: FontSizes.xs, fontWeight: "800" },
  courseInfo: { flex: 1 },
  courseTopRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 2,
  },
  courseCode: { fontSize: FontSizes.sm, fontWeight: "700" },
  courseCredits: { fontSize: FontSizes.xs, fontWeight: "500" },
  courseName: { fontSize: FontSizes.sm, lineHeight: 18, marginBottom: 2 },
  prereqText: { fontSize: FontSizes.xs, lineHeight: 16 },
  emptyGroup: {
    paddingVertical: Spacing.md, alignItems: "center",
  },
  emptyGroupText: { fontSize: FontSizes.sm },

  // ── Footer ──
  footer: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  continueBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: Spacing.sm, paddingVertical: 16, borderRadius: Radii.lg,
  },
  continueBtnText: { fontSize: FontSizes.md, fontWeight: "700", color: "#fff" },
});
