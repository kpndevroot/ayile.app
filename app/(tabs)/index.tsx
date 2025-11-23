import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, View, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Input } from '@tamagui/input';
import { Button } from '@tamagui/button';
import { Label } from '@tamagui/label';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { ThemedView } from '@/components/themed-view';

type UserRole = 'GUEST' | 'ADMIN' | 'STAFF';

type Step = 1 | 2 | 3 | 4;

const USER_CREATED_KEY = '@forks_user_created';
const USER_DATA_KEY = '@forks_user_data';
const USER_ID_KEY = '@forks_user_id';
const AUTH_TOKEN_KEY = 'auth_token';
const RESTAURANT_DATA_KEY = '@forks_restaurant_data';
const SCANNED_KEY = '@forks_qr_scanned';
const ORDER_ID_KEY = '@forks_order_id';
const TABLE_INFO_KEY = '@forks_table_info';

const API_BASE_URL = 'http://192.168.30.26:3000';

// Helper function to get auth token
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to make authenticated API requests
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

// QR Scanner Component
function QRScanner({ onScanSuccess, onClose }: { onScanSuccess: (restaurantId: string) => void; onClose: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      // Parse the QR code URL to extract restaurant ID and table unique ID
      // Format: http://baseUrl/restaurant/{restaurantId}/table/{uniqueId}
      const urlPattern = /\/restaurant\/([^/]+)\/table\/([^/]+)/;
      const match = data.match(urlPattern);
      
      if (match && match[1] && match[2]) {
        const restaurantId = match[1];
        const tableUniqueId = match[2];
        
        // Store table info
        await AsyncStorage.setItem(TABLE_INFO_KEY, JSON.stringify({ uniqueId: tableUniqueId }));
        await AsyncStorage.setItem(SCANNED_KEY, 'true');
        onScanSuccess(restaurantId);
      } else {
        Alert.alert('Invalid QR Code', 'This QR code is not a valid restaurant table code.');
        setScanned(false);
      }
    } catch (error) {
      console.error('Error parsing QR code:', error);
      Alert.alert('Error', 'Failed to process QR code. Please try again.');
      setScanned(false);
    }
  };

  if (!permission) {
  return (
      <ThemedView style={styles.container}>
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
          <Text fontSize="$5" color="$gray11" textAlign="center">
            Requesting camera permission...
          </Text>
        </YStack>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" gap="$4">
          <Text fontSize="$6" fontWeight="bold" textAlign="center">
            Camera Permission Required
          </Text>
          <Text fontSize="$4" color="$gray11" textAlign="center">
            We need access to your camera to scan QR codes
          </Text>
          <Button onPress={requestPermission} size="$5" backgroundColor="$blue10">
            <Text color="white" fontWeight="600">
              Grant Permission
            </Text>
          </Button>
        </YStack>
      </ThemedView>
    );
  }

  const { width, height } = Dimensions.get('window');
  const scanAreaSize = Math.min(width, height) * 0.7;

  return (
    <ThemedView style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <YStack flex={1} justifyContent="space-between" padding="$4">
          <XStack justifyContent="flex-end">
            <Button
              onPress={onClose}
              size="$4"
              backgroundColor="rgba(0,0,0,0.5)"
              borderRadius="$4"
            >
              <Text color="white" fontWeight="600">
                Close
              </Text>
            </Button>
          </XStack>

          <YStack alignItems="center" gap="$4">
            <YStack
              width={scanAreaSize}
              height={scanAreaSize}
              borderWidth={3}
              borderColor="white"
              borderRadius="$4"
              alignItems="center"
              justifyContent="center"
            >
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  width: 30,
                  height: 30,
                  borderTopWidth: 4,
                  borderLeftWidth: 4,
                  borderColor: '$blue10',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 30,
                  height: 30,
                  borderTopWidth: 4,
                  borderRightWidth: 4,
                  borderColor: '$blue10',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: -2,
                  left: -2,
                  width: 30,
                  height: 30,
                  borderBottomWidth: 4,
                  borderLeftWidth: 4,
                  borderColor: '$blue10',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 30,
                  height: 30,
                  borderBottomWidth: 4,
                  borderRightWidth: 4,
                  borderColor: '$blue10',
                }}
              />
            </YStack>
            <YStack
              backgroundColor="rgba(0,0,0,0.7)"
              padding="$4"
              borderRadius="$4"
              alignItems="center"
              gap="$2"
            >
              <Text fontSize="$5" fontWeight="bold" color="white" textAlign="center">
                Scan QR Code
              </Text>
              <Text fontSize="$3" color="white" textAlign="center">
                Point your camera at the restaurant table QR code
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </CameraView>
      </ThemedView>
  );
}

