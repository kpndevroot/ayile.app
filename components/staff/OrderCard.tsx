import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
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
 * Enhanced with improved touch targets, visual hierarchy, and accessibility
 */
const OrderCard = React.memo(function OrderCard({
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
      style={{
        shadowColor: DesignTokens.colors.brown[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <YStack space="$4">
        {/* Order Header - Enhanced visual hierarchy */}
        <XStack justifyContent="space-between" alignItems="center">
          <YStack space="$1" flex={1}>
            <Text
              fontSize={18}
              fontWeight="700"
              color={DesignTokens.colors.brown[900]}
            >
              {orderId}
            </Text>
            <Text
              fontSize={13}
              color={DesignTokens.colors.lightBrown[500]}
              fontWeight="500"
            >
              {timeAgo}
            </Text>
          </YStack>
          <XStack space="$2">
            <YStack
              backgroundColor={DesignTokens.colors.teal[500]}
              borderRadius={DesignTokens.radius.md}
              width={48}
              height={48}
              alignItems="center"
              justifyContent="center"
              style={{
                shadowColor: DesignTokens.colors.teal[500],
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Bike size={24} color="#FFFFFF" />
            </YStack>
            {isCOD && (
              <YStack
                backgroundColor={DesignTokens.colors.orange[500]}
                borderRadius={DesignTokens.radius.md}
                width={48}
                height={48}
                alignItems="center"
                justifyContent="center"
                style={{
                  shadowColor: DesignTokens.colors.orange[500],
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Wallet size={24} color="#FFFFFF" />
              </YStack>
            )}
          </XStack>
        </XStack>

        {/* Customer Info - Improved layout */}
        <YStack space="$3">
          <XStack alignItems="center" space="$3" justifyContent="space-between">
            <Text
              fontSize={16}
              fontWeight="700"
              color={DesignTokens.colors.brown[900]}
              flex={1}
            >
              {customerName}
            </Text>
            {phoneNumber && onCall && (
              <TouchableOpacity onPress={onCall} activeOpacity={0.7}>
                <XStack
                  width={48}
                  height={48}
                  borderRadius={DesignTokens.radius.md}
                  backgroundColor={DesignTokens.colors.semantic.success}
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    shadowColor: DesignTokens.colors.semantic.success,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Phone size={24} color="#FFFFFF" />
                </XStack>
              </TouchableOpacity>
            )}
          </XStack>
          {deliveryAddress && (
            <XStack justifyContent="space-between" alignItems="center" space="$2">
              <XStack flex={1} alignItems="center" space="$2">
                <MapPin size={16} color={DesignTokens.colors.lightBrown[500]} />
                <Text
                  fontSize={14}
                  color={DesignTokens.colors.lightBrown[600]}
                  flex={1}
                  numberOfLines={2}
                >
                  {deliveryAddress}
                </Text>
              </XStack>
              {onViewMap && (
                <TouchableOpacity onPress={onViewMap} activeOpacity={0.7}>
                  <XStack
                    alignItems="center"
                    space="$1"
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius={DesignTokens.radius.md}
                    backgroundColor={DesignTokens.colors.teal[50]}
                  >
                    <Text
                      fontSize={13}
                      color={DesignTokens.colors.teal[600]}
                      fontWeight="700"
                    >
                      Map
                    </Text>
                    <Send size={14} color={DesignTokens.colors.teal[600]} />
                  </XStack>
                </TouchableOpacity>
              )}
            </XStack>
          )}
        </YStack>

        {/* Order Details Grid - Enhanced spacing */}
        <XStack
          space="$3"
          paddingVertical="$3"
          paddingHorizontal="$3"
          backgroundColor={DesignTokens.colors.beige[50]}
          borderRadius={DesignTokens.radius.md}
        >
          <YStack flex={1}>
            <Text
              fontSize={12}
              color={DesignTokens.colors.lightBrown[500]}
              fontWeight="600"
              marginBottom="$1"
            >
              Payment
            </Text>
            <Text
              fontSize={15}
              fontWeight="700"
              color={
                isCOD
                  ? DesignTokens.colors.orange[600]
                  : DesignTokens.colors.semantic.success
              }
            >
              {isCOD ? 'COD' : 'Paid'}
            </Text>
            <Text
              fontSize={16}
              fontWeight="700"
              color={DesignTokens.colors.brown[900]}
            >
              {paymentAmount}
            </Text>
          </YStack>
          <YStack flex={1}>
            <Text
              fontSize={12}
              color={DesignTokens.colors.lightBrown[500]}
              fontWeight="600"
              marginBottom="$1"
            >
              Items
            </Text>
            <Text
              fontSize={16}
              fontWeight="700"
              color={DesignTokens.colors.brown[900]}
            >
              {itemsCount}
            </Text>
          </YStack>
          {estimatedDelivery && (
            <YStack flex={1}>
              <Text
                fontSize={12}
                color={DesignTokens.colors.lightBrown[500]}
                fontWeight="600"
                marginBottom="$1"
              >
                Est. Time
              </Text>
              <Text
                fontSize={15}
                fontWeight="700"
                color={DesignTokens.colors.brown[900]}
              >
                {estimatedDelivery}
              </Text>
            </YStack>
          )}
        </XStack>

        {/* Special Instructions - Enhanced visibility */}
        {specialInstructions && (
          <YStack
            space="$2"
            padding="$3"
            backgroundColor={DesignTokens.colors.orange[50]}
            borderRadius={DesignTokens.radius.md}
            borderWidth={1}
            borderColor={DesignTokens.colors.orange[200]}
          >
            <Text
              fontSize={13}
              fontWeight="700"
              color={DesignTokens.colors.orange[700]}
            >
              Special Instructions
            </Text>
            <Text
              fontSize={14}
              color={DesignTokens.colors.brown[800]}
              fontStyle="italic"
              lineHeight={20}
            >
              "{specialInstructions}"
            </Text>
          </YStack>
        )}

        {/* Action Button - Enhanced touch target */}
        {showDeliveryActions && onPickUp && (
          <Button
            onPress={onPickUp}
            style={{
              backgroundColor: DesignTokens.colors.teal[500],
              width: '100%',
              minHeight: 56,
              borderRadius: 12,
              shadowColor: DesignTokens.colors.teal[500],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text color="#FFFFFF" fontWeight="700" fontSize={16} letterSpacing={0.5}>
              Pick Up & Start Delivery
            </Text>
          </Button>
        )}
      </YStack>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.orderId === nextProps.orderId &&
    prevProps.timeAgo === nextProps.timeAgo &&
    prevProps.customerName === nextProps.customerName &&
    prevProps.paymentMethod === nextProps.paymentMethod &&
    prevProps.paymentAmount === nextProps.paymentAmount &&
    prevProps.itemsCount === nextProps.itemsCount &&
    prevProps.specialInstructions === nextProps.specialInstructions
  );
});

export { OrderCard };
