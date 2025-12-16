import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
  TextInput,
} from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedView } from '@/components/themed-view';
import { FoodImage } from '@/components/ui/FoodImage';
import { MenuItemCustomizationModal } from '@/components/menu/MenuItemCustomizationModal';
import { MenuItem } from '@/types';
import { StorageService, LocalCartItem } from '@/utils/storage';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HomePageProps {
  userData: any | null;
  onScanQR: () => void;
  onLogout: () => void;
  restaurantId?: string;
  tableNumber?: string;
}

/**
 * HomePage Component - Redesigned to match the image style
 * Features:
 * - Top bar with "Dine-in: Table X" and user icon
 * - Search bar with search and microphone icons
 * - Bestsellers horizontal scroll section
 * - Category filter buttons
 * - Mains vertical list section
 * - Floating cart summary bar
 */
export function HomePage({
  userData,
  onScanQR,
  onLogout,
  restaurantId,
  tableNumber = '5',
}: HomePageProps) {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Mains');
  const [localCart, setLocalCart] = useState<LocalCartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Categories from the image
  const categories = ['Mains', 'Appetizers', 'Desserts', 'Drinks'];

  // Fetch menu items
  useEffect(() => {
    if (restaurantId) {
      fetchMenuItems();
    }
  }, [restaurantId]);

  // Load cart data
  useEffect(() => {
    loadCartData();
    // Refresh cart periodically
    const interval = setInterval(loadCartData, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchMenuItems = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MENU_ITEMS}?restaurantId=${restaurantId}&isAvailable=true`
      );
      const data = await response.json();

      if (response.ok) {
        // Handle both response formats
        const items = data.data?.menuItems || data.menuItems || [];
        setMenuItems(items);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCartData = async () => {
    try {
      const cart = await StorageService.getLocalCart();
      setLocalCart(cart);

      // Calculate total and count
      let total = 0;
      let count = 0;

      cart.forEach((item) => {
        if (item.menuItem) {
          // Use the stored price which includes customizations
          const menuItem = item.menuItem as any;
          const price = parseFloat(menuItem.price || '0');
          total += price * item.quantity;
          count += item.quantity;
        }
      });

      setCartTotal(total);
      setCartItemCount(count);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const handleAddToCart = async (item: any) => {
    // Optimistically select the item and show modal
    setSelectedItem(item);
    setShowCustomizationModal(true);

    // Fetch full details
    try {
      setIsLoadingDetails(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MENU_ITEMS}/${item.id}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedItem(data.data.menuItem);
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleAddToCartFromModal = async (
    menuItem: MenuItem,
    quantity: number,
    selectedQuantityOption?: any,
    selectedAddOns?: any[]
  ) => {
    try {
      // Calculate final price per item (base + add-ons)
      const basePrice = selectedQuantityOption
        ? (typeof selectedQuantityOption.price === 'string' ? parseFloat(selectedQuantityOption.price) : selectedQuantityOption.price)
        : parseFloat(menuItem.price);

      const addOnsTotal = selectedAddOns
        ? selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0)
        : 0;

      const pricePerItem = basePrice + addOnsTotal;

      // Create a modified menu item with the selected options
      const cartItem: MenuItem = {
        ...menuItem,
        price: pricePerItem.toString(),
        description: selectedQuantityOption
          ? `${menuItem.description || ''} (${selectedQuantityOption.displayLabel})${selectedAddOns && selectedAddOns.length > 0 ? ` + ${selectedAddOns.map(a => a.name).join(', ')}` : ''}`.trim()
          : menuItem.description,

      };

      // Add to cart using StorageService directly with the quantity
      await StorageService.addToLocalCart(cartItem, quantity);

      // Trigger cart refresh
      await AsyncStorage.setItem('@forks_refresh_cart', 'true');
      await loadCartData();
    } catch (error) {
      console.error('Error adding item to cart from modal:', error);
    }
  };

  // Get bestsellers (featured items or first few items)
  const bestsellers = useMemo(() => {
    return menuItems
      .filter(item => item.isFeatured || item.category?.isFeatured)
      .slice(0, 5);
  }, [menuItems]);

  // Get filtered items by category
  const filteredItems = useMemo(() => {
    let items = menuItems;

    // Filter by category
    if (selectedCategory !== 'Mains') {
      items = items.filter(item => {
        const categoryName = item.category?.name || '';
        return categoryName.toLowerCase().includes(selectedCategory.toLowerCase());
      });
    }

    // Filter by search query
    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  }, [menuItems, selectedCategory, searchQuery]);

  // Get dietary badge color
  const getDietaryBadgeColor = (dietaryTypes: string[]) => {
    if (dietaryTypes.includes('GLUTEN_FREE')) return '#ADD8E6'; // Light blue
    if (dietaryTypes.includes('VEG') || dietaryTypes.includes('VEGAN')) return '#90EE90'; // Light green
    return '#E0E0E0'; // Default gray
  };

  const getDietaryLabel = (dietaryTypes: string[]) => {
    if (dietaryTypes.includes('GLUTEN_FREE')) return 'GF';
    if (dietaryTypes.includes('VEG')) return 'Veg option';
    if (dietaryTypes.includes('VEGAN')) return 'Vegan';
    return null;
  };

  // Check if item is in cart
  const getItemQuantity = (itemId: string) => {
    const cartItem = localCart.find(item => item.menuItemId === itemId);
    return cartItem?.quantity || 0;
  };

  const handleUpdateQuantity = async (item: any, newQuantity: number) => {
    try {
      const menuItem: MenuItem = {
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category?.name || 'Mains',
        price: item.quantityOptions?.[0]?.price || item.basePrice || '0',
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
        restaurantId: item.restaurantId,
      };

      if (newQuantity === 0) {
        await StorageService.removeFromLocalCart(item.id);
      } else {
        await StorageService.updateLocalCartItem(item.id, newQuantity);
      }

      await AsyncStorage.setItem('@forks_refresh_cart', 'true');
      await loadCartData();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleViewCart = () => {
    router.push('/(tabs)/cart');
  };

  // If no restaurant, show welcome screen
  if (!restaurantId) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.homeContent}>
          <YStack gap="$6" padding="$6" alignItems="center" justifyContent="center" flex={1}>
            <YStack gap="$4" alignItems="center" maxWidth={400} width="100%">
              <Text fontSize="$10" fontWeight="bold" textAlign="center">
                Welcome to Forks! 🍴
              </Text>
              <Text fontSize="$6" color="$gray11" textAlign="center">
                Scan a QR code to view restaurant menu
              </Text>
              <TouchableOpacity
                onPress={onScanQR}
                style={styles.scanButton}
              >
                <Text color="white" fontWeight="600" fontSize="$5">
                  Scan Restaurant QR Code 📷
                </Text>
              </TouchableOpacity>
            </YStack>
          </YStack>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <YStack
          paddingHorizontal={20}
          paddingTop={Platform.OS === 'ios' ? 60 : 20}
          paddingBottom={16}
          backgroundColor="#FBF9F6"
        >
          <XStack
            alignItems="center"
            justifyContent="space-between"
            marginBottom={16}
          >
            <Text fontSize={20} fontWeight="700" color="#1A0F08">
              Dine-in: Table {tableNumber}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <MaterialIcons name="account-circle" size={28} color="#1A0F08" />
            </TouchableOpacity>
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
            <TextInput
              style={styles.searchInput}
              placeholder="Search food, drinks, etc."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity>
              <MaterialIcons name="mic" size={20} color="#6B7280" />
            </TouchableOpacity>
          </XStack>
        </YStack>

        {/* Bestsellers Section */}
        {bestsellers.length > 0 && (
          <YStack marginTop={8} marginBottom={24}>
            <Text
              fontSize={20}
              fontWeight="700"
              color="#1A0F08"
              marginBottom={16}
              paddingHorizontal={20}
            >
              Bestsellers
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bestsellersContainer}
            >
              {bestsellers.map((item) => {
                const price = parseFloat(
                  item.quantityOptions?.[0]?.price || item.basePrice || '0'
                );
                const isPopular = item.isFeatured;
                const isChefSpecial = item.category?.isFeatured;

                return (
                  <View key={item.id} style={styles.bestsellerCard}>
                    <View style={styles.bestsellerImageContainer}>
                      <FoodImage
                        menuItemName={item.name}
                        category={item.category?.name}
                        existingImageUrl={item.imageUrl}
                        width={SCREEN_WIDTH * 0.7}
                        height={180}
                        borderRadius={16}
                        resizeMode="cover"
                      />
                      {isPopular && (
                        <View style={[styles.badge, styles.popularBadge]}>
                          <Text style={styles.badgeText}>Popular</Text>
                        </View>
                      )}
                      {isChefSpecial && !isPopular && (
                        <View style={[styles.badge, styles.chefBadge]}>
                          <Text style={styles.chefBadgeText}>Chef's Special</Text>
                        </View>
                      )}
                    </View>
                    <YStack padding={16} gap={8}>
                      <Text fontSize={16} fontWeight="600" color="#1A0F08" numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text fontSize={13} color="#6B7280" numberOfLines={2} lineHeight={18}>
                        {item.description}
                      </Text>
                      <XStack alignItems="center" justifyContent="space-between">
                        <Text fontSize={16} fontWeight="700" color="#1A0F08">
                          ₹{price.toFixed(0)}
                        </Text>
                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={() => handleAddToCart(item)}
                          disabled={!item.isAvailable}
                        >
                          <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                      </XStack>
                    </YStack>
                  </View>
                );
              })}
            </ScrollView>
          </YStack>
        )}

        {/* Category Filter Buttons */}
        <XStack
          paddingHorizontal={20}
          marginBottom={16}
          gap={12}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.categoryButton,
                    isActive && styles.categoryButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      isActive && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </XStack>

        {/* Mains Section */}
        <YStack paddingHorizontal={20} paddingBottom={100}>
          <Text
            fontSize={20}
            fontWeight="700"
            color="#1A0F08"
            marginBottom={16}
          >
            {selectedCategory}
          </Text>

          {loading ? (
            <YStack alignItems="center" padding="$6">
              <Text color="#6B7280">Loading menu items...</Text>
            </YStack>
          ) : filteredItems.length === 0 ? (
            <YStack alignItems="center" padding="$6">
              <Text color="#6B7280">No items found</Text>
            </YStack>
          ) : (
            <YStack gap={16}>
              {filteredItems.map((item) => {
                const price = parseFloat(
                  item.quantityOptions?.[0]?.price || item.basePrice || '0'
                );
                const quantity = getItemQuantity(item.id);
                const dietaryLabel = getDietaryLabel(item.dietaryTypes || []);
                const dietaryColor = getDietaryBadgeColor(item.dietaryTypes || []);
                const isChefSpecial = item.category?.isFeatured;

                return (
                  <View key={item.id} style={styles.mainsCard}>
                    <View style={styles.mainsImageContainer}>
                      <FoodImage
                        menuItemName={item.name}
                        category={item.category?.name}
                        existingImageUrl={item.imageUrl}
                        width={100}
                        height={100}
                        borderRadius={12}
                        resizeMode="cover"
                      />
                      {isChefSpecial && (
                        <View style={[styles.smallBadge, styles.chefBadge]}>
                          <Text style={styles.chefBadgeText}>Chef's Special</Text>
                        </View>
                      )}
                    </View>
                    <YStack flex={1} paddingLeft={12} justifyContent="space-between">
                      <YStack gap={4}>
                        <Text fontSize={16} fontWeight="600" color="#1A0F08" numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text fontSize={13} color="#6B7280" numberOfLines={2} lineHeight={18}>
                          {item.description}
                        </Text>
                        {dietaryLabel && (
                          <View style={[styles.dietaryBadge, { backgroundColor: dietaryColor }]}>
                            <Text style={styles.dietaryBadgeText}>{dietaryLabel}</Text>
                          </View>
                        )}
                      </YStack>
                      <XStack alignItems="center" justifyContent="space-between" marginTop={8}>
                        <Text fontSize={16} fontWeight="700" color="#1A0F08">
                          ₹{price.toFixed(0)}
                        </Text>
                        {quantity === 0 ? (
                          <TouchableOpacity
                            style={styles.addButtonSmall}
                            onPress={() => handleAddToCart(item)}
                            disabled={!item.isAvailable}
                          >
                            <Text style={styles.addButtonText}>Add</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.quantitySelector}>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => handleUpdateQuantity(item, quantity - 1)}
                            >
                              <Text style={styles.quantityButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => handleUpdateQuantity(item, quantity + 1)}
                            >
                              <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </XStack>
                    </YStack>
                  </View>
                );
              })}
            </YStack>
          )}
        </YStack>
      </ScrollView>

      {/* Floating Cart Summary Bar */}
      {cartItemCount > 0 && (
        <View style={styles.cartBar}>
          <YStack flex={1}>
            <Text style={styles.cartItemCount}>{cartItemCount} Items</Text>
            <Text style={styles.cartTotal}>₹{cartTotal.toFixed(2)}</Text>
          </YStack>
          <TouchableOpacity style={styles.viewCartButton} onPress={handleViewCart}>
            <Text style={styles.viewCartButtonText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Customization Modal */}
      <MenuItemCustomizationModal
        visible={showCustomizationModal}
        item={selectedItem}
        rating={4.5}
        onClose={() => setShowCustomizationModal(false)}
        onAddToCart={handleAddToCartFromModal}
        quantityOptions={selectedItem?.quantityOptions}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F6',
  },
  homeContent: {
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A0F08',
  },
  scanButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  bestsellersContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  bestsellerCard: {
    width: SCREEN_WIDTH * 0.7,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bestsellerImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularBadge: {
    backgroundColor: '#F08080',
  },
  chefBadge: {
    backgroundColor: '#3A3A3A',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  chefBadgeText: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: '700',
  },
  smallBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonSmall: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryContainer: {
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  mainsCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mainsImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dietaryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  dietaryBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  quantityButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A0F08',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A0F08',
    paddingHorizontal: 12,
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cartItemCount: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  viewCartButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  viewCartButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '700',
  },
});

