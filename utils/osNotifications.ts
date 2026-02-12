import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * OS-level notification service using expo-notifications.
 * Handles permission requests, Android channel setup, and local notification scheduling.
 */

// Track permission status to avoid redundant checks
let permissionGranted: boolean | null = null;

/**
 * Configure how notifications are presented when the app is in foreground.
 * Must be called once at app startup (before any notifications fire).
 */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Set up the Android notification channel.
 * Required for Android 8+ (API 26+). No-op on iOS.
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Order Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F97316',
      sound: 'default',
    });
  }
}

/**
 * Request notification permissions from the user.
 * Returns true if permission was granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') {
      permissionGranted = true;
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    permissionGranted = status === 'granted';
    return permissionGranted;
  } catch (error) {
    console.warn('[OSNotifications] Permission request failed:', error);
    permissionGranted = false;
    return false;
  }
}

/**
 * Check if notification permission has been granted (cached).
 */
export async function hasNotificationPermission(): Promise<boolean> {
  if (permissionGranted !== null) return permissionGranted;

  try {
    const { status } = await Notifications.getPermissionsAsync();
    permissionGranted = status === 'granted';
    return permissionGranted;
  } catch {
    return false;
  }
}

/**
 * Schedule a local OS notification immediately.
 * Only fires if permission is granted — silently skips otherwise.
 */
export async function scheduleLocalNotification(config: {
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}): Promise<string | null> {
  const hasPermission = await hasNotificationPermission();
  if (!hasPermission) return null;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: config.title,
        body: config.body,
        data: config.data,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'orders' }),
      },
      trigger: null, // Fire immediately
    });
    return id;
  } catch (error) {
    console.warn('[OSNotifications] Failed to schedule notification:', error);
    return null;
  }
}

/**
 * Full initialization: configure handler, set up channel, request permission.
 * Call once at app startup.
 */
export async function initializeNotifications(): Promise<boolean> {
  configureNotificationHandler();
  await setupNotificationChannel();
  return requestNotificationPermission();
}
