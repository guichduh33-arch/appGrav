/**
 * Unit Tests for Settings Cache Service
 *
 * Tests caching settings, tax rates, payment methods, and business hours
 * to IndexedDB for offline access.
 *
 * @see Story 1.5: Settings Offline Cache
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import {
  cacheAllSettings,
  getCachedSettings,
  getCachedSetting,
  getLastSettingsSyncAt,
  cacheTaxRates,
  getCachedTaxRates,
  getCachedActiveTaxRates,
  getCachedDefaultTaxRate,
  cachePaymentMethods,
  getCachedPaymentMethods,
  getCachedActivePaymentMethods,
  getCachedDefaultPaymentMethod,
  cacheBusinessHours,
  getCachedBusinessHours,
  cacheAllSettingsData,
  getSyncMeta,
} from '../settingsCacheService';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((_table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
  },
}));

import { supabase } from '@/lib/supabase';

// Mock data
const mockSettings = [
  {
    key: 'appearance.theme',
    value: 'light',
    category_id: 'cat-1',
    value_type: 'string',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    key: 'localization.currency',
    value: 'IDR',
    category_id: 'cat-2',
    value_type: 'string',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    key: 'pos.tax_rate',
    value: 10,
    category_id: 'cat-3',
    value_type: 'number',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockTaxRates = [
  {
    id: 'tax-1',
    name: 'PPN 10%',
    rate: 10,
    is_default: true,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tax-2',
    name: 'Tax Free',
    rate: 0,
    is_default: false,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tax-3',
    name: 'Old Tax',
    rate: 5,
    is_default: false,
    is_active: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockPaymentMethods = [
  {
    id: 'pm-1',
    name: 'Cash',
    type: 'cash',
    is_default: true,
    is_active: true,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pm-2',
    name: 'Card',
    type: 'card',
    is_default: false,
    is_active: true,
    sort_order: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pm-3',
    name: 'Disabled',
    type: 'other',
    is_default: false,
    is_active: false,
    sort_order: 99,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockBusinessHours = [
  { day_of_week: 0, open_time: null, close_time: null, is_open: false },
  { day_of_week: 1, open_time: '07:00', close_time: '21:00', is_open: true },
  { day_of_week: 2, open_time: '07:00', close_time: '21:00', is_open: true },
];

describe('settingsCacheService', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await db.offline_settings.clear();
    await db.offline_tax_rates.clear();
    await db.offline_payment_methods.clear();
    await db.offline_business_hours.clear();
    await db.offline_sync_meta.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =====================================================
  // Settings Cache Tests
  // =====================================================

  describe('cacheAllSettings', () => {
    it('should store settings in IndexedDB', async () => {
      // Mock Supabase response
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockSettings, error: null }),
      });

      await cacheAllSettings();

      const cached = await getCachedSettings();
      expect(cached).toHaveLength(3);
      expect(cached[0].key).toBe('appearance.theme');
      expect(cached[0].value).toBe('light');
    });

    it('should clear existing cache before adding new data', async () => {
      // Pre-populate cache
      await db.offline_settings.add({
        key: 'old.setting',
        value: 'old',
        category_id: 'cat-old',
        value_type: 'string',
        updated_at: '2023-01-01T00:00:00Z',
      });

      // Mock and cache new data
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockSettings, error: null }),
      });

      await cacheAllSettings();

      const cached = await getCachedSettings();
      expect(cached).toHaveLength(3);
      expect(cached.find((s) => s.key === 'old.setting')).toBeUndefined();
    });

    it('should update sync metadata', async () => {
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockSettings, error: null }),
      });

      await cacheAllSettings();

      const meta = await getSyncMeta('settings');
      expect(meta).toBeDefined();
      expect(meta?.entity).toBe('settings');
      expect(meta?.recordCount).toBe(3);
      expect(meta?.lastSyncAt).toBeDefined();
    });

    it('should throw error on Supabase failure', async () => {
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      });

      await expect(cacheAllSettings()).rejects.toMatchObject({
        message: 'Database error',
      });
    });
  });

  describe('getCachedSetting', () => {
    it('should return setting by key', async () => {
      await db.offline_settings.add({
        key: 'test.key',
        value: 'test-value',
        category_id: 'cat-1',
        value_type: 'string',
        updated_at: '2024-01-01T00:00:00Z',
      });

      const setting = await getCachedSetting('test.key');
      expect(setting).toBeDefined();
      expect(setting?.value).toBe('test-value');
    });

    it('should return undefined for non-existent key', async () => {
      const setting = await getCachedSetting('non.existent');
      expect(setting).toBeUndefined();
    });
  });

  describe('getLastSettingsSyncAt', () => {
    it('should return sync timestamp', async () => {
      await db.offline_sync_meta.add({
        entity: 'settings',
        lastSyncAt: '2024-06-15T10:30:00Z',
        recordCount: 5,
      });

      const timestamp = await getLastSettingsSyncAt();
      expect(timestamp).toBe('2024-06-15T10:30:00Z');
    });

    it('should return null if never synced', async () => {
      const timestamp = await getLastSettingsSyncAt();
      expect(timestamp).toBeNull();
    });
  });

  // =====================================================
  // Tax Rates Cache Tests
  // =====================================================

  describe('cacheTaxRates', () => {
    it('should store tax rates in IndexedDB', async () => {
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockTaxRates, error: null }),
      });

      await cacheTaxRates();

      const cached = await getCachedTaxRates();
      expect(cached).toHaveLength(3);
    });
  });

  describe('getCachedActiveTaxRates', () => {
    it('should return only active tax rates', async () => {
      // Add all tax rates - Dexie stores booleans as 0/1 in IndexedDB
      await db.offline_tax_rates.bulkAdd(
        mockTaxRates.map((t) => ({
          ...t,
          // Convert booleans to 0/1 for IndexedDB compatibility
          is_active: t.is_active ? 1 : 0,
          is_default: t.is_default ? 1 : 0,
        })) as unknown as typeof mockTaxRates
      );

      const active = await getCachedActiveTaxRates();
      // Dexie returns 1 for truthy values
      expect(active.every((t) => t.is_active)).toBe(true);
    });
  });

  describe('getCachedDefaultTaxRate', () => {
    it('should return default active tax rate', async () => {
      // Convert booleans to 0/1 for IndexedDB compatibility
      await db.offline_tax_rates.bulkAdd(
        mockTaxRates.map((t) => ({
          ...t,
          is_active: t.is_active ? 1 : 0,
          is_default: t.is_default ? 1 : 0,
        })) as unknown as typeof mockTaxRates
      );

      const defaultRate = await getCachedDefaultTaxRate();
      expect(defaultRate).toBeDefined();
      expect(defaultRate?.is_default).toBeTruthy();
      expect(defaultRate?.is_active).toBeTruthy();
    });
  });

  // =====================================================
  // Payment Methods Cache Tests
  // =====================================================

  describe('cachePaymentMethods', () => {
    it('should store payment methods in IndexedDB', async () => {
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockPaymentMethods,
          error: null,
        }),
      });

      await cachePaymentMethods();

      const cached = await getCachedPaymentMethods();
      expect(cached).toHaveLength(3);
    });
  });

  describe('getCachedActivePaymentMethods', () => {
    it('should return only active payment methods sorted by sort_order', async () => {
      // Convert booleans to 0/1 for IndexedDB compatibility
      await db.offline_payment_methods.bulkAdd(
        mockPaymentMethods.map((p) => ({
          ...p,
          is_active: p.is_active ? 1 : 0,
          is_default: p.is_default ? 1 : 0,
        })) as unknown as typeof mockPaymentMethods
      );

      const active = await getCachedActivePaymentMethods();
      expect(active.every((p) => p.is_active)).toBe(true);
      // Check sort order - only 2 active payment methods
      expect(active).toHaveLength(2);
      expect(active[0].sort_order).toBeLessThanOrEqual(active[1].sort_order);
    });
  });

  describe('getCachedDefaultPaymentMethod', () => {
    it('should return default active payment method', async () => {
      // Convert booleans to 0/1 for IndexedDB compatibility
      await db.offline_payment_methods.bulkAdd(
        mockPaymentMethods.map((p) => ({
          ...p,
          is_active: p.is_active ? 1 : 0,
          is_default: p.is_default ? 1 : 0,
        })) as unknown as typeof mockPaymentMethods
      );

      const defaultMethod = await getCachedDefaultPaymentMethod();
      expect(defaultMethod).toBeDefined();
      expect(defaultMethod?.is_default).toBeTruthy();
      expect(defaultMethod?.is_active).toBeTruthy();
    });
  });

  // =====================================================
  // Business Hours Cache Tests
  // =====================================================

  describe('cacheBusinessHours', () => {
    it('should store business hours in IndexedDB', async () => {
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockBusinessHours,
          error: null,
        }),
      });

      await cacheBusinessHours();

      const cached = await getCachedBusinessHours();
      expect(cached).toHaveLength(3);
    });
  });

  describe('getCachedBusinessHours', () => {
    it('should return business hours ordered by day_of_week', async () => {
      await db.offline_business_hours.bulkAdd(mockBusinessHours);

      const hours = await getCachedBusinessHours();
      expect(hours[0].day_of_week).toBe(0);
      expect(hours[1].day_of_week).toBe(1);
      expect(hours[2].day_of_week).toBe(2);
    });
  });

  // =====================================================
  // Orchestration Tests
  // =====================================================

  describe('cacheAllSettingsData', () => {
    it('should cache all entities in parallel', async () => {
      // Setup mock for all tables
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(
        (table: string) => ({
          select: vi.fn().mockResolvedValue({
            data:
              table === 'settings'
                ? mockSettings
                : table === 'tax_rates'
                  ? mockTaxRates
                  : table === 'payment_methods'
                    ? mockPaymentMethods
                    : mockBusinessHours,
            error: null,
          }),
        })
      );

      const result = await cacheAllSettingsData();

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.lastSyncAt).toBeDefined();

      // Verify all caches populated
      const settings = await getCachedSettings();
      const taxRates = await getCachedTaxRates();
      const paymentMethods = await getCachedPaymentMethods();
      const businessHours = await getCachedBusinessHours();

      expect(settings.length).toBeGreaterThan(0);
      expect(taxRates.length).toBeGreaterThan(0);
      expect(paymentMethods.length).toBeGreaterThan(0);
      expect(businessHours.length).toBeGreaterThan(0);
    });

    it('should return errors for partial failures', async () => {
      // Mock settings to fail, others to succeed
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(
        (table: string) => ({
          select: vi.fn().mockResolvedValue({
            data: table === 'settings' ? null : mockTaxRates,
            error: table === 'settings' ? { message: 'Settings error' } : null,
          }),
        })
      );

      const result = await cacheAllSettingsData();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('settings');
    });
  });
});
