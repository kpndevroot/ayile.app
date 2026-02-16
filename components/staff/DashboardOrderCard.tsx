import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { DesignTokens } from '@/constants/design';
import { Card } from '@/components/ui/Card';
import { StaffOrder } from '@/services/staffService';
import { DollarSign, Check } from '@tamagui/lucide-icons';

interface DashboardOrderCardProps {
  order: StaffOrder;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onViewDetails: (orderId: string) => void;
  onMarkAsPaid?: (orderId: string, isPaid: boolean) => Promise<void>;
}

/**
 * Dashboard Order Card Component
 * Enhanced with improved touch targets, visual hierarchy, and accessibility
 */
export function DashboardOrderCard({
  order,
  onAccept,
  onReject,
  onViewDetails,
  onMarkAsPaid,
}: DashboardOrderCardProps) {
  const isPaid = order.paymentStatus === 'COMPLETED' || order.paymentStatus === 'PAID';

  const handleTogglePayment = () => {
    if (!onMarkAsPaid) return;

    const newIsPaid = !isPaid;
    Alert.alert(
      newIsPaid ? 'Mark as Paid' : 'Mark as Not Paid',
      `Are you sure you want to mark this order as ${newIsPaid ? 'Paid' : 'Not Paid'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await onMarkAsPaid(order.id, newIsPaid);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update payment status');
            }
          },
        },
      ]
    );
  };

  return (
    <Card
      padding="lg"
      backgroundColor={DesignTokens.colors.neutral.white}
      borderRadius="lg"
      shadow="sm"
      style={{
        shadowColor: DesignTokens.colors.brown[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <YStack gap="$4">
        {/* Header - Enhanced visual hierarchy */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" gap="$3">
            <XStack
              width={20}
              height={20}
              borderRadius={DesignTokens.radius.full}
              backgroundColor={order.statusColor}
              style={{
                shadowColor: order.statusColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 2,
              }}
            />
            <Text
              fontSize={17}
              fontWeight="700"
              color={DesignTokens.colors.brown[900]}
            >
              Order #{order.orderNumber}
            </Text>
          </XStack>
          <Text
            fontSize={13}
            color={DesignTokens.colors.lightBrown[500]}
            fontWeight="600"
          >
            {order.timeAgo}
          </Text>
        </XStack>

        {/* Location and Items Info */}
        <YStack gap="$2">
          <Text
            fontSize={14}
            color={DesignTokens.colors.lightBrown[600]}
            fontWeight="500"
          >
            {order.location}
          </Text>
          <XStack justifyContent="space-between" alignItems="center">
            <Text
              fontSize={15}
              color={DesignTokens.colors.brown[900]}
              fontWeight="700"
            >
              {order.itemsCount} items
            </Text>
            {/* Payment Status Badge - Enhanced visibility */}
            <XStack
              alignItems="center"
              gap="$2"
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius={DesignTokens.radius.md}
              backgroundColor={isPaid ? '#ECFDF5' : '#FFF7ED'}
              borderWidth={2}
              borderColor={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[400]}
              style={{
                shadowColor: isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[500],
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {isPaid ? (
                <Check size={16} color={DesignTokens.colors.semantic.success} strokeWidth={3} />
              ) : (
                <DollarSign size={16} color={DesignTokens.colors.orange[600]} />
              )}
              <Text
                fontSize={13}
                color={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[700]}
                fontWeight="700"
              >
                {isPaid ? 'Paid' : 'Not Paid'}
              </Text>
            </XStack>
          </XStack>
        </YStack>

        {/* Action Buttons - Enhanced touch targets */}
        {order.status === 'pending' && (
          <XStack gap="$3" marginTop="$2">
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => onReject(order.id)}
              activeOpacity={0.7}
            >
              <XStack
                flex={1}
                minHeight={56}
                paddingVertical="$3"
                paddingHorizontal="$4"
                borderRadius={12}
                backgroundColor={DesignTokens.colors.semantic.error}
                alignItems="center"
                justifyContent="center"
                style={{
                  shadowColor: DesignTokens.colors.semantic.error,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <Text
                  color={DesignTokens.colors.neutral.white}
                  fontWeight="700"
                  fontSize={16}
                  letterSpacing={0.5}
                >
                  Reject
                </Text>
              </XStack>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => onAccept(order.id)}
              activeOpacity={0.7}
            >
              <XStack
                flex={1}
                minHeight={56}
                paddingVertical="$3"
                paddingHorizontal="$4"
                borderRadius={12}
                backgroundColor={DesignTokens.colors.orange[500]}
                alignItems="center"
                justifyContent="center"
                style={{
                  shadowColor: DesignTokens.colors.orange[500],
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <Text
                  color={DesignTokens.colors.neutral.white}
                  fontWeight="700"
                  fontSize={16}
                  letterSpacing={0.5}
                >
                  Accept
                </Text>
              </XStack>
            </TouchableOpacity>
          </XStack>
        )}

        {order.status !== 'pending' && (
          <XStack gap="$3" marginTop="$2">
            {/* Mark as Paid Button - Enhanced visibility */}
            {onMarkAsPaid && (
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={handleTogglePayment}
                activeOpacity={0.7}
              >
                <XStack
                  flex={1}
                  minHeight={56}
                  paddingVertical="$3"
                  paddingHorizontal="$3"
                  borderRadius={12}
                  backgroundColor={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[500]}
                  alignItems="center"
                  justifyContent="center"
                  gap="$3"
                  style={{
                    shadowColor: isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[500],
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  {isPaid ? (
                    <>
                      <Check size={20} color="#FFFFFF" strokeWidth={3} />
                      <Text
                        color="#FFFFFF"
                        fontWeight="700"
                        fontSize={15}
                        letterSpacing={0.5}
                      >
                        PAID
                      </Text>
                    </>
                  ) : (
                    <>
                      <DollarSign size={20} color="#FFFFFF" />
                      <Text
                        color="#FFFFFF"
                        fontWeight="700"
                        fontSize={14}
                        letterSpacing={0.3}
                      >
                        MARK PAID
                      </Text>
                    </>
                  )}
                </XStack>
              </TouchableOpacity>
            )}
            {/* View Details Button - Enhanced styling */}
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => onViewDetails(order.id)}
              activeOpacity={0.7}
            >
              <XStack
                flex={1}
                minHeight={56}
                paddingVertical="$3"
                paddingHorizontal="$3"
                borderRadius={12}
                borderWidth={2}
                borderColor={DesignTokens.colors.orange[500]}
                backgroundColor={DesignTokens.colors.neutral.white}
                alignItems="center"
                justifyContent="center"
                style={{
                  shadowColor: DesignTokens.colors.orange[500],
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text
                  color={DesignTokens.colors.orange[600]}
                  fontWeight="700"
                  fontSize={15}
                  letterSpacing={0.5}
                >
                  View Details
                </Text>
              </XStack>
            </TouchableOpacity>
          </XStack>
        )}
      </YStack>
    </Card>
  );
}
