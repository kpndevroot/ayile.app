import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, View, Image, Platform, RefreshControl, FlatList } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { ThemedView } from '@/components/themed-view';
import { Order, Restaurant, OrderStatus } from '@/types';
import { StorageService } from '@/utils/storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DesignTokens } from '@/constants/design';
import { useRouter } from 'expo-router';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { authenticatedFetch } from '@/utils/api';
import { getStatusBadgeColor, getStatusLabel } from '@/utils/orderUtils';

interface OrderStatusScreenProps {
  order: Order;
  restaurant: Restaurant;
  onBack: () => void;
  onLogout?: () => void;
  onDismiss: () => Promise<void>;
}

interface ProgressStep {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
}

/**
 * OrderStatusScreen Component
 * Displays order status exactly as shown in the design
 * Auto-refreshes order status every 10 seconds for active orders
 */
export function OrderStatusScreen({
  order,
  restaurant,
  onBack,
  onLogout,
  onDismiss
}: OrderStatusScreenProps) {
  const router = useRouter();
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [orderUserData, setOrderUserData] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshingHistory, setRefreshingHistory] = useState(false);
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<Order | null>(null);

  // Update current order when order prop changes
  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

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

  // Fetch order history when history tab is active
  useEffect(() => {
    if (activeTab === 'history' && orderUserData?.id) {
      fetchOrderHistory();
    }
  }, [activeTab, orderUserData?.id]);

  const fetchOrderHistory = async () => {
    if (!orderUserData?.id) return;
    
    try {
      setLoadingHistory(true);
      const response = await authenticatedFetch(
        `${API_BASE_URL}${API_ENDPOINTS.ORDERS.BASE}?userId=${orderUserData.id}&limit=50`
      );
      const data = await response.json();

      if (response.ok && data.orders) {
        // Filter out the current active order if it exists
        const currentOrderId = await StorageService.getOrderId();
        const filteredOrders = data.orders.filter(
          (o: Order) => o.id !== currentOrderId
        );
        // Sort by date (newest first)
        const sortedOrders = filteredOrders.sort((a: Order, b: Order) => {
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

  // Refresh order history only (for pull-to-refresh)
  const handleRefreshHistory = async () => {
    if (!orderUserData?.id) return;
    
    setRefreshingHistory(true);
    try {
      await fetchOrderHistory();
    } catch (error) {
      console.error('Error refreshing order history:', error);
    } finally {
      setRefreshingHistory(false);
    }
  };

  // Calculate estimated arrival time (15-20 minutes from order time)
  const getEstimatedArrival = (): string => {
    if (currentOrder.status === 'DELIVERED') {
      return 'Arrived';
    }
    const orderDate = new Date(currentOrder.createdAt);
    const estimatedMinutes = currentOrder.status === 'PREPARING' ? 15 : 20;
    const arrivalTime = new Date(orderDate.getTime() + estimatedMinutes * 60000);
    return arrivalTime.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get progress steps based on order status
  const getProgressSteps = (): ProgressStep[] => {
    const steps: ProgressStep[] = [
      { id: 'placed', label: 'Order Placed', icon: 'check', isActive: false },
      { id: 'preparing', label: 'Preparing', icon: 'restaurant', isActive: false },
      { id: 'ready', label: 'Ready', icon: 'notifications', isActive: false },
      { id: 'served', label: 'Served', icon: 'restaurant-menu', isActive: false },
    ];

    // Map order status to progress steps
    switch (currentOrder.status) {
      case 'PENDING':
      case 'CONFIRMED':
        steps[0].isActive = true;
        break;
      case 'PREPARING':
        steps[0].isActive = true;
        steps[1].isActive = true;
        break;
      case 'READY':
        steps[0].isActive = true;
        steps[1].isActive = true;
        steps[2].isActive = true;
        break;
      case 'DELIVERED':
        steps.forEach(step => step.isActive = true);
        break;
    }

    return steps;
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

  const formatDateShort = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };


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

  const handleHistoryOrderPress = async (historyOrder: Order) => {
    try {
      const fullOrderDetails = await fetchOrderDetails(historyOrder.id);
      if (fullOrderDetails) {
        setSelectedHistoryOrder(fullOrderDetails);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    }
  };

  const progressSteps = currentOrder ? getProgressSteps() : [];
  const estimatedArrival = currentOrder ? getEstimatedArrival() : '';

  const renderOrderHistoryItem = ({ item }: { item: Order }) => {
    const statusColor = getStatusBadgeColor(item.status);
    const restaurantName = item.restaurant?.name || restaurant?.name || 'Restaurant';

    return (
      <TouchableOpacity
        onPress={() => handleHistoryOrderPress(item)}
        activeOpacity={0.7}
        style={styles.historyItem}
      >
        <YStack
          backgroundColor="white"
          borderRadius={12}
          padding={16}
          gap={12}
        >
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack flex={1} gap={4}>
              <Text fontSize={16} fontWeight="700" color={DesignTokens.colors.brown[900]}>
                {restaurantName}
              </Text>
              <Text fontSize={12} color={DesignTokens.colors.lightBrown[500]}>
                {formatDate(item.createdAt)}
              </Text>
            </YStack>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <Text fontSize={12} fontWeight="600" style={{ color: statusColor }}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </XStack>

          {item.orderItems && item.orderItems.length > 0 && (
            <YStack gap={4} marginTop={4}>
              {item.orderItems.slice(0, 2).map((orderItem) => (
                <XStack key={orderItem.id} justifyContent="space-between">
                  <Text fontSize={14} color={DesignTokens.colors.brown[900]} flex={1}>
                    {orderItem.quantity}x {orderItem.menuItem?.name || 'Item'}
                  </Text>
                </XStack>
              ))}
              {item.orderItems.length > 2 && (
                <Text fontSize={12} color={DesignTokens.colors.lightBrown[500]}>
                  +{item.orderItems.length - 2} more items
                </Text>
              )}
            </YStack>
          )}

          <XStack justifyContent="space-between" alignItems="center" marginTop={4} paddingTop={12} borderTopWidth={1} borderTopColor={DesignTokens.colors.beige[200]}>
            <Text fontSize={12} color={DesignTokens.colors.lightBrown[500]}>
              Order #{item.id.substring(0, 8).toUpperCase()}
            </Text>
            <Text fontSize={18} fontWeight="700" color={DesignTokens.colors.orange[500]}>
              ₹{parseFloat((item.totalAmount || 0).toString()).toFixed(2)}
            </Text>
          </XStack>
        </YStack>
      </TouchableOpacity>
    );
  };

  const renderOrderHistory = () => {
    if (loadingHistory) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" paddingTop={100}>
          <ActivityIndicator size="large" color={DesignTokens.colors.orange[500]} />
          <Text fontSize={16} color={DesignTokens.colors.brown[900]} marginTop={16}>
            Loading order history...
          </Text>
        </YStack>
      );
    }

    if (orderHistory.length === 0) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" paddingTop={100} paddingHorizontal={20}>
          <MaterialIcons name="history" size={64} color={DesignTokens.colors.beige[300]} />
          <Text fontSize={20} fontWeight="600" color={DesignTokens.colors.brown[900]} marginTop={16} textAlign="center">
            No Order History
          </Text>
          <Text fontSize={14} color={DesignTokens.colors.lightBrown[500]} marginTop={8} textAlign="center">
            Your past orders will appear here
          </Text>
        </YStack>
      );
    }

    return (
      <FlatList
        data={orderHistory}
        renderItem={renderOrderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.historyList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshingHistory}
            onRefresh={handleRefreshHistory}
            tintColor={DesignTokens.colors.orange[500]}
            colors={[DesignTokens.colors.orange[500]]}
          />
        }
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={20}
        paddingTop={orderUserData?.role === 'CUSTOMER' ? 12 : 60}
        paddingBottom={16}
        backgroundColor="white"
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text fontSize={20} fontWeight="700" color={DesignTokens.colors.brown[900]}>
          {activeTab === 'current' ? 'Order Status' : 'Order History'}
        </Text>
        <View style={styles.backButton} />
      </XStack>

      {/* Tabs */}
      <XStack
        backgroundColor="white"
        paddingHorizontal={20}
        paddingVertical={12}
        gap={8}
        borderBottomWidth={1}
        borderBottomColor={DesignTokens.colors.beige[200]}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('current')}
          style={[styles.tab, activeTab === 'current' && styles.tabActive]}
          activeOpacity={0.7}
        >
          <Text
            fontSize={16}
            fontWeight={activeTab === 'current' ? '700' : '500'}
            color={activeTab === 'current' ? DesignTokens.colors.orange[500] : DesignTokens.colors.lightBrown[500]}
          >
            Current Order
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          activeOpacity={0.7}
        >
          <Text
            fontSize={16}
            fontWeight={activeTab === 'history' ? '700' : '500'}
            color={activeTab === 'history' ? DesignTokens.colors.orange[500] : DesignTokens.colors.lightBrown[500]}
          >
            Order History
          </Text>
        </TouchableOpacity>
      </XStack>

      {activeTab === 'current' ? (
        !currentOrder ? (
          <YStack flex={1} alignItems="center" justifyContent="center" paddingTop={100} paddingHorizontal={20}>
            <MaterialIcons name="shopping-bag" size={64} color={DesignTokens.colors.beige[300]} />
            <Text fontSize={20} fontWeight="600" color={DesignTokens.colors.brown[900]} marginTop={16} textAlign="center">
              No Active Order
            </Text>
            <Text fontSize={14} color={DesignTokens.colors.lightBrown[500]} marginTop={8} textAlign="center">
              You don't have an active order right now
            </Text>
            <TouchableOpacity
              style={[styles.orderMoreButton, { marginTop: 24, maxWidth: 200 }]}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)' as any)}
            >
              <MaterialIcons name="shopping-cart" size={20} color="#FFFFFF" />
              <Text
                fontSize={16}
                fontWeight="600"
                color="#FFFFFF"
                marginLeft={8}
              >
                Browse Menu
              </Text>
            </TouchableOpacity>
          </YStack>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

          <YStack
            paddingHorizontal={20}
            paddingTop={20}
            paddingBottom={100}
            backgroundColor={DesignTokens.colors.background.light}
          >
            {/* Status Card with Chef Image */}
            <YStack
              backgroundColor={currentOrder.status === 'DELIVERED' ? '#DCFCE7' : DesignTokens.colors.beige[200]}
              borderRadius={20}
              padding={24}
              alignItems="center"
              marginBottom={24}
              style={styles.statusCard}
            >
            {/* Chef/Status Image Placeholder */}
            <View style={styles.chefImageContainer}>
              <View style={[
                styles.chefImageCircle,
                currentOrder.status === 'DELIVERED' && { backgroundColor: DesignTokens.colors.semantic.success }
              ]}>
                <MaterialIcons
                  name={currentOrder.status === 'DELIVERED' ? "check-circle" : "restaurant"}
                  size={60}
                  color="#FFFFFF"
                />
              </View>
            </View>

            {/* Status Message */}
            <Text
              fontSize={18}
              fontWeight="700"
              color={DesignTokens.colors.brown[900]}
              textAlign="center"
              marginTop={16}
              marginBottom={8}
            >
              {currentOrder.status === 'DELIVERED'
                ? 'Your order has been delivered!'
                : 'Our chefs are working on your order!'}
            </Text>

            {/* Estimated Arrival Label */}
            <Text
              fontSize={12}
              fontWeight="600"
              color={currentOrder.status === 'DELIVERED' ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[500]}
              textTransform="uppercase"
              letterSpacing={1}
              marginTop={8}
            >
              {currentOrder.status === 'DELIVERED' ? 'STATUS' : 'ESTIMATED ARRIVAL'}
            </Text>

            {/* Estimated Time */}
            <Text
              fontSize={32}
              fontWeight="700"
              color={DesignTokens.colors.brown[900]}
              marginTop={4}
            >
              {estimatedArrival}
            </Text>
          </YStack>

          {/* Progress Tracker */}
          <YStack marginBottom={16}>
            <View style={styles.progressWrapper}>
              {progressSteps.map((step, index) => {
                const isActive = step.isActive;
                const isLast = index === progressSteps.length - 1;
                const nextStep = !isLast ? progressSteps[index + 1] : null;
                const isNextActive = nextStep?.isActive || false;
                const lineActive = isActive && isNextActive;

                return (
                  <View key={step.id} style={styles.progressItemContainer}>
                    <View style={styles.progressStep}>
                      {/* Step Circle */}
                      <View
                        style={[
                          styles.progressCircle,
                          isActive
                            ? styles.progressCircleActive
                            : styles.progressCircleInactive
                        ]}
                      >
                        <MaterialIcons
                          name={step.icon as any}
                          size={20}
                          color={isActive ? '#FFFFFF' : DesignTokens.colors.lightBrown[500]}
                        />
                      </View>

                      {/* Step Label */}
                      <Text
                        fontSize={12}
                        fontWeight="500"
                        color={isActive ? DesignTokens.colors.orange[500] : DesignTokens.colors.lightBrown[500]}
                        marginTop={8}
                        textAlign="center"
                      >
                        {step.label}
                      </Text>
                    </View>

                    {/* Connector Line */}
                    {!isLast && (
                      <View
                        style={[
                          styles.progressLine,
                          lineActive
                            ? styles.progressLineActive
                            : styles.progressLineInactive,
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </YStack>

          {/* View Details Section */}
          <TouchableOpacity
            onPress={() => setShowDetails(!showDetails)}
            style={styles.detailsButton}
            activeOpacity={0.7}
          >
            <Text
              fontSize={16}
              fontWeight="600"
              color={DesignTokens.colors.brown[900]}
            >
              View Details
            </Text>
            <MaterialIcons
              name={showDetails ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color="#000000"
            />
          </TouchableOpacity>

          {/* Expandable Details */}
          {showDetails && (
            <YStack
              backgroundColor="white"
              borderRadius={12}
              padding={20}
              marginTop={12}
              gap={16}
            >
              <XStack justifyContent="space-between">
                <Text fontSize={14} color={DesignTokens.colors.lightBrown[500]}>
                  Order ID:
                </Text>
                <Text fontSize={14} fontWeight="600" color={DesignTokens.colors.brown[900]}>
                  {currentOrder.id.substring(0, 8).toUpperCase()}
                </Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text fontSize={14} color={DesignTokens.colors.lightBrown[500]}>
                  Restaurant:
                </Text>
                <Text fontSize={14} fontWeight="600" color={DesignTokens.colors.brown[900]}>
                  {restaurant?.name || 'Restaurant'}
                </Text>
              </XStack>
              {currentOrder.table && (
                <XStack justifyContent="space-between">
                  <Text fontSize={14} color={DesignTokens.colors.lightBrown[500]}>
                    Table:
                  </Text>
                  <Text fontSize={14} fontWeight="600" color={DesignTokens.colors.brown[900]}>
                    {currentOrder.table.tableNumber || currentOrder.table.uniqueId}
                  </Text>
                </XStack>
              )}
              <XStack justifyContent="space-between">
                <Text fontSize={14} color={DesignTokens.colors.lightBrown[500]}>
                  Placed:
                </Text>
                <Text fontSize={14} fontWeight="600" color={DesignTokens.colors.brown[900]}>
                  {formatDate(currentOrder.createdAt)}
                </Text>
              </XStack>
              <XStack justifyContent="space-between" marginTop={8}>
                <Text fontSize={18} fontWeight="700" color={DesignTokens.colors.brown[900]}>
                  Total:
                </Text>
                <Text fontSize={20} fontWeight="700" color={DesignTokens.colors.orange[500]}>
                  ₹{parseFloat((currentOrder.totalAmount || 0).toString()).toFixed(2)}
                </Text>
              </XStack>

              {currentOrder.orderItems && currentOrder.orderItems.length > 0 && (
                <YStack marginTop={16} gap={12}>
                  <Text fontSize={16} fontWeight="700" color={DesignTokens.colors.brown[900]} marginBottom={8}>
                    Order Items ({currentOrder.orderItems.length})
                  </Text>
                  {currentOrder.orderItems.map((item) => (
                    <XStack
                      key={item.id}
                      justifyContent="space-between"
                      paddingVertical={8}
                      borderBottomWidth={1}
                      borderBottomColor={DesignTokens.colors.beige[200]}
                    >
                      <YStack flex={1}>
                        <Text fontSize={14} fontWeight="600" color={DesignTokens.colors.brown[900]}>
                          {item.menuItem?.name || 'Menu Item'}
                        </Text>
                        <Text fontSize={12} color={DesignTokens.colors.lightBrown[500]} marginTop={4}>
                          Qty: {item.quantity} × ₹{parseFloat((item.basePrice || item.price || 0).toString()).toFixed(2)}
                        </Text>
                      </YStack>
                      <Text fontSize={14} fontWeight="700" color={DesignTokens.colors.brown[900]}>
                        ₹{parseFloat((item.totalPrice || (parseFloat((item.basePrice || item.price || 0).toString()) * item.quantity)).toString()).toFixed(2)}
                      </Text>
                    </XStack>
                  ))}
                </YStack>
              )}
            </YStack>
          )}
        </YStack>
      </ScrollView>
        )
      ) : (
        <View style={styles.historyContainer}>
          {renderOrderHistory()}
          
          {/* Order Details Modal for History */}
          {selectedHistoryOrder && showDetails && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <XStack justifyContent="space-between" alignItems="center" marginBottom={20}>
                  <Text fontSize={20} fontWeight="700" color={DesignTokens.colors.brown[900]}>
                    Order Details
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowDetails(false);
                      setSelectedHistoryOrder(null);
                    }}
                  >
                    <MaterialIcons name="close" size={24} color={DesignTokens.colors.brown[900]} />
                  </TouchableOpacity>
                </XStack>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <YStack gap={16}>
                    <XStack justifyContent="space-between">
                      <Text fontSize={14} color={DesignTokens.colors.lightBrown[500]}>
                        Order ID:
                      </Text>
                      <Text fontSize={14} fontWeight="600" color={DesignTokens.colors.brown[900]}>
                        {selectedHistoryOrder.id.substring(0, 8).toUpperCase()}
                      </Text>
                    </XStack>
                    <XStack justifyContent="space-between">
                      <Text fontSize={14} color={DesignTokens.colors.lightBrown[500]}>
                        Restaurant:
                      </Text>
                      <Text fontSize={14} fontWeight="600" color={DesignTokens.colors.brown[900]}>
                        {selectedHistoryOrder.restaurant?.name || restaurant?.name || 'Restaurant'}
                      </Text>
                    </XStack>
                    {selectedHistoryOrder.table && (
                      <XStack justifyContent="space-between">
                        <Text fontSize={14} color={DesignTokens.colors.lightBrown[500]}>
                          Table:
                        </Text>
                        <Text fontSize={14} fontWeight="600" color={DesignTokens.colors.brown[900]}>
                          {selectedHistoryOrder.table.tableNumber || selectedHistoryOrder.table.uniqueId}
                        </Text>
                      </XStack>
                    )}
                    <XStack justifyContent="space-between">
                      <Text fontSize={14} color={DesignTokens.colors.lightBrown[500]}>
                        Status:
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: `${getStatusBadgeColor(selectedHistoryOrder.status)}15` }]}>
                        <Text fontSize={12} fontWeight="600" style={{ color: getStatusBadgeColor(selectedHistoryOrder.status) }}>
                          {getStatusLabel(selectedHistoryOrder.status)}
                        </Text>
                      </View>
                    </XStack>
                    <XStack justifyContent="space-between">
                      <Text fontSize={14} color={DesignTokens.colors.lightBrown[500]}>
                        Placed:
                      </Text>
                      <Text fontSize={14} fontWeight="600" color={DesignTokens.colors.brown[900]}>
                        {formatDate(selectedHistoryOrder.createdAt)}
                      </Text>
                    </XStack>
                    <XStack justifyContent="space-between" marginTop={8}>
                      <Text fontSize={18} fontWeight="700" color={DesignTokens.colors.brown[900]}>
                        Total:
                      </Text>
                      <Text fontSize={20} fontWeight="700" color={DesignTokens.colors.orange[500]}>
                        ₹{parseFloat((selectedHistoryOrder.totalAmount || 0).toString()).toFixed(2)}
                      </Text>
                    </XStack>

                    {selectedHistoryOrder.orderItems && selectedHistoryOrder.orderItems.length > 0 && (
                      <YStack marginTop={16} gap={12}>
                        <Text fontSize={16} fontWeight="700" color={DesignTokens.colors.brown[900]} marginBottom={8}>
                          Order Items ({selectedHistoryOrder.orderItems.length})
                        </Text>
                        {selectedHistoryOrder.orderItems.map((item) => (
                          <XStack
                            key={item.id}
                            justifyContent="space-between"
                            paddingVertical={8}
                            borderBottomWidth={1}
                            borderBottomColor={DesignTokens.colors.beige[200]}
                          >
                            <YStack flex={1}>
                              <Text fontSize={14} fontWeight="600" color={DesignTokens.colors.brown[900]}>
                                {item.menuItem?.name || 'Menu Item'}
                              </Text>
                              <Text fontSize={12} color={DesignTokens.colors.lightBrown[500]} marginTop={4}>
                                Qty: {item.quantity} × ₹{parseFloat((item.basePrice || item.price || 0).toString()).toFixed(2)}
                              </Text>
                            </YStack>
                            <Text fontSize={14} fontWeight="700" color={DesignTokens.colors.brown[900]}>
                              ₹{parseFloat((item.totalPrice || (parseFloat((item.basePrice || item.price || 0).toString()) * item.quantity)).toString()).toFixed(2)}
                            </Text>
                          </XStack>
                        ))}
                      </YStack>
                    )}
                  </YStack>
                </ScrollView>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Bottom Action Buttons - Only show for current order tab */}
      {activeTab === 'current' && (
        <XStack
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          paddingHorizontal={20}
          paddingVertical={16}
          backgroundColor="white"
          gap={12}
          style={styles.bottomButtons}
        >
          {/* Need Help Button */}
        
            <TouchableOpacity
              style={styles.helpButton}
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert('Need Help?', 'Contact restaurant support for assistance with your order.');
              }}
            >
              <MaterialIcons name="help-outline" size={20} color={DesignTokens.colors.orange[500]} />
              <Text
                fontSize={16}
                fontWeight="600"
                color={DesignTokens.colors.orange[500]}
                marginLeft={8}
              >
                Need Help?
              </Text>
            </TouchableOpacity>

          {/* Order More Button */}
          <TouchableOpacity
            style={styles.orderMoreButton}
            activeOpacity={0.8}
            onPress={() => {
              router.push('/(tabs)' as any);
            }}
          >
            <MaterialIcons name="shopping-cart" size={20} color="#FFFFFF" />
            <Text
              fontSize={16}
              fontWeight="600"
              color="#FFFFFF"
              marginLeft={8}
            >
              Order More
            </Text>
          </TouchableOpacity>
        </XStack>
      )}
    </ThemedView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DesignTokens.colors.orange[500],
  },
  statusCard: {
    ...DesignTokens.shadows.md,
  },
  chefImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chefImageCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2D5016', // Dark green background
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignTokens.shadows.lg,
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignTokens.shadows.sm,
  },
  progressCircleActive: {
    backgroundColor: DesignTokens.colors.orange[500],
  },
  progressCircleInactive: {
    backgroundColor: DesignTokens.colors.beige[200],
  },
  progressWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  progressItemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    flex: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  progressLine: {
    flex: 1,
    height: 3,
    marginTop: -24,
    marginHorizontal: -24,
    zIndex: 1,
  },
  progressLineActive: {
    backgroundColor: DesignTokens.colors.orange[500],
  },
  progressLineInactive: {
    backgroundColor: DesignTokens.colors.beige[200],
  },
  detailsButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...DesignTokens.shadows.sm,
  },
  bottomButtons: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.beige[200],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  helpButton: {
    flex: 1,
    backgroundColor: DesignTokens.colors.beige[200],
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderMoreButton: {
    flex: 1,
    backgroundColor: DesignTokens.colors.orange[500],
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignTokens.shadows.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: DesignTokens.colors.beige[200],
  },
  historyContainer: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.light,
  },
  historyList: {
    padding: 20,
    paddingBottom: 100,
  },
  historyItem: {
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    ...DesignTokens.shadows.lg,
  },
});
