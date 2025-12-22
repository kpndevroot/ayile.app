import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { authenticatedFetch } from '@/utils/api';
import { StorageService } from '@/utils/storage';

export interface StaffOrder {
  id: string;
  orderNumber: string;
  status: string;
  location: string;
  itemsCount: number;
  timeAgo: string;
  statusColor: string;
  paymentStatus?: string; // Payment status: 'COMPLETED', 'PAID', 'PENDING', etc.
  customer?: {
    name: string;
    phone: string;
    address?: string;
  };
  items?: Array<{
    quantity: number;
    name: string;
    modifications?: string;
  }>;
  totalAmount?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  pending: number;
  active: number;
  complete: number;
  revenue: string;
}

export interface Table {
  id: string;
  tableNumber: number;
  uniqueId: string;
  capacity?: number;
  isActive: boolean;
  orderId?: string | null;
  status: 'available' | 'active' | 'inactive';
  seats?: number;
}

export class StaffService {
  /**
   * Get staff user's restaurant ID
   */
  static async getRestaurantId(): Promise<string | null> {
    try {
      const userData = await StorageService.getUserData();
      return userData?.restaurantId || null;
    } catch (error) {
      console.error('Error getting restaurant ID:', error);
      return null;
    }
  }

  /**
   * Get dashboard metrics for staff
   */
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const restaurantId = await this.getRestaurantId();
      if (!restaurantId) {
        // Return default metrics if no restaurant ID
        return {
          pending: 0,
          active: 0,
          complete: 0,
          revenue: '₹0.00',
        };
      }

      // Get orders for the restaurant
      const url = `${API_BASE_URL}${API_ENDPOINTS.ORDERS.BASE}?restaurantId=${restaurantId}&limit=100`;
      console.log('[StaffService] Fetching dashboard metrics:', {
        url,
        restaurantId,
        timestamp: new Date().toISOString(),
      });

      const response = await authenticatedFetch(url);

