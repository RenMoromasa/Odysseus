import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { AppColors, FontSizes, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GPARingProps {
  gpa: number;
  maxGPA?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function GPARing({ gpa, maxGPA = 4.0, size = 150, strokeWidth = 10, label = 'Current GPA' }: GPARingProps) {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];
  const progress = Math.min(gpa / maxGPA, 1);
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withDelay(
      300,
      withTiming(progress, { duration: 1200, easing: Easing.out(Easing.cubic) })
    );
  }, [progress]);

  // Ring is built with two half-circle clipping containers
  const innerSize = size - strokeWidth * 2;
  const halfSize = size / 2;

  const rightHalfStyle = useAnimatedStyle(() => {
    const deg = Math.min(animatedProgress.value * 360, 180);
    return { transform: [{ rotate: `${deg}deg` }] };
  });

  const leftHalfStyle = useAnimatedStyle(() => {
    const deg = Math.max((animatedProgress.value * 360) - 180, 0);
    return { transform: [{ rotate: `${deg}deg` }] };
  });

  const getGPAColor = () => {
    if (gpa >= 3.5) return colors.success;
    if (gpa >= 3.0) return colors.accent;
    if (gpa >= 2.5) return colors.secondary;
    if (gpa >= 2.0) return colors.warning;
    return colors.danger;
  };

  const ringColor = getGPAColor();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background ring */}
      <View style={[
        styles.ring,
        {
          width: size, height: size, borderRadius: halfSize,
          borderWidth: strokeWidth, borderColor: colors.border,
        },
      ]} />

      {/* Right half clip */}
      <View style={[styles.halfClip, { width: halfSize, height: size, left: halfSize }]}>
        <Animated.View style={[
          styles.halfRing,
          {
            width: size, height: size, borderRadius: halfSize,
            borderWidth: strokeWidth, borderColor: ringColor,
            left: -halfSize,
          },
          rightHalfStyle,
        ]} />
      </View>

      {/* Left half clip */}
      <View style={[styles.halfClip, { width: halfSize, height: size, left: 0 }]}>
        <Animated.View style={[
          styles.halfRing,
          {
            width: size, height: size, borderRadius: halfSize,
            borderWidth: strokeWidth, borderColor: ringColor,
            left: 0,
          },
          leftHalfStyle,
        ]} />
      </View>

      {/* Center content */}
      <View style={[
        styles.center,
        {
          width: innerSize, height: innerSize, borderRadius: innerSize / 2,
          top: strokeWidth, left: strokeWidth,
          backgroundColor: colors.surface,
        },
      ]}>
        <Text style={[styles.gpaValue, { color: ringColor }]}>
          {gpa.toFixed(2)}
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

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
  ring: {
    position: 'absolute',
  },
  halfClip: {
    position: 'absolute',
    overflow: 'hidden',
  },
  halfRing: {
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  center: {
    position: 'absolute',
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
