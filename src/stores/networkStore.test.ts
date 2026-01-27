import { describe, it, expect, beforeEach } from 'vitest';
import { useNetworkStore } from './networkStore';

describe('networkStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useNetworkStore.setState({
      isOnline: true,
      lastOnlineAt: null,
      isLanConnected: false,
      lanHubUrl: null,
      networkMode: 'online',
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useNetworkStore.getState();

      expect(state.isOnline).toBe(true);
      expect(state.lastOnlineAt).toBeNull();
      expect(state.isLanConnected).toBe(false);
      expect(state.lanHubUrl).toBeNull();
      expect(state.networkMode).toBe('online');
    });
  });

  describe('setIsOnline', () => {
    it('should update isOnline to false and set networkMode to offline', () => {
      const { setIsOnline } = useNetworkStore.getState();

      setIsOnline(false);

      const state = useNetworkStore.getState();
      expect(state.isOnline).toBe(false);
      expect(state.networkMode).toBe('offline');
    });

    it('should update isOnline to true and set networkMode to online', () => {
      // Start offline
      useNetworkStore.setState({ isOnline: false, networkMode: 'offline' });

      const { setIsOnline } = useNetworkStore.getState();
      setIsOnline(true);

      const state = useNetworkStore.getState();
      expect(state.isOnline).toBe(true);
      expect(state.networkMode).toBe('online');
    });

    it('should update lastOnlineAt when going online', () => {
      useNetworkStore.setState({ isOnline: false, networkMode: 'offline' });

      const beforeTime = new Date();
      const { setIsOnline } = useNetworkStore.getState();
      setIsOnline(true);
      const afterTime = new Date();

      const state = useNetworkStore.getState();
      expect(state.lastOnlineAt).not.toBeNull();
      expect(state.lastOnlineAt!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(state.lastOnlineAt!.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should preserve lastOnlineAt when going offline', () => {
      const previousOnlineTime = new Date('2026-01-27T10:00:00');
      useNetworkStore.setState({
        isOnline: true,
        lastOnlineAt: previousOnlineTime,
        networkMode: 'online',
      });

      const { setIsOnline } = useNetworkStore.getState();
      setIsOnline(false);

      const state = useNetworkStore.getState();
      expect(state.lastOnlineAt).toEqual(previousOnlineTime);
    });

    it('should set networkMode to lan-only when offline but LAN connected', () => {
      useNetworkStore.setState({
        isOnline: true,
        isLanConnected: true,
        networkMode: 'online',
      });

      const { setIsOnline } = useNetworkStore.getState();
      setIsOnline(false);

      const state = useNetworkStore.getState();
      expect(state.networkMode).toBe('lan-only');
    });
  });

  describe('setIsLanConnected', () => {
    it('should update isLanConnected to true', () => {
      const { setIsLanConnected } = useNetworkStore.getState();

      setIsLanConnected(true);

      const state = useNetworkStore.getState();
      expect(state.isLanConnected).toBe(true);
    });

    it('should keep networkMode as online when online and LAN connected', () => {
      useNetworkStore.setState({ isOnline: true, networkMode: 'online' });

      const { setIsLanConnected } = useNetworkStore.getState();
      setIsLanConnected(true);

      const state = useNetworkStore.getState();
      expect(state.networkMode).toBe('online');
    });

    it('should set networkMode to lan-only when offline and LAN connected', () => {
      useNetworkStore.setState({ isOnline: false, networkMode: 'offline' });

      const { setIsLanConnected } = useNetworkStore.getState();
      setIsLanConnected(true);

      const state = useNetworkStore.getState();
      expect(state.networkMode).toBe('lan-only');
    });

    it('should set networkMode to offline when offline and LAN disconnected', () => {
      useNetworkStore.setState({
        isOnline: false,
        isLanConnected: true,
        networkMode: 'lan-only',
      });

      const { setIsLanConnected } = useNetworkStore.getState();
      setIsLanConnected(false);

      const state = useNetworkStore.getState();
      expect(state.networkMode).toBe('offline');
    });
  });

  describe('setLanHubUrl', () => {
    it('should update lanHubUrl', () => {
      const { setLanHubUrl } = useNetworkStore.getState();

      setLanHubUrl('ws://192.168.1.100:8080');

      const state = useNetworkStore.getState();
      expect(state.lanHubUrl).toBe('ws://192.168.1.100:8080');
    });

    it('should allow setting lanHubUrl to null', () => {
      useNetworkStore.setState({ lanHubUrl: 'ws://192.168.1.100:8080' });

      const { setLanHubUrl } = useNetworkStore.getState();
      setLanHubUrl(null);

      const state = useNetworkStore.getState();
      expect(state.lanHubUrl).toBeNull();
    });
  });

  describe('network mode transitions', () => {
    it('should correctly compute online mode', () => {
      useNetworkStore.setState({
        isOnline: true,
        isLanConnected: false,
      });

      const { setIsOnline } = useNetworkStore.getState();
      setIsOnline(true); // Trigger recomputation

      expect(useNetworkStore.getState().networkMode).toBe('online');
    });

    it('should correctly compute lan-only mode', () => {
      useNetworkStore.setState({
        isOnline: false,
        isLanConnected: true,
        networkMode: 'offline',
      });

      const { setIsLanConnected } = useNetworkStore.getState();
      setIsLanConnected(true); // Trigger recomputation

      expect(useNetworkStore.getState().networkMode).toBe('lan-only');
    });

    it('should correctly compute offline mode', () => {
      useNetworkStore.setState({
        isOnline: false,
        isLanConnected: false,
      });

      const { setIsOnline } = useNetworkStore.getState();
      setIsOnline(false); // Trigger recomputation

      expect(useNetworkStore.getState().networkMode).toBe('offline');
    });
  });
});
