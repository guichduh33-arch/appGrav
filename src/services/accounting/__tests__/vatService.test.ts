import { describe, it, expect } from 'vitest'
import {
  calculateVATFromInclusive,
  formatVATSummary,
  generateDJPExport,
  getIndonesianMonthName,
} from '../vatService'

describe('calculateVATFromInclusive', () => {
  it('calculates VAT from tax-inclusive price', () => {
    const { subtotal, vat } = calculateVATFromInclusive(110000)
    expect(vat).toBe(10000)
    expect(subtotal).toBe(100000)
  })

  it('handles zero amount', () => {
    const { subtotal, vat } = calculateVATFromInclusive(0)
    expect(vat).toBe(0)
    expect(subtotal).toBe(0)
  })

  it('rounds VAT to nearest integer', () => {
    const { vat } = calculateVATFromInclusive(115000)
    expect(Number.isInteger(vat)).toBe(true)
  })
})

describe('formatVATSummary', () => {
  it('formats summary with labels', () => {
    const result = formatVATSummary({
      collected: 1000000,
      deductible: 400000,
      payable: 600000,
    })
    expect(result.isPayable).toBe(true)
    expect(result.collectedLabel).toContain('PPN Keluaran')
    expect(result.deductibleLabel).toContain('PPN Masukan')
    expect(result.payableLabel).toContain('PPN Terutang')
  })

  it('indicates credit balance when payable is negative', () => {
    const result = formatVATSummary({
      collected: 200000,
      deductible: 500000,
      payable: -300000,
    })
    expect(result.isPayable).toBe(false)
  })
})

describe('generateDJPExport', () => {
  it('generates CSV format for DJP', () => {
    const csv = generateDJPExport(2026, 2, {
      collected: 1000000,
      deductible: 400000,
      payable: 600000,
    }, '12.345.678.9-012.000')
    expect(csv).toContain('NPWP,PERIOD,VAT_OUTPUT,VAT_INPUT,VAT_PAYABLE')
    expect(csv).toContain('12.345.678.9-012.000')
    expect(csv).toContain('202602')
    expect(csv).toContain('1000000.00')
  })
})

describe('getIndonesianMonthName', () => {
  it('returns correct month names', () => {
    expect(getIndonesianMonthName(1)).toBe('Januari')
    expect(getIndonesianMonthName(12)).toBe('Desember')
  })

  it('returns empty string for invalid month', () => {
    expect(getIndonesianMonthName(0)).toBe('')
    expect(getIndonesianMonthName(13)).toBe('')
  })
})
