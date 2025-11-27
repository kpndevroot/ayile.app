import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { StorageService } from '@/utils/storage';
import { User } from '@/types';

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface SignupData {
  phone: string;
  name: string;
  password: string;
  role?: 'CUSTOMER' | 'ADMIN' | 'STAFF' | 'GUEST';
}

/**
 * Authentication service
 * Follows Single Responsibility Principle - only handles auth API calls
 */
export class AuthService {
  static async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    console.log('login', credentials);
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: credentials.phone.replace(/\s/g, ''),
        password: credentials.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return {
      user: data.user,
      token: data.token,
    };
  }

  static async signup(data: SignupData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: data.phone.replace(/\s/g, ''),
        name: data.name.trim(),
        password: data.password,
        role: data.role || 'CUSTOMER',
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Signup failed');
    }

    // Return the user data from the API response
    // The API already splits name into firstName and lastName
    return responseData.user;
  }

  static async saveAuthData(user: User, token: string): Promise<void> {
    await StorageService.setAuthToken(token);
    await StorageService.setUserData(user);
    await StorageService.setUserCreated(true);
    await StorageService.setUserId(user.id);
  }

  static async logout(): Promise<void> {
    try {
      const token = await StorageService.getAuthToken();
      
      // Call logout API endpoint
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
    } catch (error) {
      // Even if API call fails, continue with local logout
      console.error('Error calling logout API:', error);
    } finally {
      // Always clear local storage
      await StorageService.clearAll();
    }
  }
}

