/**
 * GPARing — Animated progress ring
 *
 * Rebuilt using a stroke-dasharray SVG-style approach emulated with pure
 * React Native Views. Two half-circle "sectors" (right, then left) are
 * revealed progressively via animated rotation, with overflow:hidden clipping.
 *
 * This pattern is robust on both the old and Fabric (new) architectures.
 */
import { AppColors, FontSizes } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

interface GPARingProps {
  gpa: number;
  maxGPA?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function GPARing({
  gpa,
  maxGPA = 5.0,
  size = 150,
  strokeWidth = 12,
  label = 'Current GPA',
}: GPARingProps) {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];

  // progress 0–1
  const progress = Math.min(Math.max(gpa / maxGPA, 0), 1);
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withDelay(
      300,
      withTiming(progress, { duration: 1200, easing: Easing.out(Easing.cubic) })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const ringColor = getGPAColor(gpa, colors);
  const radius = size / 2;
  const innerSize = size - strokeWidth * 2;

  // ── Right half: revealed from 0° → 180° ─────────────────────────────────
  const rightStyle = useAnimatedStyle(() => {
    const deg = Math.min(animatedProgress.value * 360, 180);
    return { transform: [{ rotate: `${deg}deg` }] };
  });

  // ── Left half: revealed from 0° → 180° (but only after right is done) ──
  const leftStyle = useAnimatedStyle(() => {
    const deg = Math.max(animatedProgress.value * 360 - 180, 0);
    return { transform: [{ rotate: `${deg}deg` }] };
  });

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      {/* ── Background track ── */}
      <View
        style={[
          styles.abs,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: strokeWidth,
            borderColor: colors.border,
          },
        ]}
      />

      {/* ── Right half sector ── */}
      {/* Clip container: right half of the circle */}
      <View
        style={[
          styles.abs,
          styles.halfClip,
          { width: radius, height: size, left: radius },
        ]}
      >
        {/* Full-circle ring rotated from the left edge of the clip */}
        <Animated.View
          style={[
            styles.abs,
            {
              width: size,
              height: size,
              borderRadius: radius,
              borderWidth: strokeWidth,
              borderColor: ringColor,
              // Hide the left half of the ring so only the right arc shows
              borderLeftColor: 'transparent',
              borderBottomColor: 'transparent',
              left: -radius,
              // Rotate around the centre of the full circle (= right edge of clip = left: -radius)
              transformOrigin: `${radius}px ${radius}px`,
            },
            rightStyle,
          ]}
        />
      </View>

      {/* ── Left half sector ── */}
      <View
        style={[
          styles.abs,
          styles.halfClip,
          { width: radius, height: size, left: 0 },
        ]}
      >
        <Animated.View
          style={[
            styles.abs,
            {
              width: size,
              height: size,
              borderRadius: radius,
              borderWidth: strokeWidth,
              borderColor: ringColor,
              // Hide the right half of the ring so only the left arc shows
              borderRightColor: 'transparent',
              borderTopColor: 'transparent',
              left: 0,
              transformOrigin: `${radius}px ${radius}px`,
            },
            leftStyle,
          ]}
        />
      </View>

      {/* ── Centre info ── */}
      <View
        style={[
          styles.abs,
          styles.center,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            top: strokeWidth,
            left: strokeWidth,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <Text style={[styles.gpaValue, { color: ringColor }]}>
          {gpa === 0 ? '—' : gpa.toFixed(2)}
        </Text>
        <Text style={[styles.gpaLabel, { color: colors.textSecondary }]}>
          {label}
        </Text>
        <Text style={[styles.gpaMax, { color: colors.textMuted }]}>
          of {maxGPA.toFixed(1)}
        </Text>
      </View>
    </View>
  );
}

// ── helpers ─────────────────────────────────────────────────────────────────
function getGPAColor(gpa: number, colors: ReturnType<typeof getColors>) {
  if (gpa === 0)    return colors.textMuted;
  if (gpa <= 1.50)  return colors.success;
  if (gpa <= 2.00)  return colors.accent;
  if (gpa <= 2.50)  return colors.secondary;
  if (gpa <= 3.00)  return colors.warning;
  return colors.danger;
}

// Just a type helper so TS can infer the colors object shape
function getColors(c: any) { return c; }

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  halfClip: { overflow: 'hidden' },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpaValue: {
    fontSize: FontSizes.hero,
    fontWeight: '800',
    letterSpacing: -1,
  },
  gpaLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gpaMax: {
    fontSize: FontSizes.xs,
    marginTop: 1,
  },
});
