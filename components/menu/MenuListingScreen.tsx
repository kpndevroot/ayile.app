import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  Animated,
  View,
} from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedView } from '@/components/themed-view';
import { FoodImage } from '@/components/ui/FoodImage';
import { MenuCard } from '@/components/menu/MenuCard';
import { CategorySection } from '@/components/ui/CategorySection';
import { HeadingLarge, BodyMedium } from '@/components/ui/Typography';
import { MenuItem } from '@/types';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { StorageService } from '@/utils/storage';
import { DesignTokens } from '@/constants/design';
import { PromotionalBanner } from '@/components/ui/PromotionalBanner';
import { 
  MenuCategory, 
  PRIMARY_CATEGORIES, 
  getCategoryLabel, 
  filterItemsByCategory 
} from '@/constants/categories';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 170; // Fixed width for horizontal scrolling cards

interface MenuListingScreenProps {
  restaurantId: string;
  tableNumber?: string;
  onAddToCart?: (item: MenuItem) => void;
}

// Categories now imported from single source of truth

/**
 * Menu Listing Screen Component
 * Pixel-perfect implementation matching the provided design
 */
export function MenuListingScreen({
  restaurantId,
  tableNumber = '24',
  onAddToCart,
}: MenuListingScreenProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(1);
  const [animatedItems, setAnimatedItems] = useState<{ [key: string]: Animated.Value }>({});

  useEffect(() => {
    fetchMenuItems();
  }, [restaurantId]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MENU_ITEMS}?restaurantId=${restaurantId}&isAvailable=true`
      );
      const data = await response.json();

      if (response.ok && data.menuItems) {
        setMenuItems(data.menuItems);
        // Initialize animated values for all items
        const initialAnimatedItems: { [key: string]: Animated.Value } = {};
        data.menuItems.forEach((item: MenuItem) => {
          initialAnimatedItems[item.id] = new Animated.Value(1);
        });
        setAnimatedItems(initialAnimatedItems);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryItems = (category: MenuCategory): MenuItem[] => {
    return filterItemsByCategory(menuItems, category);
  };

  const filteredItems = getCategoryItems(selectedCategory).filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (item: MenuItem) => {
    // Create animated value for this item if it doesn't exist
    let animValue = animatedItems[item.id];
    if (!animValue) {
      animValue = new Animated.Value(1);
      setAnimatedItems((prev) => ({
        ...prev,
        [item.id]: animValue!,
      }));
    }

    // Trigger animation
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(animValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Call the actual add to cart function
    if (onAddToCart) {
      onAddToCart(item);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <YStack 
          paddingHorizontal={20} 
          paddingTop={Platform.OS === 'ios' ? 60 : 20} 
          paddingBottom={16} 
          backgroundColor="#FAF7F2"
        >
          <XStack
            alignItems="center"
            justifyContent="space-between"
            marginBottom={16}
          >
            {/* Left: Table Info (Static, no dropdown) */}
            <YStack flex={1}>
              <Text fontSize={12} color="#6B7280" fontWeight="400" marginBottom={2}>
                {/* Table */}
              </Text>
              <Text fontSize={18} color="#1A0F08" fontWeight="700">
                {/* {tableNumber} */}
              </Text>
            </YStack>

            {/* Right Icons */}
            <XStack alignItems="center" gap={16}>
              <TouchableOpacity 
                activeOpacity={0.7}
                style={styles.iconButton}
              >
                <MaterialIcons name="favorite-border" size={22} color="#1A0F08" />
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.7} 
                style={[styles.iconButton, styles.notificationButton]}
              >
                <MaterialIcons name="notifications-none" size={22} color="#1A0F08" />
                {notificationCount > 0 && (
                  <XStack
                    position="absolute"
                    top={-4}
                    right={-4}
                    backgroundColor="#F97316"
                    borderRadius={10}
                    minWidth={18}
                    height={18}
                    paddingHorizontal={4}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={10} color="white" fontWeight="700">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Text>
                  </XStack>
                )}
              </TouchableOpacity>
            </XStack>
          </XStack>

          {/* Search Bar */}
          <XStack
            backgroundColor="white"
            borderRadius={12}
            paddingHorizontal={16}
            paddingVertical={12}
            alignItems="center"
            gap={12}
            style={styles.searchBar}
          >
            <MaterialIcons name="search" size={20} color="#6B7280" />
            <Text
              fontSize={15}
              color="#9CA3AF"
              flex={1}
              fontWeight="400"
            >
              Search food, drinks, etc.
            </Text>
          </XStack>
        </YStack>

        {/* Promotional Banner */}
        <YStack marginVertical="$4">
          <PromotionalBanner 
            title="First Order Special!"
            subtitle="Save big on your first delicious meal"
            discount="50%"
            urgencyText="Only 2 Hours Left"
            onPress={() => console.log('Promo clicked')}
          />
        </YStack>

        {/* Category Tabs */}
        <XStack
          paddingHorizontal="$4"
          marginBottom="$4"
          gap="$2"
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {PRIMARY_CATEGORIES.map((category: MenuCategory) => {
              const isActive = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.7}
                  style={[
                    styles.categoryTab,
                    isActive && styles.categoryTabActive,
                  ]}
                >
                    <BodyMedium
                      color={isActive ? DesignTokens.colors.neutral.white : DesignTokens.colors.charcoal[500]}
                      style={{
                        fontWeight: isActive ? '600' : '500',
                        fontSize: 14,
                      }}
                    >
                      {getCategoryLabel(category)}
                    </BodyMedium>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </XStack>

        {/* Menu Items Sections */}
        {loading ? (
          <YStack alignItems="center" padding="$6">
            <BodyMedium color={DesignTokens.colors.charcoal[500]}>
              Loading menu items...
            </BodyMedium>
          </YStack>
        ) : (
          <YStack paddingHorizontal="$4" gap="$5" paddingBottom="$6">
            {selectedCategory === 'ALL' ? (
              // Horizontal carousel layout for "ALL" category - shows all categories with horizontal scrolling
              PRIMARY_CATEGORIES.slice(1).map((category) => {
                const categoryItems = getCategoryItems(category as MenuCategory).filter((item) =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (categoryItems.length === 0) return null;

                return (
                  <YStack key={category} gap="$3">
                    {/* Enhanced Category Section */}
                    <CategorySection
                      category={category as MenuCategory}
                      itemCount={categoryItems.length}
                      showSeparator={category !== PRIMARY_CATEGORIES.slice(1)[0]}
                    />

                    {/* Horizontal Scrollable Menu Items */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.menuItemsContainer}
                    >
                      {categoryItems.map((item) => {
                        const scaleAnim = animatedItems[item.id] || new Animated.Value(1);
                        return (
                          <MenuCard
                            key={item.id}
                            item={item}
                            width={CARD_WIDTH}
                            scaleAnim={scaleAnim}
                            onAddToCart={handleAddToCart}
                          />
                        );
                      })}
                    </ScrollView>
                  </YStack>
                );
              })
            ) : (
              // Vertical grid layout for specific categories - shows all items in a 2-column grid
              (() => {
                const categoryItems = getCategoryItems(selectedCategory).filter((item) =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (categoryItems.length === 0) {
                  return (
                    <YStack alignItems="center" padding="$6">
                      <BodyMedium color={DesignTokens.colors.charcoal[500]}>
                        No items found in {getCategoryLabel(selectedCategory)}
                      </BodyMedium>
                    </YStack>
                  );
                }

                return (
                  <YStack gap="$4">
                    {/* Category Header */}
                    <CategorySection
                      category={selectedCategory}
                      itemCount={categoryItems.length}
                      showSeparator={false}
                    />

                    {/* Vertical Grid Layout - 2 columns */}
                    <View style={styles.gridContainer}>
                      {categoryItems.map((item, index) => {
                        const scaleAnim = animatedItems[item.id] || new Animated.Value(1);
                        const isEven = index % 2 === 0;
                        const cardWidth = (SCREEN_WIDTH - (DesignTokens.spacing.lg * 3)) / 2; // Account for padding and gap
                        
                        return (
                          <View 
                            key={item.id} 
                            style={[
                              styles.gridItem, 
                              { 
                                width: cardWidth,
                                marginRight: isEven ? DesignTokens.spacing.md : 0,
                              }
                            ]}
                          >
                            <MenuCard
                              item={item}
                              width={cardWidth}
                              scaleAnim={scaleAnim}
                              onAddToCart={handleAddToCart}
                            />
                          </View>
                        );
                      })}
                    </View>
                  </YStack>
                );
              })()
            )}
          </YStack>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom tab bar
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  searchBar: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  notificationButton: {
    position: 'relative',
  },
  banner: {
    height: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  categoryContainer: {
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    minWidth: 100,
    alignItems: 'center',
  },
  categoryTabActive: {
    backgroundColor: '#F97316',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  menuItemsContainer: {
    paddingRight: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: DesignTokens.spacing.sm,
    width: '100%',
    justifyContent: 'space-between',
  },
  gridItem: {
    marginBottom: DesignTokens.spacing.md,
    flexBasis: '47%', // Ensures exactly 2 items per row with some margin
    maxWidth: '47%',
  },
});

