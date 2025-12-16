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
 * Parses QR code URL to extract restaurant ID
 * Supports formats:
 * - /restaurant/{id}/order
 * - /restaurant/{id}/table/{tableId}
 * - http://host/restaurant/{id}/order
 */
export const parseQRCode = (data: string): { restaurantId: string } | null => {
  // Match restaurant ID from various URL patterns
  const urlPatterns = [
    /\/restaurant\/([a-f0-9-]{36})\/order/i,  // /restaurant/{uuid}/order
    /\/restaurant\/([a-f0-9-]{36})\/table/i,  // /restaurant/{uuid}/table
    /\/restaurant\/([a-f0-9-]{36})/i,         // /restaurant/{uuid}
  ];
  
  for (const pattern of urlPatterns) {
    const match = data.match(pattern);
    if (match && match[1]) {
      return {
        restaurantId: match[1],
      };
    }
  }
  
  return null;
};

