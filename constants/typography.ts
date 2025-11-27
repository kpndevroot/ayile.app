/**
 * Typography System - Single Source of Truth
 * Comprehensive font system for consistent typography across the application
 */

import { Platform } from 'react-native';

/**
 * Font Families - Platform-specific font stacks
 */
export const FontFamilies = {
  // Primary font family (clean, modern)
  primary: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
    default: 'System',
  }),
  
  // Secondary font family (readable, friendly)
  secondary: Platform.select({
    ios: 'SF Pro Text',
    android: 'Roboto',
    default: 'System',
  }),
  
  // Monospace font family (code, numbers)
  mono: Platform.select({
    ios: 'SF Mono',
    android: 'Roboto Mono',
    default: 'Courier New',
  }),
  
  // Display font family (headings, branding)
  display: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
    default: 'System',
  }),
} as const;

/**
 * Font Weights - Consistent weight scale
 */
export const FontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

/**
 * Font Sizes - Modular scale for consistent sizing
 */
export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
  '6xl': 48,
  '7xl': 60,
  '8xl': 72,
} as const;

/**
 * Line Heights - Optimized for readability
 */
export const LineHeights = {
  none: 1,
  tight: 1.1,
  snug: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
  extra: 2.0,
} as const;

/**
 * Letter Spacing - Subtle spacing adjustments
 */
export const LetterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.2,
} as const;

/**
 * Typography Presets - Ready-to-use text styles
 */
export const TypographyPresets = {
  // Display styles (large headings, hero text)
  displayLarge: {
    fontFamily: FontFamilies.display,
    fontSize: FontSizes['6xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes['6xl'] * LineHeights.tight,
    letterSpacing: LetterSpacing.tight,
  },
  
  displayMedium: {
    fontFamily: FontFamilies.display,
    fontSize: FontSizes['4xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes['4xl'] * LineHeights.tight,
    letterSpacing: LetterSpacing.tight,
  },
  
  displaySmall: {
    fontFamily: FontFamilies.display,
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes['3xl'] * LineHeights.snug,
    letterSpacing: LetterSpacing.normal,
  },
  
  // Heading styles (section titles, page headers)
  headingLarge: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes['2xl'] * LineHeights.snug,
    letterSpacing: LetterSpacing.normal,
  },
  
  headingMedium: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.xl * LineHeights.snug,
    letterSpacing: LetterSpacing.normal,
  },
  
  headingSmall: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.lg * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  
  // Body text styles (paragraphs, descriptions)
  bodyLarge: {
    fontFamily: FontFamilies.secondary,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.lg * LineHeights.relaxed,
    letterSpacing: LetterSpacing.normal,
  },
  
  bodyMedium: {
    fontFamily: FontFamilies.secondary,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.base * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  
  bodySmall: {
    fontFamily: FontFamilies.secondary,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.sm * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  
  // Label styles (buttons, form labels, tags)
  labelLarge: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.base * LineHeights.snug,
    letterSpacing: LetterSpacing.wide,
  },
  
  labelMedium: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.sm * LineHeights.snug,
    letterSpacing: LetterSpacing.wide,
  },
  
  labelSmall: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.xs * LineHeights.snug,
    letterSpacing: LetterSpacing.wider,
  },
  
  // Caption styles (metadata, timestamps, helper text)
  caption: {
    fontFamily: FontFamilies.secondary,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.xs * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  
  // Price styles (monetary values)
  priceLarge: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes.xl * LineHeights.snug,
    letterSpacing: LetterSpacing.normal,
  },
  
  priceMedium: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.lg * LineHeights.snug,
    letterSpacing: LetterSpacing.normal,
  },
  
  // Button styles
  buttonLarge: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.lg * LineHeights.snug,
    letterSpacing: LetterSpacing.wide,
  },
  
  buttonMedium: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.base * LineHeights.snug,
    letterSpacing: LetterSpacing.wide,
  },
  
  buttonSmall: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.sm * LineHeights.snug,
    letterSpacing: LetterSpacing.wide,
  },
} as const;

/**
 * Utility function to get typography preset
 */
export const getTypographyPreset = (preset: keyof typeof TypographyPresets) => {
  return TypographyPresets[preset];
};

/**
 * Utility function to create custom typography style
 */
export const createTypographyStyle = ({
  family = 'primary',
  size = 'base',
  weight = 'regular',
  lineHeight = 'normal',
  letterSpacing = 'normal',
}: {
  family?: keyof typeof FontFamilies;
  size?: keyof typeof FontSizes;
  weight?: keyof typeof FontWeights;
  lineHeight?: keyof typeof LineHeights;
  letterSpacing?: keyof typeof LetterSpacing;
}) => ({
  fontFamily: FontFamilies[family],
  fontSize: FontSizes[size],
  fontWeight: FontWeights[weight],
  lineHeight: FontSizes[size] * LineHeights[lineHeight],
  letterSpacing: LetterSpacing[letterSpacing],
});

export type TypographyPreset = keyof typeof TypographyPresets;
export type FontFamily = keyof typeof FontFamilies;
export type FontWeight = keyof typeof FontWeights;
export type FontSize = keyof typeof FontSizes;
