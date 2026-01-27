/**
 * LAN Store
 * Story 4.2 - WebSocket Client Connection
 * Story 4.4 - Device Heartbeat & Discovery
 *
 * Manages LAN network state including connected devices,
 * connection status, and message handling.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TDeviceType, ILanMessage } from '../services/lan/lanProtocol';

/**
 * Connected device information
 */
export interface IConnectedDevice {
  deviceId: string;
  deviceName: string;
  deviceType: TDeviceType;
  status: 'online' | 'idle' | 'offline';
  ipAddress: string | null;
  lastHeartbeat: string;
  registeredAt: string;
}

/**
 * LAN connection status
 */
export type TLanConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * LAN store state
 */
interface ILanState {
  // Connection state
  connectionStatus: TLanConnectionStatus;
  isHub: boolean;
  hubAddress: string | null;

  // This device info
  deviceId: string | null;
  deviceType: TDeviceType | null;
  deviceName: string;

  // Connected devices (when acting as hub)
  connectedDevices: IConnectedDevice[];

  // Message queue
  pendingMessages: ILanMessage[];
  lastMessageSeq: number;

  // Error state
  lastError: string | null;
  reconnectAttempts: number;

  // Actions
  setConnectionStatus: (status: TLanConnectionStatus) => void;
  setIsHub: (isHub: boolean) => void;
  setHubAddress: (address: string | null) => void;
  setDeviceInfo: (id: string, type: TDeviceType, name: string) => void;

  addConnectedDevice: (device: IConnectedDevice) => void;
  updateDeviceStatus: (deviceId: string, status: 'online' | 'idle' | 'offline') => void;
  updateDeviceHeartbeat: (deviceId: string) => void;
  removeConnectedDevice: (deviceId: string) => void;
  clearStaleDevices: (timeoutMs: number) => void;

  addPendingMessage: (message: ILanMessage) => void;
  clearPendingMessages: () => void;

  setLastError: (error: string | null) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;

  reset: () => void;
}

/**
 * Default device name based on type
 */
function getDefaultDeviceName(type: TDeviceType): string {
  switch (type) {
    case 'pos': return 'Caisse Principale';
    case 'kds': return 'Écran Cuisine';
    case 'display': return 'Affichage Client';
    case 'mobile': return 'Terminal Mobile';
    default: return 'Appareil';
  }
}

/**
 * Initial state
 */
const initialState = {
  connectionStatus: 'disconnected' as TLanConnectionStatus,
  isHub: false,
  hubAddress: null,
  deviceId: null,
  deviceType: null,
  deviceName: 'Appareil',
  connectedDevices: [],
  pendingMessages: [],
  lastMessageSeq: 0,
  lastError: null,
  reconnectAttempts: 0,
};

/**
 * LAN Store
 * Persists device info and hub settings
 */
export const useLanStore = create<ILanState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setConnectionStatus: (status) => {
        set({ connectionStatus: status });
        if (status === 'connected') {
          set({ lastError: null, reconnectAttempts: 0 });
        }
      },

      setIsHub: (isHub) => set({ isHub }),

      setHubAddress: (address) => set({ hubAddress: address }),

      setDeviceInfo: (id, type, name) => {
        set({
          deviceId: id,
          deviceType: type,
          deviceName: name || getDefaultDeviceName(type),
        });
      },

      addConnectedDevice: (device) => {
        const { connectedDevices } = get();
        const existing = connectedDevices.find(d => d.deviceId === device.deviceId);

        if (existing) {
          // Update existing device
          set({
            connectedDevices: connectedDevices.map(d =>
              d.deviceId === device.deviceId ? device : d
            ),
          });
        } else {
          // Add new device
          set({
            connectedDevices: [...connectedDevices, device],
          });
        }
      },

      updateDeviceStatus: (deviceId, status) => {
        set({
          connectedDevices: get().connectedDevices.map(d =>
            d.deviceId === deviceId ? { ...d, status } : d
          ),
        });
      },

      updateDeviceHeartbeat: (deviceId) => {
        set({
          connectedDevices: get().connectedDevices.map(d =>
            d.deviceId === deviceId
              ? { ...d, lastHeartbeat: new Date().toISOString(), status: 'online' }
              : d
          ),
        });
      },

      removeConnectedDevice: (deviceId) => {
        set({
          connectedDevices: get().connectedDevices.filter(d => d.deviceId !== deviceId),
        });
      },

      clearStaleDevices: (timeoutMs) => {
        const now = Date.now();
        set({
          connectedDevices: get().connectedDevices.filter(d => {
            const lastHeartbeat = new Date(d.lastHeartbeat).getTime();
            return now - lastHeartbeat < timeoutMs;
          }),
        });
      },

      addPendingMessage: (message) => {
        const pendingMessages = [...get().pendingMessages, message];
        set({
          pendingMessages,
          lastMessageSeq: pendingMessages.length,
        });
      },

      clearPendingMessages: () => {
        set({ pendingMessages: [] });
      },

      setLastError: (error) => set({ lastError: error }),

      incrementReconnectAttempts: () => {
        set({ reconnectAttempts: get().reconnectAttempts + 1 });
      },

      resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),

      reset: () => set(initialState),
    }),
    {
      name: 'appgrav-lan-store',
      partialize: (state) => ({
        // Only persist these fields
        isHub: state.isHub,
        hubAddress: state.hubAddress,
        deviceId: state.deviceId,
        deviceType: state.deviceType,
        deviceName: state.deviceName,
      }),
    }
  )
);
