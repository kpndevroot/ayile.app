import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from '@tamagui/lucide-icons';
import { DesignTokens } from '@/constants/design';
import { Skeleton } from '@/components/ui/Skeleton';
import { MenuItemForm } from '@/components/staff/MenuItemForm';
import { StaffService } from '@/services/staffService';
import { useNotification } from '@/contexts/NotificationContext';
import type { MenuItemFormData } from '@/lib/validations/menuItemSchema';

export default function EditMenuItemScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showNotification } = useNotification();
  const [initialValues, setInitialValues] = useState<Partial<MenuItemFormData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadMenuItem(id);
    }
  }, [id]);

  const loadMenuItem = async (menuItemId: string) => {
    try {
      setLoading(true);
      const item = await StaffService.getMenuItemById(menuItemId);

      setInitialValues({
        name: item.name || '',
        description: item.description || '',
        categoryId: item.categoryId || item.category?.id || '',
        dietaryType: item.dietaryTypes?.[0] || 'NON_VEG',
        isSpicy: item.isSpicy ?? (item.spicyLevel > 0),
        spicyLevel: item.spicyLevel || 0,
        basePrice: typeof item.basePrice === 'number' ? item.basePrice : parseFloat(item.basePrice || '0'),
        prepTimeMinutes: item.prepTimeMinutes || 15,
        quantityOptions:
          item.quantityOptions?.length > 0
            ? item.quantityOptions.map((opt: any) => ({
                quantityTypeId: opt.quantityTypeId || opt.quantityType?.id || '',
                value: opt.value || 1,
                displayLabel: opt.displayLabel || '',
                price: typeof opt.price === 'number' ? opt.price : parseFloat(opt.price || '0'),
                isDefault: opt.isDefault ?? false,
              }))
            : [
                {
                  quantityTypeId: '',
                  value: 1,
                  displayLabel: 'Full',
                  price: typeof item.basePrice === 'number' ? item.basePrice : parseFloat(item.basePrice || '0'),
                  isDefault: true,
                },
              ],
      });
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: 'Failed to load menu item',
        message: error.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack
      flex={1}
      backgroundColor={DesignTokens.colors.background.light}
      paddingTop={insets.top}
    >
      {/* Header */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
      >
        <XStack alignItems="center" gap="$2">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={DesignTokens.colors.brown[900]} />
          </TouchableOpacity>
          <Text
            fontSize={DesignTokens.typography.fontSize.xl}
            fontWeight={DesignTokens.typography.fontWeight.bold}
            color={DesignTokens.colors.brown[900]}
          >
            Edit Menu Item
          </Text>
        </XStack>
      </XStack>

      {loading ? (
        <YStack padding="$4" gap="$4">
          <Skeleton width="100%" height={200} />
          <Skeleton width="60%" height={20} />
          <Skeleton width="100%" height={48} />
          <Skeleton width="100%" height={48} />
          <Skeleton width="100%" height={100} />
        </YStack>
      ) : initialValues ? (
        <MenuItemForm
          mode="edit"
          initialValues={initialValues}
          menuItemId={id}
          onSuccess={() => router.back()}
          onCancel={() => router.back()}
        />
      ) : (
        <YStack padding="$4" alignItems="center">
          <Text
            fontSize={DesignTokens.typography.fontSize.md}
            color={DesignTokens.colors.semantic.error}
          >
            Failed to load menu item.
          </Text>
        </YStack>
      )}
    </YStack>
  );
}
