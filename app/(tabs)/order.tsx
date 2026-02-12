import { useState, useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, ActivityIndicator, FlatList, TouchableOpacity, RefreshControl, Animated, Platform, View } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { ThemedView } from '@/components/themed-view';
import { TopBar } from '@/components/ui/TopBar';
import { OrderStatusScreen } from '@/components/order/OrderStatusScreen';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Order, Restaurant, OrderStatus } from '@/types';
import { StorageService } from '@/utils/storage';
import { AuthService } from '@/services/authService';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { authenticatedFetch } from '@/utils/api';
import { DesignTokens } from '@/constants/design';
import { websocketService } from '@/services/websocketService';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';

/**
 * Order Status Tab
 * Displays current order status and details
 */
export default function OrderTab() {
  const router = useRouter();
  const { isAuthenticated, requireAuth } = useAuth();
  const { showNotification } = useNotification();
  const [order, setOrder] = useState<Order | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refreshRotation] = useState(new Animated.Value(0));

  const fetchOrderDetails = async (orderId: string): Promise<Order | null> => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS.BY_ID(orderId)}`);
      const data = await response.json();

      if (response.ok && data.order) {
        return data.order;
      }
      return null;
    } catch (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
  };

  const clearOrderData = async () => {
    setOrder(null);
    await StorageService.setOrderId(null);
  };

  const fetchOrderHistory = async (userId: string) => {
    try {
      setLoadingHistory(true);
      const response = await authenticatedFetch(
        `${API_BASE_URL}${API_ENDPOINTS.ORDERS.BASE}?userId=${userId}&limit=50`
      );
      const data = await response.json();

      if (response.ok && data.orders) {
        // Filter out the current active order if it exists
        const currentOrderId = await StorageService.getOrderId();
        // Show all orders (including active ones in history, but prioritize completed ones)
        const filteredOrders = data.orders.filter(
          (o: Order) => o.id !== currentOrderId
        );
        // Sort: completed orders first, then by date
        const sortedOrders = filteredOrders.sort((a: Order, b: Order) => {
          const aCompleted = a.status === 'DELIVERED' || a.status === 'CANCELLED';
          const bCompleted = b.status === 'DELIVERED' || b.status === 'CANCELLED';
          if (aCompleted !== bCompleted) {
            return aCompleted ? -1 : 1;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setOrderHistory(sortedOrders);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const orderId = await StorageService.getOrderId();
      const restaurantData = await StorageService.getRestaurantData();
      const userData = await StorageService.getUserData();

      if (!userData) {
        setLoading(false);
        return;
      }

      if (userData) {
        setUserData(userData);
        // Always fetch order history for the user, regardless of restaurant
        if (userData.id) {
          await fetchOrderHistory(userData.id);
        }
      }

      if (restaurantData) {
        setRestaurant(restaurantData);
      }

      if (orderId) {
        const orderData = await fetchOrderDetails(orderId);
        if (orderData) {
          // If order is DELIVERED or CANCELLED, we still show it until dismissed
          setOrder(orderData);
        } else {
          // Order not found, clear it from storage
          await clearOrderData();
          // Refresh history after clearing
          if (userData?.id) {
            await fetchOrderHistory(userData.id);
          }
        }
      } else {
        setOrder(null);
      }
    } catch (error) {
      console.error('Error loading order data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'PENDING':
        return '$gray10';
      case 'CONFIRMED':
        return '$green10';
      case 'PREPARING':
        return '$yellow10';
      case 'READY':
        return '$blue10';
      case 'DELIVERED':
        return '$green11';
      case 'CANCELLED':
        return '$red10';
      default:
        return '$gray10';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewOrder = async (order: Order) => {
    // Fetch restaurant data for the order
    if (order.restaurantId && restaurant?.id === order.restaurantId) {
      setSelectedOrder(order);
    } else {
      // Fetch restaurant data
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RESTAURANTS.BY_ID(order.restaurantId)}`);
        const data = await response.json();
        if (response.ok && data.restaurant) {
          setRestaurant(data.restaurant);
          setSelectedOrder(order);
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        Alert.alert('Error', 'Failed to load restaurant details');
      }
    }
  };

  const handleBack = () => {
    // Navigate back to home/index tab
    // This will be handled by the tab navigation
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? This will clear all your data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call logout API and clear storage
              await AuthService.logout();

              // Clear all AsyncStorage keys
              await StorageService.clearAll();

              // Navigate to index tab which will show login screen
              router.replace('/');
            } catch (error) {
              console.error('Error logging out:', error);
              // Even if there's an error, try to clear storage and navigate
              try {
                await StorageService.clearAll();
                router.replace('/');
              } catch (clearError) {
                console.error('Error clearing storage:', clearError);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              }
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadData();

      // Also check for refresh trigger from cart/other screens
      const checkRefreshTrigger = async () => {
        try {
          const triggerRefresh = await AsyncStorage.getItem('@forks_refresh_orders');
          if (triggerRefresh === 'true') {
            await AsyncStorage.removeItem('@forks_refresh_orders');
            await loadData();
          }
        } catch (error) {
          console.error('Error checking refresh trigger:', error);
        }
      };
      checkRefreshTrigger();
    }, [])
  );

  // WebSocket connection for real-time order updates
  useEffect(() => {
    let unsubscribeMessage: (() => void) | null = null;
    let unsubscribeConnection: (() => void) | null = null;

    const setupWebSocket = async () => {
      try {
        // Connect to WebSocket
        await websocketService.connect();

        // Subscribe to order updates if we have an active order
        const currentOrderId = await StorageService.getOrderId();
        if (currentOrderId) {
          websocketService.subscribeToOrder(currentOrderId);
        }

        // Handle incoming messages
        unsubscribeMessage = websocketService.onMessage((message) => {
          if (message.type === 'order:updated' || message.type === 'order:created') {
            const updatedOrder = message.data as Order;

            // Notify customer when order is READY
            if (updatedOrder.status === 'READY') {
              const isCurrentOrder = order && updatedOrder.id === order.id;
              const isSelectedOrder = selectedOrder && updatedOrder.id === selectedOrder.id;
              if (isCurrentOrder || isSelectedOrder) {
                showNotification({
                  type: 'success',
                  title: 'Your order is ready!',
                  message: 'Head to the counter to pick up your order.',
                  duration: 6000,
                });
              }
            }

            // Notify customer when order is DELIVERED
            if (updatedOrder.status === 'DELIVERED') {
              const isCurrentOrder = order && updatedOrder.id === order.id;
              const isSelectedOrder = selectedOrder && updatedOrder.id === selectedOrder.id;
              if (isCurrentOrder || isSelectedOrder) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                showNotification({
                  type: 'success',
                  title: 'Order delivered!',
                  message: 'Enjoy your meal!',
                  duration: 5000,
                });
              }
            }

            // Update current order if it matches
            if (order && updatedOrder.id === order.id) {
              setOrder(updatedOrder);
            }

            // Update selected order if it matches
            if (selectedOrder && updatedOrder.id === selectedOrder.id) {
              setSelectedOrder(updatedOrder);
            }

            // Refresh order history to show updated status
            if (userData?.id) {
              fetchOrderHistory(userData.id);
            }
          }
        });

        // Handle connection state changes
        unsubscribeConnection = websocketService.onConnectionStateChange((connected) => {
          if (connected) {
            console.log('[OrderTab] WebSocket connected');
            // Resubscribe to order when reconnected
            const resubscribe = async () => {
              const currentOrderId = await StorageService.getOrderId();
              if (currentOrderId) {
                websocketService.subscribeToOrder(currentOrderId);
              }
            };
            resubscribe();
          } else {
            console.log('[OrderTab] WebSocket disconnected');
          }
        });
      } catch (error) {
        console.error('[OrderTab] Error setting up WebSocket:', error);
      }
    };

    setupWebSocket();

    // Cleanup on unmount
    return () => {
      if (unsubscribeMessage) {
        unsubscribeMessage();
      }
      if (unsubscribeConnection) {
        unsubscribeConnection();
      }
      // Don't disconnect WebSocket here as it might be used by other screens
      // websocketService.disconnect();
    };
  }, [order?.id, selectedOrder?.id, userData?.id]);

  // Subscribe to order when it changes
  useEffect(() => {
    const subscribeToOrder = async () => {
      const currentOrderId = await StorageService.getOrderId();
      if (currentOrderId && websocketService.getConnectionState()) {
        websocketService.subscribeToOrder(currentOrderId);
      }
    };

    subscribeToOrder();
  }, [order?.id]);

  // Fallback: Auto-refresh order status and history every 30 seconds (less frequent since we have WebSocket)
  useEffect(() => {
    const refreshData = async () => {
      const currentUserData = await StorageService.getUserData();
      if (!currentUserData?.id) return;

      // Refresh active order if exists (as fallback)
      const currentOrderId = await StorageService.getOrderId();
      if (currentOrderId) {
        const updatedOrder = await fetchOrderDetails(currentOrderId);
        if (updatedOrder) {
          // Update order state regardless of status
          setOrder(updatedOrder);
        } else {
          // Order not found, clear it
          await clearOrderData();
          setOrder(null);
        }
      } else {
        setOrder(null);
      }

      // Always refresh order history
      await fetchOrderHistory(currentUserData.id);
    };

    // Initial refresh
    refreshData();

    // Set up interval for auto-refresh (less frequent with WebSocket)
    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []); // Run once on mount, then refresh every 30 seconds

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <YStack flex={1} alignItems="center" justifyContent="center" padding={20} gap={16}>
          <MaterialIcons name="receipt" size={64} color="#D4C4B0" />
          <Text fontSize={24} fontWeight="700" color="$brown9" textAlign="center">
            Your Orders
          </Text>
          <Text fontSize={16} color="$lightBrown5" textAlign="center">
            Log in to see your order history and track active orders.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => requireAuth(() => loadData())}
            activeOpacity={0.8}
          >
            <Text fontSize={18} fontWeight="600" color="white">
              Log In
            </Text>
          </TouchableOpacity>
        </YStack>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text fontSize="$4" color="$gray11" marginTop="$3">
            Loading order status...
          </Text>
        </YStack>
      </ThemedView>
    );
  }

  // If viewing a specific order from history
  if (selectedOrder && restaurant) {
    return (
      <OrderStatusScreen
        order={selectedOrder}
        restaurant={restaurant}
        onBack={() => setSelectedOrder(null)}
        onLogout={handleLogout}
        onDismiss={async () => setSelectedOrder(null)}
      />
    );
  }

  // If there's an active order, show it
  if (order && restaurant) {
    return (
      <OrderStatusScreen
        order={order}
        restaurant={restaurant}
        onBack={handleBack}
        onLogout={handleLogout}
        onDismiss={async () => {
          await clearOrderData();
          if (userData?.id) {
            await fetchOrderHistory(userData.id);
          }
        }}
      />
    );
  }

  // Show order history when no active order
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={DesignTokens.colors.orange[500]}
            colors={[DesignTokens.colors.orange[500]]}
            progressViewOffset={Platform.OS === 'android' ? 20 : 0}
          />
        }
      >
        {/* TopBar for Customer users */}
        {userData?.role === 'CUSTOMER' && (
          <TopBar
            userName={userData ? `${userData.firstName} ${userData.lastName}` : 'Customer'}
            userRole={userData.role}
            onLogout={handleLogout}
          />
        )}

        <YStack gap="$4" padding="$4">
          {/* Order History Section - Always show when no active order */}
          {!order && (
            <YStack gap="$3">
              <Text fontSize="$7" fontWeight="bold" color="$brown9">
                Order History
              </Text>

              {loadingHistory ? (
                <YStack padding="$6" alignItems="center" gap="$3">
                  <ActivityIndicator size="large" color="#F97316" />
                  <Text fontSize="$4" color="$lightBrown5">
                    Loading order history...
                  </Text>
                </YStack>
              ) : orderHistory.length > 0 ? (
                <YStack gap="$3">
                  {orderHistory.map((historyOrder) => (
                    <TouchableOpacity
                      key={historyOrder.id}
                      onPress={() => handleViewOrder(historyOrder)}
                      activeOpacity={0.7}
                    >
                      <Card
                        padding="md"
                        backgroundColor="white"
                        borderRadius="lg"
                        shadow="sm"
                        style={{
                          borderWidth: 1,
                          borderColor: '#E8E0D6',
                        }}
                      >
                        <YStack gap="$3">
                          <XStack justifyContent="space-between" alignItems="flex-start">
                            <YStack flex={1} gap="$2">
                              <XStack gap="$2" alignItems="center" flexWrap="wrap">
                                <Text
                                  fontSize={18}
                                  fontWeight="700"
                                  color="$brown9"
                                >
                                  Order #{historyOrder.id.substring(0, 8).toUpperCase()}
                                </Text>
                                <Badge
                                  variant={
                                    historyOrder.status === 'DELIVERED'
                                      ? 'success'
                                      : historyOrder.status === 'CANCELLED'
                                        ? 'error'
                                        : historyOrder.status === 'CONFIRMED' || historyOrder.status === 'PREPARING' || historyOrder.status === 'READY'
                                          ? 'info'
                                          : 'neutral'
                                  }
                                  size="sm"
                                >
                                  {historyOrder.status}
                                </Badge>
                              </XStack>
                              {historyOrder.restaurant && (
                                <Text
                                  fontSize={14}
                                  fontWeight="500"
                                  color="$brown9"
                                >
                                  {historyOrder.restaurant.name || 'Restaurant'}
                                </Text>
                              )}
                              <Text
                                fontSize={12}
                                fontWeight="400"
                                color="$lightBrown5"
                              >
                                {formatDate(historyOrder.createdAt)}
                              </Text>
                              {historyOrder.orderItems && historyOrder.orderItems.length > 0 && (
                                <Text
                                  fontSize={12}
                                  fontWeight="400"
                                  color="$lightBrown5"
                                >
                                  {historyOrder.orderItems.length} item{historyOrder.orderItems.length !== 1 ? 's' : ''}
                                </Text>
                              )}
                            </YStack>
                            <YStack alignItems="flex-end" gap="$1">
                              <Text
                                fontSize={20}
                                fontWeight="700"
                                color="$orange6"
                              >
                                ₹{parseFloat(historyOrder.totalAmount.toString()).toFixed(2)}
                              </Text>
                            </YStack>
                          </XStack>
                        </YStack>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </YStack>
              ) : (
                <YStack
                  padding="$6"
                  alignItems="center"
                  gap="$3"
                  backgroundColor="white"
                  borderRadius="lg"
                  borderWidth={1}
                  borderColor="#E8E0D6"
                >
                  <Text fontSize={20} fontWeight="600" color="$brown9">
                    No Orders Yet
                  </Text>
                  <Text fontSize={14} color="$lightBrown5" textAlign="center">
                    You haven't placed any orders yet.{'\n'}Start ordering to see your history here.
                  </Text>
                </YStack>
              )}
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F97316',
  },
  loginButton: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 8,
  },
});

