# Ayile TODO


[] time is not updating in order screen also the estimated time not updating while 
resturant staff update

[] the order screen not exit while order is delivered check the active order only show the active order not delivered remove the order status while order is delivered


- also order more placed then new order screen not open in order screen


[] snoozing option for staff notification


- [ ] **1. Migrate Order Update Socket to SSE (Server-Sent Events)**

- **Priority**: Low
- **Type**: Architecture Change

**Current state**: Real-time updates use WebSocket via `@fastify/websocket`.
- Frontend: `Ayile/services/websocketService.ts` — Singleton client with auto-reconnect, heartbeat, subscription management.
- Backend: `ayile-fastify-api/src/utils/websocket-manager.ts` — Tracks clients, role-based broadcasting.
- Backend routes: `ayile-fastify-api/src/routes/orders/index.ts:28-178` — WS endpoint at `/api/orders/ws`.

**Why SSE**: The communication is mostly server→client (order status updates). The only client→server messages are `subscribe`/`unsubscribe`/`ping`. SSE is simpler, uses standard HTTP, has built-in reconnection, and works better with load balancers/proxies.

**Files to modify**:

**Backend**:
- `ayile-fastify-api/src/routes/orders/index.ts` — Replace the WebSocket route (`/api/orders/ws`) with an SSE endpoint (e.g., `GET /api/orders/stream`). Use Fastify reply streaming: `reply.raw.write()` with `Content-Type: text/event-stream`.
- `ayile-fastify-api/src/utils/websocket-manager.ts` — Refactor to `SSEManager`. Instead of WebSocket connections, track `ServerResponse` objects. Broadcast via `res.write(`data: ${JSON.stringify(payload)}\n\n`)`.
- Add REST endpoints for subscribe/unsubscribe since SSE is one-directional:
  - `POST /api/orders/subscribe` — Register interest in specific order/restaurant.
  - `POST /api/orders/unsubscribe` — Deregister.
- Or simpler: use query params on the SSE endpoint: `GET /api/orders/stream?restaurantId=xxx` or `GET /api/orders/stream?orderId=xxx`.

