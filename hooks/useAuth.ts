import { useState, useEffect } from 'react';
import { StorageService } from '@/utils/storage';
import { User } from '@/types';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

/**
 * Custom hook for authentication state management
 * Follows Single Responsibility Principle - only handles auth state
 */
export function useAuth(): UseAuthReturn {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await StorageService.getUserData();
      const userCreated = await StorageService.getUserCreated();
      
      if (userCreated && userData) {
        setUserState(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = async (userData: User | null) => {
    setUserState(userData);
    if (userData) {
      await StorageService.setUserData(userData);
      await StorageService.setUserCreated(true);
      await StorageService.setUserId(userData.id);
    }
  };

  const logout = async () => {
    await StorageService.clearAll();
    setUserState(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    logout,
  };
}

