import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignTokens } from '@/constants/design';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, X, Download, Printer } from '@tamagui/lucide-icons';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';
import { StaffService, Table } from '@/services/staffService';
import { API_BASE_URL } from '@/constants/api';
import { StorageService } from '@/utils/storage';

/**
 * Table Management Screen
 * Displays tables with QR code generation and management
 */
export default function TableManagementScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<Table[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const userData = await StorageService.getUserData();
      const rid = userData?.restaurantId ?? null;
      setRestaurantId(rid);
      
      if (rid) {
        const tablesData = await StaffService.getTables();
        // Map tables to include order status
        const tablesWithStatus: Table[] = tablesData.map((table): Table => {
          // Check if table has active order
          // This would require an API call to check orders for this table
          const status: 'available' | 'active' | 'inactive' = table.isActive ? 'available' : 'inactive';
          return {
            ...table,
            seats: table.capacity || 4,
            orderId: null, // Could fetch active order ID here
            status,
          };
        });
        setTables(tablesWithStatus);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = (tableId: string) => {
    setSelectedTable(tableId);
    setShowQRModal(true);
  };

  const getQRCodeValue = (tableId: string) => {
    if (!restaurantId) return '';
    const table = tables.find(t => t.id === tableId);
    if (table) {
      return `${API_BASE_URL}/restaurant/${restaurantId}/table/${table.uniqueId}`;
    }
    return '';
  };

  return (
    <YStack
      flex={1}
      backgroundColor={DesignTokens.colors.charcoal[800]}
      paddingTop={insets.top}
    >
      {/* Header */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text
          fontSize={DesignTokens.typography.fontSize['2xl']}
          fontWeight={DesignTokens.typography.fontWeight.bold}
          color={DesignTokens.colors.neutral.white}
        >
          Table Management
        </Text>
        <TouchableOpacity
          onPress={() => console.log('Add Table')}
        >
          <XStack
            backgroundColor={DesignTokens.colors.orange[500]}
            borderRadius={DesignTokens.radius.full}
            width={40}
            height={40}
            alignItems="center"
            justifyContent="center"
          >
            <Plus size={24} color={DesignTokens.colors.neutral.white} />
          </XStack>
        </TouchableOpacity>
      </XStack>

      {loading ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color={DesignTokens.colors.neutral.white} />
        </YStack>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack padding="$4" gap="$3">
            {tables.length === 0 ? (
              <YStack alignItems="center" justifyContent="center" padding="$8">
                <Text
                  fontSize={DesignTokens.typography.fontSize.md}
                  color={DesignTokens.colors.neutral.white}
                >
                  No tables found
                </Text>
              </YStack>
            ) : (
              tables.map((table) => (
                <Card
                  key={table.id}
                  padding="md"
                  backgroundColor={DesignTokens.colors.beige[200]}
                  borderRadius="md"
                  shadow="md"
                >
                  <YStack gap="$2">
                    <XStack justifyContent="space-between" alignItems="center">
                      <Text
                        fontSize={DesignTokens.typography.fontSize.xl}
                        fontWeight={DesignTokens.typography.fontWeight.bold}
                        color={DesignTokens.colors.brown[900]}
                      >
                        Table {table.tableNumber}
                      </Text>
                      <Text
                        fontSize={DesignTokens.typography.fontSize.sm}
                        color={
                          table.status === 'active'
                            ? DesignTokens.colors.teal[500]
                            : DesignTokens.colors.lightBrown[500]
                        }
                        fontWeight={DesignTokens.typography.fontWeight.semibold}
                      >
                        {table.status === 'active' ? 'Active' : 'Available'}
                      </Text>
                    </XStack>
                    <Text
                      fontSize={DesignTokens.typography.fontSize.sm}
                      color={DesignTokens.colors.lightBrown[500]}
                    >
                      Seats: {table.seats}
                    </Text>
                    {table.orderId && (
                      <Text
                        fontSize={DesignTokens.typography.fontSize.sm}
                        color={DesignTokens.colors.lightBrown[500]}
                      >
                        Order {table.orderId}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() => handleShowQR(table.id)}
                    >
                      <XStack
                        marginTop="$2"
                        paddingVertical="$2"
                        paddingHorizontal="$3"
                        borderRadius={DesignTokens.radius.md}
                        backgroundColor={DesignTokens.colors.orange[500]}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text
                          color={DesignTokens.colors.neutral.white}
                          fontWeight={DesignTokens.typography.fontWeight.semibold}
                        >
                          View QR Code
                        </Text>
                      </XStack>
                    </TouchableOpacity>
                  </YStack>
                </Card>
              ))
            )}
          </YStack>
        </ScrollView>
      )}

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQRModal(false)}
      >
        <YStack
          flex={1}
          backgroundColor="rgba(0, 0, 0, 0.5)"
          justifyContent="center"
          alignItems="center"
          padding="$4"
        >
          <Card
            backgroundColor={DesignTokens.colors.neutral.white}
            borderRadius="xl"
            shadow="lg"
          >
            <YStack gap="$4" alignItems="center">
              {/* Header */}
              <XStack
                width="100%"
                justifyContent="space-between"
                alignItems="center"
              >
                <Text
                  fontSize={DesignTokens.typography.fontSize.xl}
                  fontWeight={DesignTokens.typography.fontWeight.bold}
                  color={DesignTokens.colors.brown[900]}
                >
                  Table {tables.find(t => t.id === selectedTable)?.tableNumber || 'N/A'}
                </Text>
                <TouchableOpacity onPress={() => setShowQRModal(false)}>
                  <XStack
                    backgroundColor={DesignTokens.colors.beige[300]}
                    borderRadius={DesignTokens.radius.full}
                    width={32}
                    height={32}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <X size={20} color={DesignTokens.colors.brown[700]} />
                  </XStack>
                </TouchableOpacity>
              </XStack>

              {/* Instruction */}
              <Text
                fontSize={DesignTokens.typography.fontSize.sm}
                color={DesignTokens.colors.orange[500]}
                textAlign="center"
              >
                Scan to view menu & order
              </Text>

              {/* QR Code Display */}
              <XStack
                width={250}
                height={250}
                backgroundColor={DesignTokens.colors.neutral.white}
                borderRadius={DesignTokens.radius.md}
                borderWidth={2}
                borderColor={DesignTokens.colors.beige[300]}
                alignItems="center"
                justifyContent="center"
                padding={10}
              >
                <QRCodeDisplay
                  value={selectedTable ? getQRCodeValue(selectedTable) : ''}
                  size={230}
                  backgroundColor={DesignTokens.colors.neutral.white}
                  color={DesignTokens.colors.brown[900]}
                />
              </XStack>

              {/* Action Buttons */}
              <XStack gap="$3" width="100%">
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => console.log('Download QR')}
                >
                  <XStack
                    flex={1}
                    paddingVertical="$3"
                    paddingHorizontal="$4"
                    borderRadius={DesignTokens.radius.md}
                    backgroundColor={DesignTokens.colors.orange[100]}
                    alignItems="center"
                    justifyContent="center"
                    gap="$2"
                  >
                    <Download
                      size={18}
                      color={DesignTokens.colors.brown[700]}
                    />
                    <Text
                      fontSize={DesignTokens.typography.fontSize.md}
                      fontWeight={DesignTokens.typography.fontWeight.semibold}
                      color={DesignTokens.colors.brown[700]}
                    >
                      Download
                    </Text>
                  </XStack>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => console.log('Print QR')}
                >
                  <XStack
                    flex={1}
                    paddingVertical="$3"
                    paddingHorizontal="$4"
                    borderRadius={DesignTokens.radius.md}
                    backgroundColor={DesignTokens.colors.orange[100]}
                    alignItems="center"
                    justifyContent="center"
                    gap="$2"
                  >
                    <Printer
                      size={18}
                      color={DesignTokens.colors.brown[700]}
                    />
                    <Text
                      fontSize={DesignTokens.typography.fontSize.md}
                      fontWeight={DesignTokens.typography.fontWeight.semibold}
                      color={DesignTokens.colors.brown[700]}
                    >
                      Print
                    </Text>
                  </XStack>
                </TouchableOpacity>
              </XStack>

              {/* Close Button */}
              <TouchableOpacity
                style={{ width: '100%' }}
                onPress={() => setShowQRModal(false)}
              >
                <XStack
                  width="100%"
                  paddingVertical="$3"
                  borderRadius={DesignTokens.radius.md}
                  backgroundColor={DesignTokens.colors.beige[300]}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    fontSize={DesignTokens.typography.fontSize.md}
                    fontWeight={DesignTokens.typography.fontWeight.semibold}
                    color={DesignTokens.colors.brown[700]}
                  >
                    Close
                  </Text>
                </XStack>
              </TouchableOpacity>
            </YStack>
          </Card>
        </YStack>
      </Modal>
    </YStack>
  );
}
