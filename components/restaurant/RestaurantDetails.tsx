import { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { Accordion } from '@tamagui/accordion';
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons';
import { ThemedView } from '@/components/themed-view';
import { TopBar } from '@/components/ui/TopBar';
import { MenuItemCard } from '@/components/restaurant/MenuItemCard';
import { OrderStatusScreen } from '@/components/order/OrderStatusScreen';
import { Restaurant, MenuItem, Order, OrderItem, TableInfo, User } from '@/types';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { STORAGE_KEYS } from '@/constants/storage';
import { StorageService } from '@/utils/storage';
import { authenticatedFetch } from '@/utils/api';
import { DesignTokens } from '@/constants/design';

interface RestaurantDetailsProps {
  restaurant: Restaurant;
  onScanAgain: () => void;
  onLogout: () => void;
}

/**
 * RestaurantDetails Component
 * Displays restaurant information, menu items, and handles ordering
 */
export function RestaurantDetails({ restaurant, onScanAgain, onLogout }: RestaurantDetailsProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [restaurant.id]);

  const clearOrderData = async () => {
    setOrderId(null);
    setOrderItems([]);
    setOrderTotal(0);
    setOrderStatus(null);
    setOrderDetails(null);
    await StorageService.setOrderId(null);
  };

  const loadInitialData = async () => {
    try {
      // Load user data and table info
      const userData = await StorageService.getUserData();
      const tableInfo = await StorageService.getTableInfo();
      const savedOrderId = await StorageService.getOrderId();

      if (userData) {
        setUserData(userData);
      }
      if (tableInfo) {
        setTableInfo(tableInfo);
      }
      if (savedOrderId) {
        // Fetch order details to check status
        const order = await fetchOrderDetails(savedOrderId);
        if (order) {
          // If order is DELIVERED or CANCELLED, clear it to allow new order
          if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
            await clearOrderData();
          } else {
            // Order is still active, load it
            setOrderId(savedOrderId);
            await fetchOrderItems(savedOrderId);
            setOrderStatus(order.status);
          }
        } else {
          // Order not found, clear it
          await clearOrderData();
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
    await fetchMenuItems();
  };

  const fetchMenuItems = async () => {
    try {
      setLoadingMenu(true);
      setMenuError(null);
      
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MENU_ITEMS}?restaurantId=${restaurant.id}&isAvailable=true`
      );
      const data = await response.json();

      if (response.ok && data.menuItems) {
        setMenuItems(data.menuItems);
      } else {
        setMenuError(data.error || 'Failed to load menu items');
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMenuError('Failed to load menu items. Please try again.');
    } finally {
      setLoadingMenu(false);
    }
  };

  const fetchOrderItems = async (orderIdToFetch: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS.ITEMS(orderIdToFetch)}`);
      const data = await response.json();

      if (response.ok && data.orderItems) {
        setOrderItems(data.orderItems);
        
        // Calculate total
        const total = data.orderItems.reduce((sum: number, item: OrderItem) => {
          return sum + parseFloat(item.price.toString()) * item.quantity;
        }, 0);
        setOrderTotal(total);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const fetchOrderDetails = async (orderIdToFetch: string): Promise<Order | null> => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS.BY_ID(orderIdToFetch)}`);
      const data = await response.json();

      if (response.ok && data.order) {
        setOrderDetails(data.order);
        setOrderStatus(data.order.status);
        
        // If order is DELIVERED or CANCELLED, clear order data to allow new order
        if (data.order.status === 'DELIVERED' || data.order.status === 'CANCELLED') {
          await clearOrderData();
        }
        
        return data.order;
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
    return null;
  };

  const placeOrder = async () => {
    if (!orderId) {
      Alert.alert('Error', 'No order found. Please add items to your order first.');
      return;
    }

    if (orderItems.length === 0) {
      Alert.alert('Error', 'Your order is empty. Please add items before placing the order.');
      return;
    }

    Alert.alert(
      'Place Order',
      `Confirm your order for ₹${orderTotal.toFixed(2)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Place Order',
          onPress: async () => {
            setPlacingOrder(true);
            try {
              const response = await authenticatedFetch(
                `${API_BASE_URL}${API_ENDPOINTS.ORDERS.BY_ID(orderId)}`,
                {
                  method: 'PUT',
                  body: JSON.stringify({
                    status: 'CONFIRMED',
                  }),
                }
              );

              const data = await response.json();

              if (response.ok && data.order) {
                setOrderStatus(data.order.status);
                setOrderDetails(data.order);
                // Show order status screen after a brief delay
                setTimeout(() => {
                  setShowOrderStatus(true);
                }, 500);
              } else {
                Alert.alert('Error', data.error || 'Failed to place order. Please try again.');
              }
            } catch (error) {
              console.error('Error placing order:', error);
              Alert.alert('Error', 'Failed to place order. Please try again.');
            } finally {
              setPlacingOrder(false);
            }
          },
        },
      ]
    );
  };

  const getOrderQuantity = (menuItemId: string): number => {
    const orderItem = orderItems.find((item) => item.menuItemId === menuItemId);
    return orderItem ? orderItem.quantity : 0;
  };

  const getOrderItemId = (menuItemId: string): string | null => {
    const orderItem = orderItems.find((item) => item.menuItemId === menuItemId);
    return orderItem ? orderItem.id : null;
  };

  const createOrderWithItem = async (menuItem: MenuItem): Promise<string | null> => {
    if (!userData) {
      Alert.alert('Error', 'User data not found. Please restart the app.');
      return null;
    }

    try {
      let userId = userData.id;
      if (!userId) {
        const storedUserId = await StorageService.getUserId();
        if (storedUserId) {
          userId = storedUserId;
        } else {
          Alert.alert('Error', 'User ID not found. Please restart the app.');
          return null;
        }
      }

      // Get table ID from unique ID
      let tableId = null;
      if (tableInfo?.uniqueId) {
        const restaurantResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RESTAURANTS.BY_ID(restaurant.id)}`);
        const restaurantData = await restaurantResponse.json();
        
        if (restaurantData.restaurant?.tables) {
          const table = restaurantData.restaurant.tables.find(
            (t: any) => t.uniqueId === tableInfo.uniqueId
          );
          if (table) {
            tableId = table.id;
          }
        }
      }

      const orderData = {
        userId,
        restaurantId: restaurant.id,
        tableId: tableId || null,
        orderItems: [
          {
            menuItemId: menuItem.id,
            quantity: 1,
          },
        ],
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
        const newOrderId = data.order.id;
        setOrderId(newOrderId);
        await StorageService.setOrderId(newOrderId);
        await fetchOrderItems(newOrderId);
        return newOrderId;
      } else {
        Alert.alert('Error', data.error || 'Failed to create order');
        return null;
      }
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Failed to create order. Please try again.');
      return null;
    }
  };

  const handleAddItem = async (menuItem: MenuItem) => {
    // Check if we have an active order, if not or if it's completed, create a new one
    if (!orderId || orderStatus === 'DELIVERED' || orderStatus === 'CANCELLED') {
      setLoadingOrder(true);
      // Clear old order data if exists
      if (orderId) {
        await clearOrderData();
      }
      const newOrderId = await createOrderWithItem(menuItem);
      setLoadingOrder(false);
      return;
    }

    setLoadingOrder(true);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS.ITEMS(orderId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menuItemId: menuItem.id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchOrderItems(orderId);
      } else {
        Alert.alert('Error', data.error || 'Failed to add item to order');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item. Please try again.');
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleUpdateQuantity = async (menuItem: MenuItem, newQuantity: number) => {
    // If order is completed, create a new order
    if (!orderId || orderStatus === 'DELIVERED' || orderStatus === 'CANCELLED') {
      if (orderId) {
        await clearOrderData();
      }
      await handleAddItem(menuItem);
      return;
    }

    const orderItemId = getOrderItemId(menuItem.id);
    if (!orderItemId) {
      await handleAddItem(menuItem);
      return;
    }

    setLoadingOrder(true);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS.ITEM(orderId, orderItemId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchOrderItems(orderId);
      } else {
        Alert.alert('Error', data.error || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity. Please try again.');
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleRemoveItem = async (menuItem: MenuItem) => {
    // If order is completed, can't remove items
    if (!orderId || orderStatus === 'DELIVERED' || orderStatus === 'CANCELLED') {
      return;
    }

    const orderItemId = getOrderItemId(menuItem.id);
    if (!orderItemId) return;

    setLoadingOrder(true);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS.ITEM(orderId, orderItemId)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        await fetchOrderItems(orderId);
      } else {
        Alert.alert('Error', data.error || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Failed to remove item. Please try again.');
    } finally {
      setLoadingOrder(false);
    }
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const quantity = getOrderQuantity(item.id);
    return (
      <MenuItemCard
        item={item}
        orderQuantity={quantity}
        onAdd={() => handleAddItem(item)}
        onUpdate={(newQty) => handleUpdateQuantity(item, newQty)}
        onRemove={() => handleRemoveItem(item)}
      />
    );
  };

  const renderMenuHeader = () => {
    const userName = userData ? `${userData.firstName} ${userData.lastName}` : 'Guest';
    
    return (
      <YStack gap="$4">
        {/* TopBar for Guest users */}
        {userData?.role === 'GUEST' && (
          <TopBar
            userName={userName}
            userRole={userData.role}
            onLogout={onLogout}
            onScanAnotherQR={onScanAgain}
          />
        )}
        
        <YStack gap="$4" paddingHorizontal="$4" paddingTop="$4">
          <Text fontSize="$8" fontWeight="bold" textAlign="center">
            {restaurant.name}
          </Text>

          {restaurant?.description && (
            <Text fontSize="$4" color="$gray11" textAlign="center" marginBottom="$2">
              {restaurant?.description || ''}
            </Text>
          )}
          <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
            <Text fontSize="$7" fontWeight="bold">
              Menu Items
            </Text>
            {menuItems.length > 0 && (
              <Text fontSize="$4" color="$gray11">
                {menuItems.length} available item{menuItems.length !== 1 ? 's' : ''}
              </Text>
            )}
          </XStack>
        </YStack>
      </YStack>
    );
  };

  const renderMenuFooter = () => {
    // Return empty footer since order summary is now floating
    return <YStack padding="$4" />;
  };

  const renderMenuEmpty = () => {
    if (loadingMenu) {
      return (
        <YStack padding="$6" alignItems="center" gap="$3">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text fontSize="$4" color="$gray11">
            Loading menu items...
          </Text>
        </YStack>
      );
    }

    if (menuError) {
      return (
        <YStack padding="$6" alignItems="center" gap="$3">
          <Text fontSize="$5" color="$red10" textAlign="center">
            {menuError}
          </Text>
          <Button
            onPress={fetchMenuItems}
            size="$4"
            backgroundColor="$blue10"
          >
            <Text color="white" fontWeight="600">
              Retry
            </Text>
          </Button>
        </YStack>
      );
    }

    return (
      <YStack padding="$6" alignItems="center" gap="$2">
        <Text fontSize="$5" fontWeight="600" color="$gray11">
          No menu items available
        </Text>
        <Text fontSize="$4" color="$gray10" textAlign="center">
          This restaurant hasn't added any menu items yet.
        </Text>
      </YStack>
    );
  };

  if (showOrderStatus && orderDetails) {
    return (
      <OrderStatusScreen
        order={orderDetails}
        restaurant={restaurant}
        onBack={() => setShowOrderStatus(false)}
        onRefresh={async () => {
          if (orderId) {
            const updatedOrder = await fetchOrderDetails(orderId);
            if (updatedOrder) {
              setOrderDetails(updatedOrder);
              setOrderStatus(updatedOrder.status);
            }
          }
        }}
      />
    );
  }

  const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ThemedView style={styles.container}>
      {loadingOrder && (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="rgba(0,0,0,0.3)"
          zIndex={1000}
          alignItems="center"
          justifyContent="center"
        >
          <YStack
            padding="$4"
            backgroundColor="$gray2"
            borderRadius="$4"
            gap="$3"
            alignItems="center"
          >
            <ActivityIndicator size="large" color="#007AFF" />
            <Text fontSize="$4" color="$gray11">
              Updating order...
            </Text>
          </YStack>
        </YStack>
      )}
      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderMenuHeader}
        ListFooterComponent={renderMenuFooter}
        ListEmptyComponent={renderMenuEmpty}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        refreshing={loadingMenu}
        onRefresh={fetchMenuItems}
      />
      
      {/* Expandable Bottom Sheet */}
      {orderItems.length > 0 && (
        <YStack
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          backgroundColor="$gray1"
          borderTopWidth={1}
          borderTopColor="$gray5"
          borderRadius="$4"
          borderTopLeftRadius="$4"
          borderTopRightRadius="$4"
          style={[
            styles.bottomSheet,
            isBottomSheetExpanded && styles.bottomSheetExpanded,
          ]}
        >
          {/* Header - Always Visible */}
          <TouchableOpacity
            onPress={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
            activeOpacity={0.7}
          >
            <YStack padding="$4" gap="$3">
              {/* {orderStatus && (
                <XStack
                  padding="$2"
                  backgroundColor={orderStatus === 'CONFIRMED' ? '$green3' : orderStatus === 'PREPARING' ? '$yellow3' : orderStatus === 'READY' ? '$blue3' : '$gray3'}
                  borderRadius="$3"
                  alignItems="center"
                  justifyContent="center"
                  gap="$2"
                >
                  <Text fontSize="$4" fontWeight="600" color="$gray12">
                    Status: {orderStatus}
                  </Text>
                </XStack>
              )} */}
              <XStack justifyContent="space-between" alignItems="center" gap="$3">
                <YStack flex={1} gap="$1">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="$4" color="$gray11">
                      {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </Text>
                    <Text fontSize="$5" fontWeight="bold" color="$blue10">
                      ₹{orderTotal.toFixed(2)}
                    </Text>
                  </XStack>
                </YStack>
                <XStack alignItems="center" gap="$2">
                  {isBottomSheetExpanded ? (
                    <ChevronUp size={20} color="$gray11" />
                  ) : (
                    <ChevronDown size={20} color="$gray11" />
                  )}
                </XStack>
              </XStack>
            </YStack>
          </TouchableOpacity>

          {/* Expanded Content */}
          {isBottomSheetExpanded && (
            <YStack paddingHorizontal="$4" paddingBottom="$4" gap="$3" maxHeight={400}>
              <ScrollView 
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                <YStack gap="$3">
                  <Text fontSize="$6" fontWeight="bold" marginBottom="$2">
                    Order Details
                  </Text>
                  {orderItems.map((orderItem) => (
                    <XStack
                      key={orderItem.id}
                      justifyContent="space-between"
                      alignItems="flex-start"
                      paddingVertical="$2"
                      borderBottomWidth={1}
                      borderBottomColor="$gray5"
                    >
                      <YStack flex={1} gap="$1">
                        <Text
                          style={{
                            fontSize: DesignTokens.typography.fontSize.md,
                            fontWeight: DesignTokens.typography.fontWeight.semibold,
                            color: DesignTokens.colors.neutral.gray900,
                          }}
                        >
                          {orderItem.menuItem?.name || 'Menu Item'}
                        </Text>
                        <Text
                          style={{
                            fontSize: DesignTokens.typography.fontSize.sm,
                            color: DesignTokens.colors.neutral.gray600,
                          }}
                        >
                          Qty: {orderItem.quantity} × ₹{parseFloat(orderItem.price.toString()).toFixed(2)}
                        </Text>
                      </YStack>
                      <Text
                        style={{
                          fontSize: DesignTokens.typography.fontSize.md,
                          fontWeight: DesignTokens.typography.fontWeight.bold,
                          color: DesignTokens.colors.primary.blue,
                        }}
                      >
                        ₹{(parseFloat(orderItem.price.toString()) * orderItem.quantity).toFixed(2)}
                      </Text>
                    </XStack>
                  ))}
                  
                  {/* Total */}
                  <XStack
                    justifyContent="space-between"
                    alignItems="center"
                    paddingTop="$3"
                    borderTopWidth={1}
                    borderTopColor="$gray5"
                    marginTop="$2"
                  >
                    <Text
                      style={{
                        fontSize: DesignTokens.typography.fontSize.lg,
                        fontWeight: DesignTokens.typography.fontWeight.bold,
                        color: DesignTokens.colors.neutral.gray900,
                      }}
                    >
                      Total:
                    </Text>
                    <Text
                      style={{
                        fontSize: DesignTokens.typography.fontSize.xl,
                        fontWeight: DesignTokens.typography.fontWeight.bold,
                        color: DesignTokens.colors.primary.blue,
                      }}
                    >
                      ₹{orderTotal.toFixed(2)}
                    </Text>
                  </XStack>
                </YStack>
              </ScrollView>

              {/* Action Button */}
              <YStack marginTop="$3">
                {!orderStatus || orderStatus === 'PENDING' ? (
                  <Button
                    onPress={placeOrder}
                    size="$4"
                    backgroundColor="$green10"
                    width="100%"
                    disabled={placingOrder || orderItems.length === 0}
                  >
                    <Text color="white" fontWeight="600">
                      {placingOrder ? 'Placing...' : 'Place Order'}
                    </Text>
                  </Button>
                ) : (
                  <Button
                    onPress={async () => {
                      if (orderId) {
                        const order = await fetchOrderDetails(orderId);
                        if (order) {
                          setShowOrderStatus(true);
                        }
                      }
                    }}
                    size="$4"
                    backgroundColor="$blue10"
                    width="100%"
                  >
                    <Text color="white" fontWeight="600">
                      View Status
                    </Text>
                  </Button>
                )}
              </YStack>
            </YStack>
          )}

          {/* Collapsed Action Button */}
          {!isBottomSheetExpanded && (
            <YStack paddingHorizontal="$4" paddingBottom="$4">
              {!orderStatus || orderStatus === 'PENDING' ? (
                <Button
                  onPress={placeOrder}
                  size="$4"
                  backgroundColor="$green10"
                  width="100%"
                  disabled={placingOrder || orderItems.length === 0}
                >
                  <Text color="white" fontWeight="600">
                    {placingOrder ? 'Placing...' : 'Place Order'}
                  </Text>
                </Button>
              ) : (
                <Button
                  onPress={async () => {
                    if (orderId) {
                      const order = await fetchOrderDetails(orderId);
                      if (order) {
                        setShowOrderStatus(true);
                      }
                    }
                  }}
                  size="$4"
                  backgroundColor="$blue10"
                  width="100%"
                >
                  <Text color="white" fontWeight="600">
                    View Status
                  </Text>
                </Button>
              )}
            </YStack>
          )}
        </YStack>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 200, // Extra padding to account for bottom sheet + tab bar
  },
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: 200,
  },
  bottomSheetExpanded: {
    maxHeight: 500,
  },
});

