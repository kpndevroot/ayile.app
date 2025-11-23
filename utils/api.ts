import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/constants/storage';

/**
 * Retrieves the authentication token from secure storage
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Makes an authenticated API request with JWT token
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * Parses QR code URL to extract restaurant ID and table unique ID
 */
export const parseQRCode = (data: string): { restaurantId: string; tableUniqueId: string } | null => {
  const urlPattern = /\/restaurant\/([^/]+)\/table\/([^/]+)/;
  const match = data.match(urlPattern);
  
  if (match && match[1] && match[2]) {
    return {
      restaurantId: match[1],
      tableUniqueId: match[2],
    };
  }
  
  return null;
};

