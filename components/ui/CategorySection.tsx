/**
 * Category Section Component
 * Enhanced UI/UX for category display with proper separation and visual hierarchy
 */

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { YStack, XStack } from '@tamagui/stacks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { HeadingMedium, Caption } from '@/components/ui/Typography';
import { MenuCategory, getCategoryLabel } from '@/constants/categories';
import { DesignTokens } from '@/constants/design';

interface CategorySectionProps {
  category: MenuCategory;
  itemCount: number;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  showItemCount?: boolean;
  showSeparator?: boolean;
}

/**
 * Category Section Header Component
 * Provides consistent styling and interaction for category sections
 */
export function CategorySection({
  category,
  itemCount,
  isExpanded = true,
  onToggleExpanded,
  showItemCount = true,
  showSeparator = true,
}: CategorySectionProps) {
  
  const categoryLabel = getCategoryLabel(category);
  
  return (
    <YStack>
      {/* Separator Line */}
      {showSeparator && (
        <YStack
          height={1}
          backgroundColor={DesignTokens.colors.beige[200]}
          marginVertical={DesignTokens.spacing.lg}
          marginHorizontal={DesignTokens.spacing.md}
        />
      )}
      
      {/* Category Header */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={DesignTokens.spacing.lg}
        paddingVertical={DesignTokens.spacing.md}
        style={styles.categoryHeader}
      >
        {/* Left Side: Category Info */}
        <YStack flex={1} gap={DesignTokens.spacing.xs}>
          <XStack alignItems="center" gap={DesignTokens.spacing.sm}>
            {/* Category Title */}
            <HeadingMedium color={DesignTokens.colors.brown[900]}>
              {categoryLabel}
            </HeadingMedium>
            
            {/* Item Count Badge */}
            {showItemCount && itemCount > 0 && (
              <XStack
                backgroundColor={DesignTokens.colors.orange[100]}
                paddingHorizontal={DesignTokens.spacing.sm}
                paddingVertical={2}
                borderRadius={DesignTokens.radius.full}
                alignItems="center"
                justifyContent="center"
                style={styles.countBadge}
              >
                <Caption 
                  color={DesignTokens.colors.orange[700]}
                  style={styles.countText}
                >
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </Caption>
              </XStack>
            )}
          </XStack>
          
          {/* Category Description (optional) */}
          {getCategoryDescription(category) && (
            <Caption 
              color={DesignTokens.colors.lightBrown[400]}
              style={styles.categoryDescription}
            >
              {getCategoryDescription(category)}
            </Caption>
          )}
        </YStack>
        
        {/* Right Side: Expand/Collapse Button */}
        {onToggleExpanded && (
          <TouchableOpacity
            onPress={onToggleExpanded}
            style={styles.expandButton}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color={DesignTokens.colors.charcoal[500]}
            />
          </TouchableOpacity>
        )}
      </XStack>
      
      {/* Decorative Accent Line */}
      <XStack
        height={2}
        backgroundColor={DesignTokens.colors.orange[200]}
        marginHorizontal={DesignTokens.spacing.lg}
        borderRadius={DesignTokens.radius.full}
        style={styles.accentLine}
      />
    </YStack>
  );
}

/**
 * Get category description for enhanced UX
 */
function getCategoryDescription(category: MenuCategory): string | null {
  const descriptions: Partial<Record<MenuCategory, string>> = {
    APPETIZERS: 'Perfect starters to begin your meal',
    MAINS: 'Hearty dishes to satisfy your appetite',
    DESSERTS: 'Sweet treats to end your meal perfectly',
    BEVERAGES: 'Refreshing drinks and specialty beverages',
    SOUPS: 'Warm and comforting soup selections',
    SALADS: 'Fresh and healthy salad options',
    SIDES: 'Perfect accompaniments to your main course',
    BREAKFAST: 'Start your day with these morning favorites',
    LUNCH: 'Satisfying midday meal options',
    DINNER: 'Evening specialties and comfort foods',
    SNACKS: 'Light bites and quick treats',
  };
  
  return descriptions[category] || null;
}

const styles = StyleSheet.create({
  categoryHeader: {
    backgroundColor: DesignTokens.colors.beige[50],
    borderRadius: DesignTokens.radius.lg,
    marginHorizontal: DesignTokens.spacing.md,
    ...DesignTokens.shadows.sm,
  },
  countBadge: {
    minWidth: 60,
    height: 20,
  },
  countText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  expandButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignTokens.colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignTokens.shadows.sm,
  },
  accentLine: {
    marginTop: DesignTokens.spacing.sm,
    opacity: 0.6,
  },
});
