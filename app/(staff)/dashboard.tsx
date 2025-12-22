import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { YStack } from '@tamagui/stacks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { DesignTokens } from '@/constants/design';
import { StaffService, StaffOrder } from '@/services/staffService';
import { StorageService } from '@/utils/storage';
import { DashboardHeader } from '@/components/staff/DashboardHeader';
import { MetricsCards, DashboardMetrics } from '@/components/staff/MetricsCards';
import { TabNavigation, TabType } from '@/components/staff/TabNavigation';
import { OrdersList } from '@/components/staff/OrdersList';
import { websocketService } from '@/services/websocketService';

/**
 * Staff Dashboard Screen
 * Main dashboard showing metrics and order management
 */
export default function StaffDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  // Initial loading only for first render
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    pending: 0,
    active: 0,
    complete: 0,
    revenue: '₹0.00',
  });
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [restaurantName, setRestaurantName] = useState('Restaurant');

  // Track if data has been loaded at least once
  const isLoaded = useRef(false);

  // Load data silently when focused (replaces useEffect dependency on activeTab)
  useFocusEffect(
    useCallback(() => {
      loadData({ silent: isLoaded.current });
      isLoaded.current = true;
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

        // Subscribe to restaurant updates (staff receives all orders from their restaurant)
        const restaurantId = await StaffService.getRestaurantId();
        if (restaurantId) {
          websocketService.subscribeToRestaurant(restaurantId);
        }

        // Handle incoming messages
        unsubscribeMessage = websocketService.onMessage((message) => {
          if (message.type === 'order:created' || message.type === 'order:updated') {
            // Reload data to get updated orders and metrics
            loadData({ silent: true });
          }
        });

        // Handle connection state changes
        unsubscribeConnection = websocketService.onConnectionStateChange((connected) => {
          if (connected) {
            console.log('[StaffDashboard] WebSocket connected');
            // Resubscribe to restaurant when reconnected
            const resubscribe = async () => {
              const restaurantId = await StaffService.getRestaurantId();
              if (restaurantId) {
                websocketService.subscribeToRestaurant(restaurantId);
              }
            };
            resubscribe();
          } else {
            console.log('[StaffDashboard] WebSocket disconnected');
          }
        });
      } catch (error) {
        console.error('[StaffDashboard] Error setting up WebSocket:', error);
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
    };
  }, []);

  const loadData = async ({ silent = false } = {}) => {
    try {
      if (!silent) setInitialLoading(true);

      console.log('[Dashboard] Loading dashboard data...', { silent });

      const [metricsData, ordersData] = await Promise.all([
        StaffService.getDashboardMetrics(),
        StaffService.getOrders(),
      ]);

      setMetrics(metricsData);
      setOrders(ordersData);

      // Load restaurant details
      const restaurantData = await StaffService.getRestaurantDetails();
      if (restaurantData?.name) {
        setRestaurantName(restaurantData.name);
      }
    } catch (error) {
      console.error('[Dashboard] Error loading dashboard data:', error);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData({ silent: true });
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'active') return order.status === 'active';
    return order.status === 'complete';
  });

  const handleAcceptOrder = async (orderId: string) => {
    // Optimistic update
    const previousOrders = [...orders];
    const previousMetrics = { ...metrics };

    // Update local state immediately
    setOrders(current => current.map(order =>
      order.id === orderId ? { ...order, status: 'active' } : order
    ));
    setMetrics(current => ({
      ...current,
      pending: Math.max(0, current.pending - 1),
      active: current.active + 1
    }));

    try {
      console.log('Accepting order:', orderId);
      await StaffService.updateOrderStatus(orderId, 'CONFIRMED');
      // Background refresh to ensure consistency
      loadData({ silent: true });
    } catch (error) {
      console.error('Error accepting order:', error);
      // Revert on error
      setOrders(previousOrders);
      setMetrics(previousMetrics);
      alert('Failed to accept order. Please try again.');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    // Optimistic update
    const previousOrders = [...orders];
    const previousMetrics = { ...metrics };

    // Remove from list immediately (visual cancellation)
    setOrders(current => current.filter(order => order.id !== orderId));
    setMetrics(current => ({
      ...current,
      pending: Math.max(0, current.pending - 1)
    }));

    try {
      await StaffService.updateOrderStatus(orderId, 'CANCELLED');
      loadData({ silent: true });
    } catch (error) {
      console.error('Error rejecting order:', error);
      // Revert
      setOrders(previousOrders);
      setMetrics(previousMetrics);
      alert('Failed to reject order. Please try again.');
    }
  };

  const handleViewDetails = (orderId: string) => {
    router.push(`/(staff)/order-detail?id=${orderId}`);
  };

  const handleMarkAsPaid = async (orderId: string, isPaid: boolean) => {
    try {
      await StaffService.updatePaymentStatus(orderId, isPaid);
      // Refresh data to show updated payment status
      loadData({ silent: true });
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  };

  const handleProfilePress = () => {
    router.push('/(staff)/profile');
  };

  return (
    <YStack
      flex={1}
      backgroundColor={DesignTokens.colors.background.light}
      paddingTop={insets.top}
    >
      {/* Header */}
      <DashboardHeader
        restaurantName={restaurantName}
        onProfilePress={handleProfilePress}
      />

      {initialLoading ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color={DesignTokens.colors.orange[500]} />
        </YStack>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={DesignTokens.colors.orange[500]}
              colors={[DesignTokens.colors.orange[500]]} // Android
            />
          }
        >
          <YStack padding="$4" space="$4">
            {/* Metrics Cards */}
            <MetricsCards metrics={metrics} />

            {/* Tab Navigation */}
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              pendingCount={metrics.pending}
            />

            {/* Orders List */}
            <OrdersList
              orders={filteredOrders}
              activeTab={activeTab}
              onAccept={handleAcceptOrder}
              onReject={handleRejectOrder}
              onViewDetails={handleViewDetails}
              onMarkAsPaid={handleMarkAsPaid}
            />
          </YStack>
        </ScrollView>
      )}
    </YStack>
  );
}
