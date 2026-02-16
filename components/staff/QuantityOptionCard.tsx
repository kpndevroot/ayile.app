import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text, YStack, XStack } from 'tamagui';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Trash2 } from '@tamagui/lucide-icons';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { DesignTokens } from '@/constants/design';
import type { MenuItemFormData } from '@/lib/validations/menuItemSchema';

interface QuantityOptionCardProps {
  control: Control<MenuItemFormData>;
  index: number;
  quantityTypes: Array<{ id: string; displayName: string; code: string }>;
  onRemove: () => void;
  onSetDefault: () => void;
  isOnly: boolean;
  errors: FieldErrors<MenuItemFormData>;
}

export function QuantityOptionCard({
  control,
  index,
  quantityTypes,
  onRemove,
  onSetDefault,
  isOnly,
  errors,
}: QuantityOptionCardProps) {
  const optionErrors = errors.quantityOptions?.[index];

  return (
    <Card
      backgroundColor={DesignTokens.colors.beige[100]}
      borderRadius="md"
      shadow="sm"
    >
      <YStack gap="$3">
        {/* Header row: default toggle + remove */}
        <XStack justifyContent="space-between" alignItems="center">
          <Controller
            control={control}
            name={`quantityOptions.${index}.isDefault`}
            render={({ field: { value } }) => (
              <TouchableOpacity onPress={onSetDefault}>
                <XStack alignItems="center" gap="$2">
                  <View
                    style={[
                      styles.radio,
                      value && styles.radioSelected,
                    ]}
                  >
                    {value && <View style={styles.radioInner} />}
                  </View>
                  <Text
                    fontSize={DesignTokens.typography.fontSize.sm}
                    fontWeight={DesignTokens.typography.fontWeight.semibold}
                    color={
                      value
                        ? DesignTokens.colors.orange[500]
                        : DesignTokens.colors.lightBrown[500]
                    }
                  >
                    Default
                  </Text>
                </XStack>
              </TouchableOpacity>
            )}
          />
          {!isOnly && (
            <TouchableOpacity onPress={onRemove}>
              <Trash2 size={18} color={DesignTokens.colors.semantic.error} />
            </TouchableOpacity>
          )}
        </XStack>

        {/* Quantity Type Selector */}
        <Controller
          control={control}
          name={`quantityOptions.${index}.quantityTypeId`}
          render={({ field: { onChange, value } }) => (
            <YStack gap="$1">
              <Text
                fontSize={DesignTokens.typography.fontSize.sm}
                fontWeight={DesignTokens.typography.fontWeight.semibold}
                color={DesignTokens.colors.brown[900]}
              >
                Quantity Type
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                {quantityTypes.map((qt) => (
                  <TouchableOpacity
                    key={qt.id}
                    onPress={() => onChange(qt.id)}
                  >
                    <XStack
                      paddingHorizontal="$3"
                      paddingVertical="$2"
                      borderRadius={DesignTokens.radius.full}
                      backgroundColor={
                        value === qt.id
                          ? DesignTokens.colors.orange[500]
                          : DesignTokens.colors.beige[200]
                      }
                    >
                      <Text
                        fontSize={DesignTokens.typography.fontSize.sm}
                        fontWeight={DesignTokens.typography.fontWeight.semibold}
                        color={
                          value === qt.id
                            ? DesignTokens.colors.neutral.white
                            : DesignTokens.colors.lightBrown[500]
                        }
                      >
                        {qt.displayName}
                      </Text>
                    </XStack>
                  </TouchableOpacity>
                ))}
              </XStack>
              {optionErrors?.quantityTypeId && (
                <Text
                  fontSize={DesignTokens.typography.fontSize.xs}
                  color={DesignTokens.colors.semantic.error}
                >
                  {optionErrors.quantityTypeId.message}
                </Text>
              )}
            </YStack>
          )}
        />

        {/* Value + Display Label */}
        <XStack gap="$3">
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name={`quantityOptions.${index}.value`}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Value"
                  placeholder="1"
                  keyboardType="decimal-pad"
                  value={value?.toString() ?? ''}
                  onChangeText={(t) => {
                    const n = parseFloat(t);
                    onChange(isNaN(n) ? 0 : n);
                  }}
                  error={optionErrors?.value?.message}
                />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name={`quantityOptions.${index}.displayLabel`}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Label"
                  placeholder="Full"
                  value={value}
                  onChangeText={onChange}
                  error={optionErrors?.displayLabel?.message}
                />
              )}
            />
          </View>
        </XStack>

        {/* Price */}
        <Controller
          control={control}
          name={`quantityOptions.${index}.price`}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Price"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={value?.toString() ?? ''}
              onChangeText={(t) => {
                const n = parseFloat(t);
                onChange(isNaN(n) ? 0 : n);
              }}
              error={optionErrors?.price?.message}
            />
          )}
        />
      </YStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: DesignTokens.colors.lightBrown[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: DesignTokens.colors.orange[500],
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: DesignTokens.colors.orange[500],
  },
});
