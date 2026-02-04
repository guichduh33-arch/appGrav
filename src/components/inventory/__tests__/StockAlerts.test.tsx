/**
 * Stock Alerts Components Tests
 * Story 5.2 - Stock Alerts Offline Display
 *
 * Tests for StockAlertsBadge, StockAlertsPanel, and StaleDataWarning components.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { calculateStockStatus } from '@/hooks/offline/useStockLevelsOffline';
import { isDataStale, STALE_DATA_THRESHOLD_MS } from '@/types/offline';

// Mock the hooks
vi.mock('@/hooks/offline/useStockLevelsOffline', async () => {
  const actual = await vi.importActual('@/hooks/offline/useStockLevelsOffline');
  return {
    ...actual,
    useStockLevelsOffline: vi.fn(() => ({
      stockLevels: [],
      isLoading: false,
      isOffline: false,
      lastSyncAt: null,
      cacheCount: 0,
      hasData: false,
      getProductStock: vi.fn(),
      getStockStatus: vi.fn(),
    })),
  };
});

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => new Map()),
}));

vi.mock('@/lib/db', () => ({
  db: {
    offline_products: {
      toArray: vi.fn(() => Promise.resolve([])),
    },
  },
}));

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('calculateStockStatus', () => {
  it('returns out_of_stock when quantity is 0', () => {
    expect(calculateStockStatus(0, 10)).toBe('out_of_stock');
  });

  it('returns critical when quantity is less than 5', () => {
    expect(calculateStockStatus(1, 10)).toBe('critical');
    expect(calculateStockStatus(4, 10)).toBe('critical');
  });

  it('returns warning when quantity is less than minLevel but >= 5', () => {
    expect(calculateStockStatus(5, 10)).toBe('warning');
    expect(calculateStockStatus(9, 10)).toBe('warning');
  });

  it('returns ok when quantity is >= minLevel', () => {
    expect(calculateStockStatus(10, 10)).toBe('ok');
    expect(calculateStockStatus(100, 10)).toBe('ok');
  });

  it('handles edge case where minLevel is less than 5', () => {
    // If minLevel is 3, quantity 4 is still critical (< 5)
    expect(calculateStockStatus(4, 3)).toBe('critical');
    // Quantity 5 is ok because it's >= 5 and >= minLevel
    expect(calculateStockStatus(5, 3)).toBe('ok');
  });
});

describe('isDataStale', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true when lastSyncAt is null', () => {
    expect(isDataStale(null)).toBe(true);
  });

  it('returns false when sync was recent', () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const recentSync = new Date(now - 1000).toISOString(); // 1 second ago
    expect(isDataStale(recentSync)).toBe(false);
  });

  it('returns true when sync was more than threshold ago', () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const oldSync = new Date(now - STALE_DATA_THRESHOLD_MS - 1000).toISOString();
    expect(isDataStale(oldSync)).toBe(true);
  });

  it('returns false when sync was exactly at threshold', () => {
    const now = Date.now();
    vi.setSystemTime(now);
    // At exactly the threshold, elapsed === STALE_DATA_THRESHOLD_MS
    // The condition is elapsed > STALE_DATA_THRESHOLD_MS, so this should be false
    const atThreshold = new Date(now - STALE_DATA_THRESHOLD_MS).toISOString();
    expect(isDataStale(atThreshold)).toBe(false);
  });
});

describe('StockAlertsBadge', () => {
  it('renders nothing when there are no alerts', async () => {
    const { useStockLevelsOffline } = await import(
      '@/hooks/offline/useStockLevelsOffline'
    );
    vi.mocked(useStockLevelsOffline).mockReturnValue({
      stockLevels: [],
      isLoading: false,
      isOffline: false,
      lastSyncAt: null,
      cacheCount: 0,
      hasData: false,
      getProductStock: vi.fn(),
      getStockStatus: vi.fn(),
    });

    const { StockAlertsBadge } = await import('../StockAlertsBadge');
    const { container } = render(
      <TestWrapper>
        <StockAlertsBadge />
      </TestWrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders badge with count when alerts exist', async () => {
    const { useStockLevelsOffline } = await import(
      '@/hooks/offline/useStockLevelsOffline'
    );
    vi.mocked(useStockLevelsOffline).mockReturnValue({
      stockLevels: [
        { product_id: '1', quantity: 2, min_stock_level: 10, last_updated: '' },
        { product_id: '2', quantity: 8, min_stock_level: 10, last_updated: '' },
      ],
      isLoading: false,
      isOffline: false,
      lastSyncAt: new Date().toISOString(),
      cacheCount: 2,
      hasData: true,
      getProductStock: vi.fn(),
      getStockStatus: vi.fn(),
    });

    const { StockAlertsBadge } = await import('../StockAlertsBadge');
    render(
      <TestWrapper>
        <StockAlertsBadge />
      </TestWrapper>
    );

    // Should show count of 2 alerts (1 critical, 1 warning)
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

describe('StaleDataWarning', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when data is fresh', async () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const recentSync = new Date(now - 1000).toISOString();

    const { StaleDataWarning } = await import('../StaleDataWarning');
    const { container } = render(
      <TestWrapper>
        <StaleDataWarning lastSyncAt={recentSync} />
      </TestWrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders warning when data is stale', async () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const oldSync = new Date(now - STALE_DATA_THRESHOLD_MS - 60000).toISOString();

    const { StaleDataWarning } = await import('../StaleDataWarning');
    render(
      <TestWrapper>
        <StaleDataWarning lastSyncAt={oldSync} />
      </TestWrapper>
    );

    // Should show the stale warning alert
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders warning when lastSyncAt is null', async () => {
    const { StaleDataWarning } = await import('../StaleDataWarning');
    render(
      <TestWrapper>
        <StaleDataWarning lastSyncAt={null} />
      </TestWrapper>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
