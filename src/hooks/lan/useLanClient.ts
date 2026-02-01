/**
 * useLanClient Hook
 * Story 4.2 - KDS Socket.IO Client Connection
 *
 * React hook for managing LAN client connection with auto-connect,
 * status tracking, and cleanup handling.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { lanClient } from '@/services/lan/lanClient';
import { useLanStore, TLanConnectionStatus } from '@/stores/lanStore';
import type { TDeviceType } from '@/services/lan/lanProtocol';

interface IUseLanClientOptions {
  deviceType: TDeviceType;
  deviceName?: string;
  station?: string; // For KDS: 'kitchen' | 'barista' | 'display' | 'all'
  autoConnect?: boolean;
}

interface IUseLanClientResult {
  isConnected: boolean;
  connectionStatus: TLanConnectionStatus;
  reconnectAttempts: number;
  error: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
}

const DEVICE_ID_KEY = 'lan-device-id';

/**
 * Hook for managing LAN client connection
 * Uses the singleton lanClient service internally
 */
export function useLanClient(options: IUseLanClientOptions): IUseLanClientResult {
  const { autoConnect = true } = options;

  const [isConnected, setIsConnected] = useState(lanClient.isActive());
  const [localError, setLocalError] = useState<string | null>(null);
  const connectAttemptedRef = useRef(false);
  const optionsRef = useRef(options);

  // Keep options ref updated
  optionsRef.current = options;

  const {
    connectionStatus,
    reconnectAttempts,
    lastError,
  } = useLanStore();

  const connect = useCallback(async (): Promise<boolean> => {
    // Already connected
    if (lanClient.isActive()) {
      setIsConnected(true);
      setLocalError(null);
      return true;
    }

    try {
      // Get current options from ref to avoid stale closure
      const { deviceType, station, deviceName } = optionsRef.current;

      // Get or generate device ID (persisted in localStorage)
      let storedId: string | null = null;
      try {
        storedId = localStorage.getItem(DEVICE_ID_KEY);
      } catch {
        // localStorage not available (e.g., private browsing)
      }

      const deviceId = storedId || `${deviceType}-${crypto.randomUUID().slice(0, 8)}`;

      // Persist device ID if new
      if (!storedId) {
        try {
          localStorage.setItem(DEVICE_ID_KEY, deviceId);
        } catch {
          // localStorage not available
        }
      }

      // Build device name with station if KDS
      const fullName = station
        ? `${deviceName || 'KDS'} - ${station.charAt(0).toUpperCase() + station.slice(1)}`
        : deviceName || `${deviceType.toUpperCase()} Device`;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[useLanClient] Connecting as ${deviceType} with ID ${deviceId}`);
      }

      const success = await lanClient.connect({
        deviceId,
        deviceType,
        deviceName: fullName,
      });

      setIsConnected(success);

      if (!success) {
        setLocalError('Connection failed');
      } else {
        setLocalError(null);
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection error';
      setLocalError(errorMessage);
      setIsConnected(false);
      return false;
    }
  }, []); // No dependencies - uses optionsRef for current values

  const disconnect = useCallback(async () => {
    try {
      await lanClient.disconnect();
      setIsConnected(false);
      setLocalError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Disconnect error';
      setLocalError(errorMessage);
    }
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && !connectAttemptedRef.current) {
      connectAttemptedRef.current = true;
      connect();
    }
  }, [autoConnect, connect]);

  // Sync isConnected state when store connectionStatus changes
  useEffect(() => {
    // Update local state based on store status
    const active = lanClient.isActive();
    setIsConnected(active);
  }, [connectionStatus]);

  // Note: We deliberately don't disconnect on unmount
  // The connection should remain active as user navigates between pages

  return {
    isConnected,
    connectionStatus,
    reconnectAttempts,
    error: localError || lastError,
    connect,
    disconnect,
  };
}
