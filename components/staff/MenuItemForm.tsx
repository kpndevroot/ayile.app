import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Image, View } from 'react-native';
import { Text, YStack, XStack, Select, Adapt, Sheet } from 'tamagui';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, Flame, Plus, ChevronDown, Check } from '@tamagui/lucide-icons';
import { DesignTokens } from '@/constants/design';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { QuantityOptionCard } from '@/components/staff/QuantityOptionCard';
import { StaffService } from '@/services/staffService';
import { useNotification } from '@/contexts/NotificationContext';
import {
  menuItemFormSchema,
  type MenuItemFormData,
  type DietaryType,
} from '@/lib/validations/menuItemSchema';

interface MenuItemFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<MenuItemFormData>;
  menuItemId?: string;
  selectedImage?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const DIETARY_OPTIONS: DietaryType[] = ['VEG', 'NON_VEG', 'VEGAN', 'GLUTEN_FREE'];
const SPICY_LABELS = ['Not Spicy', 'Mild', 'Medium', 'Hot', 'Very Hot', 'Extreme'];

const DEFAULT_VALUES: MenuItemFormData = {
  name: '',
  description: '',
  categoryId: '',
  dietaryType: 'NON_VEG',
  isSpicy: false,
  spicyLevel: 0,
  basePrice: 0,
  prepTimeMinutes: 15,
  quantityOptions: [
    {
      quantityTypeId: '',
      value: 1,
      displayLabel: 'Full',
      price: 0,
      isDefault: true,
    },
  ],
};

