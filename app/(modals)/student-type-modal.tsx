import { AppColors, FontSizes, Radii, Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type StudentType = "regular" | "irregular" | null;

export default function StudentTypeModal() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const colors = AppColors[colorScheme];
  const { updateProfile } = useAuth();

  const [selectedType, setSelectedType] = useState<StudentType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!selectedType) {
      setError("Please select a student type");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await updateProfile({ studentType: selectedType });

      if (selectedType === "regular") {
        // Regular student: navigate to auto-populate courses
        router.push("/(modals)/regular-courses-modal");
      } else {
        // Irregular student: navigate to manual course input
        router.push("/(modals)/irregular-courses-modal");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      setIsLoading(false);
    }
  };

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
            Tell us about yourself
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Are you a regular or irregular student?
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

        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* Regular Student Option */}
          <Pressable
            onPress={() => {
              setSelectedType("regular");
              setError(null);
            }}
            style={({ pressed }) => [
              styles.optionCard,
              {
                backgroundColor: colors.surfaceLight,
                borderColor:
                  selectedType === "regular" ? colors.accent : colors.border,
                borderWidth: selectedType === "regular" ? 2 : 1,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={styles.optionContent}>
              <View
                style={[
                  styles.radioButton,
                  {
                    borderColor:
                      selectedType === "regular"
                        ? colors.accent
                        : colors.border,
                    backgroundColor:
                      selectedType === "regular"
                        ? colors.accent
                        : "transparent",
                  },
                ]}
              >
                {selectedType === "regular" && (
                  <Ionicons name="checkmark" size={14} color={colors.surface} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Regular Student
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  I'm enrolled in a full-time program
                </Text>
              </View>
              <Ionicons
                name="school"
                size={32}
                color={colors.accent}
                style={{ opacity: 0.6 }}
              />
            </View>
          </Pressable>

          {/* Irregular Student Option */}
          <Pressable
            onPress={() => {
              setSelectedType("irregular");
              setError(null);
            }}
            style={({ pressed }) => [
              styles.optionCard,
              {
                backgroundColor: colors.surfaceLight,
                borderColor:
                  selectedType === "irregular" ? colors.accent : colors.border,
                borderWidth: selectedType === "irregular" ? 2 : 1,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={styles.optionContent}>
              <View
                style={[
                  styles.radioButton,
                  {
                    borderColor:
                      selectedType === "irregular"
                        ? colors.accent
                        : colors.border,
                    backgroundColor:
                      selectedType === "irregular"
                        ? colors.accent
                        : "transparent",
                  },
                ]}
              >
                {selectedType === "irregular" && (
                  <Ionicons name="checkmark" size={14} color={colors.surface} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Irregular Student
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  I'm taking courses individually
                </Text>
              </View>
              <Ionicons
                name="document-text"
                size={32}
                color={colors.accent}
                style={{ opacity: 0.6 }}
              />
            </View>
          </Pressable>
        </View>
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
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.surface} size="small" />
          ) : (
            <Text style={[styles.continueText, { color: colors.surface }]}>
              Continue
            </Text>
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
  optionsContainer: {
    gap: Spacing.md,
    flex: 1,
    paddingBottom: Spacing.md,
  },
  optionCard: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitle: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  continueButton: {
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
