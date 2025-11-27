/**
 * Menu Categories - Single Source of Truth
 * Centralized category definitions for better maintainability and reusability
 */

export type MenuCategory = 
  | 'ALL'
  | 'APPETIZERS' 
  | 'MAINS' 
  | 'DESSERTS' 
  | 'BEVERAGES'
  | 'JUICE'
  | 'SOUPS' 
  | 'SALADS'
  | 'SIDES'
  | 'BREAKFAST'
  | 'LUNCH'
  | 'DINNER'
  | 'SNACKS'
  | 'PIZZA'
  | 'BURGER'
  | 'SANDWICH'
  | 'PASTA'
  | 'RICE'
  | 'BIRYANI'
  | 'CURRY'
  | 'BREAD'
  | 'SEAFOOD'
  | 'VEGETARIAN'
  | 'VEGAN'
  | 'GLUTEN_FREE';

/**
 * Primary categories displayed in the main navigation
 */
export const PRIMARY_CATEGORIES: MenuCategory[] = [
  'ALL',
  'APPETIZERS',
  'MAINS', 
  'DESSERTS',
  'BEVERAGES',
  'SOUPS',
  'SALADS'
];

/**
 * All available categories for comprehensive filtering
 */
export const ALL_CATEGORIES: MenuCategory[] = [
  'ALL',
  'APPETIZERS',
  'MAINS',
  'DESSERTS',
  'BEVERAGES',
  'JUICE',
  'SOUPS',
  'SALADS',
  'SIDES',
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACKS',
  'PIZZA',
  'BURGER',
  'SANDWICH',
  'PASTA',
  'RICE',
  'BIRYANI',
  'CURRY',
  'BREAD',
  'SEAFOOD',
  'VEGETARIAN',
  'VEGAN',
  'GLUTEN_FREE'
];

/**
 * Category display names for UI
 */
export const CATEGORY_LABELS: Record<MenuCategory, string> = {
  ALL: 'All Items',
  APPETIZERS: 'Appetizers',
  MAINS: 'Main Course',
  DESSERTS: 'Desserts',
  BEVERAGES: 'Beverages',
  JUICE: 'Juices',
  SOUPS: 'Soups',
  SALADS: 'Salads',
  SIDES: 'Sides',
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACKS: 'Snacks',
  PIZZA: 'Pizza',
  BURGER: 'Burgers',
  SANDWICH: 'Sandwiches',
  PASTA: 'Pasta',
  RICE: 'Rice Dishes',
  BIRYANI: 'Biryani',
  CURRY: 'Curries',
  BREAD: 'Breads',
  SEAFOOD: 'Seafood',
  VEGETARIAN: 'Vegetarian',
  VEGAN: 'Vegan',
  GLUTEN_FREE: 'Gluten Free'
};

/**
 * Category icons mapping for UI components
 */
export const CATEGORY_ICONS: Record<MenuCategory, string> = {
  ALL: 'restaurant',
  APPETIZERS: 'cookie',
  MAINS: 'restaurant-menu',
  DESSERTS: 'cake',
  BEVERAGES: 'local-cafe',
  JUICE: 'local-drink',
  SOUPS: 'soup-kitchen',
  SALADS: 'eco',
  SIDES: 'fastfood',
  BREAKFAST: 'free-breakfast',
  LUNCH: 'lunch-dining',
  DINNER: 'dinner-dining',
  SNACKS: 'cookie',
  PIZZA: 'local-pizza',
  BURGER: 'lunch-dining',
  SANDWICH: 'lunch-dining',
  PASTA: 'restaurant',
  RICE: 'rice-bowl',
  BIRYANI: 'rice-bowl',
  CURRY: 'restaurant',
  BREAD: 'bakery-dining',
  SEAFOOD: 'set-meal',
  VEGETARIAN: 'eco',
  VEGAN: 'eco',
  GLUTEN_FREE: 'health-and-safety'
};

/**
 * Utility function to get category display name
 */
export const getCategoryLabel = (category: MenuCategory): string => {
  return CATEGORY_LABELS[category] || category;
};

/**
 * Utility function to get category icon
 */
export const getCategoryIcon = (category: MenuCategory): string => {
  return CATEGORY_ICONS[category] || 'restaurant';
};

/**
 * Utility function to check if category matches item category
 * Handles the "ALL" category to show all items
 */
export const doesCategoryMatch = (selectedCategory: MenuCategory, itemCategory: string): boolean => {
  if (selectedCategory === 'ALL') {
    return true; // Show all items when "ALL" is selected
  }
  
  // Normalize categories for comparison (uppercase, handle variations)
  const normalizedSelected = selectedCategory.toUpperCase();
  const normalizedItem = itemCategory.toUpperCase();
  
  // Direct match
  if (normalizedSelected === normalizedItem) {
    return true;
  }
  
  // Handle category variations and aliases
  const categoryAliases: Record<string, string[]> = {
    'BEVERAGES': ['DRINKS', 'BEVERAGE', 'JUICE'],
    'MAINS': ['MAIN', 'ENTREE', 'MAIN_COURSE'],
    'APPETIZERS': ['APPETIZER', 'STARTER', 'STARTERS'],
    'DESSERTS': ['DESSERT', 'SWEET', 'SWEETS'],
    'SIDES': ['SIDE', 'ACCOMPANIMENT'],
    'SNACKS': ['SNACK'],
  };
  
  // Check if item category matches any alias of selected category
  const aliases = categoryAliases[normalizedSelected] || [];
  return aliases.includes(normalizedItem);
};

/**
 * Utility function to filter menu items by category
 */
export const filterItemsByCategory = <T extends { category: string }>(
  items: T[], 
  category: MenuCategory
): T[] => {
  return items.filter(item => doesCategoryMatch(category, item.category));
};
