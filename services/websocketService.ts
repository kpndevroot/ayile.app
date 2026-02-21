import { API_BASE_URL } from '@/constants/api';
import { getAuthToken } from '@/utils/api';
import { Order } from '@/types';

export type WebSocketMessageType =
  | 'connected'
  | 'order:created'
  | 'order:updated'
  | 'order:deleted'
  | 'order:pickup_reminder'
  | 'subscribed'
  | 'unsubscribed'
  | 'pong'
  | 'error';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data?: any;
  message?: string;
  orderId?: string;
  restaurantId?: string;
  timestamp?: string;
  user?: {
    id: string;
    role: string;
    restaurantId?: string | null;
  };
}

type MessageHandler = (message: WebSocketMessage) => void;
type ConnectionStateHandler = (connected: boolean) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionStateHandlers: Set<ConnectionStateHandler> = new Set();
  private isConnecting = false;
  private isConnected = false;
  private subscribedOrders: Set<string> = new Set();
  private subscribedRestaurant: string | null = null;

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    // Prevent multiple concurrent connection attempts
    if (this.isConnecting || this.isConnected) {
      console.log('[WebSocket] Already connecting or connected, skipping');
      return;
    }

    // Clean up any existing connection first
    if (this.ws) {
      console.log('[WebSocket] Cleaning up existing connection');
      try {
        this.ws.close();
      } catch (e) {
        // Ignore errors during cleanup
      }
      this.ws = null;
    }

    try {
      this.isConnecting = true;
      const token = await getAuthToken();

      if (!token) {
        this.isConnecting = false;
        throw new Error('No authentication token available');
      }
      if (!API_BASE_URL) {
        console.log('No API base URL available', API_BASE_URL);
        this.isConnecting = false;
        throw new Error('No API base URL available');
      }

      // Convert http to ws
      const wsUrl = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
      const url = `${wsUrl}/api/orders/ws?token=${token}`;

      console.log('[WebSocket] Connecting to:', wsUrl + '/api/orders/ws');
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.notifyConnectionState(true);
        this.startPingInterval();

        // Resubscribe to previous subscriptions
        this.resubscribe();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = (event) => {
        console.log('[WebSocket] Closed', event.code, event.reason);

        // Clean up state
        this.isConnected = false;
        this.isConnecting = false;
        this.ws = null;

        this.notifyConnectionState(false);
        this.stopPingInterval();

        // Only attempt reconnect if not an authentication error
        // Code 1008 is used for authentication failures
        if (event.code === 1008) {
          console.error('[WebSocket] Authentication failed, not reconnecting');
          this.reconnectAttempts = this.maxReconnectAttempts; // Prevent further reconnects
        } else {
          this.attemptReconnect();
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.isConnecting = false;
      this.ws = null;
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPingInterval();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.subscribedOrders.clear();
    this.subscribedRestaurant = null;
    this.notifyConnectionState(false);
  }

  /**
   * Subscribe to order updates
   */
  subscribeToOrder(orderId: string): void {
    if (!this.isConnected || !this.ws) {
      // Store subscription for when we reconnect
      this.subscribedOrders.add(orderId);
      return;
    }

    this.subscribedOrders.add(orderId);
    this.send({
      type: 'subscribe',
      orderId,
    });
  }

  /**
   * Unsubscribe from order updates
   */
  unsubscribeFromOrder(orderId: string): void {
    this.subscribedOrders.delete(orderId);

    if (!this.isConnected || !this.ws) {
      return;
    }

    this.send({
      type: 'unsubscribe',
      orderId,
    });
  }

  /**
   * Subscribe to restaurant updates (for staff)
   */
  subscribeToRestaurant(restaurantId: string): void {
    if (!this.isConnected || !this.ws) {
      // Store subscription for when we reconnect
      this.subscribedRestaurant = restaurantId;
      return;
    }

    this.subscribedRestaurant = restaurantId;
    this.send({
      type: 'subscribe',
      restaurantId,
    });
  }

  /**
   * Add message handler
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Add connection state handler
   */
  onConnectionStateChange(handler: ConnectionStateHandler): () => void {
    this.connectionStateHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.connectionStateHandlers.delete(handler);
    };
  }

  /**
   * Get current connection state
   */
  getConnectionState(): boolean {
    return this.isConnected;
  }

  /**
   * Send message to server
   */
  private send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send message, not connected');
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: WebSocketMessage): void {
    // Handle ping/pong
    if (message.type === 'pong') {
      return;
    }

    // Notify all handlers
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('[WebSocket] Error in message handler:', error);
      }
    });
  }

  /**
   * Notify connection state change
   */
  private notifyConnectionState(connected: boolean): void {
    this.connectionStateHandlers.forEach((handler) => {
      try {
        handler(connected);
      } catch (error) {
        console.error('[WebSocket] Error in connection state handler:', error);
      }
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocket] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebSocket] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    this.stopPingInterval();

    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.send({ type: 'ping' });
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Resubscribe to previous subscriptions after reconnection
   */
  private resubscribe(): void {
    // Resubscribe to orders
    this.subscribedOrders.forEach((orderId) => {
      this.send({
        type: 'subscribe',
        orderId,
      });
    });

    // Resubscribe to restaurant
    if (this.subscribedRestaurant) {
      this.send({
        type: 'subscribe',
        restaurantId: this.subscribedRestaurant,
      });
    }
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
