/**
 * useLanDevices Hook
 * Story 4.4 - Device Heartbeat & Discovery
 *
 * Provides access to connected LAN devices and their status.
 */

import { useCallback, useEffect, useState } from 'react';
import { useLanStore, type IConnectedDevice } from '../stores/lanStore';
import { getOnlineNodes, getHubNode, type TDeviceType } from '../services/lan/lanProtocol';
import type { ILanNode } from '../types/database';
import logger from '@/utils/logger';

/**
 * LAN device with online status
 */
export interface ILanDevice extends IConnectedDevice {
  isHub: boolean;
}

/**
 * Hook return type
 */
interface IUseLanDevicesReturn {
  /** List of connected devices */
  devices: ILanDevice[];
  /** Hub device if found */
  hubDevice: ILanDevice | null;
  /** Whether this device is the hub */
  isHub: boolean;
  /** Connection status */
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  /** Whether currently loading devices */
  isLoading: boolean;
  /** Refresh the device list */
  refresh: () => Promise<void>;
  /** Total connected device count */
  deviceCount: number;
}

/**
 * Hook for managing LAN connected devices
 *
 * Provides:
 * - List of connected devices from store and database
 * - Hub device information
 * - Auto-refresh every 30 seconds
 *
 * @example
 * ```tsx
 * function DeviceList() {
 *   const { devices, hubDevice, isLoading } = useLanDevices();
 *
 *   return (
 *     <ul>
 *       {devices.map(device => (
 *         <li key={device.deviceId}>
 *           {device.deviceName} - {device.status}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useLanDevices(): IUseLanDevicesReturn {
  const connectedDevices = useLanStore((state) => state.connectedDevices);
  const isHub = useLanStore((state) => state.isHub);
  const connectionStatus = useLanStore((state) => state.connectionStatus);

  const [dbDevices, setDbDevices] = useState<ILanNode[]>([]);
  const [hubNode, setHubNode] = useState<ILanNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Refresh devices from database
   */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nodes, hub] = await Promise.all([
        getOnlineNodes(),
        getHubNode(),
      ]);
      setDbDevices(nodes);
      setHubNode(hub);
    } catch (error) {
      logger.error('[useLanDevices] Error fetching devices:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and periodic refresh
  useEffect(() => {
    refresh();

    // Refresh every 30 seconds
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  /**
   * Merge store devices with database devices
   */
  const mergeDevices = useCallback((): ILanDevice[] => {
    // Start with store devices
    const devices: Map<string, ILanDevice> = new Map();

    // Add store devices
    connectedDevices.forEach((device) => {
      devices.set(device.deviceId, {
        ...device,
        isHub: false,
      });
    });

    // Merge/add database devices
    dbDevices.forEach((node) => {
      const existing = devices.get(node.device_id);
      // Cast ip_address from unknown to string | null
      const ipAddress = node.ip_address as string | null;
      if (existing) {
        // Update with database info
        devices.set(node.device_id, {
          ...existing,
          ipAddress,
          isHub: node.is_hub ?? false,
        });
      } else {
        // Add new device from database
        devices.set(node.device_id, {
          deviceId: node.device_id,
          deviceName: node.device_name || 'Unknown',
          deviceType: node.device_type as TDeviceType,
          status: node.status === 'online' ? 'online' : 'offline',
          ipAddress,
          lastHeartbeat: node.last_heartbeat ?? new Date().toISOString(),
          registeredAt: node.created_at ?? new Date().toISOString(),
          isHub: node.is_hub ?? false,
        });
      }
    });

    return Array.from(devices.values());
  }, [connectedDevices, dbDevices]);

  const devices = mergeDevices();
  const hubDevice = hubNode
    ? devices.find((d) => d.deviceId === hubNode.device_id) || null
    : null;

  return {
    devices,
    hubDevice,
    isHub,
    connectionStatus,
    isLoading,
    refresh,
    deviceCount: devices.length,
  };
}
