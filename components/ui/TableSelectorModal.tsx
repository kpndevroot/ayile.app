import React, { useState, useEffect } from 'react';
import {
    Modal,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    View,
    StyleSheet,
} from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { X, Users } from '@tamagui/lucide-icons';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { DesignTokens } from '@/constants/design';

/**
 * Table data from the API
 */
interface TableData {
    id: string;
    tableNumber: number;
    capacity: number | null;
    hasActiveOrder: boolean;
}

interface TableSelectorModalProps {
    visible: boolean;
    restaurantId: string;
    onSelect: (tableNumber: string) => void;
    onClose: () => void;
    isSubmitting?: boolean;
}

const COLUMNS = 3;
const CARD_GAP = 14;

/**
 * TableSelectorModal
 *
 * Visual grid of restaurant tables for the customer to pick from.
 * Occupied tables (those with an active order) are disabled.
 *
 * Design rules applied:
 * - Hick's Law: one clear choice per card, minimal cognitive load
 * - Fitts's Law: large touch targets (well above 44px minimum)
 * - Von Restorff Effect: selected table has orange highlight
 * - Visual Hierarchy: one dominant action (Confirm), disabled state contrast
 * - Accessibility: high-contrast text, accessible labels, semantic colors
 * - Consistent spacing via 8pt grid, typography hierarchy from DesignTokens
 */
