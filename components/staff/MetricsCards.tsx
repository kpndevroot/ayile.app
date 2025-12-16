import React from 'react';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { DesignTokens } from '@/constants/design';
import { Card } from '@/components/ui/Card';

export interface DashboardMetrics {
  pending: number;
  active: number;
  complete: number;
  revenue: string;
}

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

/**
 * Metrics Cards Component
 * Displays four metric cards: Pending, Active, Complete, and Revenue
 * Responsive 2x2 grid layout
 */
export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    { label: 'Pending', value: metrics.pending },
    { label: 'Active', value: metrics.active },
    { label: 'Complete', value: metrics.complete },
    { label: 'Revenue', value: metrics.revenue },
  ];

  return (
    <XStack flexWrap="wrap" gap="$3">
      {cards.map((card, index) => (
        <XStack key={card.label} flexBasis="48%" flexGrow={1}>
          <Card
            padding="lg"
            backgroundColor={DesignTokens.colors.beige[200]}
            borderRadius="lg"
            shadow="sm"
            style={{ flex: 1 }}
          >
            <YStack space="$1">
              <Text
                fontSize={DesignTokens.typography.fontSize.sm}
                color={DesignTokens.colors.brown[700]}
              >
                {card.label}
              </Text>
              <Text
                fontSize={DesignTokens.typography.fontSize['3xl']}
                fontWeight={DesignTokens.typography.fontWeight.bold}
                color={DesignTokens.colors.brown[900]}
              >
                {card.value}
              </Text>
            </YStack>
          </Card>
        </XStack>
      ))}
    </XStack>
  );
}
