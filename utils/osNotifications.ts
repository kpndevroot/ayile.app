import { Platform } from 'react-native';

// Only import expo-notifications on native platforms
let Notifications: typeof import('expo-notifications') | null = null;
if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
}

/**
 * OS-level notification service using expo-notifications.
 * Handles permission requests, Android channel setup, and local notification scheduling.
 * All functions are no-ops on web — expo-notifications has no web support.
 */

// Track permission status to avoid redundant checks
let permissionGranted: boolean | null = null;

/**
 * Configure how notifications are presented when the app is in foreground.
 * Must be called once at app startup (before any notifications fire).
 */
export function configureNotificationHandler(): void {
  if (Platform.OS === 'web' || !Notifications) return;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.warn('[OSNotifications] Failed to configure notification handler:', error);
  }
}

/**
 * Set up the Android notification channel.
 * Required for Android 8+ (API 26+). No-op on iOS and web.
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android' || !Notifications) return;

  try {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Order Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F97316',
      sound: 'default',
    });
  } catch (error) {
    console.warn('[OSNotifications] Failed to set up notification channel:', error);
  }
}

/**
 * Request notification permissions from the user.
 * Returns true if permission was granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web' || !Notifications) return false;

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
  if (Platform.OS === 'web' || !Notifications) return false;
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
  if (Platform.OS === 'web' || !Notifications) return null;

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
  if (Platform.OS === 'web') return false;

  try {
    configureNotificationHandler();
    await setupNotificationChannel();
    return await requestNotificationPermission();
  } catch (error) {
    console.error('[OSNotifications] Failed to initialize notifications:', error);
    return false;
  }
}
