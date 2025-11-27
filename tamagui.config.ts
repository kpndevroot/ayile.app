import { createTamagui, createTokens } from '@tamagui/core';
import { config } from '@tamagui/config/v3';

/**
 * Color Palette Extracted from Design Images
 * 
 * Based on the provided screen designs:
 * - Orange: Primary accent color for buttons, active states, highlights
 * - Beige/Light Brown: Background colors for cards and screens
 * - Dark Brown: Primary text color for headings
 * - Light Brown: Secondary text color for descriptions
 * - Teal: Accent color for QR scanner
 * - White: Pure white for button text and cards
 * - Grey: Various shades for borders and inactive states
 * - Green: Success states for completed orders
 * - Charcoal: Dark background for QR scanner
 */

// Custom color tokens extracted from designs
const customColors = {
  // Orange - Primary accent color
  orange: {
    50: '#FFF7ED',   // Lightest orange tint
    100: '#FFEDD5',  // Very light orange
    200: '#FED7AA',  // Light orange
    300: '#FDBA74',  // Medium light orange
    400: '#FB923C',  // Medium orange
    500: '#F97316',  // Base orange (primary)
    600: '#EA580C',  // Darker orange
    700: '#C2410C',  // Dark orange
    800: '#9A3412',  // Very dark orange
    900: '#7C2D12',  // Darkest orange
    950: '#431407',  // Almost black orange
  },
  
  // Beige/Light Brown - Background colors
  beige: {
    50: '#FAF7F2',   // Lightest beige (main background)
    100: '#F5F1EB',  // Very light beige
    200: '#E8E0D6',  // Light beige (card backgrounds)
    300: '#D4C4B0',  // Medium light beige
    400: '#B8A089',  // Medium beige
    500: '#9C8568',  // Base beige
    600: '#7A6A52',  // Darker beige
    700: '#5D4F3F',  // Dark beige
    800: '#3D3529',  // Very dark beige
    900: '#2C2419',  // Darkest beige
  },
  
  // Dark Brown - Primary text colors
  brown: {
    50: '#F5F3F0',
    100: '#E8E3DC',
    200: '#D1C5B8',
    300: '#B8A694',
    400: '#9C8568',
    500: '#6B5D4F',  // Medium brown
    600: '#5D4F3F',  // Dark brown
    700: '#3D2817',  // Base dark brown (headings)
    800: '#2C1810',  // Darker brown
    900: '#1A0F08',  // Darkest brown (primary text)
  },
  
  // Light Brown - Secondary text colors
  lightBrown: {
    50: '#F9F7F4',
    100: '#F0EBE3',
    200: '#E0D4C4',
    300: '#C9B8A3',
    400: '#A68B6B',  // Base light brown (descriptions)
    500: '#8B7355',  // Medium light brown
    600: '#6B5D4F',  // Darker light brown
    700: '#5D4F3F',  // Dark light brown
    800: '#3D3529',  // Very dark light brown
    900: '#2C2419',  // Darkest light brown
  },
  
  // Teal - QR scanner accent
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',  // Base teal
    600: '#0D9488',  // Darker teal
    700: '#0F766E',  // Dark teal
    800: '#115E59',  // Very dark teal
    900: '#134E4A',  // Darkest teal
    950: '#042F2E',  // Almost black teal
  },
  
  // Charcoal - Dark backgrounds (QR scanner)
  charcoal: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#2C2C2C',  // Base charcoal (QR scanner background)
    900: '#1F1F1F',  // Darker charcoal
    950: '#0A0A0A',  // Almost black
  },
};

