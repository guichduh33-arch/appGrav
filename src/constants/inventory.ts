/**
 * Inventory Constants
 * Centralized configuration for stock movements and inventory management
 */

import { ReactNode } from 'react'

// Movement type definitions
export const MOVEMENT_TYPES = [
  'production_in',
  'production_out',
  'stock_in',
  'purchase',
  'sale',
  'sale_pos',
  'sale_b2b',
  'waste',
  'adjustment',
  'adjustment_in',
  'adjustment_out',
  'transfer',
  'opname'
] as const

export type TMovementType = typeof MOVEMENT_TYPES[number]

export type TMovementFilterType = 'all' | TMovementType

// Movement configuration interface
export interface IMovementConfig {
  label: string
  labelKey: string // i18n key
  icon: ReactNode
  bgColor: string
  textColor: string
  borderColor: string
  description: string
  descriptionKey: string // i18n key
}

// Movement configuration - colors and styles only (icons added at component level)
export const MOVEMENT_STYLES: Record<string, Omit<IMovementConfig, 'icon'>> = {
  production_in: {
    label: 'Production In',
    labelKey: 'stock_movements.types.production_in',
    bgColor: '#FEF3C7',
    textColor: '#B45309',
    borderColor: '#FCD34D',
    description: 'Finished/semi-finished produced',
    descriptionKey: 'stock_movements.descriptions.production_in'
  },
  production_out: {
    label: 'Production Out',
    labelKey: 'stock_movements.types.production_out',
    bgColor: '#FDF2F8',
    textColor: '#BE185D',
    borderColor: '#F9A8D4',
    description: 'Ingredients used in production',
    descriptionKey: 'stock_movements.descriptions.production_out'
  },
  stock_in: {
    label: 'Stock In',
    labelKey: 'stock_movements.types.stock_in',
    bgColor: '#D1FAE5',
    textColor: '#047857',
    borderColor: '#6EE7B7',
    description: 'Purchase / Supplier receipt',
    descriptionKey: 'stock_movements.descriptions.stock_in'
  },
  purchase: {
    label: 'Purchase',
    labelKey: 'stock_movements.types.purchase',
    bgColor: '#D1FAE5',
    textColor: '#047857',
    borderColor: '#6EE7B7',
    description: 'Supplier order received',
    descriptionKey: 'stock_movements.descriptions.purchase'
  },
  sale: {
    label: 'Sale',
    labelKey: 'stock_movements.types.sale',
    bgColor: '#DBEAFE',
    textColor: '#1D4ED8',
    borderColor: '#93C5FD',
    description: 'Sold at POS',
    descriptionKey: 'stock_movements.descriptions.sale'
  },
  sale_pos: {
    label: 'Sale POS',
    labelKey: 'stock_movements.types.sale_pos',
    bgColor: '#DBEAFE',
    textColor: '#1D4ED8',
    borderColor: '#93C5FD',
    description: 'Sold at POS',
    descriptionKey: 'stock_movements.descriptions.sale_pos'
  },
  sale_b2b: {
    label: 'Sale B2B',
    labelKey: 'stock_movements.types.sale_b2b',
    bgColor: '#E0E7FF',
    textColor: '#4338CA',
    borderColor: '#A5B4FC',
    description: 'B2B wholesale sale',
    descriptionKey: 'stock_movements.descriptions.sale_b2b'
  },
  waste: {
    label: 'Waste',
    labelKey: 'stock_movements.types.waste',
    bgColor: '#FEE2E2',
    textColor: '#DC2626',
    borderColor: '#FCA5A5',
    description: 'Loss / Breakage',
    descriptionKey: 'stock_movements.descriptions.waste'
  },
  adjustment: {
    label: 'Adjustment',
    labelKey: 'stock_movements.types.adjustment',
    bgColor: '#F3F4F6',
    textColor: '#4B5563',
    borderColor: '#D1D5DB',
    description: 'Stock adjustment',
    descriptionKey: 'stock_movements.descriptions.adjustment'
  },
  adjustment_in: {
    label: 'Adjustment +',
    labelKey: 'stock_movements.types.adjustment_in',
    bgColor: '#D1FAE5',
    textColor: '#047857',
    borderColor: '#6EE7B7',
    description: 'Positive adjustment',
    descriptionKey: 'stock_movements.descriptions.adjustment_in'
  },
  adjustment_out: {
    label: 'Adjustment -',
    labelKey: 'stock_movements.types.adjustment_out',
    bgColor: '#FEE2E2',
    textColor: '#DC2626',
    borderColor: '#FCA5A5',
    description: 'Negative adjustment',
    descriptionKey: 'stock_movements.descriptions.adjustment_out'
  },
  transfer: {
    label: 'Transfer',
    labelKey: 'stock_movements.types.transfer',
    bgColor: '#E0E7FF',
    textColor: '#4338CA',
    borderColor: '#A5B4FC',
    description: 'Transfer between locations',
    descriptionKey: 'stock_movements.descriptions.transfer'
  },
  opname: {
    label: 'Opname',
    labelKey: 'stock_movements.types.opname',
    bgColor: '#F3F4F6',
    textColor: '#4B5563',
    borderColor: '#D1D5DB',
    description: 'Stock count adjustment',
    descriptionKey: 'stock_movements.descriptions.opname'
  }
}

// Helper to get movement style with fallback
export function getMovementStyle(type: string): Omit<IMovementConfig, 'icon'> {
  return MOVEMENT_STYLES[type] || {
    label: type,
    labelKey: `stock_movements.types.${type}`,
    bgColor: '#F3F4F6',
    textColor: '#6B7280',
    borderColor: '#E5E7EB',
    description: 'Movement',
    descriptionKey: 'stock_movements.descriptions.unknown'
  }
}

// Stock thresholds
export const STOCK_THRESHOLDS = {
  WARNING: 10,
  CRITICAL: 5
} as const

// Query limits
export const QUERY_LIMITS = {
  STOCK_MOVEMENTS_DEFAULT: 500,
  STOCK_MOVEMENTS_PRODUCT: 100
} as const

// Stock adjustment types for modal
export const STOCK_ADJUSTMENT_TYPES = [
  { value: 'stock_in', labelKey: 'stock_adjustment.types.stock_in' },
  { value: 'waste', labelKey: 'stock_adjustment.types.waste' },
  { value: 'adjustment_in', labelKey: 'stock_adjustment.types.adjustment_in' },
  { value: 'adjustment_out', labelKey: 'stock_adjustment.types.adjustment_out' },
  { value: 'transfer', labelKey: 'stock_adjustment.types.transfer' }
] as const
