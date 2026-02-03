/**
 * LAN Hub Service
 * Story 4.1 - WebSocket Hub Server (POS)
 *
 * Since browsers cannot run WebSocket servers, this hub uses:
 * 1. BroadcastChannel API for same-origin tab communication
 * 2. Supabase Realtime for cross-device communication
 *
 * The POS acts as the hub by registering as is_hub=true and
 * relaying messages to all connected devices.
 */

import { supabase } from '@/lib/supabase';
import { useLanStore } from '@/stores/lanStore';
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

/**
 * Hub configuration
 */
interface IHubConfig {
  deviceId: string;
  deviceName: string;
  heartbeatInterval?: number; // ms, default 30000
  staleTimeout?: number; // ms, default 120000
}

/**
 * LAN Hub class
 * Manages device registration, message routing, and heartbeats
 */
class LanHub {
  private broadcastChannel: BroadcastChannel | null = null;
  private realtimeChannel: RealtimeChannel | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private staleCheckTimer: ReturnType<typeof setInterval> | null = null;
  private config: IHubConfig | null = null;
  private isRunning = false;
  private startTime: Date | null = null;

  /**
   * Start the hub
   */
  async start(config: IHubConfig): Promise<boolean> {
    if (this.isRunning) {
      console.log('[LanHub] Already running');
      return true;
    }

    this.config = {
      ...config,
      heartbeatInterval: config.heartbeatInterval || 30000,
      staleTimeout: config.staleTimeout || 120000,
    };

    try {
      // 1. Register as hub in database
      // Convert 'localhost' to '127.0.0.1' for PostgreSQL INET type compatibility
      const hostname = window.location.hostname;
      const ipAddress = hostname === 'localhost' ? '127.0.0.1' : hostname;

      const result = await registerLanNode(
        config.deviceId,
        'pos',
        ipAddress,
        8080, // Virtual port
        config.deviceName,
        true // is_hub
      );

      if (!result.success) {
        console.error('[LanHub] Failed to register:', result.error);
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
          console.log('[LanHub] Realtime channel status:', status);
          if (status === 'SUBSCRIBED') {
            useLanStore.getState().setConnectionStatus('connected');
          }
        });

      // 4. Start heartbeat timer
      this.heartbeatTimer = setInterval(() => {
        this.sendHubHeartbeat();
      }, this.config.heartbeatInterval);

      // 5. Start stale device check
      this.staleCheckTimer = setInterval(() => {
        useLanStore.getState().clearStaleDevices(this.config!.staleTimeout!);
      }, 60000);

      // Update store
      const store = useLanStore.getState();
      store.setIsHub(true);
      store.setDeviceInfo(config.deviceId, 'pos', config.deviceName);
      store.setConnectionStatus('connected');

      this.isRunning = true;
      this.startTime = new Date();

      console.log('[LanHub] Started successfully');
      return true;
    } catch (error) {
      console.error('[LanHub] Start error:', error);
      useLanStore.getState().setLastError('Failed to start hub');
      return false;
    }
  }

  /**
   * Stop the hub
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    // Clear timers
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.staleCheckTimer) {
      clearInterval(this.staleCheckTimer);
      this.staleCheckTimer = null;
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
    store.setIsHub(false);
    store.setConnectionStatus('disconnected');

    this.isRunning = false;
    this.startTime = null;

    console.log('[LanHub] Stopped');
  }

  /**
   * Broadcast a message to all connected devices
   */
  async broadcast<T>(type: TLanMessageType, payload: T): Promise<void> {
    if (!this.isRunning || !this.config) {
      console.warn('[LanHub] Cannot broadcast - hub not running');
      return;
    }

    const message = createMessage(type, this.config.deviceId, payload);

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
   * Send message to a specific device
   */
  async sendTo<T>(deviceId: string, type: TLanMessageType, payload: T): Promise<void> {
    if (!this.isRunning || !this.config) {
      console.warn('[LanHub] Cannot send - hub not running');
      return;
    }

    const message = createMessage(type, this.config.deviceId, payload, deviceId);

    // Send via both channels - device will filter by target
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(message);
    }

    if (this.realtimeChannel) {
      await this.realtimeChannel.send({
        type: 'broadcast',
        event: 'lan-message',
        payload: message,
      });
    }
  }

  /**
   * Handle message from BroadcastChannel
   */
  private handleBroadcastMessage(event: MessageEvent): void {
    const message = event.data as ILanMessage;
    this.processMessage(message, 'broadcast');
  }

  /**
   * Handle message from Supabase Realtime
   */
  private handleRealtimeMessage(message: ILanMessage): void {
    this.processMessage(message, 'realtime');
  }

  /**
   * Process incoming message
   */
  private processMessage(message: ILanMessage, source: 'broadcast' | 'realtime'): void {
    // Ignore own messages
    if (message.from === this.config?.deviceId) {
      return;
    }

    console.log(`[LanHub] Received ${message.type} from ${message.from} via ${source}`);

    switch (message.type) {
      case LAN_MESSAGE_TYPES.NODE_REGISTER:
        this.handleDeviceRegister(message);
        break;

      case LAN_MESSAGE_TYPES.HEARTBEAT:
        this.handleDeviceHeartbeat(message);
        break;

      case LAN_MESSAGE_TYPES.NODE_DEREGISTER:
        this.handleDeviceDeregister(message);
        break;

      default:
        // Relay message to appropriate handlers
        this.relayMessage(message);
    }
  }

  /**
   * Handle device registration
   */
  private handleDeviceRegister(message: ILanMessage): void {
    const store = useLanStore.getState();
    const payload = message.payload as { deviceName: string; deviceType: TDeviceType };

    store.addConnectedDevice({
      deviceId: message.from,
      deviceName: payload.deviceName || 'Unknown Device',
      deviceType: payload.deviceType || 'mobile',
      status: 'online',
      ipAddress: null,
      lastHeartbeat: message.timestamp,
      registeredAt: message.timestamp,
    });

    console.log(`[LanHub] Device registered: ${message.from}`);
  }

  /**
   * Handle device heartbeat
   */
  private handleDeviceHeartbeat(message: ILanMessage): void {
    useLanStore.getState().updateDeviceHeartbeat(message.from);
  }

  /**
   * Handle device deregistration
   */
  private async handleDeviceDeregister(message: ILanMessage): Promise<void> {
    const store = useLanStore.getState();
    const device = store.connectedDevices.find(d => d.deviceId === message.from);
    const deviceName = device?.deviceName || message.from;

    // Remove from store
    store.removeConnectedDevice(message.from);
    console.log(`[LanHub] Device deregistered: ${message.from}`);

    // Notify other devices about this disconnection (AC3 requirement)
    await this.broadcast(LAN_MESSAGE_TYPES.NODE_DEREGISTER, {
      deviceId: message.from,
      deviceName: deviceName,
      reason: 'deregistered',
    });
  }

  /**
   * Relay message to all devices (hub routing)
   */
  private relayMessage(_message: ILanMessage): void {
    // If message has a specific target, only that device handles it
    // Otherwise, all devices receive it
    // The relay is automatic through the channel subscriptions
  }

  /**
   * Send hub heartbeat
   */
  private async sendHubHeartbeat(): Promise<void> {
    if (!this.config) return;

    await sendHeartbeat(this.config.deviceId);

    // Broadcast heartbeat to devices
    await this.broadcast(LAN_MESSAGE_TYPES.HEARTBEAT, {
      deviceName: this.config.deviceName,
      deviceType: 'pos',
      status: 'active',
      uptime: this.getUptime(),
    });
  }

  /**
   * Get hub uptime in seconds
   */
  private getUptime(): number {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  }

  /**
   * Check if hub is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get hub status
   */
  getStatus(): {
    isRunning: boolean;
    uptime: number;
    connectedDevices: number;
    deviceId: string | null;
  } {
    return {
      isRunning: this.isRunning,
      uptime: this.getUptime(),
      connectedDevices: useLanStore.getState().connectedDevices.length,
      deviceId: this.config?.deviceId || null,
    };
  }
}

// Singleton instance
export const lanHub = new LanHub();
