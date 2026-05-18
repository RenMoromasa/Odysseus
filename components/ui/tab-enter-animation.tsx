/**
 * TabEnterAnimation
 *
 * Wraps a tab screen's content with a spring "pop up from below" animation
 * that triggers every time the tab gains focus — identical to the YouTube
 * mobile tab-switch feel.
 *
 * Usage: replace the screen's root <View> with <TabEnterAnimation>.
 */
import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** How far below (px) the content starts before animating in. Default 28. */
  offsetY?: number;
}

export function TabEnterAnimation({ children, style, offsetY = 28 }: Props) {
  const translateY = useSharedValue(offsetY);
  const opacity    = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      // Snap to start position instantly, then spring to rest
      translateY.value = offsetY;
      opacity.value    = 0;

      translateY.value = withSpring(0, {
        damping: 22,     // controls oscillation — higher = less bounce
        stiffness: 280,  // controls speed — feels snappy like YouTube
        mass: 0.9,
      });

      // Fade in slightly faster than the spring so content isn't invisible
      opacity.value = withTiming(1, { duration: 180 });
    }, [offsetY])
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.fill, animStyle, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
