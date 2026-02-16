// Epic 10: Typed hooks for module configuration settings
// Each hook reads from the Zustand settings store (synchronous)
// and returns a typed object with fallback defaults

import { useCoreSettingsStore } from '../../stores/settings/coreSettingsStore'
import type {
  IPOSConfigSettings,
  IDiscountPreset,
  IFinancialSettings,
  IInventoryConfigSettings,
  ILoyaltySettings,
  ILoyaltyTierMap,
  ILoyaltyColorMap,
  ILoyaltyTierStringMap,
  IAgingBucket,
  IB2BSettings,
  IKDSConfigSettings,
  IDisplaySettings,
  ISyncAdvancedSettings,
  ISecurityPinSettings,
  IPrintingServerSettings,
} from '../../types/settingsModuleConfig'

// =====================================================
// Default values (match DB default_value exactly)
// =====================================================

export const POS_CONFIG_DEFAULTS: IPOSConfigSettings = {
  quickPaymentAmounts: [50000, 100000, 150000, 200000, 500000],
  shiftOpeningCashPresets: [100000, 200000, 300000, 500000, 1000000],
  quickDiscountPercentages: [
    { name: '5%', pct: 5 },
    { name: '10%', pct: 10 },
    { name: '15%', pct: 15 },
    { name: '20%', pct: 20 },
    { name: '25%', pct: 25 },
    { name: 'Staff Meal', pct: 50 },
  ],
  maxDiscountPercentage: 100,
  shiftReconciliationTolerance: 5000,
  refundMethods: ['same', 'cash', 'card', 'transfer'],
  voidRequiredRoles: ['manager', 'admin'],
  refundRequiredRoles: ['manager', 'admin'],
  shiftRequiredRoles: ['cashier', 'manager', 'admin', 'barista'],
  modifierSelectionBehaviour: {},
}

export const FINANCIAL_DEFAULTS: IFinancialSettings = {
  maxPaymentAmount: 10000000000,
  currencyRoundingUnit: 100,
  roundingTolerance: 1,
  referenceRequiredMethods: ['card', 'qris', 'edc', 'transfer'],
}

export const INVENTORY_CONFIG_DEFAULTS: IInventoryConfigSettings = {
  stockWarningThreshold: 10,
  stockCriticalThreshold: 5,
  stockPercentageWarning: 50,
  stockPercentageCritical: 20,
  reorderLookbackDays: 30,
  productionLookbackDays: 7,
  maxStockMultiplier: 2,
  poLeadTimeDays: 7,
  stockMovementsDefaultLimit: 500,
  stockMovementsProductLimit: 100,
  lowStockRefreshIntervalSeconds: 300,
  productionPriorityHighThreshold: 20,
  productionPriorityMediumThreshold: 50,
}

