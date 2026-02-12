# Forks TODO

- [ ] **1. Lazy Authentication — Defer Login Until Needed**

- **Priority**: High
- **Type**: UX Flow Change

**Problem**: Currently the app forces login/signup on the Home screen (`app/(tabs)/index.tsx:88-138`) before the user can do anything. The auth gate is in `checkUserStatus()` — if `@forks_user_created` is not `'true'`, it shows `LoginScreen` or `SetupScreen` immediately.

**Goal**: Allow guest browsing (scan QR, view menu, add to cart). Only require login when the user tries to:
- Place an order (`app/(tabs)/cart.tsx:139-143` — already checks for auth token)
- Access offers (`app/(tabs)/offers.tsx`)
- View order history (`app/(tabs)/order.tsx`)
- Access profile (`app/(tabs)/profile.tsx`)

**Files to modify**:
- `Forks/app/(tabs)/index.tsx` — Remove the auth gate from `checkUserStatus()` (lines 88-138). Let unauthenticated users through to the QR scanner and menu.
- `Forks/app/(tabs)/_layout.tsx` — No auth gate here currently (correct).
- `Forks/components/auth/LoginScreen.tsx` — Reuse as a modal/sheet that pops up when auth is required.
- `Forks/components/auth/SetupScreen.tsx` — Reuse as a modal/sheet for signup.
- `Forks/app/(tabs)/cart.tsx` — Already has a soft check at line 139. Enhance to show the login modal instead of just an Alert.
- `Forks/app/(tabs)/offers.tsx` — Add auth check; show login prompt if not authenticated.
- `Forks/hooks/useAuth.ts` — Currently exists but is **unused**. Wire it into the app as a centralized auth state provider, or create a new `AuthContext` that exposes a `requireAuth()` method to trigger the login modal from any screen.
- `Forks/utils/storage.ts` — `StorageService` already handles auth token and user data storage. No changes needed.

**Approach**: Create an `AuthGateModal` component that wraps `LoginScreen`/`SetupScreen` and can be triggered from anywhere via context. When a protected action is attempted, call `requireAuth()` which checks `StorageService.getAuthToken()` and shows the modal if null.

---

- [x] **2. Fix Price/Quantity Mismatch — Staff Dashboard Shows Wrong Price**

- **Priority**: Critical (Bug)
- **Type**: Bug Fix
- **Status**: Completed

**Problem**: When a customer selects a quantity option (e.g., "Quarter" at INR 100), the staff dashboard shows the "Full" price (e.g., INR 400). This is because the frontend does NOT send the `quantityOptionId` when placing an order — the backend defaults to the first/default quantity option.

**Root cause chain**:
1. `Forks/components/home/HomePage.tsx:161-176` — `handleAddToCartFromModal()` correctly calculates price from the selected quantity option and bakes it into `menuItem.price`, but does **not** store `quantityOptionId` in the cart item.
2. `Forks/utils/storage.ts:6-12` — `LocalCartItem` interface has `quantityOptionId` and `quantityLabel` fields, but `addToLocalCart()` (line 143) never populates them.
3. `Forks/app/(tabs)/cart.tsx:132-136` — Order submission sends only `{ menuItemId, quantity }` — no `quantityOptionId`.
4. `forks-fastify-api/src/routes/orders/index.ts:550-602` — Backend fetches default quantity option (`isDefault: true`) and uses its price, ignoring the customer's selection.

**Files to modify**:
- `Forks/components/home/HomePage.tsx` — Pass `quantityOptionId` to `StorageService.addToLocalCart()` at line ~182.
- `Forks/utils/storage.ts` — Update `addToLocalCart()` (line 143) to accept and store `quantityOptionId` and `quantityLabel`. Also update `addToLocalCart` to use a composite key of `menuItemId + quantityOptionId` for cart deduplication (line 145), so "Quarter Biryani" and "Full Biryani" are separate cart entries.
- `Forks/app/(tabs)/cart.tsx` — Include `quantityOptionId` in the order payload (line 132-136). Display the `quantityLabel` next to item name in the cart UI.
- `forks-fastify-api/src/routes/orders/index.ts` — At line ~567, prefer `item.quantityOptionId` if provided. Fall back to default only when missing. Validate the option belongs to the menu item.

