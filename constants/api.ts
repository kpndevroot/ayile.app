export const API_BASE_URL = 'http://10.219.31.111:8080';

// Unsplash API Configuration
// Get your API key from: https://unsplash.com/developers
// Add it to your .env file as: EXPO_PUBLIC_UNSPLASH_ACCESS_KEY=your_key_here
export const UNSPLASH_ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || '';
export const UNSPLASH_API_URL = 'https://api.unsplash.com';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    VERIFY: '/api/auth/verify',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
  },
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: string) => `/api/users/${id}`,
  },
  MENU_ITEMS: '/api/menu-items',
  ORDERS: {
    BASE: '/api/orders',
    BY_ID: (id: string) => `/api/orders/${id}`,
    ITEMS: (id: string) => `/api/orders/${id}/items`,
    ITEM: (orderId: string, itemId: string) => `/api/orders/${orderId}/items/${itemId}`,
    UPDATE_STATUS: (id: string) => `/api/orders/${id}/status`,
    UPDATE_PAYMENT_STATUS: (id: string) => `/api/orders/${id}/payment-status`,
    WEBSOCKET: '/api/orders/ws',
  },
  RESTAURANTS: {
    BY_ID: (id: string) => `/api/restaurants/${id}`,
    TABLES: (id: string) => `/api/restaurants/${id}/tables`,
    QR_CODE: (id: string) => `/api/restaurants/${id}/qr-code`,
  },
} as const;