// Menu Item Card Component
function MenuItemCard({ 
  item, 
  orderQuantity, 
  onAdd, 
  onUpdate, 
  onRemove 
}: { 
  item: any; 
  orderQuantity: number;
  onAdd: () => void;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
}) {
  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <YStack
      padding="$4"
      backgroundColor="$gray2"
      borderRadius="$4"
      marginBottom="$3"
      gap="$2"
      borderWidth={orderQuantity > 0 ? 2 : 0}
      borderColor="$blue10"
    >
      <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
        <YStack flex={1} gap="$1">
          <XStack gap="$2" alignItems="center" flexWrap="wrap">
            <Text fontSize="$5" fontWeight="bold" flex={1}>
              {item.name}
            </Text>
            {orderQuantity > 0 && (
              <YStack
                paddingHorizontal="$3"
                paddingVertical="$1"
                backgroundColor="$blue10"
                borderRadius="$3"
              >
                <Text fontSize="$3" color="white" fontWeight="bold">
                  {orderQuantity} in cart
                </Text>
              </YStack>
            )}
            {!item.isAvailable && (
              <YStack
                paddingHorizontal="$2"
                paddingVertical="$1"
                backgroundColor="$red5"
                borderRadius="$2"
              >
                <Text fontSize="$2" color="$red11" fontWeight="600">
                  Unavailable
                </Text>
              </YStack>
            )}
          </XStack>
          
          {item.description && (
            <Text fontSize="$3" color="$gray11" numberOfLines={2}>
              {item.description}
            </Text>
          )}
          
          <XStack gap="$3" alignItems="center" marginTop="$1">
            <YStack
              paddingHorizontal="$2"
              paddingVertical="$1"
              backgroundColor="$blue3"
              borderRadius="$2"
            >
              <Text fontSize="$2" color="$blue11" fontWeight="600">
                {formatCategory(item.category)}
              </Text>
            </YStack>
            {item.preparationTime && (
              <Text fontSize="$3" color="$gray10">
                ⏱️ {item.preparationTime} min
              </Text>
            )}
          </XStack>
        </YStack>
        
        <YStack alignItems="flex-end" gap="$1">
          <Text fontSize="$6" fontWeight="bold" color="$blue10">
            ${parseFloat(item.price).toFixed(2)}
          </Text>
        </YStack>
      </XStack>

      {/* Quantity Controls */}
      {orderQuantity > 0 ? (
        <XStack gap="$2" alignItems="center" justifyContent="flex-end" marginTop="$2">
          <Button
            onPress={onRemove}
            size="$3"
            backgroundColor="$red5"
            borderRadius="$3"
            disabled={!item.isAvailable}
          >
            <Text color="$red11" fontWeight="bold" fontSize="$4">
              −
            </Text>
          </Button>
          <Text fontSize="$5" fontWeight="bold" minWidth={40} textAlign="center">
            {orderQuantity}
          </Text>
          <Button
            onPress={() => onUpdate(orderQuantity + 1)}
            size="$3"
            backgroundColor="$blue10"
            borderRadius="$3"
            disabled={!item.isAvailable}
          >
            <Text color="white" fontWeight="bold" fontSize="$4">
              +
            </Text>
          </Button>
        </XStack>
      ) : (
        <Button
          onPress={onAdd}
          size="$4"
          backgroundColor="$blue10"
          borderRadius="$4"
          marginTop="$2"
          disabled={!item.isAvailable}
        >
          <Text color="white" fontWeight="600">
            Add to Order
          </Text>
        </Button>
      )}
    </YStack>
  );
}

