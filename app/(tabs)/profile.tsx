import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedView } from '@/components/themed-view';
import { StorageService } from '@/utils/storage';
import { AuthService } from '@/services/authService';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await StorageService.getUserData();
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all storage
              await AuthService.logout();
              
              // Clear AsyncStorage keys to ensure clean state
              await StorageService.clearAll();
              
              // Navigate to index tab which will show login screen
              router.replace('/(tabs)/');
            } catch (error) {
              console.error('Error logging out:', error);
              // Even if there's an error, try to clear storage and navigate
              try {
                await StorageService.clearAll();
                router.replace('/(tabs)/');
              } catch (clearError) {
                console.error('Error clearing storage:', clearError);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              }
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <YStack
          flex={1}
          paddingHorizontal={20}
          paddingTop={60}
          paddingBottom={40}
          maxWidth={500}
          width="100%"
          alignSelf="center"
          backgroundColor="$beige1"
        >
          {/* Header */}
          <YStack gap={8} marginBottom={32} alignItems="center">
            <Text
              fontSize={32}
              fontWeight="700"
              color="$brown9"
              textAlign="center"
            >
              Profile
            </Text>
          </YStack>

          {/* User Info Card */}
          <YStack
            backgroundColor="white"
            borderRadius={12}
            padding={20}
            marginBottom={24}
            gap={16}
          >
            <XStack alignItems="center" gap={16}>
              <YStack
                width={64}
                height={64}
                borderRadius={32}
                backgroundColor="$orange6"
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  fontSize={24}
                  fontWeight="700"
                  color="white"
                >
                  {userData?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </YStack>
              <YStack flex={1} gap={4}>
                <Text
                  fontSize={20}
                  fontWeight="600"
                  color="$brown9"
                >
                  {userData?.firstName && userData?.lastName
                    ? `${userData.firstName} ${userData.lastName}`
                    : userData?.name || 'User'}
                </Text>
                <Text
                  fontSize={14}
                  fontWeight="400"
                  color="$lightBrown5"
                >
                  {userData?.phone || userData?.email || 'No contact info'}
                </Text>
                {userData?.role && (
                  <Text
                    fontSize={12}
                    fontWeight="500"
                    color="$orange6"
                    marginTop={4}
                  >
                    {userData.role}
                  </Text>
                )}
              </YStack>
            </XStack>
          </YStack>

          {/* Menu Items */}
          <YStack gap={12}>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" gap={12}>
                  <MaterialIcons name="history" size={24} color="#1A0F08" />
                  <Text fontSize={16} fontWeight="500" color="$brown9">
                    Order History
                  </Text>
                </XStack>
                <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
              </XStack>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" gap={12}>
                  <MaterialIcons name="settings" size={24} color="#1A0F08" />
                  <Text fontSize={16} fontWeight="500" color="$brown9">
                    Settings
                  </Text>
                </XStack>
                <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
              </XStack>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" gap={12}>
                  <MaterialIcons name="help-outline" size={24} color="#1A0F08" />
                  <Text fontSize={16} fontWeight="500" color="$brown9">
                    Help & Support
                  </Text>
                </XStack>
                <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
              </XStack>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={handleLogout}
            >
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" gap={12}>
                  <MaterialIcons name="logout" size={24} color="#EF4444" />
                  <Text fontSize={16} fontWeight="500" color="#EF4444">
                    Logout
                  </Text>
                </XStack>
                <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
              </XStack>
            </TouchableOpacity>
          </YStack>
        </YStack>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scrollContent: {
    flexGrow: 1,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E0D6',
  },
});

