import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle, Image } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import * as LucideIcons from '@tamagui/lucide-icons';
import { DesignTokens } from '@/constants/design';
import { Badge } from '@/components/ui/Badge';

interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description?: string;
    category: string;
    price: string;
    imageUrl?: string;
    isAvailable: boolean;
    preparationTime?: number;
  };
  orderQuantity: number;
  onAdd: () => void;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
}

/**
 * Menu Item Card Component
 * Clean, modern card design with improved spacing and hierarchy
 */
export function MenuItemCard({
  item,
  orderQuantity,
  onAdd,
  onUpdate,
  onRemove,
}: MenuItemCardProps) {
  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getCategoryIcon = (category: string) => {
    const categoryUpper = category.toUpperCase();
    
    // Map categories to Lucide icons
    if (categoryUpper.includes('APPETIZER') || categoryUpper.includes('STARTER') || categoryUpper.includes('SNACK')) {
      return LucideIcons.Cookie;
    }
    if (categoryUpper.includes('MAIN') || categoryUpper.includes('ENTREE')) {
      return LucideIcons.ChefHat;
    }
    if (categoryUpper.includes('DESSERT') || categoryUpper.includes('SWEET')) {
      return LucideIcons.IceCream;
    }
    if (categoryUpper.includes('BEVERAGE') || categoryUpper.includes('DRINK') || categoryUpper.includes('JUICE')) {
      return LucideIcons.Coffee;
    }
    if (categoryUpper.includes('SOUP')) {
      return LucideIcons.Soup;
    }
    if (categoryUpper.includes('SALAD')) {
      return LucideIcons.Salad;
    }
    if (categoryUpper.includes('PIZZA')) {
      return LucideIcons.Pizza;
    }
    if (categoryUpper.includes('BURGER') || categoryUpper.includes('SANDWICH')) {
      return LucideIcons.Sandwich;
    }
    if (categoryUpper.includes('SIDE') || categoryUpper.includes('ACCOMPANIMENT')) {
      return LucideIcons.UtensilsCrossed;
    }
    if (categoryUpper.includes('BREAKFAST')) {
      return LucideIcons.Sunrise;
    }
    if (categoryUpper.includes('LUNCH')) {
      return LucideIcons.Sun;
    }
    if (categoryUpper.includes('DINNER')) {
      return LucideIcons.Moon;
    }
    
    // Default icon for unknown categories
    return LucideIcons.Utensils;
  };

  return (
    <YStack
      padding={DesignTokens.spacing.md}
      backgroundColor={DesignTokens.colors.neutral.white}
      borderRadius={DesignTokens.radius.lg}
      style={[
        styles.card,
        {
          // Remove all shadows completely - use subtle border instead
          borderWidth: 1,
          borderColor: DesignTokens.colors.neutral.gray200,
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        },
        orderQuantity > 0 && {
          borderWidth: 2,
          borderColor: DesignTokens.colors.primary.green,
        },
      ].filter(Boolean) as ViewStyle[]}
    >
      <YStack gap="$3">
        {/* Main Content Section with Image */}
        <XStack gap="$3" alignItems="center">
          {/* Image/Icon Section - Left Center */}
          <YStack
            padding="$2"
            alignItems="center"
            justifyContent="center"
            style={styles.imageContainer}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <YStack
                alignItems="center"
                justifyContent="center"
                style={styles.iconContainer}
              >
                {React.createElement(getCategoryIcon(item.category), {
                  size: 48,
                  color: DesignTokens.colors.primary.orange,
                })}
              </YStack>
            )}
          </YStack>

          {/* Content Section - Right */}
          <YStack flex={1} gap="$2">
            {/* Header Section */}
            <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
              <YStack flex={1} gap="$2">
                <XStack gap="$2" alignItems="center" flexWrap="wrap">
                  <Text
                    style={{
                      fontSize: DesignTokens.typography.fontSize.lg,
                      fontWeight: DesignTokens.typography.fontWeight.bold,
                      color: DesignTokens.colors.neutral.gray900,
                      flex: 1,
                    }}
                  >
                    {item.name}
                  </Text>
                  {orderQuantity > 0 && (
                    <Badge variant="success" size="sm">
                      {orderQuantity} in cart
                    </Badge>
                  )}
                  {!item.isAvailable && (
                    <Badge variant="error" size="sm">
                      Unavailable
                    </Badge>
                  )}
                </XStack>

                {item.description && (
                  <Text
                    style={{
                      fontSize: DesignTokens.typography.fontSize.sm,
                      color: DesignTokens.colors.neutral.gray600,
                      lineHeight: DesignTokens.typography.lineHeight.relaxed * DesignTokens.typography.fontSize.sm,
                    }}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                )}

                {/* Category and Time */}
                <XStack gap="$2" alignItems="center" flexWrap="wrap">
                  <Badge variant="info" size="sm">
                    {formatCategory(item.category)}
                  </Badge>
                  {item.preparationTime && (
                    <Text
                      style={{
                        fontSize: DesignTokens.typography.fontSize.sm,
                        color: DesignTokens.colors.neutral.gray500,
                      }}
                    >
                      ⏱️ {item.preparationTime} min
                    </Text>
                  )}
                </XStack>
              </YStack>

              {/* Price */}
              <YStack alignItems="flex-end">
                <Text
                  style={{
                    fontSize: DesignTokens.typography.fontSize['2xl'],
                    fontWeight: DesignTokens.typography.fontWeight.bold,
                    color: DesignTokens.colors.primary.orange,
                  }}
                >
                  ₹{parseFloat(item.price).toFixed(2)}
                </Text>
              </YStack>
            </XStack>
          </YStack>
        </XStack>

        {/* Quantity Controls */}
        {orderQuantity > 0 ? (
          <XStack
            gap="$3"
            alignItems="center"
            justifyContent="flex-end"
            marginTop="$2"
            paddingTop="$3"
            borderTopWidth={1}
            borderTopColor={DesignTokens.colors.neutral.gray200}
          >
            <TouchableOpacity
              onPress={onRemove}
              disabled={!item.isAvailable}
              style={[
                styles.quantityButton,
                {
                  backgroundColor: DesignTokens.colors.semantic.error,
                  opacity: item.isAvailable ? 1 : 0.5,
                },
              ]}
            >
              <Text
                style={{
                  color: DesignTokens.colors.neutral.white,
                  fontSize: DesignTokens.typography.fontSize.xl,
                  fontWeight: DesignTokens.typography.fontWeight.bold,
                }}
              >
                −
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: DesignTokens.typography.fontSize.xl,
                fontWeight: DesignTokens.typography.fontWeight.bold,
                minWidth: 50,
                textAlign: 'center',
                color: DesignTokens.colors.neutral.gray900,
              }}
            >
              {orderQuantity}
            </Text>

            <TouchableOpacity
              onPress={() => onUpdate(orderQuantity + 1)}
              disabled={!item.isAvailable}
              style={[
                styles.quantityButton,
                {
                  backgroundColor: DesignTokens.colors.primary.green,
                  opacity: item.isAvailable ? 1 : 0.5,
                },
              ]}
            >
              <Text
                style={{
                  color: DesignTokens.colors.neutral.white,
                  fontSize: DesignTokens.typography.fontSize.xl,
                  fontWeight: DesignTokens.typography.fontWeight.bold,
                }}
              >
                +
              </Text>
            </TouchableOpacity>
          </XStack>
        ) : (
          <TouchableOpacity
            onPress={onAdd}
            disabled={!item.isAvailable}
            style={[
              styles.addButton,
              {
                backgroundColor: DesignTokens.colors.primary.orange,
                opacity: item.isAvailable ? 1 : 0.5,
              },
            ]}
          >
            <Text
              style={{
                color: DesignTokens.colors.neutral.white,
                fontSize: DesignTokens.typography.fontSize.md,
                fontWeight: DesignTokens.typography.fontWeight.semibold,
              }}
            >
              Add to Order
            </Text>
          </TouchableOpacity>
        )}
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: DesignTokens.spacing.md,
    // Ensure no shadows are applied
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: DesignTokens.radius.md,
    backgroundColor: DesignTokens.colors.neutral.gray100,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: DesignTokens.radius.md,
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: DesignTokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    paddingVertical: DesignTokens.spacing.md,
    paddingHorizontal: DesignTokens.spacing.lg,
    borderRadius: DesignTokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DesignTokens.spacing.sm,
  },
});

