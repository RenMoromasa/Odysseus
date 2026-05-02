import { AppColors, FontSizes, Radii, Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useStudentPlan } from "@/hooks/use-student-plan";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getCurrentSemester, isSemesterMatching } from "@/utils/semester";

export default function RegularCoursesModal() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const colors = AppColors[colorScheme];
  const { profile, updateProfile } = useAuth();
  const { state: planState, dispatch, catalog } = useStudentPlan();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
    // For regular students, populate prospectus courses and set proper semester statuses
    const hasEmptySemesters = planState.semesters.some(s => s.courses.length === 0);

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
          dispatch({
            type: 'ADD_COURSE_TO_SEMESTER',
            semesterId: semester.id,
            courseId: catalog[j].id,
          });
        }
      }

      // Second pass: set semester statuses and grades
      for (let i = 0; i < planState.semesters.length; i++) {
        const semester = planState.semesters[i];
        const isSameYear = semester.year === studentYear;

        // Only process semesters in the student's current year
        if (isSameYear) {
          const currentTermNum = currentSem.term === 'summer' ? 3 : currentSem.term === 'first' ? 1 : 2;
          const isCurrentSem = semester.term === currentTermNum;
          const isBeforeCurrent = semester.term < currentTermNum;

          if (isCurrentSem) {
            // Mark current semester as in-progress
            dispatch({
              type: 'SET_SEMESTER_STATUS',
              semesterId: semester.id,
              status: 'in-progress',
            });
          } else if (isBeforeCurrent) {
            // Mark previous semesters as completed and grade courses
            dispatch({
              type: 'SET_SEMESTER_STATUS',
              semesterId: semester.id,
              status: 'completed',
            });

            const startIdx = i * coursesPerSemester;
            const endIdx = Math.min(startIdx + coursesPerSemester, catalog.length);

            for (let j = startIdx; j < endIdx; j++) {
              dispatch({
                type: 'SET_GRADE',
                semesterId: semester.id,
                courseId: catalog[j].id,
                grade: '3.00',
              });
            }
          }
          // Future semesters (isAfterCurrent) remain as 'planned'
        }
      }
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, planState.semesters, catalog, planState.studentInfo.yearLevel]);

  // Get all courses from the prospectus (full curriculum)
  const getAllProspectusCourses = () => {
    const allCourseIds: string[] = [];
    for (const semester of planState.semesters) {
      for (const course of semester.courses) {
        if (!allCourseIds.includes(course.courseId)) {
          allCourseIds.push(course.courseId);
        }
      }
    }
return allCourseIds;
  };

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        isOnboarded: true,
        studentType: "regular",
      });
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Failed to proceed");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // For regular students, all courses in the prospectus are loaded
  const allProspectusCourseIds = getAllProspectusCourses();
  const totalCourseCount = allProspectusCourseIds.length;
  const semesterCount = planState.semesters.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Setting up your courses
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We've loaded your full curriculum prospectus
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: colors.dangerSoft,
                borderColor: colors.danger,
              },
            ]}
          >
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Info Banner */}
        <View
          style={[
            styles.infoBanner,
            {
              backgroundColor: colors.accentSoft,
              borderColor: colors.accent,
            },
          ]}
        >
          <Ionicons name="information-circle" size={18} color={colors.accent} />
          <Text style={[styles.infoText, { color: colors.accent }]}>
            Your complete curriculum has been automatically loaded based on your program. You're ready to start tracking your progress!
          </Text>
        </View>

        {/* Course Summary */}
        <View style={styles.summaryContainer}>
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.surfaceLight,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.summaryItem}>
              <View
                style={[
                  styles.summaryIcon,
                  { backgroundColor: colors.accentSoft },
                ]}
              >
                <Ionicons
                  name="book"
                  size={24}
                  color={colors.accent}
                />
              </View>
              <View>
                <Text
                  style={[styles.summaryLabel, { color: colors.textSecondary }]}
                >
                  Total Courses
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {totalCourseCount}
                </Text>
              </View>
            </View>

            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />

            <View style={styles.summaryItem}>
              <View
                style={[
                  styles.summaryIcon,
                  { backgroundColor: colors.warningSoft },
                ]}
              >
                <Ionicons name="calendar" size={24} color={colors.warning} />
              </View>
              <View>
                <Text
                  style={[styles.summaryLabel, { color: colors.textSecondary }]}
                >
                  Total Semesters
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {semesterCount}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.accent}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              We've automatically populated your complete course prospectus
              based on your program's curriculum. All {totalCourseCount} courses
              across {semesterCount} semesters have been added to your plan.
            </Text>
          </View>
        </View>

        {/* Course Details */}
        {totalCourseCount > 0 && (
          <View style={styles.detailsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Curriculum
            </Text>
            <View
              style={[
                styles.detailsBox,
                {
                  backgroundColor: colors.surfaceLight,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[styles.detailsText, { color: colors.textSecondary }]}
              >
                {totalCourseCount} courses in your prospectus
              </Text>
              <Text
                style={[styles.detailsText, { color: colors.textSecondary }]}
              >
                {semesterCount} semesters to complete
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            {
              backgroundColor: colors.accent,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={handleContinue}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.surface} size="small" />
          ) : (
            <>
              <Text style={[styles.continueText, { color: colors.surface }]}>
                Let's Get Started
              </Text>
              <Ionicons name="arrow-forward" size={18} color={colors.surface} />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  header: {
    paddingVertical: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    lineHeight: 24,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: "500",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: "500",
  },
  summaryContainer: {
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  infoSection: {
    marginBottom: Spacing.lg,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  detailsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  detailsBox: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  detailsText: {
    fontSize: FontSizes.sm,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  continueButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  continueText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
  },
});
