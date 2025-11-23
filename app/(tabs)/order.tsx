import { useState, useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, ActivityIndicator, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { TopBar } from '@/components/ui/TopBar';
import { OrderStatusScreen } from '@/components/order/OrderStatusScreen';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Order, Restaurant, OrderStatus } from '@/types';
import { StorageService } from '@/utils/storage';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { authenticatedFetch } from '@/utils/api';
import { DesignTokens } from '@/constants/design';

/**
 * Order Status Tab
 * Displays current order status and details
 */
export default function OrderTab() {
  const [order, setOrder] = useState<Order | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
        const filteredOrders = data.orders.filter(
          (o: Order) => o.id !== currentOrderId && (o.status === 'DELIVERED' || o.status === 'CANCELLED')
        );
        setOrderHistory(filteredOrders);
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

      if (userData) {
        setUserData(userData);
        // Fetch order history for the user
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
          // If order is DELIVERED or CANCELLED, clear it to allow new order
          if (orderData.status === 'DELIVERED' || orderData.status === 'CANCELLED') {
            await clearOrderData();
            // Refresh history after clearing
            if (userData?.id) {
              await fetchOrderHistory(userData.id);
            }
          } else {
            setOrder(orderData);
          }
        } else {
          // Order not found, clear it from storage
          await clearOrderData();
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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
            await StorageService.clearAll();
            // Navigation will be handled by the parent component
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Auto-refresh order status every 10 seconds if order is active
  useEffect(() => {
    if (!order || order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      return;
    }

    const interval = setInterval(async () => {
      const orderId = await StorageService.getOrderId();
      if (orderId) {
        const updatedOrder = await fetchOrderDetails(orderId);
        if (updatedOrder) {
          // If order becomes DELIVERED or CANCELLED, clear it
          if (updatedOrder.status === 'DELIVERED' || updatedOrder.status === 'CANCELLED') {
            await clearOrderData();
          } else {
            setOrder(updatedOrder);
          }
        }
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [order?.status, order?.id]);

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
        onRefresh={async () => {
          if (userData?.id) {
            await fetchOrderHistory(userData.id);
            const updatedOrder = await fetchOrderDetails(selectedOrder.id);
            if (updatedOrder) {
              setSelectedOrder(updatedOrder);
            }
          }
        }}
        onLogout={handleLogout}
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
        onRefresh={handleRefresh}
        onLogout={handleLogout}
      />
    );
  }

  // Show order history when no active order
  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* TopBar for Guest users */}
        {userData?.role === 'GUEST' && (
          <TopBar
            userName={userData ? `${userData.firstName} ${userData.lastName}` : 'Guest'}
            userRole={userData.role}
            onLogout={handleLogout}
          />
        )}

        <YStack gap="$4" padding="$4">
          {/* No Active Order Section */}
          <YStack alignItems="center" justifyContent="center" padding="$4" gap="$2">
            <Text fontSize="$8" fontWeight="bold" textAlign="center" marginBottom="$2">
              {!restaurant ? 'No Active Order 📦' : 'Order History 📋'}
            </Text>
            <Text fontSize="$4" color="$gray11" textAlign="center" marginBottom="$4">
              {!restaurant
                ? 'Please scan a QR code to view restaurant and place an order'
                : 'You don\'t have any active orders. View your past orders below.'}
            </Text>
          </YStack>

          {/* Order History Section */}
          {restaurant && (
            <YStack gap="$3">
              <Text fontSize="$7" fontWeight="bold">
                Order History
              </Text>
              
              {loadingHistory ? (
                <YStack padding="$6" alignItems="center" gap="$3">
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text fontSize="$4" color="$gray11">
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
                        backgroundColor={DesignTokens.colors.neutral.white}
                        borderRadius="lg"
                        shadow="sm"
                      >
                        <YStack gap="$3">
                          <XStack justifyContent="space-between" alignItems="flex-start">
                            <YStack flex={1} gap="$2">
                              <XStack gap="$2" alignItems="center" flexWrap="wrap">
                                <Text
                                  style={{
                                    fontSize: DesignTokens.typography.fontSize.lg,
                                    fontWeight: DesignTokens.typography.fontWeight.bold,
                                    color: DesignTokens.colors.neutral.gray900,
                                  }}
                                >
                                  Order #{historyOrder.id.substring(0, 8)}
                                </Text>
                                <Badge
                                  variant={
                                    historyOrder.status === 'DELIVERED'
                                      ? 'success'
                                      : historyOrder.status === 'CANCELLED'
                                      ? 'error'
                                      : 'info'
                                  }
                                  size="sm"
                                >
                                  {historyOrder.status}
                                </Badge>
                              </XStack>
                              <Text
                                style={{
                                  fontSize: DesignTokens.typography.fontSize.sm,
                                  color: DesignTokens.colors.neutral.gray600,
                                }}
                              >
                                {historyOrder.restaurant?.name || 'Restaurant'}
                              </Text>
                              <Text
                                style={{
                                  fontSize: DesignTokens.typography.fontSize.sm,
                                  color: DesignTokens.colors.neutral.gray500,
                                }}
                              >
                                {formatDate(historyOrder.createdAt)}
                              </Text>
                              {historyOrder.orderItems && historyOrder.orderItems.length > 0 && (
                                <Text
                                  style={{
                                    fontSize: DesignTokens.typography.fontSize.sm,
                                    color: DesignTokens.colors.neutral.gray500,
                                  }}
                                >
                                  {historyOrder.orderItems.length} item{historyOrder.orderItems.length !== 1 ? 's' : ''}
                                </Text>
                              )}
                            </YStack>
                            <YStack alignItems="flex-end" gap="$1">
                              <Text
                                style={{
                                  fontSize: DesignTokens.typography.fontSize.xl,
                                  fontWeight: DesignTokens.typography.fontWeight.bold,
                                  color: DesignTokens.colors.primary.blue,
                                }}
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
                <YStack padding="$6" alignItems="center" gap="$2">
                  <Text fontSize="$5" fontWeight="600" color="$gray11">
                    No Order History
                  </Text>
                  <Text fontSize="$4" color="$gray10" textAlign="center">
                    You haven't placed any orders yet. Start ordering to see your history here.
                  </Text>
                </YStack>
              )}
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});

