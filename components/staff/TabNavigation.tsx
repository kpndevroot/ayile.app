import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from '@tamagui/core';
import { XStack } from '@tamagui/stacks';
import { DesignTokens } from '@/constants/design';

export type TabType = 'pending' | 'active' | 'history';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingCount: number;
}

/**
 * Tab Navigation Component
 * Displays three tabs: Pending, Active, and History
 */
export function TabNavigation({ activeTab, onTabChange, pendingCount }: TabNavigationProps) {
  return (
    <XStack space="$2" alignItems="center" marginTop="$2">
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => onTabChange('pending')}
      >
        <XStack
          flex={1}
          paddingVertical="$3"
          paddingHorizontal="$4"
          borderRadius={DesignTokens.radius.md}
          backgroundColor={
            activeTab === 'pending'
              ? DesignTokens.colors.neutral.white
              : 'transparent'
          }
          position="relative"
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontSize={DesignTokens.typography.fontSize.md}
            fontWeight={
              activeTab === 'pending'
                ? DesignTokens.typography.fontWeight.bold
                : DesignTokens.typography.fontWeight.semibold
            }
            color={DesignTokens.colors.brown[900]}
          >
            Pending
          </Text>
          {activeTab === 'pending' && (
            <XStack
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              height={2}
              backgroundColor={DesignTokens.colors.teal[500]}
              borderRadius={DesignTokens.radius.full}
            />
          )}
          {activeTab === 'pending' && pendingCount > 0 && (
            <XStack
              position="absolute"
              top={-4}
              right={-4}
              backgroundColor={DesignTokens.colors.orange[500]}
              borderRadius={DesignTokens.radius.full}
              width={20}
              height={20}
              alignItems="center"
              justifyContent="center"
              zIndex={10}
            >
              <Text
                fontSize={DesignTokens.typography.fontSize.xs}
                color={DesignTokens.colors.neutral.white}
                fontWeight={DesignTokens.typography.fontWeight.bold}
              >
                {pendingCount}
              </Text>
            </XStack>
          )}
        </XStack>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => onTabChange('active')}
      >
        <XStack
          flex={1}
          paddingVertical="$3"
          paddingHorizontal="$4"
          borderRadius={DesignTokens.radius.md}
          backgroundColor={
            activeTab === 'active'
              ? DesignTokens.colors.neutral.white
              : 'transparent'
          }
          position="relative"
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontSize={DesignTokens.typography.fontSize.md}
            fontWeight={
              activeTab === 'active'
                ? DesignTokens.typography.fontWeight.bold
                : DesignTokens.typography.fontWeight.semibold
            }
            color={DesignTokens.colors.brown[900]}
          >
            Active
          </Text>
          {activeTab === 'active' && (
            <XStack
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              height={2}
              backgroundColor={DesignTokens.colors.teal[500]}
              borderRadius={DesignTokens.radius.full}
            />
          )}
        </XStack>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => onTabChange('history')}
      >
        <XStack
          flex={1}
          paddingVertical="$3"
          paddingHorizontal="$4"
          borderRadius={DesignTokens.radius.md}
          backgroundColor={
            activeTab === 'history'
              ? DesignTokens.colors.neutral.white
              : 'transparent'
          }
          position="relative"
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontSize={DesignTokens.typography.fontSize.md}
            fontWeight={
              activeTab === 'history'
                ? DesignTokens.typography.fontWeight.bold
                : DesignTokens.typography.fontWeight.semibold
            }
            color={DesignTokens.colors.brown[900]}
          >
            History
          </Text>
          {activeTab === 'history' && (
            <XStack
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              height={2}
              backgroundColor={DesignTokens.colors.teal[500]}
              borderRadius={DesignTokens.radius.full}
            />
          )}
        </XStack>
      </TouchableOpacity>
    </XStack>
  );
}
