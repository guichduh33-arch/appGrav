/**
 * VAT Service (Epic 9)
 * Indonesian PPN (Pajak Pertambahan Nilai) calculations and DJP export
 */

import type { IVATSummary } from '@/types/accounting'

/**
 * Calculate VAT from a tax-inclusive price
 * Indonesian PPN is 10% included in price: tax = total * 10/110
 */
export function calculateVATFromInclusive(totalInclusive: number): {
  subtotal: number
  vat: number
} {
  const vat = Math.round((totalInclusive * 10) / 110)
  return { subtotal: totalInclusive - vat, vat }
}

/**
 * Format VAT summary for display
 */
export function formatVATSummary(summary: IVATSummary): {
  collectedLabel: string
  deductibleLabel: string
  payableLabel: string
  isPayable: boolean
} {
  return {
    collectedLabel: `PPN Keluaran: ${formatCurrency(summary.collected)}`,
    deductibleLabel: `PPN Masukan: ${formatCurrency(summary.deductible)}`,
    payableLabel: `PPN Terutang: ${formatCurrency(summary.payable)}`,
    isPayable: summary.payable > 0,
  }
}

/**
 * Generate DJP (Direktorat Jenderal Pajak) CSV export format
 */
export function generateDJPExport(
  year: number,
  month: number,
  summary: IVATSummary,
  npwp: string = ''
): string {
  const period = `${year}${String(month).padStart(2, '0')}`
  const lines = [
    'NPWP,PERIOD,VAT_OUTPUT,VAT_INPUT,VAT_PAYABLE',
    `${npwp},${period},${summary.collected.toFixed(2)},${summary.deductible.toFixed(2)},${summary.payable.toFixed(2)}`,
  ]
  return lines.join('\n')
}

/**
 * Get month name in Indonesian
 */
export function getIndonesianMonthName(month: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  return months[month - 1] || ''
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount / 100) * 100)
}
