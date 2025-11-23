import React from 'react';
import { View, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { DesignTokens } from '@/constants/design';
import { Button } from './Button';

interface PromotionalBannerProps {
  title: string;
  subtitle?: string;
  image?: ImageSourcePropType;
  onPress?: () => void;
  backgroundColor?: string;
}

/**
 * Promotional Banner Component
 * Eye-catching promotional cards with images
 */
export function PromotionalBanner({
  title,
  subtitle,
  image,
  onPress,
  backgroundColor = DesignTokens.colors.primary.orange,
}: PromotionalBannerProps) {
  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor,
          borderRadius: DesignTokens.radius.lg,
          padding: DesignTokens.spacing.lg,
        },
        DesignTokens.shadows.md,
      ]}
    >
      <XStack gap="$4" alignItems="center">
        <YStack flex={1} gap="$2">
          <Text
            style={{
              fontSize: DesignTokens.typography.fontSize['2xl'],
              fontWeight: DesignTokens.typography.fontWeight.bold,
              color: DesignTokens.colors.white,
              lineHeight: DesignTokens.typography.lineHeight.tight * DesignTokens.typography.fontSize['2xl'],
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontSize: DesignTokens.typography.fontSize.md,
                color: DesignTokens.colors.white,
                opacity: 0.9,
              }}
            >
              {subtitle}
            </Text>
          )}
          {onPress && (
            <View style={{ marginTop: DesignTokens.spacing.sm }}>
              <Button
                variant="secondary"
                size="sm"
                onPress={onPress}
                style={{ alignSelf: 'flex-start' }}
              >
                Learn More
              </Button>
            </View>
          )}
        </YStack>
        {image && (
          <View style={styles.imageContainer}>
            <Image
              source={image}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}
      </XStack>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    overflow: 'hidden',
  },
  imageContainer: {
    width: 120,
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

