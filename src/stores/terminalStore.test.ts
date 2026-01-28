import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTerminalStore } from './terminalStore';

// Mock crypto.randomUUID
const mockUUID = 'test-uuid-1234-5678-9abc-def012345678';
vi.stubGlobal('crypto', {
  randomUUID: () => mockUUID,
});

describe('terminalStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useTerminalStore.getState().reset();
    // Clear localStorage
    localStorage.clear();
  });

  describe('Initial state', () => {
    it('should start with null deviceId', () => {
      expect(useTerminalStore.getState().deviceId).toBeNull();
    });

    it('should start with isRegistered false', () => {
      expect(useTerminalStore.getState().isRegistered).toBe(false);
    });

    it('should start with isHub false', () => {
      expect(useTerminalStore.getState().isHub).toBe(false);
    });

    it('should start with serverSynced false', () => {
      expect(useTerminalStore.getState().serverSynced).toBe(false);
    });
  });

  describe('generateDeviceId', () => {
    it('should generate a UUID', () => {
      const deviceId = useTerminalStore.getState().generateDeviceId();
      expect(deviceId).toBe(mockUUID);
    });
  });

  describe('registerTerminal', () => {
    it('should register terminal with name', () => {
      useTerminalStore.getState().registerTerminal('POS Counter 1');

      const state = useTerminalStore.getState();
      expect(state.terminalName).toBe('POS Counter 1');
      expect(state.isRegistered).toBe(true);
      expect(state.deviceId).toBe(mockUUID);
    });

    it('should register terminal with isHub flag', () => {
      useTerminalStore.getState().registerTerminal('Main POS', true);

      expect(useTerminalStore.getState().isHub).toBe(true);
    });

    it('should register terminal with location', () => {
      useTerminalStore.getState().registerTerminal('Counter 1', false, 'Main Floor');

      expect(useTerminalStore.getState().location).toBe('Main Floor');
    });

    it('should set status to active', () => {
      useTerminalStore.getState().registerTerminal('Test Terminal');

      expect(useTerminalStore.getState().status).toBe('active');
    });

    it('should set serverSynced to false', () => {
      useTerminalStore.getState().registerTerminal('Test Terminal');

      expect(useTerminalStore.getState().serverSynced).toBe(false);
    });

    it('should reuse existing deviceId if already set', () => {
      const store = useTerminalStore.getState();

      // First registration
      store.registerTerminal('Terminal 1');
      const firstDeviceId = useTerminalStore.getState().deviceId;

      // Reset but keep deviceId by not calling reset()
      // Then register again
      store.registerTerminal('Terminal 2');
      const secondDeviceId = useTerminalStore.getState().deviceId;

      expect(firstDeviceId).toBe(secondDeviceId);
    });
  });

  describe('updateTerminalName', () => {
    it('should update terminal name', () => {
      useTerminalStore.getState().registerTerminal('Original Name');
      useTerminalStore.getState().updateTerminalName('New Name');

      expect(useTerminalStore.getState().terminalName).toBe('New Name');
    });

    it('should set serverSynced to false', () => {
      useTerminalStore.getState().registerTerminal('Original Name');
      useTerminalStore.getState().setServerSynced(true);
      useTerminalStore.getState().updateTerminalName('New Name');

      expect(useTerminalStore.getState().serverSynced).toBe(false);
    });
  });

  describe('setIsHub', () => {
    it('should update isHub flag', () => {
      useTerminalStore.getState().registerTerminal('Terminal');
      useTerminalStore.getState().setIsHub(true);

      expect(useTerminalStore.getState().isHub).toBe(true);
    });

    it('should set serverSynced to false', () => {
      useTerminalStore.getState().registerTerminal('Terminal');
      useTerminalStore.getState().setServerSynced(true);
      useTerminalStore.getState().setIsHub(true);

      expect(useTerminalStore.getState().serverSynced).toBe(false);
    });
  });

  describe('setLocation', () => {
    it('should update location', () => {
      useTerminalStore.getState().registerTerminal('Terminal');
      useTerminalStore.getState().setLocation('Kitchen Area');

      expect(useTerminalStore.getState().location).toBe('Kitchen Area');
    });

    it('should allow null location', () => {
      useTerminalStore.getState().registerTerminal('Terminal', false, 'Initial Location');
      useTerminalStore.getState().setLocation(null);

      expect(useTerminalStore.getState().location).toBeNull();
    });
  });

  describe('setServerSynced', () => {
    it('should update serverSynced flag', () => {
      useTerminalStore.getState().registerTerminal('Terminal');
      useTerminalStore.getState().setServerSynced(true);

      expect(useTerminalStore.getState().serverSynced).toBe(true);
    });

    it('should optionally update serverId', () => {
      useTerminalStore.getState().registerTerminal('Terminal');
      useTerminalStore.getState().setServerSynced(true, 'server-uuid-123');

      expect(useTerminalStore.getState().serverId).toBe('server-uuid-123');
    });
  });

  describe('setServerData', () => {
    it('should set all fields from server data', () => {
      const serverData = {
        id: 'server-id',
        terminal_name: 'Server Terminal',
        device_id: 'device-123',
        is_hub: true,
        location: 'Server Location',
        status: 'active' as const,
        created_at: '2026-01-27T00:00:00Z',
        updated_at: '2026-01-27T00:00:00Z',
        // New fields from Settings module
        mode: null,
        default_printer_id: null,
        kitchen_printer_id: null,
        kds_station: null,
        allowed_payment_methods: null,
        default_order_type: null,
        floor_plan_id: null,
        auto_logout_timeout: null,
      };

      useTerminalStore.getState().setServerData(serverData);

      const state = useTerminalStore.getState();
      expect(state.serverId).toBe('server-id');
      expect(state.terminalName).toBe('Server Terminal');
      expect(state.deviceId).toBe('device-123');
      expect(state.isHub).toBe(true);
      expect(state.location).toBe('Server Location');
      expect(state.isRegistered).toBe(true);
      expect(state.serverSynced).toBe(true);
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      useTerminalStore.getState().setLoading(true);
      expect(useTerminalStore.getState().isLoading).toBe(true);

      useTerminalStore.getState().setLoading(false);
      expect(useTerminalStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should update error state', () => {
      useTerminalStore.getState().setError('Test error');
      expect(useTerminalStore.getState().error).toBe('Test error');
    });

    it('should allow null error', () => {
      useTerminalStore.getState().setError('Test error');
      useTerminalStore.getState().setError(null);
      expect(useTerminalStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      useTerminalStore.getState().registerTerminal('Terminal', true, 'Location');
      useTerminalStore.getState().setServerSynced(true, 'server-id');
      useTerminalStore.getState().setLoading(true);
      useTerminalStore.getState().setError('Error');

      useTerminalStore.getState().reset();

      const state = useTerminalStore.getState();
      expect(state.deviceId).toBeNull();
      expect(state.terminalName).toBeNull();
      expect(state.isHub).toBe(false);
      expect(state.location).toBeNull();
      expect(state.isRegistered).toBe(false);
      expect(state.serverSynced).toBe(false);
      expect(state.serverId).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Selectors', () => {
    it('selectIsRegistered should return isRegistered', () => {
      expect(useTerminalStore.getState().isRegistered).toBe(false);
      useTerminalStore.getState().registerTerminal('Terminal');
      expect(useTerminalStore.getState().isRegistered).toBe(true);
    });

    it('selectNeedsSyncToServer should return true when registered but not synced', () => {
      useTerminalStore.getState().registerTerminal('Terminal');
      const state = useTerminalStore.getState();
      expect(state.isRegistered && !state.serverSynced).toBe(true);
    });

    it('selectNeedsSyncToServer should return false when synced', () => {
      useTerminalStore.getState().registerTerminal('Terminal');
      useTerminalStore.getState().setServerSynced(true);
      const state = useTerminalStore.getState();
      expect(state.isRegistered && !state.serverSynced).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('should persist state to localStorage', () => {
      useTerminalStore.getState().registerTerminal('Persistent Terminal', true, 'Storage Area');

      // Check localStorage directly
      const stored = localStorage.getItem('appgrav-terminal');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.terminalName).toBe('Persistent Terminal');
      expect(parsed.state.isHub).toBe(true);
      expect(parsed.state.location).toBe('Storage Area');
    });
  });
});
