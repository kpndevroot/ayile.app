# Forks TODO


- [x] **1. Notification for New Orders in Staff Dashboard**

- **Priority**: High
- **Type**: Feature

**Problem**: When a new order arrives, the staff dashboard silently refreshes data via WebSocket (`app/(staff)/dashboard.tsx:48-103`). There is no audio/haptic/visual alert to grab staff attention.

**Current WebSocket flow**: The dashboard subscribes to restaurant updates. On `order:created` message, it calls `loadData()` to silently refresh. No notification infrastructure exists (`expo-notifications` is NOT installed).

**Files to modify**:
- `package.json` — Add `expo-notifications` dependency: `npx expo install expo-notifications`.
- `Forks/app/(staff)/dashboard.tsx` — In the WebSocket `order:created` handler (line ~75):
  1. Play a notification sound (use `expo-av` or `expo-notifications`).
  2. Trigger haptic feedback via `expo-haptics` (already in dependencies).
  3. Show an in-app banner/toast: "New Order #ORD-xxx from Table Y".
  4. Optionally flash/pulse the "Pending" metrics card.
- `Forks/app/_layout.tsx` — Register for push notification permissions and set up notification channel on app start (for background notifications).
- `forks-fastify-api/src/routes/orders/index.ts` — The WebSocket broadcast at line 694 already sends `order:created`. For push notifications when app is backgrounded, add a push notification trigger (requires Expo push service or Firebase Cloud Messaging integration).

**Suggested approach**: Start with in-app alerts (sound + haptic + banner) since the staff app is usually in the foreground. Add push notifications as a follow-up.

---

- [x] **2. Notification When Order Ready for Delivery**

- **Priority**: High
- **Type**: Feature

**Problem**: When kitchen marks an order as READY, the customer should be notified. Currently the order screen (`app/(tabs)/order.tsx:248-319`) listens for `order:updated` via WebSocket and updates the UI, but there is no alert/sound/push notification.

**Files to modify**:
- `Forks/app/(tabs)/order.tsx` — In the WebSocket `order:updated` handler (line ~270):
  1. Check if `updatedOrder.status === 'READY'`.
  2. Show in-app alert: "Your order is ready for pickup!"
  3. Trigger haptic feedback (`expo-haptics`).
  4. Play a notification sound.
- `Forks/components/order/OrderStatusScreen.tsx` — Add a visual celebration effect when status transitions to READY (e.g., pulse animation on the "Ready" step, green highlight).
- For background notifications: Same as TODO #5 — requires `expo-notifications` + push notification backend.

**Also consider notifying staff** when order transitions to READY via `Forks/app/(staff)/ready-for-delivery.tsx` — add a similar alert.

---

- [x] **3. Animation While Order Is Being Prepared**

- **Priority**: Medium
- **Type**: UI Enhancement

**Current state**: The order status screen (`Forks/components/order/OrderStatusScreen.tsx`) shows a static progress tracker with 4 steps (Order Placed, Preparing, Ready, Served). Active steps are orange circles, inactive are beige. No animation.

**Available animation libraries**:
- `react-native-reanimated` v4.1.1 (installed)
- React Native `Animated` API (used in `CustomTabBar.tsx` and `order.tsx`)
- `@tamagui/animations-react-native` (installed via Tamagui)

**Files to modify**:
- `Forks/components/order/OrderStatusScreen.tsx`:
  1. Add a pulsing/breathing animation on the active "Preparing" step circle using `Animated.loop(Animated.sequence([...]))` or Reanimated `withRepeat(withTiming(...))`.
  2. Add a cooking/chef animation — either a custom Reanimated animation or consider installing `lottie-react-native` for a Lottie JSON animation of a chef cooking.
  3. Animate the progress line between steps (fill animation from left to right).
  4. Add a shimmer/loading effect on the estimated time display.

**Approach**: Use Reanimated for performance. Create a `PulsingDot` component with `useSharedValue` + `useAnimatedStyle` for the breathing effect. For the progress line, animate `width` from 0% to 100% with `withTiming`.

---

- [x] **4. Animation While Order Is Being Delivered**

- **Priority**: Medium
- **Type**: UI Enhancement

**Current state**: Same static progress tracker. When status is `OUT_FOR_DELIVERY` or `READY`, no delivery-specific animation exists.

**Files to modify**:
- `Forks/components/order/OrderStatusScreen.tsx`:
  1. When status is READY/OUT_FOR_DELIVERY, show a delivery-themed animation (e.g., a moving bike/waiter icon along the progress line).
  2. Animate the step transition from "Ready" to "Served" with a slide effect.
  3. Add a subtle bouncing animation on the delivery icon.
  4. Consider a countdown/timer animation for estimated delivery time.

**Approach**: Use Reanimated `withRepeat(withSequence(withTiming(...)))` for the bouncing delivery icon. Translate X position along the progress bar to simulate movement.

---

