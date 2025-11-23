export const API_BASE_URL = 'http://192.168.30.26:3000';

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

