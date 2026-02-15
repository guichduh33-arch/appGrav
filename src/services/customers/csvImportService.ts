/**
 * CSV Customer Import Service
 *
 * Parses CSV files, validates rows, and batch-inserts customers into Supabase.
 * Expected columns: name, phone, email, address, company_name, customer_type
 */

import { supabase } from '@/lib/supabase'

export interface ICsvImportResult {
  imported: number
  skipped: number
  errors: string[]
}

export interface IParsedCustomerRow {
  row: number
  name: string
  phone: string
  email: string
  address: string
  company_name: string
  customer_type: string
  valid: boolean
  error: string
}

const VALID_CUSTOMER_TYPES = ['retail', 'wholesale', 'b2b']

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current.trim())
  return fields
}

function columnIndex(headers: string[], ...names: string[]): number {
  for (const n of names) {
    const idx = headers.indexOf(n)
    if (idx !== -1) return idx
  }
  return -1
}

/** Parse a CSV string into validated rows ready for preview. */
export function parseCustomerCsv(text: string): IParsedCustomerRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0]).map(h =>
    h.toLowerCase().replace(/\s+/g, '_')
  )

  const nameIdx = columnIndex(headers, 'name')
  if (nameIdx === -1) throw new Error('CSV must contain a "name" column')

  const phoneIdx = columnIndex(headers, 'phone', 'phone_number')
  const emailIdx = columnIndex(headers, 'email')
  const addressIdx = columnIndex(headers, 'address')
  const companyIdx = columnIndex(headers, 'company_name', 'company')
  const typeIdx = columnIndex(headers, 'customer_type', 'type')

  return lines.slice(1).map((line, i) => {
    const f = parseCsvLine(line)
    const name = (f[nameIdx] ?? '').trim()
    const phone = phoneIdx !== -1 ? (f[phoneIdx] ?? '').trim() : ''
    const email = emailIdx !== -1 ? (f[emailIdx] ?? '').trim() : ''
    const address = addressIdx !== -1 ? (f[addressIdx] ?? '').trim() : ''
    const companyName = companyIdx !== -1 ? (f[companyIdx] ?? '').trim() : ''
    const customerType = typeIdx !== -1
      ? (f[typeIdx] ?? 'retail').trim().toLowerCase()
      : 'retail'

    let valid = true
    let error = ''

    if (!name) {
      valid = false
      error = 'Name is required'
    } else if (email && !EMAIL_RE.test(email)) {
      valid = false
      error = 'Invalid email format'
    } else if (customerType && !VALID_CUSTOMER_TYPES.includes(customerType)) {
      valid = false
      error = `Invalid type "${customerType}" (use retail, wholesale, or b2b)`
    }

    return {
      row: i + 2, // 1-indexed, skip header
      name,
      phone,
      email,
      address,
      company_name: companyName,
      customer_type: customerType || 'retail',
      valid,
      error,
    }
  })
}

/** Insert an array of validated rows into Supabase. */
export async function importCustomerRows(
  rows: IParsedCustomerRow[]
): Promise<ICsvImportResult> {
  const validRows = rows.filter(r => r.valid)
  if (validRows.length === 0) {
    return { imported: 0, skipped: rows.length, errors: ['No valid rows'] }
  }

  const result: ICsvImportResult = {
    imported: 0,
    skipped: rows.length - validRows.length,
    errors: [],
  }

  const batchSize = 50
  for (let i = 0; i < validRows.length; i += batchSize) {
    const batch = validRows.slice(i, i + batchSize).map(r => ({
      name: r.name,
      phone: r.phone || null,
      email: r.email || null,
      address: r.address || null,
      company_name: r.company_name || null,
      customer_type: r.customer_type || 'retail',
      is_active: true,
    }))

    const { error } = await supabase.from('customers').insert(batch)

    if (error) {
      result.errors.push(
        `Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`
      )
    } else {
      result.imported += batch.length
    }
  }

  return result
}

/**
 * Legacy one-shot import (kept for backward compat).
 * Parses + imports in a single call.
 */
export async function importCustomersFromCsv(
  file: File
): Promise<ICsvImportResult> {
  const text = await file.text()
  const parsed = parseCustomerCsv(text)

  if (parsed.length === 0) {
    return { imported: 0, skipped: 0, errors: ['No data rows found in CSV'] }
  }

  return importCustomerRows(parsed)
}
