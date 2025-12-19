# WebSocket Integration for Real-Time Order Updates

This document describes the WebSocket integration in the React Native app for real-time order status updates.

## Overview

The app now supports real-time order updates via WebSocket connections. When staff members update an order status, customers and other staff members see the changes instantly without needing to refresh.

## Architecture

### Components

1. **WebSocket Service** (`services/websocketService.ts`)
   - Singleton service managing WebSocket connections
   - Handles connection, reconnection, and message routing
   - Supports subscription to specific orders or restaurants
   - Automatic reconnection with exponential backoff

2. **Order Screen** (`app/(tabs)/order.tsx`)
   - Customer-facing order status screen
   - Subscribes to order updates when viewing an active order
   - Updates order status in real-time

3. **Staff Dashboard** (`app/(staff)/dashboard.tsx`)
   - Staff dashboard for managing orders
   - Subscribes to restaurant updates (receives all orders from their restaurant)
   - Automatically refreshes when new orders arrive or status changes

## Features

### Real-Time Updates
- **Order Creation**: Customers see new orders immediately
- **Status Changes**: Order status updates appear instantly for both customers and staff
- **Order Cancellation**: Cancelled orders are reflected immediately

### Automatic Reconnection
- Exponential backoff retry strategy
- Maximum 5 reconnection attempts
- Automatic resubscription to previous subscriptions

### Connection Management
- Ping/pong keep-alive (every 30 seconds)
- Graceful connection cleanup
- Connection state notifications

## Usage

### For Customers (Order Screen)

The order screen automatically:
1. Connects to WebSocket when the screen loads
2. Subscribes to the active order (if one exists)
3. Updates the order status in real-time when changes occur
4. Refreshes order history when updates are received

**No additional code needed** - it's already integrated!

### For Staff (Dashboard)

The staff dashboard automatically:
1. Connects to WebSocket when the screen loads
2. Subscribes to restaurant updates (receives all orders from their restaurant)
3. Refreshes the order list and metrics when updates are received

**No additional code needed** - it's already integrated!

### Manual Usage

If you need to use WebSocket in other screens:

```typescript
import { websocketService } from '@/services/websocketService';

// Connect
await websocketService.connect();

// Subscribe to an order
websocketService.subscribeToOrder(orderId);

// Subscribe to restaurant (staff only)
websocketService.subscribeToRestaurant(restaurantId);

// Listen for messages
const unsubscribe = websocketService.onMessage((message) => {
  if (message.type === 'order:updated') {
    const order = message.data;
    // Handle order update
  }
});

// Cleanup
unsubscribe();
```

## Message Types

### Received Messages

#### Order Created
```typescript
{
  type: 'order:created',
  data: Order,
  timestamp: string
}
```

#### Order Updated
```typescript
{
  type: 'order:updated',
  data: Order,
  timestamp: string
}
```

#### Connection Established
```typescript
{
  type: 'connected',
  message: string,
  user: {
    id: string,
    role: string,
    restaurantId?: string
  },
  timestamp: string
}
```

#### Subscription Confirmed
```typescript
{
  type: 'subscribed',
  orderId?: string,
  restaurantId?: string,
  timestamp: string
}
```

### Sent Messages

#### Subscribe to Order
```typescript
{
  type: 'subscribe',
  orderId: string
}
```

#### Subscribe to Restaurant
```typescript
{
  type: 'subscribe',
  restaurantId: string
}
```

#### Ping (Keep-alive)
```typescript
{
  type: 'ping'
}
```

## Backend Integration

The backend WebSocket server:
- Authenticates connections using JWT tokens
- Filters updates based on user roles:
  - **ADMIN**: Receives all updates
  - **STAFF**: Receives updates for their restaurant
  - **CUSTOMER**: Receives updates for their own orders
- Broadcasts updates when orders are created, updated, or cancelled

## Error Handling

The WebSocket service handles:
- Connection failures with automatic retry
- Authentication errors (connection closed)
- Invalid messages (logged, not propagated)
- Network interruptions (automatic reconnection)

## Performance

- **Connection Pooling**: Single WebSocket connection shared across screens
- **Efficient Updates**: Only relevant clients receive updates
- **Automatic Cleanup**: Connections cleaned up on screen unmount
- **Fallback Polling**: Still uses 30-second polling as backup

## Testing

To test WebSocket functionality:

1. **Customer View**:
   - Open the order screen with an active order
   - Have staff update the order status
   - Verify the status updates immediately

2. **Staff View**:
   - Open the staff dashboard
   - Have a customer place a new order
   - Verify the new order appears immediately
   - Update an order status
   - Verify the update is reflected immediately

## Troubleshooting

### Connection Issues

If WebSocket fails to connect:
1. Check authentication token is valid
2. Verify API_BASE_URL is correct
3. Check network connectivity
4. Review console logs for error messages

### Updates Not Appearing

If updates aren't appearing:
1. Verify WebSocket is connected (check console logs)
2. Confirm subscription is active
3. Check user role and permissions
4. Verify backend is broadcasting updates

### Reconnection Issues

If reconnection fails:
1. Check network stability
2. Verify authentication token hasn't expired
3. Review max reconnection attempts (default: 5)
4. Check backend WebSocket server status

## Future Enhancements

- [ ] WebSocket connection status indicator in UI
- [ ] Offline message queuing
- [ ] Compression for large payloads
- [ ] Connection metrics and monitoring
- [ ] Push notification integration
- [ ] Multi-device synchronization
