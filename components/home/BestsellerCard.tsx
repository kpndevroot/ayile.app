import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { FoodImage } from '@/components/ui/FoodImage';
import { DesignTokens } from '@/constants/design';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BestsellerCardProps {
    item: any;
    price: number;
    isPopular: boolean;
    isChefSpecial: boolean;
    onAddToCart: (item: any) => void;
}

/**
 * BestsellerCard Component
 * Horizontal card for featured/bestseller items
 * Minimalist design with subtle borders
 */
export function BestsellerCard({
    item,
    price,
    isPopular,
    isChefSpecial,
    onAddToCart,
}: BestsellerCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                <FoodImage
                    imageUrl={item.imageUrl}
                    width={SCREEN_WIDTH * 0.7}
                    height={180}
                    borderRadius={16}
                    resizeMode="cover"
                />
                {isPopular && (
                    <View style={[styles.badge, styles.popularBadge]}>
                        <Text style={styles.badgeText}>Popular</Text>
                    </View>
                )}
                {isChefSpecial && !isPopular && (
                    <View style={[styles.badge, styles.chefBadge]}>
                        <Text style={styles.chefBadgeText}>Chef's Special</Text>
                    </View>
                )}
            </View>
            <YStack padding={16} gap={8}>
                <Text fontSize={16} fontWeight="600" color={DesignTokens.colors.brown[900]} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text fontSize={13} color={DesignTokens.colors.charcoal[500]} numberOfLines={2} lineHeight={18}>
                    {item.description}
                </Text>
                <XStack alignItems="center" justifyContent="space-between">
                    <Text fontSize={16} fontWeight="700" color={DesignTokens.colors.brown[900]}>
                        ₹{price.toFixed(0)}
                    </Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => onAddToCart(item)}
                        disabled={!item.isAvailable}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                </XStack>
            </YStack>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: SCREEN_WIDTH * 0.7,
        backgroundColor: DesignTokens.colors.neutral.white,
        borderRadius: 20,
        overflow: 'hidden',
        marginRight: 12,
        borderWidth: 1,
        borderColor: DesignTokens.colors.beige[200],
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 180,
    },
    badge: {
        position: 'absolute',
        top: 12,
        left: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    popularBadge: {
        backgroundColor: '#F08080',
    },
    chefBadge: {
        backgroundColor: DesignTokens.colors.charcoal[800],
    },
    badgeText: {
        color: DesignTokens.colors.neutral.white,
        fontSize: 12,
        fontWeight: '700',
    },
    chefBadgeText: {
        color: DesignTokens.colors.orange[500],
        fontSize: 12,
        fontWeight: '700',
    },
    addButton: {
        backgroundColor: DesignTokens.colors.orange[500],
        paddingHorizontal: 24,
        minHeight: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: DesignTokens.colors.neutral.white,
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});