      console.log('[StaffService] Dashboard metrics response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        timestamp: new Date().toISOString(),
      });

      if (!response.ok) {
        // If API returns error, try to get error message but don't throw
        try {
          const errorData = await response.json();
          console.warn('[StaffService] API returned error:', errorData.error || 'Unknown error');
        } catch {
          // Ignore JSON parse errors
        }
        // Return default metrics instead of throwing
        return {
          pending: 0,
          active: 0,
          complete: 0,
          revenue: '₹0.00',
        };
      }

      const data = await response.json();
      console.log('[StaffService] Dashboard metrics data:', {
        ordersCount: data.orders?.length || 0,
        orders: data.orders?.map((o: any) => ({ id: o.id, status: o.status })) || [],
        timestamp: new Date().toISOString(),
      });

      const orders = data.orders || [];

      // Calculate metrics
      const pending = orders.filter((o: any) =>
        ['PENDING'].includes(o.status)
      ).length;

      const active = orders.filter((o: any) =>
        ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
      ).length;

      const complete = orders.filter((o: any) =>
        ['DELIVERED', 'CANCELLED'].includes(o.status)
      ).length;

      const revenue = orders
        .filter((o: any) => ['DELIVERED'].includes(o.status))
        .reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount?.toString() || '0'), 0)
        .toFixed(2);

      const metrics = {
        pending,
        active,
        complete,
        revenue: `₹${revenue}`,
      };

      console.log('[StaffService] Calculated dashboard metrics:', {
        ...metrics,
        totalOrders: orders.length,
        timestamp: new Date().toISOString(),
      });

      return metrics;
    } catch (error: any) {
      // Only log if it's not a network/expected error
      if (error.message && !error.message.includes('Restaurant ID not found')) {
        console.warn('Error fetching dashboard metrics:', error.message);
      }
      // Always return default metrics instead of throwing
      return {
        pending: 0,
        active: 0,
        complete: 0,
        revenue: '₹0.00',
      };
    }
  }

  /**
   * Get orders for staff dashboard
   */
  static async getOrders(status?: string): Promise<StaffOrder[]> {
    try {
      const restaurantId = await this.getRestaurantId();
      if (!restaurantId) {
        // Return empty array if no restaurant ID
        console.log("No restaurant ID found")
        return [];
      }

      let url = `${API_BASE_URL}${API_ENDPOINTS.ORDERS.BASE}?restaurantId=${restaurantId}`;
      if (status) {
        url += `&status=${status}`;
      }

      console.log('[StaffService] Fetching orders:', {
        url,
        restaurantId,
        status,
        timestamp: new Date().toISOString(),
      });

      const response = await authenticatedFetch(url);

      console.log('[StaffService] Orders response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        timestamp: new Date().toISOString(),
      });

      if (!response.ok) {
        // If API returns error, try to get error message but don't throw
        try {
          const errorData = await response.json();
          console.warn('[StaffService] API returned error:', errorData.error || 'Unknown error');
        } catch {
          // Ignore JSON parse errors
        }
        // Return empty array instead of throwing
        return [];
      }

      const data = await response.json();
      const orders = data.orders || [];

      console.log('[StaffService] Orders data:', {
        ordersCount: orders.length,
        orders: orders.map((o: any) => ({ id: o.id, status: o.status, orderNumber: o.orderNumber })),
        timestamp: new Date().toISOString(),
      });

      return orders.map((order: any) => {
        const now = new Date();
        const createdAt = new Date(order.createdAt);
        const diffMs = now.getTime() - createdAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const timeAgo = diffMins < 1 ? 'Just now' : `${diffMins}m ago`;

        // Determine location
        let location = 'Takeaway';
        if (order.table?.tableNumber) {
          location = `Table ${order.table.tableNumber}`;
        } else if (order.tableNumber) {
          location = `Table ${order.tableNumber}`;
        } else if (order.deliveryType === 'DELIVERY' && order.deliveryAddress) {
          location = 'Delivery';
        }

        // Determine status color
        let statusColor = '#6B7280';
        if (order.status === 'PENDING' || order.status === 'CONFIRMED') {
          statusColor = '#EF4444';
        } else if (order.status === 'PREPARING' || order.status === 'READY') {
          statusColor = '#F59E0B';
        } else if (order.status === 'DELIVERED') {
          statusColor = '#22C55E';
        }

        // Map status to display status
        let displayStatus: 'pending' | 'active' | 'complete' = 'pending';
        if (['PENDING'].includes(order.status)) {
          displayStatus = 'pending';
        } else if (['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(order.status)) {
          displayStatus = 'active';
        } else if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
          displayStatus = 'complete';
        }

        // Determine payment status from order or payments
        let paymentStatus = order.paymentStatus || 'PENDING';
        if (order.payments && order.payments.length > 0) {
          const completedPayment = order.payments.find((p: any) => p.status === 'COMPLETED');
          if (completedPayment) {
            paymentStatus = 'COMPLETED';
          }
        }

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: displayStatus,
          location,
          itemsCount: order._count?.orderItems || order.orderItems?.length || 0,
          timeAgo,
          statusColor,
          paymentStatus,
          customer: order.user ? {
            name: `${order.user.firstName} ${order.user.lastName}`,
            phone: order.user.phone || '',
            address: order.deliveryAddress?.addressLine1 || '',
          } : undefined,
          totalAmount: order.totalAmount?.toString(),
          createdAt: order.createdAt,
        };
      });
    } catch (error: any) {
      // Only log unexpected errors, not expected ones like missing restaurant ID
      if (error.message && !error.message.includes('Restaurant ID not found')) {
        console.warn('Error fetching orders:', error.message);
      }
      return [];
    }
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string): Promise<any> {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}${API_ENDPOINTS.ORDERS.BY_ID(orderId)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      return data.order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: string, estimatedTime?: number): Promise<void> {
    try {
      const body: any = { status };
      if (estimatedTime) {
        body.estimatedTime = estimatedTime;
      }

      const response = await authenticatedFetch(
        `${API_BASE_URL}${API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId)}`,
        {
          method: 'PUT',
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Update payment status (simple paid/not paid)
   * Updates the order's paymentStatus field directly
   * Default state is PENDING (not paid)
   */
  static async updatePaymentStatus(orderId: string, isPaid: boolean): Promise<void> {
    try {
      const paymentStatus = isPaid ? 'COMPLETED' : 'PENDING';
      
      const response = await authenticatedFetch(
        `${API_BASE_URL}${API_ENDPOINTS.ORDERS.UPDATE_PAYMENT_STATUS(orderId)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentStatus: paymentStatus,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update payment status');
      }
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      throw new Error(error.message || 'Failed to update payment status');
    }
  }

  /**
   * Get kitchen orders (pending and preparing)
   */
  static async getKitchenOrders(): Promise<any[]> {
    try {
      const restaurantId = await this.getRestaurantId();
      if (!restaurantId) {
        return [];
      }

      const response = await authenticatedFetch(
        `${API_BASE_URL}${API_ENDPOINTS.ORDERS.BASE}?restaurantId=${restaurantId}&status=PENDING&limit=100`
      );

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.warn('API returned error:', errorData.error || 'Unknown error');
        } catch {
          // Ignore JSON parse errors
        }
        return [];
      }

      const data = await response.json();
      const orders = data.orders || [];

      return orders.map((order: any) => {
        const now = new Date();
        const createdAt = new Date(order.createdAt);
        const diffMs = now.getTime() - createdAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const timeAgo = diffMins < 1 ? 'Just now' : `${diffMins}m ago`;

        let location = 'Takeaway';
        if (order.table?.tableNumber) {
          location = `Table ${order.table.tableNumber}`;
        } else if (order.tableNumber) {
          location = `Table ${order.tableNumber}`;
        }

        const items = (order.orderItems || []).map((item: any) => ({
          quantity: item.quantity,
          name: item.itemName,
          modifications: item.specialInstructions || undefined,
        }));

        return {
          id: order.id,
          location,
          timeAgo,
          items,
          status: order.status === 'PENDING' ? 'pending' : 'preparing',
        };
      });
    } catch (error: any) {
      if (error.message && !error.message.includes('Restaurant ID not found')) {
        console.warn('Error fetching kitchen orders:', error.message);
      }
      return [];
    }
  }

  /**
   * Get ready for delivery orders
   */
  static async getReadyForDeliveryOrders(): Promise<any[]> {
    try {
      const restaurantId = await this.getRestaurantId();
      if (!restaurantId) {
        return [];
      }

      const response = await authenticatedFetch(
        `${API_BASE_URL}${API_ENDPOINTS.ORDERS.BASE}?restaurantId=${restaurantId}&status=READY&limit=100`
      );

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.warn('API returned error:', errorData.error || 'Unknown error');
        } catch {
          // Ignore JSON parse errors
        }
        return [];
      }

      const data = await response.json();
      const orders = data.orders || [];

      return orders.map((order: any) => {
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
          id: order.id,
        };
      });
    } catch (error: any) {
      if (error.message && !error.message.includes('Restaurant ID not found')) {
        console.warn('Error fetching ready orders:', error.message);
      }
      return [];
    }
  }

  /**
   * Get tables for restaurant
   */
  static async getTables(): Promise<Table[]> {
    try {
      const restaurantId = await this.getRestaurantId();
      if (!restaurantId) {
        return [];
      }

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/restaurants/${restaurantId}/tables`
      );

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.warn('API returned error:', errorData.error || 'Unknown error');
        } catch {
          // Ignore JSON parse errors
        }
        return [];
      }

      const data = await response.json();
      return data.tables || [];
    } catch (error: any) {
      if (error.message && !error.message.includes('Restaurant ID not found')) {
        console.warn('Error fetching tables:', error.message);
      }
      return [];
    }
  }

  /**
   * Get categories for restaurant
   */
  static async getCategories(): Promise<any[]> {
    try {
      const restaurantId = await this.getRestaurantId();
      if (!restaurantId) {
        return [];
      }

      // Get categories associated with restaurant
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/categories?restaurantId=${restaurantId}`
      );

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.warn('API returned error:', errorData.error || 'Unknown error');
        } catch {
          // Ignore JSON parse errors
        }
        return [];
      }

      const data = await response.json();
      return data.categories || data.data?.categories || [];
    } catch (error: any) {
      if (error.message && !error.message.includes('Restaurant ID not found')) {
        console.warn('Error fetching categories:', error.message);
      }
      return [];
    }
  }

  /**
   * Get quantity types
   */
  static async getQuantityTypes(): Promise<any[]> {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/quantity-types`
      );

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.warn('API returned error:', errorData.error || 'Unknown error');
        } catch {
          // Ignore JSON parse errors
        }
        return [];
      }

      const data = await response.json();
      return data.quantityTypes || data.data?.quantityTypes || [];
    } catch (error: any) {
      console.warn('Error fetching quantity types:', error.message || 'Unknown error');
      return [];
    }
  }

  /**
   * Create menu item
   */
  static async createMenuItem(menuItemData: any): Promise<any> {
    try {
      const restaurantId = await this.getRestaurantId();
      if (!restaurantId) {
        throw new Error('Restaurant ID not found');
      }

      // Ensure quantityOptions is provided (at least one default)
      if (!menuItemData.quantityOptions || menuItemData.quantityOptions.length === 0) {
        // Get default quantity type (FULL)
        const quantityTypes = await this.getQuantityTypes();
        const fullType = quantityTypes.find((qt: any) => qt.code === 'FULL') || quantityTypes[0];

        if (fullType) {
          menuItemData.quantityOptions = [{
            quantityTypeId: fullType.id,
            value: 1,
            displayLabel: fullType.displayName || 'Full',
            price: parseFloat(menuItemData.basePrice || '0'),
            isDefault: true,
          }];
        }
      }

      const response = await authenticatedFetch(
        `${API_BASE_URL}${API_ENDPOINTS.MENU_ITEMS}`,
        {
          method: 'POST',
          body: JSON.stringify({
            ...menuItemData,
            restaurantId,
            dietaryTypes: menuItemData.dietaryTypes || [menuItemData.dietaryType || 'NON_VEG'],
            isSpicy: menuItemData.spicyLevel > 0,
            spicyLevel: menuItemData.spicyLevel || 0,
            prepTimeMinutes: parseInt(menuItemData.prepTimeMinutes || '15', 10),
            basePrice: parseFloat(menuItemData.basePrice || '0'),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create menu item');
      }

      const data = await response.json();
      return data.menuItem || data.data?.menuItem;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  /**
   * Get restaurant details
   */
  static async getRestaurantDetails(): Promise<any | null> {
    try {
      const restaurantId = await this.getRestaurantId();
      if (!restaurantId) {
        return null;
      }

      const response = await authenticatedFetch(
        `${API_BASE_URL}${API_ENDPOINTS.RESTAURANTS.BY_ID(restaurantId)}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.restaurant || data.data?.restaurant || null;
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      return null;
    }
  }
}
