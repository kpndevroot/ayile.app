import React, { useState } from 'react';
import { Modal, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { DesignTokens } from '@/constants/design';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { X, Circle } from '@tamagui/lucide-icons';

export type OrderStatusOption = {
  value: string;
  label: string;
  description: string;
};

export interface UpdateOrderStatusModalProps {
  visible: boolean;
  currentStatus: string;
  onClose: () => void;
  onUpdate: (status: string, estimatedTime?: number) => void;
}

const statusOptions: OrderStatusOption[] = [
  {
    value: 'PREPARING',
    label: 'Preparing',
    description: 'The kitchen has started working on the order.',
  },
  {
    value: 'READY',
    label: 'Ready for Pickup',
    description: 'The order is complete and ready for the guest.',
  },
  {
    value: 'DELIVERED',
    label: 'Delivered',
    description: "The order has been delivered to the guest's table/room.",
  },
];

/**
 * Update Order Status Modal
 * Bottom sheet modal for updating order status with estimated time
 */
export function UpdateOrderStatusModal({
  visible,
  currentStatus,
  onClose,
  onUpdate,
}: UpdateOrderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('READY');
  const [estimatedTime, setEstimatedTime] = useState('');

  const handleUpdate = () => {
    console.log('selectedStatus', selectedStatus);
    onUpdate(
      selectedStatus,
      estimatedTime ? parseInt(estimatedTime, 10) : undefined
    );
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <YStack
        flex={1}
        backgroundColor="rgba(0, 0, 0, 0.5)"
        justifyContent="flex-end"
      >
        <Card
          padding="xl"
          backgroundColor={DesignTokens.colors.neutral.white}
          borderRadius="xl"
          shadow="lg"
          style={{
            borderTopLeftRadius: DesignTokens.radius.xl,
            borderTopRightRadius: DesignTokens.radius.xl,
          }}
        >
          <YStack space="$5">
            {/* Handle */}
            <XStack alignItems="center" justifyContent="center" paddingBottom="$2">
              <XStack
                width={40}
                height={4}
                backgroundColor={DesignTokens.colors.beige[400]}
                borderRadius={DesignTokens.radius.full}
              />
            </XStack>

            {/* Header */}
            <YStack space="$1">
              <Text
                fontSize={DesignTokens.typography.fontSize['2xl']}
                fontWeight={DesignTokens.typography.fontWeight.bold}
                color={DesignTokens.colors.brown[900]}
                textAlign="center"
              >
                Update Order Status
              </Text>
              <Text
                fontSize={DesignTokens.typography.fontSize.sm}
                color={DesignTokens.colors.lightBrown[500]}
                textAlign="center"
              >
                Current: {currentStatus}
              </Text>
            </YStack>

            {/* Status Selection */}
            <YStack space="$3">
              <Text
                fontSize={DesignTokens.typography.fontSize.md}
                fontWeight={DesignTokens.typography.fontWeight.bold}
                color={DesignTokens.colors.brown[900]}
              >
                Select Next Status
              </Text>
              <YStack space="$2">
                {statusOptions.map((option) => {
                  const isSelected = selectedStatus === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setSelectedStatus(option.value)}
                    >
                      <Card
                        padding="md"
                        backgroundColor={
                          isSelected
                            ? DesignTokens.colors.orange[100]
                            : DesignTokens.colors.beige[100]
                        }
                        borderRadius="md"
                        shadow="sm"
                        style={{
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected
                            ? DesignTokens.colors.orange[500]
                            : DesignTokens.colors.beige[300],
                        }}
                      >
                        <XStack space="$3" alignItems="flex-start">
                          <XStack marginTop="$0.5">
                            {isSelected ? (
                              <Circle
                                size={20}
                                fill={DesignTokens.colors.orange[500]}
                                color={DesignTokens.colors.orange[500]}
                              />
                            ) : (
                              <Circle
                                size={20}
                                color={DesignTokens.colors.beige[400]}
                                fill="transparent"
                              />
                            )}
                          </XStack>
                          <YStack flex={1} space="$1">
                            <Text
                              fontSize={DesignTokens.typography.fontSize.md}
                              fontWeight={DesignTokens.typography.fontWeight.semibold}
                              color={DesignTokens.colors.brown[900]}
                            >
                              {option.label}
                            </Text>
                            <Text
                              fontSize={DesignTokens.typography.fontSize.sm}
                              color={DesignTokens.colors.lightBrown[500]}
                            >
                              {option.description}
                            </Text>
                          </YStack>
                        </XStack>
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </YStack>
            </YStack>

            {/* Estimated Time */}
            <YStack space="$2">
              <Text
                fontSize={DesignTokens.typography.fontSize.md}
                fontWeight={DesignTokens.typography.fontWeight.bold}
                color={DesignTokens.colors.brown[900]}
              >
                Estimated Time
              </Text>
              <XStack
                alignItems="center"
                space="$2"
                paddingHorizontal="$3"
                paddingVertical="$2"
                backgroundColor={DesignTokens.colors.beige[100]}
                borderRadius={DesignTokens.radius.md}
              >
                <TextInput
                  placeholder="e.g., 15"
                  value={estimatedTime}
                  onChangeText={setEstimatedTime}
                  keyboardType="number-pad"
                  style={{
                    flex: 1,
                    fontSize: DesignTokens.typography.fontSize.md,
                    color: DesignTokens.colors.brown[900],
                  }}
                  placeholderTextColor={DesignTokens.colors.lightBrown[400]}
                />
                <Text
                  fontSize={DesignTokens.typography.fontSize.md}
                  color={DesignTokens.colors.lightBrown[500]}
                >
                  minutes
                </Text>
              </XStack>
            </YStack>

            {/* Action Buttons */}
            {currentStatus !== 'DELIVERED' ? (
              <YStack space="$2">
              <Button
                onPress={handleUpdate}
                variant="primary"
                fullWidth
                style={{
                  backgroundColor: DesignTokens.colors.orange[500],
                }}
              >
                Update Status
              </Button>
              <TouchableOpacity onPress={onClose}>
                <Text
                  fontSize={DesignTokens.typography.fontSize.md}
                  color={DesignTokens.colors.brown[700]}
                  textAlign="center"
                  paddingVertical="$2"
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </YStack>
            ) : null}
            
          </YStack>
        </Card>
      </YStack>
    </Modal>
  );
}
