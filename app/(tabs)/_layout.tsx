import { Tabs } from 'expo-router';
import React from 'react';
import { CustomTabBar } from '@/components/ui/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          href: null, // Hide from default tab bar
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          title: 'Orders',
          href: null,
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: 'Offers',
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          href: null,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          href: null,
        }}
      />
    </Tabs>
  );
}
