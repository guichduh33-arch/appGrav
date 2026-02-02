/**
 * LAN Protocol Service
 * Story 1.5 - LAN Node Registry Tables
 *
 * Defines message types and protocols for LAN communication
 * between POS devices, mobile apps, displays, and KDS.
 */

import { supabase } from '@/lib/supabase';
import type { ILanNode, TSyncDeviceType, TLanNodeStatus } from '@/types/database';
import type { TKitchenStation } from '@/types/offline';

// Re-export device type for consumers
export type TDeviceType = TSyncDeviceType;

// ============================================
// Message Type Constants
// ============================================

/**
 * LAN Message Types for device communication
 */
export const LAN_MESSAGE_TYPES = {
  // Connection Management
  HEARTBEAT: 'heartbeat',
  NODE_REGISTER: 'node_register',
  NODE_DEREGISTER: 'node_deregister',
  HUB_ANNOUNCE: 'hub_announce',

  // Cart & Order Sync
  CART_UPDATE: 'cart_update',
  CART_CLEAR: 'cart_clear',
  ORDER_CREATE: 'order_create',
  ORDER_UPDATE: 'order_update',
  ORDER_COMPLETE: 'order_complete',

  // Display Sync
  DISPLAY_CART: 'display_cart',
  DISPLAY_TOTAL: 'display_total',
  DISPLAY_WELCOME: 'display_welcome',
  DISPLAY_ORDER_READY: 'display_order_ready',

  // Order Status
  ORDER_STATUS: 'order_status',
  ORDER_READY: 'order_ready',

  // KDS Sync
  KDS_NEW_ORDER: 'kds_new_order',
  KDS_ORDER_ACK: 'kds_order_ack',
  KDS_ORDER_READY: 'kds_order_ready',
  KDS_ORDER_BUMP: 'kds_order_bump',

  // KDS Item Status (Story 4.5)
  KDS_ITEM_PREPARING: 'kds_item_preparing',
  KDS_ITEM_READY: 'kds_item_ready',

  // Inventory & Stock
  STOCK_UPDATE: 'stock_update',
  LOW_STOCK_ALERT: 'low_stock_alert',

  // Sync Commands
  SYNC_REQUEST: 'sync_request',
  SYNC_RESPONSE: 'sync_response',
  FULL_SYNC: 'full_sync',
} as const;

export type TLanMessageType = (typeof LAN_MESSAGE_TYPES)[keyof typeof LAN_MESSAGE_TYPES];

// ============================================
// Message Interfaces
// ============================================

/**
 * Base message structure for all LAN messages
 */
export interface ILanMessage<T = unknown> {
  id: string;
  type: TLanMessageType;
  from: string;  // device_id
  to?: string;   // device_id or undefined for broadcast
  timestamp: string;
  payload: T;
}

/**
 * Heartbeat message payload
 */
export interface IHeartbeatPayload {
  device_type: TSyncDeviceType;
  status: TLanNodeStatus;
  ip_address: string;
  port: number;
}

/**
 * Cart update message payload
 */
export interface ICartUpdatePayload {
  cart_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    name: string;
  }>;
  total: number;
  customer_id?: string;
}

/**
 * Order sync message payload
 */
export interface IOrderSyncPayload {
  order_id: string;
  order_number: string;
  status: string;
  items: Array<{
    product_id: string;
    quantity: number;
    name: string;
  }>;
  table_number?: number;
}

/**
 * KDS Item Preparing payload (Story 4.5)
 * Sent when KDS marks items as "preparing"
 */
export interface IKdsItemPreparingPayload {
  order_id: string;
  order_number: string;
  item_ids: string[];
  station: TKitchenStation;
  timestamp: string;
}

/**
 * KDS Item Ready payload (Story 4.5)
 * Sent when KDS marks items as "ready"
 */
export interface IKdsItemReadyPayload {
  order_id: string;
  order_number: string;
  item_ids: string[];
  station: TKitchenStation;
  prepared_at: string;
  timestamp: string;
}

/**
 * Order Complete payload (Story 4.6)
 * Sent when all items in an order are ready and the order is auto-removed from KDS
 */
export interface IOrderCompletePayload {
  order_id: string;
  order_number: string;
  station: TKitchenStation;
  completed_at: string;
  timestamp: string;
}

// ============================================
// Node Registration Functions
// ============================================

/**
 * Register or update a LAN node
 */
export async function registerLanNode(
  deviceId: string,
  deviceType: TSyncDeviceType,
  ipAddress: string,
  port: number,
  deviceName?: string,
  isHub: boolean = false
): Promise<{ success: boolean; nodeId?: string; error?: string }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('register_lan_node', {
      p_device_id: deviceId,
      p_device_type: deviceType,
      p_device_name: deviceName || null,
      p_ip_address: ipAddress,
      p_port: port,
      p_is_hub: isHub,
    });

    if (error) {
      console.error('[lanProtocol] Registration error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, nodeId: data };
  } catch (err) {
    console.error('[lanProtocol] Unexpected error:', err);
    return { success: false, error: 'Failed to register node' };
  }
}

