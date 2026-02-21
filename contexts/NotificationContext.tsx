import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { NotificationBanner } from '@/components/ui/NotificationBanner';
import { playNotificationSound } from '@/utils/notificationSound';
import { scheduleLocalNotification } from '@/utils/osNotifications';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationConfig {
  type: NotificationType;
  title: string;
  message?: string;
  /** Auto-dismiss duration in ms. Default 4000. Set 0 to disable. */
  duration?: number;
  /** Enable haptic feedback. Default true. */
  haptic?: boolean;
  /** Play notification sound. Default true. */
  sound?: boolean;
  /** Also fire an OS-level local notification. Default true. */
  osNotification?: boolean;
}

interface NotificationState extends NotificationConfig {
  id: number;
  visible: boolean;
}

interface NotificationContextValue {
  showNotification: (config: NotificationConfig) => void;
  dismissNotification: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const idCounter = useRef(0);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }, []);

  const dismissNotification = useCallback(() => {
    clearTimer();
    setNotification(prev => prev ? { ...prev, visible: false } : null);
    // Remove from state after exit animation
    setTimeout(() => setNotification(null), 350);
  }, [clearTimer]);

  const showNotification = useCallback((config: NotificationConfig) => {
    clearTimer();

    const id = ++idCounter.current;
    const duration = config.duration ?? 4000;

    // Trigger haptic feedback (native only — no haptics API on web)
    if (config.haptic !== false && Platform.OS !== 'web') {
      const hapticType = config.type === 'error'
        ? Haptics.NotificationFeedbackType.Error
        : config.type === 'warning'
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Success;
      Haptics.notificationAsync(hapticType);
    }

    // Play notification sound
    if (config.sound !== false) {
      playNotificationSound();
    }

    // Fire OS-level local notification (shows in notification shade / lock screen)
    if (config.osNotification !== false) {
      scheduleLocalNotification({
        title: config.title,
        body: config.message,
        data: { type: config.type },
      });
    }

    setNotification({
      ...config,
      id,
      visible: true,
    });

    if (duration > 0) {
      dismissTimer.current = setTimeout(() => {
        setNotification(prev => {
          if (prev && prev.id === id) {
            return { ...prev, visible: false };
          }
          return prev;
        });
        // Remove after exit animation
        setTimeout(() => {
          setNotification(prev => (prev && prev.id === id ? null : prev));
        }, 350);
      }, duration);
    }
  }, [clearTimer]);

  return (
    <NotificationContext.Provider value={{ showNotification, dismissNotification }}>
      {children}
      {notification && (
        <NotificationBanner
          type={notification.type}
          title={notification.title}
          message={notification.message}
          visible={notification.visible}
          duration={notification.duration ?? 4000}
          onDismiss={dismissNotification}
        />
      )}
    </NotificationContext.Provider>
  );
}
