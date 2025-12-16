import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, View, Image, Platform, RefreshControl, Animated } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { ThemedView } from '@/components/themed-view';
import { TopBar } from '@/components/ui/TopBar';
import { Order, Restaurant, OrderStatus } from '@/types';
import { StorageService } from '@/utils/storage';
import { AuthService } from '@/services/authService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DesignTokens } from '@/constants/design';
import { useRouter } from 'expo-router';

interface OrderStatusScreenProps {
  order: Order;
  restaurant: Restaurant;
  onBack: () => void;
  onRefresh: () => Promise<void>;
  onLogout?: () => void;
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
  onRefresh,
  onLogout 
}: OrderStatusScreenProps) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [orderUserData, setOrderUserData] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [refreshRotation] = useState(new Animated.Value(0));

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
    
    // Animate refresh icon rotation
    const rotateAnimation = Animated.loop(
      Animated.timing(refreshRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      { iterations: -1 }
    );
    rotateAnimation.start();
    
    try {
      await onRefresh();
    } finally {
      // Stop rotation animation
      rotateAnimation.stop();
      Animated.timing(refreshRotation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      setRefreshing(false);
    }
  };

  // Rotation animation for refresh icon
  const rotation = refreshRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
              
              // Call the onLogout callback if provided
              onLogout?.();
              
              // Navigate to index tab which will show login screen
              router.replace('/(tabs)/');
            } catch (error) {
              console.error('Error logging out:', error);
              // Even if there's an error, try to clear storage and navigate
              try {
                await StorageService.clearAll();
                onLogout?.();
                router.replace('/(tabs)/');
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

  // Calculate estimated arrival time (15-20 minutes from order time)
  const getEstimatedArrival = (): string => {
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

  if (!currentOrder) {
    return (
      <ThemedView style={styles.container}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color="#F97316" />
          <Text fontSize={18} color={DesignTokens.colors.brown[900]} marginTop={16}>
            Loading order details...
          </Text>
        </YStack>
      </ThemedView>
    );
  }

  const progressSteps = getProgressSteps();
  const estimatedArrival = getEstimatedArrival();

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={DesignTokens.colors.orange[500]}
            colors={[DesignTokens.colors.orange[500]]}
            progressViewOffset={Platform.OS === 'android' ? 20 : 0}
          />
        }
      >
        {/* TopBar for Customer users */}
        {orderUserData?.role === 'CUSTOMER' && (
          <TopBar
            userName={`${orderUserData.firstName} ${orderUserData.lastName}`}
            userRole={orderUserData.role}
            onLogout={handleLogout}
            onScanAnotherQR={onBack}
          />
        )}
        
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
          <Text 
            fontSize={20} 
            fontWeight="700" 
            color={DesignTokens.colors.brown[900]}
            style={styles.headerTitle}
          >
            Order Status
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={refreshing}
            style={styles.refreshButton}
            activeOpacity={0.7}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={DesignTokens.colors.orange[500]} />
            ) : (
              <MaterialIcons name="refresh" size={24} color={DesignTokens.colors.orange[500]} />
            )}
          </TouchableOpacity>
        </XStack>

        <YStack 
          paddingHorizontal={20} 
          paddingTop={20}
          paddingBottom={100}
          backgroundColor={DesignTokens.colors.background.light}
        >
          {/* Status Card with Chef Image */}
          <YStack
            backgroundColor={DesignTokens.colors.beige[200]}
            borderRadius={20}
            padding={24}
            alignItems="center"
            marginBottom={24}
            style={styles.statusCard}
          >
            {/* Chef Image Placeholder */}
            <View style={styles.chefImageContainer}>
              <View style={styles.chefImageCircle}>
                <MaterialIcons name="restaurant" size={60} color="#FFFFFF" />
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
              Our chefs are working on your order!
            </Text>

            {/* Estimated Arrival Label */}
            <Text
              fontSize={12}
              fontWeight="600"
              color={DesignTokens.colors.orange[500]}
              textTransform="uppercase"
              letterSpacing={1}
              marginTop={8}
            >
              ESTIMATED ARRIVAL
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
                  {restaurant.name}
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
                ₹{parseFloat(currentOrder.totalAmount.toString()).toFixed(2)}
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
                      Qty: {item.quantity} × ₹{parseFloat(item.price.toString()).toFixed(2)}
                    </Text>
                  </YStack>
                      <Text fontSize={14} fontWeight="700" color={DesignTokens.colors.brown[900]}>
                    ₹{(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                  </Text>
                </XStack>
              ))}
                </YStack>
              )}
            </YStack>
          )}
        </YStack>
      </ScrollView>

      {/* Bottom Action Buttons */}
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
    </ThemedView>
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
});
