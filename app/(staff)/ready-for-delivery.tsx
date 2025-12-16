import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { YStack, XStack, Text } from '@tamagui/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignTokens } from '@/constants/design';
import { OrderCard } from '@/components/staff';
import { Map, ArrowUpDown, Gauge, Wallet } from '@tamagui/lucide-icons';
import { StaffService } from '@/services/staffService';

type TabType = 'ready' | 'out-for-delivery';

/**
 * Ready for Delivery Screen
 * Shows orders ready for delivery with map view and filtering options
 */
export default function ReadyForDeliveryScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('ready');
  const [loading, setLoading] = useState(true);
  const [readyOrders, setReadyOrders] = useState<any[]>([]);
  const [outForDeliveryOrders, setOutForDeliveryOrders] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      if (activeTab === 'ready') {
        const orders = await StaffService.getReadyForDeliveryOrders();
        const mapped = orders.map((order: any) => {
          const now = new Date();
          const createdAt = new Date(order.createdAt);
          const diffMs = now.getTime() - createdAt.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const timeAgo = diffMins < 1 ? 'Just now' : `${diffMins}m ago`;

          return {
            orderId: order.orderNumber,
            timeAgo,
            customerName: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Unknown',
            phoneNumber: order.user?.phone || 'N/A',
            deliveryAddress: order.deliveryAddress?.addressLine1 || order.table?.tableNumber ? `Table ${order.table.tableNumber}` : 'N/A',
            paymentMethod: order.paymentStatus === 'COMPLETED' ? 'PAID' : 'COD',
            paymentAmount: `$${parseFloat(order.totalAmount?.toString() || '0').toFixed(2)}`,
            itemsCount: order._count?.orderItems || order.orderItems?.length || 0,
            estimatedDelivery: order.estimatedTime ? new Date(order.estimatedTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'N/A',
            specialInstructions: order.specialInstructions,
          };
        });
        setReadyOrders(mapped);
      } else {
        // Fetch OUT_FOR_DELIVERY orders
        const orders = await StaffService.getOrders('OUT_FOR_DELIVERY');
        const mapped = orders.map((order: any) => {
          return {
            orderId: order.orderNumber,
            timeAgo: order.timeAgo,
            customerName: order.customer?.name || 'Unknown',
            phoneNumber: order.customer?.phone || 'N/A',
            deliveryAddress: order.customer?.address || 'N/A',
            paymentMethod: order.paymentStatus === 'COMPLETED' ? 'PAID' : 'COD',
            paymentAmount: order.totalAmount || '$0.00',
            itemsCount: order.itemsCount || 0,
            estimatedDelivery: 'N/A',
          };
        });
        setOutForDeliveryOrders(mapped);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentOrders =
    activeTab === 'ready' ? readyOrders : outForDeliveryOrders;
  const count = currentOrders.length;

  const handlePickUp = async (orderId: string) => {
    try {
      // Find order by orderNumber to get actual order ID
      const order = [...readyOrders, ...outForDeliveryOrders].find(o => o.orderId === orderId);
      if (order && (order as any).id) {
        await StaffService.updateOrderStatus((order as any).id, 'OUT_FOR_DELIVERY');
        await loadOrders();
      }
    } catch (error) {
      console.error('Error picking up order:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  return (
    <YStack
      flex={1}
      backgroundColor={DesignTokens.colors.background.light}
      paddingTop={insets.top}
    >
      {/* Header */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text
          fontSize={DesignTokens.typography.fontSize['2xl']}
          fontWeight={DesignTokens.typography.fontWeight.bold}
          color={DesignTokens.colors.brown[900]}
        >
          Ready for Delivery
        </Text>
        <TouchableOpacity>
          <XStack
            alignItems="center"
            space="$2"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius={DesignTokens.radius.md}
            backgroundColor={DesignTokens.colors.teal[500]}
          >
            <Map size={18} color={DesignTokens.colors.white} />
            <Text
              fontSize={DesignTokens.typography.fontSize.sm}
              fontWeight={DesignTokens.typography.fontWeight.semibold}
              color={DesignTokens.colors.white}
            >
              Map View
            </Text>
          </XStack>
        </TouchableOpacity>
      </XStack>

      {/* Tab Navigation */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$2"
        space="$2"
        borderBottomWidth={1}
        borderBottomColor={DesignTokens.colors.beige[300]}
      >
        <TouchableOpacity onPress={() => setActiveTab('ready')}>
          <XStack
            paddingHorizontal="$4"
            paddingVertical="$2"
            borderRadius={DesignTokens.radius.md}
            backgroundColor={
              activeTab === 'ready'
                ? DesignTokens.colors.white
                : 'transparent'
            }
          >
            <Text
              fontSize={DesignTokens.typography.fontSize.md}
              fontWeight={DesignTokens.typography.fontWeight.semibold}
              color={
                activeTab === 'ready'
                  ? DesignTokens.colors.brown[900]
                  : DesignTokens.colors.lightBrown[500]
              }
            >
              Ready ({readyOrders.length})
            </Text>
          </XStack>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('out-for-delivery')}>
          <XStack
            paddingHorizontal="$4"
            paddingVertical="$2"
            borderRadius={DesignTokens.radius.md}
            backgroundColor={
              activeTab === 'out-for-delivery'
                ? DesignTokens.colors.white
                : 'transparent'
            }
          >
            <Text
              fontSize={DesignTokens.typography.fontSize.md}
              fontWeight={DesignTokens.typography.fontWeight.semibold}
              color={
                activeTab === 'out-for-delivery'
                  ? DesignTokens.colors.brown[900]
                  : DesignTokens.colors.lightBrown[500]
              }
            >
              Out for Delivery ({outForDeliveryOrders.length})
            </Text>
          </XStack>
        </TouchableOpacity>
      </XStack>

      {/* Filter/Sort Options */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        space="$4"
        alignItems="center"
      >
        <TouchableOpacity>
          <XStack alignItems="center" space="$1">
            <ArrowUpDown
              size={18}
              color={DesignTokens.colors.brown[700]}
            />
            <Text
              fontSize={DesignTokens.typography.fontSize.sm}
              color={DesignTokens.colors.brown[700]}
            >
              Sort by Time
            </Text>
          </XStack>
        </TouchableOpacity>
        <TouchableOpacity>
          <XStack alignItems="center" space="$1">
            <Gauge
              size={18}
              color={DesignTokens.colors.brown[700]}
            />
            <Text
              fontSize={DesignTokens.typography.fontSize.sm}
              color={DesignTokens.colors.brown[700]}
            >
              Distance
            </Text>
          </XStack>
        </TouchableOpacity>
        <TouchableOpacity>
          <XStack alignItems="center" space="$1">
            <Wallet
              size={18}
              color={DesignTokens.colors.brown[700]}
            />
            <Text
              fontSize={DesignTokens.typography.fontSize.sm}
              color={DesignTokens.colors.brown[700]}
            >
              COD
            </Text>
          </XStack>
        </TouchableOpacity>
      </XStack>

      {/* Orders List */}
      {loading ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color={DesignTokens.colors.orange[500]} />
        </YStack>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack padding="$4" space="$3">
            {currentOrders.length === 0 ? (
              <YStack alignItems="center" justifyContent="center" padding="$8">
                <Text
                  fontSize={DesignTokens.typography.fontSize.md}
                  color={DesignTokens.colors.lightBrown[500]}
                >
                  No orders found
                </Text>
              </YStack>
            ) : (
              currentOrders.map((order) => (
                <OrderCard
                  key={order.orderId}
                  orderId={order.orderId}
                  timeAgo={order.timeAgo}
                  customerName={order.customerName}
                  phoneNumber={order.phoneNumber}
                  deliveryAddress={order.deliveryAddress}
                  paymentMethod={order.paymentMethod}
                  paymentAmount={order.paymentAmount}
                  itemsCount={order.itemsCount}
                  estimatedDelivery={order.estimatedDelivery}
                  specialInstructions={order.specialInstructions}
                  onCall={() => console.log('Call', order.phoneNumber)}
                  onViewMap={() => console.log('View Map', order.orderId)}
                  onPickUp={() => handlePickUp(order.orderId)}
                  showDeliveryActions={activeTab === 'ready'}
                />
              ))
            )}
          </YStack>
        </ScrollView>
      )}
    </YStack>
  );
}
