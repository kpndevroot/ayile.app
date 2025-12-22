import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedView } from '@/components/themed-view';
import { StorageService } from '@/utils/storage';
import { AuthService } from '@/services/authService';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reload user data whenever the screen comes into focus
  // This ensures profile updates after logout/login with different user
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const fetchProfileData = async (userId: string, token: string | null) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.BY_ID(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch profile data');
    }

    const data = await response.json();
    // API returns { user: {...} }, so extract the user object
    return data.user;
  }

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = await StorageService.getUserId();
      const AuthToken = await StorageService.getAuthToken();
      console.log('User ID:', userId);
      console.log('Auth Token:', AuthToken ? 'Present' : 'Missing');

      if (userId && AuthToken) {
        const userData = await fetchProfileData(userId, AuthToken);
        console.log('Fetched user data:', userData);
        setUserData(userData);
      } else {
        console.warn('Missing userId or AuthToken');
        setError('Please log in to view your profile');
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      const errorMessage = error?.message || 'Failed to load profile data';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
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
              // Call logout API
              await AuthService.logout();

              // Clear all storage - this must happen before navigation
              await StorageService.clearAll();

              // Set a flag to trigger re-check in index.tsx
              // This ensures the login screen is shown even if component is already mounted
              await AsyncStorage.setItem('@forks_force_logout', 'true');

              // Small delay to ensure storage operations complete
              await new Promise(resolve => setTimeout(resolve, 150));

              // Navigate to index tab which will check user status and show login screen
              // Using replace to prevent going back to profile
              router.replace('/(tabs)/' as any);
            } catch (error) {
              console.error('Logout failed:', error);
              // Even on error, clear storage and navigate
              try {
                await StorageService.clearAll();
                await AsyncStorage.setItem('@forks_force_logout', 'true');
                await new Promise(resolve => setTimeout(resolve, 150));
                router.replace('/(tabs)/' as any);
              } catch (clearError) {
                console.error('Error clearing storage:', clearError);
                // Force navigation even if clearing fails
                router.replace('/(tabs)/' as any);
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

          {/* Loading State */}
          {loading && (
            <YStack alignItems="center" justifyContent="center" paddingVertical={40}>
              <ActivityIndicator size="large" color="#F97316" />
              <Text fontSize={14} color="$lightBrown5" marginTop={12}>
                Loading profile...
              </Text>
            </YStack>
          )}

          {/* Error State */}
          {!loading && error && (
            <YStack
              backgroundColor="#FEE2E2"
              borderRadius={12}
              padding={20}
              marginBottom={24}
            >
              <Text fontSize={14} color="#DC2626" textAlign="center">
                {error}
              </Text>
            </YStack>
          )}

          {/* User Info Card */}
          {!loading && !error && (
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
          )}

          {/* Menu Items */}
          {!loading && (
            <YStack gap={12}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/order')}
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
                onPress={() => console.log('Settings')}
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
                onPress={() => console.log('Help & Support')}
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
          )}
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

