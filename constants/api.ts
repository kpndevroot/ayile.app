export const API_BASE_URL = 'http://10.76.45.111:3000';

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
  },
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: string) => `/api/users/${id}`,
  },
  RESTAURANTS: {
    BY_ID: (id: string) => `/api/restaurants/${id}`,
  },
  MENU_ITEMS: '/api/menu-items',
  ORDERS: {
    BASE: '/api/orders',
    BY_ID: (id: string) => `/api/orders/${id}`,
    ITEMS: (id: string) => `/api/orders/${id}/items`,
    ITEM: (orderId: string, itemId: string) => `/api/orders/${orderId}/items/${itemId}`,
  },
} as const;

