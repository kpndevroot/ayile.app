import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  View,
  Platform,
} from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DesignTokens } from '@/constants/design';
import { MenuItem } from '@/types';
import { FoodImage } from '@/components/ui/FoodImage';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.3;

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
 *
 * Full-screen bottom sheet with hero food image, item details,
 * quantity/portion selection, and add to cart action bar.
 *
 * Design rules:
 * - Serial Position: key info (name, price) at top, CTA at bottom
 * - Fitts's Law: large tap targets (48px+), full-width CTA
 * - Von Restorff: selected option highlighted with orange
 * - Progressive disclosure: add-ons section expandable
 * - Aesthetic-Usability: hero image creates premium feel
 * - Consistent 8pt grid spacing from DesignTokens
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

  useEffect(() => {
    if (item && quantityOptions.length === 0) {
      const basePrice = parseFloat(item.price);
      const defaultOptions: QuantityOption[] = [
        {
          id: 'full',
          displayLabel: 'Full',
          price: basePrice,
          servings: 'Serves 2-3',
          isDefault: true,
        },
        {
          id: 'half',
          displayLabel: 'Half',
          price: Math.round(basePrice * 0.5),
          servings: 'Serves 1',
        },
      ];
      setSelectedQuantityOption(defaultOptions[0]);
    } else if (quantityOptions.length > 0) {
      const defaultOption = quantityOptions.find(opt => opt.isDefault) || quantityOptions[0];
      setSelectedQuantityOption(defaultOption);
    }
  }, [item, quantityOptions]);

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
    ? (Number(selectedQuantityOption.price) || 0)
    : (Number(item.price) || 0);

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

  const displayQuantityOptions: QuantityOption[] = quantityOptions.length > 0
    ? quantityOptions
    : [
      {
        id: 'full',
        displayLabel: 'Full',
        price: parseFloat(item.price),
        servings: 'Serves 2-3',
        isDefault: true,
      },
      {
        id: 'half',
        displayLabel: 'Half',
        price: Math.round(parseFloat(item.price) * 0.5),
        servings: 'Serves 1',
      },
    ];

  const displayAddOns: AddOn[] = addOns.length > 0
    ? addOns
    : [
      { id: 'garlic-sauce', name: 'Extra Garlic Sauce', price: 30 },
      { id: 'coke-zero', name: 'Coke Zero 330ml', price: 50 },
    ];

  // Info badges
  const infoBadges: { icon: string; label: string; color: string }[] = [];
  if (item.preparationTime) {
    infoBadges.push({
      icon: 'schedule',
      label: `${item.preparationTime} min`,
      color: DesignTokens.colors.lightBrown[400],
    });
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Drag Handle */}
          <View style={styles.handleBar}>
            <View style={styles.handle} />
          </View>

          {/* Hero Image Section */}
          <View style={styles.imageContainer}>
            <FoodImage
              imageUrl={item.imageUrl}
              width="100%"
              height={IMAGE_HEIGHT}
              resizeMode="cover"
            />
            {/* Gradient overlay for readability */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)']}
              style={styles.imageGradient}
            />

            {/* Floating action buttons on image */}
            <View style={styles.imageActions}>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={styles.floatingButton}
              >
                <MaterialIcons name="close" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>

          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* Item Details */}
            <View style={styles.detailsSection}>
              {/* Name + Rating Row */}
              <View style={styles.nameRow}>
                <View style={{ flex: 1 }}>
                  <Text
                    fontSize={24}
                    fontWeight="800"
                    color={DesignTokens.colors.brown[900]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                </View>
                <View style={styles.ratingBadge}>
                  <MaterialIcons name="star" size={16} color="#FFF" />
                  <Text fontSize={14} fontWeight="700" color="#FFF">
                    {rating.toFixed(1)}
                  </Text>
                </View>
              </View>

              {/* Info Badges */}
              {infoBadges.length > 0 && (
                <View style={styles.badgeRow}>
                  {infoBadges.map((badge, idx) => (
                    <View
                      key={idx}
                      style={[styles.dietBadge, { backgroundColor: badge.color + '15' }]}
                    >
                      <MaterialIcons name={badge.icon as any} size={14} color={badge.color} />
                      <Text fontSize={12} fontWeight="600" color={badge.color}>
                        {badge.label}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Description */}
              {item.description && (
                <Text
                  fontSize={14}
                  color={DesignTokens.colors.lightBrown[500]}
                  lineHeight={21}
                  marginTop={12}
                >
                  {item.description}
                </Text>
              )}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Choose Portion */}
            <View style={styles.section}>
              <Text
                fontSize={18}
                fontWeight="700"
                color={DesignTokens.colors.brown[900]}
                marginBottom={14}
              >
                Choose Portion
              </Text>

              <View style={styles.optionsGrid}>
                {displayQuantityOptions.map((option) => {
                  const isSelected = selectedQuantityOption?.id === option.id;
                  const optionPrice = Number(option.price) || 0;

                  return (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => setSelectedQuantityOption(option)}
                      activeOpacity={0.8}
                      style={[
                        styles.portionCard,
                        isSelected && styles.portionCardSelected,
                      ]}
                    >
                      {/* Radio indicator */}
                      <View
                        style={[
                          styles.radioOuter,
                          isSelected && styles.radioOuterSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInner} />}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          fontSize={16}
                          fontWeight="700"
                          color={DesignTokens.colors.brown[900]}
                        >
                          {option.displayLabel}
                        </Text>
                        {option.servings && (
                          <Text
                            fontSize={12}
                            color={DesignTokens.colors.lightBrown[400]}
                            marginTop={2}
                          >
                            {option.servings}
                          </Text>
                        )}
                      </View>

                      <Text
                        fontSize={18}
                        fontWeight="800"
                        color={isSelected ? DesignTokens.colors.orange[600] : DesignTokens.colors.brown[900]}
                      >
                        ₹{optionPrice.toFixed(0)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Bar */}
          <View style={styles.actionBar}>
            {/* Quantity Selector */}
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                onPress={() => quantity > 1 && setQuantity(q => q - 1)}
                activeOpacity={0.7}
                style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                disabled={quantity <= 1}
              >
                <MaterialIcons
                  name="remove"
                  size={20}
                  color={quantity <= 1 ? DesignTokens.colors.beige[400] : DesignTokens.colors.brown[900]}
                />
              </TouchableOpacity>
              <Text
                fontSize={18}
                fontWeight="800"
                color={DesignTokens.colors.brown[900]}
                style={{ minWidth: 28, textAlign: 'center' }}
              >
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={() => setQuantity(q => q + 1)}
                activeOpacity={0.7}
                style={styles.qtyBtnPlus}
              >
                <MaterialIcons name="add" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              onPress={handleAddToCart}
              activeOpacity={0.8}
              style={styles.addToCartBtn}
            >
              <MaterialIcons name="shopping-bag" size={20} color="#FFF" />
              <Text fontSize={16} fontWeight="700" color="#FFF" marginLeft={8}>
                Add to Cart
              </Text>
              <View style={styles.pricePill}>
                <Text fontSize={14} fontWeight="800" color={DesignTokens.colors.orange[600]}>
                  ₹{totalPrice.toFixed(0)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: DesignTokens.colors.background.light,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
    overflow: 'hidden',
  },
  handleBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },

  // Hero Image
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: IMAGE_HEIGHT * 0.5,
  },
  imageActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 16 : 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10)',
  },
  priceTag: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    backgroundColor: DesignTokens.colors.orange[500],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: DesignTokens.colors.orange[700],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  // Details
  detailsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: DesignTokens.colors.orange[500],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  dietBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  divider: {
    height: 1,
    backgroundColor: DesignTokens.colors.beige[200],
    marginHorizontal: 20,
    marginVertical: 16,
  },

  // Portion options
  section: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  optionsGrid: {
    gap: 10,
  },
  portionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.neutral.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: DesignTokens.colors.beige[200],
    gap: 14,
  },
  portionCardSelected: {
    borderColor: DesignTokens.colors.orange[500],
    backgroundColor: DesignTokens.colors.orange[50],
    shadowColor: DesignTokens.colors.orange[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: DesignTokens.colors.beige[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: DesignTokens.colors.orange[500],
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DesignTokens.colors.orange[500],
  },

  scrollContent: {
    paddingBottom: 20,
  },

  // Action bar
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: DesignTokens.colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.beige[200],
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.beige[100],
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 2,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignTokens.colors.neutral.white,
  },
  qtyBtnDisabled: {
    opacity: 0.5,
  },
  qtyBtnPlus: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignTokens.colors.orange[500],
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignTokens.colors.orange[500],
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: DesignTokens.colors.orange[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  pricePill: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 10,
  },
});
