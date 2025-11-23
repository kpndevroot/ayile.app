import { useState, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Accordion } from '@tamagui/accordion';
import { ChevronDown } from '@tamagui/lucide-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { TopBar } from '@/components/ui/TopBar';
import { Restaurant } from '@/types';
import { StorageService } from '@/utils/storage';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';

/**
 * Restaurant Details Tab
 * Displays restaurant information in an accordion format
 */
export default function RestaurantTab() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const restaurantData = await StorageService.getRestaurantData();
      const userData = await StorageService.getUserData();
      
      if (restaurantData) {
        setRestaurant(restaurantData);
      }
      
      if (userData) {
        setUserData(userData);
      }
    } catch (error) {
      console.error('Error loading restaurant data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Text fontSize="$4" color="$gray11">
            Loading restaurant details...
          </Text>
        </YStack>
      </ThemedView>
    );
  }

  if (!restaurant) {
    return (
      <ThemedView style={styles.container}>
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
          <Text fontSize="$5" fontWeight="bold" textAlign="center" marginBottom="$2">
            No Restaurant Selected
          </Text>
          <Text fontSize="$4" color="$gray11" textAlign="center">
            Please scan a QR code to view restaurant details
          </Text>
        </YStack>
      </ThemedView>
    );
  }

  const userName = userData ? `${userData.firstName} ${userData.lastName}` : 'Guest';

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* TopBar for Guest users */}
        {userData?.role === 'GUEST' && (
          <TopBar
            userName={userName}
            userRole={userData.role}
          />
        )}

        <YStack gap="$4" padding="$4">
          <YStack gap="$3" alignItems="center" marginBottom="$2">
            <Text fontSize="$10" fontWeight="bold" textAlign="center">
              {restaurant.name} 🍴
            </Text>
            {restaurant.description && (
              <Text fontSize="$4" color="$gray11" textAlign="center" marginBottom="$2">
                {restaurant.description}
              </Text>
            )}
          </YStack>

          {/* Restaurant Details Accordion */}
          <Accordion
            type="single"
            collapsible
            width="100%"
            marginTop="$2"
            gap="$2"
          >
            <Accordion.Item value="details" overflow="hidden" borderRadius="$4" borderWidth={1} borderColor="$gray5">
              <Accordion.Header>
                <Accordion.Trigger
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  padding="$4"
                  backgroundColor="$gray2"
                  hoverStyle={{
                    backgroundColor: '$gray3',
                  }}
                  pressStyle={{
                    backgroundColor: '$gray3',
                  }}
                >
                  <XStack gap="$3" alignItems="center" flex={1}>
                    <Text fontSize="$6" fontWeight="bold">
                      📍 Restaurant Details
                    </Text>
                  </XStack>
                  <ChevronDown
                    size={20}
                    color="$gray11"
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content
                padding="$4"
                backgroundColor="$gray1"
                animation="quick"
              >
                <YStack gap="$3">
                  {restaurant.address && (
                    <XStack justifyContent="space-between" alignItems="flex-start">
                      <Text fontSize="$4" color="$gray11">Address:</Text>
                      <Text fontSize="$4" fontWeight="600" flex={1} textAlign="right" marginLeft="$2">
                        {restaurant.address}
                      </Text>
                    </XStack>
                  )}
                  
                  {restaurant.city && (
                    <XStack justifyContent="space-between">
                      <Text fontSize="$4" color="$gray11">City:</Text>
                      <Text fontSize="$4" fontWeight="600">
                        {restaurant.city}
                      </Text>
                    </XStack>
                  )}
                  
                  {restaurant.country && (
                    <XStack justifyContent="space-between">
                      <Text fontSize="$4" color="$gray11">Country:</Text>
                      <Text fontSize="$4" fontWeight="600">
                        {restaurant.country}
                      </Text>
                    </XStack>
                  )}
                  
                  {restaurant.phone && (
                    <XStack justifyContent="space-between">
                      <Text fontSize="$4" color="$gray11">Phone:</Text>
                      <Text fontSize="$4" fontWeight="600">
                        {restaurant.phone}
                      </Text>
                    </XStack>
                  )}
                  
                  {restaurant.email && (
                    <XStack justifyContent="space-between">
                      <Text fontSize="$4" color="$gray11">Email:</Text>
                      <Text fontSize="$4" fontWeight="600">
                        {restaurant.email}
                      </Text>
                    </XStack>
                  )}
                  
                  {restaurant.rating !== undefined && (
                    <XStack justifyContent="space-between">
                      <Text fontSize="$4" color="$gray11">Rating:</Text>
                      <XStack gap="$1" alignItems="center">
                        <Text fontSize="$4" fontWeight="600">
                          {restaurant.rating.toFixed(1)}
                        </Text>
                        <Text fontSize="$4">⭐</Text>
                      </XStack>
                    </XStack>
                  )}
                  
                  {(restaurant.openingTime || restaurant.closingTime) && (
                    <XStack justifyContent="space-between">
                      <Text fontSize="$4" color="$gray11">Hours:</Text>
                      <Text fontSize="$4" fontWeight="600">
                        {restaurant.openingTime || '--'} - {restaurant.closingTime || '--'}
                      </Text>
                    </XStack>
                  )}
                </YStack>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </YStack>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});

