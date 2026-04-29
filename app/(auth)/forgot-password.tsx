import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, StatusBar,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Spacing, FontSizes, Radii } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Top: Gradient Background with Logo ─────────────────── */}
          <View style={styles.topSection}>
            <LinearGradient
              colors={['#D4708F', '#DE8DA6', '#E7AABD', '#F0C7D4', '#F6DCEA', '#FBF0F4']}
              locations={[0, 0.2, 0.4, 0.6, 0.8, 1]}
              style={StyleSheet.absoluteFill}
            />

            {/* Decorative soft circles */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
            <View style={styles.decorCircle3} />

            {/* Back Button */}
            <Pressable
              style={styles.backBtn}
              onPress={() => router.back()}
              hitSlop={12}
            >
              <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.8)" />
            </Pressable>


          </View>

          {/* ── Bottom: White Card ─────────────────────────────────── */}
          <View style={styles.bottomCard}>
            {!sent ? (
              <>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>
                  Enter the email address linked to your account and we'll send you a link to reset your password.
                </Text>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>School Email</Text>
                  <View style={[
                    styles.inputWrap,
                    error ? styles.inputError : null,
                  ]}>
                    <Ionicons name="mail-outline" size={18} color="#8E93A8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={(t) => { setEmail(t); setError(''); }}
                      placeholder="School Email"
                      placeholderTextColor="#C4C8D8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={handleReset}
                    />
                  </View>
                  {error !== '' && (
                    <Text style={styles.errorText}>{error}</Text>
                  )}
                </View>

                {/* Reset Button — Gradient */}
                <Pressable
                  onPress={handleReset}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.resetBtnWrap,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                    isLoading && { opacity: 0.7 },
                  ]}
                >
                  <LinearGradient
                    colors={['#D4708F', '#C45A78', '#B44462']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.resetBtnGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.resetBtnText}>Send Reset Link</Text>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Back to login */}
                <View style={styles.bottomLink}>
                  <Text style={styles.bottomLinkText}>Remember your password? </Text>
                  <Pressable onPress={() => router.back()}>
                    <Text style={styles.bottomLinkAction}>Log In</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              /* ── Success State ── */
              <View style={styles.successWrap}>
                <View style={styles.successIcon}>
                  <Ionicons name="mail-open" size={48} color="#D4708F" />
                </View>
                <Text style={styles.successTitle}>Check Your Email</Text>
                <Text style={styles.successDesc}>
                  We've sent a password reset link to{'\n'}
                  <Text style={{ fontWeight: '700', color: '#1A1D2E' }}>{email}</Text>
                </Text>
                <Text style={styles.successHint}>
                  Didn't receive it? Check your spam folder or try again.
                </Text>

                {/* Try again */}
                <Pressable
                  onPress={() => setSent(false)}
                  style={({ pressed }) => [
                    styles.tryAgainBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.tryAgainText}>Try Different Email</Text>
                </Pressable>

                {/* Back to login */}
                <Pressable
                  onPress={() => router.back()}
                  style={({ pressed }) => [
                    styles.resetBtnWrap,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <LinearGradient
                    colors={['#D4708F', '#C45A78', '#B44462']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.resetBtnGradient}
                  >
                    <Text style={styles.resetBtnText}>Back to Log In</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF0F4',
  },

  // ── Top Section ──
  topSection: {
    height: 280,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorCircle1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    top: -30,
    left: -50,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    top: 50,
    right: -40,
  },
  decorCircle3: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(212, 112, 143, 0.08)',
    bottom: 10,
    left: 50,
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  logo: {
    width: 130,
    height: 130,
  },

  // ── Bottom Card ──
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    shadowColor: '#D4708F',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A1D2E',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: '#8E93A8',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },

  // ── Input ──
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#5A6078',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: '#E8EAF0',
    paddingHorizontal: Spacing.md,
  },
  inputError: {
    borderColor: '#F87171',
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: '#1A1D2E',
    paddingVertical: 14,
  },
  errorText: {
    fontSize: FontSizes.xs,
    color: '#F87171',
    marginTop: 4,
    fontWeight: '500',
  },

  // ── Reset Button ──
  resetBtnWrap: {
    width: '100%',
    borderRadius: Radii.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  resetBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: Radii.xl,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Bottom Link ──
  bottomLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomLinkText: {
    fontSize: FontSizes.sm,
    color: '#8E93A8',
  },
  bottomLinkAction: {
    fontSize: FontSizes.sm,
    color: '#D4708F',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // ── Success State ──
  successWrap: {
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FBE8EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1D2E',
    marginBottom: Spacing.sm,
  },
  successDesc: {
    fontSize: FontSizes.md,
    color: '#8E93A8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  successHint: {
    fontSize: FontSizes.xs,
    color: '#B0B4C4',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  tryAgainBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.xl,
    borderWidth: 1.5,
    borderColor: '#E8C8D8',
    backgroundColor: '#FDFCFF',
    marginBottom: Spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  tryAgainText: {
    color: '#D4708F',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
