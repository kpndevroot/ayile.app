import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { User } from '@/types';
import { AuthService } from '@/services/authService';
import { StorageService } from '@/utils/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
  authMode: 'login' | 'signup';
  requireAuth: (onSuccess: () => void) => void;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  dismissAuthModal: () => void;
  setAuthMode: (mode: 'login' | 'signup') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const pendingCallbackRef = useRef<(() => void) | null>(null);

  // Hydrate user state from storage on mount
  useEffect(() => {
    const hydrate = async () => {
      try {
        const userData = await StorageService.getUserData();
        const token = await StorageService.getAuthToken();
        if (userData && token) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error hydrating auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    hydrate();
  }, []);

  const requireAuth = useCallback((onSuccess: () => void) => {
    if (user) {
      onSuccess();
    } else {
      pendingCallbackRef.current = onSuccess;
      setAuthMode('login');
      setShowAuthModal(true);
    }
  }, [user]);

  const login = useCallback(async (loginUser: User, token: string) => {
    await AuthService.saveAuthData(loginUser, token);
    setUser(loginUser);
    setShowAuthModal(false);

    // Staff/Admin redirect
    if (loginUser.role === 'STAFF' || loginUser.role === 'ADMIN') {
      pendingCallbackRef.current = null;
      router.replace('/(staff)/(tabs)/dashboard');
      return;
    }

    // Fire pending callback for customers
    const callback = pendingCallbackRef.current;
    pendingCallbackRef.current = null;
    if (callback) {
      callback();
    }
  }, [router]);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
    setShowAuthModal(false);
    pendingCallbackRef.current = null;
  }, []);

  const dismissAuthModal = useCallback(() => {
    setShowAuthModal(false);
    pendingCallbackRef.current = null;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        showAuthModal,
        authMode,
        requireAuth,
        login,
        logout,
        dismissAuthModal,
        setAuthMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
