/**
 * LAN Client Service
 * Story 4.2 - WebSocket Client Connection
 *
 * Manages connection to the LAN hub for KDS, Display, and Mobile devices.
 * Uses BroadcastChannel for same-origin and Supabase Realtime for cross-device.
 */

import { supabase } from '@/lib/supabase';
import { useLanStore } from '@/stores/lanStore';
import logger from '@/utils/logger';
import {
  ILanMessage,
  TLanMessageType,
  LAN_MESSAGE_TYPES,
  createMessage,
  registerLanNode,
  sendHeartbeat,
  deregisterLanNode,
} from './lanProtocol';
import type { TDeviceType } from './lanProtocol';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { logError, logWarn } from '@/utils/logger'

/**
 * Client configuration
 */
interface IClientConfig {
  deviceId: string;
  deviceType: TDeviceType;
  deviceName: string;
  heartbeatInterval?: number; // ms, default 30000
  maxReconnectAttempts?: number; // default 10
  reconnectBackoffMs?: number; // base backoff, default 1000
}

/**
 * Message handler type
 */
type TMessageHandler<T = unknown> = (message: ILanMessage<T>) => void;

/**
 * LAN Client class
 * Connects to hub and handles message routing
 */
class LanClient {
  private broadcastChannel: BroadcastChannel | null = null;
  private realtimeChannel: RealtimeChannel | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private config: IClientConfig | null = null;
  private isConnected = false;
  private startTime: Date | null = null;

  // Message handlers by type
  private handlers: Map<TLanMessageType, Set<TMessageHandler>> = new Map();

  /**
   * Connect to the LAN hub
   */
  async connect(config: IClientConfig): Promise<boolean> {
    if (this.isConnected) {
      logger.debug('[LanClient] Already connected');
      return true;
    }

    this.config = {
      ...config,
      heartbeatInterval: config.heartbeatInterval || 30000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      reconnectBackoffMs: config.reconnectBackoffMs || 1000,
    };

    const store = useLanStore.getState();
    store.setConnectionStatus('connecting');

    try {
      // 1. Register in database
      const result = await registerLanNode(
        config.deviceId,
        config.deviceType,
        window.location.hostname,
        0, // No port for client
        config.deviceName,
        false // not a hub
      );

      if (!result.success) {
        logError('[LanClient] Failed to register:', result.error);
        store.setLastError(result.error || 'Registration failed');
        this.scheduleReconnect();
        return false;
      }

      // 2. Initialize BroadcastChannel for same-origin communication
      this.broadcastChannel = new BroadcastChannel('appgrav-lan');
      this.broadcastChannel.onmessage = this.handleBroadcastMessage.bind(this);

      // 3. Initialize Supabase Realtime for cross-device communication
      this.realtimeChannel = supabase
        .channel('lan-hub')
        .on('broadcast', { event: 'lan-message' }, (payload) => {
          this.handleRealtimeMessage(payload.payload as ILanMessage);
        })
        .subscribe((status) => {
          logger.debug('[LanClient] Realtime channel status:', status);
          if (status === 'SUBSCRIBED') {
            this.onConnected();
          } else if (status === 'CHANNEL_ERROR') {
            this.onDisconnected();
          }
        });

      // 4. Start heartbeat timer
      this.heartbeatTimer = setInterval(() => {
        this.sendClientHeartbeat();
      }, this.config.heartbeatInterval);

      // Update store
      store.setDeviceInfo(config.deviceId, config.deviceType, config.deviceName);

      logger.debug('[LanClient] Connecting...');
      return true;
    } catch (error) {
      logError('[LanClient] Connect error:', error);
      store.setLastError('Connection failed');
      this.scheduleReconnect();
      return false;
    }
  }

  /**
   * Disconnect from the LAN hub
   */
  async disconnect(): Promise<void> {
    // Clear timers
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Send deregister message
    if (this.isConnected && this.config) {
      await this.send(LAN_MESSAGE_TYPES.NODE_DEREGISTER, {});
    }

    // Close channels
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }

    if (this.realtimeChannel) {
      await supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }

    // Deregister from database
    if (this.config) {
      await deregisterLanNode(this.config.deviceId);
    }

    // Update store
    const store = useLanStore.getState();
    store.setConnectionStatus('disconnected');
    store.resetReconnectAttempts();

    this.isConnected = false;
    this.startTime = null;

