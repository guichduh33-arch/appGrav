/**
 * CSV Customer Import Service (F1 gap)
 *
 * Parses CSV files and upserts customers into Supabase.
 * Expected CSV columns: name, phone, email, company_name, category_slug, notes
 */

import { supabase } from '@/lib/supabase'

export interface ICsvImportResult {
  imported: number
  skipped: number
  errors: string[]
}

interface ICsvRow {
  name: string
  phone?: string
  email?: string
  company_name?: string
  category_slug?: string
  notes?: string
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
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

function parseCsv(text: string): ICsvRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'))
  const nameIdx = headers.indexOf('name')
  if (nameIdx === -1) throw new Error('CSV must have a "name" column')

  return lines.slice(1).map(line => {
    const fields = parseCsvLine(line)
    const row: ICsvRow = { name: fields[nameIdx] || '' }

    const phoneIdx = headers.indexOf('phone')
    const emailIdx = headers.indexOf('email')
    const companyIdx = headers.indexOf('company_name')
    const categoryIdx = headers.indexOf('category_slug') !== -1
      ? headers.indexOf('category_slug')
      : headers.indexOf('category')
    const notesIdx = headers.indexOf('notes')

    if (phoneIdx !== -1) row.phone = fields[phoneIdx] || undefined
    if (emailIdx !== -1) row.email = fields[emailIdx] || undefined
    if (companyIdx !== -1) row.company_name = fields[companyIdx] || undefined
    if (categoryIdx !== -1) row.category_slug = fields[categoryIdx] || undefined
    if (notesIdx !== -1) row.notes = fields[notesIdx] || undefined

    return row
  })
}

export async function importCustomersFromCsv(file: File): Promise<ICsvImportResult> {
  const text = await file.text()
  const rows = parseCsv(text)

  if (rows.length === 0) {
    return { imported: 0, skipped: 0, errors: ['No data rows found in CSV'] }
  }

  // Fetch category mapping (slug -> id)
  const { data: categories } = await supabase
    .from('customer_categories')
    .select('id, slug')

  const categoryMap = new Map(
    (categories || []).map(c => [c.slug, c.id])
  )

  const result: ICsvImportResult = { imported: 0, skipped: 0, errors: [] }

  // Process in batches of 50
  const batchSize = 50
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const insertData = batch
      .filter(row => {
        if (!row.name.trim()) {
          result.skipped++
          return false
        }
        return true
      })
      .map(row => ({
        name: row.name.trim(),
        phone: row.phone || null,
        email: row.email || null,
        company_name: row.company_name || null,
        category_id: row.category_slug ? (categoryMap.get(row.category_slug) ?? null) : null,
        notes: row.notes || null,
        is_active: true,
        customer_type: 'retail' as const,
      }))

    if (insertData.length === 0) continue

    const { error } = await supabase
      .from('customers')
      .insert(insertData)

    if (error) {
      result.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`)
    } else {
      result.imported += insertData.length
    }
  }

  return result
}
