/**
 * LanConnectionIndicator Component Tests
 * Story 4.2 - KDS Socket.IO Client Connection
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanConnectionIndicator } from '../LanConnectionIndicator';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'lan.client.connected': 'Connected to LAN hub',
        'lan.client.connecting': 'Connecting to LAN hub...',
        'lan.client.disconnected': 'Disconnected from LAN hub',
        'lan.client.error': 'LAN connection error',
        'lan.client.reconnecting': 'Reconnecting...',
        'lan.client.reconnectAttempt': `Attempt ${params?.count}/${params?.max}`,
      };
      return translations[key] || key;
    },
  }),
}));

describe('LanConnectionIndicator', () => {
  describe('status rendering', () => {
    it('should render connected status with green wifi icon', () => {
      const { container } = render(
        <LanConnectionIndicator status="connected" />
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeTruthy();
      expect(icon?.classList.contains('text-green-500')).toBe(true);
    });

    it('should render connecting status with yellow spinning icon', () => {
      const { container } = render(
        <LanConnectionIndicator status="connecting" />
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeTruthy();
      expect(icon?.classList.contains('text-yellow-500')).toBe(true);
      expect(icon?.classList.contains('animate-spin')).toBe(true);
    });

    it('should render error status with red wifi-off icon', () => {
      const { container } = render(
        <LanConnectionIndicator status="error" />
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeTruthy();
      expect(icon?.classList.contains('text-red-500')).toBe(true);
    });

    it('should render disconnected status with gray wifi-off icon', () => {
      const { container } = render(
        <LanConnectionIndicator status="disconnected" />
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeTruthy();
      expect(icon?.classList.contains('text-gray-400')).toBe(true);
    });
  });

  describe('label display', () => {
    it('should not show label by default', () => {
      render(<LanConnectionIndicator status="connected" />);

      expect(screen.queryByText('Connected to LAN hub')).toBeNull();
    });

    it('should show label when showLabel is true', () => {
      render(<LanConnectionIndicator status="connected" showLabel />);

      expect(screen.getByText('Connected to LAN hub')).toBeTruthy();
    });

    it('should show reconnect attempt count when connecting with attempts', () => {
      render(
        <LanConnectionIndicator
          status="connecting"
          reconnectAttempts={3}
          maxReconnectAttempts={10}
          showLabel
        />
      );

      expect(screen.getByText('Attempt 3/10')).toBeTruthy();
    });
  });

  describe('tooltip', () => {
    it('should have tooltip with status text', () => {
      const { container } = render(
        <LanConnectionIndicator status="connected" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute('title')).toBe('Connected to LAN hub');
    });

    it('should show reconnect info in tooltip when error with attempts', () => {
      const { container } = render(
        <LanConnectionIndicator
          status="error"
          reconnectAttempts={5}
          maxReconnectAttempts={10}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute('title')).toContain('LAN connection error');
      expect(wrapper.getAttribute('title')).toContain('5/10');
    });
  });

  describe('className prop', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <LanConnectionIndicator status="connected" className="custom-class" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.classList.contains('custom-class')).toBe(true);
    });
  });
});
