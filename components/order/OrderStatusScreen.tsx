import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { ThemedView } from '@/components/themed-view';
import { TopBar } from '@/components/ui/TopBar';
import { Order, Restaurant, OrderStatus } from '@/types';
import { StorageService } from '@/utils/storage';

interface OrderStatusScreenProps {
  order: Order;
  restaurant: Restaurant;
  onBack: () => void;
  onRefresh: () => Promise<void>;
  onLogout?: () => void;
}

/**
 * OrderStatusScreen Component
 * Displays order status, details, and items
 * Auto-refreshes order status every 10 seconds for active orders
 */
export function OrderStatusScreen({ 
  order, 
  restaurant, 
  onBack, 
  onRefresh,
  onLogout 
}: OrderStatusScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [orderUserData, setOrderUserData] = useState<any>(null);

  // Update current order when order prop changes
  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  // Auto-refresh order status every 10 seconds if order is not completed
  useEffect(() => {
    if (currentOrder && currentOrder.status !== 'DELIVERED' && currentOrder.status !== 'CANCELLED') {
      const interval = setInterval(async () => {
        await onRefresh();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [currentOrder?.status, onRefresh]);

  // Load user data for TopBar
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await StorageService.getUserData();
        if (userData) {
          setOrderUserData(userData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
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
            onLogout?.();
            onBack();
          },
        },
      ]
    );
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

  const getStatusIcon = (status: OrderStatus): string => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'CONFIRMED':
        return '✓';
      case 'PREPARING':
        return '👨‍🍳';
      case 'READY':
        return '🍽️';
      case 'DELIVERED':
        return '✅';
      case 'CANCELLED':
        return '❌';
      default:
        return '📋';
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

  if (!currentOrder) {
    return (
      <ThemedView style={styles.container}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text fontSize="$4" color="$gray11" marginTop="$3">
            Loading order details...
          </Text>
        </YStack>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* TopBar for Guest users */}
        {orderUserData?.role === 'GUEST' && (
          <TopBar
            userName={`${orderUserData.firstName} ${orderUserData.lastName}`}
            userRole={orderUserData.role}
            onLogout={handleLogout}
            onScanAnotherQR={onBack}
          />
        )}
        
        <YStack gap="$4" padding="$4">
          <YStack gap="$3" alignItems="center" marginBottom="$4">
            <Text fontSize="$9" fontWeight="bold" textAlign="center">
              Order Status 📦
            </Text>
            <XStack
              padding="$3"
              backgroundColor={getStatusColor(currentOrder.status)}
              borderRadius="$4"
              alignItems="center"
              gap="$2"
            >
              <Text fontSize="$6">{getStatusIcon(currentOrder.status)}</Text>
              <Text fontSize="$6" fontWeight="bold" color="white">
                {currentOrder.status}
              </Text>
            </XStack>
          </YStack>

          <YStack
            padding="$4"
            backgroundColor="$gray2"
            borderRadius="$4"
            gap="$3"
          >
            <Text fontSize="$6" fontWeight="bold" marginBottom="$2">
              Order Details
            </Text>
            <XStack justifyContent="space-between">
              <Text fontSize="$4" color="$gray11">Order ID:</Text>
              <Text fontSize="$4" fontWeight="600">
                {currentOrder.id.substring(0, 8)}...
              </Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text fontSize="$4" color="$gray11">Restaurant:</Text>
              <Text fontSize="$4" fontWeight="600">{restaurant.name}</Text>
            </XStack>
            {currentOrder.table && (
              <XStack justifyContent="space-between">
                <Text fontSize="$4" color="$gray11">Table:</Text>
                <Text fontSize="$4" fontWeight="600">
                  {currentOrder.table.tableNumber || currentOrder.table.uniqueId}
                </Text>
              </XStack>
            )}
            <XStack justifyContent="space-between">
              <Text fontSize="$4" color="$gray11">Placed:</Text>
              <Text fontSize="$4" fontWeight="600">
                {formatDate(currentOrder.createdAt)}
              </Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text fontSize="$5" fontWeight="bold">Total:</Text>
              <Text fontSize="$6" fontWeight="bold" color="$blue10">
                ₹{parseFloat(currentOrder.totalAmount.toString()).toFixed(2)}
              </Text>
            </XStack>
          </YStack>

          {currentOrder.orderItems && currentOrder.orderItems.length > 0 && (
            <YStack
              padding="$4"
              backgroundColor="$gray2"
              borderRadius="$4"
              gap="$3"
            >
              <Text fontSize="$6" fontWeight="bold" marginBottom="$2">
                Order Items ({currentOrder.orderItems.length})
              </Text>
              {currentOrder.orderItems.map((item) => (
                <XStack
                  key={item.id}
                  justifyContent="space-between"
                  paddingVertical="$2"
                  borderBottomWidth={1}
                  borderBottomColor="$gray5"
                >
                  <YStack flex={1}>
                    <Text fontSize="$4" fontWeight="600">
                      {item.menuItem?.name || 'Menu Item'}
                    </Text>
                    <Text fontSize="$3" color="$gray10">
                      Qty: {item.quantity} × ₹{parseFloat(item.price.toString()).toFixed(2)}
                    </Text>
                    {item.specialInstructions && (
                      <Text fontSize="$2" color="$gray10" fontStyle="italic">
                        Note: {item.specialInstructions}
                      </Text>
                    )}
                  </YStack>
                  <Text fontSize="$4" fontWeight="bold">
                    ₹{(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                  </Text>
                </XStack>
              ))}
            </YStack>
          )}

          <XStack gap="$3" marginTop="$2">
            <Button
              onPress={onBack}
              size="$5"
              flex={1}
              backgroundColor="$gray5"
            >
              <Text color="$gray11" fontWeight="600">
                Back
              </Text>
            </Button>
            <Button
              onPress={handleRefresh}
              size="$5"
              flex={1}
              backgroundColor="$blue10"
              disabled={refreshing}
            >
              <Text color="white" fontWeight="600">
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Text>
            </Button>
          </XStack>
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
  },
});

