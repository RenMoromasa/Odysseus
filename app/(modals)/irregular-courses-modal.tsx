import { AppColors, FontSizes, Radii, Spacing } from "@/constants/theme";
import { Course } from "@/constants/types";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useStudentPlan } from "@/hooks/use-student-plan";
import { fetchCourseCatalog } from "@/services/catalog";
import { getCurrentSemester, isSemesterMatching } from "@/utils/semester";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function IrregularCoursesModal() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const colors = AppColors[colorScheme];
  const { updateProfile } = useAuth();
  const { catalog, dispatch, state: planState } = useStudentPlan();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load courses from catalog
  useEffect(() => {
    if (catalog.length > 0) {
      setAvailableCourses(catalog);
      setFilteredCourses(catalog);
      setIsLoading(false);
    } else {
      fetchCourseCatalog("BS Computer Science")
        .then((courses) => {
          setAvailableCourses(courses);
          setFilteredCourses(courses);
        })
        .catch(() => {
          setError("Failed to load courses");
        })
        .finally(() => setIsLoading(false));
    }
  }, [catalog]);

  // Filter courses based on search
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = availableCourses.filter(
      (course) =>
        course.code.toLowerCase().includes(query) ||
        course.name.toLowerCase().includes(query)
    );
    setFilteredCourses(filtered);
  }, [searchQuery, availableCourses]);

  // Get all transitive prerequisites for selected courses
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
      await updateProfile({
        isOnboarded: true,
        studentType: "irregular",
      });
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
      const finalCourses = [...selectedCourses, ...allPrerequisites];
      const currentSem = getCurrentSemester();

      // Add selected courses + prerequisites to semesters with grades (3.00)
      if (planState.semesters.length > 0) {
        // Find or use first semester for current courses
        const currentSemIndex = planState.semesters.findIndex(s =>
          isSemesterMatching(s.term, currentSem.term)
        );
        const targetSemIndex = currentSemIndex >= 0 ? currentSemIndex : 0;
        const targetSem = planState.semesters[targetSemIndex];

        // Add courses to current semester with grade 3.00
        for (const courseId of finalCourses) {
          dispatch({
            type: 'ADD_COURSE_TO_SEMESTER',
            semesterId: targetSem.id,
            courseId,
          });
          dispatch({
            type: 'SET_GRADE',
            semesterId: targetSem.id,
            courseId,
            grade: '3.00',
          });
        }
      }

      await updateProfile({
        isOnboarded: true,
        studentType: "irregular",
      });
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Failed to save courses");
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

  const selectedCount = selectedCourses.length;
  const prerequisiteCount = getAllPrerequisites(selectedCourses).length;
  const totalCount = selectedCount + prerequisiteCount;

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
            What courses have you completed?
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select the courses you've already taken - we'll auto-add prerequisites
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
            Selected courses will be marked as currently in-progress with an auto-populated grade (3.00).
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.surfaceLight,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search courses by code or name..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          )}
        </View>

        {/* Course List */}
        <View style={styles.coursesList}>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Pressable
                key={course.id}
                onPress={() => handleSelectCourse(course.id)}
                style={({ pressed }) => [
                  styles.courseCard,
                  {
                    backgroundColor: colors.surfaceLight,
                    borderColor: selectedCourses.includes(course.id)
                      ? colors.accent
                      : colors.border,
                    borderWidth: selectedCourses.includes(course.id) ? 2 : 1,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View style={styles.courseContent}>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: selectedCourses.includes(course.id)
                          ? colors.accent
                          : colors.border,
                        backgroundColor: selectedCourses.includes(course.id)
                          ? colors.accent
                          : "transparent",
                      },
                    ]}
                  >
                    {selectedCourses.includes(course.id) && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={colors.surface}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.courseCode, { color: colors.accent }]}>
                      {course.code}
                    </Text>
                    <Text
                      style={[styles.courseName, { color: colors.text }]}
                      numberOfLines={2}
                    >
                      {course.name}
                    </Text>
                    {course.prerequisites.length > 0 && (
                      <Text style={[styles.prereqText, { color: colors.textMuted }]}>
                        Prereqs: {course.prerequisites.join(", ")}
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No courses found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        {selectedCount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.selectedCount, { color: colors.textSecondary }]}>
              {selectedCount} course{selectedCount !== 1 ? "s" : ""} selected
            </Text>
            {prerequisiteCount > 0 && (
              <Text style={[styles.prereqCount, { color: colors.accent }]}>
                + {prerequisiteCount} prereq{prerequisiteCount !== 1 ? "s" : ""} auto-tagged
              </Text>
            )}
          </View>
        )}
        <View style={styles.buttonsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.skipButton,
              {
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={handleSkip}
            disabled={isSaving}
          >
            <Text style={[styles.skipText, { color: colors.text }]}>Skip</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              {
                backgroundColor: colors.accent,
                opacity: pressed || !selectedCourses.length ? 0.6 : 1,
              },
            ]}
            onPress={handleContinue}
            disabled={isSaving || selectedCourses.length === 0}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <Text style={[styles.continueText, { color: colors.surface }]}>
                Continue {totalCount > 0 ? `(${totalCount})` : ""}
              </Text>
            )}
          </Pressable>
        </View>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
  },
  coursesList: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  courseCard: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
  courseContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  courseCode: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  courseName: {
    fontSize: FontSizes.sm,
    lineHeight: 18,
  },
  prereqText: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSizes.md,
    marginTop: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedCount: {
    fontSize: FontSizes.sm,
    fontWeight: "500",
  },
  prereqCount: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  skipButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    minHeight: 48,
  },
  skipText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
  },
  continueButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  continueText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
  },
});
