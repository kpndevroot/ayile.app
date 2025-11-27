import React from 'react';
import { StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FoodImage } from '@/components/ui/FoodImage';
import { MenuItem } from '@/types';
import { DesignTokens } from '@/constants/design';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MenuCardProps {
  item: MenuItem;
  width?: number;
  scaleAnim?: Animated.Value;
  onAddToCart: (item: MenuItem) => void;
  rating?: number; // Optional rating prop
}

/**
 * Menu Card Component
 * Pixel-perfect recreation of the design shown in the reference image
 * Dark theme card with rounded corners, ratings, and precise spacing
 */
export function MenuCard({ 
  item, 
  width = SCREEN_WIDTH * 0.44, // Slightly wider to match design proportions
  scaleAnim = new Animated.Value(1), 
  onAddToCart,
  rating = 4.5 // Default rating
}: MenuCardProps) {
  
  // Calculate dimensions to match the design exactly
  const cardHeight = width * 1.45; // Optimized aspect ratio from design
  const imageHeight = width * 0.75; // Image takes 75% of card width
  
  const handleAddPress = () => {
    // Subtle animation matching the design's interaction feel
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 400,
        friction: 25,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400,
        friction: 25,
      }),
    ]).start();

    onAddToCart(item);
  };

  return (
    <Animated.View
      style={[
        {
          width,
          height: cardHeight,
          transform: [{ scale: scaleAnim }],
        },
        styles.cardContainer,
      ]}
    >
      <YStack
        width={width}
        height={cardHeight}
        backgroundColor="#2A2A2A" // Dark background matching the design
        borderRadius={20} // Larger border radius as shown in design
        overflow="hidden"
        style={styles.card}
      >
        {/* Food Image with Rounded Corners */}
        <YStack
          margin={8} // 8px margin around image as shown
          marginBottom={0}
          borderRadius={16}
          overflow="hidden"
          style={styles.imageContainer}
        >
          <FoodImage
            menuItemName={item.name}
            category={item.category}
            existingImageUrl={item.imageUrl}
            width={width - 16} // Account for 8px margin on each side
            height={imageHeight}
            borderRadius={16}
            resizeMode="cover"
          />
        </YStack>

        {/* Content Section */}
        <YStack 
          paddingHorizontal={16}
          paddingTop={8}
          paddingBottom={16}
          flex={1}
          justifyContent="space-between"
        >
          {/* Item Name */}
          <Text
            fontSize={16}
            fontWeight="600"
            color="#FFFFFF" // White text on dark background
            numberOfLines={1}
            lineHeight={20}
            marginBottom={8}
          >
            {item.name}
          </Text>

          {/* Price and Rating Row */}
          <XStack
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Price and Rating */}
            <YStack gap={2}>
              <Text 
                fontSize={16}
                fontWeight="700"
                color="#FFFFFF"
              >
                ₹ {parseFloat(item.price).toFixed(0)}
              </Text>
              
              {/* Star Rating */}
              <XStack alignItems="center" gap={4}>
                <MaterialIcons 
                  name="star" 
                  size={14} 
                  color="#FFD700" // Gold star color
                />
                <Text
                  fontSize={12}
                  fontWeight="500"
                  color="#FFFFFF"
                >
                  {rating.toFixed(1)}
                </Text>
              </XStack>
            </YStack>
            
            {/* Add Button - Positioned at bottom right */}
            <TouchableOpacity
              onPress={handleAddPress}
              activeOpacity={0.8}
              style={[
                styles.addButton,
                !item.isAvailable && styles.addButtonDisabled
              ]}
              disabled={!item.isAvailable}
            >
              <MaterialIcons 
                name="add" 
                size={20} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </XStack>

          {/* Availability Status */}
          {!item.isAvailable && (
            <YStack
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundColor="rgba(0,0,0,0.7)"
              alignItems="center"
              justifyContent="center"
              borderRadius={20}
            >
              <YStack
                backgroundColor="#FF4444"
                paddingHorizontal={12}
                paddingVertical={6}
                borderRadius={12}
              >
                <Text
                  fontSize={12}
                  fontWeight="600"
                  color="#FFFFFF"
                >
                  Unavailable
                </Text>
              </YStack>
            </YStack>
          )}
        </YStack>
      </YStack>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginRight: 12, // Spacing between cards in horizontal scroll
    marginBottom: 8,
  },
  card: {
    // Subtle shadow matching the design
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,  
  },
  imageContainer: {
    // Ensure image container has proper styling
    backgroundColor: '#1A1A1A', // Darker background for loading state
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35', // Orange accent color matching design
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow for the button
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },
});