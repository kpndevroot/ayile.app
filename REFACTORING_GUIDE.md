# Refactoring Guide - SOLID Principles Implementation

This document outlines the refactoring structure following SOLID principles.

## Directory Structure

```
Ayile/
├── types/
│   └── index.ts              # TypeScript types and interfaces
├── constants/
│   ├── storage.ts            # Storage key constants
│   └── api.ts                # API endpoints and base URL
├── utils/
│   ├── api.ts                # API utility functions
│   └── storage.ts            # Storage service (AsyncStorage/SecureStore)
├── services/
│   └── authService.ts        # Authentication service
├── hooks/
│   ├── useAuth.ts            # Authentication hook
│   └── useOrders.ts          # Orders management hook
└── components/
    ├── auth/
    │   ├── LoginScreen.tsx   # Login component
    │   └── SetupScreen.tsx   # Signup component (TODO)
    ├── restaurant/
    │   ├── QRScanner.tsx      # QR code scanner (TODO)
    │   ├── RestaurantDetails.tsx  # Restaurant view (TODO)
    │   └── MenuItemCard.tsx   # Menu item card (TODO)
    ├── order/
    │   ├── OrderStatusScreen.tsx  # Order status view (TODO)
    │   └── OrderSummary.tsx      # Order summary component (TODO)
    └── home/
        └── HomePage.tsx      # Home page component (TODO)
```

## SOLID Principles Applied

### 1. Single Responsibility Principle (SRP)
- **Types**: Only type definitions
- **Constants**: Only constant values
- **Utils**: Only utility functions
- **Services**: Only business logic for specific domains
- **Hooks**: Only state management for specific concerns
- **Components**: Only UI rendering and user interaction

### 2. Open/Closed Principle (OCP)
- Components accept props for customization
- Services use interfaces for extensibility
- Hooks return configurable return values

### 3. Liskov Substitution Principle (LSP)
- Types define contracts that implementations must follow
- Interfaces ensure substitutability

### 4. Interface Segregation Principle (ISP)
- Small, focused interfaces
- Components only receive props they need
- Hooks return only relevant data

### 5. Dependency Inversion Principle (DIP)
- Components depend on hooks/services (abstractions)
- Services depend on utils/constants (abstractions)
- No direct dependencies on implementation details

## Implementation Status

### ✅ Completed
- [x] Types and interfaces (`types/index.ts`)
- [x] Constants (`constants/storage.ts`, `constants/api.ts`)
- [x] Utility functions (`utils/api.ts`, `utils/storage.ts`)
- [x] Auth service (`services/authService.ts`)
- [x] Custom hooks (`hooks/useAuth.ts`, `hooks/useOrders.ts`)
- [x] Login component (`components/auth/LoginScreen.tsx`)

### 🚧 TODO
- [ ] Setup/Signup component (`components/auth/SetupScreen.tsx`)
- [ ] QR Scanner component (`components/restaurant/QRScanner.tsx`)
- [ ] Restaurant Details component (`components/restaurant/RestaurantDetails.tsx`)
- [ ] Menu Item Card component (`components/restaurant/MenuItemCard.tsx`)
- [ ] Order Status Screen (`components/order/OrderStatusScreen.tsx`)
- [ ] Order Summary component (`components/order/OrderSummary.tsx`)
- [ ] Home Page component (`components/home/HomePage.tsx`)
- [ ] Refactor main `index.tsx` to use all new components

## Migration Steps

1. **Extract remaining components** from `app/(tabs)/index.tsx`
2. **Update imports** in main `index.tsx`
3. **Test each component** independently
4. **Remove old code** from original file
5. **Update any remaining dependencies**

## Benefits

1. **Maintainability**: Each file has a single, clear purpose
2. **Testability**: Components and services can be tested in isolation
3. **Reusability**: Components and hooks can be reused across the app
4. **Scalability**: Easy to add new features without modifying existing code
5. **Type Safety**: Strong typing throughout the application

## Example Usage

```typescript
// Using hooks
const { user, isAuthenticated, logout } = useAuth();
const { orderItems, placeOrder } = useOrders();

// Using services
const { user, token } = await AuthService.login({ phone, password });

// Using storage
await StorageService.setUserData(user);
const userData = await StorageService.getUserData();
```

