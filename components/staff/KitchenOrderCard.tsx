import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge, StatusBadgeType } from './StatusBadge';
import { DesignTokens } from '@/constants/design';
import { AlertCircle } from '@tamagui/lucide-icons';
import { XStack, YStack, Text, Button } from 'tamagui'

export interface KitchenOrderItem {
  quantity: number;
  name: string;
  modifications?: string;
}

export interface KitchenOrderCardProps {
  orderId: string;
  location: string;
  timeAgo: string;
  items: KitchenOrderItem[];
  status: 'pending' | 'preparing';
  urgency?: 'urgent';
  eta?: string;
  allergyAlert?: string;
  onStartPreparing?: () => void;
  onMarkComplete?: () => void;
}

/**
 * Kitchen Order Card Component
 * Used in Kitchen Orders screen to display orders with status and actions
 */
export function KitchenOrderCard({
  orderId,
  location,
  timeAgo,
  items,
  status,
  urgency,
  eta,
  allergyAlert,
  onStartPreparing,
  onMarkComplete,
}: KitchenOrderCardProps) {
  const statusBadgeType: StatusBadgeType =
    status === 'preparing' ? 'preparing' : urgency === 'urgent' ? 'urgent' : 'eta';

  const statusLabel =
    status === 'preparing'
      ? 'Preparing'
      : urgency === 'urgent'
        ? '<5 min'
        : eta
          ? `ETA: ${eta}`
          : 'Pending';

  return (
    <Card
      padding="md"
      backgroundColor={DesignTokens.colors.white[100]}
      borderRadius="md"
      shadow="md"
      style={{
        borderLeftWidth: urgency === 'urgent' ? 4 : 0,
        borderLeftColor:
          urgency === 'urgent' ? DesignTokens.colors.orange[500] : 'transparent',
      }}
    >
      <YStack gap="$3">
        {/* Order Header */}
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack gap="$1" flex={1}>
            <Text
              fontSize={DesignTokens.typography.fontSize['2xl']}
              fontWeight={DesignTokens.typography.fontWeight.bold}
              color={DesignTokens.colors.brown[900]}
            >
              Order #{orderId}
            </Text>
            <Text
              fontSize={DesignTokens.typography.fontSize.sm}
              color={DesignTokens.colors.lightBrown[500]}
            >
              {location} - {timeAgo}
            </Text>
          </YStack>
          <StatusBadge type={statusBadgeType} label={statusLabel} />
        </XStack>

        {/* Divider */}
        <XStack
          height={1}
          backgroundColor={DesignTokens.colors.beige[300]}
          width="100%"
        />

        {/* Order Items */}
        <YStack gap="$1.5">
          {items.map((item, index) => (
            <Text
              key={index}
              fontSize={DesignTokens.typography.fontSize.md}
              color={DesignTokens.colors.brown[900]}
            >
              {item.quantity}x {item.name}
              {item.modifications && (
                <Text color={DesignTokens.colors.lightBrown[500]}>
                  {' '}({item.modifications})
                </Text>
              )}
            </Text>
          ))}
        </YStack>

        {/* Allergy Alert */}
        {allergyAlert && (
          <XStack
            alignItems="center"
            gap="$2"
            padding="$2"
            backgroundColor="#DBEAFE" // Light blue
            borderRadius={DesignTokens.radius.md}
          >
            <AlertCircle size={18} color="#2563EB" />
            <Text
              fontSize={DesignTokens.typography.fontSize.sm}
              fontWeight={DesignTokens.typography.fontWeight.semibold}
              color="#2563EB"
              flex={1}
            >
              Allergy: {allergyAlert}
            </Text>
          </XStack>
        )}

        {/* Action Button */}
        {status === 'pending' && onStartPreparing ? (
          <Button
            onPress={onStartPreparing}
            style={{
              backgroundColor: DesignTokens.colors.primary.blue,
            }}
          >
            <Text color={DesignTokens.colors.white[100]} fontWeight="600">
              Start Preparing
            </Text>
          </Button>
        ) : status === 'preparing' && onMarkComplete ? (
          <Button
            onPress={onMarkComplete}
          >
            <Text color={DesignTokens.colors.white[100]} fontWeight="600">
              Mark Complete
            </Text>
          </Button>
        ) : null}
      </YStack>
    </Card>
  );
}
