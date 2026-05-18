/**
 * ScrollFade
 *
 * A pointer-events-none gradient overlay that sits absolutely at the very top
 * of a screen. Content scrolls behind it and fades in from the background
 * colour — identical to the YouTube mobile "scroll-under" effect.
 *
 * Usage: drop <ScrollFade /> inside the same View that wraps your ScrollView,
 * after the ScrollView so it renders on top.
 */
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  /** Opaque background colour to fade from (should match screen background). */
  color: string;
  /**
   * Total height of the gradient overlay.
   * Defaults to insets.top + 56 which covers the status bar + a soft feather.
   */
  height?: number;
}

export function ScrollFade({ color, height }: Props) {
  const insets = useSafeAreaInsets();
  const fadeHeight = height ?? insets.top + 20;

  // Build RGBA stops from the base colour so it works with any hex colour.
  const opaque = hexToRgba(color, 1);
  const mid = hexToRgba(color, 0.7);
  const clear = hexToRgba(color, 0);

  return (
    <View
      style={[styles.wrap, { height: fadeHeight }]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={[opaque, mid, clear]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

// ── helper ───────────────────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number): string {
  // Handle rgba() / rgb() strings that are already parsed (pass-through)
  if (hex.startsWith('rgb')) {
    if (alpha === 1) return hex;
    const nums = hex.match(/[\d.]+/g) ?? ['0', '0', '0'];
    return `rgba(${nums[0]}, ${nums[1]}, ${nums[2]}, ${alpha})`;
  }

  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
