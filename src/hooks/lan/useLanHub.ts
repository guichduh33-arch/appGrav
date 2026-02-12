/**
 * useLanHub Hook
 * Story 4.1 - LAN Hub lifecycle management for POS
 *
 * Provides React integration for the LAN hub service,
 * managing automatic startup, cleanup, and status monitoring.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { lanHub } from '@/services/lan/lanHub';
import { useLanStore } from '@/stores/lanStore';
import { generateUUID } from '@/lib/utils';
import logger from '@/utils/logger';
import { logError } from '@/utils/logger'

/**
 * Hook configuration options
 */
export interface IUseLanHubOptions {
  /**
   * Human-readable name for this device
   * @default 'Caisse Principale'
   */
  deviceName?: string;

  /**
   * Whether to start the hub automatically on mount
   * @default false
   */
  autoStart?: boolean;

  /**
   * Interval between heartbeat messages (ms)
   * @default 30000 (30 seconds)
   */
  heartbeatInterval?: number;

  /**
   * Time after which a device with no heartbeat is considered stale (ms)
   * @default 120000 (2 minutes)
   */
  staleTimeout?: number;
}

/**
 * Hook return value
 */
export interface IUseLanHubResult {
  /**
   * Whether the hub is currently running
   */
  isRunning: boolean;

  /**
   * Current hub status
   */
  status: {
    uptime: number;
    connectedDevices: number;
    deviceId: string | null;
  };

  /**
   * Start the LAN hub
   * @returns Promise resolving to success status
   */
  start: () => Promise<boolean>;

  /**
   * Stop the LAN hub
   */
  stop: () => Promise<void>;

  /**
   * Last error message, if any
   */
  error: string | null;

  /**
   * List of connected devices
   */
  connectedDevices: {
    deviceId: string;
    deviceName: string;
    deviceType: string;
    status: string;
  }[];
}

/**
 * Generate a unique device ID for this POS
 */
function generateDeviceId(): string {
  // Check for persisted ID first
  const store = useLanStore.getState();
  if (store.deviceId && store.deviceType === 'pos') {
    return store.deviceId;
  }

  // Generate new ID using utility with fallback
  return `pos-${generateUUID().slice(0, 8)}`;
}

/**
 * Hook for managing the LAN hub lifecycle
 *
 * @example
 * ```tsx
 * function POSPage() {
 *   const { isRunning, status, start, error } = useLanHub({
 *     deviceName: 'Caisse Principale',
 *     autoStart: true,
 *   });
 *
 *   return (
 *     <div>
 *       <span>Hub: {isRunning ? 'Active' : 'Inactive'}</span>
 *       <span>Devices: {status.connectedDevices}</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useLanHub(options: IUseLanHubOptions = {}): IUseLanHubResult {
  const {
    deviceName = 'Caisse Principale',
    autoStart = false,
    heartbeatInterval = 30000,
    staleTimeout = 120000,
  } = options;

  const [isRunning, setIsRunning] = useState(lanHub.isActive());
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(lanHub.getStatus());

  const { connectedDevices, lastError } = useLanStore();

  // Track if auto-start has been attempted
  const autoStartAttempted = useRef(false);

  /**
   * Start the hub
   */
  const start = useCallback(async (): Promise<boolean> => {
    if (lanHub.isActive()) {
      setIsRunning(true);
      return true;
    }

    try {
      setError(null);
      const deviceId = generateDeviceId();

      logger.debug('[useLanHub] Starting hub with device ID:', deviceId);

      const success = await lanHub.start({
        deviceId,
        deviceName,
        heartbeatInterval,
        staleTimeout,
      });

      setIsRunning(success);
      setStatus(lanHub.getStatus());

      if (!success) {
        setError('Failed to start LAN hub');
        logError('[useLanHub] Failed to start hub');
      } else {
        logger.debug('[useLanHub] Hub started successfully');
      }

      return success;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error starting hub';
      setError(msg);
      logError('[useLanHub] Start error:', err);
      return false;
    }
  }, [deviceName, heartbeatInterval, staleTimeout]);

  /**
   * Stop the hub
   */
  const stop = useCallback(async (): Promise<void> => {
    logger.debug('[useLanHub] Stopping hub');
    await lanHub.stop();
    setIsRunning(false);
    setStatus(lanHub.getStatus());
  }, []);

  // Auto-start if enabled (only once)
  useEffect(() => {
    if (autoStart && !autoStartAttempted.current && !lanHub.isActive()) {
      autoStartAttempted.current = true;
      start();
    }
  }, [autoStart, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (lanHub.isActive()) {
        logger.debug('[useLanHub] Cleanup: stopping hub on unmount');
        lanHub.stop();
      }
    };
  }, []);

  // Update status and sync running state periodically (combined to avoid redundant intervals)
  useEffect(() => {
    const updateState = () => {
      const active = lanHub.isActive();
      if (active !== isRunning) {
        setIsRunning(active);
      }
      setStatus(lanHub.getStatus());
    };

    // Check immediately
    updateState();

    // Then check every 5 seconds (sufficient for status monitoring)
    const interval = setInterval(updateState, 5000);

    return () => clearInterval(interval);
  }, [isRunning]);

  return {
    isRunning,
    status,
    start,
    stop,
    error: error || lastError,
    connectedDevices: connectedDevices.map((d) => ({
      deviceId: d.deviceId,
      deviceName: d.deviceName,
      deviceType: d.deviceType,
      status: d.status,
    })),
  };
}
