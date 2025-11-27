import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { StorageService, LocalCartItem } from '@/utils/storage';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { useRouter } from 'expo-router';
import { MenuItem } from '@/types';

export default function CartScreen() {
  const router = useRouter();
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [localCart, setLocalCart] = useState<LocalCartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total from local cart
  const orderTotal = useMemo(() => {
    return localCart.reduce((total, item) => {
      const price = parseFloat(item.menuItem?.price || '0');
      return total + (price * item.quantity);
    }, 0);
  }, [localCart]);

  const loadCartData = useCallback(async () => {
    try {
      const cart = await StorageService.getLocalCart();
      setLocalCart(cart);
      
      const restaurant = await StorageService.getRestaurantData();
      if (restaurant) {
        setRestaurantData(restaurant);
      }
    } catch (error) {
      console.error('Error loading cart data:', error);
    }
  }, []);

  // Load cart data when component mounts
  useEffect(() => {
    loadCartData();
  }, [loadCartData]);

  // Refresh cart when screen comes into focus and check for refresh trigger
  useFocusEffect(
    useCallback(() => {
      loadCartData();
      
      // Check for refresh trigger from adding items
      const checkRefreshTrigger = async () => {
        try {
          const refreshTrigger = await AsyncStorage.getItem('@forks_refresh_cart');
          if (refreshTrigger === 'true') {
            await AsyncStorage.removeItem('@forks_refresh_cart');
            await loadCartData();
          }
        } catch (error) {
          console.error('Error checking refresh trigger:', error);
        }
      };
      
      // Check immediately
      checkRefreshTrigger();
      
      // Check periodically while screen is focused (every 2 seconds)
      const refreshInterval = setInterval(checkRefreshTrigger, 2000);
      
      return () => clearInterval(refreshInterval);
    }, [loadCartData])
  );

  const handleUpdateQuantity = async (cartItem: LocalCartItem, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(cartItem);
      return;
    }

    try {
      await StorageService.updateLocalCartItem(cartItem.menuItemId, newQuantity);
      await loadCartData();
      // Trigger cart refresh in CustomTabBar
      await AsyncStorage.setItem('@forks_refresh_cart', 'true');
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity. Please try again.');
    }
  };

  const handleRemoveItem = async (cartItem: LocalCartItem) => {
    Alert.alert(
      'Remove Item',
      `Remove ${cartItem.menuItem?.name || 'this item'} from cart?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.removeFromLocalCart(cartItem.menuItemId);
              await loadCartData();
              // Trigger cart refresh in CustomTabBar
              await AsyncStorage.setItem('@forks_refresh_cart', 'true');
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handlePlaceOrder = async () => {
    if (localCart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    if (!restaurantData) {
      Alert.alert('Error', 'Restaurant information not found');
      return;
    }

    const userData = await StorageService.getUserData();
    if (!userData) {
      Alert.alert('Error', 'User information not found');
      return;
    }

    Alert.alert(
      'Place Order',
      `Total: ₹${orderTotal.toFixed(2)}\n\nConfirm your order?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              // Get table info
              const tableInfo = await StorageService.getTableInfo();
              let tableId = null;
              let tableNumber = null;

              if (tableInfo?.uniqueId && restaurantData.tables) {
                const table = restaurantData.tables.find(
                  (t: any) => t.uniqueId === tableInfo.uniqueId
                );
                if (table) {
                  tableId = table.id;
                  tableNumber = table.tableNumber ? String(table.tableNumber) : null;
                }
              }

              // Create order with all items (backend will check for pending orders)
              const orderData = {
                userId: userData.id,
                restaurantId: restaurantData.id,
                tableId: tableId || null,
                tableNumber: tableNumber || null,
                orderItems: localCart.map(item => ({
                  menuItemId: item.menuItemId,
                  quantity: item.quantity,
                })),
              };

              const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS.BASE}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
              });

              const data = await response.json();

              if (response.ok && data.order) {
                // Clear local cart
                await StorageService.clearLocalCart();
                setLocalCart([]);
                
                // Save order ID
                await StorageService.setOrderId(data.order.id);
                
                // Set flag to trigger order screen refresh
                await AsyncStorage.setItem('@forks_refresh_orders', 'true');
                await AsyncStorage.setItem('@forks_refresh_cart', 'true');
                
                Alert.alert('Success', 'Order placed successfully!', [
                  {
                    text: 'OK',
                    onPress: () => router.push('/(tabs)/order'),
                  },
                ]);
              } else {
                if (response.status === 409) {
                  Alert.alert(
                    'Table Has Active Order',
                    data.error || 'This table has an active order. Please wait for it to be completed or scan another table\'s QR code.'
                  );
                } else {
                  Alert.alert('Error', data.error || 'Failed to place order');
                }
              }
            } catch (error) {
              console.error('Error placing order:', error);
              Alert.alert('Error', 'Failed to place order. Please try again.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (localCart.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <YStack
            flex={1}
            paddingHorizontal={20}
            paddingTop={60}
            paddingBottom={40}
            maxWidth={500}
            width="100%"
            alignSelf="center"
            backgroundColor="$beige1"
            alignItems="center"
            justifyContent="center"
            gap={16}
          >
            <MaterialIcons name="shopping-bag" size={64} color="#D4C4B0" />
            <Text
              fontSize={20}
              fontWeight="600"
              color="$brown9"
              textAlign="center"
            >
              Your cart is empty
            </Text>
            <Text
              fontSize={16}
              fontWeight="400"
              color="$lightBrown5"
              textAlign="center"
            >
              Add items to your cart to see them here
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(tabs)/restaurant')}
              activeOpacity={0.8}
            >
              <Text fontSize={18} fontWeight="600" color="white">
                Browse Menu
              </Text>
            </TouchableOpacity>
          </YStack>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <YStack
          flex={1}
          paddingHorizontal={20}
          paddingTop={20}
          paddingBottom={40}
          maxWidth={500}
          width="100%"
          alignSelf="center"
          backgroundColor="$beige1"
        >
          {/* Header */}
          <XStack alignItems="center" justifyContent="space-between" marginBottom={24}>
            <Text
              fontSize={28}
              fontWeight="700"
              color="$brown9"
            >
              Cart
            </Text>
            <Text
              fontSize={16}
              fontWeight="400"
              color="$lightBrown5"
            >
              {localCart.length} {localCart.length === 1 ? 'item' : 'items'}
            </Text>
          </XStack>

          {/* Cart Items */}
          <YStack gap={12} marginBottom={24}>
            {localCart.map((cartItem) => {
              const itemPrice = parseFloat(cartItem.menuItem?.price || '0');
              const totalPrice = itemPrice * cartItem.quantity;
              
              return (
              <XStack
                  key={cartItem.menuItemId}
                backgroundColor="white"
                borderRadius={12}
                padding={16}
                gap={12}
                alignItems="center"
              >
                <YStack flex={1} gap={4}>
                  <Text
                    fontSize={16}
                    fontWeight="600"
                    color="$brown9"
                  >
                      {cartItem.menuItem?.name || 'Item'}
                  </Text>
                  <Text
                    fontSize={14}
                    fontWeight="400"
                    color="$lightBrown5"
                  >
                      ₹{itemPrice.toFixed(2)} each
                  </Text>
                </YStack>

                  {/* Quantity Controls */}
                  <XStack
                    alignItems="center"
                    gap={12}
                    backgroundColor="#F3F4F6"
                    borderRadius={8}
                    padding={4}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        if (cartItem.quantity > 1) {
                          handleUpdateQuantity(cartItem, cartItem.quantity - 1);
                        } else {
                          handleRemoveItem(cartItem);
                        }
                      }}
                      style={[
                        styles.quantityButton,
                        cartItem.quantity === 1 && styles.removeButton,
                      ]}
                    >
                      <MaterialIcons
                        name={cartItem.quantity === 1 ? 'delete-outline' : 'remove'}
                        size={20}
                        color={cartItem.quantity === 1 ? '#EF4444' : '#6B7280'}
                      />
                    </TouchableOpacity>

                    <Text
                      fontSize={16}
                      fontWeight="600"
                      color="$brown9"
                      minWidth={30}
                      textAlign="center"
                    >
                      {cartItem.quantity}
                    </Text>

                    <TouchableOpacity
                      onPress={() => handleUpdateQuantity(cartItem, cartItem.quantity + 1)}
                      style={styles.quantityButton}
                    >
                      <MaterialIcons name="add" size={20} color="#F97316" />
                    </TouchableOpacity>
                  </XStack>

                  <YStack alignItems="flex-end" gap={2}>
                <Text
                  fontSize={18}
                  fontWeight="700"
                  color="$orange6"
                >
                      ₹{totalPrice.toFixed(2)}
                </Text>
                  </YStack>
              </XStack>
              );
            })}
          </YStack>

          {/* Total */}
          <YStack
            backgroundColor="white"
            borderRadius={12}
            padding={20}
            marginBottom={24}
            gap={12}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text
                fontSize={20}
                fontWeight="600"
                color="$brown9"
              >
                Total
              </Text>
              <Text
                fontSize={24}
                fontWeight="700"
                color="$orange6"
              >
                ₹{orderTotal.toFixed(2)}
              </Text>
            </XStack>
          </YStack>

          {/* Place Order Button */}
          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
            onPress={handlePlaceOrder}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text fontSize={18} fontWeight="600" color="white">
                Place Order
              </Text>
            )}
          </TouchableOpacity>
        </YStack>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scrollContent: {
    flexGrow: 1,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    backgroundColor: '#FEE2E2',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
});