**Frontend**:
- `Ayile/services/websocketService.ts` — Replace with `sseService.ts`. Use `EventSource` API (or `react-native-sse` polyfill since React Native doesn't have native EventSource). Subscribe via URL query params.
- `Ayile/app/(staff)/dashboard.tsx` — Update WebSocket references to SSE service.
- `Ayile/app/(tabs)/order.tsx` — Update WebSocket references to SSE service.

**Consideration**: React Native does not have a built-in `EventSource`. You'll need `react-native-sse` or a fetch-based SSE polyfill. Evaluate if the simplification is worth the migration effort.


## [ ] 2. Plan the iOS Compatibility of the App

---

## Quick Wins — Small Changes, Big Impact

---

### 🔒 Security

---

### ⚡ Performance

---

### 🧹 Developer Experience & Maintainability

---

- [ ] **10. Clean Up console.log Statements Across Services**

- **Priority**: Medium
- **Estimated Effort**: Small
- **Impact**: 30+ `console.log` calls clutter device logs, slow down debugging, and may leak sensitive data. Replacing them with a structured logger or removing them improves signal-to-noise in debug output.

**Current problem**: `staffService.ts` has 8+ debug logs, `websocketService.ts` has 6+, `authService.ts` logs credentials, `dashboard.tsx` logs connection events. Staff screens have placeholder `console.log('Print')`, `console.log('Call')`, etc.

**Suggested approach**:
1. Create `Forks/utils/logger.ts` with dev-only logging:
   ```ts
   export const logger = {
     debug: (__DEV__ ? console.log : () => {}),
     warn: console.warn,
     error: console.error,
   };
   ```
2. Replace all `console.log` with `logger.debug` (or remove entirely for stubs).
3. Replace stub `console.log('Print')` / `console.log('Call')` with `Alert.alert('Coming soon')`.

---

- [ ] **11. Replace Stub Event Handlers with User-Facing Feedback**

- **Priority**: Medium
- **Estimated Effort**: Small
- **Impact**: Several staff actions silently log to console with no user feedback, making the app feel broken. Users tap "Print", "Download QR", "Call", "View Map" and nothing happens.

**Current problem**: `ready-for-delivery.tsx:320-321` (`onCall`, `onViewMap`), `table-management.tsx:96,279,306` (`Add Table`, `Download QR`, `Print QR`), `order-detail.tsx:192` (`Print`) are all `console.log` stubs.

**Suggested approach**:
1. Replace each stub with `Alert.alert('Coming Soon', 'This feature is under development.')`.
2. Or implement the action if straightforward (e.g., `Linking.openURL('tel:${phone}')` for Call).

---

- [ ] **12. Type the Restaurant Data in StorageService**

- **Priority**: Low
- **Estimated Effort**: Small
- **Impact**: `StorageService.getRestaurantData()` returns `Promise<any>` and `setRestaurantData(restaurant: any)` accepts `any`. This loses all TypeScript safety downstream and is a silent source of bugs.

**Suggested approach**:
1. Create a `Restaurant` type in `Forks/types/index.ts` (or use the existing one).
2. Update `getRestaurantData(): Promise<Restaurant | null>` and `setRestaurantData(restaurant: Restaurant)`.

---

### 🎨 UI/UX

---

- [ ] **13. Add an Error Boundary Component**

- **Priority**: High
- **Estimated Effort**: Small
- **Impact**: Currently the app has zero error boundaries. An unhandled JS error in any component crashes the entire app with a blank screen. An error boundary shows a friendly "Something went wrong" screen with a retry button.

**Suggested approach**:
1. Expo Router exports `ErrorBoundary` — export a custom one from each route file:
   ```tsx
   export { ErrorBoundary } from 'expo-router';
   ```
2. Or create a custom `ErrorBoundary` component in `Forks/components/ui/ErrorBoundary.tsx` using React class component `componentDidCatch`.
3. Style it to match the app's design system with a retry button and support message.

---

- [ ] **14. Add Skeleton Loading Screens**

- **Priority**: Medium
- **Estimated Effort**: Medium
- **Impact**: Currently the menu, order history, and dashboard show blank white screens during data fetching. Skeleton screens reduce perceived load time by ~40% (Google UX research) and prevent layout shift.

**Suggested approach**:
1. Create a `SkeletonLoader` component in `Forks/components/ui/SkeletonLoader.tsx` using a shimmer animation from Reanimated.
2. Use it in `MenuScreen`, `OrderHistoryScreen`, `StaffDashboard` where `isLoading` states exist.
3. Match the skeleton shapes to the actual card layouts for a seamless transition.

---

- [ ] **15. Add Pull-to-Refresh on Customer Menu Screen**

- **Priority**: Medium
- **Estimated Effort**: Small
- **Impact**: Customers have no way to refresh menu data after initial load. If the menu changes (new items, price updates), users are stuck with stale data until they restart the app.

**Suggested approach**:
1. Add `refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}` to the menu `ScrollView`/`FlatList`.
2. Wire `onRefresh` to re-fetch menu items from the API.
3. Apply the same pattern to order history and cart screens.

---

### 🏗️ Scalability & Architecture

---

- [ ] **16. Add Request Timeout and Retry Logic to API Client**

- **Priority**: Medium
- **Estimated Effort**: Small
- **Impact**: The `authenticatedFetch` utility in `Forks/utils/api.ts` has no timeout. On slow/flaky networks, requests hang indefinitely with no user feedback. Adding a timeout + 1 retry improves reliability significantly.

**Suggested approach**:
1. Add `AbortController` with a 15s timeout to `authenticatedFetch`:
   ```ts
   const controller = new AbortController();
   const timeout = setTimeout(() => controller.abort(), 15000);
   ```
2. Add a single retry on network errors (not on 4xx/5xx).
3. Surface timeout errors as user-friendly messages.

---

- [ ] **17. Add Prisma Connection Health Check**

- **Priority**: Low
- **Estimated Effort**: Small
- **Impact**: The `/health` endpoint returns `{ status: 'ok' }` without actually checking database connectivity. Deployment monitoring tools would report the API as healthy even if the DB is unreachable.

**Suggested approach**:
1. Update the `/health` endpoint to run `prisma.$queryRaw('SELECT 1')` and return DB status.
2. Add a try/catch to return `503` if the DB is unreachable.
3. Include uptime and memory stats for operational visibility.

---

- [ ] **18. Add JWT Token Refresh/Expiration Handling**

- **Priority**: Medium
- **Estimated Effort**: Medium
- **Impact**: If the JWT expires while the user is mid-session, all API requests silently fail with 401. The user sees cryptic errors instead of being prompted to re-login. This is the most common support complaint pattern.

**Suggested approach**:
1. In `authenticatedFetch`, check for 401 responses.
2. On 401: clear stored token, dispatch an event to `AuthContext` to show the login modal.
3. Optionally implement token refresh if the backend supports refresh tokens.