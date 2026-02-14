import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { FoodImage } from '@/components/ui/FoodImage';
import { DesignTokens } from '@/constants/design';

interface MenuItemCardProps {
    item: any;
    price: number;
    quantity: number;
    dietaryLabel: string | null;
    dietaryColor: string;
    isChefSpecial: boolean;
    onAddToCart: (item: any) => void;
    onUpdateQuantity: (item: any, quantity: number) => void;
}

/**
 * MenuItemCard Component
 * Minimalist card design that blends with background
 */
const MenuItemCard = React.memo(function MenuItemCard({
    item,
    price,
    quantity,
    dietaryLabel,
    dietaryColor,
    isChefSpecial,
    onAddToCart,
    onUpdateQuantity,
}: MenuItemCardProps) {
    const isDisabled = !item.isAvailable;

    return (
        <View style={[styles.card, isDisabled && styles.cardDisabled]}>
            <View style={styles.imageContainer}>
                <FoodImage
                    imageUrl={item.imageUrl}
                    width="100%"
                    height="100%"
                    borderRadius={12}
                    resizeMode="cover"
                    style={styles.foodImage}
                />
                {isChefSpecial && (
                    <View style={[styles.smallBadge, styles.chefBadge]}>
                        <Text style={styles.chefBadgeText}>Chef's Special</Text>
                    </View>
                )}
                {isDisabled && (
                    <View style={styles.disabledOverlay}>
                        <View style={styles.unavailableBadge}>
                            <Text style={styles.unavailableText}>Unavailable</Text>
                        </View>
                    </View>
                )}
            </View>

            <YStack flex={1} paddingLeft={12} justifyContent="space-between">
                <YStack gap={8}>
                    <Text
                        fontSize={17}
                        fontWeight="700"
                        color={isDisabled ? DesignTokens.colors.charcoal[400] : DesignTokens.colors.brown[900]}
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                    <Text
                        fontSize={14}
                        color={isDisabled ? DesignTokens.colors.charcoal[300] : DesignTokens.colors.charcoal[500]}
                        numberOfLines={2}
                        lineHeight={20}
                    >
                        {item.description}
                    </Text>
                    {dietaryLabel && (
                        <View style={[styles.dietaryBadge, { backgroundColor: dietaryColor }]}>
                            <Text style={styles.dietaryBadgeText}>{dietaryLabel}</Text>
                        </View>
                    )}
                </YStack>

                <XStack alignItems="center" justifyContent="space-between" marginTop={12}>
                    <Text
                        fontSize={18}
                        fontWeight="700"
                        color={isDisabled ? DesignTokens.colors.charcoal[400] : DesignTokens.colors.orange[500]}
                    >
                        ₹{price.toFixed(0)}
                    </Text>
                    {quantity === 0 ? (
                        <TouchableOpacity
                            style={[styles.addButton, isDisabled && styles.addButtonDisabled]}
                            onPress={() => onAddToCart(item)}
                            disabled={isDisabled}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.addButtonText}>
                                {isDisabled ? 'Unavailable' : 'Add'}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.quantitySelector}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => onUpdateQuantity(item, quantity - 1)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.quantityButtonText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => onUpdateQuantity(item, quantity + 1)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </XStack>
            </YStack>
        </View>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.name === nextProps.item.name &&
        prevProps.item.isAvailable === nextProps.item.isAvailable &&
        prevProps.price === nextProps.price &&
        prevProps.quantity === nextProps.quantity &&
        prevProps.dietaryLabel === nextProps.dietaryLabel &&
        prevProps.isChefSpecial === nextProps.isChefSpecial
    );
});

export { MenuItemCard };

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: DesignTokens.colors.neutral.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: DesignTokens.colors.beige[200],
    },
    cardDisabled: {
        opacity: 0.6,
    },
    imageContainer: {
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: DesignTokens.colors.beige[100],
    },
    foodImage: {
        width: '100%',
        height: '100%',
    },
    smallBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    chefBadge: {
        backgroundColor: DesignTokens.colors.charcoal[800],
    },
    chefBadgeText: {
        color: DesignTokens.colors.orange[500],
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    disabledOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unavailableBadge: {
        backgroundColor: DesignTokens.colors.semantic.error,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    unavailableText: {
        color: DesignTokens.colors.neutral.white,
        fontSize: 12,
        fontWeight: '700',
    },
    dietaryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginTop: 4,
    },
    dietaryBadgeText: {
        color: DesignTokens.colors.neutral.white,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    addButton: {
        backgroundColor: DesignTokens.colors.orange[500],
        paddingHorizontal: 24,
        minHeight: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonDisabled: {
        backgroundColor: DesignTokens.colors.charcoal[300],
    },
    addButtonText: {
        color: DesignTokens.colors.neutral.white,
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: DesignTokens.colors.orange[500],
        borderRadius: 24,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minHeight: 48,
        backgroundColor: DesignTokens.colors.neutral.white,
    },
    quantityButton: {
        minWidth: 40,
        minHeight: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 22,
        fontWeight: '700',
        color: DesignTokens.colors.orange[500],
        lineHeight: 24,
    },
    quantityText: {
        fontSize: 17,
        fontWeight: '700',
        color: DesignTokens.colors.brown[900],
        paddingHorizontal: 16,
        minWidth: 40,
        textAlign: 'center',
    },
});
