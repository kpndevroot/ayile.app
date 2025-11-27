import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, ImageStyle, ViewStyle } from 'react-native';
import { YStack } from '@tamagui/stacks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFoodImage } from '@/hooks/useFoodImage';
import { DesignTokens } from '@/constants/design';

interface FoodImageProps {
  menuItemName: string;
  category?: string;
  existingImageUrl?: string;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle | ImageStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

/**
 * FoodImage Component
 * Fetches and displays food images from Unsplash with loading, error, and placeholder states
 */
export function FoodImage({
  menuItemName,
  category,
  existingImageUrl,
  width = '100%',
  height = 160,
  borderRadius = 0,
  style,
  resizeMode = 'cover',
}: FoodImageProps) {
  const { imageUrl, isLoading, error } = useFoodImage(menuItemName, category, existingImageUrl);
  const [imageError, setImageError] = useState(false);

  const containerStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    overflow: 'hidden',
    backgroundColor: DesignTokens.colors.beige[200],
    ...style,
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[containerStyle, styles.placeholderContainer]}>
        <ActivityIndicator size="small" color={DesignTokens.colors.orange[500]} />
      </View>
    );
  }

  // Error state or no image
  if (error || !imageUrl || imageError) {
    return (
      <View style={[containerStyle, styles.placeholderContainer]}>
        <MaterialIcons 
          name="restaurant" 
          size={48} 
          color={DesignTokens.colors.lightBrown[500]} 
        />
      </View>
    );
  }

  // Image loaded successfully
  return (
    <Image
      source={{ uri: imageUrl }}
      style={[
        {
          width: typeof width === 'string' ? width : width,
          height: typeof height === 'string' ? height : height,
          borderRadius,
        },
        style,
      ]}
      resizeMode={resizeMode}
      onError={() => setImageError(true)}
      onLoadStart={() => setImageError(false)}
      onLoadEnd={() => setImageError(false)}
    />
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignTokens.colors.beige[200],
  },
});

