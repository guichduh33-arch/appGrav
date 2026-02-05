/**
 * Unit Tests for useSettingsOffline Hook
 *
 * Tests the offline/online mode switching and data access patterns
 * for settings, tax rates, payment methods, and business hours.
 *
 * @see Story 1.5: Settings Offline Cache
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';

// Mock useNetworkStatus
const mockIsOnline = vi.fn(() => true);
vi.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: mockIsOnline(),
    isOffline: !mockIsOnline(),
  }),
}));

// Mock settingsStore
const mockStore = {
  getSetting: vi.fn((key: string) => {
    const settings: Record<string, unknown> = {
      'appearance.theme': 'dark',
      'localization.currency': 'IDR',
    };
    return settings[key] ?? null;
  }),
  taxRates: [
    {
      id: 'tax-online-1',
      name: 'Online Tax',
      rate: 10,
      is_default: true,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      description: null,
      code: null,
    },
  ],
  getActiveTaxRates: vi.fn(() => mockStore.taxRates.filter((t) => t.is_active)),
  getDefaultTaxRate: vi.fn(() =>
    mockStore.taxRates.find((t) => t.is_active && t.is_default) ?? null
  ),
  paymentMethods: [
    {
      id: 'pm-online-1',
      name_en: 'Online Cash',
      name_fr: 'Online Cash',
      name_id: 'Online Cash',
      code: 'cash',
      payment_type: 'cash',
      is_default: true,
      is_active: true,
      sort_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      icon: null,
      requires_reference: false,
      settings: null,
    },
  ],
  getActivePaymentMethods: vi.fn(() =>
    mockStore.paymentMethods.filter((p) => p.is_active)
  ),
  getDefaultPaymentMethod: vi.fn(() =>
    mockStore.paymentMethods.find((p) => p.is_active && p.is_default) ?? null
  ),
  businessHours: [
    {
      id: 'bh-online-1',
      day_of_week: 1,
      open_time: '08:00',
      close_time: '22:00',
      is_closed: false,
      break_start: null,
      break_end: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
  isLoading: false,
  isInitialized: true,
};

vi.mock('@/stores/settingsStore', () => ({
  useSettingsStore: () => mockStore,
}));

// Import after mocks are set up
import { useSettingsOffline } from '../useSettingsOffline';

// Offline mock data
const offlineSettings = [
  {
    key: 'appearance.theme',
    value: 'light',
    category_id: 'cat-1',
    value_type: 'string',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    key: 'localization.currency',
    value: 'USD',
    category_id: 'cat-2',
    value_type: 'string',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const offlineTaxRates = [
  {
    id: 'tax-offline-1',
    name: 'Offline Tax',
    rate: 5,
    is_default: true,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tax-offline-2',
    name: 'Inactive Tax',
    rate: 15,
    is_default: false,
    is_active: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const offlinePaymentMethods = [
  {
    id: 'pm-offline-1',
    name: 'Offline Cash',
    type: 'cash',
    is_default: true,
    is_active: true,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pm-offline-2',
    name: 'Offline Card',
    type: 'card',
    is_default: false,
    is_active: true,
    sort_order: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const offlineBusinessHours = [
  { day_of_week: 0, open_time: null, close_time: null, is_open: false },
  { day_of_week: 1, open_time: '07:00', close_time: '21:00', is_open: true },
];

describe('useSettingsOffline', () => {
  beforeEach(async () => {
    // Clear all tables
    await db.offline_settings.clear();
    await db.offline_tax_rates.clear();
    await db.offline_payment_methods.clear();
    await db.offline_business_hours.clear();
    await db.offline_sync_meta.clear();

    // Reset mocks
    vi.clearAllMocks();
    mockIsOnline.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =====================================================
  // Online Mode Tests
  // =====================================================

  describe('online mode', () => {
    it('should use store data when online', () => {
      const { result } = renderHook(() => useSettingsOffline());

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });

    it('should return settings from store when online', () => {
      const { result } = renderHook(() => useSettingsOffline());

      const theme = result.current.getSetting<string>('appearance.theme');
      expect(theme).toBe('dark'); // From mock store
    });

    it('should return tax rates from store when online', () => {
      const { result } = renderHook(() => useSettingsOffline());

      expect(result.current.taxRates).toHaveLength(1);
      expect(result.current.taxRates[0].id).toBe('tax-online-1');
    });

    it('should return payment methods from store when online', () => {
      const { result } = renderHook(() => useSettingsOffline());

      expect(result.current.paymentMethods).toHaveLength(1);
      expect(result.current.paymentMethods[0].id).toBe('pm-online-1');
    });

    it('should return business hours from store when online', () => {
      const { result } = renderHook(() => useSettingsOffline());

      expect(result.current.businessHours).toHaveLength(1);
      expect(result.current.businessHours[0].day_of_week).toBe(1);
    });

    it('should return null for lastSyncAt when online', () => {
      const { result } = renderHook(() => useSettingsOffline());

      expect(result.current.lastSyncAt).toBeNull();
    });
  });

  // =====================================================
  // Offline Mode Tests
  // =====================================================

  describe('offline mode', () => {
    beforeEach(async () => {
      // Populate IndexedDB with offline data
      await db.offline_settings.bulkAdd(offlineSettings);
      await db.offline_tax_rates.bulkAdd(offlineTaxRates);
      await db.offline_payment_methods.bulkAdd(offlinePaymentMethods);
      await db.offline_business_hours.bulkAdd(offlineBusinessHours);
      await db.offline_sync_meta.add({
        entity: 'settings',
        lastSyncAt: '2024-06-15T10:30:00Z',
        recordCount: 2,
      });

      // Switch to offline mode
      mockIsOnline.mockReturnValue(false);
    });

    it('should indicate offline mode', () => {
      const { result } = renderHook(() => useSettingsOffline());

      expect(result.current.isOnline).toBe(false);
      expect(result.current.isOffline).toBe(true);
    });

    it('should return settings from IndexedDB when offline', async () => {
      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        const theme = result.current.getSetting<string>('appearance.theme');
        expect(theme).toBe('light'); // From IndexedDB, not store
      });
    });

    it('should return tax rates from IndexedDB when offline', async () => {
      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        expect(result.current.taxRates.length).toBeGreaterThan(0);
        expect(result.current.taxRates[0].id).toBe('tax-offline-1');
      });
    });

    it('should filter active tax rates when offline', async () => {
      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        expect(result.current.activeTaxRates).toHaveLength(1);
        expect(result.current.activeTaxRates[0].is_active).toBe(true);
      });
    });

    it('should return default tax rate when offline', async () => {
      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        expect(result.current.defaultTaxRate).not.toBeNull();
        expect(result.current.defaultTaxRate?.is_default).toBe(true);
      });
    });

    it('should return payment methods from IndexedDB when offline', async () => {
      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        expect(result.current.paymentMethods.length).toBeGreaterThan(0);
        expect(result.current.paymentMethods[0].id).toBe('pm-offline-1');
      });
    });

    it('should filter active payment methods when offline', async () => {
      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        expect(result.current.activePaymentMethods).toHaveLength(2);
        expect(result.current.activePaymentMethods.every((p) => p.is_active)).toBe(
          true
        );
      });
    });

    it('should return default payment method when offline', async () => {
      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        expect(result.current.defaultPaymentMethod).not.toBeNull();
        expect(result.current.defaultPaymentMethod?.is_default).toBe(true);
      });
    });

    it('should return business hours from IndexedDB when offline', async () => {
      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        expect(result.current.businessHours.length).toBeGreaterThan(0);
      });
    });

    it('should return lastSyncAt from sync metadata when offline', async () => {
      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        expect(result.current.lastSyncAt).toBe('2024-06-15T10:30:00Z');
      });
    });
  });

  // =====================================================
  // Type Conversion Tests
  // =====================================================

  describe('type conversion', () => {
    beforeEach(async () => {
      await db.offline_tax_rates.bulkAdd(offlineTaxRates);
      await db.offline_payment_methods.bulkAdd(offlinePaymentMethods);
      await db.offline_business_hours.bulkAdd(offlineBusinessHours);
      mockIsOnline.mockReturnValue(false);
    });

    it('should convert offline tax rate to standard TaxRate type', async () => {
      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        const taxRate = result.current.taxRates[0];
        expect(taxRate).toHaveProperty('id');
        expect(taxRate).toHaveProperty('name_en');
        expect(taxRate).toHaveProperty('rate');
        expect(taxRate).toHaveProperty('is_default');
        expect(taxRate).toHaveProperty('is_active');
        expect(taxRate).toHaveProperty('code');
      });
    });

    it('should convert offline payment method to standard PaymentMethod type', async () => {
      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        const pm = result.current.paymentMethods[0];
        expect(pm).toHaveProperty('id');
        expect(pm).toHaveProperty('name_en');
        expect(pm).toHaveProperty('payment_type');
        expect(pm).toHaveProperty('is_default');
        expect(pm).toHaveProperty('is_active');
        expect(pm).toHaveProperty('requires_reference');
      });
    });

    it('should convert offline business hours to standard BusinessHours type', async () => {
      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        const bh = result.current.businessHours[0];
        expect(bh).toHaveProperty('id');
        expect(bh).toHaveProperty('day_of_week');
        expect(bh).toHaveProperty('open_time');
        expect(bh).toHaveProperty('close_time');
        expect(bh).toHaveProperty('is_closed');
      });
    });
  });

  // =====================================================
  // Edge Cases
  // =====================================================

  describe('edge cases', () => {
    it('should handle empty cache gracefully when offline', async () => {
      mockIsOnline.mockReturnValue(false);

      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        expect(result.current.taxRates).toEqual([]);
        expect(result.current.paymentMethods).toEqual([]);
        expect(result.current.businessHours).toEqual([]);
      });
    });

    it('should return null for non-existent setting key', async () => {
      await db.offline_settings.bulkAdd(offlineSettings);
      mockIsOnline.mockReturnValue(false);

      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        const value = result.current.getSetting('non.existent.key');
        expect(value).toBeNull();
      });
    });

    it('should parse JSON string values in settings', async () => {
      await db.offline_settings.add({
        key: 'complex.setting',
        value: JSON.stringify({ nested: { value: 42 } }),
        category_id: 'cat-1',
        value_type: 'json',
        updated_at: '2024-01-01T00:00:00Z',
      });
      mockIsOnline.mockReturnValue(false);

      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        const value = result.current.getSetting<{ nested: { value: number } }>(
          'complex.setting'
        );
        expect(value?.nested?.value).toBe(42);
      });
    });

    it('should return null for default tax rate if none is default', async () => {
      await db.offline_tax_rates.add({
        id: 'tax-no-default',
        name: 'No Default',
        rate: 10,
        is_default: false,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      });
      mockIsOnline.mockReturnValue(false);

      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        expect(result.current.defaultTaxRate).toBeNull();
      });
    });

    it('should return null for default payment method if none is default', async () => {
      await db.offline_payment_methods.add({
        id: 'pm-no-default',
        name: 'No Default',
        type: 'cash',
        is_default: false,
        is_active: true,
        sort_order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      });
      mockIsOnline.mockReturnValue(false);

      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        expect(result.current.defaultPaymentMethod).toBeNull();
      });
    });
  });

  // =====================================================
  // Loading State Tests
  // =====================================================

  describe('loading states', () => {
    it('should expose store loading state', () => {
      const { result } = renderHook(() => useSettingsOffline());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isInitialized).toBe(true);
    });
  });

  // =====================================================
  // Online/Offline Transition Tests (AC5)
  // =====================================================

  describe('online/offline transition', () => {
    beforeEach(async () => {
      // Populate IndexedDB with offline data (different from online store)
      await db.offline_settings.bulkAdd(offlineSettings);
      await db.offline_tax_rates.bulkAdd(offlineTaxRates);
      await db.offline_sync_meta.add({
        entity: 'settings',
        lastSyncAt: '2024-06-15T10:30:00Z',
        recordCount: 2,
      });
    });

    it('should switch from online to offline data when network disconnects', async () => {
      // Start online
      mockIsOnline.mockReturnValue(true);
      const { result, rerender } = renderHook(() => useSettingsOffline());

      // Verify online data
      expect(result.current.isOnline).toBe(true);
      const onlineTheme = result.current.getSetting<string>('appearance.theme');
      expect(onlineTheme).toBe('dark'); // From store

      // Simulate network disconnect
      mockIsOnline.mockReturnValue(false);
      rerender();

      // Should now use offline data
      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
        expect(result.current.isOffline).toBe(true);
        const offlineTheme = result.current.getSetting<string>('appearance.theme');
        expect(offlineTheme).toBe('light'); // From IndexedDB
      });
    });

    it('should switch from offline to online data when network reconnects', async () => {
      // Start offline
      mockIsOnline.mockReturnValue(false);
      const { result, rerender } = renderHook(() => useSettingsOffline());

      // Wait for offline data to load
      await waitFor(() => {
        expect(result.current.isOffline).toBe(true);
        expect(result.current.taxRates[0]?.id).toBe('tax-offline-1');
      });

      // Simulate network reconnect
      mockIsOnline.mockReturnValue(true);
      rerender();

      // Should now use online store data
      expect(result.current.isOnline).toBe(true);
      expect(result.current.taxRates[0].id).toBe('tax-online-1'); // From store
    });

    it('should expose getSyncMetaFor for entity-specific sync info', async () => {
      mockIsOnline.mockReturnValue(false);
      const { result } = renderHook(() => useSettingsOffline());

      await waitFor(() => {
        const settingsMeta = result.current.getSyncMetaFor('settings');
        expect(settingsMeta).toBeDefined();
        expect(settingsMeta?.lastSyncAt).toBe('2024-06-15T10:30:00Z');
      });
    });
  });
});
