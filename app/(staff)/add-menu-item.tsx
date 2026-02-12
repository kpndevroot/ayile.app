import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Input as TamaguiInput } from '@tamagui/input';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { DesignTokens } from '@/constants/design';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StaffService } from '@/services/staffService';
import {
  ArrowLeft,
  ImagePlus,
  ChevronRight,
  Flame,
} from '@tamagui/lucide-icons';

type DietaryType = 'VEG' | 'NON_VEG' | 'VEGAN' | 'GLUTEN_FREE';

/**
 * Add Menu Item Screen
 * Form for staff to add new menu items with all details
 */
export default function AddMenuItemScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<DietaryType>('NON_VEG');
  const [spicyLevel, setSpicyLevel] = useState(0); // 0-3 scale
  const [basePrice, setBasePrice] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const dietaryOptions: DietaryType[] = ['VEG', 'NON_VEG', 'VEGAN', 'GLUTEN_FREE'];
  const spicyLabels = ['Not Spicy', 'Mild', 'Medium', 'Hot'];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const cats = await StaffService.getCategories();
      setCategories(cats);
      if (cats.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(cats[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handlePickImage = async () => {
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
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }
    if (!basePrice || parseFloat(basePrice) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      setLoading(true);
      const menuItem = await StaffService.createMenuItem({
        categoryId: selectedCategoryId,
        name: itemName,
        description: description || undefined,
        dietaryTypes: [selectedDietary],
        spicyLevel,
        prepTimeMinutes: prepTime,
        basePrice,
      });

      // Upload image if selected
      if (selectedImage && menuItem?.id) {
        try {
          await StaffService.uploadMenuItemImage(menuItem.id, selectedImage);
        } catch (uploadError: any) {
          console.warn('Image upload failed:', uploadError.message);
          Alert.alert(
            'Menu item created',
            'Item was created but the image failed to upload. You can try uploading it later.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return;
        }
      }

      Alert.alert('Success', 'Menu item created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create menu item');
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
        justifyContent="space-between"
      >
        <XStack alignItems="center" space="$2">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={DesignTokens.colors.brown[900]} />
          </TouchableOpacity>
          <Text
            fontSize={DesignTokens.typography.fontSize.xl}
            fontWeight={DesignTokens.typography.fontWeight.bold}
            color={DesignTokens.colors.brown[900]}
          >
            Add Menu Item
          </Text>
        </XStack>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={DesignTokens.colors.orange[500]} />
          ) : (
            <Text
              fontSize={DesignTokens.typography.fontSize.md}
              fontWeight={DesignTokens.typography.fontWeight.semibold}
              color={DesignTokens.colors.orange[500]}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      </XStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$4" space="$4">
          {/* Photo Section */}
          <YStack space="$2">
            <Text
              fontSize={DesignTokens.typography.fontSize.md}
              fontWeight={DesignTokens.typography.fontWeight.bold}
              color={DesignTokens.colors.brown[900]}
            >
              Photo
            </Text>
            <TouchableOpacity onPress={handlePickImage}>
              {selectedImage ? (
                <YStack
                  borderRadius={DesignTokens.radius.md}
                  overflow="hidden"
                  position="relative"
                >
                  <Image
                    source={{ uri: selectedImage }}
                    style={{ width: '100%', height: 200, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                  <XStack
                    position="absolute"
                    bottom={8}
                    right={8}
                    backgroundColor="rgba(0,0,0,0.6)"
                    paddingHorizontal="$3"
                    paddingVertical="$1"
                    borderRadius={DesignTokens.radius.full}
                  >
                    <Text
                      fontSize={DesignTokens.typography.fontSize.sm}
                      color={DesignTokens.colors.neutral.white}
                      fontWeight={DesignTokens.typography.fontWeight.semibold}
                    >
                      Change Photo
                    </Text>
                  </XStack>
                </YStack>
              ) : (
                <Card
                  padding="$6"
                  backgroundColor={DesignTokens.colors.beige[100]}
                  borderRadius="md"
                  shadow="sm"
                  style={{
                    borderWidth: 2,
                    borderStyle: 'dashed',
                    borderColor: DesignTokens.colors.beige[400],
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 200,
                  }}
                >
                  <YStack alignItems="center" space="$2">
                    <ImagePlus
                      size={48}
                      color={DesignTokens.colors.orange[500]}
                    />
                    <Text
                      fontSize={DesignTokens.typography.fontSize.md}
                      fontWeight={DesignTokens.typography.fontWeight.semibold}
                      color={DesignTokens.colors.orange[500]}
                    >
                      Tap to add photo
                    </Text>
                    <Text
                      fontSize={DesignTokens.typography.fontSize.sm}
                      color={DesignTokens.colors.lightBrown[500]}
                      textAlign="center"
                    >
                      Upload a high-quality image of your menu item.
                    </Text>
                  </YStack>
                </Card>
              )}
            </TouchableOpacity>
          </YStack>

          {/* Basic Information */}
          <YStack space="$3">
            <Text
              fontSize={DesignTokens.typography.fontSize.md}
              fontWeight={DesignTokens.typography.fontWeight.bold}
              color={DesignTokens.colors.brown[900]}
            >
              Basic Information
            </Text>
            <YStack space="$2">
              <Text
                fontSize={DesignTokens.typography.fontSize.sm}
                fontWeight={DesignTokens.typography.fontWeight.semibold}
                color={DesignTokens.colors.brown[900]}
              >
                Item Name
              </Text>
              <TamaguiInput
                placeholder="e.g., Classic Margherita Pizza"
                value={itemName}
                onChangeText={setItemName}
                backgroundColor={DesignTokens.colors.beige[100]}
                borderRadius={DesignTokens.radius.md}
                padding="$3"
                fontSize={DesignTokens.typography.fontSize.md}
                borderWidth={0}
              />
            </YStack>
            <YStack space="$2">
              <Text
                fontSize={DesignTokens.typography.fontSize.sm}
                fontWeight={DesignTokens.typography.fontWeight.semibold}
                color={DesignTokens.colors.brown[900]}
              >
                Description
              </Text>
              <TamaguiInput
                placeholder="e.g., Fresh mozzarella, basil, and tomato sauce."
                value={description}
                onChangeText={setDescription}
                backgroundColor={DesignTokens.colors.beige[100]}
                borderRadius={DesignTokens.radius.md}
                padding="$3"
                fontSize={DesignTokens.typography.fontSize.md}
                borderWidth={0}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </YStack>
          </YStack>

          {/* Category */}
          <YStack space="$2">
            <Text
              fontSize={DesignTokens.typography.fontSize.md}
              fontWeight={DesignTokens.typography.fontWeight.bold}
              color={DesignTokens.colors.brown[900]}
            >
              Category
            </Text>
            {loadingCategories ? (
              <ActivityIndicator size="small" color={DesignTokens.colors.orange[500]} />
            ) : (
              <YStack space="$2">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategoryId(category.id)}
                  >
                    <Card
                      padding="$3"
                      backgroundColor={
                        selectedCategoryId === category.id
                          ? DesignTokens.colors.orange[100]
                          : DesignTokens.colors.beige[100]
                      }
                      borderRadius="md"
                      shadow="sm"
                    >
                      <XStack justifyContent="space-between" alignItems="center">
                        <Text
                          fontSize={DesignTokens.typography.fontSize.md}
                          color={
                            selectedCategoryId === category.id
                              ? DesignTokens.colors.orange[500]
                              : DesignTokens.colors.lightBrown[500]
                          }
                          fontWeight={
                            selectedCategoryId === category.id
                              ? DesignTokens.typography.fontWeight.semibold
                              : DesignTokens.typography.fontWeight.normal
                          }
                        >
                          {category.name}
                        </Text>
                        {selectedCategoryId === category.id && (
                          <XStack
                            width={20}
                            height={20}
                            borderRadius={DesignTokens.radius.full}
                            backgroundColor={DesignTokens.colors.orange[500]}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text
                              fontSize={12}
                              color={DesignTokens.colors.neutral.white}
                              fontWeight={DesignTokens.typography.fontWeight.bold}
                            >
                              ✓
                            </Text>
                          </XStack>
                        )}
                      </XStack>
                    </Card>
                  </TouchableOpacity>
                ))}
              </YStack>
            )}
          </YStack>

          {/* Dietary Information */}
          <YStack space="$2">
            <Text
              fontSize={DesignTokens.typography.fontSize.md}
              fontWeight={DesignTokens.typography.fontWeight.bold}
              color={DesignTokens.colors.brown[900]}
            >
              Dietary Information
            </Text>
            <XStack space="$2" flexWrap="wrap">
              {dietaryOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSelectedDietary(option)}
                >
                  <XStack
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius={DesignTokens.radius.full}
                    backgroundColor={
                      selectedDietary === option
                        ? DesignTokens.colors.orange[500]
                        : DesignTokens.colors.beige[100]
                    }
                  >
                    <Text
                      fontSize={DesignTokens.typography.fontSize.sm}
                      fontWeight={DesignTokens.typography.fontWeight.semibold}
                      color={
                        selectedDietary === option
                          ? DesignTokens.colors.white
                          : DesignTokens.colors.orange[500]
                      }
                    >
                      {option}
                    </Text>
                  </XStack>
                </TouchableOpacity>
              ))}
            </XStack>
          </YStack>

          {/* Spicy Level */}
          <YStack space="$2">
            <XStack alignItems="center" space="$2">
              <Text
                fontSize={DesignTokens.typography.fontSize.md}
                fontWeight={DesignTokens.typography.fontWeight.bold}
                color={DesignTokens.colors.brown[900]}
              >
                Spicy Level
              </Text>
              <Flame
                size={20}
                color={DesignTokens.colors.orange[500]}
              />
            </XStack>
            <YStack space="$2">
              {/* Slider - Simplified as buttons for now */}
              <XStack space="$2" justifyContent="space-between">
                {[0, 1, 2, 3].map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setSpicyLevel(level)}
                  >
                    <XStack
                      flex={1}
                      paddingVertical="$2"
                      alignItems="center"
                      borderRadius={DesignTokens.radius.sm}
                      backgroundColor={
                        spicyLevel === level
                          ? DesignTokens.colors.orange[100]
                          : 'transparent'
                      }
                    >
                      <Text
                        fontSize={DesignTokens.typography.fontSize.xs}
                        color={
                          spicyLevel === level
                            ? DesignTokens.colors.orange[500]
                            : DesignTokens.colors.lightBrown[500]
                        }
                      >
                        {spicyLabels[level]}
                      </Text>
                    </XStack>
                  </TouchableOpacity>
                ))}
              </XStack>
            </YStack>
          </YStack>

          {/* Pricing & Timing */}
          <YStack space="$2">
            <Text
              fontSize={DesignTokens.typography.fontSize.md}
              fontWeight={DesignTokens.typography.fontWeight.bold}
              color={DesignTokens.colors.brown[900]}
            >
              Pricing & Timing
            </Text>
            <XStack space="$3">
              <YStack flex={1} space="$1">
                <Text
                  fontSize={DesignTokens.typography.fontSize.sm}
                  fontWeight={DesignTokens.typography.fontWeight.semibold}
                  color={DesignTokens.colors.brown[900]}
                >
                  Base Price ($)
                </Text>
                <TamaguiInput
                  placeholder="0.00"
                  value={basePrice}
                  onChangeText={setBasePrice}
                  keyboardType="decimal-pad"
                  backgroundColor={DesignTokens.colors.beige[100]}
                  borderRadius={DesignTokens.radius.md}
                  padding="$3"
                  fontSize={DesignTokens.typography.fontSize.md}
                  borderWidth={0}
                />
              </YStack>
              <YStack flex={1} space="$1">
                <Text
                  fontSize={DesignTokens.typography.fontSize.sm}
                  fontWeight={DesignTokens.typography.fontWeight.semibold}
                  color={DesignTokens.colors.brown[900]}
                >
                  Prep Time (min)
                </Text>
                <TamaguiInput
                  placeholder="15"
                  value={prepTime}
                  onChangeText={setPrepTime}
                  keyboardType="number-pad"
                  backgroundColor={DesignTokens.colors.beige[100]}
                  borderRadius={DesignTokens.radius.md}
                  padding="$3"
                  fontSize={DesignTokens.typography.fontSize.md}
                  borderWidth={0}
                />
              </YStack>
            </XStack>
          </YStack>

          {/* Expandable Options */}
          <YStack space="$2">
            <TouchableOpacity>
              <Card
                padding="$3"
                backgroundColor="transparent"
                borderRadius="md"
                shadow="none"
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <Text
                    fontSize={DesignTokens.typography.fontSize.md}
                    color={DesignTokens.colors.orange[500]}
                    fontWeight={DesignTokens.typography.fontWeight.semibold}
                  >
                    + Add Quantity Options
                  </Text>
                  <ChevronRight
                    size={20}
                    color={DesignTokens.colors.orange[500]}
                  />
                </XStack>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity>
              <Card
                padding="$3"
                backgroundColor="transparent"
                borderRadius="md"
                shadow="none"
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <Text
                    fontSize={DesignTokens.typography.fontSize.md}
                    color={DesignTokens.colors.orange[500]}
                    fontWeight={DesignTokens.typography.fontWeight.semibold}
                  >
                    + Add Customizations
                  </Text>
                  <ChevronRight
                    size={20}
                    color={DesignTokens.colors.orange[500]}
                  />
                </XStack>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity>
              <Card
                padding="$3"
                backgroundColor="transparent"
                borderRadius="md"
                shadow="none"
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <Text
                    fontSize={DesignTokens.typography.fontSize.md}
                    color={DesignTokens.colors.orange[500]}
                    fontWeight={DesignTokens.typography.fontWeight.semibold}
                  >
                    + Add Modifiers
                  </Text>
                  <ChevronRight
                    size={20}
                    color={DesignTokens.colors.orange[500]}
                  />
                </XStack>
              </Card>
            </TouchableOpacity>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
