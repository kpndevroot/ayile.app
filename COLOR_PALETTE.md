# Color Palette Documentation

## Overview
This document describes the color palette extracted from the provided screen design images. The colors have been integrated into the Tamagui theme configuration for consistent use across the application.

## Color Palette Extraction

### 1. Orange (Primary Accent)
**Usage:** Buttons, active tabs, highlights, CTAs, promotional elements

- `orange50`: `#FFF7ED` - Lightest orange tint
- `orange100`: `#FFEDD5` - Very light orange
- `orange200`: `#FED7AA` - Light orange
- `orange300`: `#FDBA74` - Medium light orange
- `orange400`: `#FB923C` - Medium orange
- `orange500`: `#F97316` - **Base orange (primary)** ⭐
- `orange600`: `#EA580C` - Darker orange
- `orange700`: `#C2410C` - Dark orange
- `orange800`: `#9A3412` - Very dark orange
- `orange900`: `#7C2D12` - Darkest orange
- `orange950`: `#431407` - Almost black orange

**Design Context:**
- Used for primary action buttons (Log In, Place Order, Add to Cart)
- Active tab indicators (Login tab underline)
- Promotional banners and CTAs
- Quantity selector buttons
- Cart badge indicators

### 2. Beige/Light Brown (Backgrounds)
**Usage:** Screen backgrounds, card backgrounds, subtle UI elements

- `beige50`: `#FAF7F2` - **Main background** ⭐
- `beige100`: `#F5F1EB` - Very light beige
- `beige200`: `#E8E0D6` - **Card backgrounds** ⭐
- `beige300`: `#D4C4B0` - Medium light beige
- `beige400`: `#B8A089` - Medium beige
- `beige500`: `#9C8568` - Base beige
- `beige600`: `#7A6A52` - Darker beige
- `beige700`: `#5D4F3F` - Dark beige
- `beige800`: `#3D3529` - Very dark beige
- `beige900`: `#2C2419` - Darkest beige

**Design Context:**
- Main screen background color
- Card and container backgrounds
- Order status timeline inactive states
- Subtle dividers and borders

### 3. Dark Brown (Primary Text)
**Usage:** Headings, primary text, important labels

- `brown50`: `#F5F3F0` - Lightest brown
- `brown100`: `#E8E3DC` - Very light brown
- `brown200`: `#D1C5B8` - Light brown
- `brown300`: `#B8A694` - Medium light brown
- `brown400`: `#9C8568` - Medium brown
- `brown500`: `#6B5D4F` - Medium brown
- `brown600`: `#5D4F3F` - Dark brown
- `brown700`: `#3D2817` - **Base dark brown (headings)** ⭐
- `brown800`: `#2C1810` - Darker brown
- `brown900`: `#1A0F08` - **Darkest brown (primary text)** ⭐

**Design Context:**
- Main headings ("Welcome Back!", "Your Order", "Order #H1234")
- Primary text content
- Navigation labels
- Important information text

### 4. Light Brown (Secondary Text)
**Usage:** Descriptions, secondary information, inactive text

- `lightBrown50`: `#F9F7F4` - Lightest light brown
- `lightBrown100`: `#F0EBE3` - Very light brown
- `lightBrown200`: `#E0D4C4` - Light brown
- `lightBrown300`: `#C9B8A3` - Medium light brown
- `lightBrown400`: `#A68B6B` - **Base light brown (descriptions)** ⭐
- `lightBrown500`: `#8B7355` - Medium light brown
- `lightBrown600`: `#6B5D4F` - Darker light brown
- `lightBrown700`: `#5D4F3F` - Dark light brown
- `lightBrown800`: `#3D3529` - Very dark light brown
- `lightBrown900`: `#2C2419` - Darkest light brown

**Design Context:**
- Descriptive text ("Log in or create an account to start ordering")
- Secondary information
- Placeholder text
- Inactive tab labels
- Order status descriptions

### 5. Teal (QR Scanner Accent)
**Usage:** QR scanner corner brackets, special accents

- `teal50`: `#F0FDFA` - Lightest teal
- `teal100`: `#CCFBF1` - Very light teal
- `teal200`: `#99F6E4` - Light teal
- `teal300`: `#5EEAD4` - Medium light teal
- `teal400`: `#2DD4BF` - Medium teal
- `teal500`: `#14B8A6` - **Base teal** ⭐
- `teal600`: `#0D9488` - Darker teal
- `teal700`: `#0F766E` - Dark teal
- `teal800`: `#115E59` - Very dark teal
- `teal900`: `#134E4A` - Darkest teal
- `teal950`: `#042F2E` - Almost black teal

