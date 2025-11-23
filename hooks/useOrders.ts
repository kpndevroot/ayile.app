import { useState, useCallback } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { authenticatedFetch } from '@/utils/api';
import { Order, OrderItem } from '@/types';

interface UseOrdersReturn {
  orderItems: OrderItem[];
  orderDetails: Order | null;
  orderStatus: string | null;
  orderTotal: number;
  isLoading: boolean;
  fetchOrderItems: (orderId: string) => Promise<void>;
  fetchOrderDetails: (orderId: string) => Promise<Order | null>;
  placeOrder: (orderId: string) => Promise<boolean>;
  refreshOrder: (orderId: string) => Promise<void>;
}

/**
 * Custom hook for order management
 * Follows Single Responsibility Principle - only handles order operations
 */
export function useOrders(): UseOrdersReturn {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrderItems = useCallback(async (orderId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.ORDERS.ITEMS(orderId)}`
      );
      const data = await response.json();

      if (response.ok && data.orderItems) {
        setOrderItems(data.orderItems);
        
        const total = data.orderItems.reduce((sum: number, item: OrderItem) => {
          return sum + parseFloat(item.price.toString()) * item.quantity;
        }, 0);
        setOrderTotal(total);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  }, []);

  const fetchOrderDetails = useCallback(async (orderId: string): Promise<Order | null> => {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}${API_ENDPOINTS.ORDERS.BY_ID(orderId)}`
      );
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
  }, []);

  const placeOrder = useCallback(async (orderId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}${API_ENDPOINTS.ORDERS.BY_ID(orderId)}`,
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
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error placing order:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshOrder = useCallback(async (orderId: string) => {
    await fetchOrderDetails(orderId);
  }, [fetchOrderDetails]);

  return {
    orderItems,
    orderDetails,
    orderStatus,
    orderTotal,
    isLoading,
    fetchOrderItems,
    fetchOrderDetails,
    placeOrder,
    refreshOrder,
  };
}

