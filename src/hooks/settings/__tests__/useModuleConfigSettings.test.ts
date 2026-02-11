/**
 * Tests for Epic 10 module configuration settings hooks
 *
 * Verifies that each hook:
 * 1. Returns defaults when the store is empty
 * 2. Returns stored values when settings are present
 */

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock the Zustand store
const mockGetSetting = vi.fn()

vi.mock('@/stores/settings/coreSettingsStore', () => ({
  useCoreSettingsStore: (selector: (state: { getSetting: typeof mockGetSetting }) => unknown) =>
    selector({ getSetting: mockGetSetting }),
}))

import {
  usePOSConfigSettings,
  useFinancialSettings,
  useInventoryConfigSettings,
  useLoyaltySettings,
  useB2BSettings,
  useKDSConfigSettings,
  useDisplaySettings,
  useSyncAdvancedSettings,
  useSecurityPinSettings,
  usePrintingServerSettings,
  POS_CONFIG_DEFAULTS,
  FINANCIAL_DEFAULTS,
  INVENTORY_CONFIG_DEFAULTS,
  LOYALTY_DEFAULTS,
  B2B_DEFAULTS,
  KDS_CONFIG_DEFAULTS,
  DISPLAY_DEFAULTS,
  SYNC_ADVANCED_DEFAULTS,
  SECURITY_PIN_DEFAULTS,
  PRINTING_SERVER_DEFAULTS,
} from '../useModuleConfigSettings'

beforeEach(() => {
  mockGetSetting.mockReset()
})

// Helper to make getSetting return values for specific keys
function mockSettings(overrides: Record<string, unknown>) {
  mockGetSetting.mockImplementation((key: string) => overrides[key] ?? null)
}

describe('usePOSConfigSettings', () => {
  it('returns defaults when store is empty', () => {
    mockGetSetting.mockReturnValue(null)
    const { result } = renderHook(() => usePOSConfigSettings())
    expect(result.current).toEqual(POS_CONFIG_DEFAULTS)
  })

  it('returns stored values when present', () => {
    mockSettings({
      'pos_config.quick_payment_amounts': [10000, 20000],
      'pos_config.max_discount_percentage': 50,
      'pos_config.void_required_roles': ['admin'],
    })
    const { result } = renderHook(() => usePOSConfigSettings())
    expect(result.current.quickPaymentAmounts).toEqual([10000, 20000])
    expect(result.current.maxDiscountPercentage).toBe(50)
    expect(result.current.voidRequiredRoles).toEqual(['admin'])
    // Non-overridden values get defaults
    expect(result.current.shiftOpeningCashPresets).toEqual(POS_CONFIG_DEFAULTS.shiftOpeningCashPresets)
  })
})

describe('useFinancialSettings', () => {
  it('returns defaults when store is empty', () => {
    mockGetSetting.mockReturnValue(null)
    const { result } = renderHook(() => useFinancialSettings())
    expect(result.current).toEqual(FINANCIAL_DEFAULTS)
  })

  it('returns stored values when present', () => {
    mockSettings({
      'financial.currency_rounding_unit': 500,
      'financial.max_payment_amount': 5000000,
    })
    const { result } = renderHook(() => useFinancialSettings())
    expect(result.current.currencyRoundingUnit).toBe(500)
    expect(result.current.maxPaymentAmount).toBe(5000000)
    expect(result.current.roundingTolerance).toBe(FINANCIAL_DEFAULTS.roundingTolerance)
  })
})

describe('useInventoryConfigSettings', () => {
  it('returns defaults when store is empty', () => {
    mockGetSetting.mockReturnValue(null)
    const { result } = renderHook(() => useInventoryConfigSettings())
    expect(result.current).toEqual(INVENTORY_CONFIG_DEFAULTS)
  })

  it('returns stored values when present', () => {
    mockSettings({
      'inventory_config.stock_warning_threshold': 20,
      'inventory_config.stock_critical_threshold': 8,
      'inventory_config.reorder_lookback_days': 14,
    })
    const { result } = renderHook(() => useInventoryConfigSettings())
    expect(result.current.stockWarningThreshold).toBe(20)
    expect(result.current.stockCriticalThreshold).toBe(8)
    expect(result.current.reorderLookbackDays).toBe(14)
    expect(result.current.maxStockMultiplier).toBe(INVENTORY_CONFIG_DEFAULTS.maxStockMultiplier)
  })
})

describe('useLoyaltySettings', () => {
  it('returns defaults when store is empty', () => {
    mockGetSetting.mockReturnValue(null)
    const { result } = renderHook(() => useLoyaltySettings())
    expect(result.current).toEqual(LOYALTY_DEFAULTS)
  })

  it('returns stored values when present', () => {
    const customTierDiscounts = { bronze: 0, silver: 10, gold: 15, platinum: 20 }
    mockSettings({
      'loyalty.tier_discounts': customTierDiscounts,
      'loyalty.points_per_idr': 500,
    })
    const { result } = renderHook(() => useLoyaltySettings())
    expect(result.current.tierDiscounts).toEqual(customTierDiscounts)
    expect(result.current.pointsPerIdr).toBe(500)
    expect(result.current.tierThresholds).toEqual(LOYALTY_DEFAULTS.tierThresholds)
  })
})

