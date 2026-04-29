import { FontSizes, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView, Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
const { width } = Dimensions.get('window');
export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const handleLogin = async () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrors({ general: err.message });
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
              colors={['#6AACB8', '#7EC4CC', '#9BD4D8', '#BBE2E4', '#D8EDED', '#EDF6F6']}
              locations={[0, 0.2, 0.4, 0.6, 0.8, 1]}
              style={StyleSheet.absoluteFill}
            />
            {/* Decorative soft circles for depth */}
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
            {/* App Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
          </View>
          {/* ── Bottom: White Card with Login Form ─────────────────── */}
          <View style={styles.bottomCard}>
            <Text style={styles.title}>Log In</Text>
            <Text style={styles.subtitle}>
              Welcome back! Enter your credentials to continue.
            </Text>
            {/* General Error */}
            {errors.general && (
              <View style={styles.generalError}>
                <Ionicons name="alert-circle" size={16} color="#F87171" />
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>School Email</Text>
              <View style={[
                styles.inputWrap,
                errors.email ? styles.inputError : null,
              ]}>
                <Ionicons name="mail-outline" size={18} color="#8E93A8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrors(e => ({ ...e, email: undefined, general: undefined })); }}
                  placeholder="School Email"
                  placeholderTextColor="#C4C8D8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>
            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[
                styles.inputWrap,
                errors.password ? styles.inputError : null,
              ]}>
                <Ionicons name="lock-closed-outline" size={18} color="#8E93A8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors(e => ({ ...e, password: undefined, general: undefined })); }}
                  placeholder="Enter your password"
                  placeholderTextColor="#C4C8D8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#8E93A8"
                  />
                </Pressable>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>
            {/* Forgot Password */}
            <Pressable style={styles.forgotBtn} onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>
            {/* Log In Button — Gradient */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.loginBtnWrap,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                isLoading && { opacity: 0.7 },
              ]}
            >
              <LinearGradient
                colors={['#5CB8C4', '#4DA8B4', '#3E98A4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginBtnGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginBtnText}>Log In</Text>
                )}
              </LinearGradient>
            </Pressable>
            {/* Register link */}
            <View style={styles.bottomLink}>
              <Text style={styles.bottomLinkText}>Don't have an account? </Text>
              <Pressable onPress={() => router.back()}>
                <Text style={styles.bottomLinkAction}>Register</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF6F6',
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
    backgroundColor: 'rgba(90, 184, 196, 0.08)',
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
    // Shadow
    shadowColor: '#3E98A4',
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: '#8E93A8',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  // ── General Error ──
  generalError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: 8,
  },
  generalErrorText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: '#F87171',
    fontWeight: '500',
  },
  // ── Inputs ──
  inputGroup: {
    marginBottom: Spacing.md,
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
  eyeBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: FontSizes.xs,
    color: '#F87171',
    marginTop: 4,
    fontWeight: '500',
  },
  // ── Forgot Password ──
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -4,
  },
  forgotText: {
    fontSize: FontSizes.sm,
    color: '#3E98A4',
    fontWeight: '600',
  },
  // ── Log In Button ──
  loginBtnWrap: {
    width: '100%',
    borderRadius: Radii.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  loginBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: Radii.xl,
  },
  loginBtnText: {
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
    color: '#3E98A4',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
