import { Stack } from 'expo-router';

/**
 * Staff Navigation Layout
 * Top-level Stack wrapping the bottom tabs and pushed screens
 */
export default function StaffLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
      <Stack.Screen name="add-menu-item" />
      <Stack.Screen name="kitchen-orders" />
      <Stack.Screen name="order-detail" />
      <Stack.Screen name="ready-for-delivery" />
      <Stack.Screen name="table-management" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
