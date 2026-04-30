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

export default function RegularCoursesModal() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const colors = AppColors[colorScheme];
  const { profile, updateProfile } = useAuth();
  const { state: planState } = useStudentPlan();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading completed/in-progress courses
    // For regular students, we can auto-populate from the semester template
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const getCompletedAndInProgressCourses = () => {
    const courses = [];
    for (const semester of planState.semesters) {
      if (
        semester.status === "completed" ||
        semester.status === "in-progress"
      ) {
        for (const course of semester.courses) {
          courses.push(course.courseId);
        }
      }
    }
    return courses;
  };

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      const completedCourses = getCompletedAndInProgressCourses();
      await updateProfile({
        completedCourses,
        isOnboarded: true,
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

  const completedCourses = getCompletedAndInProgressCourses();
  const inProgressCount = planState.semesters
    .filter((s) => s.status === "in-progress")
    .reduce((sum, s) => sum + s.courses.length, 0);
  const completedCount = planState.semesters
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => sum + s.courses.length, 0);

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
            We've loaded your curriculum courses
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
                  name="checkmark-circle"
                  size={24}
                  color={colors.accent}
                />
              </View>
              <View>
                <Text
                  style={[styles.summaryLabel, { color: colors.textSecondary }]}
                >
                  Completed Courses
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {completedCount}
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
                <Ionicons name="school" size={24} color={colors.warning} />
              </View>
              <View>
                <Text
                  style={[styles.summaryLabel, { color: colors.textSecondary }]}
                >
                  Currently Taking
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {inProgressCount}
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
              We've automatically populated your completed and current courses
              based on your program's curriculum.
            </Text>
          </View>
        </View>

        {/* Course Details */}
        {completedCount > 0 && (
          <View style={styles.detailsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Course Summary
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
                {completedCount} course{completedCount !== 1 ? "s" : ""}{" "}
                completed
              </Text>
              <Text
                style={[styles.detailsText, { color: colors.textSecondary }]}
              >
                {inProgressCount} course{inProgressCount !== 1 ? "s" : ""} in
                progress
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
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    lineHeight: 20,
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
