# Staff Screens

This directory contains all staff-facing screens for the restaurant management application.

## Screens Overview

### 1. Dashboard (`dashboard.tsx`)
- Main staff dashboard showing key metrics (Pending, Active, Complete orders, Revenue)
- Tab navigation for filtering orders (Pending, Active, History)
- Order cards with Accept/Reject actions for pending orders
- View Details button for completed orders

### 2. Add Menu Item (`add-menu-item.tsx`)
- Form for adding new menu items
- Photo upload section
- Basic information (name, description)
- Category selection
- Dietary information tags (VEG, NON-VEG, VEGAN, GLUTEN-FREE)
- Spicy level selector
- Pricing and prep time inputs
- Expandable options for quantity options, customizations, and modifiers

### 3. Kitchen Orders (`kitchen-orders.tsx`)
- Displays orders for kitchen staff
- Tab navigation (Pending, Preparing, All)
- Order cards with:
  - Order ID, location, and time
  - Status badges (urgent, pending, preparing)
  - Order items with modifications
  - Allergy alerts
  - Action buttons (Start Preparing, Mark Complete)

### 4. Order Detail (`order-detail.tsx`)
- Detailed view of a specific order
- Status progress bar showing order lifecycle
- Customer information card
- Order items with modifications
- Special instructions
- Pricing breakdown
- Update Status and Cancel Order actions
- Integrated with UpdateOrderStatusModal

### 5. Ready for Delivery (`ready-for-delivery.tsx`)
- Shows orders ready for delivery
- Tab navigation (Ready, Out for Delivery)
- Map View button
- Filter/sort options (Time, Distance, COD)
- Order cards with:
  - Customer information
  - Payment details (COD/Paid)
  - Delivery address with map link
  - Special instructions
  - Pick Up & Start Delivery button

### 6. Table Management (`table-management.tsx`)
- Lists all restaurant tables
- Table status (Active, Available)
- Seat count and current order information
- QR code generation and display modal
- Download and Print QR code options
- Add new table functionality

## Reusable Components

Located in `/components/staff/`:

### OrderCard
Reusable card component for displaying order information in delivery screens.

**Props:**
- `orderId`: Order identifier
- `timeAgo`: Time since order was placed
- `customerName`: Customer name
- `phoneNumber`: Customer phone (optional)
- `deliveryAddress`: Delivery address (optional)
- `paymentMethod`: 'COD' | 'PAID'
- `paymentAmount`: Payment amount string
- `itemsCount`: Number of items
- `estimatedDelivery`: Estimated delivery time (optional)
- `specialInstructions`: Special instructions (optional)
- `onCall`: Callback for phone action
- `onViewMap`: Callback for map view
- `onPickUp`: Callback for pick up action
- `showDeliveryActions`: Whether to show delivery action buttons

### StatusBadge
Badge component for displaying order status, urgency, and ETA.

**Props:**
- `type`: StatusBadgeType ('urgent' | 'pending' | 'preparing' | 'ready' | 'eta' | 'complete')
- `label`: Badge text
- `icon`: Optional custom icon

### KitchenOrderCard
Specialized card for kitchen orders with status and action buttons.

**Props:**
- `orderId`: Order identifier
- `location`: Table/delivery location
- `timeAgo`: Time since order
- `items`: Array of order items with modifications
- `status`: 'pending' | 'preparing'
- `urgency`: Optional 'urgent' flag
- `eta`: Estimated time (optional)
- `allergyAlert`: Allergy warning text (optional)
- `onStartPreparing`: Callback to start preparation
- `onMarkComplete`: Callback to mark as complete

### UpdateOrderStatusModal
Bottom sheet modal for updating order status.

**Props:**
- `visible`: Modal visibility
- `currentStatus`: Current order status
- `onClose`: Close callback
- `onUpdate`: Update callback with status and optional estimated time

### AddOptionModal
Modal for adding quantity options with pricing and nutrition information.

**Props:**
- `visible`: Modal visibility
- `onClose`: Close callback
- `onAdd`: Add callback with option data

## Navigation

All staff screens are organized under the `(staff)` route group using Expo Router's file-based routing:

```
app/(staff)/
  ├── _layout.tsx          # Staff navigation layout
  ├── dashboard.tsx        # Main dashboard
  ├── add-menu-item.tsx    # Add menu item form
  ├── kitchen-orders.tsx   # Kitchen order management
  ├── order-detail.tsx     # Order detail view
  ├── ready-for-delivery.tsx # Delivery management
  └── table-management.tsx  # Table management
```

## Styling

All screens use the design tokens from `/constants/design.ts`:
- Colors: Orange (primary), Beige (backgrounds), Brown (text), Teal (accents)
- Spacing: Consistent spacing scale (xs, sm, md, lg, xl, xxl)
- Typography: Font sizes and weights from design tokens
- Shadows: Card and component shadows

## Data Flow

Currently, screens use dummy data. To integrate with the API:

1. Replace dummy data with API calls using hooks or services
2. Update state management (consider using React Query or similar)
3. Add loading and error states
4. Implement form validation for input screens
5. Connect action buttons to API endpoints

## Future Enhancements

- Real-time order updates (WebSocket integration)
- Push notifications for new orders
- Image upload for menu items
- QR code generation library integration
- Map integration for delivery tracking
- Print functionality for receipts and QR codes
- Search and filter functionality
- Analytics and reporting screens
