import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IPosTerminal, TPosTerminalStatus } from '../types/database';

// =====================================================
// Constants
// =====================================================

const STORAGE_KEY = 'appgrav-terminal';

// =====================================================
// State Interface
// =====================================================

interface ITerminalState {
  // Terminal data
  deviceId: string | null;
  terminalName: string | null;
  isHub: boolean;
  location: string | null;
  status: TPosTerminalStatus;

  // Registration state
  isRegistered: boolean;
  serverSynced: boolean;
  serverId: string | null; // UUID from pos_terminals table

  // Loading state
  isLoading: boolean;
  error: string | null;
}

interface ITerminalActions {
  // Registration
  registerTerminal: (name: string, isHub?: boolean, location?: string) => void;
  generateDeviceId: () => string;

  // Updates
  updateTerminalName: (name: string) => void;
  setIsHub: (isHub: boolean) => void;
  setLocation: (location: string | null) => void;

  // Server sync
  setServerSynced: (synced: boolean, serverId?: string) => void;
  setServerData: (terminal: IPosTerminal) => void;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type TTerminalStore = ITerminalState & ITerminalActions;

// =====================================================
// Initial State
// =====================================================

const initialState: ITerminalState = {
  deviceId: null,
  terminalName: null,
  isHub: false,
  location: null,
  status: 'active',
  isRegistered: false,
  serverSynced: false,
  serverId: null,
  isLoading: false,
  error: null,
};

// =====================================================
// Store Implementation
// =====================================================

export const useTerminalStore = create<TTerminalStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // =====================================================
      // Generate Device ID
      // =====================================================

      generateDeviceId: () => {
        return crypto.randomUUID();
      },

      // =====================================================
      // Register Terminal
      // =====================================================

      registerTerminal: (name: string, isHub = false, location?: string) => {
        const deviceId = get().deviceId || get().generateDeviceId();

        set({
          deviceId,
          terminalName: name,
          isHub,
          location: location || null,
          status: 'active',
          isRegistered: true,
          serverSynced: false, // Need to sync with server
          error: null,
        });
      },

      // =====================================================
      // Update Functions
      // =====================================================

      updateTerminalName: (name: string) => {
        set({
          terminalName: name,
          serverSynced: false, // Need to re-sync
        });
      },

      setIsHub: (isHub: boolean) => {
        set({
          isHub,
          serverSynced: false,
        });
      },

      setLocation: (location: string | null) => {
        set({
          location,
          serverSynced: false,
        });
      },

      // =====================================================
      // Server Sync
      // =====================================================

      setServerSynced: (synced: boolean, serverId?: string) => {
        set({
          serverSynced: synced,
          serverId: serverId || get().serverId,
        });
      },

      setServerData: (terminal: IPosTerminal) => {
        set({
          serverId: terminal.id,
          deviceId: terminal.device_id,
          terminalName: terminal.terminal_name,
          isHub: terminal.is_hub ?? false,
          location: terminal.location,
          status: (terminal.status as TPosTerminalStatus) ?? 'inactive',
          isRegistered: true,
          serverSynced: true,
        });
      },

      // =====================================================
      // State Management
      // =====================================================

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: STORAGE_KEY,
      // Persist everything except loading/error states
      partialize: (state) => ({
        deviceId: state.deviceId,
        terminalName: state.terminalName,
        isHub: state.isHub,
        location: state.location,
        status: state.status,
        isRegistered: state.isRegistered,
        serverSynced: state.serverSynced,
        serverId: state.serverId,
      }),
    }
  )
);

// =====================================================
// Selectors
// =====================================================

export const selectIsRegistered = (state: TTerminalStore) => state.isRegistered;
export const selectDeviceId = (state: TTerminalStore) => state.deviceId;
export const selectTerminalName = (state: TTerminalStore) => state.terminalName;
export const selectIsHub = (state: TTerminalStore) => state.isHub;
export const selectNeedsSyncToServer = (state: TTerminalStore) =>
  state.isRegistered && !state.serverSynced;
