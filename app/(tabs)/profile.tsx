import { GlassCard } from '@/components/ui/glass-card';
import { ScrollFade } from '@/components/ui/scroll-fade';
import { TabEnterAnimation } from '@/components/ui/tab-enter-animation';
import { AppColors, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { getThemeMode, setThemeMode, useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentPlan } from '@/hooks/use-student-plan';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { CustomAlert } from '@/components/ui/custom-alert';

export default function ProfileScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];
  const router = useRouter();
  const { state, calculateGPA, estimateGraduation } = useStudentPlan();
  const { logout, profile } = useAuth();
  const [logoutAlert, setLogoutAlert] = useState(false);

  const handleLogout = () => setLogoutAlert(true);

  const confirmLogout = async () => {
    setLogoutAlert(false);
    await logout();
    router.replace('/(auth)/welcome');
  };

  const gpaData = calculateGPA();
  const completedSems = state.semesters.filter(s => s.status === 'completed').length;
  const totalSems = state.semesters.length;
  const progressPercent = gpaData.totalCredits > 0
    ? Math.round((gpaData.completedCredits / gpaData.totalCredits) * 100)
    : 0;
  const gradEstimate = estimateGraduation();

  const [themeMode, setThemeModeState] = useState(getThemeMode());

  const cycleTheme = () => {
    const modes: Array<'light' | 'dark' | 'system'> = ['system', 'dark', 'light'];
    const currentIdx = modes.indexOf(themeMode);
    const next = modes[(currentIdx + 1) % modes.length];
    setThemeMode(next);
    setThemeModeState(next);
  };

  const themeLabel = themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light';


  return (
    <TabEnterAnimation style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Profile Overview</Text>
        </View>

        {/* Student Card */}
        <GlassCard style={styles.studentCard}>
          <View style={[styles.avatarLg, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}>
            <Ionicons name="person" size={36} color={colors.accent} />
          </View>
          <Text style={[styles.studentName, { color: colors.text }]}>
            {state.studentInfo.name}
          </Text>
          <Text style={[styles.studentProgram, { color: colors.textSecondary }]}>
            {state.studentInfo.program}
          </Text>
          {profile?.email && (
            <Text style={[styles.studentEmail, { color: colors.textMuted }]}>
              {profile.email}
            </Text>
          )}
          <View style={styles.studentMeta}>
            <View style={[styles.metaChip, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>
                Year {state.studentInfo.yearLevel}
              </Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>
                ID: {state.studentInfo.studentId}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Academic Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Academic Progress</Text>
          <GlassCard>
            {/* Progress bar */}
            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                Overall Completion
              </Text>
              <Text style={[styles.progressValue, { color: colors.accent }]}>
                {progressPercent}%
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.surfaceLight }]}>
              <View style={[styles.progressFill, {
                backgroundColor: colors.accent,
                width: `${progressPercent}%` as any,
              }]} />
            </View>

            <View style={styles.summaryGrid}>
              <SummaryItem
                icon="school" label="GPA" value={gpaData.overall.toFixed(2)}
                color={colors.success} colors={colors}
              />
              <SummaryItem
                icon="book" label="Units Done"
                value={`${gpaData.completedCredits}/${gpaData.totalCredits}`}
                color={colors.accent} colors={colors}
              />
              <SummaryItem
                icon="calendar" label="Semesters"
                value={`${completedSems}/${totalSems}`}
                color={colors.secondary} colors={colors}
              />
            </View>

            {/* Estimated Graduation */}
            {gradEstimate.label !== '—' && (
              <View style={[styles.gradEstimateRow, { borderTopColor: colors.border }]}>
                <View style={styles.gradEstimateLeft}>
                  <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.gradEstimateLabel, { color: colors.textSecondary }]}>
                    Est. Graduation
                  </Text>
                </View>
                <View style={styles.gradEstimateRight}>
                  <Text style={[styles.gradEstimateValue, { color: colors.text }]}>
                    {gradEstimate.label}
                  </Text>
                  <View style={[
                    styles.gradEstimateBadge,
                    { backgroundColor: gradEstimate.delayed ? colors.warningSoft : colors.accentSoft },
                  ]}>
                    <View style={[
                      styles.gradEstimateDot,
                      { backgroundColor: gradEstimate.delayed ? colors.warning : colors.accent },
                    ]} />
                    <Text style={[
                      styles.gradEstimateBadgeText,
                      { color: gradEstimate.delayed ? colors.warning : colors.accent },
                    ]}>
                      {gradEstimate.onTrackLabel}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Estimated Time Remaining */}
            {gradEstimate.remainingTime && gradEstimate.remainingTime !== '—' && (
              <View style={[styles.gradEstimateRow, { borderTopColor: colors.border }]}>
                <View style={styles.gradEstimateLeft}>
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.gradEstimateLabel, { color: colors.textSecondary }]}>
                    Time Remaining
                  </Text>
                </View>
                <Text style={[styles.gradEstimateValue, { color: colors.text }]}>
                  {gradEstimate.remainingTime}
                </Text>
              </View>
            )}
          </GlassCard>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          <GlassCard noPadding>
            <Pressable
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={cycleTheme}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.accentSoft }]}>
                  <Ionicons name="moon" size={18} color={colors.accent} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Choose Mode</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.settingHint, { color: colors.textMuted }]}>
                  {themeLabel}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </Pressable>

            <Pressable
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => router.push('/(modals)/manage-tags-modal')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.secondarySoft }]}>
                  <Ionicons name="pricetags" size={18} color={colors.secondary} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Manage Tags</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            <Pressable
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => router.push('/(modals)/confirm-reset-modal')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.dangerSoft }]}>
                  <Ionicons name="trash" size={18} color={colors.danger} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.danger }]}>Reset Schedule</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            <Pressable
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={handleLogout}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.dangerSoft }]}>
                  <Ionicons name="log-out" size={18} color={colors.danger} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.danger }]}>Sign Out</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            <Pressable
              style={styles.settingItem}
              onPress={() => router.push('/(modals)/confirm-delete-account-modal')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.dangerSoft }]}>
                  <Ionicons name="person-remove" size={18} color={colors.danger} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.danger }]}>Delete Account</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          </GlassCard>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <GlassCard>
            <Text style={[styles.aboutApp, { color: colors.text }]}>Odysseus</Text>
            <Text style={[styles.aboutDesc, { color: colors.textSecondary }]}>
              Student Course & Prerequisite Mapper
            </Text>
            <Text style={[styles.aboutVersion, { color: colors.textMuted }]}>Version 1.0.0</Text>
          </GlassCard>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Logout confirmation */}
      <CustomAlert
        visible={logoutAlert}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        icon="log-out-outline"
        iconColor={colors.danger}
        buttons={[
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: confirmLogout },
        ]}
        onDismiss={() => setLogoutAlert(false)}
      />

      {/* Scroll-fade overlay */}
      <ScrollFade color={colors.background} />
    </TabEnterAnimation>
  );
}

