import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { ThemedView } from '@/components/themed-view';

export default function OffersScreen() {
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
});

