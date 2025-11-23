import React from 'react';
import { TextInput, StyleSheet, View, ViewStyle, TextInputProps } from 'react-native';
import { Text } from '@tamagui/core';
import { DesignTokens } from '@/constants/design';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

/**
 * Modern Input Component
 * Consistent input styling with labels and error states
 */
export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={{
            fontSize: DesignTokens.typography.fontSize.sm,
            fontWeight: DesignTokens.typography.fontWeight.semibold,
            color: DesignTokens.colors.neutral.gray700,
            marginBottom: DesignTokens.spacing.xs,
          }}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? DesignTokens.colors.semantic.error
              : DesignTokens.colors.neutral.gray300,
            borderWidth: 1,
            borderRadius: DesignTokens.radius.md,
            paddingHorizontal: DesignTokens.spacing.md,
            paddingVertical: DesignTokens.spacing.sm,
            backgroundColor: DesignTokens.colors.white,
          },
          leftIcon && { paddingLeft: DesignTokens.spacing.md },
          rightIcon && { paddingRight: DesignTokens.spacing.md },
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            {
              fontSize: DesignTokens.typography.fontSize.md,
              color: DesignTokens.colors.neutral.gray900,
              flex: 1,
            },
            style,
          ]}
          placeholderTextColor={DesignTokens.colors.neutral.gray400}
          {...props}
        />

        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>

      {(error || helperText) && (
        <Text
          style={{
            fontSize: DesignTokens.typography.fontSize.xs,
            color: error
              ? DesignTokens.colors.semantic.error
              : DesignTokens.colors.neutral.gray600,
            marginTop: DesignTokens.spacing.xs,
          }}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    padding: 0,
  },
  iconLeft: {
    marginRight: DesignTokens.spacing.sm,
  },
  iconRight: {
    marginLeft: DesignTokens.spacing.sm,
  },
});