export function MenuItemForm({
  mode,
  initialValues,
  menuItemId,
  onSuccess,
  onCancel,
}: MenuItemFormProps) {
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState<any[]>([]);
  const [quantityTypes, setQuantityTypes] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: { ...DEFAULT_VALUES, ...initialValues },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'quantityOptions',
  });

  const isSpicy = watch('isSpicy');
  const spicyLevel = watch('spicyLevel');
  const selectedCategoryId = watch('categoryId');

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      const [cats, qTypes] = await Promise.all([
        StaffService.getCategories(),
        StaffService.getQuantityTypes(),
      ]);
      console.log('DEBUG: categories from hook', cats);

      setCategories(cats);
      setQuantityTypes(qTypes);

      // Set default quantity type if not already set
      if (
        qTypes.length > 0 &&
        fields.length > 0 &&
        !fields[0].quantityTypeId
      ) {
        const fullType = qTypes.find((qt: any) => qt.code === 'FULL') || qTypes[0];
        setValue('quantityOptions.0.quantityTypeId', fullType.id);
      }

      // Set default category if creating and none selected
      if (mode === 'create' && cats.length > 0 && !initialValues?.categoryId) {
        setValue('categoryId', cats[0].id);
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Failed to load form data',
        message: 'Please try again later.',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showNotification({
        type: 'warning',
        title: 'Permission Required',
        message: 'Please allow access to your photo library to upload images.',
      });
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

  const handleSetDefault = (index: number) => {
    fields.forEach((_, i) => {
      setValue(`quantityOptions.${i}.isDefault`, i === index);
    });
  };

  const handleAddQuantityOption = () => {
    const defaultType = quantityTypes.find((qt: any) => qt.code === 'FULL') || quantityTypes[0];
    append({
      quantityTypeId: defaultType?.id || '',
      value: 1,
      displayLabel: '',
      price: 0,
      isDefault: false,
    });
  };

  const onSubmit = async (data: MenuItemFormData) => {
    try {
      setSubmitting(true);

      let item: any;
      if (mode === 'create') {
        item = await StaffService.createMenuItem({
          categoryId: data.categoryId,
          name: data.name,
          description: data.description || undefined,
          dietaryTypes: [data.dietaryType],
          spicyLevel: data.isSpicy ? data.spicyLevel : 0,
          isSpicy: data.isSpicy,
          prepTimeMinutes: data.prepTimeMinutes.toString(),
          basePrice: data.basePrice.toString(),
          quantityOptions: data.quantityOptions,
        });
      } else if (menuItemId) {
        item = await StaffService.updateMenuItem(menuItemId, {
          categoryId: data.categoryId,
          name: data.name,
          description: data.description || undefined,
          dietaryTypes: [data.dietaryType],
          spicyLevel: data.isSpicy ? data.spicyLevel : 0,
          isSpicy: data.isSpicy,
          prepTimeMinutes: data.prepTimeMinutes.toString(),
          basePrice: data.basePrice.toString(),
          quantityOptions: data.quantityOptions,
        });
      }

      // Upload image if selected
      const itemId = item?.id || menuItemId;
      if (selectedImage && itemId) {
        try {
          await StaffService.uploadMenuItemImage(itemId, selectedImage);
        } catch {
          showNotification({
            type: 'warning',
            title: mode === 'create' ? 'Item created' : 'Item updated',
            message: 'Image failed to upload. You can try uploading it later.',
          });
          onSuccess();
          return;
        }
      }

      showNotification({
        type: 'success',
        title: mode === 'create' ? 'Menu item created' : 'Menu item updated',
      });
      onSuccess();
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.message || `Failed to ${mode} menu item`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$4">
          <Skeleton width="100%" height={200} />
          <Skeleton width="60%" height={20} />
          <Skeleton width="100%" height={48} />
          <Skeleton width="100%" height={48} />
          <Skeleton width="100%" height={100} />
          <Skeleton width="100%" height={48} />
        </YStack>
      </ScrollView>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <YStack padding="$4" gap="$4">
        {/* Photo Section */}
        <YStack gap="$2">
          <Text
            fontSize={DesignTokens.typography.fontSize.md}
            fontWeight={DesignTokens.typography.fontWeight.bold}
            color={DesignTokens.colors.brown[900]}
          >
            Photo
          </Text>
          <TouchableOpacity
            onPress={handlePickImage}
            disabled={submitting}
            activeOpacity={0.7}
          >
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
              <YStack
                backgroundColor={DesignTokens.colors.beige[50]}
                borderRadius={DesignTokens.radius.md}
                borderWidth={2}
                borderStyle="dashed"
                borderColor={DesignTokens.colors.orange[300]}
                alignItems="center"
                justifyContent="center"
                minHeight={200}
                paddingHorizontal="$4"
                paddingVertical="$6"
              >
                <YStack alignItems="center" gap="$2">
                  <ImagePlus size={48} color={DesignTokens.colors.orange[500]} />
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
              </YStack>
            )}
          </TouchableOpacity>
        </YStack>

        {/* Basic Information */}
        <YStack gap="$3">
          <Text
            fontSize={DesignTokens.typography.fontSize.md}
            fontWeight={DesignTokens.typography.fontWeight.bold}
            color={DesignTokens.colors.brown[900]}
          >
            Basic Information
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Item Name"
                placeholder="e.g., Classic Margherita Pizza"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                editable={!submitting}
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Description"
                placeholder="e.g., Fresh mozzarella, basil, and tomato sauce."
                value={value ?? ''}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
                style={{ textAlignVertical: 'top', minHeight: 80 }}
                editable={!submitting}
              />
            )}
          />
        </YStack>

        {/* Category */}
        <YStack gap="$2">
          <Text
            fontSize={DesignTokens.typography.fontSize.md}
            fontWeight={DesignTokens.typography.fontWeight.bold}
            color={DesignTokens.colors.brown[900]}
          >
            Category
          </Text>
          <Controller
            control={control}
            name="categoryId"
            render={({ field: { onChange, value } }) => (
              <Select
                value={value}
                onValueChange={onChange}
              >
                <Select.Trigger
                  backgroundColor={DesignTokens.colors.neutral.white}
                  borderWidth={1}
                  borderColor={DesignTokens.colors.beige[300]}
                  borderRadius={DesignTokens.radius.md}
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  hoverStyle={{
                    borderColor: DesignTokens.colors.orange[300],
                    backgroundColor: DesignTokens.colors.neutral.white,
                  }}
                  focusStyle={{
                    borderColor: DesignTokens.colors.orange[500],
                    backgroundColor: DesignTokens.colors.neutral.white,
                    outlineWidth: 0,
                  }}
                  pressStyle={{
                    backgroundColor: DesignTokens.colors.beige[50],
                    borderColor: DesignTokens.colors.orange[500],
                  }}
                  iconAfter={<ChevronDown size={20} color={DesignTokens.colors.lightBrown[500]} />}
                >
                  <Select.Value placeholder="Select a category">
                    {categories.find((c) => c.id === value)?.name || 'Select a category'}
                  </Select.Value>
                </Select.Trigger>

                <Adapt platform="touch">
                  <Sheet
                    modal
                    dismissOnSnapToBottom
                  >
                    <Sheet.Frame
                      backgroundColor={DesignTokens.colors.neutral.white}
                      borderTopLeftRadius={DesignTokens.radius.xl}
                      borderTopRightRadius={DesignTokens.radius.xl}
                      padding="$4"
                    >
                      <Sheet.ScrollView>
                        <Adapt.Contents />
                      </Sheet.ScrollView>
                    </Sheet.Frame>
                    <Sheet.Overlay
                      backgroundColor="rgba(0, 0, 0, 0.5)"
                      enterStyle={{ opacity: 0 }}
                      exitStyle={{ opacity: 0 }}
                    />
                  </Sheet>
                </Adapt>

                <Select.Content zIndex={200000}>
                  <Select.ScrollUpButton
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    width="100%"
                    height="$3"
                  >
                    <ChevronDown size={20} />
                  </Select.ScrollUpButton>

                  <Select.Viewport minWidth={200}>
                    <Select.Group>
                      {categories.map((category, i) => (
                        <Select.Item
                          key={category.id}
                          index={i}
                          value={category.id}
                          backgroundColor={DesignTokens.colors.neutral.white}
                          paddingHorizontal="$4"
                          paddingVertical="$3"
                          hoverStyle={{
                            backgroundColor: DesignTokens.colors.orange[50],
                          }}
                          pressStyle={{
                            backgroundColor: DesignTokens.colors.orange[100],
                          }}
                          focusStyle={{
                            backgroundColor: DesignTokens.colors.orange[50],
                            outlineWidth: 0,
                          }}
                        >
                          <Select.ItemText
                            fontSize={DesignTokens.typography.fontSize.md}
                            color={DesignTokens.colors.brown[900]}
                          >
                            {category.name}
                          </Select.ItemText>
                          <Select.ItemIndicator marginLeft="auto">
                            <Check size={16} color={DesignTokens.colors.orange[500]} />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Viewport>

                  <Select.ScrollDownButton
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    width="100%"
                    height="$3"
                  >
                    <ChevronDown size={20} />
                  </Select.ScrollDownButton>
                </Select.Content>
              </Select>
            )}
          />
          {errors.categoryId && (
            <Text
              fontSize={DesignTokens.typography.fontSize.xs}
              color={DesignTokens.colors.semantic.error}
            >
              {errors.categoryId.message}
            </Text>
          )}
        </YStack>

        {/* Dietary Information */}
        <YStack gap="$2">
          <Text
            fontSize={DesignTokens.typography.fontSize.md}
            fontWeight={DesignTokens.typography.fontWeight.bold}
            color={DesignTokens.colors.brown[900]}
          >
            Dietary Information
          </Text>
          <Controller
            control={control}
            name="dietaryType"
            render={({ field: { onChange, value } }) => (
              <XStack gap="$2" flexWrap="wrap">
                {DIETARY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => onChange(option)}
                    disabled={submitting}
                    activeOpacity={0.7}
                  >
                    <XStack
                      paddingHorizontal="$3"
                      paddingVertical="$2"
                      borderRadius={DesignTokens.radius.full}
                      borderWidth={1}
                      borderColor={
                        value === option
                          ? DesignTokens.colors.orange[500]
                          : DesignTokens.colors.beige[300]
                      }
                      backgroundColor={
                        value === option
                          ? DesignTokens.colors.orange[500]
                          : DesignTokens.colors.neutral.white
                      }
                    >
                      <Text
                        fontSize={DesignTokens.typography.fontSize.sm}
                        fontWeight={DesignTokens.typography.fontWeight.semibold}
                        color={
                          value === option
                            ? DesignTokens.colors.neutral.white
                            : DesignTokens.colors.orange[500]
                        }
                      >
                        {option}
                      </Text>
                    </XStack>
                  </TouchableOpacity>
                ))}
              </XStack>
            )}
          />
        </YStack>

        {/* Spicy Level */}
        <YStack gap="$2">
          <XStack alignItems="center" gap="$2">
            <Text
              fontSize={DesignTokens.typography.fontSize.md}
              fontWeight={DesignTokens.typography.fontWeight.bold}
              color={DesignTokens.colors.brown[900]}
            >
              Spicy Level
            </Text>
            <Flame size={20} color={DesignTokens.colors.orange[500]} />
          </XStack>

          {/* Spicy toggle */}
          <TouchableOpacity
            onPress={() => {
              const newIsSpicy = !isSpicy;
              setValue('isSpicy', newIsSpicy);
              if (!newIsSpicy) {
                setValue('spicyLevel', 0);
              } else if (spicyLevel === 0) {
                setValue('spicyLevel', 1);
              }
            }}
            disabled={submitting}
          >
            <XStack alignItems="center" gap="$2">
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: isSpicy
                    ? DesignTokens.colors.orange[500]
                    : DesignTokens.colors.lightBrown[400],
                  backgroundColor: isSpicy
                    ? DesignTokens.colors.orange[500]
                    : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSpicy && (
                  <Text
                    fontSize={12}
                    color={DesignTokens.colors.neutral.white}
                    fontWeight={DesignTokens.typography.fontWeight.bold}
                  >
                    ✓
                  </Text>
                )}
              </View>
              <Text
                fontSize={DesignTokens.typography.fontSize.sm}
                color={DesignTokens.colors.brown[900]}
              >
                This item is spicy
              </Text>
            </XStack>
          </TouchableOpacity>

          {isSpicy && (
            <XStack gap="$2" justifyContent="space-between">
              {[1, 2, 3, 4, 5].map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setValue('spicyLevel', level)}
                  disabled={submitting}
                  activeOpacity={0.7}
                  style={{ flex: 1 }}
                >
                  <XStack
                    paddingVertical="$2"
                    paddingHorizontal="$2"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius={DesignTokens.radius.sm}
                    borderWidth={1}
                    borderColor={
                      spicyLevel === level
                        ? DesignTokens.colors.orange[500]
                        : DesignTokens.colors.beige[300]
                    }
                    backgroundColor={
                      spicyLevel === level
                        ? DesignTokens.colors.orange[500]
                        : DesignTokens.colors.neutral.white
                    }
                  >
                    <Text
                      fontSize={DesignTokens.typography.fontSize.xs}
                      fontWeight={
                        spicyLevel === level
                          ? DesignTokens.typography.fontWeight.semibold
                          : DesignTokens.typography.fontWeight.medium
                      }
                      color={
                        spicyLevel === level
                          ? DesignTokens.colors.neutral.white
                          : DesignTokens.colors.lightBrown[500]
                      }
                    >
                      {SPICY_LABELS[level]}
                    </Text>
                  </XStack>
                </TouchableOpacity>
              ))}
            </XStack>
          )}
          {errors.spicyLevel && (
            <Text
              fontSize={DesignTokens.typography.fontSize.xs}
              color={DesignTokens.colors.semantic.error}
            >
              {errors.spicyLevel.message}
            </Text>
          )}
        </YStack>

        {/* Pricing & Timing */}
        <YStack gap="$2">
          <Text
            fontSize={DesignTokens.typography.fontSize.md}
            fontWeight={DesignTokens.typography.fontWeight.bold}
            color={DesignTokens.colors.brown[900]}
          >
            Pricing & Timing
          </Text>
          <XStack gap="$3">
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="basePrice"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Base Price ($)"
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={value ? value.toString() : ''}
                    onChangeText={(t) => {
                      const n = parseFloat(t);
                      onChange(isNaN(n) ? 0 : n);
                    }}
                    error={errors.basePrice?.message}
                    editable={!submitting}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="prepTimeMinutes"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Prep Time (min)"
                    placeholder="15"
                    keyboardType="number-pad"
                    value={value ? value.toString() : ''}
                    onChangeText={(t) => {
                      const n = parseInt(t, 10);
                      onChange(isNaN(n) ? 0 : n);
                    }}
                    error={errors.prepTimeMinutes?.message}
                    editable={!submitting}
                  />
                )}
              />
            </View>
          </XStack>
        </YStack>

        {/* Quantity Options */}
        <YStack gap="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <Text
              fontSize={DesignTokens.typography.fontSize.md}
              fontWeight={DesignTokens.typography.fontWeight.bold}
              color={DesignTokens.colors.brown[900]}
            >
              Quantity Options
            </Text>
            <TouchableOpacity
              onPress={handleAddQuantityOption}
              disabled={submitting}
              activeOpacity={0.7}
            >
              <XStack
                alignItems="center"
                gap="$1"
                paddingHorizontal="$3"
                paddingVertical="$1.5"
                borderRadius={DesignTokens.radius.full}
                backgroundColor={DesignTokens.colors.orange[500]}
              >
                <Plus size={16} color={DesignTokens.colors.neutral.white} />
                <Text
                  fontSize={DesignTokens.typography.fontSize.sm}
                  fontWeight={DesignTokens.typography.fontWeight.semibold}
                  color={DesignTokens.colors.neutral.white}
                >
                  Add
                </Text>
              </XStack>
            </TouchableOpacity>
          </XStack>

          {fields.map((field, index) => (
            <QuantityOptionCard
              key={field.id}
              control={control}
              index={index}
              quantityTypes={quantityTypes}
              onRemove={() => remove(index)}
              onSetDefault={() => handleSetDefault(index)}
              isOnly={fields.length === 1}
              errors={errors}
            />
          ))}

          {/* Top-level quantity options error (e.g. "exactly 1 default") */}
          {errors.quantityOptions?.root && (
            <Text
              fontSize={DesignTokens.typography.fontSize.xs}
              color={DesignTokens.colors.semantic.error}
            >
              {errors.quantityOptions.root.message}
            </Text>
          )}
          {typeof errors.quantityOptions?.message === 'string' && (
            <Text
              fontSize={DesignTokens.typography.fontSize.xs}
              color={DesignTokens.colors.semantic.error}
            >
              {errors.quantityOptions.message}
            </Text>
          )}
        </YStack>

        {/* Submit */}
        <YStack gap="$3" paddingBottom="$4">
          <Button
            onPress={handleSubmit(onSubmit)}
            loading={submitting}
            disabled={submitting}
            backgroundColor={DesignTokens.colors.orange[500]}
            fullWidth
          >
            {mode === 'create' ? 'Create Menu Item' : 'Update Menu Item'}
          </Button>
          <Button
            variant="outline"
            onPress={onCancel}
            disabled={submitting}
            borderColor={DesignTokens.colors.orange[500]}
            textColor={DesignTokens.colors.orange[500]}
            fullWidth
          >
            Cancel
          </Button>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
