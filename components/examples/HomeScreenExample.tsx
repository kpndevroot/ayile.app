/**
 * Example: Modern Home Screen
 * Demonstrates how to use the new UI components
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { ThemedView } from '@/components/themed-view';
import { DesignTokens } from '@/constants/design';
import { Button, Card, ProductCard, PromotionalBanner, Badge } from '@/components/ui';

export function HomeScreenExample() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <YStack padding="$4" gap="$2">
          <Text
            style={{
              fontSize: DesignTokens.typography.fontSize['3xl'],
              fontWeight: DesignTokens.typography.fontWeight.bold,
              color: DesignTokens.colors.neutral.gray900,
            }}
          >
            Hello John 👋
          </Text>
          <Text
            style={{
              fontSize: DesignTokens.typography.fontSize.lg,
              color: DesignTokens.colors.neutral.gray600,
            }}
          >
            Welcome Back
          </Text>
        </YStack>

        {/* Promotional Banner */}
        <View style={styles.section}>
          <PromotionalBanner
            title="First Order Special!"
            subtitle="Save big on your first delicious meal"
            discount="50%"
            urgencyText="Only 2 Hours Left"
            onPress={() => console.log('Promo clicked')}
          />
        </View>

        {/* Category Tabs */}
        <View style={styles.section}>
          <XStack gap="$2" paddingHorizontal="$4">
            <Button variant="primary" size="sm" onPress={() => console.log('Pizza clicked')}>Pizza</Button>
            <Button variant="outline" size="sm" onPress={() => console.log('Pack clicked')}>Pack</Button>
            <Button variant="outline" size="sm" onPress={() => console.log('See All clicked')}>See All</Button>
          </XStack>
        </View>

        {/* Product Grid */}
        <View style={styles.section}>
          <XStack flexWrap="wrap" justifyContent="space-between" paddingHorizontal="$4">
            <ProductCard
              name="Veggie Pizza"
              price="8.70"
              description="Fresh vegetables and cheese"
              onPress={() => console.log('Product clicked')}
              onAddToCart={() => console.log('Add to cart')}
            />
            <ProductCard
              name="Pepperoni Pizza"
              price="9.00"
              description="Classic pepperoni with cheese"
              onPress={() => console.log('Product clicked')}
              onAddToCart={() => console.log('Add to cart')}
            />
            <ProductCard
              name="Mexican Green"
              price="7.90"
              description="Spicy green peppers"
              onPress={() => console.log('Product clicked')}
              onAddToCart={() => console.log('Add to cart')}
            />
            <ProductCard
              name="Cheese Pizza"
              price="8.50"
              description="Extra cheese"
              onPress={() => console.log('Product clicked')}
              onAddToCart={() => console.log('Add to cart')}
            />
          </XStack>
        </View>

        {/* Order Status Card */}
        <View style={styles.section}>
          <Card padding="lg">
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
              <Text
                style={{
                  fontSize: DesignTokens.typography.fontSize.xl,
                  fontWeight: DesignTokens.typography.fontWeight.bold,
                }}
              >
                Your Order
              </Text>
              <Badge variant="success">4 items</Badge>
            </XStack>
            <Text
              style={{
                fontSize: DesignTokens.typography.fontSize.lg,
                fontWeight: DesignTokens.typography.fontWeight.bold,
                color: DesignTokens.colors.primary.orange,
                marginBottom: DesignTokens.spacing.md,
              }}
            >
              Total: $38.00
            </Text>
            <Button variant="success" size="lg" fullWidth onPress={() => console.log('Payment clicked')}>
              Make Payment
            </Button>
          </Card>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.light,
  },
  scrollContent: {
    paddingBottom: DesignTokens.spacing.xl,
  },
  section: {
    marginBottom: DesignTokens.spacing.lg,
  },
});

