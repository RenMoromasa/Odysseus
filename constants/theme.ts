/**
 * Odysseus Design System
 * Dark-mode-first premium academic planning theme
 */

import { Platform } from 'react-native';

export const AppColors = {
  dark: {
    background: '#0B0F1A',
    surface: '#151A2D',
    surfaceLight: '#1E2642',
    border: '#2B3455',
    borderLight: '#3D4A73',

    text: '#F0F4FF',
    textSecondary: '#8B95B5',
    textMuted: '#5A6485',

    accent: '#7C6AFF',
    accentLight: '#9D8FFF',
    accentSoft: 'rgba(124, 106, 255, 0.15)',

    secondary: '#4ECDC4',
    secondarySoft: 'rgba(78, 205, 196, 0.15)',

    success: '#5CDB95',
    successSoft: 'rgba(92, 219, 149, 0.15)',

    warning: '#FFD166',
    warningSoft: 'rgba(255, 209, 102, 0.15)',

    danger: '#FF6B6B',
    dangerSoft: 'rgba(255, 107, 107, 0.15)',

    glass: 'rgba(21, 26, 45, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',

    tabBar: 'rgba(11, 15, 26, 0.95)',
    tabBarBorder: 'rgba(255, 255, 255, 0.06)',
  },
  light: {
    background: '#F5F7FC',
    surface: '#FFFFFF',
    surfaceLight: '#EDF0F9',
    border: '#DDE1EE',
    borderLight: '#C8CEDF',

    text: '#1A1D2E',
    textSecondary: '#5A6078',
    textMuted: '#8E93A8',

    accent: '#6C5CE7',
    accentLight: '#8B7FF0',
    accentSoft: 'rgba(108, 92, 231, 0.10)',

    secondary: '#00B4A0',
    secondarySoft: 'rgba(0, 180, 160, 0.10)',

    success: '#2ECC71',
    successSoft: 'rgba(46, 204, 113, 0.10)',

    warning: '#F0A500',
    warningSoft: 'rgba(240, 165, 0, 0.10)',

    danger: '#E74C3C',
    dangerSoft: 'rgba(231, 76, 60, 0.10)',

    glass: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(0, 0, 0, 0.06)',

    tabBar: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: 'rgba(0, 0, 0, 0.08)',
  },
};

export const TagColors: Record<string, string> = {
  coreMajor: '#7C6AFF',
  freeElective: '#F472B6',
  minor: '#38BDF8',
  profElective: '#A78BFA',
  genEd: '#4ECDC4',
  laboratory: '#FB923C',
  thesis: '#FFD166',
  peNstp: '#94A3B8',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
  hero: 36,
};

// Keep legacy exports for compatibility with existing components
const tintColorLight = '#6C5CE7';
const tintColorDark = '#7C6AFF';

export const Colors = {
  light: {
    text: AppColors.light.text,
    background: AppColors.light.background,
    tint: tintColorLight,
    icon: AppColors.light.textMuted,
    tabIconDefault: AppColors.light.textMuted,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: AppColors.dark.text,
    background: AppColors.dark.background,
    tint: tintColorDark,
    icon: AppColors.dark.textMuted,
    tabIconDefault: AppColors.dark.textMuted,
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Menlo',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "system-ui, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
