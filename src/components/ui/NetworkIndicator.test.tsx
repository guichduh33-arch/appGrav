import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NetworkIndicator } from './NetworkIndicator';
import { useNetworkStore } from '../../stores/networkStore';

// Store original navigator.onLine
const originalOnLine = navigator.onLine;

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'network.online': 'Online',
        'network.offline': 'Offline',
        'network.lanOnly': 'LAN Mode',
      };
      return translations[key] || key;
    },
  }),
}));

describe('NetworkIndicator', () => {
  beforeEach(() => {
    // Reset store state
    useNetworkStore.setState({
      isOnline: true,
      lastOnlineAt: null,
      isLanConnected: false,
      lanHubUrl: null,
      networkMode: 'online',
    });

    // Default navigator.onLine to true
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      writable: true,
      configurable: true,
    });
  });

  describe('online mode', () => {
    it('should render online status with green styling', () => {
      render(<NetworkIndicator />);

      expect(screen.getByText('Online')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-green-100');
    });

    it('should render Wifi icon when online', () => {
      const { container } = render(<NetworkIndicator />);

      // Check for SVG icon (Wifi)
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('text-green-600');
    });
  });

  describe('offline mode', () => {
    beforeEach(() => {
      // Set navigator.onLine to false before render
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      });
      useNetworkStore.setState({
        isOnline: false,
        isLanConnected: false,
        networkMode: 'offline',
      });
    });

    it('should render offline status with red styling', () => {
      render(<NetworkIndicator />);

      expect(screen.getByText('Offline')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-red-100');
    });

    it('should render WifiOff icon when offline', () => {
      const { container } = render(<NetworkIndicator />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('text-red-600');
    });
  });

  describe('lan-only mode', () => {
    beforeEach(() => {
      // Set navigator.onLine to false before render
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      });
      useNetworkStore.setState({
        isOnline: false,
        isLanConnected: true,
        networkMode: 'lan-only',
      });
    });

    it('should render LAN mode status with yellow styling', () => {
      render(<NetworkIndicator />);

      expect(screen.getByText('LAN Mode')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-yellow-100');
    });

    it('should render Radio icon when in LAN mode', () => {
      const { container } = render(<NetworkIndicator />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('text-yellow-600');
    });
  });

  describe('compact mode', () => {
    it('should not render text label when compact', () => {
      render(<NetworkIndicator compact />);

      // Icon should be present but not text
      expect(screen.queryByText('Online')).not.toBeInTheDocument();
    });

    it('should still render icon when compact', () => {
      const { container } = render(<NetworkIndicator compact />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have role="status"', () => {
      render(<NetworkIndicator />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      render(<NetworkIndicator />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-label for screen readers', () => {
      render(<NetworkIndicator />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Online');
    });
  });

  describe('NFR compliance', () => {
    it('should have minimum touch target size of 44x44px (NFR-U2)', () => {
      render(<NetworkIndicator />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('min-w-[44px]');
      expect(indicator).toHaveClass('min-h-[44px]');
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      render(<NetworkIndicator className="custom-class" />);

      expect(screen.getByRole('status')).toHaveClass('custom-class');
    });
  });
});
