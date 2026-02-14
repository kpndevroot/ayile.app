import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * OS-level notification service using expo-notifications.
 * Handles permission requests, Android channel setup, and local notification scheduling.
 */

// Track permission status to avoid redundant checks
let permissionGranted: boolean | null = null;

// Determine if we are running in Expo Go
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Configure how notifications are presented when the app is in foreground.
 * Must be called once at app startup (before any notifications fire).
 */
export function configureNotificationHandler(): void {
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
 * Required for Android 8+ (API 26+). No-op on iOS.
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    // In Expo Go SDK 53+, remote push notification functionality is removed on Android.
    // While this is a local channel setup, the library may still trigger checks that fail in Expo Go.
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

    // On Android in Expo Go, requestPermissionsAsync might throw or warn about missing push capability
    const { status } = await Notifications.requestPermissionsAsync();
    permissionGranted = status === 'granted';
    return permissionGranted;
  } catch (error) {
    console.warn('[OSNotifications] Permission request failed:', error);
    // If it fails due to Expo Go limitations, we just assume false but don't crash
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
  try {
    configureNotificationHandler();

    // In Expo Go on Android, skip operations that are known to cause issues with remote push removal
    // if they are being correctly identified by the library as part of push functionality.
    // However, channel setup is generally for local too, so we try but catch.
    await setupNotificationChannel();

    // Request permission, which is also necessary for local notifications
    return await requestNotificationPermission();
  } catch (error) {
    console.error('[OSNotifications] Failed to initialize notifications:', error);
    return false;
  }
}
