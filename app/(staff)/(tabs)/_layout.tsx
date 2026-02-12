import { Tabs } from 'expo-router';
import { StaffTabBar } from '@/components/staff/StaffTabBar';

export default function StaffTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <StaffTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Orders',
          href: null,
        }}
      />
      <Tabs.Screen
        name="restaurant-settings"
        options={{
          title: 'Restaurant',
          href: null,
        }}
      />
    </Tabs>
  );
}
