import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { DesignTokens } from '@/constants/design';
import { Card } from '@/components/ui/Card';
import { StaffOrder } from '@/services/staffService';
import { CreditCard, Check } from '@tamagui/lucide-icons';

interface DashboardOrderCardProps {
  order: StaffOrder;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onViewDetails: (orderId: string) => void;
  onMarkAsPaid?: (orderId: string, isPaid: boolean) => Promise<void>;
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
        <XStack justifyContent="space-between" alignItems="center">
          <Text
            fontSize={DesignTokens.typography.fontSize.sm}
            color={DesignTokens.colors.lightBrown[500]}
          >
            {order.itemsCount} items
          </Text>
          {/* Payment Status Badge */}
          <XStack
            alignItems="center"
            space="$1"
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius={DesignTokens.radius.md}
            backgroundColor={isPaid ? '#ECFDF5' : '#FFF7ED'}
            borderWidth={1}
            borderColor={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[300]}
          >
            {isPaid ? (
              <Check size={14} color={DesignTokens.colors.semantic.success} />
            ) : (
              <CreditCard size={14} color={DesignTokens.colors.orange[600]} />
            )}
            <Text
              fontSize={DesignTokens.typography.fontSize.xs}
              color={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[600]}
              fontWeight="600"
            >
              {isPaid ? 'Paid' : 'Not Paid'}
            </Text>
          </XStack>
        </XStack>
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
                backgroundColor={DesignTokens.colors.orange[500]}
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
          <XStack space="$2" marginTop="$2">
            {/* Mark as Paid Button - Always visible for better UX */}
            {onMarkAsPaid && (
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={handleTogglePayment}
                activeOpacity={0.8}
              >
                <XStack
                  flex={1}
                  paddingVertical="$3"
                  paddingHorizontal="$3"
                  borderRadius={DesignTokens.radius.md}
                  backgroundColor={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[500]}
                  alignItems="center"
                  justifyContent="center"
                  space="$2"
                  style={{
                    shadowColor: isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[500],
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  {isPaid ? (
                    <>
                      <Check size={18} color="#FFFFFF" strokeWidth={3} />
                      <Text
                        color="#FFFFFF"
                        fontWeight={DesignTokens.typography.fontWeight.bold}
                        fontSize={DesignTokens.typography.fontSize.sm}
                      >
                        PAID
                      </Text>
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} color="#FFFFFF" />
                      <Text
                        color="#FFFFFF"
                        fontWeight={DesignTokens.typography.fontWeight.bold}
                        fontSize={DesignTokens.typography.fontSize.sm}
                      >
                        MARK AS PAID
                      </Text>
                    </>
                  )}
                </XStack>
              </TouchableOpacity>
            )}
            {/* View Details Button */}
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => onViewDetails(order.id)}
              activeOpacity={0.8}
            >
              <XStack
                flex={1}
                paddingVertical="$3"
                paddingHorizontal="$3"
                borderRadius={DesignTokens.radius.md}
                borderWidth={1.5}
                borderColor={DesignTokens.colors.orange[500]}
                backgroundColor="transparent"
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  color={DesignTokens.colors.orange[500]}
                  fontWeight={DesignTokens.typography.fontWeight.semibold}
                  fontSize={DesignTokens.typography.fontSize.sm}
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
