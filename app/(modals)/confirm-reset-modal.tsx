import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentPlan } from '@/hooks/use-student-plan';
import { AppColors, Spacing, FontSizes, Radii } from '@/constants/theme';
import { fetchSemesterTemplate } from '@/services/catalog';
import { CustomAlert } from '@/components/ui/custom-alert';

export default function ConfirmResetModal() {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];
  const router = useRouter();
  const { state, dispatch } = useStudentPlan();
  const [resetting, setResetting] = useState(false);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  const handleReset = async () => {
    setResetting(true);
    try {
      const freshSemesters = await fetchSemesterTemplate(state.studentInfo.program);
      if (!freshSemesters || freshSemesters.length === 0) {
        setErrorAlert('Could not load fresh semester template. Please try again.');
        setResetting(false);
        return;
      }
      dispatch({ type: 'RESET_PLAN', semesters: freshSemesters });
      router.back();
    } catch (err) {
      console.error('Failed to reset plan:', err);
      setErrorAlert('Reset failed. Please check your connection and try again.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Warning icon */}
        <View style={[styles.iconWrap, { backgroundColor: colors.dangerSoft }]}>
          <Ionicons name="warning" size={48} color={colors.danger} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Reset Schedule?</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          This will delete your entire multi-year schedule and reset all grades.
          You'll start fresh with a clean plan. This action cannot be undone.
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.resetBtn, { backgroundColor: colors.danger }]}
            onPress={handleReset}
          >
            <Ionicons name="trash" size={18} color="#FFF" />
            <Text style={styles.resetText}>Delete Everything</Text>
          </Pressable>

          <Pressable
            style={[styles.cancelBtn, { backgroundColor: colors.surfaceLight }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
              Keep My Schedule
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Error alert */}
      <CustomAlert
        visible={!!errorAlert}
        title="Error"
        message={errorAlert ?? ''}
        icon="alert-circle"
        iconColor={colors.danger}
        buttons={[{ text: 'OK', style: 'default' }]}
        onDismiss={() => setErrorAlert(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl,
  },
  content: { alignItems: 'center', maxWidth: 320, width: '100%' },
  iconWrap: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', textAlign: 'center' },
  desc: {
    fontSize: FontSizes.md, textAlign: 'center', lineHeight: 22,
    marginTop: Spacing.sm, marginBottom: Spacing.xl,
  },
  actions: { width: '100%', gap: Spacing.sm },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  resetText: { fontSize: FontSizes.md, fontWeight: '700', color: '#FFF' },
  cancelBtn: {
    alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  cancelText: { fontSize: FontSizes.md, fontWeight: '600' },
});
