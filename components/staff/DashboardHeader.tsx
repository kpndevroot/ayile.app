import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from '@tamagui/core';
import { XStack } from '@tamagui/stacks';
import { User } from '@tamagui/lucide-icons';
import { DesignTokens } from '@/constants/design';

interface DashboardHeaderProps {
  restaurantName: string;
  onProfilePress?: () => void;
}

/**
 * Dashboard Header Component
 * Displays restaurant name and user profile icon
 */
export function DashboardHeader({ restaurantName, onProfilePress }: DashboardHeaderProps) {
  return (
    <XStack
      paddingHorizontal="$4"
      paddingVertical="$3"
      justifyContent="space-between"
      alignItems="center"
    >
      <Text
        fontSize={DesignTokens.typography.fontSize['2xl']}
        fontWeight={DesignTokens.typography.fontWeight.bold}
        color={DesignTokens.colors.brown[900]}
      >
        {restaurantName}
      </Text>

      <TouchableOpacity onPress={onProfilePress}>
        <XStack
          backgroundColor={DesignTokens.colors.beige[300]}
          borderRadius={DesignTokens.radius.full}
          width={40}
          height={40}
          alignItems="center"
          justifyContent="center"
        >
          <User size={20} color={DesignTokens.colors.brown[700]} />
        </XStack>
      </TouchableOpacity>
    </XStack>
  );
}
