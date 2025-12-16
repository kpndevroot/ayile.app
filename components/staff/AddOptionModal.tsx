import React, { useState } from 'react';
import { Modal, TouchableOpacity, ScrollView } from 'react-native';
import { YStack, XStack, Text, Input as TamaguiInput } from '@tamagui/core';
import { DesignTokens } from '@/constants/design';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { X, ChevronDown } from '@tamagui/lucide-icons';

export interface AddOptionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: {
    quantityType: string;
    displayLabel: string;
    basePrice: string;
    originalPrice: string;
    calories?: string;
    protein?: string;
    carbs?: string;
    fats?: string;
    servingsInfo?: string;
    isDefault: boolean;
    isRecommended: boolean;
  }) => void;
}

const quantityTypes = ['Plate', 'Half Plate', 'Quarter Plate', 'Piece', 'Gram'];

/**
 * Add Option Modal
 * Modal for adding quantity options with pricing and nutrition information
 */
export function AddOptionModal({ visible, onClose, onAdd }: AddOptionModalProps) {
  const [quantityType, setQuantityType] = useState('Plate');
  const [displayLabel, setDisplayLabel] = useState('');
  const [basePrice, setBasePrice] = useState('0.00');
  const [originalPrice, setOriginalPrice] = useState('0.00');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [servingsInfo, setServingsInfo] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [showQuantityDropdown, setShowQuantityDropdown] = useState(false);

  const handleAdd = () => {
    onAdd({
      quantityType,
      displayLabel,
      basePrice,
      originalPrice,
      calories,
      protein,
      carbs,
      fats,
      servingsInfo,
      isDefault,
      isRecommended,
    });
    // Reset form
    setDisplayLabel('');
    setBasePrice('0.00');
    setOriginalPrice('0.00');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
    setServingsInfo('');
    setIsDefault(false);
    setIsRecommended(false);
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
        justifyContent="center"
        alignItems="center"
        padding="$4"
      >
        <Card
          padding="$6"
          backgroundColor={DesignTokens.colors.white}
          borderRadius="xl"
          shadow="lg"
          maxWidth={500}
          width="100%"
          maxHeight="90%"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack space="$5">
              {/* Header */}
              <XStack
                justifyContent="space-between"
                alignItems="center"
                marginBottom="$2"
              >
                <Text
                  fontSize={DesignTokens.typography.fontSize['2xl']}
                  fontWeight={DesignTokens.typography.fontWeight.bold}
                  color={DesignTokens.colors.brown[900]}
                >
                  Add Option
                </Text>
                <TouchableOpacity onPress={onClose}>
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

              {/* Quantity Type & Display Label */}
              <YStack space="$3">
                <YStack space="$1">
                  <Text
                    fontSize={DesignTokens.typography.fontSize.sm}
                    fontWeight={DesignTokens.typography.fontWeight.semibold}
                    color={DesignTokens.colors.brown[900]}
                  >
                    Quantity Type
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowQuantityDropdown(!showQuantityDropdown)}
                  >
                    <Card
                      padding="$3"
                      backgroundColor={DesignTokens.colors.white}
                      borderRadius="md"
                      shadow="sm"
                      style={{
                        borderWidth: 1,
                        borderColor: DesignTokens.colors.beige[300],
                      }}
                    >
                      <XStack
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text
                          fontSize={DesignTokens.typography.fontSize.md}
                          color={DesignTokens.colors.brown[900]}
                        >
                          {quantityType}
                        </Text>
                        <ChevronDown
                          size={20}
                          color={DesignTokens.colors.lightBrown[500]}
                        />
                      </XStack>
                    </Card>
                  </TouchableOpacity>
                  {showQuantityDropdown && (
                    <Card
                      padding="$2"
                      backgroundColor={DesignTokens.colors.white}
                      borderRadius="md"
                      shadow="lg"
                      marginTop="$1"
                    >
                      <YStack space="$1">
                        {quantityTypes.map((type) => (
                          <TouchableOpacity
                            key={type}
                            onPress={() => {
                              setQuantityType(type);
                              setShowQuantityDropdown(false);
                            }}
                          >
                            <XStack
                              padding="$2"
                              borderRadius={DesignTokens.radius.sm}
                              backgroundColor={
                                quantityType === type
                                  ? DesignTokens.colors.orange[100]
                                  : 'transparent'
                              }
                            >
                              <Text
                                fontSize={DesignTokens.typography.fontSize.md}
                                color={DesignTokens.colors.brown[900]}
                              >
                                {type}
                              </Text>
                            </XStack>
                          </TouchableOpacity>
                        ))}
                      </YStack>
                    </Card>
                  )}
                </YStack>
                <YStack space="$1">
                  <Text
                    fontSize={DesignTokens.typography.fontSize.sm}
                    fontWeight={DesignTokens.typography.fontWeight.semibold}
                    color={DesignTokens.colors.brown[900]}
                  >
                    Display Label
                  </Text>
                  <TamaguiInput
                    placeholder="e.g. Full Plate"
                    value={displayLabel}
                    onChangeText={setDisplayLabel}
                    backgroundColor={DesignTokens.colors.white}
                    borderRadius={DesignTokens.radius.md}
                    padding="$3"
                    fontSize={DesignTokens.typography.fontSize.md}
                    borderWidth={1}
                    borderColor={DesignTokens.colors.beige[300]}
                  />
                </YStack>
              </YStack>

              {/* Pricing Card */}
              <Card
                padding="$4"
                backgroundColor={DesignTokens.colors.beige[50]}
                borderRadius="md"
                shadow="sm"
              >
                <YStack space="$3">
                  <Text
                    fontSize={DesignTokens.typography.fontSize.md}
                    fontWeight={DesignTokens.typography.fontWeight.bold}
                    color={DesignTokens.colors.brown[900]}
                  >
                    Pricing
                  </Text>
                  <XStack space="$3">
                    <YStack flex={1} space="$1">
                      <Text
                        fontSize={DesignTokens.typography.fontSize.sm}
                        color={DesignTokens.colors.brown[700]}
                      >
                        Base Price
                      </Text>
                      <TamaguiInput
                        placeholder="$0.00"
                        value={basePrice}
                        onChangeText={setBasePrice}
                        keyboardType="decimal-pad"
                        backgroundColor={DesignTokens.colors.white}
                        borderRadius={DesignTokens.radius.md}
                        padding="$3"
                        fontSize={DesignTokens.typography.fontSize.md}
                        borderWidth={1}
                        borderColor={DesignTokens.colors.beige[300]}
                      />
                    </YStack>
                    <YStack flex={1} space="$1">
                      <Text
                        fontSize={DesignTokens.typography.fontSize.sm}
                        color={DesignTokens.colors.brown[700]}
                      >
                        Original Price
                      </Text>
                      <TamaguiInput
                        placeholder="$0.00"
                        value={originalPrice}
                        onChangeText={setOriginalPrice}
                        keyboardType="decimal-pad"
                        backgroundColor={DesignTokens.colors.white}
                        borderRadius={DesignTokens.radius.md}
                        padding="$3"
                        fontSize={DesignTokens.typography.fontSize.md}
                        borderWidth={1}
                        borderColor={DesignTokens.colors.beige[300]}
                      />
                    </YStack>
                  </XStack>
                </YStack>
              </Card>

              {/* Nutrition Information Card */}
              <Card
                padding="$4"
                backgroundColor={DesignTokens.colors.beige[50]}
                borderRadius="md"
                shadow="sm"
              >
                <YStack space="$3">
                  <Text
                    fontSize={DesignTokens.typography.fontSize.md}
                    fontWeight={DesignTokens.typography.fontWeight.bold}
                    color={DesignTokens.colors.brown[900]}
                  >
                    Nutrition Information
                  </Text>
                  <XStack space="$3" flexWrap="wrap">
                    <YStack flex={1} minWidth="45%" space="$1">
                      <Text
                        fontSize={DesignTokens.typography.fontSize.sm}
                        color={DesignTokens.colors.brown[700]}
                      >
                        Calories
                      </Text>
                      <TamaguiInput
                        placeholder="kcal"
                        value={calories}
                        onChangeText={setCalories}
                        keyboardType="number-pad"
                        backgroundColor={DesignTokens.colors.white}
                        borderRadius={DesignTokens.radius.md}
                        padding="$3"
                        fontSize={DesignTokens.typography.fontSize.md}
                        borderWidth={1}
                        borderColor={DesignTokens.colors.beige[300]}
                      />
                    </YStack>
                    <YStack flex={1} minWidth="45%" space="$1">
                      <Text
                        fontSize={DesignTokens.typography.fontSize.sm}
                        color={DesignTokens.colors.brown[700]}
                      >
                        Protein
                      </Text>
                      <TamaguiInput
                        placeholder="g"
                        value={protein}
                        onChangeText={setProtein}
                        keyboardType="decimal-pad"
                        backgroundColor={DesignTokens.colors.white}
                        borderRadius={DesignTokens.radius.md}
                        padding="$3"
                        fontSize={DesignTokens.typography.fontSize.md}
                        borderWidth={1}
                        borderColor={DesignTokens.colors.beige[300]}
                      />
                    </YStack>
                    <YStack flex={1} minWidth="45%" space="$1">
                      <Text
                        fontSize={DesignTokens.typography.fontSize.sm}
                        color={DesignTokens.colors.brown[700]}
                      >
                        Carbs
                      </Text>
                      <TamaguiInput
                        placeholder="g"
                        value={carbs}
                        onChangeText={setCarbs}
                        keyboardType="decimal-pad"
                        backgroundColor={DesignTokens.colors.white}
                        borderRadius={DesignTokens.radius.md}
                        padding="$3"
                        fontSize={DesignTokens.typography.fontSize.md}
                        borderWidth={1}
                        borderColor={DesignTokens.colors.beige[300]}
                      />
                    </YStack>
                    <YStack flex={1} minWidth="45%" space="$1">
                      <Text
                        fontSize={DesignTokens.typography.fontSize.sm}
                        color={DesignTokens.colors.brown[700]}
                      >
                        Fats
                      </Text>
                      <TamaguiInput
                        placeholder="g"
                        value={fats}
                        onChangeText={setFats}
                        keyboardType="decimal-pad"
                        backgroundColor={DesignTokens.colors.white}
                        borderRadius={DesignTokens.radius.md}
                        padding="$3"
                        fontSize={DesignTokens.typography.fontSize.md}
                        borderWidth={1}
                        borderColor={DesignTokens.colors.beige[300]}
                      />
                    </YStack>
                  </XStack>
                  <YStack space="$1">
                    <Text
                      fontSize={DesignTokens.typography.fontSize.sm}
                      color={DesignTokens.colors.brown[700]}
                    >
                      Servings Info
                    </Text>
                    <TamaguiInput
                      placeholder="e.g. Serves 2"
                      value={servingsInfo}
                      onChangeText={setServingsInfo}
                      backgroundColor={DesignTokens.colors.white}
                      borderRadius={DesignTokens.radius.md}
                      padding="$3"
                      fontSize={DesignTokens.typography.fontSize.md}
                      borderWidth={1}
                      borderColor={DesignTokens.colors.beige[300]}
                    />
                  </YStack>
                </YStack>
              </Card>

              {/* Settings */}
              <YStack space="$2">
                <TouchableOpacity
                  onPress={() => setIsDefault(!isDefault)}
                >
                  <XStack alignItems="center" space="$2">
                    <XStack
                      width={20}
                      height={20}
                      borderRadius={DesignTokens.radius.sm}
                      borderWidth={2}
                      borderColor={DesignTokens.colors.beige[400]}
                      backgroundColor={
                        isDefault
                          ? DesignTokens.colors.orange[500]
                          : 'transparent'
                      }
                      alignItems="center"
                      justifyContent="center"
                    >
                      {isDefault && (
                        <Text
                          fontSize={12}
                          color={DesignTokens.colors.white}
                          fontWeight="bold"
                        >
                          ✓
                        </Text>
                      )}
                    </XStack>
                    <Text
                      fontSize={DesignTokens.typography.fontSize.md}
                      color={DesignTokens.colors.brown[900]}
                    >
                      Set as Default
                    </Text>
                  </XStack>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsRecommended(!isRecommended)}
                >
                  <XStack alignItems="center" space="$2">
                    <XStack
                      width={20}
                      height={20}
                      borderRadius={DesignTokens.radius.sm}
                      borderWidth={2}
                      borderColor={DesignTokens.colors.beige[400]}
                      backgroundColor={
                        isRecommended
                          ? DesignTokens.colors.orange[500]
                          : 'transparent'
                      }
                      alignItems="center"
                      justifyContent="center"
                    >
                      {isRecommended && (
                        <Text
                          fontSize={12}
                          color={DesignTokens.colors.white}
                          fontWeight="bold"
                        >
                          ✓
                        </Text>
                      )}
                    </XStack>
                    <Text
                      fontSize={DesignTokens.typography.fontSize.md}
                      color={DesignTokens.colors.brown[900]}
                    >
                      Mark as Recommended
                    </Text>
                  </XStack>
                </TouchableOpacity>
              </YStack>

              {/* Action Buttons */}
              <XStack space="$3" marginTop="$2">
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={onClose}
                >
                  <XStack
                    flex={1}
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
                      Cancel
                    </Text>
                  </XStack>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={handleAdd}
                >
                  <XStack
                    flex={1}
                    paddingVertical="$3"
                    borderRadius={DesignTokens.radius.md}
                    backgroundColor={DesignTokens.colors.orange[500]}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text
                      fontSize={DesignTokens.typography.fontSize.md}
                      fontWeight={DesignTokens.typography.fontWeight.semibold}
                      color={DesignTokens.colors.white}
                    >
                      Add Option
                    </Text>
                  </XStack>
                </TouchableOpacity>
              </XStack>
            </YStack>
          </ScrollView>
        </Card>
      </YStack>
    </Modal>
  );
}