- [x] **5. Animation While Order Is Completed**

- **Priority**: Medium
- **Type**: UI Enhancement

**Current state**: When order reaches DELIVERED status, the `OrderStatusScreen` shows a static checkmark icon and "Delivered" text. No celebration effect.

**Files to modify**:
- `Forks/components/order/OrderStatusScreen.tsx`:
  1. Add a celebration animation when status transitions to DELIVERED — confetti burst, checkmark scale-in with bounce, or a Lottie success animation.
  2. Animate all 4 progress steps turning green/orange in sequence (cascade fill effect).
  3. Show a brief "Order Complete!" overlay with fade-in/fade-out.
- `Forks/app/(tabs)/order.tsx` — Detect the DELIVERED transition in the WebSocket handler and trigger the animation + haptic feedback.

**Approach**: For confetti, consider `react-native-confetti-cannon` or build a simple particle effect with Reanimated. For the checkmark, use `withSpring` for a satisfying bounce-in effect. For the cascade, stagger `withDelay` on each step circle.

---

- [ ] **6. Add Menu Item — Complete Staff & Admin UI**

- **Priority**: Medium
- **Type**: Feature Enhancement
- **Status**: Partially Done

**Current state**: The add-menu-item screen (`Forks/app/(staff)/add-menu-item.tsx`) has a form with basic fields (name, description, category, dietary type, spicy level, price, prep time). However, expandable sections for quantity options, customizations, and modifiers are UI placeholders with no implementation.

**What works**:
- Basic form fields and validation.
- Category selection from API.
- `StaffService.createMenuItem()` (`Forks/services/staffService.ts:606-657`) creates the item with a default "Full" quantity option.

**What needs implementation**:
- `Forks/app/(staff)/add-menu-item.tsx`:
  1. **Quantity Options section** — Allow staff to add multiple quantity options (Quarter/Half/Full) with individual prices. Use `StaffService.getQuantityTypes()` to load available types. Each option needs: quantity type selector, price input, toggle for default/recommended.
  2. **Customizations section** — Allow adding customization groups (e.g., "Spice Level") with options (e.g., "Mild", "Medium", "Hot") and price modifiers.
  3. **Image upload** — See TODO #3.
- `Forks/services/staffService.ts` — The `createMenuItem` method (line 606) already sends `quantityOptions` array. Ensure the form builds this array correctly from the UI inputs.
- Backend already supports all of this via `POST /api/menu-items` — the Prisma schema has `QuantityOption`, `ItemCustomization`, and `CustomizationOption` models ready.

---

- [ ] **7. Migrate Order Update Socket to SSE (Server-Sent Events)**

- **Priority**: Low
- **Type**: Architecture Change

**Current state**: Real-time updates use WebSocket via `@fastify/websocket`.
- Frontend: `Forks/services/websocketService.ts` — Singleton client with auto-reconnect, heartbeat, subscription management.
- Backend: `forks-fastify-api/src/utils/websocket-manager.ts` — Tracks clients, role-based broadcasting.
- Backend routes: `forks-fastify-api/src/routes/orders/index.ts:28-178` — WS endpoint at `/api/orders/ws`.

**Why SSE**: The communication is mostly server→client (order status updates). The only client→server messages are `subscribe`/`unsubscribe`/`ping`. SSE is simpler, uses standard HTTP, has built-in reconnection, and works better with load balancers/proxies.

**Files to modify**:

**Backend**:
- `forks-fastify-api/src/routes/orders/index.ts` — Replace the WebSocket route (`/api/orders/ws`) with an SSE endpoint (e.g., `GET /api/orders/stream`). Use Fastify reply streaming: `reply.raw.write()` with `Content-Type: text/event-stream`.
- `forks-fastify-api/src/utils/websocket-manager.ts` — Refactor to `SSEManager`. Instead of WebSocket connections, track `ServerResponse` objects. Broadcast via `res.write(`data: ${JSON.stringify(payload)}\n\n`)`.
- Add REST endpoints for subscribe/unsubscribe since SSE is one-directional:
  - `POST /api/orders/subscribe` — Register interest in specific order/restaurant.
  - `POST /api/orders/unsubscribe` — Deregister.
- Or simpler: use query params on the SSE endpoint: `GET /api/orders/stream?restaurantId=xxx` or `GET /api/orders/stream?orderId=xxx`.

**Frontend**:
- `Forks/services/websocketService.ts` — Replace with `sseService.ts`. Use `EventSource` API (or `react-native-sse` polyfill since React Native doesn't have native EventSource). Subscribe via URL query params.
- `Forks/app/(staff)/dashboard.tsx` — Update WebSocket references to SSE service.
- `Forks/app/(tabs)/order.tsx` — Update WebSocket references to SSE service.

**Consideration**: React Native does not have a built-in `EventSource`. You'll need `react-native-sse` or a fetch-based SSE polyfill. Evaluate if the simplification is worth the migration effort.