    logger.debug('[LanClient] Disconnected');
  }

  /**
   * Send a message to the hub
   */
  async send<T>(type: TLanMessageType, payload: T, targetDeviceId?: string): Promise<void> {
    if (!this.isConnected || !this.config) {
      logWarn('[LanClient] Cannot send - not connected');
      useLanStore.getState().addPendingMessage(
        createMessage(type, this.config?.deviceId || '', payload, targetDeviceId)
      );
      return;
    }

    const message = createMessage(type, this.config.deviceId, payload, targetDeviceId);

    // Send via BroadcastChannel (same-origin tabs)
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(message);
    }

    // Send via Supabase Realtime (cross-device)
    if (this.realtimeChannel) {
      await this.realtimeChannel.send({
        type: 'broadcast',
        event: 'lan-message',
        payload: message,
      });
    }
  }

  /**
   * Register a message handler
   */
  on<T>(type: TLanMessageType, handler: TMessageHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler as TMessageHandler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler as TMessageHandler);
    };
  }

  /**
   * Remove a specific handler for a type, or all handlers if no handler provided
   */
  off<T>(type: TLanMessageType, handler?: TMessageHandler<T>): void {
    if (handler) {
      this.handlers.get(type)?.delete(handler as TMessageHandler);
    } else {
      this.handlers.delete(type);
    }
  }

  /**
   * Handle message from BroadcastChannel
   */
  private handleBroadcastMessage(event: MessageEvent): void {
    const message = event.data as ILanMessage;
    this.processMessage(message);
  }

  /**
   * Handle message from Supabase Realtime
   */
  private handleRealtimeMessage(message: ILanMessage): void {
    this.processMessage(message);
  }

  /**
   * Process incoming message
   */
  private processMessage(message: ILanMessage): void {
    // Ignore own messages
    if (message.from === this.config?.deviceId) {
      return;
    }

    // If message has target and it's not us, ignore
    if (message.to && message.to !== this.config?.deviceId) {
      return;
    }

    logger.debug(`[LanClient] Received ${message.type} from ${message.from}`);

    // Notify handlers
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }

    // Also notify generic handlers registered for all types
    const allHandlers = this.handlers.get('*' as TLanMessageType);
    if (allHandlers) {
      allHandlers.forEach(handler => handler(message));
    }
  }

  /**
   * Called when connected
   */
  private onConnected(): void {
    this.isConnected = true;
    this.startTime = new Date();

    const store = useLanStore.getState();
    store.setConnectionStatus('connected');
    store.resetReconnectAttempts();

    // Send registration message
    if (this.config) {
      this.send(LAN_MESSAGE_TYPES.NODE_REGISTER, {
        deviceName: this.config.deviceName,
        deviceType: this.config.deviceType,
      });
    }

    // Send any pending messages
    const pending = store.pendingMessages;
    if (pending.length > 0) {
      logger.debug(`[LanClient] Sending ${pending.length} pending messages`);
      store.clearPendingMessages();
      pending.forEach(msg => {
        this.send(msg.type, msg.payload, msg.to);
      });
    }

    logger.debug('[LanClient] Connected');
  }

  /**
   * Called when disconnected
   */
  private onDisconnected(): void {
    this.isConnected = false;
    useLanStore.getState().setConnectionStatus('disconnected');
    this.scheduleReconnect();
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (!this.config) return;

    const store = useLanStore.getState();
    const attempts = store.reconnectAttempts;

    if (attempts >= (this.config.maxReconnectAttempts || 10)) {
      logError('[LanClient] Max reconnect attempts reached');
      store.setConnectionStatus('error');
      store.setLastError('Max reconnect attempts reached');
      return;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 60s max
    const backoff = Math.min(
      (this.config.reconnectBackoffMs || 1000) * Math.pow(2, attempts),
      60000
    );

    logger.debug(`[LanClient] Reconnecting in ${backoff}ms (attempt ${attempts + 1})`);
    store.incrementReconnectAttempts();

    this.reconnectTimer = setTimeout(() => {
      this.reconnect();
    }, backoff);
  }

  /**
   * Attempt to reconnect
   */
  private async reconnect(): Promise<void> {
    if (!this.config) return;

    logger.debug('[LanClient] Attempting reconnect...');
    useLanStore.getState().setConnectionStatus('connecting');

    // Close existing channels
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }

    if (this.realtimeChannel) {
      await supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }

    // Try to connect again
    await this.connect(this.config);
  }

  /**
   * Send client heartbeat
   */
  private async sendClientHeartbeat(): Promise<void> {
    if (!this.config || !this.isConnected) return;

    await sendHeartbeat(this.config.deviceId);

    await this.send(LAN_MESSAGE_TYPES.HEARTBEAT, {
      deviceName: this.config.deviceName,
      deviceType: this.config.deviceType,
      status: 'active',
      uptime: this.getUptime(),
    });
  }

  /**
   * Get client uptime in seconds
   */
  private getUptime(): number {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  }

  /**
   * Check if client is connected
   */
  isActive(): boolean {
    return this.isConnected;
  }

  /**
   * Get client status
   */
  getStatus(): {
    isConnected: boolean;
    uptime: number;
    deviceId: string | null;
    reconnectAttempts: number;
  } {
    return {
      isConnected: this.isConnected,
      uptime: this.getUptime(),
      deviceId: this.config?.deviceId || null,
      reconnectAttempts: useLanStore.getState().reconnectAttempts,
    };
  }
}

// Singleton instance
export const lanClient = new LanClient();