export const LOYALTY_DEFAULTS: ILoyaltySettings = {
  tierDiscounts: { bronze: 0, silver: 5, gold: 8, platinum: 10 },
  tierThresholds: { bronze: 0, silver: 500, gold: 2000, platinum: 5000 },
  tierColors: { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2' },
  tierDescriptions: { bronze: 'Welcome tier', silver: 'Regular customer', gold: 'Valued customer', platinum: 'VIP customer' },
  pointsPerIdr: 1000,
  defaultCustomerCategorySlug: 'retail',
}

export const B2B_DEFAULTS: IB2BSettings = {
  defaultPaymentTermsDays: 30,
  criticalOverdueThresholdDays: 30,
  agingBuckets: [
    { label: 'Current', min: 0, max: 30 },
    { label: 'Overdue', min: 31, max: 60 },
    { label: 'Critical', min: 61, max: null },
  ],
  paymentTermOptions: ['cod', 'net15', 'net30', 'net60'],
}

export const KDS_CONFIG_DEFAULTS: IKDSConfigSettings = {
  urgencyWarningSeconds: 300,
  urgencyCriticalSeconds: 600,
  autoRemoveDelayMs: 5000,
  pollIntervalMs: 5000,
  exitAnimationDurationMs: 300,
}

export const DISPLAY_DEFAULTS: IDisplaySettings = {
  idleTimeoutSeconds: 30,
  promoRotationIntervalSeconds: 10,
  readyOrderVisibleDurationMinutes: 5,
  broadcastDebounceMs: 100,
}

export const SYNC_ADVANCED_DEFAULTS: ISyncAdvancedSettings = {
  startupDelayMs: 5000,
  backgroundIntervalMs: 30000,
  itemProcessDelayMs: 100,
  retryBackoffDelaysMs: [5000, 10000, 30000, 60000, 300000],
  maxQueueSize: 500,
  maxRetries: 5,
  cacheTtlDefaultHours: 24,
  cacheTtlOrdersHours: 168,
  cacheRefreshIntervalHours: 1,
  lanHeartbeatIntervalMs: 30000,
  lanStaleTimeoutMs: 120000,
  lanMaxReconnectAttempts: 10,
  lanReconnectBackoffBaseMs: 1000,
  lanReconnectBackoffMaxMs: 60000,
}

export const SECURITY_PIN_DEFAULTS: ISecurityPinSettings = {
  pinMinLength: 4,
  pinMaxLength: 6,
  pinMaxAttempts: 3,
  pinCooldownMinutes: 15,
}

export const PRINTING_SERVER_DEFAULTS: IPrintingServerSettings = {
  serverUrl: 'http://localhost:3001',
  requestTimeoutMs: 5000,
  healthCheckTimeoutMs: 2000,
}

// =====================================================
// Hooks
// =====================================================

/** Normalize legacy number[] to IDiscountPreset[] for backward compatibility */
function normalizeDiscountPresets(raw: unknown): IDiscountPreset[] {
  if (!Array.isArray(raw)) return POS_CONFIG_DEFAULTS.quickDiscountPercentages
  return raw.map((item) => {
    if (typeof item === 'number') return { name: `${item}%`, pct: item }
    if (typeof item === 'object' && item !== null && 'pct' in item) {
      const obj = item as { name?: string; pct: number }
      return { name: obj.name || `${obj.pct}%`, pct: obj.pct }
    }
    return null
  }).filter((p): p is IDiscountPreset => p !== null)
}

export function usePOSConfigSettings(): IPOSConfigSettings {
  const getSetting = useCoreSettingsStore((state) => state.getSetting)
  const rawDiscounts = getSetting<IDiscountPreset[] | number[]>('pos_config.quick_discount_percentages')
  return {
    quickPaymentAmounts: getSetting<number[]>('pos_config.quick_payment_amounts') ?? POS_CONFIG_DEFAULTS.quickPaymentAmounts,
    shiftOpeningCashPresets: getSetting<number[]>('pos_config.shift_opening_cash_presets') ?? POS_CONFIG_DEFAULTS.shiftOpeningCashPresets,
    quickDiscountPercentages: rawDiscounts ? normalizeDiscountPresets(rawDiscounts) : POS_CONFIG_DEFAULTS.quickDiscountPercentages,
    maxDiscountPercentage: getSetting<number>('pos_config.max_discount_percentage') ?? POS_CONFIG_DEFAULTS.maxDiscountPercentage,
    shiftReconciliationTolerance: getSetting<number>('pos_config.shift_reconciliation_tolerance') ?? POS_CONFIG_DEFAULTS.shiftReconciliationTolerance,
    refundMethods: getSetting<string[]>('pos_config.refund_methods') ?? POS_CONFIG_DEFAULTS.refundMethods,
    voidRequiredRoles: getSetting<string[]>('pos_config.void_required_roles') ?? POS_CONFIG_DEFAULTS.voidRequiredRoles,
    refundRequiredRoles: getSetting<string[]>('pos_config.refund_required_roles') ?? POS_CONFIG_DEFAULTS.refundRequiredRoles,
    shiftRequiredRoles: getSetting<string[]>('pos_config.shift_required_roles') ?? POS_CONFIG_DEFAULTS.shiftRequiredRoles,
    modifierSelectionBehaviour: getSetting<Record<string, any>>('pos_config.modifier_selection_behaviour') ?? POS_CONFIG_DEFAULTS.modifierSelectionBehaviour,
  }
}

export function useFinancialSettings(): IFinancialSettings {
  const getSetting = useCoreSettingsStore((state) => state.getSetting)
  return {
    maxPaymentAmount: getSetting<number>('financial.max_payment_amount') ?? FINANCIAL_DEFAULTS.maxPaymentAmount,
    currencyRoundingUnit: getSetting<number>('financial.currency_rounding_unit') ?? FINANCIAL_DEFAULTS.currencyRoundingUnit,
    roundingTolerance: getSetting<number>('financial.rounding_tolerance') ?? FINANCIAL_DEFAULTS.roundingTolerance,
    referenceRequiredMethods: getSetting<string[]>('financial.reference_required_methods') ?? FINANCIAL_DEFAULTS.referenceRequiredMethods,
  }
}

export function useInventoryConfigSettings(): IInventoryConfigSettings {
  const getSetting = useCoreSettingsStore((state) => state.getSetting)
  return {
    stockWarningThreshold: getSetting<number>('inventory_config.stock_warning_threshold') ?? INVENTORY_CONFIG_DEFAULTS.stockWarningThreshold,
    stockCriticalThreshold: getSetting<number>('inventory_config.stock_critical_threshold') ?? INVENTORY_CONFIG_DEFAULTS.stockCriticalThreshold,
    stockPercentageWarning: getSetting<number>('inventory_config.stock_percentage_warning') ?? INVENTORY_CONFIG_DEFAULTS.stockPercentageWarning,
    stockPercentageCritical: getSetting<number>('inventory_config.stock_percentage_critical') ?? INVENTORY_CONFIG_DEFAULTS.stockPercentageCritical,
    reorderLookbackDays: getSetting<number>('inventory_config.reorder_lookback_days') ?? INVENTORY_CONFIG_DEFAULTS.reorderLookbackDays,
    productionLookbackDays: getSetting<number>('inventory_config.production_lookback_days') ?? INVENTORY_CONFIG_DEFAULTS.productionLookbackDays,
    maxStockMultiplier: getSetting<number>('inventory_config.max_stock_multiplier') ?? INVENTORY_CONFIG_DEFAULTS.maxStockMultiplier,
    poLeadTimeDays: getSetting<number>('inventory_config.po_lead_time_days') ?? INVENTORY_CONFIG_DEFAULTS.poLeadTimeDays,
    stockMovementsDefaultLimit: getSetting<number>('inventory_config.stock_movements_default_limit') ?? INVENTORY_CONFIG_DEFAULTS.stockMovementsDefaultLimit,
    stockMovementsProductLimit: getSetting<number>('inventory_config.stock_movements_product_limit') ?? INVENTORY_CONFIG_DEFAULTS.stockMovementsProductLimit,
    lowStockRefreshIntervalSeconds: getSetting<number>('inventory_config.low_stock_refresh_interval_seconds') ?? INVENTORY_CONFIG_DEFAULTS.lowStockRefreshIntervalSeconds,
    productionPriorityHighThreshold: getSetting<number>('inventory_config.production_priority_high_threshold') ?? INVENTORY_CONFIG_DEFAULTS.productionPriorityHighThreshold,
    productionPriorityMediumThreshold: getSetting<number>('inventory_config.production_priority_medium_threshold') ?? INVENTORY_CONFIG_DEFAULTS.productionPriorityMediumThreshold,
  }
}

export function useLoyaltySettings(): ILoyaltySettings {
  const getSetting = useCoreSettingsStore((state) => state.getSetting)
  return {
    tierDiscounts: getSetting<ILoyaltyTierMap>('loyalty.tier_discounts') ?? LOYALTY_DEFAULTS.tierDiscounts,
    tierThresholds: getSetting<ILoyaltyTierMap>('loyalty.tier_thresholds') ?? LOYALTY_DEFAULTS.tierThresholds,
    tierColors: getSetting<ILoyaltyColorMap>('loyalty.tier_colors') ?? LOYALTY_DEFAULTS.tierColors,
    tierDescriptions: getSetting<ILoyaltyTierStringMap>('loyalty.tier_descriptions') ?? LOYALTY_DEFAULTS.tierDescriptions,
    pointsPerIdr: getSetting<number>('loyalty.points_per_idr') ?? LOYALTY_DEFAULTS.pointsPerIdr,
    defaultCustomerCategorySlug: getSetting<string>('loyalty.default_customer_category_slug') ?? LOYALTY_DEFAULTS.defaultCustomerCategorySlug,
  }
}

export function useB2BSettings(): IB2BSettings {
  const getSetting = useCoreSettingsStore((state) => state.getSetting)
  return {
    defaultPaymentTermsDays: getSetting<number>('b2b.default_payment_terms_days') ?? B2B_DEFAULTS.defaultPaymentTermsDays,
    criticalOverdueThresholdDays: getSetting<number>('b2b.critical_overdue_threshold_days') ?? B2B_DEFAULTS.criticalOverdueThresholdDays,
    agingBuckets: getSetting<IAgingBucket[]>('b2b.aging_buckets') ?? B2B_DEFAULTS.agingBuckets,
    paymentTermOptions: getSetting<string[]>('b2b.payment_term_options') ?? B2B_DEFAULTS.paymentTermOptions,
  }
}

export function useKDSConfigSettings(): IKDSConfigSettings {
  const getSetting = useCoreSettingsStore((state) => state.getSetting)
  return {
    urgencyWarningSeconds: getSetting<number>('kds_config.urgency_warning_seconds') ?? KDS_CONFIG_DEFAULTS.urgencyWarningSeconds,
    urgencyCriticalSeconds: getSetting<number>('kds_config.urgency_critical_seconds') ?? KDS_CONFIG_DEFAULTS.urgencyCriticalSeconds,
    autoRemoveDelayMs: getSetting<number>('kds_config.auto_remove_delay_ms') ?? KDS_CONFIG_DEFAULTS.autoRemoveDelayMs,
    pollIntervalMs: getSetting<number>('kds_config.poll_interval_ms') ?? KDS_CONFIG_DEFAULTS.pollIntervalMs,
    exitAnimationDurationMs: getSetting<number>('kds_config.exit_animation_duration_ms') ?? KDS_CONFIG_DEFAULTS.exitAnimationDurationMs,
  }
}

export function useDisplaySettings(): IDisplaySettings {
  const getSetting = useCoreSettingsStore((state) => state.getSetting)
  return {
    idleTimeoutSeconds: getSetting<number>('display.idle_timeout_seconds') ?? DISPLAY_DEFAULTS.idleTimeoutSeconds,
    promoRotationIntervalSeconds: getSetting<number>('display.promo_rotation_interval_seconds') ?? DISPLAY_DEFAULTS.promoRotationIntervalSeconds,
    readyOrderVisibleDurationMinutes: getSetting<number>('display.ready_order_visible_duration_minutes') ?? DISPLAY_DEFAULTS.readyOrderVisibleDurationMinutes,
    broadcastDebounceMs: getSetting<number>('display.broadcast_debounce_ms') ?? DISPLAY_DEFAULTS.broadcastDebounceMs,
  }
}

export function useSyncAdvancedSettings(): ISyncAdvancedSettings {
  const getSetting = useCoreSettingsStore((state) => state.getSetting)
  return {
    startupDelayMs: getSetting<number>('sync_advanced.startup_delay_ms') ?? SYNC_ADVANCED_DEFAULTS.startupDelayMs,
    backgroundIntervalMs: getSetting<number>('sync_advanced.background_interval_ms') ?? SYNC_ADVANCED_DEFAULTS.backgroundIntervalMs,
    itemProcessDelayMs: getSetting<number>('sync_advanced.item_process_delay_ms') ?? SYNC_ADVANCED_DEFAULTS.itemProcessDelayMs,
    retryBackoffDelaysMs: getSetting<number[]>('sync_advanced.retry_backoff_delays_ms') ?? SYNC_ADVANCED_DEFAULTS.retryBackoffDelaysMs,
    maxQueueSize: getSetting<number>('sync_advanced.max_queue_size') ?? SYNC_ADVANCED_DEFAULTS.maxQueueSize,
    maxRetries: getSetting<number>('sync_advanced.max_retries') ?? SYNC_ADVANCED_DEFAULTS.maxRetries,
    cacheTtlDefaultHours: getSetting<number>('sync_advanced.cache_ttl_default_hours') ?? SYNC_ADVANCED_DEFAULTS.cacheTtlDefaultHours,
    cacheTtlOrdersHours: getSetting<number>('sync_advanced.cache_ttl_orders_hours') ?? SYNC_ADVANCED_DEFAULTS.cacheTtlOrdersHours,
    cacheRefreshIntervalHours: getSetting<number>('sync_advanced.cache_refresh_interval_hours') ?? SYNC_ADVANCED_DEFAULTS.cacheRefreshIntervalHours,
    lanHeartbeatIntervalMs: getSetting<number>('sync_advanced.lan_heartbeat_interval_ms') ?? SYNC_ADVANCED_DEFAULTS.lanHeartbeatIntervalMs,
    lanStaleTimeoutMs: getSetting<number>('sync_advanced.lan_stale_timeout_ms') ?? SYNC_ADVANCED_DEFAULTS.lanStaleTimeoutMs,
    lanMaxReconnectAttempts: getSetting<number>('sync_advanced.lan_max_reconnect_attempts') ?? SYNC_ADVANCED_DEFAULTS.lanMaxReconnectAttempts,
    lanReconnectBackoffBaseMs: getSetting<number>('sync_advanced.lan_reconnect_backoff_base_ms') ?? SYNC_ADVANCED_DEFAULTS.lanReconnectBackoffBaseMs,
    lanReconnectBackoffMaxMs: getSetting<number>('sync_advanced.lan_reconnect_backoff_max_ms') ?? SYNC_ADVANCED_DEFAULTS.lanReconnectBackoffMaxMs,
  }
}

export function useSecurityPinSettings(): ISecurityPinSettings {
  const getSetting = useCoreSettingsStore((state) => state.getSetting)
  return {
    pinMinLength: getSetting<number>('security.pin_min_length') ?? SECURITY_PIN_DEFAULTS.pinMinLength,
    pinMaxLength: getSetting<number>('security.pin_max_length') ?? SECURITY_PIN_DEFAULTS.pinMaxLength,
    pinMaxAttempts: getSetting<number>('security.pin_max_attempts') ?? SECURITY_PIN_DEFAULTS.pinMaxAttempts,
    pinCooldownMinutes: getSetting<number>('security.pin_cooldown_minutes') ?? SECURITY_PIN_DEFAULTS.pinCooldownMinutes,
  }
}

export function usePrintingServerSettings(): IPrintingServerSettings {
  const getSetting = useCoreSettingsStore((state) => state.getSetting)
  return {
    serverUrl: getSetting<string>('printing.server_url') ?? PRINTING_SERVER_DEFAULTS.serverUrl,
    requestTimeoutMs: getSetting<number>('printing.request_timeout_ms') ?? PRINTING_SERVER_DEFAULTS.requestTimeoutMs,
    healthCheckTimeoutMs: getSetting<number>('printing.health_check_timeout_ms') ?? PRINTING_SERVER_DEFAULTS.healthCheckTimeoutMs,
  }
}