**Design Context:**
- QR code scanner corner brackets
- Special accent elements
- Alternative action buttons

### 6. Charcoal (Dark Backgrounds)
**Usage:** QR scanner background, dark mode elements

- `charcoal50`: `#F9FAFB` - Lightest charcoal
- `charcoal100`: `#F3F4F6` - Very light charcoal
- `charcoal200`: `#E5E7EB` - Light charcoal
- `charcoal300`: `#D1D5DB` - Medium light charcoal
- `charcoal400`: `#9CA3AF` - Medium charcoal
- `charcoal500`: `#6B7280` - Base charcoal
- `charcoal600`: `#4B5563` - Darker charcoal
- `charcoal700`: `#374151` - Dark charcoal
- `charcoal800`: `#2C2C2C` - **Base charcoal (QR scanner background)** ⭐
- `charcoal900`: `#1F1F1F` - **Darker charcoal** ⭐
- `charcoal950`: `#0A0A0A` - Almost black

**Design Context:**
- QR scanner screen background
- Dark mode backgrounds
- Overlay backgrounds

### 7. Semantic Colors

#### Success (Green)
- `#22C55E` - Completed order status, success states

#### White
- `#FFFFFF` - Button text, card backgrounds, pure white elements

#### Grey Scale
- Standard grey scale for borders, inactive states, and neutral elements

## Usage in Tamagui

The color palette is available in Tamagui through the following token system:

### Light Theme
```tsx
// Backgrounds
backgroundColor="$beige1"      // Main background
backgroundColor="$beige2"      // Card background

// Text
color="$brown9"               // Primary text
color="$lightBrown5"          // Secondary text

// Primary accent
backgroundColor="$orange6"    // Primary buttons
color="white"                 // Button text

// Borders
borderColor="$beige3"         // Card borders
```

### Dark Theme
```tsx
// Backgrounds
backgroundColor="$charcoal9"  // Main background
backgroundColor="$charcoal8"   // Card background

// Text
color="white"                 // Primary text
color="$beige3"               // Secondary text

// Primary accent
backgroundColor="$orange6"    // Primary buttons
```

## Component-Specific Color Usage

### Login Screen
- Background: `beige50` (#FAF7F2)
- Primary text: `brown900` (#1A0F08)
- Secondary text: `lightBrown400` (#A68B6B)
- Active tab: `orange500` (#F97316)
- Button: `orange500` (#F97316)
- Button text: `white` (#FFFFFF)

### Restaurant Menu Screen
- Background: `beige50` (#FAF7F2)
- Card background: `beige200` (#E8E0D6)
- Primary text: `brown900` (#1A0F08)
- Secondary text: `lightBrown500` (#8B7355)
- Active category: `orange500` (#F97316)
- Add button: `orange500` (#F97316)
- Cart badge: `orange500` (#F97316)

### Order Status Screen
- Background: `beige50` (#FAF7F2)
- Card background: `beige200` (#E8E0D6)
- Primary text: `brown900` (#1A0F08)
- Active status: `orange500` (#F97316)
- Completed status: `green` (#22C55E)
- Inactive status: `beige300` (#D4C4B0)

### QR Scanner Screen
- Background: `charcoal900` (#1F1F1F)
- Text: `white` (#FFFFFF)
- Scanner corners: `teal500` (#14B8A6)
- Flashlight button: `charcoal800` (#2C2C2C)

### Cart/Order Screen
- Background: `beige50` (#FAF7F2)
- Card background: `white` (#FFFFFF)
- Primary text: `brown900` (#1A0F08)
- Secondary text: `lightBrown500` (#8B7355)
- Total text: `orange500` (#F97316)
- Place order button: `teal500` (#14B8A6) or `orange500` (#F97316)

## Spacing System

Based on the designs, consistent spacing is used:
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `xxl`: 48px

## Typography Scale

Font sizes extracted from designs:
- `xs`: 12px - Small labels
- `sm`: 14px - Secondary text
- `md`: 16px - Body text
- `lg`: 18px - Subheadings
- `xl`: 20px - Headings
- `2xl`: 24px - Large headings
- `3xl`: 30px - Extra large headings
- `4xl`: 36px - Hero text

Font weights:
- `regular`: 400 - Body text
- `medium`: 500 - Medium emphasis
- `semibold`: 600 - Subheadings
- `bold`: 700 - Headings

## Notes

- All colors are extracted directly from the provided screen design images
- The color palette maintains consistency across all screens
- Orange is the primary accent color used throughout the application
- Beige provides a warm, neutral background that complements the orange accent
- Dark brown ensures excellent readability for primary text
- Light brown provides subtle contrast for secondary information

