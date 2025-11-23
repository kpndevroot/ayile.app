import React from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { ThemedView } from '@/components/themed-view';
import { DesignTokens } from '@/constants/design';

interface LoadingScreenProps {
  message?: string;
  showSpinner?: boolean;
}

/**
 * LoadingScreen Component
 * Reusable loading screen with optional message and spinner
 */
export function LoadingScreen({ 
  message = 'Loading...', 
  showSpinner = false 
}: LoadingScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
        {showSpinner && (
          <ActivityIndicator 
            size="large" 
            color={DesignTokens.colors.primary.blue} 
          />
        )}
        <Text 
          fontSize="$5" 
          color="$gray11"
          style={styles.text}
        >
          {message}
        </Text>
      </YStack>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    textAlign: 'center',
  },
});

