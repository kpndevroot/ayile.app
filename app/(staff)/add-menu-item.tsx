import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from '@tamagui/lucide-icons';
import { DesignTokens } from '@/constants/design';
import { MenuItemForm } from '@/components/staff/MenuItemForm';

export default function AddMenuItemScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <YStack
      flex={1}
      backgroundColor={DesignTokens.colors.background.light}
      paddingTop={insets.top}
    >
      {/* Header */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
      >
        <XStack alignItems="center">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={DesignTokens.colors.brown[900]} />
          </TouchableOpacity>
          <Text
            fontSize={DesignTokens.typography.fontSize.xl}
            fontWeight={DesignTokens.typography.fontWeight.bold}
            color={DesignTokens.colors.brown[900]}
          >
            Add Menu Item
          </Text>
        </XStack>
      </XStack>

      <MenuItemForm
        mode="create"
        onSuccess={() => router.back()}
        onCancel={() => router.back()}
      />
    </YStack>
  );
}