// Create custom tokens
const customTokens = createTokens({
  ...config.tokens,
  color: {
    ...config.tokens.color,
    // Orange scale
    orange1: customColors.orange[50],
    orange2: customColors.orange[100],
    orange3: customColors.orange[200],
    orange4: customColors.orange[300],
    orange5: customColors.orange[400],
    orange6: customColors.orange[500],
    orange7: customColors.orange[600],
    orange8: customColors.orange[700],
    orange9: customColors.orange[800],
    orange10: customColors.orange[900],
    orange11: customColors.orange[950],
    orange12: customColors.orange[950],
    
    // Beige scale
    beige1: customColors.beige[50],
    beige2: customColors.beige[100],
    beige3: customColors.beige[200],
    beige4: customColors.beige[300],
    beige5: customColors.beige[400],
    beige6: customColors.beige[500],
    beige7: customColors.beige[600],
    beige8: customColors.beige[700],
    beige9: customColors.beige[800],
    beige10: customColors.beige[900],
    beige11: customColors.beige[900],
    beige12: customColors.beige[900],
    
    // Brown scale
    brown1: customColors.brown[50],
    brown2: customColors.brown[100],
    brown3: customColors.brown[200],
    brown4: customColors.brown[300],
    brown5: customColors.brown[400],
    brown6: customColors.brown[500],
    brown7: customColors.brown[600],
    brown8: customColors.brown[700],
    brown9: customColors.brown[800],
    brown10: customColors.brown[900],
    brown11: customColors.brown[900],
    brown12: customColors.brown[900],
    
    // Light Brown scale
    lightBrown1: customColors.lightBrown[50],
    lightBrown2: customColors.lightBrown[100],
    lightBrown3: customColors.lightBrown[200],
    lightBrown4: customColors.lightBrown[300],
    lightBrown5: customColors.lightBrown[400],
    lightBrown6: customColors.lightBrown[500],
    lightBrown7: customColors.lightBrown[600],
    lightBrown8: customColors.lightBrown[700],
    lightBrown9: customColors.lightBrown[800],
    lightBrown10: customColors.lightBrown[900],
    lightBrown11: customColors.lightBrown[900],
    lightBrown12: customColors.lightBrown[900],
    
    // Teal scale
    teal1: customColors.teal[50],
    teal2: customColors.teal[100],
    teal3: customColors.teal[200],
    teal4: customColors.teal[300],
    teal5: customColors.teal[400],
    teal6: customColors.teal[500],
    teal7: customColors.teal[600],
    teal8: customColors.teal[700],
    teal9: customColors.teal[800],
    teal10: customColors.teal[900],
    teal11: customColors.teal[950],
    teal12: customColors.teal[950],
    
    // Charcoal scale
    charcoal1: customColors.charcoal[50],
    charcoal2: customColors.charcoal[100],
    charcoal3: customColors.charcoal[200],
    charcoal4: customColors.charcoal[300],
    charcoal5: customColors.charcoal[400],
    charcoal6: customColors.charcoal[500],
    charcoal7: customColors.charcoal[600],
    charcoal8: customColors.charcoal[700],
    charcoal9: customColors.charcoal[800],
    charcoal10: customColors.charcoal[900],
    charcoal11: customColors.charcoal[950],
    charcoal12: customColors.charcoal[950],
  },
});

// Create theme based on extracted design colors
const themes = {
  light: {
    ...config.themes.light,
    // Background colors
    background: customColors.beige[50],      // Main background (light beige)
    backgroundHover: customColors.beige[100],
    backgroundPress: customColors.beige[200],
    backgroundFocus: customColors.beige[100],
    
    // Card backgrounds
    backgroundCard: customColors.beige[200],  // Card background (light beige)
    backgroundCardHover: customColors.beige[300],
    
    // Text colors
    color: customColors.brown[900],           // Primary text (darkest brown)
    colorHover: customColors.brown[800],
    colorPress: customColors.brown[700],
    colorFocus: customColors.brown[800],
    
    // Secondary text
    colorSecondary: customColors.lightBrown[500], // Secondary text (light brown)
    colorTertiary: customColors.lightBrown[400],
    
    // Border colors
    borderColor: customColors.beige[300],
    borderColorHover: customColors.beige[400],
    borderColorPress: customColors.beige[500],
    borderColorFocus: customColors.orange[500],
    
    // Primary accent (Orange)
    primary: customColors.orange[500],        // Base orange
    primaryHover: customColors.orange[600],
    primaryPress: customColors.orange[700],
    primaryFocus: customColors.orange[400],
    
    // Success (Green)
    success: '#22C55E',                       // Green for success states
    successHover: '#16A34A',
    successPress: '#15803D',
    
    // Placeholder colors
    placeholderColor: customColors.lightBrown[400],
  },
  
  dark: {
    ...config.themes.dark,
    // Background colors
    background: customColors.charcoal[900],   // Dark background
    backgroundHover: customColors.charcoal[800],
    backgroundPress: customColors.charcoal[700],
    backgroundFocus: customColors.charcoal[800],
    
    // Card backgrounds
    backgroundCard: customColors.charcoal[800],
    backgroundCardHover: customColors.charcoal[700],
    
    // Text colors
    color: '#FFFFFF',                         // White text for dark mode
    colorHover: customColors.beige[100],
    colorPress: customColors.beige[200],
    colorFocus: customColors.beige[100],
    
    // Secondary text
    colorSecondary: customColors.beige[300],
    colorTertiary: customColors.beige[400],
    
    // Border colors
    borderColor: customColors.charcoal[700],
    borderColorHover: customColors.charcoal[600],
    borderColorPress: customColors.charcoal[500],
    borderColorFocus: customColors.orange[500],
    
    // Primary accent (Orange)
    primary: customColors.orange[500],
    primaryHover: customColors.orange[400],
    primaryPress: customColors.orange[600],
    primaryFocus: customColors.orange[400],
    
    // Success (Green)
    success: '#22C55E',
    successHover: '#16A34A',
    successPress: '#15803D',
    
    // Placeholder colors
    placeholderColor: customColors.beige[500],
  },
};

// Create Tamagui config with custom theme
const appConfig = createTamagui({
  ...config,
  tokens: customTokens,
  themes,
});

export default appConfig;

export type Conf = typeof appConfig;

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}
