import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
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
  /** Trigger a pulse animation on the Pending card. Increment to re-trigger. */
  pendingPulse?: number;
}

/**
 * Metrics Cards Component
 * Displays four metric cards: Pending, Active, Complete, and Revenue
 * Responsive 2x2 grid layout
 */
export function MetricsCards({ metrics, pendingPulse }: MetricsCardsProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pendingPulse && pendingPulse > 0) {
      // Scale pulse + background flash
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.97,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(bgAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(bgAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ]),
      ]).start();
    }
  }, [pendingPulse]);

  const pendingBg = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [DesignTokens.colors.neutral.white, DesignTokens.colors.orange[50]],
  });

  const pendingBorder = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', DesignTokens.colors.orange[300]],
  });

  const cards = [
    { label: 'Pending', value: metrics.pending },
    { label: 'Active', value: metrics.active },
    { label: 'Complete', value: metrics.complete },
    { label: 'Revenue', value: metrics.revenue },
  ];

  return (
    <XStack flexWrap="wrap" gap="$3">
      {cards.map((card) => {
        const isPending = card.label === 'Pending';

        const inner = (
          <Card
            padding="lg"
            backgroundColor={DesignTokens.colors.neutral.white}
            borderRadius="lg"
            shadow="sm"
            style={{ flex: 1 }}
          >
            <YStack gap="$1">
              <Text
                fontSize={DesignTokens.typography.fontSize.sm}
                color={DesignTokens.colors.brown[700]}
              >
                {card.label}
              </Text>
              <Text
                fontSize={DesignTokens.typography.fontSize['3xl']}
                fontWeight={DesignTokens.typography.fontWeight.bold}
                color={DesignTokens.colors.orange[500]}
              >
                {card.value}
              </Text>
            </YStack>
          </Card>
        );

        if (isPending) {
          return (
            <Animated.View
              key={card.label}
              style={{
                flexBasis: '48%',
                flexGrow: 1,
                transform: [{ scale: pulseAnim }],
              }}
            >
              <Animated.View
                style={{
                  flex: 1,
                  borderRadius: DesignTokens.radius.lg,
                  borderWidth: 2,
                  borderColor: pendingBorder,
                  backgroundColor: pendingBg,
                  overflow: 'hidden',
                }}
              >
                {inner}
              </Animated.View>
            </Animated.View>
          );
        }

        return (
          <XStack key={card.label} flexBasis="48%" flexGrow={1}>
            {inner}
          </XStack>
        );
      })}
    </XStack>
  );
}