/**
 * Update node heartbeat
 */
export async function sendHeartbeat(deviceId: string): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc('update_lan_node_heartbeat', {
      p_device_id: deviceId,
    });

    return !error;
  } catch (err) {
    console.error('[lanProtocol] Heartbeat error:', err);
    return false;
  }
}

/**
 * Deregister a LAN node (mark as offline)
 */
export async function deregisterLanNode(deviceId: string): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('lan_nodes')
      .update({ status: 'offline' })
      .eq('device_id', deviceId);

    return !error;
  } catch (err) {
    console.error('[lanProtocol] Deregister error:', err);
    return false;
  }
}

// ============================================
// Node Discovery Functions
// ============================================

/**
 * Get all online LAN nodes
 */
export async function getOnlineNodes(): Promise<ILanNode[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('get_online_lan_nodes');

    if (error || !data) {
      return [];
    }

    return data as ILanNode[];
  } catch (err) {
    console.error('[lanProtocol] Get online nodes error:', err);
    return [];
  }
}

/**
 * Get the designated hub node
 */
export async function getHubNode(): Promise<ILanNode | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('get_lan_hub_node');

    if (error || !data || data.length === 0) {
      return null;
    }

    return data[0] as ILanNode;
  } catch (err) {
    console.error('[lanProtocol] Get hub node error:', err);
    return null;
  }
}

/**
 * Hub connection info for clients
 */
export interface IHubConnectionInfo {
  available: boolean;
  hubId: string | null;
  hubName: string | null;
  ipAddress: string | null;
  port: number | null;
  lastHeartbeat: string | null;
  realtimeChannel: string;
}

/**
 * Get connection info for the LAN hub
 * Used by KDS, Display, and Mobile clients to connect
 */
export async function getHubConnectionInfo(): Promise<IHubConnectionInfo> {
  const hubNode = await getHubNode();

  if (!hubNode) {
    return {
      available: false,
      hubId: null,
      hubName: null,
      ipAddress: null,
      port: null,
      lastHeartbeat: null,
      realtimeChannel: 'lan-hub',
    };
  }

  return {
    available: true,
    hubId: hubNode.device_id,
    hubName: hubNode.device_name,
    ipAddress: hubNode.ip_address,
    port: hubNode.port,
    lastHeartbeat: hubNode.last_heartbeat,
    realtimeChannel: 'lan-hub',
  };
}

/**
 * Get nodes by type
 */
export async function getNodesByType(deviceType: TSyncDeviceType): Promise<ILanNode[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('lan_nodes')
      .select('*')
      .eq('device_type', deviceType)
      .eq('status', 'online')
      .order('last_heartbeat', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as ILanNode[];
  } catch (err) {
    console.error('[lanProtocol] Get nodes by type error:', err);
    return [];
  }
}

/**
 * Mark stale nodes as offline
 */
export async function cleanupStaleNodes(timeoutSeconds: number = 60): Promise<number> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('mark_stale_lan_nodes_offline', {
      p_timeout_seconds: timeoutSeconds,
    });

    if (error) {
      return 0;
    }

    return data || 0;
  } catch (err) {
    console.error('[lanProtocol] Cleanup stale nodes error:', err);
    return 0;
  }
}

// ============================================
// Message Logging
// ============================================

/**
 * Log a LAN message for audit purposes
 */
export async function logMessage(
  messageType: TLanMessageType,
  fromDevice: string,
  toDevice?: string,
  payloadHash?: string,
  payloadSize?: number
): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('lan_messages_log')
      .insert({
        message_type: messageType,
        from_device: fromDevice,
        to_device: toDevice || null,
        payload_hash: payloadHash || null,
        payload_size: payloadSize || null,
        status: 'sent',
      });

    return !error;
  } catch (err) {
    console.error('[lanProtocol] Log message error:', err);
    return false;
  }
}

/**
 * Update message status (delivered, failed, timeout)
 */
export async function updateMessageStatus(
  messageId: string,
  status: 'delivered' | 'failed' | 'timeout',
  errorMessage?: string
): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('lan_messages_log')
      .update({
        status,
        error_message: errorMessage || null,
      })
      .eq('id', messageId);

    return !error;
  } catch (err) {
    console.error('[lanProtocol] Update message status error:', err);
    return false;
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Create a new message with generated ID and timestamp
 */
export function createMessage<T>(
  type: TLanMessageType,
  fromDevice: string,
  payload: T,
  toDevice?: string
): ILanMessage<T> {
  return {
    id: crypto.randomUUID(),
    type,
    from: fromDevice,
    to: toDevice,
    timestamp: new Date().toISOString(),
    payload,
  };
}

/**
 * Generate a hash of the payload for integrity verification
 */
export async function hashPayload(payload: unknown): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
