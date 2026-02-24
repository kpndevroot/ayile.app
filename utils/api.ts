import { StorageService } from './storage';
import { STORAGE_KEYS } from '@/constants/storage';

/**
 * Retrieves the authentication token from secure storage
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await StorageService.getAuthToken();
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
 * Parses QR code data to extract restaurant ID.
 * Supports:
 * - 4-character alphanumeric short code (e.g. "A1B2") — primary format
 * - URL containing the short code (e.g. /r/A1B2 or /restaurant/A1B2)
 */
export const parseQRCode = (data: string): { restaurantId: string } | null => {
  const trimmed = data.trim();

  // Short code: exactly 4 alphanumeric characters
  if (/^[A-Z0-9]{4}$/i.test(trimmed)) {
    return { restaurantId: trimmed.toUpperCase() };
  }

  // URL containing a short code segment: /r/XXXX or /restaurant/XXXX
  const urlMatch = trimmed.match(/\/(?:r|restaurant)\/([A-Z0-9]{4})(?:[/?#]|$)/i);
  if (urlMatch) {
    return { restaurantId: urlMatch[1].toUpperCase() };
  }

  return null;
};

