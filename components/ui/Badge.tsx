import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@tamagui/core';
import { DesignTokens } from '@/constants/design';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

/**
 * Badge Component
 * Status indicators and labels
 */
export function Badge({ children, variant = 'neutral', size = 'md' }: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: DesignTokens.colors.semantic.success + '20',
          textColor: DesignTokens.colors.semantic.success,
        };
      case 'warning':
        return {
          backgroundColor: DesignTokens.colors.semantic.warning + '20',
          textColor: DesignTokens.colors.semantic.warning,
        };
      case 'error':
        return {
          backgroundColor: DesignTokens.colors.semantic.error + '20',
          textColor: DesignTokens.colors.semantic.error,
        };
      case 'info':
        return {
          backgroundColor: DesignTokens.colors.semantic.info + '20',
          textColor: DesignTokens.colors.semantic.info,
        };
      default:
        return {
          backgroundColor: DesignTokens.colors.neutral.gray200,
          textColor: DesignTokens.colors.neutral.gray700,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const padding = size === 'sm' ? DesignTokens.spacing.xs : DesignTokens.spacing.sm;
  const fontSize = size === 'sm' ? DesignTokens.typography.fontSize.xs : DesignTokens.typography.fontSize.sm;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles.backgroundColor,
          paddingVertical: padding,
          paddingHorizontal: padding * 1.5,
          borderRadius: DesignTokens.radius.full,
        },
      ]}
    >
      <Text
        style={{
          color: variantStyles.textColor,
          fontSize,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
});

