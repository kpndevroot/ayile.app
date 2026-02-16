import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { DesignTokens } from '@/constants/design';

interface StaffTabItem {
  name: string;
  label: string;
  icon: string;
}

const STAFF_TABS: StaffTabItem[] = [
  { name: 'restaurant-settings', label: 'Restaurant', icon: 'store' },
  { name: 'dashboard', label: 'Orders', icon: 'receipt-long' },
];

export function StaffTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <XStack
        alignItems="center"
        justifyContent="space-around"
        backgroundColor={DesignTokens.colors.beige[50]}
        height={64}
        paddingHorizontal={20}
      >
        {STAFF_TABS.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const isFocused = state.index === routeIndex;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[routeIndex]?.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tab.label}
            >
              <YStack alignItems="center" gap="$1">
                <MaterialIcons
                  name={tab.icon as any}
                  size={26}
                  color={
                    isFocused
                      ? DesignTokens.colors.orange[500]
                      : DesignTokens.colors.charcoal[400]
                  }
                />
                <Text
                  fontSize={11}
                  fontWeight={isFocused ? '700' : '500'}
                  color={
                    isFocused
                      ? DesignTokens.colors.orange[500]
                      : DesignTokens.colors.charcoal[400]
                  }
                >
                  {tab.label}
                </Text>
              </YStack>
            </TouchableOpacity>
          );
        })}
      </XStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.beige[50],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.beige[200],
    ...DesignTokens.shadows.sm,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});
