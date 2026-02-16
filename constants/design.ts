/**
 * Modern Design System
 * Based on the reference UI design with clean, modern aesthetics
 */

/**
 * Design Tokens - Extracted from Screen Designs
 * 
 * Color palette, spacing, typography, and component patterns
 * directly extracted from the provided PNG screen designs
 */
export const DesignTokens = {
  // Colors - Extracted from design images
  colors: {
    // Orange - Primary accent color (buttons, active states, highlights)
    orange: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316',  // Base orange (primary)
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
      950: '#431407',
    },
    
    // Beige/Light Brown - Background colors (cards, screens)
    beige: {
      50: '#FAF7F2',   // Main background
      100: '#F5F1EB',  // Very light beige
      200: '#E8E0D6',  // Card backgrounds
      300: '#D4C4B0',
      400: '#B8A089',
      500: '#9C8568',
      600: '#7A6A52',
      700: '#5D4F3F',
      800: '#3D3529',
      900: '#2C2419',
    },
    
    // Dark Brown - Primary text colors (headings)
    brown: {
      50: '#F5F3F0',
      100: '#E8E3DC',
      200: '#D1C5B8',
      300: '#B8A694',
      400: '#9C8568',
      500: '#6B5D4F',
      600: '#5D4F3F',
      700: '#3D2817',  // Base dark brown (headings)
      800: '#2C1810',
      900: '#1A0F08',  // Darkest brown (primary text)
    },
    
    // Light Brown - Secondary text colors (descriptions)
    lightBrown: {
      50: '#F9F7F4',
      100: '#F0EBE3',
      200: '#E0D4C4',
      300: '#C9B8A3',
      400: '#A68B6B',  // Base light brown (descriptions)
      500: '#8B7355',
      600: '#6B5D4F',
      700: '#5D4F3F',
      800: '#3D3529',
      900: '#2C2419',
    },
    
    // Teal - QR scanner accent color
    teal: {
      50: '#F0FDFA',
      100: '#CCFBF1',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#14B8A6',  // Base teal
      600: '#0D9488',
      700: '#0F766E',
      800: '#115E59',
      900: '#134E4A',
      950: '#042F2E',
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
      950: '#0A0A0A',
    },

    white: {
      100: '#FDFDFD',
    },

    // Legacy color mappings for backward compatibility
    primary: {
      green: '#22C55E', // Success, delivery status
      orange: '#F97316', // Promotions, CTAs
      blue: '#3B82F6', // Primary actions
    },
    
    neutral: {
      white: '#FFFFFF',
      gray50: '#F9FAFB',
      gray100: '#F3F4F6',
      gray200: '#E5E7EB',
      gray300: '#D1D5DB',
      gray400: '#9CA3AF',
      gray500: '#6B7280',
      gray600: '#4B5563',
      gray700: '#374151',
      gray800: '#1F2937',
      gray900: '#111827',
      black: '#000000',
    },
    
    semantic: {
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    
    background: {
      light: '#FAF7F2',      // Main light background (beige)
      dark: '#1F1F1F',       // Dark background (charcoal)
      card: '#E8E0D6',       // Card background (light beige)
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
  },

  // Spacing - Consistent spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border Radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  // Typography
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },

  // Layout
  layout: {
    containerPadding: 16,
    cardPadding: 16,
    screenPadding: 20,
    maxWidth: 428, // Max width for larger screens
  },
} as const;

export type DesignTokensType = typeof DesignTokens;

