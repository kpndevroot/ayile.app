import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LocalCartItem } from '@/utils/storage';

interface CartItemRowProps {
    cartItem: LocalCartItem;
    onUpdateQuantity: (cartItem: LocalCartItem, newQuantity: number) => void;
    onRemove: (cartItem: LocalCartItem) => void;
}

/**
 * CartItemRow Component
 * Memoized cart item row for optimized list rendering
 */
const CartItemRow = React.memo(function CartItemRow({
    cartItem,
    onUpdateQuantity,
    onRemove,
}: CartItemRowProps) {
    const itemPrice = parseFloat(cartItem.menuItem?.price || '0');
    const totalPrice = itemPrice * cartItem.quantity;

    return (
        <XStack
            backgroundColor="white"
            borderRadius={12}
            padding={16}
            gap={12}
            alignItems="center"
        >
            <YStack flex={1} gap={4}>
                <Text
                    fontSize={16}
                    fontWeight="600"
                    color="$brown9"
                >
                    {cartItem.menuItem?.name || 'Item'}
                    {cartItem.quantityLabel ? ` (${cartItem.quantityLabel})` : ''}
                </Text>
                <Text
                    fontSize={14}
                    fontWeight="400"
                    color="$lightBrown5"
                >
                    ₹{itemPrice.toFixed(2)} each
                </Text>
            </YStack>

            {/* Quantity Controls */}
            <XStack
                alignItems="center"
                gap={12}
                backgroundColor="#F3F4F6"
                borderRadius={8}
                padding={4}
            >
                <TouchableOpacity
                    onPress={() => {
                        if (cartItem.quantity > 1) {
                            onUpdateQuantity(cartItem, cartItem.quantity - 1);
                        } else {
                            onRemove(cartItem);
                        }
                    }}
                    style={[
                        styles.quantityButton,
                        cartItem.quantity === 1 && styles.removeButton,
                    ]}
                >
                    <MaterialIcons
                        name={cartItem.quantity === 1 ? 'delete-outline' : 'remove'}
                        size={20}
                        color={cartItem.quantity === 1 ? '#EF4444' : '#6B7280'}
                    />
                </TouchableOpacity>

                <Text
                    fontSize={16}
                    fontWeight="600"
                    color="$brown9"
                    minWidth={30}
                    textAlign="center"
                >
                    {cartItem.quantity}
                </Text>

                <TouchableOpacity
                    onPress={() => onUpdateQuantity(cartItem, cartItem.quantity + 1)}
                    style={styles.quantityButton}
                >
                    <MaterialIcons name="add" size={20} color="#F97316" />
                </TouchableOpacity>
            </XStack>

            <YStack alignItems="flex-end" gap={2}>
                <Text
                    fontSize={18}
                    fontWeight="700"
                    color="$orange6"
                >
                    ₹{totalPrice.toFixed(2)}
                </Text>
            </YStack>
        </XStack>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    return (
        prevProps.cartItem.menuItemId === nextProps.cartItem.menuItemId &&
        prevProps.cartItem.quantityOptionId === nextProps.cartItem.quantityOptionId &&
        prevProps.cartItem.quantity === nextProps.cartItem.quantity &&
        prevProps.cartItem.menuItem?.price === nextProps.cartItem.menuItem?.price
    );
});

const styles = StyleSheet.create({
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButton: {
        backgroundColor: '#FEE2E2',
    },
});

export { CartItemRow };