**Verification**: After fix, order a "Quarter" item. Check that `OrderItem.quantityLabel` in the DB says "Quarter" (not "Full") and `OrderItem.basePrice` matches the quarter price. Confirm the staff dashboard (`app/(staff)/order-detail.tsx:125-130`) shows the correct price.

---

- [x] **3. Image Upload for Menu Items**

- **Priority**: Medium
- **Type**: Feature
- **Status**: Completed

**Problem**: The add-menu-item screen has a "Tap to add photo" placeholder (`Forks/app/(staff)/add-menu-item.tsx:137-183`) with no `onPress` handler. The backend upload endpoint is fully implemented.

**Backend (ready)**:
- `forks-fastify-api/src/utils/uploader.ts` — Handles file validation (5MB max, JPEG/PNG/WebP), Sharp processing (resize 1200x1200, WebP 80%), secure filename generation, stores in `/src/uploads`.
- `forks-fastify-api/src/routes/menu-items/index.ts` — `POST /api/menu-items/:id/upload-image` (lines 898-1014). Auth-protected (ADMIN/STAFF), deletes old image, returns updated menu item.

**Frontend (needs work)**:
- `Forks/app/(staff)/add-menu-item.tsx` — Add image picker and upload flow.
- `Forks/utils/imageUtils.ts` — `getFullImageUrl()` already converts relative paths to full URLs. Ready to use.

**Files to modify**:
- `Forks/app/(staff)/add-menu-item.tsx`:
  1. Add `expo-image-picker` import.
  2. Add image state: `const [selectedImage, setSelectedImage] = useState<string | null>(null)`.
  3. Wire `onPress` on the photo TouchableOpacity (line 146) to `ImagePicker.launchImageLibraryAsync()`.
  4. Show selected image preview in the placeholder area.
  5. After successful `StaffService.createMenuItem()`, call the upload endpoint with `FormData` containing the image.
- `Forks/services/staffService.ts` — Add `uploadMenuItemImage(menuItemId: string, imageUri: string)` method that POSTs multipart form data to `/api/menu-items/:id/upload-image`.

**Dependencies**: `expo-image-picker` — check if already installed, otherwise run `npx expo install expo-image-picker`.

---

- [ ] **4. Scan Another Restaurant QR Code**

- **Priority**: Low
- **Type**: Enhancement
- **Status**: Mostly Working

**Current state**: This feature already works. Users can trigger a new QR scan from the tab bar center button or bottom navigation. The flow (`app/(tabs)/index.tsx:58-79, 220-240`) clears current restaurant data, table info, order ID, and local cart, then reopens the QR scanner.

**What may need improvement**:
- `Forks/app/(tabs)/index.tsx:220-240` — When switching restaurants with items in the cart, the cart is silently cleared. Add a confirmation dialog: "You have X items in your cart. Switching restaurants will clear your cart. Continue?"
- `Forks/components/restaurant/QRScanner.tsx` — Currently functional. Supports 3 QR URL formats via `Forks/utils/api.ts:43-61`.

**Files to modify**:
- `Forks/app/(tabs)/index.tsx` — Add `Alert.alert()` confirmation before clearing cart at line ~236 when `localCart.length > 0`.

---

- [ ] **5. Notification for New Orders in Staff Dashboard**

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

- [ ] **6. Notification When Order Ready for Delivery**

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

- [ ] **7. Animation While Order Is Being Prepared**

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

- [ ] **8. Animation While Order Is Being Delivered**

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

- [ ] **9. Animation While Order Is Completed**

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

- [ ] **10. Add Menu Item — Complete Staff & Admin UI**

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

- [ ] **11. Migrate Order Update Socket to SSE (Server-Sent Events)**

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