describe('useB2BSettings', () => {
  it('returns defaults when store is empty', () => {
    mockGetSetting.mockReturnValue(null)
    const { result } = renderHook(() => useB2BSettings())
    expect(result.current).toEqual(B2B_DEFAULTS)
  })

  it('returns stored values when present', () => {
    mockSettings({
      'b2b.default_payment_terms_days': 60,
      'b2b.payment_term_options': ['cod', 'net30'],
    })
    const { result } = renderHook(() => useB2BSettings())
    expect(result.current.defaultPaymentTermsDays).toBe(60)
    expect(result.current.paymentTermOptions).toEqual(['cod', 'net30'])
    expect(result.current.agingBuckets).toEqual(B2B_DEFAULTS.agingBuckets)
  })
})

describe('useKDSConfigSettings', () => {
  it('returns defaults when store is empty', () => {
    mockGetSetting.mockReturnValue(null)
    const { result } = renderHook(() => useKDSConfigSettings())
    expect(result.current).toEqual(KDS_CONFIG_DEFAULTS)
  })

  it('returns stored values when present', () => {
    mockSettings({
      'kds_config.urgency_warning_seconds': 180,
      'kds_config.poll_interval_ms': 3000,
    })
    const { result } = renderHook(() => useKDSConfigSettings())
    expect(result.current.urgencyWarningSeconds).toBe(180)
    expect(result.current.pollIntervalMs).toBe(3000)
    expect(result.current.autoRemoveDelayMs).toBe(KDS_CONFIG_DEFAULTS.autoRemoveDelayMs)
  })
})

describe('useDisplaySettings', () => {
  it('returns defaults when store is empty', () => {
    mockGetSetting.mockReturnValue(null)
    const { result } = renderHook(() => useDisplaySettings())
    expect(result.current).toEqual(DISPLAY_DEFAULTS)
  })

  it('returns stored values when present', () => {
    mockSettings({
      'display.idle_timeout_seconds': 60,
      'display.broadcast_debounce_ms': 200,
    })
    const { result } = renderHook(() => useDisplaySettings())
    expect(result.current.idleTimeoutSeconds).toBe(60)
    expect(result.current.broadcastDebounceMs).toBe(200)
    expect(result.current.promoRotationIntervalSeconds).toBe(DISPLAY_DEFAULTS.promoRotationIntervalSeconds)
  })
})

describe('useSyncAdvancedSettings', () => {
  it('returns defaults when store is empty', () => {
    mockGetSetting.mockReturnValue(null)
    const { result } = renderHook(() => useSyncAdvancedSettings())
    expect(result.current).toEqual(SYNC_ADVANCED_DEFAULTS)
  })

  it('returns stored values when present', () => {
    mockSettings({
      'sync_advanced.startup_delay_ms': 3000,
      'sync_advanced.max_retries': 10,
      'sync_advanced.lan_heartbeat_interval_ms': 15000,
    })
    const { result } = renderHook(() => useSyncAdvancedSettings())
    expect(result.current.startupDelayMs).toBe(3000)
    expect(result.current.maxRetries).toBe(10)
    expect(result.current.lanHeartbeatIntervalMs).toBe(15000)
    expect(result.current.backgroundIntervalMs).toBe(SYNC_ADVANCED_DEFAULTS.backgroundIntervalMs)
  })
})

describe('useSecurityPinSettings', () => {
  it('returns defaults when store is empty', () => {
    mockGetSetting.mockReturnValue(null)
    const { result } = renderHook(() => useSecurityPinSettings())
    expect(result.current).toEqual(SECURITY_PIN_DEFAULTS)
  })

  it('returns stored values when present', () => {
    mockSettings({
      'security.pin_min_length': 6,
      'security.pin_max_attempts': 5,
    })
    const { result } = renderHook(() => useSecurityPinSettings())
    expect(result.current.pinMinLength).toBe(6)
    expect(result.current.pinMaxAttempts).toBe(5)
    expect(result.current.pinMaxLength).toBe(SECURITY_PIN_DEFAULTS.pinMaxLength)
  })
})

describe('usePrintingServerSettings', () => {
  it('returns defaults when store is empty', () => {
    mockGetSetting.mockReturnValue(null)
    const { result } = renderHook(() => usePrintingServerSettings())
    expect(result.current).toEqual(PRINTING_SERVER_DEFAULTS)
  })

  it('returns stored values when present', () => {
    mockSettings({
      'printing.server_url': 'http://192.168.1.100:3001',
      'printing.request_timeout_ms': 10000,
    })
    const { result } = renderHook(() => usePrintingServerSettings())
    expect(result.current.serverUrl).toBe('http://192.168.1.100:3001')
    expect(result.current.requestTimeoutMs).toBe(10000)
    expect(result.current.healthCheckTimeoutMs).toBe(PRINTING_SERVER_DEFAULTS.healthCheckTimeoutMs)
  })
})
