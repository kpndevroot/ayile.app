import React from 'react';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { DesignTokens } from '@/constants/design';
import { Card } from '@/components/ui/Card';
import { StaffOrder } from '@/services/staffService';
import { DashboardOrderCard } from './DashboardOrderCard';
import { TabType } from './TabNavigation';

interface OrdersListProps {
  orders: StaffOrder[];
  activeTab: TabType;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onViewDetails: (orderId: string) => void;
  onMarkAsPaid?: (orderId: string, isPaid: boolean) => Promise<void>;
}

/**
 * Orders List Component
 * Displays a list of orders with empty state handling
 */
export function OrdersList({
  orders,
  activeTab,
  onAccept,
  onReject,
  onViewDetails,
  onMarkAsPaid,
}: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <Card
        padding="lg"
        backgroundColor={DesignTokens.colors.neutral.white}
        borderRadius="lg"
        shadow="sm"
      >
        <YStack alignItems="center" space="$2">
          <Text
            fontSize={DesignTokens.typography.fontSize.lg}
            color={DesignTokens.colors.brown[700]}
            fontWeight={DesignTokens.typography.fontWeight.semibold}
          >
            No {activeTab} orders
          </Text>
          <Text
            fontSize={DesignTokens.typography.fontSize.sm}
            color={DesignTokens.colors.lightBrown[500]}
            textAlign="center"
          >
            {activeTab === 'pending' && 'No pending orders at the moment.'}
            {activeTab === 'active' && 'No active orders at the moment.'}
            {activeTab === 'history' && 'No completed orders yet.'}
          </Text>
        </YStack>
      </Card>
    );
  }

  return (
    <YStack space="$3">
      {orders.map((order) => (
        <DashboardOrderCard
          key={order.id}
          order={order}
          onAccept={onAccept}
          onReject={onReject}
          onViewDetails={onViewDetails}
          onMarkAsPaid={onMarkAsPaid}
        />
      ))}
    </YStack>
  );
}
