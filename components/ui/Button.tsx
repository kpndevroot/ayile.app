import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle, Pressable } from 'react-native';
import { Text } from '@tamagui/core';
import { DesignTokens } from '@/constants/design';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

/**
 * Modern Button Component
 * Consistent button styling with variants
 */
export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: DesignTokens.colors.primary.blue,
          borderColor: DesignTokens.colors.primary.blue,
          textColor: DesignTokens.colors.neutral.white,
        };
      case 'secondary':
        return {
          backgroundColor: DesignTokens.colors.neutral.gray200,
          borderColor: DesignTokens.colors.neutral.gray200,
          textColor: DesignTokens.colors.neutral.gray900,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: DesignTokens.colors.primary.blue,
          textColor: DesignTokens.colors.primary.blue,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: DesignTokens.colors.primary.blue,
        };
      case 'success':
        return {
          backgroundColor: DesignTokens.colors.primary.green,
          borderColor: DesignTokens.colors.primary.green,
          textColor: DesignTokens.colors.neutral.white,
        };
      default:
        return {
          backgroundColor: DesignTokens.colors.primary.blue,
          borderColor: DesignTokens.colors.primary.blue,
          textColor: DesignTokens.colors.neutral.white,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: DesignTokens.spacing.sm,
          paddingHorizontal: DesignTokens.spacing.md,
          fontSize: DesignTokens.typography.fontSize.sm,
        };
      case 'md':
        return {
          paddingVertical: DesignTokens.spacing.md,
          paddingHorizontal: DesignTokens.spacing.lg,
          fontSize: DesignTokens.typography.fontSize.md,
        };
      case 'lg':
        return {
          paddingVertical: DesignTokens.spacing.lg,
          paddingHorizontal: DesignTokens.spacing.xl,
          fontSize: DesignTokens.typography.fontSize.lg,
        };
      default:
        return {
          paddingVertical: DesignTokens.spacing.md,
          paddingHorizontal: DesignTokens.spacing.lg,
          fontSize: DesignTokens.typography.fontSize.md,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        {
          backgroundColor: isDisabled
            ? DesignTokens.colors.neutral.gray300
            : variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variant === 'outline' ? 2 : 0,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: DesignTokens.radius.md,
          width: fullWidth ? '100%' : 'auto',
          opacity: isDisabled ? 0.6 : 1,
        },
        DesignTokens.shadows.sm,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.textColor}
        />
      ) : (
        <Text
          style={{
            color: variantStyles.textColor,
            fontSize: sizeStyles.fontSize,
            fontWeight: DesignTokens.typography.fontWeight.semibold,
            textAlign: 'center',
          }}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

