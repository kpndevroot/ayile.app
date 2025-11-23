import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { YStack, XStack } from '@tamagui/stacks';
import { DesignTokens } from '@/constants/design';

interface CardProps {
  children: React.ReactNode;
  padding?: keyof typeof DesignTokens.spacing;
  backgroundColor?: string;
  borderRadius?: keyof typeof DesignTokens.radius;
  shadow?: keyof typeof DesignTokens.shadows;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Modern Card Component
 * Reusable card with consistent styling
 */
export function Card({
  children,
  padding = 'md',
  backgroundColor = DesignTokens.colors.background.card,
  borderRadius = 'md',
  shadow = 'md',
  style,
}: CardProps) {
  return (
    <YStack
      padding={DesignTokens.spacing[padding]}
      backgroundColor={backgroundColor}
      borderRadius={DesignTokens.radius[borderRadius]}
      style={[DesignTokens.shadows[shadow], style]}
    >
      {children}
    </YStack>
  );
}

