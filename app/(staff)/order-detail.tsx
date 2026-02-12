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
          {/* Status Progress Bar - Enhanced for accessibility and visual hierarchy */}
          <YStack
            backgroundColor={DesignTokens.colors.neutral.white}
            borderRadius="$4"
            padding="$5"
            marginBottom="$2"
            style={{
              shadowColor: DesignTokens.colors.brown[900],
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <XStack
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="$3"
            >
              {statusSteps.map((status, index) => {
                const isActive = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isCompleted = index < currentStatusIndex;

                // Icon selection based on status - larger icons for better visibility
                const getIcon = () => {
                  const iconSize = isCurrent ? 20 : 16;
                  if (isCompleted) return <Check size={iconSize} color={DesignTokens.colors.neutral.white} strokeWidth={3} />;
                  if (isCurrent) {
                    switch (status) {
                      case 'PENDING': return <Clock size={iconSize} color={DesignTokens.colors.neutral.white} />;
                      case 'CONFIRMED': return <Check size={iconSize} color={DesignTokens.colors.neutral.white} />;
                      case 'PREPARING': return <ChefHat size={iconSize} color={DesignTokens.colors.neutral.white} />;
                      case 'READY': return <ShoppingBag size={iconSize} color={DesignTokens.colors.neutral.white} />;
                      case 'DELIVERED': return <Check size={iconSize} color={DesignTokens.colors.neutral.white} />;
                      default: return <Circle size={12} fill={DesignTokens.colors.neutral.white} />;
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
                            height={4}
                            backgroundColor={
                              isActive
                                ? DesignTokens.colors.orange[500]
                                : DesignTokens.colors.beige[300]
                            }
                            borderRadius="$2"
                          />
                        )}

                      {/* Dot/Icon - Increased size for better touch targets (48-56px) */}
                      <YStack
                        width={isCurrent ? 56 : 48}
                        height={isCurrent ? 56 : 48}
                        borderRadius={DesignTokens.radius.full}
                        backgroundColor={
                          isActive
                            ? DesignTokens.colors.orange[500]
                            : DesignTokens.colors.beige[300]
                        }
                        alignItems="center"
                        justifyContent="center"
                        zIndex={1}
                        borderWidth={isCurrent ? 3 : 0}
                        borderColor={DesignTokens.colors.orange[200]}
                        style={{
                          shadowColor: isCurrent ? DesignTokens.colors.orange[500] : undefined,
                          shadowOffset: { width: 0, height: 4 },
                          shadowRadius: isCurrent ? 8 : 0,
                          shadowOpacity: isCurrent ? 0.3 : 0,
                          elevation: isCurrent ? 4 : 0,
                        }}
                      >
                        {getIcon()}
                      </YStack>

                      {/* Line after dot */
                        index < statusSteps.length - 1 && (
                          <XStack
                            flex={1}
                            height={4}
                            backgroundColor={
                              index < currentStatusIndex
                                ? DesignTokens.colors.orange[500]
                                : DesignTokens.colors.beige[300]
                            }
                            borderRadius="$2"
                          />
                        )}
                    </XStack>

                    {/* Label - Improved positioning and typography */}
                    <YStack
                      position="absolute"
                      top={isCurrent ? 64 : 56}
                      width={80}
                      alignItems="center"
                      left={statusSteps.length > 4 ? -26 : -16}
                    >
                      <Text
                        fontSize={isCurrent ? 13 : 11}
                        fontWeight={isCurrent ? '700' : '600'}
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
          </YStack>

          {/* Customer Info Section - Enhanced with better spacing and visual hierarchy */}
          <YStack space="$2">
            <Text
              fontSize={DesignTokens.typography.fontSize.md}
              fontWeight="700"
              color={DesignTokens.colors.brown[700]}
              marginBottom="$1"
              paddingHorizontal="$1"
            >
              Customer Details
            </Text>
            <YStack
              backgroundColor={DesignTokens.colors.neutral.white}
              borderRadius="$4"
              padding="$4"
              space="$4"
              style={{
                shadowColor: DesignTokens.colors.brown[900],
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <XStack alignItems="center" space="$3">
                <YStack
                  width={40}
                  height={40}
                  borderRadius="$3"
                  backgroundColor={DesignTokens.colors.orange[100]}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize={18} fontWeight="700" color={DesignTokens.colors.orange[600]}>
                    {customer.name.charAt(0).toUpperCase()}
                  </Text>
                </YStack>
                <YStack flex={1}>
                  <Text fontSize={16} fontWeight="700" color={DesignTokens.colors.brown[900]}>
                    {customer.name}
                  </Text>
                </YStack>
              </XStack>

              <XStack height={1} backgroundColor={DesignTokens.colors.beige[200]} />

              <TouchableOpacity activeOpacity={0.7}>
                <XStack alignItems="center" space="$3" paddingVertical="$1">
                  <YStack
                    width={40}
                    height={40}
                    borderRadius="$3"
                    backgroundColor={DesignTokens.colors.orange[50]}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Phone size={20} color={DesignTokens.colors.orange[600]} />
                  </YStack>
                  <Text fontSize={15} fontWeight="600" color={DesignTokens.colors.brown[900]} flex={1}>
                    {customer.phone}
                  </Text>
                </XStack>
              </TouchableOpacity>

              <XStack height={1} backgroundColor={DesignTokens.colors.beige[200]} />

              <XStack alignItems="center" space="$3" paddingVertical="$1">
                <YStack
                  width={40}
                  height={40}
                  borderRadius="$3"
                  backgroundColor={DesignTokens.colors.orange[50]}
                  alignItems="center"
                  justifyContent="center"
                >
                  <MapPin size={20} color={DesignTokens.colors.orange[600]} />
                </YStack>
                <YStack flex={1}>
                  <Text fontSize={12} fontWeight="600" color={DesignTokens.colors.lightBrown[500]} marginBottom="$1">
                    {order.table ? 'Table Number' : 'Delivery Address'}
                  </Text>
                  <Text fontSize={15} fontWeight="600" color={DesignTokens.colors.brown[900]}>
                    {customer.address}
                  </Text>
                </YStack>
              </XStack>
            </YStack>
          </YStack>

          {/* Order Items Section - Enhanced with better visual hierarchy */}
          <YStack space="$2">
            <Text
              fontSize={DesignTokens.typography.fontSize.md}
              fontWeight="700"
              color={DesignTokens.colors.brown[700]}
              marginBottom="$1"
              paddingHorizontal="$1"
            >
              Order Items
            </Text>
            <YStack
              backgroundColor={DesignTokens.colors.neutral.white}
              borderRadius="$4"
              padding="$4"
              space="$3"
              style={{
                shadowColor: DesignTokens.colors.brown[900],
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {items.map((item: any, index: number) => (
                <YStack key={index}>
                  <XStack justifyContent="space-between" alignItems="flex-start" space="$3">
                    <XStack flex={1} space="$3" alignItems="flex-start">
                      <YStack
                        minWidth={32}
                        height={32}
                        borderRadius="$2"
                        backgroundColor={DesignTokens.colors.orange[500]}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize={14} fontWeight="700" color={DesignTokens.colors.neutral.white}>
                          {item.quantity}
                        </Text>
                      </YStack>
                      <YStack flex={1}>
                        <Text fontSize={15} fontWeight="700" color={DesignTokens.colors.brown[900]} marginBottom="$1">
                          {item.name}
                        </Text>
                        {item.modifications && (
                          <YStack marginTop="$1" space="$1">
                            {item.modifications.map((mod: string, modIndex: number) => (
                              <Text key={modIndex} fontSize={13} color={DesignTokens.colors.lightBrown[500]} fontStyle="italic">
                                • {mod}
                              </Text>
                            ))}
                          </YStack>
                        )}
                      </YStack>
                    </XStack>
                    <Text fontSize={16} fontWeight="700" color={DesignTokens.colors.orange[600]}>
                      {item.price}
                    </Text>
                  </XStack>
                  {index < items.length - 1 && <XStack height={1} backgroundColor={DesignTokens.colors.beige[200]} marginTop="$3" />}
                </YStack>
              ))}
            </YStack>
          </YStack>

          {/* Special Instructions Section - Enhanced visual treatment */}
          {order.specialInstructions && (
            <YStack space="$2">
              <Text
                fontSize={DesignTokens.typography.fontSize.md}
                fontWeight="700"
                color={DesignTokens.colors.brown[700]}
                marginBottom="$1"
                paddingHorizontal="$1"
              >
                Special Instructions
              </Text>
              <YStack
                backgroundColor={DesignTokens.colors.orange[50]}
                borderRadius="$4"
                padding="$4"
                borderWidth={1}
                borderColor={DesignTokens.colors.orange[200]}
                style={{
                  shadowColor: DesignTokens.colors.orange[300],
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <Text fontSize={15} color={DesignTokens.colors.brown[800]} fontStyle="italic" lineHeight={22}>
                  "{order.specialInstructions}"
                </Text>
              </YStack>
            </YStack>
          )}

          {/* Pricing Section - Enhanced visual hierarchy */}
          <YStack space="$2">
            <Text
              fontSize={DesignTokens.typography.fontSize.md}
              fontWeight="700"
              color={DesignTokens.colors.brown[700]}
              marginBottom="$1"
              paddingHorizontal="$1"
            >
              Payment Summary
            </Text>
            <YStack
              backgroundColor={DesignTokens.colors.neutral.white}
              borderRadius="$4"
              padding="$4"
              space="$3"
              style={{
                shadowColor: DesignTokens.colors.brown[900],
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <YStack space="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={14} color={DesignTokens.colors.lightBrown[500]}>Subtotal</Text>
                  <Text fontSize={15} fontWeight="600" color={DesignTokens.colors.brown[900]}>{pricing.subtotal}</Text>
                </XStack>
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={14} color={DesignTokens.colors.lightBrown[500]}>Taxes & Charges</Text>
                  <Text fontSize={15} fontWeight="600" color={DesignTokens.colors.brown[900]}>{pricing.taxes}</Text>
                </XStack>
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={14} color={DesignTokens.colors.lightBrown[500]}>Delivery Fee</Text>
                  <Text fontSize={15} fontWeight="600" color={DesignTokens.colors.brown[900]}>{pricing.deliveryFee}</Text>
                </XStack>

                <XStack height={1} backgroundColor={DesignTokens.colors.beige[300]} marginVertical="$1" />

                <XStack justifyContent="space-between" alignItems="center" paddingTop="$1">
                  <Text fontSize={18} fontWeight="700" color={DesignTokens.colors.brown[900]}>Total Amount</Text>
                  <Text fontSize={24} fontWeight="700" color={DesignTokens.colors.orange[600]}>{pricing.total}</Text>
                </XStack>

                {/* Payment Status Section - Enhanced with better touch targets */}
                <YStack marginTop="$4" space="$2">
                  <TouchableOpacity
                    onPress={handleTogglePaymentStatus}
                    activeOpacity={0.7}
                  >
                    <XStack
                      minHeight={64}
                      backgroundColor={isPaid ? '#ECFDF5' : '#FFF7ED'}
                      paddingHorizontal="$4"
                      paddingVertical="$3"
                      borderRadius="$4"
                      alignItems="center"
                      justifyContent="space-between"
                      borderWidth={2}
                      borderColor={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[400]}
                      style={{
                        shadowColor: isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[500],
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 3,
                      }}
                    >
                      <XStack alignItems="center" space="$3" flex={1}>
                        <YStack
                          width={48}
                          height={48}
                          borderRadius="$4"
                          backgroundColor={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[500]}
                          alignItems="center"
                          justifyContent="center"
                        >
                          {isPaid ? (
                            <Check size={28} color="#FFFFFF" strokeWidth={3} />
                          ) : (
                            <CreditCard size={28} color="#FFFFFF" />
                          )}
                        </YStack>
                        <YStack flex={1} space="$1">
                          <Text
                            fontSize={16}
                            color={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[800]}
                            fontWeight="700"
                          >
                            {paymentStatusText}
                          </Text>
                          <Text
                            fontSize={13}
                            color={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[700]}
                            fontWeight="500"
                          >
                            {isPaid ? 'Payment received successfully' : 'Tap to mark as paid'}
                          </Text>
                        </YStack>
                      </XStack>
                      <YStack
                        backgroundColor={isPaid ? DesignTokens.colors.semantic.success : DesignTokens.colors.orange[600]}
                        paddingHorizontal="$4"
                        paddingVertical="$2"
                        borderRadius="$3"
                        minWidth={90}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text
                          fontSize={13}
                          color="#FFFFFF"
                          fontWeight="700"
                          letterSpacing={0.5}
                        >
                          {isPaid ? 'PAID' : 'MARK PAID'}
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

      {/* Action Buttons - Enhanced with better touch targets and visual prominence */}
      {order.status !== 'DELIVERED' && (
        <YStack
          padding="$4"
          paddingBottom={insets.bottom + 16}
          space="$4"
          backgroundColor={DesignTokens.colors.background.light}
          borderTopWidth={1}
          borderTopColor={DesignTokens.colors.beige[200]}
          style={{
            shadowColor: DesignTokens.colors.brown[900],
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Button
            onPress={() => setShowStatusModal(true)}
            variant="primary"
            fullWidth
            style={{
              backgroundColor: DesignTokens.colors.orange[500],
              minHeight: 56,
              borderRadius: 12,
              shadowColor: DesignTokens.colors.orange[500],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text fontSize={16} fontWeight="700" color="#FFFFFF" letterSpacing={0.5}>
              Update Order Status
            </Text>
          </Button>
          <Button
            onPress={handleCancelOrder}
            variant="outline"
            fullWidth
            style={{
              borderColor: DesignTokens.colors.semantic.error,
              backgroundColor: DesignTokens.colors.neutral.white,
              minHeight: 56,
              borderRadius: 12,
              borderWidth: 2,
              shadowColor: DesignTokens.colors.semantic.error,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text fontSize={16} fontWeight="700" color={DesignTokens.colors.semantic.error} letterSpacing={0.5}>
              Cancel Order
            </Text>
          </Button>
        </YStack>
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
