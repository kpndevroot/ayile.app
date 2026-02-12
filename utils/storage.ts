import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/constants/storage';
import { User, TableInfo, MenuItem } from '@/types';

export interface LocalCartItem {
  menuItemId: string;
  quantity: number;
  menuItem?: MenuItem; // Store full menu item for display
  quantityOptionId?: string; // Track selected quantity option (e.g., Half, Full)
  quantityLabel?: string; // Display label for the selected quantity option
}

/**
 * Storage service for managing AsyncStorage operations
 */
export class StorageService {
  // User data
  static async getUserData(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  static async setUserData(user: User): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  static async getUserCreated(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.USER_CREATED);
    return value === 'true';
  }

  static async setUserCreated(value: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_CREATED, value ? 'true' : 'false');
  }

  static async getUserId(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
  }

  static async setUserId(userId: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }

  // Auth token
  static async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  static async setAuthToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  static async removeAuthToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  // Restaurant data
  static async getRestaurantData(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RESTAURANT_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting restaurant data:', error);
      return null;
    }
  }

  static async setRestaurantData(restaurant: any): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.RESTAURANT_DATA, JSON.stringify(restaurant));
  }

  // Table info
  static async getTableInfo(): Promise<TableInfo | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TABLE_INFO);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting table info:', error);
      return null;
    }
  }

  static async setTableInfo(tableInfo: TableInfo): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TABLE_INFO, JSON.stringify(tableInfo));
  }

  static async getScanned(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.SCANNED);
    return value === 'true';
  }

  static async setScanned(value: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SCANNED, value ? 'true' : 'false');
  }

  // Order data
  static async getOrderId(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.ORDER_ID);
  }

  static async setOrderId(orderId: string | null): Promise<void> {
    if (orderId === null) {
      await AsyncStorage.removeItem(STORAGE_KEYS.ORDER_ID);
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.ORDER_ID, orderId);
    }
  }

  // Local cart data
  static async getLocalCart(): Promise<LocalCartItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_CART);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting local cart:', error);
      return [];
    }
  }

  static async setLocalCart(cart: LocalCartItem[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_CART, JSON.stringify(cart));
  }

  static async clearLocalCart(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.LOCAL_CART);
  }

  static async addToLocalCart(menuItem: MenuItem, quantity: number = 1): Promise<LocalCartItem[]> {
    const cart = await this.getLocalCart();
    const existingIndex = cart.findIndex(item => item.menuItemId === menuItem.id);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        menuItemId: menuItem.id,
        quantity,
        menuItem,
      });
    }

    await this.setLocalCart(cart);
    return cart;
  }

  static async updateLocalCartItem(menuItemId: string, quantity: number): Promise<LocalCartItem[]> {
    const cart = await this.getLocalCart();
    const existingIndex = cart.findIndex(item => item.menuItemId === menuItemId);

    if (existingIndex >= 0) {
      if (quantity <= 0) {
        cart.splice(existingIndex, 1);
      } else {
        cart[existingIndex].quantity = quantity;
      }
    }

    await this.setLocalCart(cart);
    return cart;
  }

  static async removeFromLocalCart(menuItemId: string): Promise<LocalCartItem[]> {
    const cart = await this.getLocalCart();
    const filtered = cart.filter(item => item.menuItemId !== menuItemId);
    await this.setLocalCart(filtered);
    return filtered;
  }

  // Clear all data
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_CREATED,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.RESTAURANT_DATA,
        STORAGE_KEYS.SCANNED,
        STORAGE_KEYS.ORDER_ID,
        STORAGE_KEYS.TABLE_INFO,
        STORAGE_KEYS.LOCAL_CART,
      ]);
      await this.removeAuthToken();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

