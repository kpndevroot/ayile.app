/**
 * Typography Components
 * Reusable text components with consistent styling
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { Text as TamaguiText, TextProps as TamaguiTextProps } from '@tamagui/core';
import { TypographyPresets, getTypographyPreset, TypographyPreset } from '@/constants/typography';
import { DesignTokens } from '@/constants/design';

interface BaseTypographyProps {
  preset?: TypographyPreset;
  color?: string;
  children: React.ReactNode;
}

type TypographyProps = BaseTypographyProps & Omit<TamaguiTextProps, 'children'>;

/**
 * Base Typography Component
 * Combines Tamagui Text with typography presets
 */
export function Typography({ 
  preset = 'bodyMedium', 
  color = DesignTokens.colors.brown[900], 
  children, 
  style,
  ...props 
}: TypographyProps) {
  const presetStyle = getTypographyPreset(preset);
  
  return (
    <TamaguiText
      style={[presetStyle, { color }, style]}
      {...props}
    >
      {children}
    </TamaguiText>
  );
}

/**
 * Display Text Components (Hero text, large headings)
 */
export function DisplayLarge({ children, color, style, ...props }: Omit<TypographyProps, 'preset'>) {
  return (
    <Typography 
      preset="displayLarge" 
      color={color || DesignTokens.colors.brown[900]}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function DisplayMedium({ children, color, style, ...props }: Omit<TypographyProps, 'preset'>) {
  return (
    <Typography 
      preset="displayMedium" 
      color={color || DesignTokens.colors.brown[900]}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function DisplaySmall({ children, color, style, ...props }: Omit<TypographyProps, 'preset'>) {
  return (
    <Typography 
      preset="displaySmall" 
      color={color || DesignTokens.colors.brown[900]}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
}

/**
 * Heading Components (Section titles, page headers)
 */
export function HeadingLarge({ children, color, style, ...props }: Omit<TypographyProps, 'preset'>) {
  return (
    <Typography 
      preset="headingLarge" 
      color={color || DesignTokens.colors.brown[900]}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function HeadingMedium({ children, color, style, ...props }: Omit<TypographyProps, 'preset'>) {
  return (
    <Typography 
      preset="headingMedium" 
      color={color || DesignTokens.colors.brown[900]}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function HeadingSmall({ children, color, style, ...props }: Omit<TypographyProps, 'preset'>) {
  return (
    <Typography 
      preset="headingSmall" 
      color={color || DesignTokens.colors.brown[900]}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
}

/**
 * Body Text Components (Paragraphs, descriptions)
 */
export function BodyLarge({ children, color, style, ...props }: Omit<TypographyProps, 'preset'>) {
  return (
    <Typography 
      preset="bodyLarge" 
      color={color || DesignTokens.colors.lightBrown[400]}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function BodyMedium({ children, color, style, ...props }: Omit<TypographyProps, 'preset'>) {
  return (
    <Typography 
      preset="bodyMedium" 
      color={color || DesignTokens.colors.lightBrown[400]}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function BodySmall({ children, color, style, ...props }: Omit<TypographyProps, 'preset'>) {
  return (
    <Typography 
      preset="bodySmall" 
      color={color || DesignTokens.colors.lightBrown[400]}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
}

/**
 * Label Components (Buttons, form labels, tags)
 */
export function LabelLarge({ children, color, style, ...props }: Omit<TypographyProps, 'preset'>) {
  return (
    <Typography 
      preset="labelLarge" 
      color={color || DesignTokens.colors.brown[900]}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function LabelMedium({ children, color, style, ...props }: Omit<TypographyProps, 'preset'>) {
  return (
    <Typography 
      preset="labelMedium" 
      color={color || DesignTokens.colors.brown[900]}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function LabelSmall({ children, color, style, ...props }: Omit<TypographyProps, 'preset'>) {
  return (
    <Typography 
      preset="labelSmall" 
      color={color || DesignTokens.colors.brown[900]}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
}

/**
 * Specialized Components
 */
export function Caption({ children, color, style, ...props }: Omit<TypographyProps, 'preset'>) {
  return (
    <Typography 
      preset="caption" 
      color={color || DesignTokens.colors.charcoal[500]}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function PriceLarge({ children, color, style, ...props }: Omit<TypographyProps, 'preset'>) {
  return (
    <Typography 
      preset="priceLarge" 
      color={color || DesignTokens.colors.orange[600]}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function PriceMedium({ children, color, style, ...props }: Omit<TypographyProps, 'preset'>) {
  return (
    <Typography 
      preset="priceMedium" 
      color={color || DesignTokens.colors.orange[600]}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
}
