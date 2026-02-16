import { z } from 'zod';

export type DietaryType = 'VEG' | 'NON_VEG' | 'VEGAN' | 'GLUTEN_FREE';

const quantityOptionSchema = z.object({
  quantityTypeId: z.string().min(1, 'Quantity type is required'),
  value: z.number().positive('Value must be positive'),
  displayLabel: z.string().min(1, 'Display label is required'),
  price: z.number().positive('Price must be greater than 0'),
  isDefault: z.boolean(),
});

export const menuItemFormSchema = z
  .object({
    name: z.string().min(1, 'Item name is required'),
    description: z.string().optional(),
    categoryId: z.string().min(1, 'Category is required'),
    dietaryType: z.enum(['VEG', 'NON_VEG', 'VEGAN', 'GLUTEN_FREE'] as const),
    isSpicy: z.boolean(),
    spicyLevel: z.number().int().min(0).max(5),
    basePrice: z.number().positive('Price must be greater than 0'),
    prepTimeMinutes: z.number().int().positive('Prep time must be a positive number'),
    quantityOptions: z.array(quantityOptionSchema).min(1, 'At least one quantity option is required'),
  })
  .refine(
    (data) => {
      if (data.isSpicy && (data.spicyLevel < 1 || data.spicyLevel > 5)) {
        return false;
      }
      return true;
    },
    { message: 'Spicy level must be between 1 and 5 when item is spicy', path: ['spicyLevel'] }
  )
  .refine(
    (data) => {
      const defaults = data.quantityOptions.filter((opt) => opt.isDefault);
      return defaults.length === 1;
    },
    { message: 'Exactly one quantity option must be set as default', path: ['quantityOptions'] }
  );

export type MenuItemFormData = z.infer<typeof menuItemFormSchema>;
