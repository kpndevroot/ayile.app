import React from 'react';
import { YStack, XStack, Text, Button } from '@tamagui/core';
import { Card } from '@/components/ui/Card';
import { DesignTokens } from '@/constants/design';
import { Phone, MapPin, Bike, Wallet, Send } from '@tamagui/lucide-icons';

export interface OrderCardProps {
  orderId: string;
  timeAgo: string;
  customerName: string;
  phoneNumber?: string;
  deliveryAddress?: string;
  paymentMethod: 'COD' | 'PAID';
  paymentAmount: string;
  itemsCount: number;
  estimatedDelivery?: string;
  specialInstructions?: string;
  onCall?: () => void;
  onViewMap?: () => void;
  onPickUp?: () => void;
  showDeliveryActions?: boolean;
}

/**
 * Reusable Order Card Component
 * Used in Ready for Delivery and other order listing screens
 */
export function OrderCard({
  orderId,
  timeAgo,
  customerName,
  phoneNumber,
  deliveryAddress,
  paymentMethod,
  paymentAmount,
  itemsCount,
  estimatedDelivery,
  specialInstructions,
  onCall,
  onViewMap,
  onPickUp,
  showDeliveryActions = true,
}: OrderCardProps) {
  const isCOD = paymentMethod === 'COD';

  return (
    <Card
      padding="md"
      backgroundColor={DesignTokens.colors.background.card}
      borderRadius="md"
      shadow="md"
    >
      <YStack space="$2">
        {/* Order Header */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack space="$2" alignItems="center">
            <Text
              fontSize={DesignTokens.typography.fontSize.lg}
              fontWeight={DesignTokens.typography.fontWeight.bold}
              color={DesignTokens.colors.brown[900]}
            >
              {orderId}
            </Text>
            <Text
              fontSize={DesignTokens.typography.fontSize.sm}
              color={DesignTokens.colors.lightBrown[500]}
            >
              {timeAgo}
            </Text>
          </XStack>
          <XStack space="$2">
            <YStack
              backgroundColor={DesignTokens.colors.teal[500]}
              borderRadius={DesignTokens.radius.full}
              width={32}
              height={32}
              alignItems="center"
              justifyContent="center"
            >
              <Bike size={18} color={DesignTokens.colors.white} />
            </YStack>
            {isCOD && (
              <YStack
                backgroundColor={DesignTokens.colors.orange[500]}
                borderRadius={DesignTokens.radius.full}
                width={32}
                height={32}
                alignItems="center"
                justifyContent="center"
              >
                <Wallet size={18} color={DesignTokens.colors.white} />
              </YStack>
            )}
          </XStack>
        </XStack>

        {/* Customer Info */}
        <YStack space="$1">
          <XStack alignItems="center" space="$2">
            <Text
              fontSize={DesignTokens.typography.fontSize.md}
              fontWeight={DesignTokens.typography.fontWeight.semibold}
              color={DesignTokens.colors.brown[900]}
            >
              {customerName}
            </Text>
            {phoneNumber && (
              <Phone
                size={18}
                color={DesignTokens.colors.semantic.success}
                onPress={onCall}
              />
            )}
          </XStack>
          {deliveryAddress && (
            <XStack justifyContent="space-between" alignItems="center">
              <Text
                fontSize={DesignTokens.typography.fontSize.sm}
                color={DesignTokens.colors.lightBrown[500]}
                flex={1}
              >
                {deliveryAddress}
              </Text>
              {onViewMap && (
                <XStack
                  alignItems="center"
                  space="$1"
                  onPress={onViewMap}
                  cursor="pointer"
                >
                  <Text
                    fontSize={DesignTokens.typography.fontSize.sm}
                    color={DesignTokens.colors.teal[500]}
                    fontWeight={DesignTokens.typography.fontWeight.semibold}
                  >
                    Map
                  </Text>
                  <Send size={14} color={DesignTokens.colors.teal[500]} />
                </XStack>
              )}
            </XStack>
          )}
        </YStack>

        {/* Order Details Grid */}
        <XStack space="$4" flexWrap="wrap">
          <YStack flex={1} minWidth="30%">
            <Text
              fontSize={DesignTokens.typography.fontSize.xs}
              color={DesignTokens.colors.lightBrown[500]}
            >
              Payment
            </Text>
            <Text
              fontSize={DesignTokens.typography.fontSize.sm}
              fontWeight={DesignTokens.typography.fontWeight.bold}
              color={
                isCOD
                  ? DesignTokens.colors.orange[500]
                  : DesignTokens.colors.semantic.success
              }
            >
              {isCOD ? 'COD: ' : 'Paid: '}
              {paymentAmount}
            </Text>
          </YStack>
          <YStack flex={1} minWidth="30%">
            <Text
              fontSize={DesignTokens.typography.fontSize.xs}
              color={DesignTokens.colors.lightBrown[500]}
            >
              Items
            </Text>
            <Text
              fontSize={DesignTokens.typography.fontSize.sm}
              fontWeight={DesignTokens.typography.fontWeight.bold}
              color={DesignTokens.colors.brown[900]}
            >
              {itemsCount} items
            </Text>
          </YStack>
          {estimatedDelivery && (
            <YStack flex={1} minWidth="30%">
              <Text
                fontSize={DesignTokens.typography.fontSize.xs}
                color={DesignTokens.colors.lightBrown[500]}
              >
                Est. Delivery
              </Text>
              <Text
                fontSize={DesignTokens.typography.fontSize.sm}
                fontWeight={DesignTokens.typography.fontWeight.bold}
                color={DesignTokens.colors.brown[900]}
              >
                {estimatedDelivery}
              </Text>
            </YStack>
          )}
        </XStack>

        {/* Special Instructions */}
        {specialInstructions && (
          <YStack space="$1">
            <Text
              fontSize={DesignTokens.typography.fontSize.sm}
              fontWeight={DesignTokens.typography.fontWeight.semibold}
              color={DesignTokens.colors.brown[900]}
            >
              Special Instructions:
            </Text>
            <Text
              fontSize={DesignTokens.typography.fontSize.sm}
              color={DesignTokens.colors.brown[700]}
            >
              {specialInstructions}
            </Text>
          </YStack>
        )}

        {/* Action Button */}
        {showDeliveryActions && onPickUp && (
          <Button
            onPress={onPickUp}
            variant="primary"
            fullWidth
            style={{
              backgroundColor: DesignTokens.colors.teal[500],
            }}
          >
            <Text color={DesignTokens.colors.white} fontWeight="600">
              Pick Up & Start Delivery
            </Text>
          </Button>
        )}
      </YStack>
    </Card>
  );
}
