import React, { useState, useEffect } from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import { YStack, XStack, Text } from '@tamagui/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignTokens } from '@/constants/design';
import { KitchenOrderCard, KitchenOrderItem } from '@/components/staff';
import { MoreVertical } from '@tamagui/lucide-icons';
import { TouchableOpacity } from 'react-native';
import { StaffService } from '@/services/staffService';

type OrderStatus = 'pending' | 'preparing' | 'all';

/**
 * Kitchen Orders Screen
 * Displays orders for kitchen staff to manage preparation
 */
export default function KitchenOrdersScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<OrderStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await StaffService.getKitchenOrders();
      
      // Map to kitchen order format
      const mappedOrders = allOrders.map((order) => ({
        id: order.id,
        location: order.location,
        timeAgo: order.timeAgo,
        items: order.items || [],
        status: order.status === 'pending' ? 'pending' : 'preparing',
        urgency: undefined as 'urgent' | undefined,
        allergyAlert: undefined as string | undefined,
        eta: undefined as string | undefined,
      }));

      setOrders(mappedOrders);
    } catch (error) {
      console.error('Error loading kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const getCount = (status: OrderStatus) => {
    if (status === 'all') return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  const handleStartPreparing = async (orderId: string) => {
    try {
      await StaffService.updateOrderStatus(orderId, 'PREPARING');
      await loadOrders();
    } catch (error) {
      console.error('Error starting preparation:', error);
    }
  };

  const handleMarkComplete = async (orderId: string) => {
    try {
      await StaffService.updateOrderStatus(orderId, 'READY');
      await loadOrders();
    } catch (error) {
      console.error('Error marking complete:', error);
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
          Kitchen Orders
        </Text>
        <TouchableOpacity>
          <MoreVertical
            size={24}
            color={DesignTokens.colors.brown[900]}
          />
        </TouchableOpacity>
      </XStack>

      {/* Tab Navigation */}
      <XStack
        paddingHorizontal="$4"
        paddingBottom="$3"
        space="$2"
      >
        {(['pending', 'preparing', 'all'] as OrderStatus[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
          >
            <XStack
              paddingHorizontal="$4"
              paddingVertical="$2"
              borderRadius={DesignTokens.radius.md}
              backgroundColor={
                activeTab === tab
                  ? DesignTokens.colors.beige[300]
                  : 'transparent'
              }
            >
              <Text
                fontSize={DesignTokens.typography.fontSize.md}
                fontWeight={DesignTokens.typography.fontWeight.semibold}
                color={
                  activeTab === tab
                    ? DesignTokens.colors.brown[900]
                    : DesignTokens.colors.lightBrown[500]
                }
                textTransform="capitalize"
              >
                {tab} ({getCount(tab)})
              </Text>
            </XStack>
          </TouchableOpacity>
        ))}
      </XStack>

      {/* Orders List */}
      {loading ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color={DesignTokens.colors.orange[500]} />
        </YStack>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack padding="$4" space="$3">
            {filteredOrders.length === 0 ? (
              <YStack alignItems="center" justifyContent="center" padding="$8">
                <Text
                  fontSize={DesignTokens.typography.fontSize.md}
                  color={DesignTokens.colors.lightBrown[500]}
                >
                  No orders found
                </Text>
              </YStack>
            ) : (
              filteredOrders.map((order) => (
                <KitchenOrderCard
                  key={order.id}
                  orderId={order.id}
                  location={order.location}
                  timeAgo={order.timeAgo}
                  items={order.items}
                  status={order.status}
                  urgency={order.urgency}
                  eta={order.eta}
                  allergyAlert={order.allergyAlert}
                  onStartPreparing={() => handleStartPreparing(order.id)}
                  onMarkComplete={() => handleMarkComplete(order.id)}
                />
              ))
            )}
          </YStack>
        </ScrollView>
      )}
    </YStack>
  );
}