function SummaryItem({ icon, label, value, color, colors }: {
  icon: string; label: string; value: string; color: string; colors: any;
}) {
  return (
    <View style={summaryStyles.item}>
      <View style={[summaryStyles.iconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={[summaryStyles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[summaryStyles.label, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  item: { alignItems: 'center', flex: 1, gap: 4 },
  iconWrap: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  value: { fontSize: FontSizes.lg, fontWeight: '800' },
  label: { fontSize: FontSizes.xs, fontWeight: '500' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingTop: Spacing.xxl + Spacing.lg },
  header: { marginBottom: Spacing.lg },
  title: { fontSize: FontSizes.xxl, fontWeight: '800' },
  studentCard: {
    alignItems: 'center', paddingVertical: Spacing.xl, marginBottom: Spacing.lg,
  },
  avatarLg: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, marginBottom: Spacing.md,
  },
  studentName: { fontSize: FontSizes.xl, fontWeight: '800' },
  studentProgram: { fontSize: FontSizes.md, marginTop: 2 },
  studentEmail: { fontSize: FontSizes.sm, marginTop: 4 },
  studentMeta: {
    flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md,
  },
  metaChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
  },
  metaChipText: { fontSize: FontSizes.xs, fontWeight: '600' },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', marginBottom: Spacing.sm },
  progressRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.sm,
  },
  progressLabel: { fontSize: FontSizes.sm, fontWeight: '500' },
  progressValue: { fontSize: FontSizes.md, fontWeight: '800' },
  progressTrack: {
    height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.lg,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  summaryGrid: { flexDirection: 'row', gap: Spacing.sm },
  gradEstimateRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Spacing.md, paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  gradEstimateLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gradEstimateLabel: { fontSize: FontSizes.xs, fontWeight: '500' },
  gradEstimateRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  gradEstimateValue: { fontSize: FontSizes.sm, fontWeight: '700' },
  gradEstimateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radii.full,
  },
  gradEstimateDot: { width: 6, height: 6, borderRadius: 3 },
  gradEstimateBadgeText: { fontSize: 10, fontWeight: '700' },
  settingItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  settingIcon: {
    width: 34, height: 34, borderRadius: Radii.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  settingLabel: { fontSize: FontSizes.md, fontWeight: '500' },
  settingHint: { fontSize: FontSizes.sm },
  aboutApp: { fontSize: FontSizes.xl, fontWeight: '800' },
  aboutDesc: { fontSize: FontSizes.sm, marginTop: 2 },
  aboutVersion: { fontSize: FontSizes.xs, marginTop: Spacing.xs },
});