// Order Status Component
function OrderStatusScreen({ order, restaurant, onBack, onRefresh }: { order: any; restaurant: any; onBack: () => void; onRefresh: () => Promise<void> }) {
  const [refreshing, setRefreshing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(order);

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
  }, [currentOrder?.status]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };
  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  const formatDate = (dateString: string) => {
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
                ${parseFloat(currentOrder.totalAmount.toString()).toFixed(2)}
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
              {currentOrder.orderItems.map((item: any) => (
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
                      Qty: {item.quantity} × ${parseFloat(item.price.toString()).toFixed(2)}
                    </Text>
                    {item.specialInstructions && (
                      <Text fontSize="$2" color="$gray10" fontStyle="italic">
                        Note: {item.specialInstructions}
                      </Text>
                    )}
                  </YStack>
                  <Text fontSize="$4" fontWeight="bold">
                    ${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
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

// Restaurant Details Component
function RestaurantDetails({ restaurant, onScanAgain, onLogout }: { restaurant: any; onScanAgain: () => void; onLogout: () => void }) {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [restaurant.id]);

  const loadInitialData = async () => {
    try {
      // Load user data and table info
      const userDataStr = await AsyncStorage.getItem(USER_DATA_KEY);
      const tableInfoStr = await AsyncStorage.getItem(TABLE_INFO_KEY);
      const savedOrderId = await AsyncStorage.getItem(ORDER_ID_KEY);

      if (userDataStr) {
        setUserData(JSON.parse(userDataStr));
      }
      if (tableInfoStr) {
        setTableInfo(JSON.parse(tableInfoStr));
      }
      if (savedOrderId) {
        setOrderId(savedOrderId);
        await fetchOrderItems(savedOrderId);
        // Fetch order details to get status
        const order = await fetchOrderDetails(savedOrderId);
        if (order) {
          setOrderStatus(order.status);
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
        `${API_BASE_URL}/api/menu-items?restaurantId=${restaurant.id}&isAvailable=true`
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
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderIdToFetch}/items`);
      const data = await response.json();

      if (response.ok && data.orderItems) {
        setOrderItems(data.orderItems);
        
        // Calculate total
        const total = data.orderItems.reduce((sum: number, item: any) => {
          return sum + parseFloat(item.price.toString()) * item.quantity;
        }, 0);
        setOrderTotal(total);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const fetchOrderDetails = async (orderIdToFetch: string) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/orders/${orderIdToFetch}`);
      const data = await response.json();

      if (response.ok && data.order) {
        setOrderDetails(data.order);
        setOrderStatus(data.order.status);
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
      `Confirm your order for $${orderTotal.toFixed(2)}?`,
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
                `${API_BASE_URL}/api/orders/${orderId}`,
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

  const getOrderQuantity = (menuItemId: string) => {
    const orderItem = orderItems.find((item) => item.menuItemId === menuItemId);
    return orderItem ? orderItem.quantity : 0;
  };

  const getOrderItemId = (menuItemId: string) => {
    const orderItem = orderItems.find((item) => item.menuItemId === menuItemId);
    return orderItem ? orderItem.id : null;
  };

  const createOrderWithItem = async (menuItem: any) => {
    if (!userData) {
      Alert.alert('Error', 'User data not found. Please restart the app.');
      return null;
    }

    try {
      let userId = userData.id;
      if (!userId) {
        const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
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
        const restaurantResponse = await fetch(`${API_BASE_URL}/api/restaurants/${restaurant.id}`);
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

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
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
        await AsyncStorage.setItem(ORDER_ID_KEY, newOrderId);
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

  const handleAddItem = async (menuItem: any) => {
    if (!orderId) {
      setLoadingOrder(true);
      const newOrderId = await createOrderWithItem(menuItem);
      setLoadingOrder(false);
      return;
    }

    setLoadingOrder(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/items`, {
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

  const handleUpdateQuantity = async (menuItem: any, newQuantity: number) => {
    if (!orderId) return;

    const orderItemId = getOrderItemId(menuItem.id);
    if (!orderItemId) {
      await handleAddItem(menuItem);
      return;
    }

    setLoadingOrder(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/items/${orderItemId}`, {
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

  const handleRemoveItem = async (menuItem: any) => {
    if (!orderId) return;

    const orderItemId = getOrderItemId(menuItem.id);
    if (!orderItemId) return;

    setLoadingOrder(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/items/${orderItemId}`, {
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

  const renderMenuItem = ({ item }: { item: any }) => {
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
    return (
      <YStack gap="$4" paddingHorizontal="$4" paddingTop="$4">
        <Text fontSize="$10" fontWeight="bold" textAlign="center">
          {restaurant.name} 🍴
        </Text>

        {restaurant.description && (
          <Text fontSize="$4" color="$gray11" textAlign="center">
            {restaurant.description}
          </Text>
        )}

        <YStack
          gap="$4"
          padding="$4"
          backgroundColor="$gray2"
          borderRadius="$4"
          width="100%"
        >
          <Text fontSize="$6" fontWeight="bold" marginBottom="$2">
            Restaurant Details
          </Text>
          
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="flex-start">
              <Text fontSize="$4" color="$gray11">Address:</Text>
              <Text fontSize="$4" fontWeight="600" flex={1} textAlign="right" marginLeft="$2">
                {restaurant.address}
              </Text>
            </XStack>
            
            <XStack justifyContent="space-between">
              <Text fontSize="$4" color="$gray11">City:</Text>
              <Text fontSize="$4" fontWeight="600">
                {restaurant.city}
              </Text>
            </XStack>
            
            <XStack justifyContent="space-between">
              <Text fontSize="$4" color="$gray11">Country:</Text>
              <Text fontSize="$4" fontWeight="600">
                {restaurant.country}
              </Text>
            </XStack>
            
            <XStack justifyContent="space-between">
              <Text fontSize="$4" color="$gray11">Phone:</Text>
              <Text fontSize="$4" fontWeight="600">
                {restaurant.phone}
              </Text>
            </XStack>
            
            <XStack justifyContent="space-between">
              <Text fontSize="$4" color="$gray11">Email:</Text>
              <Text fontSize="$4" fontWeight="600">
                {restaurant.email}
              </Text>
            </XStack>
            
            {restaurant.rating !== undefined && (
              <XStack justifyContent="space-between">
                <Text fontSize="$4" color="$gray11">Rating:</Text>
                <XStack gap="$1" alignItems="center">
                  <Text fontSize="$4" fontWeight="600">
                    {restaurant.rating.toFixed(1)}
                  </Text>
                  <Text fontSize="$4">⭐</Text>
                </XStack>
              </XStack>
            )}
            
            {(restaurant.openingTime || restaurant.closingTime) && (
              <XStack justifyContent="space-between">
                <Text fontSize="$4" color="$gray11">Hours:</Text>
                <Text fontSize="$4" fontWeight="600">
                  {restaurant.openingTime || '--'} - {restaurant.closingTime || '--'}
                </Text>
              </XStack>
            )}
          </YStack>
        </YStack>

        <YStack gap="$2" marginTop="$2">
          <Text fontSize="$7" fontWeight="bold">
            Menu Items 🍽️
          </Text>
          {menuItems.length > 0 && (
            <Text fontSize="$4" color="$gray11">
              {menuItems.length} available item{menuItems.length !== 1 ? 's' : ''}
            </Text>
          )}
        </YStack>
      </YStack>
    );
  };

  const renderMenuFooter = () => {
    const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return (
      <YStack padding="$4" gap="$3">
        {orderItems.length > 0 && (
          <YStack
            padding="$4"
            backgroundColor="$blue2"
            borderRadius="$4"
            gap="$3"
            marginBottom="$2"
          >
            <Text fontSize="$6" fontWeight="bold" marginBottom="$2">
              Order Summary 🛒
            </Text>
            {orderStatus && (
              <XStack
                padding="$2"
                backgroundColor={orderStatus === 'CONFIRMED' ? '$green3' : orderStatus === 'PREPARING' ? '$yellow3' : orderStatus === 'READY' ? '$blue3' : '$gray3'}
                borderRadius="$3"
                marginBottom="$2"
                alignItems="center"
                gap="$2"
              >
                <Text fontSize="$4" fontWeight="600" color="$gray12">
                  Status: {orderStatus}
                </Text>
              </XStack>
            )}
            <XStack justifyContent="space-between">
              <Text fontSize="$4" color="$gray11">
                Items:
              </Text>
              <Text fontSize="$4" fontWeight="600">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text fontSize="$5" fontWeight="bold">
                Total:
              </Text>
              <Text fontSize="$6" fontWeight="bold" color="$blue10">
                ${orderTotal.toFixed(2)}
              </Text>
            </XStack>
            {orderStatus && (
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
                width="100%"
                backgroundColor="$blue10"
                marginTop="$2"
              >
                <Text color="white" fontWeight="600">
                  View Order Status
                </Text>
              </Button>
            )}
            {!orderStatus && (
              <Button
                onPress={placeOrder}
                size="$5"
                width="100%"
                backgroundColor="$green10"
                marginTop="$2"
                disabled={placingOrder || orderItems.length === 0}
              >
                <Text color="white" fontWeight="600" fontSize="$5">
                  {placingOrder ? 'Placing Order...' : 'Place Order ✓'}
                </Text>
              </Button>
            )}
          </YStack>
        )}
        <Button
          onPress={onScanAgain}
          size="$5"
          width="100%"
          backgroundColor="$gray5"
        >
          <Text color="$gray11" fontWeight="600">
            Scan Another QR Code
          </Text>
        </Button>
        <Button
          onPress={async () => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout? This will clear all your data and current order.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Logout',
                  style: 'destructive',
                  onPress: async () => {
                    await clearAllAsyncStorage();
                    onLogout();
                  },
                },
              ]
            );
          }}
          size="$4"
          width="100%"
          backgroundColor="$red5"
        >
          <Text color="$red11" fontWeight="600">
            Logout
          </Text>
        </Button>
      </YStack>
    );
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
    </ThemedView>
  );
}

// Logout Function
const clearAllAsyncStorage = async () => {
  try {
    // Clear AsyncStorage
    await AsyncStorage.multiRemove([
      USER_CREATED_KEY,
      USER_DATA_KEY,
      USER_ID_KEY,
      RESTAURANT_DATA_KEY,
      SCANNED_KEY,
      ORDER_ID_KEY,
      TABLE_INFO_KEY,
    ]);
    
    // Clear secure token storage
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
  }
};

// Home Page Component
function HomePage({ userData, onScanQR, onLogout }: { userData: any; onScanQR: () => void; onLogout: () => void }) {
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
            await clearAllAsyncStorage();
            onLogout();
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.homeContent}>
        <YStack gap="$6" padding="$6" alignItems="center" justifyContent="center" flex={1}>
          <YStack gap="$4" alignItems="center" maxWidth={400} width="100%">
            <Text fontSize="$10" fontWeight="bold" textAlign="center">
              Welcome to Forks! 🍴
            </Text>
            <Text fontSize="$6" color="$gray11" textAlign="center">
              Your account has been set up successfully
            </Text>
            
            {userData && (
              <YStack
                gap="$4"
                padding="$4"
                backgroundColor="$gray2"
                borderRadius="$4"
                width="100%"
                marginTop="$4"
              >
                <Text fontSize="$5" fontWeight="bold" marginBottom="$2">
                  Your Profile
                </Text>
                <YStack gap="$2">
                  <XStack justifyContent="space-between">
                    <Text fontSize="$4" color="$gray11">Name:</Text>
                    <Text fontSize="$4" fontWeight="600">
                      {userData.firstName} {userData.lastName}
                    </Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Text fontSize="$4" color="$gray11">Phone:</Text>
                    <Text fontSize="$4" fontWeight="600">{userData.phone}</Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Text fontSize="$4" color="$gray11">Role:</Text>
                    <Text fontSize="$4" fontWeight="600">{userData.role}</Text>
                  </XStack>
                </YStack>
              </YStack>
            )}

            {userData?.role === 'GUEST' && (
              <Button
                onPress={onScanQR}
                size="$5"
                width="100%"
                backgroundColor="$blue10"
                marginTop="$4"
              >
                <Text color="white" fontWeight="600" fontSize="$5">
                  Scan Restaurant QR Code 📷
                </Text>
              </Button>
            )}

            <YStack gap="$3" marginTop="$4" width="100%">
              <Text fontSize="$4" color="$gray11" textAlign="center">
                {userData?.role === 'GUEST' 
                  ? 'Scan a QR code to view restaurant details'
                  : "You're all set! Start exploring the app."}
              </Text>
            </YStack>

            <Button
              onPress={handleLogout}
              size="$4"
              width="100%"
              backgroundColor="$red5"
              marginTop="$4"
            >
              <Text color="$red11" fontWeight="600">
                Logout
              </Text>
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </ThemedView>
  );
}

// Login Screen Component
function LoginScreen({ onLoginSuccess, onSwitchToSignup }: { onLoginSuccess: (data: any) => void; onSwitchToSignup: () => void }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your phone number and password');
      return;
    }

    // Basic phone validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      Alert.alert('Invalid', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      // Call the authentication API
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.replace(/\s/g, ''),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.user && data.token) {
        const userData = {
          id: data.user.id,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phone: data.user.phone,
          role: data.user.role,
          email: data.user.email,
        };

        // Store JWT token securely
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, data.token);

        // Store user data
        await AsyncStorage.setItem(USER_CREATED_KEY, 'true');
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        await AsyncStorage.setItem(USER_ID_KEY, data.user.id);

        onLoginSuccess(userData);
      } else {
        // Handle different error status codes
        if (response.status === 401) {
          Alert.alert('Invalid Credentials', data.error || 'Invalid phone number or password. Please try again.');
        } else if (response.status === 400) {
          Alert.alert('Error', data.error || 'Please check your input and try again.');
        } else {
          Alert.alert('Error', data.error || 'Failed to login. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <YStack gap="$6" padding="$4" maxWidth={500} width="100%" alignSelf="center" justifyContent="center" flex={1}>
            <YStack gap="$4" alignItems="center" marginBottom="$4">
              <Text fontSize="$10" fontWeight="bold" textAlign="center">
                Welcome Back! 👋
              </Text>
              <Text fontSize="$5" color="$gray11" textAlign="center">
                Sign in to your account
              </Text>
            </YStack>

            <YStack gap="$4">
              <YStack gap="$2">
                <Label htmlFor="loginPhone" fontSize="$4" fontWeight="600">
                  Phone Number *
                </Label>
                <Input
                  id="loginPhone"
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChangeText={setPhone as any}
                  keyboardType="phone-pad"
                  size="$5"
                  borderWidth={2}
                  borderRadius="$4"
                  autoFocus
                />
                <Text fontSize="$2" color="$gray10">
                  Enter the phone number you used to sign up
                </Text>
              </YStack>

              <YStack gap="$2">
                <Label htmlFor="loginPassword" fontSize="$4" fontWeight="600">
                  Password *
                </Label>
                <Input
                  id="loginPassword"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword as any}
                  secureTextEntry={!showPassword}
                  size="$5"
                  borderWidth={2}
                  borderRadius="$4"
                />
                <XStack gap="$2" alignItems="center" marginTop="$1">
                  <Button
                    onPress={() => setShowPassword(!showPassword)}
                    size="$3"
                    backgroundColor="transparent"
                    padding={0}
                  >
                    <Text fontSize="$3" color="$blue10">
                      {showPassword ? 'Hide' : 'Show'} Password
                    </Text>
                  </Button>
                </XStack>
              </YStack>

              <Button
                onPress={handleLogin}
                size="$5"
                width="100%"
                backgroundColor="$blue10"
                marginTop="$2"
                disabled={loading}
              >
                <Text color="white" fontWeight="600" fontSize="$5">
                  {loading ? 'Logging in...' : 'Login'}
                </Text>
              </Button>

              <XStack gap="$2" alignItems="center" justifyContent="center" marginTop="$2">
                <Text fontSize="$4" color="$gray11">
                  Don't have an account?
                </Text>
                <Button
                  onPress={onSwitchToSignup}
                  size="$3"
                  backgroundColor="transparent"
                  padding={0}
                >
                  <Text fontSize="$4" color="$blue10" fontWeight="600">
                    Sign Up
                  </Text>
                </Button>
              </XStack>
            </YStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
      </ThemedView>
  );
}

// Setup Screen Component (keeping the existing setup screen code)
function SetupScreen({ onUserCreated, onSwitchToLogin }: { onUserCreated: (data: any) => void; onSwitchToLogin: () => void }) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('GUEST');
  const [loading, setLoading] = useState(false);

  const totalSteps = 4;

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        if (!phone.trim()) {
          Alert.alert('Required', 'Please enter your mobile number');
          return false;
        }
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
          Alert.alert('Invalid', 'Please enter a valid mobile number');
          return false;
        }
        return true;
      case 2:
        if (!firstName.trim()) {
          Alert.alert('Required', 'Please enter your first name');
          return false;
        }
        if (!lastName.trim()) {
          Alert.alert('Required', 'Please enter your last name');
          return false;
        }
        return true;
      case 3:
        if (!password.trim()) {
          Alert.alert('Required', 'Please enter a password');
          return false;
        }
        if (password.length < 6) {
          Alert.alert('Invalid', 'Password must be at least 6 characters');
          return false;
        }
        if (password !== confirmPassword) {
          Alert.alert('Mismatch', 'Passwords do not match');
          return false;
        }
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => (prev + 1) as Step);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);

    try {
      const email = `${phone.replace(/\s/g, '')}@forks.app`;

      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone: phone.replace(/\s/g, ''),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          id: data.user.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.replace(/\s/g, ''),
          role,
          email,
        };

        await AsyncStorage.setItem(USER_CREATED_KEY, 'true');
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        await AsyncStorage.setItem(USER_ID_KEY, data.user.id);

        onUserCreated(userData);
      } else {
        Alert.alert('Error', data.error || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Please check your connection and try again.'
      );
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    return (
      <YStack gap="$2" marginBottom="$4">
        <XStack gap="$2" alignItems="center" justifyContent="center">
          {[1, 2, 3, 4].map((step) => (
            <XStack key={step} alignItems="center" gap="$1">
              <YStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor={currentStep >= step ? '$blue10' : '$gray5'}
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  color={currentStep >= step ? 'white' : '$gray11'}
                  fontWeight="bold"
                  fontSize="$5"
                >
                  {step}
                </Text>
              </YStack>
              {step < totalSteps && (
                <YStack
                  width={30}
                  height={3}
                  backgroundColor={currentStep > step ? '$blue10' : '$gray5'}
                />
              )}
            </XStack>
          ))}
        </XStack>
        <Text textAlign="center" fontSize="$3" color="$gray11">
          Step {currentStep} of {totalSteps}
        </Text>
      </YStack>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <YStack gap="$4" animation="quick" enterStyle={{ opacity: 0, y: 10 }}>
            <YStack gap="$2" alignItems="center" marginBottom="$2">
              <Text fontSize="$9" fontWeight="bold" textAlign="center">
                Welcome! 👋
              </Text>
              <Text fontSize="$4" color="$gray11" textAlign="center">
                Let's get you started with your mobile number
              </Text>
            </YStack>
            <YStack gap="$2">
              <Label htmlFor="phone" fontSize="$4" fontWeight="600">
                Mobile Number *
              </Label>
              <Input
                id="phone"
                placeholder="+1 234 567 8900"
                value={phone}
                onChangeText={setPhone as any}
                keyboardType="phone-pad"
                size="$5"
                borderWidth={2}
                borderRadius="$4"
                autoFocus
              />
              <Text fontSize="$2" color="$gray10">
                We'll use this to create your account
              </Text>
            </YStack>
          </YStack>
        );

      case 2:
        return (
          <YStack gap="$4" animation="quick" enterStyle={{ opacity: 0, y: 10 }}>
            <YStack gap="$2" alignItems="center" marginBottom="$2">
              <Text fontSize="$9" fontWeight="bold" textAlign="center">
                What's your name? ✨
              </Text>
              <Text fontSize="$4" color="$gray11" textAlign="center">
                Tell us how we should address you
              </Text>
            </YStack>
            <YStack gap="$3">
              <YStack gap="$2">
                <Label htmlFor="firstName" fontSize="$4" fontWeight="600">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChangeText={setFirstName as any}
                  size="$5"
                  borderWidth={2}
                  borderRadius="$4"
                  autoFocus
                />
              </YStack>
              <YStack gap="$2">
                <Label htmlFor="lastName" fontSize="$4" fontWeight="600">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={setLastName as any}
                  size="$5"
                  borderWidth={2}
                  borderRadius="$4"
                />
              </YStack>
            </YStack>
          </YStack>
        );

      case 3:
        return (
          <YStack gap="$4" animation="quick" enterStyle={{ opacity: 0, y: 10 }}>
            <YStack gap="$2" alignItems="center" marginBottom="$2">
              <Text fontSize="$9" fontWeight="bold" textAlign="center">
                Create Password 🔒
              </Text>
              <Text fontSize="$4" color="$gray11" textAlign="center">
                Choose a strong password to secure your account
              </Text>
            </YStack>
            <YStack gap="$3">
              <YStack gap="$2">
                <Label htmlFor="password" fontSize="$4" fontWeight="600">
                  Password *
                </Label>
                <Input
                  id="password"
                  placeholder="Enter password"
                  value={password}
                  onChangeText={setPassword as any}
                  secureTextEntry
                  size="$5"
                  borderWidth={2}
                  borderRadius="$4"
                  autoFocus
                />
                <Text fontSize="$2" color="$gray10">
                  Must be at least 6 characters
                </Text>
              </YStack>
              <YStack gap="$2">
                <Label htmlFor="confirmPassword" fontSize="$4" fontWeight="600">
                  Confirm Password *
                </Label>
                <Input
                  id="confirmPassword"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword as any}
                  secureTextEntry
                  size="$5"
                  borderWidth={2}
                  borderRadius="$4"
                />
              </YStack>
            </YStack>
          </YStack>
        );

      case 4:
        return (
          <YStack gap="$4" animation="quick" enterStyle={{ opacity: 0, y: 10 }}>
            <YStack gap="$2" alignItems="center" marginBottom="$2">
              <Text fontSize="$9" fontWeight="bold" textAlign="center">
                Select Your Role 🎯
              </Text>
              <Text fontSize="$4" color="$gray11" textAlign="center">
                Choose the role that best describes you
              </Text>
            </YStack>
            <YStack gap="$3">
              {(['GUEST', 'ADMIN', 'STAFF'] as UserRole[]).map((roleOption) => (
                <Button
                  key={roleOption}
                  onPress={() => setRole(roleOption)}
                  size="$5"
                  borderRadius="$4"
                  borderWidth={role === roleOption ? 3 : 2}
                  borderColor={role === roleOption ? '$blue10' : '$gray5'}
                  backgroundColor={role === roleOption ? '$blue2' : '$gray2'}
                  pressStyle={{ scale: 0.98 }}
                  animation="quick"
                >
                  <XStack gap="$3" alignItems="center" justifyContent="space-between" width="100%">
                    <YStack gap="$1">
                      <Text fontSize="$5" fontWeight="bold" color={role === roleOption ? '$blue11' : '$gray11'}>
                        {roleOption}
                      </Text>
                      <Text fontSize="$3" color="$gray10">
                        {roleOption === 'GUEST' && 'Regular user access'}
                        {roleOption === 'ADMIN' && 'Full administrative access'}
                        {roleOption === 'STAFF' && 'Staff member access'}
                      </Text>
                    </YStack>
                    {role === roleOption && (
                      <Text fontSize="$6" color="$blue10">
                        ✓
                      </Text>
                    )}
                  </XStack>
                </Button>
              ))}
            </YStack>
          </YStack>
        );

      default:
        return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <YStack gap="$4" padding="$4" maxWidth={500} width="100%" alignSelf="center">
            {renderProgressBar()}
            {renderStepContent()}

            <XStack gap="$3" marginTop="$6">
              {currentStep > 1 && (
                <Button
                  onPress={handleBack}
                  size="$5"
                  flex={1}
                  backgroundColor="$gray5"
                  color="$gray11"
                  borderRadius="$4"
                  disabled={loading}
                >
                  <Text color="$gray11" fontWeight="600">
                    Back
                  </Text>
                </Button>
              )}
              <Button
                onPress={currentStep === totalSteps ? handleSubmit : handleNext}
                size="$5"
                flex={1}
                backgroundColor="$blue10"
                color="white"
                borderRadius="$4"
                disabled={loading}
                pressStyle={{ scale: 0.98 }}
              >
                <Text color="white" fontWeight="600">
                  {loading
                    ? 'Creating...'
                    : currentStep === totalSteps
                      ? 'Create Account'
                      : 'Next'}
                </Text>
              </Button>
            </XStack>

            {currentStep === 1 && (
              <XStack gap="$2" alignItems="center" justifyContent="center" marginTop="$3">
                <Text fontSize="$4" color="$gray11">
                  Already have an account?
                </Text>
                <Button
                  onPress={onSwitchToLogin}
                  size="$3"
                  backgroundColor="transparent"
                  padding={0}
                >
                  <Text fontSize="$4" color="$blue10" fontWeight="600">
                    Sign In
                  </Text>
                </Button>
              </XStack>
            )}
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
      </ThemedView>
  );
}

// Main Component
export default function HomeScreen() {
  const [userCreated, setUserCreated] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const created = await AsyncStorage.getItem(USER_CREATED_KEY);
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      const restaurant = await AsyncStorage.getItem(RESTAURANT_DATA_KEY);
      const scanned = await AsyncStorage.getItem(SCANNED_KEY);
      
      if (created === 'true' && data) {
        setUserCreated(true);
        setUserData(JSON.parse(data));
        
        // If user is GUEST and just created, show scanner
        const userInfo = JSON.parse(data);
        if (userInfo.role === 'GUEST' && scanned !== 'true') {
          setShowScanner(true);
          setScanning(true);
        }
        
        // If restaurant data exists, show it
        if (restaurant) {
          setRestaurantData(JSON.parse(restaurant));
        }
      } else {
        setUserCreated(false);
        setShowLogin(true); // Show login screen first
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      setUserCreated(false);
      setShowLogin(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = (data: any) => {
    setUserCreated(true);
    setUserData(data);
    setShowLogin(false);
    
    // If GUEST user, show QR scanner immediately
    if (data.role === 'GUEST') {
      setShowScanner(true);
      setScanning(true);
    }
  };

  const handleLoginSuccess = (data: any) => {
    setUserCreated(true);
    setUserData(data);
    setShowLogin(false);
    
    // If GUEST user, show QR scanner immediately
    if (data.role === 'GUEST') {
      setShowScanner(true);
      setScanning(true);
    }
  };

  const handleQRScanSuccess = async (restaurantId: string) => {
    try {
      setScanning(false);
      setShowScanner(false);
      
      const response = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}`);
      const data = await response.json();

      if (response.ok && data.restaurant) {
        setRestaurantData(data.restaurant);
        await AsyncStorage.setItem(RESTAURANT_DATA_KEY, JSON.stringify(data.restaurant));
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch restaurant details');
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      Alert.alert('Error', 'Failed to fetch restaurant details. Please try again.');
    }
  };

  const handleScanQR = () => {
    setShowScanner(true);
    setScanning(true);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
    setScanning(false);
  };

  const handleScanAgain = () => {
    setRestaurantData(null);
    AsyncStorage.removeItem(RESTAURANT_DATA_KEY);
    AsyncStorage.removeItem(SCANNED_KEY);
    setShowScanner(true);
    setScanning(true);
  };

  const handleLogout = () => {
    // Reset all state
    setUserCreated(false);
    setUserData(null);
    setRestaurantData(null);
    setShowScanner(false);
    setScanning(false);
    setLoading(true);
    
    // Re-check status (will show setup screen)
    checkUserStatus();
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Text fontSize="$5" color="$gray11">
            Loading...
          </Text>
        </YStack>
      </ThemedView>
    );
  }

  if (showScanner && scanning) {
    return <QRScanner onScanSuccess={handleQRScanSuccess} onClose={handleCloseScanner} />;
  }

  if (restaurantData) {
    return <RestaurantDetails restaurant={restaurantData} onScanAgain={handleScanAgain} onLogout={handleLogout} />;
  }

  if (userCreated) {
    return <HomePage userData={userData} onScanQR={handleScanQR} onLogout={handleLogout} />;
  }

  if (showLogin) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => setShowLogin(false)}
      />
    );
  }

  return (
    <SetupScreen
      onUserCreated={handleUserCreated}
      onSwitchToLogin={() => setShowLogin(true)}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  homeContent: {
    flexGrow: 1,
  },
  camera: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 20,
  },
});
