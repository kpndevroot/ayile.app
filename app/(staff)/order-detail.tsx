import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DesignTokens } from '@/constants/design';
import { Button } from '@/components/ui/Button';
import { UpdateOrderStatusModal } from '@/components/staff';
import { StaffService } from '@/services/staffService';
import {
  ArrowLeft,
  Printer,
  Phone,
  MapPin,
  CreditCard,
  Check,
  Clock,
  ChefHat,
  ShoppingBag,
  Bike,
  Circle,
} from '@tamagui/lucide-icons';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED';

const statusSteps: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'DELIVERED',
];

/**
 * Order Detail Screen
 * Detailed view of a specific order with status progress and all information
 */
export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.id as string;
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await StaffService.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load order details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIndex = order ? statusSteps.indexOf(order.status as OrderStatus) : -1;

  const handleUpdateStatus = async (status: string, estimatedTime?: number) => {
    try {
      await StaffService.updateOrderStatus(orderId, status, estimatedTime);
      await loadOrder();
      setShowStatusModal(false);
      Alert.alert('Success', 'Order status updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update order status');
    }
  };

  const handleCancelOrder = async () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await StaffService.updateOrderStatus(orderId, 'CANCELLED');
              Alert.alert('Success', 'Order cancelled successfully');
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  if (loading || !order) {
    return (
      <YStack
        flex={1}
        backgroundColor={DesignTokens.colors.background.light}
        paddingTop={insets.top}
        alignItems="center"
        justifyContent="center"
      >
        <ActivityIndicator size="large" color={DesignTokens.colors.orange[500]} />
      </YStack>
    );
  }

  // Format order data for display
  const customer = {
    name: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Unknown',
    phone: order.user?.phone || 'N/A',
    address: order.deliveryAddress?.addressLine1 || order.table?.tableNumber ? `Table ${order.table.tableNumber}` : 'N/A',
  };

  const items = (order.orderItems || []).map((item: any) => ({
    quantity: item.quantity,
    name: item.itemName,
    price: `₹${parseFloat(item.totalPrice?.toString() || '0').toFixed(2)}`,
    modifications: item.specialInstructions ? [item.specialInstructions] : undefined,
  }));

  const pricing = {
    subtotal: `₹${parseFloat(order.subtotal?.toString() || '0').toFixed(2)}`,
    taxes: `₹${parseFloat(order.tax?.toString() || '0').toFixed(2)}`,
    deliveryFee: `₹${parseFloat(order.deliveryCharge?.toString() || '0').toFixed(2)}`,
    total: `₹${parseFloat(order.totalAmount?.toString() || '0').toFixed(2)}`,
  };

  // Payment status: simple paid/not paid (default is not paid)
  const isPaid = order.paymentStatus === 'COMPLETED' || order.paymentStatus === 'PAID';
  const paymentStatusText = isPaid ? 'Paid' : 'Not Paid';

  const handleTogglePaymentStatus = async () => {
    const newIsPaid = !isPaid;
    
    Alert.alert(
      newIsPaid ? 'Mark as Paid' : 'Mark as Not Paid',
      `Are you sure you want to mark this order as ${newIsPaid ? 'Paid' : 'Not Paid'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await StaffService.updatePaymentStatus(orderId, newIsPaid);
              await loadOrder();
              Alert.alert('Success', `Payment status updated to ${newIsPaid ? 'Paid' : 'Not Paid'}`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update payment status');
            }
          },
        },
      ]
    );
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
        alignItems="center"
        justifyContent="space-between"
      >
        <XStack alignItems="center" space="$2">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={DesignTokens.colors.brown[900]} />
          </TouchableOpacity>
          <Text
            fontSize={DesignTokens.typography.fontSize.xl}
            fontWeight={DesignTokens.typography.fontWeight.bold}
            color={DesignTokens.colors.brown[900]}
          >
            Order {order.orderNumber || orderId}
          </Text>
        </XStack>
        <TouchableOpacity onPress={() => console.log('Print')}>
          <Printer size={24} color={DesignTokens.colors.brown[900]} />
        </TouchableOpacity>
      </XStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$4" space="$4">
          {/* Status Progress Bar */}
          <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingVertical="$4"
          >
            {statusSteps.map((status, index) => {
              const isActive = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const isCompleted = index < currentStatusIndex;

              // Icon selection based on status
              const getIcon = () => {
                if (isCompleted) return <Check size={12} color={DesignTokens.colors.neutral.white} />;
                if (isCurrent) {
                  switch (status) {
                    case 'PENDING': return <Clock size={12} color={DesignTokens.colors.neutral.white} />;
                    case 'CONFIRMED': return <Check size={12} color={DesignTokens.colors.neutral.white} />;
                    case 'PREPARING': return <ChefHat size={12} color={DesignTokens.colors.neutral.white} />;
                    case 'READY': return <ShoppingBag size={12} color={DesignTokens.colors.neutral.white} />;
                    case 'DELIVERED': return <Check size={12} color={DesignTokens.colors.neutral.white} />;
                    default: return <Circle size={8} fill={DesignTokens.colors.neutral.white} />;
                  }
                }
                return null;
              };

              return (
                <XStack key={status} flex={1} alignItems="center">
                  <XStack alignItems="center" flex={1}>
                    {/* Line before dot */
                      index > 0 && (
                        <XStack
                          flex={1}
                          height={3}
                          backgroundColor={
                            isActive
                              ? DesignTokens.colors.orange[500]
                              : DesignTokens.colors.beige[300]
                          }
                        />
                      )}

                    {/* Dot/Icon */}
                    <YStack
                      width={isCurrent ? 32 : 24}
                      height={isCurrent ? 32 : 24}
                      borderRadius={DesignTokens.radius.full}
                      backgroundColor={
                        isActive
                          ? DesignTokens.colors.orange[500]
                          : DesignTokens.colors.beige[300]
                      }
                      alignItems="center"
                      justifyContent="center"
                      zIndex={1}
                      shadowColor={isCurrent ? DesignTokens.colors.orange[300] : undefined}
                      shadowRadius={isCurrent ? 4 : 0}
                      shadowOpacity={isCurrent ? 0.5 : 0}
                    >
                      {getIcon()}
                    </YStack>

                    {/* Line after dot */
                      index < statusSteps.length - 1 && (
                        <XStack
                          flex={1}
                          height={3}
                          backgroundColor={
                            index < currentStatusIndex // Only colored if NEXT step is also active/reached? No, standard logic
                              ? DesignTokens.colors.orange[500]
                              : DesignTokens.colors.beige[300]
                          }
                        />
                      )}
                  </XStack>

                  {/* Label */}
                  <YStack
                    position="absolute"
                    top={isCurrent ? 38 : 34}
                    width={70}
                    alignItems="center"
                    left={statusSteps.length > 4 ? -22 : -10} // dynamic adjust for density
                  >
                    <Text
                      fontSize={isCurrent ? 11 : 10}
                      fontWeight={isCurrent ? '700' : '500'}
                      color={
                        isCurrent
                          ? DesignTokens.colors.orange[600]
                          : isActive
                            ? DesignTokens.colors.brown[700]
                            : DesignTokens.colors.beige[500]
                      }
                      textTransform="capitalize"
                      textAlign="center"
                      numberOfLines={2}
                    >
                      {status.toLowerCase().replace(/_/g, ' ')}
                    </Text>
                  </YStack>
                </XStack>
              );
            })}
          </XStack>

          {/* Customer Info Section */}
          <YStack space="$3" paddingHorizontal="$2">
            <Text
              fontSize={DesignTokens.typography.fontSize.lg}
              fontWeight={DesignTokens.typography.fontWeight.bold}
              color={DesignTokens.colors.brown[900]}
              marginBottom="$1"
            >
              Customer Info
            </Text>
            <YStack
              backgroundColor={DesignTokens.colors.neutral.white}
              borderRadius="$4"
              padding="$4"
            >
              <YStack space="$4">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={DesignTokens.typography.fontSize.sm} color={DesignTokens.colors.lightBrown[500]}>Name</Text>
                  <Text fontSize={DesignTokens.typography.fontSize.md} fontWeight="600" color={DesignTokens.colors.brown[900]}>{customer.name}</Text>
                </XStack>
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={DesignTokens.typography.fontSize.sm} color={DesignTokens.colors.lightBrown[500]}>Phone</Text>
                  <XStack alignItems="center" space="$2">
                    <Text fontSize={DesignTokens.typography.fontSize.md} fontWeight="600" color={DesignTokens.colors.brown[900]}>{customer.phone}</Text>
                    <Phone size={16} color={DesignTokens.colors.orange[500]} />
                  </XStack>
                </XStack>
                <XStack justifyContent="space-between" alignItems="flex-start">
                  <Text fontSize={DesignTokens.typography.fontSize.sm} color={DesignTokens.colors.lightBrown[500]}>{order.table ? 'Table' : 'Address'}</Text>
                  <XStack alignItems="center" space="$2" flex={1} justifyContent="flex-end">
                    <Text fontSize={DesignTokens.typography.fontSize.md} fontWeight="600" color={DesignTokens.colors.brown[900]} textAlign="right" numberOfLines={2} style={{ maxWidth: '80%' }}>{customer.address}</Text>
                    {!order.table && <MapPin size={16} color={DesignTokens.colors.orange[500]} />}
                  </XStack>
                </XStack>
              </YStack>
            </YStack>
          </YStack>

          {/* Order Items Section */}
          <YStack space="$3" paddingHorizontal="$2">
            <Text
              fontSize={DesignTokens.typography.fontSize.lg}
              fontWeight={DesignTokens.typography.fontWeight.bold}
              color={DesignTokens.colors.brown[900]}
              marginBottom="$1"
            >
              Order Items
            </Text>
            <YStack
              backgroundColor={DesignTokens.colors.neutral.white}
              borderRadius="$4"
              padding="$4"
            >
              <YStack space="$4">
                {items.map((item: any, index: number) => (
                  <YStack key={index} space="$2">
                    <XStack justifyContent="space-between" alignItems="flex-start">
                      <XStack flex={1} space="$2">
                        <Text fontWeight="bold" color={DesignTokens.colors.orange[600]}>{item.quantity}x</Text>
                        <YStack flex={1}>
                          <Text fontSize={DesignTokens.typography.fontSize.md} fontWeight="600" color={DesignTokens.colors.brown[900]}>{item.name}</Text>
                          {item.modifications && (
                            <YStack marginTop="$1">
                              {item.modifications.map((mod: string, modIndex: number) => (
                                <Text key={modIndex} fontSize={DesignTokens.typography.fontSize.sm} color={DesignTokens.colors.lightBrown[500]}>
                                  {mod}
                                </Text>
                              ))}
                            </YStack>
                          )}
                        </YStack>
                      </XStack>
                      <Text fontSize={DesignTokens.typography.fontSize.md} fontWeight="600" color={DesignTokens.colors.brown[900]}>{item.price}</Text>
                    </XStack>
                    {index < items.length - 1 && <XStack height={1} backgroundColor={DesignTokens.colors.beige[200]} />}
                  </YStack>
                ))}
              </YStack>
            </YStack>
          </YStack>

          {/* Special Instructions Section */}
          {order.specialInstructions && (
            <YStack space="$3" paddingHorizontal="$2">
              <Text
                fontSize={DesignTokens.typography.fontSize.lg}
                fontWeight={DesignTokens.typography.fontWeight.bold}
                color={DesignTokens.colors.brown[900]}
                marginBottom="$1"
              >
                Special Instructions
              </Text>
              <YStack
                backgroundColor={DesignTokens.colors.neutral.white}
                borderRadius="$4"
                padding="$4"
              >
                <Text fontSize={DesignTokens.typography.fontSize.md} color={DesignTokens.colors.brown[700]} fontStyle="italic">
                  "{order.specialInstructions}"
                </Text>
              </YStack>
            </YStack>
          )}

          {/* Pricing Section */}
          <YStack space="$3" paddingHorizontal="$2" marginTop="$2">
            <Text
              fontSize={DesignTokens.typography.fontSize.lg}
              fontWeight={DesignTokens.typography.fontWeight.bold}
              color={DesignTokens.colors.brown[900]}
              marginBottom="$1"
            >
              Payment Details
            </Text>
            <YStack
              backgroundColor={DesignTokens.colors.neutral.white}
              borderRadius="$4"
              padding="$4"
            >
              <YStack space="$3">
                <XStack justifyContent="space-between">
                  <Text color={DesignTokens.colors.lightBrown[500]}>Subtotal</Text>
                  <Text color={DesignTokens.colors.brown[900]}>{pricing.subtotal}</Text>
                </XStack>
                <XStack justifyContent="space-between">
                  <Text color={DesignTokens.colors.lightBrown[500]}>Taxes & Charges</Text>
                  <Text color={DesignTokens.colors.brown[900]}>{pricing.taxes}</Text>
                </XStack>
                <XStack justifyContent="space-between">
                  <Text color={DesignTokens.colors.lightBrown[500]}>Delivery Fee</Text>
                  <Text color={DesignTokens.colors.brown[900]}>{pricing.deliveryFee}</Text>
                </XStack>

                <XStack height={1} backgroundColor={DesignTokens.colors.beige[300]} marginVertical="$2" style={{ borderStyle: 'dashed', borderWidth: 1, borderColor: DesignTokens.colors.beige[300] }} />

                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={DesignTokens.typography.fontSize.lg} fontWeight="bold" color={DesignTokens.colors.brown[900]}>Total</Text>
                  <Text fontSize={DesignTokens.typography.fontSize.xl} fontWeight="bold" color={DesignTokens.colors.orange[600]}>{pricing.total}</Text>
                </XStack>

                {/* Payment Status Section */}
                <YStack marginTop="$3" space="$2">
                  <Text 
                    fontSize={DesignTokens.typography.fontSize.sm} 
                    color={DesignTokens.colors.lightBrown[500]}
                    fontWeight="500"
                  >
                    Payment Status
                  </Text>
                  <TouchableOpacity
                    onPress={handleTogglePaymentStatus}
                    activeOpacity={0.8}
                  >
                    <XStack
                      backgroundColor={isPaid ? '#ECFDF5' : '#FFF7ED'}
                      padding="$4"
                      borderRadius="$3"
                      alignItems="center"
                      justifyContent="space-between"
                      borderWidth={2}
                      borderColor={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[300]}
                      style={{
                        shadowColor: isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[500],
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <XStack alignItems="center" space="$3" flex={1}>
                        <YStack
                          width={48}
                          height={48}
                          borderRadius={24}
                          backgroundColor={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[100]}
                          alignItems="center"
                          justifyContent="center"
                        >
                          {isPaid ? (
                            <Check size={24} color="#FFFFFF" strokeWidth={3} />
                          ) : (
                            <CreditCard size={24} color={DesignTokens.colors.orange[600]} />
                          )}
                        </YStack>
                        <YStack flex={1} space="$1">
                          <Text 
                            fontSize={DesignTokens.typography.fontSize.md} 
                            color={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[700]} 
                            fontWeight="700"
                          >
                            {paymentStatusText}
                          </Text>
                          <Text 
                            fontSize={DesignTokens.typography.fontSize.xs} 
                            color={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[600]} 
                            fontWeight="400"
                          >
                            {isPaid ? 'Payment received' : 'Tap to mark as paid'}
                          </Text>
                        </YStack>
                      </XStack>
                      <YStack
                        backgroundColor={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[500]}
                        paddingHorizontal="$3"
                        paddingVertical="$2"
                        borderRadius="$2"
                        minWidth={80}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text 
                          fontSize={DesignTokens.typography.fontSize.sm} 
                          color="#FFFFFF" 
                          fontWeight="700"
                        >
                          {isPaid ? 'PAID' : 'MARK AS PAID'}
                        </Text>
                      </YStack>
                    </XStack>
                  </TouchableOpacity>
                </YStack>
              </YStack>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView >

      {/* Action Buttons */}
      {/* only show update status button if order is not delivered */}
      {order.status !== 'DELIVERED' && (
      < YStack
        padding="$4"
        paddingBottom={insets.bottom + 16}
        space="$2"
        backgroundColor={DesignTokens.colors.background.light}
      >
        <Button
          onPress={() => setShowStatusModal(true)}
          variant="primary"
          fullWidth
          style={{
            backgroundColor: DesignTokens.colors.orange[500],
          }}
        >
          Update Status
        </Button>
        <Button
          onPress={handleCancelOrder}
          variant="outline"
          fullWidth
          style={{
            borderColor: DesignTokens.colors.semantic.error,
            backgroundColor: DesignTokens.colors.neutral.white,
            shadowColor: 'transparent',
            shadowOpacity: 0,
            elevation: 0,
          }}
        >
          <Text color={DesignTokens.colors.semantic.error}>Cancel Order</Text>
        </Button>
      </YStack >
      )}
      {/* Update Status Modal */}
      < UpdateOrderStatusModal
        visible={showStatusModal}
        currentStatus={order.status}
        onClose={() => setShowStatusModal(false)
        }
        onUpdate={handleUpdateStatus}
      />
    </YStack >
  );
}
