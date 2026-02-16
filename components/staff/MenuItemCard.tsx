import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { Camera, Trash2 } from '@tamagui/lucide-icons';
import { DesignTokens } from '@/constants/design';
import { StaffMenuItem } from '@/services/staffService';
import { getFullImageUrl } from '@/utils/imageUtils';

interface MenuItemCardProps {
  item: StaffMenuItem;
  onUploadImage: (item: StaffMenuItem) => void;
  onDelete: (item: StaffMenuItem) => void;
}

const MenuItemCard = React.memo(function MenuItemCard({ item, onUploadImage, onDelete }: MenuItemCardProps) {
  const imageUrl = getFullImageUrl(item.imageUrl);

  return (
    <XStack
      backgroundColor={DesignTokens.colors.background.card}
      borderRadius={DesignTokens.radius.md}
      padding="$3"
      gap="$3"
      alignItems="center"
      style={DesignTokens.shadows.sm}
    >
      {/* Thumbnail */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: 60,
            height: 60,
            borderRadius: DesignTokens.radius.sm,
          }}
          resizeMode="cover"
        />
      ) : (
        <YStack
          width={60}
          height={60}
          borderRadius={DesignTokens.radius.sm}
          backgroundColor={DesignTokens.colors.beige[200]}
          alignItems="center"
          justifyContent="center"
        >
          <Camera size={24} color={DesignTokens.colors.lightBrown[400]} />
        </YStack>
      )}

      {/* Info */}
      <YStack flex={1} gap="$1">
        <Text
          fontSize={DesignTokens.typography.fontSize.md}
          fontWeight={DesignTokens.typography.fontWeight.semibold}
          color={DesignTokens.colors.brown[900]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <XStack gap="$2" alignItems="center">
          {item.category?.name && (
            <Text
              fontSize={DesignTokens.typography.fontSize.xs}
              color={DesignTokens.colors.lightBrown[400]}
            >
              {item.category.name}
            </Text>
          )}
          <Text
            fontSize={DesignTokens.typography.fontSize.sm}
            fontWeight={DesignTokens.typography.fontWeight.semibold}
            color={DesignTokens.colors.orange[500]}
          >
            ${Number(item.basePrice).toFixed(2)}
          </Text>
        </XStack>
        <XStack
          backgroundColor={item.isAvailable ? DesignTokens.colors.semantic.success + '20' : DesignTokens.colors.semantic.error + '20'}
          paddingHorizontal="$2"
          paddingVertical={2}
          borderRadius={DesignTokens.radius.full}
          alignSelf="flex-start"
        >
          <Text
            fontSize={DesignTokens.typography.fontSize.xs}
            fontWeight={DesignTokens.typography.fontWeight.medium}
            color={item.isAvailable ? DesignTokens.colors.semantic.success : DesignTokens.colors.semantic.error}
          >
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </Text>
        </XStack>
      </YStack>

      {/* Actions */}
      <YStack gap="$2">
        <TouchableOpacity onPress={() => onUploadImage(item)}>
          <YStack
            width={36}
            height={36}
            borderRadius={DesignTokens.radius.sm}
            backgroundColor={DesignTokens.colors.orange[100]}
            alignItems="center"
            justifyContent="center"
          >
            <Camera size={18} color={DesignTokens.colors.orange[500]} />
          </YStack>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item)}>
          <YStack
            width={36}
            height={36}
            borderRadius={DesignTokens.radius.sm}
            backgroundColor={DesignTokens.colors.semantic.error + '15'}
            alignItems="center"
            justifyContent="center"
          >
            <Trash2 size={18} color={DesignTokens.colors.semantic.error} />
          </YStack>
        </TouchableOpacity>
      </YStack>
    </XStack>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.basePrice === nextProps.item.basePrice &&
    prevProps.item.isAvailable === nextProps.item.isAvailable &&
    prevProps.item.imageUrl === nextProps.item.imageUrl
  );
});

export { MenuItemCard };
