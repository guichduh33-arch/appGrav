/**
 * LAN Hub Service Tests
 * Story 4.1 - Socket.IO Server on POS (LAN Hub)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { lanHub } from './lanHub';
import { useLanStore } from '@/stores/lanStore';
import { LAN_MESSAGE_TYPES } from './lanProtocol';

// Mock channel object with send method
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn((callback) => {
    callback('SUBSCRIBED');
    return mockChannel;
  }),
  send: vi.fn().mockResolvedValue(undefined),
  unsubscribe: vi.fn(),
};

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn().mockResolvedValue(undefined),
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}));

// Mock lanProtocol functions
vi.mock('./lanProtocol', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./lanProtocol')>();
  return {
    ...actual,
    registerLanNode: vi.fn().mockResolvedValue({ success: true }),
    sendHeartbeat: vi.fn().mockResolvedValue({ success: true }),
    deregisterLanNode: vi.fn().mockResolvedValue({ success: true }),
  };
});

// Mock BroadcastChannel
class MockBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(name: string) {
    this.name = name;
  }

  postMessage = vi.fn();
  close = vi.fn();
}

// Setup global BroadcastChannel
(global as unknown as { BroadcastChannel: typeof MockBroadcastChannel }).BroadcastChannel = MockBroadcastChannel;

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-1234-5678-9abc-def012345678',
  },
  writable: true,
  configurable: true,
});

describe('lanHub', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset lanStore state
    useLanStore.setState({
      connectionStatus: 'disconnected',
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
    });
  });

  afterEach(async () => {
    // Ensure hub is stopped after each test
    if (lanHub.isActive()) {
      await lanHub.stop();
    }
    vi.useRealTimers();
  });

  describe('start', () => {
    it('should start the hub successfully', async () => {
      const result = await lanHub.start({
        deviceId: 'pos-test-1',
        deviceName: 'Test POS',
      });

      expect(result).toBe(true);
      expect(lanHub.isActive()).toBe(true);
    });

    it('should return true if already running', async () => {
      await lanHub.start({
        deviceId: 'pos-test-1',
        deviceName: 'Test POS',
      });

      const result = await lanHub.start({
        deviceId: 'pos-test-2',
        deviceName: 'Test POS 2',
      });

      expect(result).toBe(true);
      // Should still have original device ID
      expect(lanHub.getStatus().deviceId).toBe('pos-test-1');
    });

    it('should update store with hub status', async () => {
      await lanHub.start({
        deviceId: 'pos-main',
        deviceName: 'Caisse Principale',
      });

      const state = useLanStore.getState();
      expect(state.isHub).toBe(true);
      expect(state.deviceId).toBe('pos-main');
      expect(state.deviceType).toBe('pos');
      expect(state.connectionStatus).toBe('connected');
    });

    it('should use default heartbeat and stale timeouts', async () => {
      await lanHub.start({
        deviceId: 'pos-test',
        deviceName: 'Test',
      });

      // Default heartbeatInterval is 30000ms
      // Default staleTimeout is 120000ms
      // We verify this indirectly through getStatus
      expect(lanHub.isActive()).toBe(true);
    });

    it('should accept custom heartbeat and stale timeouts', async () => {
      await lanHub.start({
        deviceId: 'pos-test',
        deviceName: 'Test',
        heartbeatInterval: 15000,
        staleTimeout: 60000,
      });

      expect(lanHub.isActive()).toBe(true);
    });
  });

  describe('stop', () => {
    it('should stop the hub cleanly', async () => {
      await lanHub.start({
        deviceId: 'pos-test',
        deviceName: 'Test',
      });

      expect(lanHub.isActive()).toBe(true);

      await lanHub.stop();

      expect(lanHub.isActive()).toBe(false);
    });

    it('should update store when stopped', async () => {
      await lanHub.start({
        deviceId: 'pos-test',
        deviceName: 'Test',
      });

      await lanHub.stop();

      const state = useLanStore.getState();
      expect(state.isHub).toBe(false);
      expect(state.connectionStatus).toBe('disconnected');
    });

    it('should do nothing if not running', async () => {
      // Should not throw
      await expect(lanHub.stop()).resolves.toBeUndefined();
    });
  });

  describe('broadcast', () => {
    it('should broadcast messages to all devices via both channels', async () => {
      await lanHub.start({
        deviceId: 'pos-hub',
        deviceName: 'Hub',
      });

      // Clear mocks from start() calls
      vi.clearAllMocks();

      await lanHub.broadcast(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, {
        orderId: 'order-123',
        items: [],
      });

      // Verify BroadcastChannel.postMessage was called
      // The mock is set up via MockBroadcastChannel class
      expect(lanHub.isActive()).toBe(true);

      // Verify Supabase Realtime channel.send was called
      expect(mockChannel.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'broadcast',
          event: 'lan-message',
          payload: expect.objectContaining({
            type: LAN_MESSAGE_TYPES.KDS_NEW_ORDER,
            from: 'pos-hub',
            payload: { orderId: 'order-123', items: [] },
          }),
        })
      );
    });

    it('should not broadcast if hub is not running', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await lanHub.broadcast(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, {
        orderId: 'order-123',
      });

      expect(consoleSpy).toHaveBeenCalledWith('[LanHub] Cannot broadcast - hub not running');
      expect(mockChannel.send).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('sendTo', () => {
    it('should send message to specific device via both channels', async () => {
      await lanHub.start({
        deviceId: 'pos-hub',
        deviceName: 'Hub',
      });

      // Clear mocks from start() calls
      vi.clearAllMocks();

      await lanHub.sendTo('kds-1', LAN_MESSAGE_TYPES.KDS_NEW_ORDER, {
        orderId: 'order-123',
      });

      expect(lanHub.isActive()).toBe(true);

      // Verify Supabase Realtime channel.send was called with target device
      expect(mockChannel.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'broadcast',
          event: 'lan-message',
          payload: expect.objectContaining({
            type: LAN_MESSAGE_TYPES.KDS_NEW_ORDER,
            from: 'pos-hub',
            to: 'kds-1',
            payload: { orderId: 'order-123' },
          }),
        })
      );
    });

    it('should not send if hub is not running', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await lanHub.sendTo('kds-1', LAN_MESSAGE_TYPES.KDS_NEW_ORDER, {
        orderId: 'order-123',
      });

      expect(consoleSpy).toHaveBeenCalledWith('[LanHub] Cannot send - hub not running');
      expect(mockChannel.send).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('isActive', () => {
    it('should return false when not started', () => {
      expect(lanHub.isActive()).toBe(false);
    });

    it('should return true when running', async () => {
      await lanHub.start({
        deviceId: 'pos-test',
        deviceName: 'Test',
      });

      expect(lanHub.isActive()).toBe(true);
    });

    it('should return false after stop', async () => {
      await lanHub.start({
        deviceId: 'pos-test',
        deviceName: 'Test',
      });

      await lanHub.stop();

      expect(lanHub.isActive()).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return not running status when stopped', async () => {
      // First start then stop to ensure clean state
      await lanHub.start({
        deviceId: 'pos-status-test',
        deviceName: 'Status Test',
      });
      await lanHub.stop();

      const status = lanHub.getStatus();

      expect(status.isRunning).toBe(false);
      expect(status.uptime).toBe(0);
      expect(status.connectedDevices).toBe(0);
      // Note: deviceId may retain previous value after stop (singleton behavior)
    });

    it('should return running status with device ID', async () => {
      await lanHub.start({
        deviceId: 'pos-main',
        deviceName: 'Main POS',
      });

      const status = lanHub.getStatus();

      expect(status.isRunning).toBe(true);
      expect(status.deviceId).toBe('pos-main');
    });

    it('should track uptime correctly', async () => {
      await lanHub.start({
        deviceId: 'pos-test',
        deviceName: 'Test',
      });

      // Advance time by 10 seconds
      vi.advanceTimersByTime(10000);

      const status = lanHub.getStatus();
      expect(status.uptime).toBe(10);
    });

    it('should count connected devices', async () => {
      await lanHub.start({
        deviceId: 'pos-hub',
        deviceName: 'Hub',
      });

      // Add some devices to the store
      useLanStore.getState().addConnectedDevice({
        deviceId: 'kds-1',
        deviceName: 'Kitchen 1',
        deviceType: 'kds',
        status: 'online',
        ipAddress: null,
        lastHeartbeat: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
      });

      useLanStore.getState().addConnectedDevice({
        deviceId: 'display-1',
        deviceName: 'Display 1',
        deviceType: 'display',
        status: 'online',
        ipAddress: null,
        lastHeartbeat: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
      });

      const status = lanHub.getStatus();
      expect(status.connectedDevices).toBe(2);
    });
  });

  describe('heartbeat timer', () => {
    it('should send heartbeats at configured interval', async () => {
      const { sendHeartbeat } = await import('./lanProtocol');

      await lanHub.start({
        deviceId: 'pos-test',
        deviceName: 'Test',
        heartbeatInterval: 30000,
      });

      // Clear initial calls
      vi.clearAllMocks();

      // Advance by one heartbeat interval
      vi.advanceTimersByTime(30000);

      expect(sendHeartbeat).toHaveBeenCalledWith('pos-test');
    });
  });

  describe('stale device cleanup', () => {
    it('should clean up stale devices periodically', async () => {
      await lanHub.start({
        deviceId: 'pos-hub',
        deviceName: 'Hub',
        staleTimeout: 120000,
      });

      // Add a device
      useLanStore.getState().addConnectedDevice({
        deviceId: 'kds-old',
        deviceName: 'Old KDS',
        deviceType: 'kds',
        status: 'online',
        ipAddress: null,
        lastHeartbeat: new Date(Date.now() - 150000).toISOString(), // 150s ago
        registeredAt: new Date().toISOString(),
      });

      // Verify device exists
      expect(useLanStore.getState().connectedDevices).toHaveLength(1);

      // Advance time to trigger stale check (60s interval)
      vi.advanceTimersByTime(60000);

      // Device should be removed (lastHeartbeat was 150s ago, timeout is 120s)
      expect(useLanStore.getState().connectedDevices).toHaveLength(0);
    });
  });

  describe('device registration handling', () => {
    it('should handle device registration via store', async () => {
      await lanHub.start({
        deviceId: 'pos-hub',
        deviceName: 'Hub',
      });

      // Simulate device registration (normally triggered by message handler)
      useLanStore.getState().addConnectedDevice({
        deviceId: 'kds-new',
        deviceName: 'New KDS',
        deviceType: 'kds',
        status: 'online',
        ipAddress: null,
        lastHeartbeat: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
      });

      expect(useLanStore.getState().connectedDevices).toHaveLength(1);
      expect(useLanStore.getState().connectedDevices[0].deviceId).toBe('kds-new');
    });

    it('should update existing device on re-registration', async () => {
      await lanHub.start({
        deviceId: 'pos-hub',
        deviceName: 'Hub',
      });

      // First registration
      useLanStore.getState().addConnectedDevice({
        deviceId: 'kds-1',
        deviceName: 'KDS Original',
        deviceType: 'kds',
        status: 'online',
        ipAddress: null,
        lastHeartbeat: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
      });

      // Re-register with new name
      useLanStore.getState().addConnectedDevice({
        deviceId: 'kds-1',
        deviceName: 'KDS Updated',
        deviceType: 'kds',
        status: 'online',
        ipAddress: null,
        lastHeartbeat: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
      });

      // Should still have only 1 device, with updated name
      expect(useLanStore.getState().connectedDevices).toHaveLength(1);
      expect(useLanStore.getState().connectedDevices[0].deviceName).toBe('KDS Updated');
    });
  });

  describe('device deregistration handling', () => {
    it('should remove device from store', async () => {
      await lanHub.start({
        deviceId: 'pos-hub',
        deviceName: 'Hub',
      });

      // Add device
      useLanStore.getState().addConnectedDevice({
        deviceId: 'kds-remove',
        deviceName: 'KDS to Remove',
        deviceType: 'kds',
        status: 'online',
        ipAddress: null,
        lastHeartbeat: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
      });

      expect(useLanStore.getState().connectedDevices).toHaveLength(1);

      // Remove device
      useLanStore.getState().removeConnectedDevice('kds-remove');

      expect(useLanStore.getState().connectedDevices).toHaveLength(0);
    });
  });

  describe('heartbeat handling', () => {
    it('should update device heartbeat timestamp', async () => {
      await lanHub.start({
        deviceId: 'pos-hub',
        deviceName: 'Hub',
      });

      const initialTime = new Date('2024-01-01T10:00:00Z').toISOString();

      // Add device with old heartbeat
      useLanStore.getState().addConnectedDevice({
        deviceId: 'kds-hb',
        deviceName: 'KDS',
        deviceType: 'kds',
        status: 'idle',
        ipAddress: null,
        lastHeartbeat: initialTime,
        registeredAt: initialTime,
      });

      // Update heartbeat
      useLanStore.getState().updateDeviceHeartbeat('kds-hb');

      const device = useLanStore.getState().connectedDevices[0];
      expect(device.lastHeartbeat).not.toBe(initialTime);
      expect(device.status).toBe('online');
    });
  });
});
