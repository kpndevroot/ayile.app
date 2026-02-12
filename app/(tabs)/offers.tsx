import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';

export default function OffersScreen() {
  const { isAuthenticated, requireAuth } = useAuth();

  if (!isAuthenticated) {
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
            alignItems="center"
            gap={16}
          >
            <MaterialIcons name="local-offer" size={64} color="#D4C4B0" />
            <Text
              fontSize={24}
              fontWeight="700"
              color="$brown9"
              textAlign="center"
            >
              Offers & Promotions
            </Text>
            <Text
              fontSize={16}
              fontWeight="400"
              color="$lightBrown5"
              textAlign="center"
            >
              Log in to discover personalized offers and exclusive deals.
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => requireAuth(() => {})}
              activeOpacity={0.8}
            >
              <Text fontSize={18} fontWeight="600" color="white">
                Log In
              </Text>
            </TouchableOpacity>
          </YStack>
        </ScrollView>
      </ThemedView>
    );
  }

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
          <YStack gap={16} alignItems="center" marginTop={40}>
            <Text
              fontSize={32}
              fontWeight="700"
              color="$brown9"
              textAlign="center"
            >
              Offers
            </Text>
            <Text
              fontSize={16}
              fontWeight="400"
              color="$lightBrown5"
              textAlign="center"
            >
              Check back soon for exciting offers and promotions!
            </Text>
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
  loginButton: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 8,
  },
});
