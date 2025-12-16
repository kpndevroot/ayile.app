import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { DesignTokens } from '@/constants/design';
import { Card } from '@/components/ui/Card';
import { StaffOrder } from '@/services/staffService';

interface DashboardOrderCardProps {
  order: StaffOrder;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onViewDetails: (orderId: string) => void;
}

/**
 * Dashboard Order Card Component
 * Displays a single order card with status, details, and actions
 */
export function DashboardOrderCard({
  order,
  onAccept,
  onReject,
  onViewDetails,
}: DashboardOrderCardProps) {
  return (
    <Card
      padding="lg"
      backgroundColor={DesignTokens.colors.beige[200]}
      borderRadius="lg"
      shadow="sm"
    >
      <YStack space="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" space="$2">
            <XStack
              width={12}
              height={12}
              borderRadius={DesignTokens.radius.full}
              backgroundColor={order.statusColor}
            />
            <Text
              fontSize={DesignTokens.typography.fontSize.lg}
              fontWeight={DesignTokens.typography.fontWeight.bold}
              color={DesignTokens.colors.brown[900]}
            >
              Order #{order.orderNumber}
            </Text>
          </XStack>
          <Text
            fontSize={DesignTokens.typography.fontSize.sm}
            color={DesignTokens.colors.lightBrown[500]}
          >
            {order.timeAgo}
          </Text>
        </XStack>
        <Text
          fontSize={DesignTokens.typography.fontSize.sm}
          color={DesignTokens.colors.lightBrown[500]}
        >
          {order.location}
        </Text>
        <Text
          fontSize={DesignTokens.typography.fontSize.sm}
          color={DesignTokens.colors.lightBrown[500]}
        >
          {order.itemsCount} items
        </Text>
        {order.status === 'pending' && (
          <XStack space="$2" marginTop="$2">
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => onReject(order.id)}
            >
              <XStack
                flex={1}
                paddingVertical="$2"
                paddingHorizontal="$3"
                borderRadius={DesignTokens.radius.md}
                backgroundColor={DesignTokens.colors.semantic.error}
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  color={DesignTokens.colors.neutral.white}
                  fontWeight={DesignTokens.typography.fontWeight.semibold}
                >
                  Reject
                </Text>
              </XStack>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => onAccept(order.id)}
            >
              <XStack
                flex={1}
                paddingVertical="$2"
                paddingHorizontal="$3"
                borderRadius={DesignTokens.radius.md}
                backgroundColor={DesignTokens.colors.teal[500]}
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  color={DesignTokens.colors.neutral.white}
                  fontWeight={DesignTokens.typography.fontWeight.semibold}
                >
                  Accept
                </Text>
              </XStack>
            </TouchableOpacity>
          </XStack>
        )}
        {order.status !== 'pending' && (
          <TouchableOpacity onPress={() => onViewDetails(order.id)}>
            <XStack
              paddingVertical="$2"
              paddingHorizontal="$3"
              borderRadius={DesignTokens.radius.md}
              borderWidth={1}
              borderColor={DesignTokens.colors.teal[500]}
              backgroundColor="transparent"
              alignItems="center"
              justifyContent="center"
            >
              <Text
                color={DesignTokens.colors.teal[500]}
                fontWeight={DesignTokens.typography.fontWeight.semibold}
              >
                View Details
              </Text>
            </XStack>
          </TouchableOpacity>
        )}
      </YStack>
    </Card>
  );
}
