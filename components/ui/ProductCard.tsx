import React from 'react';
import { View, StyleSheet, Image, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { DesignTokens } from '@/constants/design';
import { Button } from './Button';

interface ProductCardProps {
  name: string;
  price: string;
  image?: ImageSourcePropType | string;
  description?: string;
  onPress?: () => void;
  onAddToCart?: () => void;
  showAddButton?: boolean;
}

/**
 * Product Card Component
 * Modern product card with image, name, price, and add button
 */
export function ProductCard({
  name,
  price,
  image,
  description,
  onPress,
  onAddToCart,
  showAddButton = true,
}: ProductCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.container}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: DesignTokens.colors.white,
            borderRadius: DesignTokens.radius.lg,
            padding: DesignTokens.spacing.md,
          },
          DesignTokens.shadows.md,
        ]}
      >
        <View style={styles.imageContainer}>
          {image && (
            <Image
              source={typeof image === 'string' ? { uri: image } : image}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </View>

        <YStack gap="$2" marginTop="$2">
          <Text
            style={{
              fontSize: DesignTokens.typography.fontSize.lg,
              fontWeight: DesignTokens.typography.fontWeight.semibold,
              color: DesignTokens.colors.neutral.gray900,
            }}
            numberOfLines={1}
          >
            {name}
          </Text>

          {description && (
            <Text
              style={{
                fontSize: DesignTokens.typography.fontSize.sm,
                color: DesignTokens.colors.neutral.gray600,
              }}
              numberOfLines={2}
            >
              {description}
            </Text>
          )}

          <XStack justifyContent="space-between" alignItems="center" marginTop="$1">
            <Text
              style={{
                fontSize: DesignTokens.typography.fontSize.xl,
                fontWeight: DesignTokens.typography.fontWeight.bold,
                color: DesignTokens.colors.primary.orange,
              }}
            >
              ${price}
            </Text>

            {showAddButton && onAddToCart && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onAddToCart();
                }}
                style={[
                  styles.addButton,
                  {
                    backgroundColor: DesignTokens.colors.primary.orange,
                    width: 36,
                    height: 36,
                    borderRadius: DesignTokens.radius.full,
                  },
                  DesignTokens.shadows.sm,
                ]}
              >
                <Text
                  style={{
                    color: DesignTokens.colors.white,
                    fontSize: DesignTokens.typography.fontSize.xl,
                    fontWeight: DesignTokens.typography.fontWeight.bold,
                  }}
                >
                  +
                </Text>
              </TouchableOpacity>
            )}
          </XStack>
        </YStack>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: DesignTokens.spacing.md,
  },
  card: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 140,
    borderRadius: DesignTokens.radius.md,
    overflow: 'hidden',
    backgroundColor: DesignTokens.colors.neutral.gray100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

