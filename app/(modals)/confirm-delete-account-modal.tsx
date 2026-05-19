import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { AppColors, Spacing, FontSizes, Radii } from '@/constants/theme';
import { CustomAlert } from '@/components/ui/custom-alert';

export default function ConfirmDeleteAccountModal() {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];
  const router = useRouter();
  const { deleteAccount, profile } = useAuth();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!password.trim()) {
      setErrorAlert('Please enter your password to confirm.');
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount(password);
      // Firebase deleteUser() signs out automatically — router will redirect via AuthGate
      router.replace('/(auth)/welcome');
    } catch (err: any) {
      setErrorAlert(err.message ?? 'Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>

        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: colors.dangerSoft }]}>
          <Ionicons name="person-remove" size={48} color={colors.danger} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Delete Account?</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          This will permanently delete your account and all associated data.
          {'\n\n'}
          <Text style={{ fontWeight: '700', color: colors.danger }}>
            This action cannot be undone.
          </Text>
        </Text>

        {/* Email hint */}
        {profile?.email && (
          <View style={[styles.emailChip, { backgroundColor: colors.surfaceLight }]}>
            <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.emailText, { color: colors.textMuted }]}>{profile.email}</Text>
          </View>
        )}

        {/* Password confirmation */}
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
          Enter your password to confirm
        </Text>
        <View style={[styles.inputWrap, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleDelete}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={[
              styles.deleteBtn,
              { backgroundColor: colors.danger, opacity: deleting ? 0.7 : 1 },
            ]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="trash" size={18} color="#FFF" />
                <Text style={styles.deleteBtnText}>Delete My Account</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={[styles.cancelBtn, { backgroundColor: colors.surfaceLight }]}
            onPress={() => router.back()}
            disabled={deleting}
          >
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
              Keep My Account
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl,
  },
  content: { alignItems: 'center', maxWidth: 340, width: '100%' },
  iconWrap: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', textAlign: 'center' },
  desc: {
    fontSize: FontSizes.md, textAlign: 'center', lineHeight: 22,
    marginTop: Spacing.sm, marginBottom: Spacing.lg,
  },
  emailChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radii.full, marginBottom: Spacing.lg,
  },
  emailText: { fontSize: FontSizes.sm },
  inputLabel: {
    fontSize: FontSizes.sm, fontWeight: '600',
    alignSelf: 'flex-start', marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radii.md, borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    width: '100%', marginBottom: Spacing.xl,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: {
    flex: 1, fontSize: FontSizes.md,
    paddingVertical: 14,
  },
  actions: { width: '100%', gap: Spacing.sm },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  deleteBtnText: { fontSize: FontSizes.md, fontWeight: '700', color: '#FFF' },
  cancelBtn: {
    alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  cancelText: { fontSize: FontSizes.md, fontWeight: '600' },
});
