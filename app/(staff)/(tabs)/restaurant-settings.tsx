import React, { useState, useCallback } from 'react';
import { FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { YStack, XStack } from '@tamagui/stacks';
import { Text } from '@tamagui/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Plus } from '@tamagui/lucide-icons';
import { DesignTokens } from '@/constants/design';
import { StaffService, StaffMenuItem } from '@/services/staffService';
import { MenuItemCard } from '@/components/staff/MenuItemCard';

export default function RestaurantSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<StaffMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadMenuItems();
    }, [])
  );

  const loadMenuItems = async () => {
    try {
      const items = await StaffService.getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMenuItems();
  }, []);

  const handleUploadImage = async (item: StaffMenuItem) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const updated = await StaffService.uploadMenuItemImage(item.id, result.assets[0].uri);
        // Update item in list with new image
        setMenuItems(current =>
          current.map(mi => mi.id === item.id ? { ...mi, imageUrl: updated?.imageUrl || mi.imageUrl } : mi)
        );
      } catch (error: any) {
        Alert.alert('Upload Failed', error.message || 'Failed to upload image');
      }
    }
  };

  const handleDelete = (item: StaffMenuItem) => {
    Alert.alert(
      'Delete Menu Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Optimistic removal
            const previousItems = [...menuItems];
            setMenuItems(current => current.filter(mi => mi.id !== item.id));
            try {
              await StaffService.deleteMenuItem(item.id);
            } catch (error: any) {
              // Revert on failure
              setMenuItems(previousItems);
              Alert.alert('Error', error.message || 'Failed to delete menu item');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: StaffMenuItem }) => (
    <MenuItemCard
      item={item}
      onUploadImage={handleUploadImage}
      onDelete={handleDelete}
    />
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$3">
        <Text
          fontSize={DesignTokens.typography.fontSize.lg}
          fontWeight={DesignTokens.typography.fontWeight.semibold}
          color={DesignTokens.colors.brown[700]}
          textAlign="center"
        >
          No menu items yet
        </Text>
        <Text
          fontSize={DesignTokens.typography.fontSize.sm}
          color={DesignTokens.colors.lightBrown[400]}
          textAlign="center"
        >
          Add your first menu item to get started.
        </Text>
        <TouchableOpacity onPress={() => router.push('/(staff)/add-menu-item')}>
          <XStack
            backgroundColor={DesignTokens.colors.orange[500]}
            paddingHorizontal="$4"
            paddingVertical="$3"
            borderRadius={DesignTokens.radius.md}
            alignItems="center"
            gap="$2"
            marginTop="$2"
          >
            <Plus size={18} color={DesignTokens.colors.neutral.white} />
            <Text
              fontSize={DesignTokens.typography.fontSize.md}
              fontWeight={DesignTokens.typography.fontWeight.semibold}
              color={DesignTokens.colors.neutral.white}
            >
              Add Your First Item
            </Text>
          </XStack>
        </TouchableOpacity>
      </YStack>
    );
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
        justifyContent="space-between"
      >
        <Text
          fontSize={DesignTokens.typography.fontSize['2xl']}
          fontWeight={DesignTokens.typography.fontWeight.bold}
          color={DesignTokens.colors.brown[900]}
        >
          Restaurant
        </Text>
        <TouchableOpacity onPress={() => router.push('/(staff)/add-menu-item')}>
          <XStack
            backgroundColor={DesignTokens.colors.orange[500]}
            width={36}
            height={36}
            borderRadius={DesignTokens.radius.full}
            alignItems="center"
            justifyContent="center"
          >
            <Plus size={20} color={DesignTokens.colors.neutral.white} />
          </XStack>
        </TouchableOpacity>
      </XStack>

      {/* Menu Items Section Label */}
      <XStack paddingHorizontal="$4" paddingBottom="$2">
        <Text
          fontSize={DesignTokens.typography.fontSize.md}
          fontWeight={DesignTokens.typography.fontWeight.semibold}
          color={DesignTokens.colors.brown[700]}
        >
          Menu Items ({menuItems.length})
        </Text>
      </XStack>

      {loading ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color={DesignTokens.colors.orange[500]} />
        </YStack>
      ) : (
        <FlatList
          data={menuItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 100,
            flexGrow: 1,
            gap: 12,
          }}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={DesignTokens.colors.orange[500]}
              colors={[DesignTokens.colors.orange[500]]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Add Button */}
      {menuItems.length > 0 && (
        <TouchableOpacity
          onPress={() => router.push('/(staff)/add-menu-item')}
          style={{
            position: 'absolute',
            bottom: 90,
            right: 20,
          }}
        >
          <XStack
            backgroundColor={DesignTokens.colors.orange[500]}
            width={56}
            height={56}
            borderRadius={DesignTokens.radius.full}
            alignItems="center"
            justifyContent="center"
            style={DesignTokens.shadows.lg}
          >
            <Plus size={28} color={DesignTokens.colors.neutral.white} />
          </XStack>
        </TouchableOpacity>
      )}
    </YStack>
  );
}
