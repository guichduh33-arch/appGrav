// Epic 10: Typed interfaces for module configuration settings
// Each interface maps to a settings category in the DB

export interface IPOSConfigSettings {
  quickPaymentAmounts: number[]
  shiftOpeningCashPresets: number[]
  quickDiscountPercentages: number[]
  maxDiscountPercentage: number
  shiftReconciliationTolerance: number
  refundMethods: string[]
  voidRequiredRoles: string[]
  refundRequiredRoles: string[]
  shiftRequiredRoles: string[]
}

export interface IFinancialSettings {
  maxPaymentAmount: number
  currencyRoundingUnit: number
  roundingTolerance: number
  referenceRequiredMethods: string[]
}

export interface IInventoryConfigSettings {
  stockWarningThreshold: number
  stockCriticalThreshold: number
  stockPercentageWarning: number
  stockPercentageCritical: number
  reorderLookbackDays: number
  productionLookbackDays: number
  maxStockMultiplier: number
  poLeadTimeDays: number
  stockMovementsDefaultLimit: number
  stockMovementsProductLimit: number
  lowStockRefreshIntervalSeconds: number
  productionPriorityHighThreshold: number
  productionPriorityMediumThreshold: number
}

export interface ILoyaltyTierMap {
  bronze: number
  silver: number
  gold: number
  platinum: number
}

export interface ILoyaltyColorMap {
  bronze: string
  silver: string
  gold: string
  platinum: string
}

export interface ILoyaltySettings {
  tierDiscounts: ILoyaltyTierMap
  tierThresholds: ILoyaltyTierMap
  tierColors: ILoyaltyColorMap
  pointsPerIdr: number
  defaultCustomerCategorySlug: string
}

export interface IAgingBucket {
  label: string
  min: number
  max: number | null
}

export interface IB2BSettings {
  defaultPaymentTermsDays: number
  criticalOverdueThresholdDays: number
  agingBuckets: IAgingBucket[]
  paymentTermOptions: string[]
}

export interface IKDSConfigSettings {
  urgencyWarningSeconds: number
  urgencyCriticalSeconds: number
  autoRemoveDelayMs: number
  pollIntervalMs: number
  exitAnimationDurationMs: number
}

export interface IDisplaySettings {
  idleTimeoutSeconds: number
  promoRotationIntervalSeconds: number
  readyOrderVisibleDurationMinutes: number
  broadcastDebounceMs: number
}

export interface ISyncAdvancedSettings {
  startupDelayMs: number
  backgroundIntervalMs: number
  itemProcessDelayMs: number
  retryBackoffDelaysMs: number[]
  maxQueueSize: number
  maxRetries: number
  cacheTtlDefaultHours: number
  cacheTtlOrdersHours: number
  cacheRefreshIntervalHours: number
  lanHeartbeatIntervalMs: number
  lanStaleTimeoutMs: number
  lanMaxReconnectAttempts: number
  lanReconnectBackoffBaseMs: number
  lanReconnectBackoffMaxMs: number
}

export interface ISecurityPinSettings {
  pinMinLength: number
  pinMaxLength: number
  pinMaxAttempts: number
  pinCooldownMinutes: number
}

export interface IPrintingServerSettings {
  serverUrl: string
  requestTimeoutMs: number
  healthCheckTimeoutMs: number
}
