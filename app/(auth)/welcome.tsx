import { FontSizes, Radii, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* ── Top: Gradient Background with Logo ─────────────────────────── */}
      <View style={styles.topSection}>
        <LinearGradient
          colors={['#059669', '#10B981', '#34D399', '#6EE7B7', '#FDE68A', '#FEF3C7']}
          locations={[0, 0.2, 0.4, 0.6, 0.8, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Decorative soft circles for depth */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorCircle3} />
        

      </View>

      {/* ── Bottom: White Card with Actions ────────────────────────────── */}
      <View style={styles.bottomCard}>
        <Text style={styles.welcomeTitle}>Welcome to Odysseus!</Text> 
        <Text style={styles.description}>
          We're here to help you plan your academic journey.{'\n'}
          Log in or create account.
        </Text>

        {/* Create Account Button — Gradient */}
        <Pressable
          onPress={() => router.push('/(auth)/register')}
          style={({ pressed }) => [
            styles.createBtnWrap,
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
        >
          <LinearGradient
            colors={['#57f3baff', '#57e2b4ff', '#8cf1abff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createBtnGradient}
          >
            <Text style={styles.createBtnText}>Create Account</Text>
          </LinearGradient>
        </Pressable>

        {/* Log In Button — Outline */}
        <Pressable
          onPress={() => router.push('/(auth)/login')}
          style={({ pressed }) => [
            styles.loginBtn,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text style={styles.loginBtnText}>Log In</Text>
        </Pressable>

        {/* Bottom link */}
        <View style={styles.bottomLink}>
          <Text style={styles.bottomLinkText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.bottomLinkAction}>Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF3C7',
  },

  // ── Top Section ──
  topSection: {
    flex: 1.1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    top: -40,
    left: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    top: 60,
    right: -50,
  },
  decorCircle3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    bottom: 20,
    left: 40,
  },
  logoContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
  },

  // ── Bottom Card ──
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl + Spacing.sm,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
    // Subtle shadow for depth
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A1D2E',
    letterSpacing: -0.5,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: '#5A6078',
    fontWeight: '500',
    marginBottom: 8,
  },
  description: {
    fontSize: FontSizes.sm,
    color: '#8E93A8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },

  // ── Create Account Button ──
  createBtnWrap: {
    width: '100%',
    borderRadius: Radii.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  createBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: Radii.xl,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Log In Button ──
  loginBtn: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: Radii.xl,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    backgroundColor: '#FDFCFF',
    marginBottom: Spacing.lg,
  },
  loginBtnText: {
    color: '#1A1D2E',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },

  // ── Bottom Link ──
  bottomLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomLinkText: {
    fontSize: FontSizes.sm,
    color: '#8E93A8',
  },
  bottomLinkAction: {
    fontSize: FontSizes.sm,
    color: '#10B981',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
