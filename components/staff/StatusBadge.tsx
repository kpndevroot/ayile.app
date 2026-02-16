import React from 'react';
import { XStack, Text } from '@tamagui/core';
import { DesignTokens } from '@/constants/design';
import { Flame, Clock } from '@tamagui/lucide-icons';

export type StatusBadgeType =
  | 'urgent'
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'eta'
  | 'complete';

export interface StatusBadgeProps {
  type: StatusBadgeType;
  label: string;
  icon?: React.ReactNode;
}

/**
 * Status Badge Component
 * Used to display order status, urgency, and ETA information
 */
export function StatusBadge({ type, label, icon }: StatusBadgeProps) {
  const getBadgeStyles = () => {
    switch (type) {
      case 'urgent':
        return {
          backgroundColor: DesignTokens.colors.orange[100],
          textColor: DesignTokens.colors.orange[700],
          iconColor: DesignTokens.colors.orange[700],
        };
      case 'pending':
        return {
          backgroundColor: DesignTokens.colors.beige[300],
          textColor: DesignTokens.colors.brown[700],
          iconColor: DesignTokens.colors.brown[700],
        };
      case 'preparing':
        return {
          backgroundColor: '#E9D5FF', // Light purple
          textColor: '#9333EA', // Purple
          iconColor: '#9333EA',
        };
      case 'ready':
        return {
          backgroundColor: DesignTokens.colors.semantic.success + '20',
          textColor: DesignTokens.colors.semantic.success,
          iconColor: DesignTokens.colors.semantic.success,
        };
      case 'eta':
        return {
          backgroundColor: DesignTokens.colors.beige[300],
          textColor: DesignTokens.colors.brown[700],
          iconColor: DesignTokens.colors.brown[700],
        };
      case 'complete':
        return {
          backgroundColor: DesignTokens.colors.semantic.success + '20',
          textColor: DesignTokens.colors.semantic.success,
          iconColor: DesignTokens.colors.semantic.success,
        };
      default:
        return {
          backgroundColor: DesignTokens.colors.beige[300],
          textColor: DesignTokens.colors.brown[700],
          iconColor: DesignTokens.colors.brown[700],
        };
    }
  };

  const styles = getBadgeStyles();
  const defaultIcon =
    type === 'urgent' ? (
      <Flame size={14} color={styles.iconColor} />
    ) : type === 'eta' ? (
      <Clock size={14} color={styles.iconColor} />
    ) : null;

  return (
    <XStack
      alignItems="center"
      gap="$1.5"
      paddingHorizontal="$2"
      paddingVertical="$1"
      borderRadius={DesignTokens.radius.full}
      backgroundColor={styles.backgroundColor}
    >
      {icon || defaultIcon}
      <Text
        fontSize={DesignTokens.typography.fontSize.xs}
        fontWeight={DesignTokens.typography.fontWeight.semibold}
        color={styles.textColor}
      >
        {label}
      </Text>
    </XStack>
  );
}
