export type UserRole = 'CUSTOMER' | 'ADMIN' | 'STAFF';

export type Step = 1 | 2 | 3 | 4;

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  role: UserRole;
  restaurantId?: string | null;
  _count: {
    orders: number;
    payments: number
  }
}

export interface Restaurant {
  id: string;
  name: string;
  address?: string;
  description?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  rating?: number;
  openingTime?: string;
  closingTime?: string;
  tables?: Table[];
}

export interface Table {
  id: string;
  tableNumber?: string;
  uniqueId: string;
  restaurantId: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: string;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime?: number;
  restaurantId: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: string;
  basePrice?: string;
  totalPrice?: string;
  specialInstructions?: string | null;
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  tableId?: string | null;
  tableNumber?: string | null;
  status: OrderStatus;
  totalAmount: string;
  specialInstructions?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  restaurant?: Restaurant;
  table?: Table;
  orderItems?: OrderItem[];
}

export interface TableInfo {
  uniqueId: string;
}

