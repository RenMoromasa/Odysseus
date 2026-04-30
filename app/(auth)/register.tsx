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

const PROGRAMS = [
  'BS - Information Technology',
  'BS - Information Systems',
  'BS - Computer Science',
];

const YEAR_LEVELS = [1, 2, 3, 4];

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  idNumber?: string;
  password?: string;
  confirmPassword?: string;
  program?: string;
  yearLevel?: string;
};

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedYearLevel, setSelectedYearLevel] = useState(0);
  const [showProgramPicker, setShowProgramPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors & { general?: string }>({});

  const clearError = (field: keyof FormErrors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleRegister = async () => {
    const newErrors: FormErrors = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!email.trim()) {
      newErrors.email = 'School email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!idNumber.trim()) {
      newErrors.idNumber = 'ID number is required';
    } else if (!/^\d{6,10}$/.test(idNumber.trim())) {
      newErrors.idNumber = 'Format: eg. 21104187';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Minimum 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!selectedProgram) newErrors.program = 'Please select a program';
    if (!selectedYearLevel) newErrors.yearLevel = 'Please select your year level';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        idNumber: idNumber.trim(),
        password,
        program: selectedProgram,
        yearLevel: selectedYearLevel,
      });
      // Don't manually redirect - let AuthGate in _layout.tsx handle the flow
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
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top: Gradient Background with Logo ─────────────────── */}
          <View style={styles.topSection}>
            <LinearGradient
              colors={['#E8A87C', '#EDBA94', '#F2CCAC', '#F5DCC4', '#F9EADB', '#FDF5EF']}
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

          {/* ── Bottom: White Card with Register Form ──────────────── */}
          <View style={styles.bottomCard}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Fill in your details to get started with Odysseus.
            </Text>
            {/* General Error */}
            {errors.general && (
              <View style={styles.generalError}>
                <Ionicons name="alert-circle" size={16} color="#F87171" />
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            {/* ── Name Row ── */}
            <View style={styles.nameRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>First Name</Text>
                <View style={[styles.inputWrap, errors.firstName && styles.inputError]}>
                  <Ionicons name="person-outline" size={16} color="#8E93A8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={(t) => { setFirstName(t); clearError('firstName'); }}
                    placeholder="First Name"
                    placeholderTextColor="#C4C8D8"
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>

              <View style={{ width: Spacing.sm }} />

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <View style={[styles.inputWrap, errors.lastName && styles.inputError]}>
                  <TextInput
                    style={[styles.input, { paddingLeft: 2 }]}
                    value={lastName}
                    onChangeText={(t) => { setLastName(t); clearError('lastName'); }}
                    placeholder="Last Name"
                    placeholderTextColor="#C4C8D8"
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>

            {/* ── School Email ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>School Email</Text>
              <View style={[styles.inputWrap, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={16} color="#8E93A8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(t) => { setEmail(t); clearError('email'); }}
                  placeholder="School Email"
                  placeholderTextColor="#C4C8D8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* ── ID Number ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ID Number</Text>
              <View style={[styles.inputWrap, errors.idNumber && styles.inputError]}>
                <Ionicons name="card-outline" size={16} color="#8E93A8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={idNumber}
                  onChangeText={(t) => { setIdNumber(t); clearError('idNumber'); }}
                  placeholder="ID Number"
                  placeholderTextColor="#C4C8D8"
                  keyboardType="number-pad"
                  returnKeyType="next"
                />
              </View>
              {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}
            </View>

            {/* ── Program Picker ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Program</Text>
              <Pressable
                style={[styles.inputWrap, errors.program && styles.inputError]}
                onPress={() => setShowProgramPicker(!showProgramPicker)}
              >
                <Ionicons name="school-outline" size={16} color="#8E93A8" style={styles.inputIcon} />
                <Text style={[
                  styles.pickerText,
                  !selectedProgram && { color: '#C4C8D8' },
                ]}>
                  {selectedProgram || 'Select your program'}
                </Text>
                <Ionicons
                  name={showProgramPicker ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#8E93A8"
                />
              </Pressable>
              {errors.program && <Text style={styles.errorText}>{errors.program}</Text>}

              {showProgramPicker && (
                <View style={styles.pickerDropdown}>
                  {PROGRAMS.map(prog => (
                    <Pressable
                      key={prog}
                      style={[
                        styles.pickerOption,
                        selectedProgram === prog && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedProgram(prog);
                        setShowProgramPicker(false);
                        clearError('program');
                      }}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        selectedProgram === prog && styles.pickerOptionTextSelected,
                      ]}>
                        {prog}
                      </Text>
                      {selectedProgram === prog && (
                        <Ionicons name="checkmark" size={18} color="#D4874D" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* ── Year Level Picker ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Year Level</Text>
              <Pressable
                style={[styles.inputWrap, errors.yearLevel && styles.inputError]}
                onPress={() => setShowYearPicker(!showYearPicker)}
              >
                <Ionicons name="layers-outline" size={16} color="#8E93A8" style={styles.inputIcon} />
                <Text style={[
                  styles.pickerText,
                  !selectedYearLevel && { color: '#C4C8D8' },
                ]}>
                  {selectedYearLevel ? `Year ${selectedYearLevel}` : 'Select your year level'}
                </Text>
                <Ionicons
                  name={showYearPicker ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#8E93A8"
                />
              </Pressable>
              {errors.yearLevel && <Text style={styles.errorText}>{errors.yearLevel}</Text>}

              {showYearPicker && (
                <View style={styles.pickerDropdown}>
                  {YEAR_LEVELS.map(year => (
                    <Pressable
                      key={year}
                      style={[
                        styles.pickerOption,
                        selectedYearLevel === year && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedYearLevel(year);
                        setShowYearPicker(false);
                        clearError('yearLevel');
                      }}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        selectedYearLevel === year && styles.pickerOptionTextSelected,
                      ]}>
                        {year === 1 ? '1st Year' : year === 2 ? '2nd Year' : year === 3 ? '3rd Year' : '4th Year'}
                      </Text>
                      {selectedYearLevel === year && (
                        <Ionicons name="checkmark" size={18} color="#D4874D" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* ── Password ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={16} color="#8E93A8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(t) => { setPassword(t); clearError('password'); }}
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#C4C8D8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="next"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#8E93A8" />
                </Pressable>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* ── Confirm Password ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[styles.inputWrap, errors.confirmPassword && styles.inputError]}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#8E93A8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); clearError('confirmPassword'); }}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#C4C8D8"
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <Pressable onPress={() => setShowConfirm(!showConfirm)} hitSlop={8} style={styles.eyeBtn}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color="#8E93A8" />
                </Pressable>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* ── Register Button ── */}
            <Pressable
              onPress={handleRegister}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.registerBtnWrap,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                isLoading && { opacity: 0.7 },
              ]}
            >
              <LinearGradient
                colors={['#E8A87C', '#D4874D', '#C47035']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerBtnGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.registerBtnText}>Register</Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* ── Already have an account ── */}
            <View style={styles.bottomLink}>
              <Text style={styles.bottomLinkText}>Already have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.bottomLinkAction}>Log In</Text>
              </Pressable>
            </View>

            <View style={{ height: 30 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF5EF',
  },

  // ── Top Section ──
  topSection: {
    height: 240,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorCircle1: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    top: -20,
    left: -50,
  },
  decorCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    top: 40,
    right: -30,
  },
  decorCircle3: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(212, 135, 77, 0.08)',
    bottom: 10,
    left: 60,
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
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  logo: {
    width: 110,
    height: 110,
  },

  // ── Bottom Card ──
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg + Spacing.xs,
    paddingBottom: Spacing.lg,
    shadowColor: '#D4874D',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1D2E',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: '#8E93A8',
    lineHeight: 20,
    marginBottom: Spacing.md + Spacing.xs,
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
  nameRow: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: '#5A6078',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: '#E8EAF0',
    paddingHorizontal: Spacing.md,
    minHeight: 48,
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
    paddingVertical: 12,
  },
  eyeBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: 11,
    color: '#F87171',
    marginTop: 3,
    fontWeight: '500',
  },

  // ── Program Picker ──
  pickerText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: '#1A1D2E',
    paddingVertical: 12,
  },
  pickerDropdown: {
    marginTop: Spacing.xs,
    backgroundColor: '#F8F9FC',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#E8EAF0',
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EAF0',
  },
  pickerOptionSelected: {
    backgroundColor: '#FDF0E6',
  },
  pickerOptionText: {
    fontSize: FontSizes.md,
    color: '#1A1D2E',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#D4874D',
    fontWeight: '700',
  },

  // ── Register Button ──
  registerBtnWrap: {
    width: '100%',
    borderRadius: Radii.xl,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  registerBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: Radii.xl,
  },
  registerBtnText: {
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
    color: '#D4874D',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
