import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DesignTokens } from '@/constants/design';
import { MenuItem } from '@/types';
import { StorageService } from '@/utils/storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QuantityOption {
  id: string;
  displayLabel: string;
  price: number;
  servings?: string;
  isDefault?: boolean;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
}

interface MenuItemCustomizationModalProps {
  visible: boolean;
  item: MenuItem | null;
  rating?: number;
  quantityOptions?: QuantityOption[];
  addOns?: AddOn[];
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, selectedQuantityOption?: QuantityOption, selectedAddOns?: AddOn[]) => void;
}

/**
 * Menu Item Customization Modal
 * Displays item details with quantity selection, add-ons, and add to cart functionality
 */
export function MenuItemCustomizationModal({
  visible,
  item,
  rating = 4.5,
  quantityOptions = [],
  addOns = [],
  onClose,
  onAddToCart,
}: MenuItemCustomizationModalProps) {
  const [selectedQuantityOption, setSelectedQuantityOption] = useState<QuantityOption | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Initialize quantity options if not provided
  useEffect(() => {
    if (item && quantityOptions.length === 0) {
      // Create default quantity options from base price
      const basePrice = parseFloat(item.price);
      const defaultOptions: QuantityOption[] = [
        {
          id: 'full',
          displayLabel: 'Full',
          price: basePrice,
          servings: 'Serves 2-3 people',
          isDefault: true,
        },
        {
          id: 'half',
          displayLabel: 'Half',
          price: Math.round(basePrice * 0.5),
          servings: 'Serves 1 person',
        },
      ];
      setSelectedQuantityOption(defaultOptions[0]);
    } else if (quantityOptions.length > 0) {
      const defaultOption = quantityOptions.find(opt => opt.isDefault) || quantityOptions[0];
      setSelectedQuantityOption(defaultOption);
    }
  }, [item, quantityOptions]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setQuantity(1);
      setSelectedAddOns(new Set());
      if (quantityOptions.length > 0) {
        const defaultOption = quantityOptions.find(opt => opt.isDefault) || quantityOptions[0];
        setSelectedQuantityOption(defaultOption);
      }
    }
  }, [visible, quantityOptions]);

  if (!item) return null;

  const basePrice = selectedQuantityOption
    ? (typeof selectedQuantityOption.price === 'string' ? parseFloat(selectedQuantityOption.price as any) : selectedQuantityOption.price)
    : parseFloat(item.price);

  const addOnsTotal = Array.from(selectedAddOns).reduce((total, addOnId) => {
    const addOn = addOns.find(a => a.id === addOnId);
    return total + (addOn ? addOn.price : 0);
  }, 0);

  const totalPrice = (basePrice + addOnsTotal) * quantity;

  const handleAddToCart = () => {
    const selectedAddOnsList = Array.from(selectedAddOns)
      .map(id => addOns.find(a => a.id === id))
      .filter(Boolean) as AddOn[];

    onAddToCart(item, quantity, selectedQuantityOption || undefined, selectedAddOnsList);
    onClose();
  };

  const toggleAddOn = (addOnId: string) => {
    const newSelected = new Set(selectedAddOns);
    if (newSelected.has(addOnId)) {
      newSelected.delete(addOnId);
    } else {
      newSelected.add(addOnId);
    }
    setSelectedAddOns(newSelected);
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Default quantity options if none provided
  const displayQuantityOptions: QuantityOption[] = quantityOptions.length > 0
    ? quantityOptions
    : [
      {
        id: 'full',
        displayLabel: 'Full',
        price: parseFloat(item.price),
        servings: 'Serves 2-3 people',
        isDefault: true,
      },
      {
        id: 'half',
        displayLabel: 'Half',
        price: Math.round(parseFloat(item.price) * 0.5),
        servings: 'Serves 1 person',
      },
    ];

  // Default add-ons if none provided
  const displayAddOns: AddOn[] = addOns.length > 0
    ? addOns
    : [
      { id: 'garlic-sauce', name: 'Extra Garlic Sauce', price: 30 },
      { id: 'coke-zero', name: 'Coke Zero 330ml', price: 50 },
    ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <YStack flex={1} backgroundColor="rgba(0,0,0,0.5)" justifyContent="flex-end">
        <YStack
          backgroundColor={DesignTokens.colors.background.light}
          borderTopLeftRadius={24}
          borderTopRightRadius={24}
          height="90%"
          overflow="hidden"
        >
          {/* Header */}
          <YStack
            backgroundColor={DesignTokens.colors.neutral.white}
            borderBottomWidth={1}
            borderBottomColor={DesignTokens.colors.beige[300]}
            paddingHorizontal="$4"
            paddingVertical="$3"
          >
            {/* Handle Bar */}
            <YStack alignItems="center" marginBottom="$3">
              <YStack width={40} height={4} borderRadius={2} backgroundColor={DesignTokens.colors.beige[400]} />
            </YStack>

            <XStack alignItems="center" justifyContent="space-between">
              <TouchableOpacity
                onPress={() => setIsFavorite(!isFavorite)}
                activeOpacity={0.7}
                style={styles.iconButton}
              >
                <MaterialIcons
                  name={isFavorite ? 'favorite' : 'favorite-border'}
                  size={24}
                  color={isFavorite ? DesignTokens.colors.semantic.error : DesignTokens.colors.brown[900]}
                />
              </TouchableOpacity>

              <Text
                fontSize={DesignTokens.typography.fontSize.lg}
                fontWeight={DesignTokens.typography.fontWeight.bold}
                color={DesignTokens.colors.brown[900]}
              >
                Customize Item
              </Text>

              <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.iconButton}>
                <MaterialIcons name="close" size={24} color={DesignTokens.colors.brown[900]} />
              </TouchableOpacity>
            </XStack>
          </YStack>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Item Details */}
            <YStack padding="$4" gap="$3">
              <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
                <YStack flex={1}>
                  <Text
                    fontSize={DesignTokens.typography.fontSize['2xl']}
                    fontWeight={DesignTokens.typography.fontWeight.bold}
                    color={DesignTokens.colors.brown[900]}
                    marginBottom="$1"
                  >
                    {item.name}
                  </Text>
                  <XStack alignItems="center" gap="$1">
                    <MaterialIcons
                      name="star"
                      size={18}
                      color={DesignTokens.colors.orange[500]}
                    />
                    <Text
                      fontSize={DesignTokens.typography.fontSize.md}
                      fontWeight={DesignTokens.typography.fontWeight.semibold}
                      color={DesignTokens.colors.orange[500]}
                    >
                      {rating.toFixed(1)}
                    </Text>
                  </XStack>
                </YStack>
              </XStack>

              {item.description && (
                <Text
                  fontSize={DesignTokens.typography.fontSize.sm}
                  color={DesignTokens.colors.lightBrown[500]}
                  lineHeight={20}
                >
                  {item.description}
                </Text>
              )}

              {/* Choose Quantity Section */}
              <YStack gap="$2" marginTop="$4">
                <Text
                  fontSize={DesignTokens.typography.fontSize.lg}
                  fontWeight={DesignTokens.typography.fontWeight.bold}
                  color={DesignTokens.colors.brown[900]}
                >
                  Choose Quantity
                </Text>

                <XStack flexWrap="wrap" gap="$3">
                  {displayQuantityOptions.map((option) => {
                    const isSelected = selectedQuantityOption?.id === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        onPress={() => setSelectedQuantityOption(option)}
                        activeOpacity={0.8}
                        style={[
                          styles.quantityOption,
                          isSelected && styles.quantityOptionSelected,
                        ]}
                      >
                        <XStack
                          position="absolute"
                          top={8}
                          right={8}
                          width={20}
                          height={20}
                          borderRadius={10}
                          backgroundColor={isSelected ? DesignTokens.colors.orange[500] : DesignTokens.colors.beige[300]}
                          alignItems="center"
                          justifyContent="center"
                        >
                          {isSelected && (
                            <MaterialIcons name="check" size={14} color={DesignTokens.colors.neutral.white} />
                          )}
                        </XStack>
                        <YStack gap="$1">
                          <Text
                            fontSize={DesignTokens.typography.fontSize.md}
                            fontWeight={DesignTokens.typography.fontWeight.bold}
                            color={DesignTokens.colors.brown[900]}
                          >
                            {option.displayLabel}
                          </Text>
                          <Text
                            fontSize={DesignTokens.typography.fontSize.lg}
                            fontWeight={DesignTokens.typography.fontWeight.bold}
                            color={DesignTokens.colors.brown[900]}
                          >
                            ₹{typeof option.price === 'string' ? parseFloat(option.price).toFixed(0) : option.price.toFixed(0)}
                          </Text>
                          {option.servings && (
                            <Text
                              fontSize={DesignTokens.typography.fontSize.xs}
                              color={DesignTokens.colors.lightBrown[500]}
                            >
                              {option.servings}
                            </Text>
                          )}
                        </YStack>
                      </TouchableOpacity>
                    );
                  })}
                </XStack>
              </YStack>

              {/* Complete your meal Section */}
              {displayAddOns.length > 0 && (
                <YStack gap="$2" marginTop="$4">
                  <Text
                    fontSize={DesignTokens.typography.fontSize.lg}
                    fontWeight={DesignTokens.typography.fontWeight.bold}
                    color={DesignTokens.colors.brown[900]}
                  >
                    Complete your meal
                  </Text>

                  <YStack gap="$2">
                    {displayAddOns.map((addOn) => {
                      const isSelected = selectedAddOns.has(addOn.id);
                      return (
                        <TouchableOpacity
                          key={addOn.id}
                          onPress={() => toggleAddOn(addOn.id)}
                          activeOpacity={0.8}
                          style={styles.addOnOption}
                        >
                          <YStack flex={1}>
                            <Text
                              fontSize={DesignTokens.typography.fontSize.md}
                              fontWeight={DesignTokens.typography.fontWeight.semibold}
                              color={DesignTokens.colors.brown[900]}
                            >
                              {addOn.name}
                            </Text>
                            <Text
                              fontSize={DesignTokens.typography.fontSize.sm}
                              color={DesignTokens.colors.orange[500]}
                              marginTop="$0.5"
                            >
                              +₹{addOn.price}
                            </Text>
                          </YStack>
                          <XStack
                            width={24}
                            height={24}
                            borderRadius={4}
                            borderWidth={2}
                            borderColor={isSelected ? DesignTokens.colors.orange[500] : DesignTokens.colors.beige[400]}
                            backgroundColor={isSelected ? DesignTokens.colors.orange[500] : 'transparent'}
                            alignItems="center"
                            justifyContent="center"
                          >
                            {isSelected && (
                              <MaterialIcons name="check" size={16} color={DesignTokens.colors.neutral.white} />
                            )}
                          </XStack>
                        </TouchableOpacity>
                      );
                    })}
                  </YStack>
                </YStack>
              )}
            </YStack>
          </ScrollView>

          {/* Bottom Action Bar */}
          <XStack
            padding="$4"
            paddingBottom={Platform.OS === 'ios' ? 30 : 20}
            backgroundColor={DesignTokens.colors.neutral.white}
            borderTopWidth={1}
            borderTopColor={DesignTokens.colors.beige[300]}
            alignItems="center"
            justifyContent="space-between"
            gap="$3"
          >
            {/* Quantity Selector */}
            <XStack
              alignItems="center"
              gap="$2"
              backgroundColor={DesignTokens.colors.beige[200]}
              borderRadius={DesignTokens.radius.lg}
              paddingHorizontal="$2"
              paddingVertical="$1.5"
            >
              <TouchableOpacity
                onPress={decreaseQuantity}
                activeOpacity={0.7}
                style={styles.quantityButton}
              >
                <Text
                  fontSize={DesignTokens.typography.fontSize.lg}
                  fontWeight={DesignTokens.typography.fontWeight.bold}
                  color={DesignTokens.colors.brown[900]}
                >
                  -
                </Text>
              </TouchableOpacity>
              <Text
                fontSize={DesignTokens.typography.fontSize.lg}
                fontWeight={DesignTokens.typography.fontWeight.bold}
                color={DesignTokens.colors.brown[900]}
                minWidth={30}
                textAlign="center"
              >
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={increaseQuantity}
                activeOpacity={0.7}
                style={[styles.quantityButton, styles.quantityButtonPlus]}
              >
                <Text
                  fontSize={DesignTokens.typography.fontSize.lg}
                  fontWeight={DesignTokens.typography.fontWeight.bold}
                  color={DesignTokens.colors.neutral.white}
                >
                  +
                </Text>
              </TouchableOpacity>
            </XStack>

            {/* Add Item Button */}
            <TouchableOpacity
              onPress={handleAddToCart}
              activeOpacity={0.8}
              style={styles.addItemButton}
            >
              <Text
                fontSize={DesignTokens.typography.fontSize.md}
                fontWeight={DesignTokens.typography.fontWeight.bold}
                color={DesignTokens.colors.neutral.white}
              >
                Add Item • ₹{totalPrice.toFixed(0)}
              </Text>
            </TouchableOpacity>
          </XStack>
        </YStack>
      </YStack>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  quantityOption: {
    width: '48%', // Force 2 columns with slight gap tolerance
    aspectRatio: 1.4, // Consistent height/width ratio
    backgroundColor: DesignTokens.colors.neutral.white,
    borderRadius: DesignTokens.radius.md,
    padding: DesignTokens.spacing.md,
    borderWidth: 2,
    borderColor: DesignTokens.colors.beige[300],
    position: 'relative',
    marginBottom: DesignTokens.spacing.sm, // Add bottom spacing for wrapping
  },
  quantityOptionSelected: {
    borderColor: DesignTokens.colors.orange[500],
    backgroundColor: DesignTokens.colors.orange[50],
    shadowColor: DesignTokens.colors.orange[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addOnOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DesignTokens.colors.neutral.white,
    borderRadius: DesignTokens.radius.md,
    padding: DesignTokens.spacing.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.beige[300],
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonPlus: {
    backgroundColor: DesignTokens.colors.orange[500],
    borderRadius: DesignTokens.radius.md,
  },
  addItemButton: {
    flex: 1,
    backgroundColor: DesignTokens.colors.orange[500],
    borderRadius: DesignTokens.radius.lg,
    paddingVertical: DesignTokens.spacing.md,
    paddingHorizontal: DesignTokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    padding: 4,
  },
});
