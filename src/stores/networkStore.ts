import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import logger from '@/utils/logger';

/**
 * Network mode representing the current connectivity state
 */
export type TNetworkMode = 'online' | 'lan-only' | 'offline';

/**
 * Network state interface for managing connectivity status
 * Follows project naming convention: I prefix for interfaces
 */
export interface INetworkState {
  // Internet status
  isOnline: boolean;
  lastOnlineAt: Date | null;

  // LAN status
  isLanConnected: boolean;
  lanHubUrl: string | null;

  // Computed mode based on online + LAN status
  networkMode: TNetworkMode;

  // Actions
  setIsOnline: (value: boolean) => void;
  setIsLanConnected: (value: boolean) => void;
  setLanHubUrl: (url: string | null) => void;
}

/**
 * Network store for managing application connectivity state
 *
 * State transitions:
 * - online: Internet available (green indicator)
 * - lan-only: No internet but LAN available (yellow indicator)
 * - offline: No connectivity (gray indicator - non-alarming per Story 1.4)
 *
 * Persistence: lastOnlineAt and lanHubUrl are persisted to localStorage
 */
export const useNetworkStore = create<INetworkState>()(
  persist(
    (set) => ({
      // Initial state - check navigator.onLine for current status
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      lastOnlineAt: null,
      isLanConnected: false,
      lanHubUrl: null,
      networkMode: typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline',

      /**
       * Update online status and compute network mode
       * When going online, updates lastOnlineAt timestamp
       */
      setIsOnline: (value: boolean) => set((state) => ({
        isOnline: value,
        lastOnlineAt: value ? new Date() : state.lastOnlineAt,
        networkMode: value ? 'online' : (state.isLanConnected ? 'lan-only' : 'offline')
      })),

      /**
       * Update LAN connection status and compute network mode
       * LAN-only mode is only active when offline but LAN is connected
       */
      setIsLanConnected: (value: boolean) => set((state) => ({
        isLanConnected: value,
        networkMode: state.isOnline ? 'online' : (value ? 'lan-only' : 'offline')
      })),

      /**
       * Set the LAN hub URL for WebSocket connection
       * Will be used by lanClient service in future stories
       */
      setLanHubUrl: (url: string | null) => set({ lanHubUrl: url }),
    }),
    {
      name: 'appgrav-network',
      // Only persist lastOnlineAt and lanHubUrl
      // Runtime state (isOnline, isLanConnected, networkMode) should be fresh on load
      partialize: (state) => ({
        lastOnlineAt: state.lastOnlineAt,
        lanHubUrl: state.lanHubUrl
      }),
      // Custom storage to handle Date serialization with error handling
      storage: {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const parsed = JSON.parse(str);
            // Restore lastOnlineAt as Date object
            if (parsed.state?.lastOnlineAt) {
              parsed.state.lastOnlineAt = new Date(parsed.state.lastOnlineAt);
            }
            return parsed;
          } catch (error) {
            // If localStorage is corrupted, return null to use default state
            logger.warn('[networkStore] Failed to parse persisted state, using defaults:', error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            logger.warn('[networkStore] Failed to persist state:', error);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            logger.warn('[networkStore] Failed to remove persisted state:', error);
          }
        },
      },
    }
  )
);