export function TableSelectorModal({
    visible,
    restaurantId,
    onSelect,
    onClose,
    isSubmitting = false,
}: TableSelectorModalProps) {
    const [tables, setTables] = useState<TableData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTable, setSelectedTable] = useState<number | null>(null);

    const screenWidth = Dimensions.get('window').width;
    const modalWidth = Math.min(screenWidth - 40, 400);
    const gridPadding = 24 * 2; // left + right modal padding
    const totalGap = CARD_GAP * (COLUMNS - 1);
    const cardSize = Math.floor((modalWidth - gridPadding - totalGap) / COLUMNS);

    const fetchTables = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.RESTAURANTS.TABLES(restaurantId)}`
            );

            if (!response.ok) {
                throw new Error('Failed to load tables');
            }

            const data = await response.json();
            setTables(data.tables || []);
        } catch (err: any) {
            console.error('[TableSelector] Error fetching tables:', err);
            setError(err.message || 'Failed to load tables');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible && restaurantId) {
            setSelectedTable(null);
            fetchTables();
        }
    }, [visible, restaurantId]);

    const handleConfirm = () => {
        if (selectedTable !== null) {
            onSelect(String(selectedTable));
        }
    };

    // Build rows of 3 for predictable grid layout
    const rows: TableData[][] = [];
    for (let i = 0; i < tables.length; i += COLUMNS) {
        rows.push(tables.slice(i, i + COLUMNS));
    }

    const renderTableCard = (table: TableData) => {
        const isSelected = selectedTable === table.tableNumber;
        const isOccupied = table.hasActiveOrder;

        return (
            <TouchableOpacity
                key={table.id}
                activeOpacity={isOccupied ? 1 : 0.7}
                disabled={isOccupied}
                onPress={() => setSelectedTable(table.tableNumber)}
                accessibilityLabel={`Table ${table.tableNumber}${isOccupied ? ', occupied' : ', available'}${table.capacity ? `, ${table.capacity} seats` : ''}`}
                accessibilityRole="button"
                style={[
                    styles.card,
                    {
                        width: cardSize,
                        height: cardSize,
                        borderColor: isSelected
                            ? DesignTokens.colors.orange[500]
                            : isOccupied
                                ? DesignTokens.colors.charcoal[200]
                                : DesignTokens.colors.beige[200],
                        backgroundColor: isSelected
                            ? DesignTokens.colors.orange[50]
                            : isOccupied
                                ? DesignTokens.colors.charcoal[100]
                                : DesignTokens.colors.neutral.white,
                        opacity: isOccupied ? 0.55 : 1,
                    },
                    isSelected && styles.cardSelected,
                ]}
            >
                {/* Table label */}
                <Text
                    fontSize={11}
                    fontWeight="600"
                    color={
                        isSelected
                            ? DesignTokens.colors.orange[400]
                            : isOccupied
                                ? DesignTokens.colors.charcoal[400]
                                : DesignTokens.colors.lightBrown[400]
                    }
                    style={{ letterSpacing: 0.5 }}
                >
                    TABLE
                </Text>

                {/* Table number — dominant element */}
                <Text
                    fontSize={26}
                    fontWeight="800"
                    color={
                        isSelected
                            ? DesignTokens.colors.orange[600]
                            : isOccupied
                                ? DesignTokens.colors.charcoal[400]
                                : DesignTokens.colors.brown[900]
                    }
                    style={{ marginTop: -2 }}
                >
                    {table.tableNumber}
                </Text>

                {/* Capacity indicator */}
                {table.capacity ? (
                    <XStack alignItems="center" gap={3} marginTop={2}>
                        <Users
                            size={11}
                            color={
                                isSelected
                                    ? DesignTokens.colors.orange[400]
                                    : isOccupied
                                        ? DesignTokens.colors.charcoal[400]
                                        : DesignTokens.colors.lightBrown[400]
                            }
                        />
                        <Text
                            fontSize={11}
                            fontWeight="500"
                            color={
                                isSelected
                                    ? DesignTokens.colors.orange[400]
                                    : isOccupied
                                        ? DesignTokens.colors.charcoal[400]
                                        : DesignTokens.colors.lightBrown[400]
                            }
                        >
                            {table.capacity}
                        </Text>
                    </XStack>
                ) : null}

                {/* Occupied badge */}
                {isOccupied && (
                    <View style={styles.occupiedBadge}>
                        <Text fontSize={7} fontWeight="800" color="#FFF" style={{ letterSpacing: 0.5 }}>
                            IN USE
                        </Text>
                    </View>
                )}

                {/* Selected checkmark */}
                {isSelected && (
                    <View style={styles.checkmark}>
                        <Text fontSize={10} fontWeight="800" color="#FFF">✓</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { width: modalWidth }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <YStack>
                            <Text
                                fontSize={22}
                                fontWeight="800"
                                color={DesignTokens.colors.brown[900]}
                            >
                                Select Your Table
                            </Text>
                            <Text
                                fontSize={13}
                                color={DesignTokens.colors.lightBrown[400]}
                                marginTop={4}
                            >
                                Tap an available table to select it
                            </Text>
                        </YStack>
                        <TouchableOpacity
                            onPress={onClose}
                            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                            accessibilityLabel="Close"
                            style={styles.closeButton}
                        >
                            <X size={18} color={DesignTokens.colors.brown[700]} />
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Content */}
                    {loading ? (
                        <View style={styles.centerState}>
                            <ActivityIndicator size="large" color={DesignTokens.colors.orange[500]} />
                            <Text fontSize={14} color={DesignTokens.colors.lightBrown[400]} marginTop={12}>
                                Loading tables...
                            </Text>
                        </View>
                    ) : error ? (
                        <View style={styles.centerState}>
                            <Text fontSize={16} fontWeight="600" color={DesignTokens.colors.semantic.error}>
                                {error}
                            </Text>
                            <TouchableOpacity onPress={fetchTables} style={styles.retryButton}>
                                <Text fontSize={14} fontWeight="600" color="#FFF">Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : tables.length === 0 ? (
                        <View style={styles.centerState}>
                            <Text fontSize={16} fontWeight="600" color={DesignTokens.colors.brown[700]}>
                                No tables available
                            </Text>
                            <Text fontSize={14} color={DesignTokens.colors.lightBrown[400]} marginTop={4}>
                                This restaurant has no tables configured.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={{ maxHeight: 360 }}
                            contentContainerStyle={styles.gridContainer}
                        >
                            {rows.map((row, rowIdx) => (
                                <View key={rowIdx} style={styles.gridRow}>
                                    {row.map(renderTableCard)}
                                    {/* Spacers for incomplete last row */}
                                    {row.length < COLUMNS &&
                                        Array.from({ length: COLUMNS - row.length }).map((_, i) => (
                                            <View key={`spacer-${i}`} style={{ width: cardSize }} />
                                        ))}
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    {/* Footer */}
                    {!loading && !error && tables.length > 0 && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.footer}>
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={styles.cancelBtn}
                                    activeOpacity={0.7}
                                >
                                    <Text fontSize={15} fontWeight="600" color={DesignTokens.colors.brown[700]}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleConfirm}
                                    disabled={selectedTable === null || isSubmitting}
                                    activeOpacity={0.8}
                                    style={[
                                        styles.confirmBtn,
                                        {
                                            backgroundColor:
                                                selectedTable !== null
                                                    ? DesignTokens.colors.orange[500]
                                                    : DesignTokens.colors.orange[200],
                                            opacity: selectedTable === null || isSubmitting ? 0.5 : 1,
                                        },
                                    ]}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <Text fontSize={15} fontWeight="700" color="#FFF">
                                            {selectedTable !== null
                                                ? `Confirm Table ${selectedTable}`
                                                : 'Select a Table'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingTop: 24,
        paddingBottom: 20,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: DesignTokens.colors.beige[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: DesignTokens.colors.beige[200],
    },
    centerState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    retryButton: {
        backgroundColor: DesignTokens.colors.orange[500],
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 12,
    },
    gridContainer: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: CARD_GAP,
        marginBottom: CARD_GAP,
    },
    card: {
        borderRadius: 14,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
    },
    cardSelected: {
        shadowColor: DesignTokens.colors.orange[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    occupiedBadge: {
        position: 'absolute',
        bottom: 6,
        backgroundColor: DesignTokens.colors.semantic.warning,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    checkmark: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: DesignTokens.colors.orange[500],
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: DesignTokens.colors.beige[200],
    },
    confirmBtn: {
        flex: 1.5,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: DesignTokens.colors.orange[500],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
});
