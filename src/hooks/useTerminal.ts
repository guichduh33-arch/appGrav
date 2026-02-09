import { useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTerminalStore, selectNeedsSyncToServer } from '../stores/terminalStore';
import { useNetworkStatus } from './useNetworkStatus';
import { addToSyncQueue } from '../services/sync/syncQueue';
import type { IPosTerminal } from '../types/database';

/**
 * Hook to manage POS terminal registration and sync
 *
 * Provides:
 * - Terminal registration (local + server)
 * - Auto-sync when coming online
 * - Offline-first approach with sync queue
 */
export function useTerminal() {
  const { isOnline } = useNetworkStatus();
  const store = useTerminalStore();
  const needsSync = useTerminalStore(selectNeedsSyncToServer);

  /**
   * Register terminal locally and optionally sync to server
   */
  const registerTerminal = useCallback(
    async (name: string, isHub = false, location?: string) => {
      store.setLoading(true);
      store.setError(null);

      try {
        // Register locally first
        store.registerTerminal(name, isHub, location);
        const deviceId = useTerminalStore.getState().deviceId;

        if (!deviceId) {
          throw new Error('Failed to generate device ID');
        }

        // Try to sync to server if online
        if (isOnline) {
          await syncToServer(deviceId, name, isHub, location);
        } else {
          // Queue for sync when back online
          await addToSyncQueue('order', {
            _type: 'terminal_registration',
            deviceId,
            terminalName: name,
            isHub,
            location,
          });
        }

        store.setLoading(false);
        return { success: true, deviceId };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed';
        store.setError(message);
        store.setLoading(false);
        return { success: false, error: message };
      }
    },
    [isOnline]
  );

  /**
   * Sync terminal to Supabase server
   * Note: Uses 'as any' type cast until pos_terminals is in generated types
   */
  const syncToServer = async (
    deviceId: string,
    terminalName: string,
    isHub: boolean,
    location?: string
  ) => {
    // Check if terminal already exists in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('pos_terminals')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (existing) {
      // Update existing terminal
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('pos_terminals')
        .update({
          terminal_name: terminalName,
          is_hub: isHub,
          location: location || null,
        })
        .eq('device_id', deviceId)
        .select()
        .single();

      if (error) throw error;
      store.setServerData(data as IPosTerminal);
    } else {
      // Create new terminal
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('pos_terminals')
        .insert({
          device_id: deviceId,
          terminal_name: terminalName,
          is_hub: isHub,
          location: location || null,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      store.setServerData(data as IPosTerminal);
    }
  };

  /**
   * Update terminal name
   */
  const updateTerminalName = useCallback(
    async (name: string) => {
      store.updateTerminalName(name);

      if (isOnline && store.deviceId) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase as any)
            .from('pos_terminals')
            .update({ terminal_name: name })
            .eq('device_id', store.deviceId);

          if (!error) {
            store.setServerSynced(true);
          }
        } catch {
          // Will sync later
        }
      }
    },
    [isOnline, store.deviceId]
  );

  /**
   * Update hub status
   */
  const updateIsHub = useCallback(
    async (isHub: boolean) => {
      store.setIsHub(isHub);

      if (isOnline && store.deviceId) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase as any)
            .from('pos_terminals')
            .update({ is_hub: isHub })
            .eq('device_id', store.deviceId);

          if (!error) {
            store.setServerSynced(true);
          }
        } catch {
          // Will sync later
        }
      }
    },
    [isOnline, store.deviceId]
  );

  /**
   * Fetch terminal from server (on app start)
   */
  const fetchFromServer = useCallback(async () => {
    if (!store.deviceId || !isOnline) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('pos_terminals')
        .select('*')
        .eq('device_id', store.deviceId)
        .single();

      if (!error && data) {
        store.setServerData(data as IPosTerminal);
      }
    } catch {
      // Terminal might not exist on server yet
    }
  }, [store.deviceId, isOnline]);

  /**
   * Sync pending changes when coming online
   */
  const syncPendingChanges = useCallback(async () => {
    if (!needsSync || !isOnline || !store.deviceId) return;

    try {
      await syncToServer(
        store.deviceId,
        store.terminalName || 'POS Terminal',
        store.isHub,
        store.location || undefined
      );
    } catch {
      // Will retry later
    }
  }, [needsSync, isOnline, store.deviceId, store.terminalName, store.isHub, store.location]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && needsSync) {
      syncPendingChanges();
    }
  }, [isOnline, needsSync, syncPendingChanges]);

  // Fetch from server on mount if registered
  useEffect(() => {
    if (store.isRegistered && isOnline && !store.serverSynced) {
      fetchFromServer();
    }
  }, [store.isRegistered, isOnline, store.serverSynced, fetchFromServer]);

  return {
    // State
    deviceId: store.deviceId,
    terminalName: store.terminalName,
    isHub: store.isHub,
    location: store.location,
    status: store.status,
    isRegistered: store.isRegistered,
    serverSynced: store.serverSynced,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    registerTerminal,
    updateTerminalName,
    updateIsHub,
    fetchFromServer,
    syncPendingChanges,
  };
}
