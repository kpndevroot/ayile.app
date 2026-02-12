import React, { useState } from 'react';
import { View, StyleSheet, Image, ImageStyle, ViewStyle } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DesignTokens } from '@/constants/design';
import { getFullImageUrl } from '@/utils/imageUtils';

interface FoodImageProps {
  imageUrl?: string | null;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ImageStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

/**
 * FoodImage Component
 * Displays food images from server with placeholder fallback
 */
export function FoodImage({
  imageUrl,
  width = '100%',
  height = 160,
  borderRadius = 0,
  style,
  resizeMode = 'cover',
}: FoodImageProps) {
  const [imageError, setImageError] = useState(false);

  const containerStyle: ViewStyle = {
    width: width as any,
    height: height as any,
    borderRadius,
    overflow: 'hidden',
    backgroundColor: DesignTokens.colors.beige[200],
    ...(style as any),
  };

  // Show placeholder if no image URL or image failed to load
  if (!imageUrl || imageError) {
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
      source={{ uri: getFullImageUrl(imageUrl) || '' }}
      style={[
        {
          width,
          height,
          borderRadius,
        } as ImageStyle,
        style,
      ]}
      resizeMode={resizeMode}
      onError={() => setImageError(true)}
      onLoadStart={() => setImageError(false)}
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
