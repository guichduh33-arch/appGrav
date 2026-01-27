/**
 * Product Import/Export Service
 * Epic 10: Stories 10.9, 10.10
 *
 * Import and export products from/to CSV
 */

import { supabase } from '@/lib/supabase'

export interface IProductImport {
    sku: string
    name: string
    description?: string
    category?: string
    product_type: 'finished' | 'semi_finished' | 'raw_material'
    unit: string
    cost_price: number
    sale_price: number
    wholesale_price?: number
    min_stock_level?: number
    stock_quantity?: number
    is_active?: boolean
}

export interface IImportResult {
    success: boolean
    created: number
    updated: number
    errors: Array<{ row: number; sku: string; error: string }>
}

// Story 10.10: Export products to CSV
export async function exportProducts(): Promise<{ success: boolean; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                sku,
                name,
                description,
                category:categories(name),
                product_type,
                unit,
                cost_price,
                retail_price,
                wholesale_price,
                min_stock_level,
                current_stock,
                is_active
            `)
            .order('name')

        if (error) throw error

        const csvRows = [
            // Header
            'sku,name,description,category,product_type,unit,cost_price,sale_price,wholesale_price,min_stock_level,stock_quantity,is_active'
        ]

        for (const p of data || []) {
            const product = p as unknown as Record<string, unknown>
            const category = product.category as { name: string } | null
            const row = [
                escapeCSV(product.sku || ''),
                escapeCSV(product.name),
                escapeCSV(product.description || ''),
                escapeCSV(category?.name || ''),
                escapeCSV(product.product_type),
                escapeCSV(product.unit),
                product.cost_price || 0,
                product.retail_price || 0,
                product.wholesale_price || '',
                product.min_stock_level || '',
                product.current_stock || 0,
                product.is_active ? 'true' : 'false'
            ].join(',')
            csvRows.push(row)
        }

        const csvContent = csvRows.join('\n')
        downloadCSV(csvContent, `produits_${new Date().toISOString().split('T')[0]}.csv`)

        return { success: true }
    } catch (err) {
        console.error('Export error:', err)
        return { success: false, error: 'Erreur lors de l\'export' }
    }
}

// Story 10.10: Export product template for import
export function downloadImportTemplate(): void {
    const template = `sku,name,description,category,product_type,unit,cost_price,sale_price,wholesale_price,min_stock_level,stock_quantity,is_active
PRD-001,Pain au chocolat,Viennoiserie au chocolat,Viennoiseries,finished,pièce,5000,15000,12000,10,50,true
PRD-002,Baguette tradition,Pain tradition française,Pains,finished,pièce,3000,8000,6500,20,100,true
ING-001,Farine T55,Farine de blé type 55,Ingrédients,raw_material,kg,15000,0,,50,200,true`

    downloadCSV(template, 'template_import_produits.csv')
}

// Story 10.10: Parse CSV file
function parseCSV(content: string): Record<string, string>[] {
    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const rows: Record<string, string>[] = []

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        const row: Record<string, string> = {}
        headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || ''
        })
        rows.push(row)
    }

    return rows
}

// Parse a single CSV line (handles quoted values)
function parseCSVLine(line: string): string[] {
    const values: string[] = []
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
            values.push(current)
            current = ''
        } else {
            current += char
        }
    }
    values.push(current)

    return values
}

// Story 10.10: Import products from CSV
export async function importProducts(
    fileContent: string,
    options?: {
        updateExisting?: boolean
        skipErrors?: boolean
    }
): Promise<IImportResult> {
    const rows = parseCSV(fileContent)
    const result: IImportResult = {
        success: true,
        created: 0,
        updated: 0,
        errors: []
    }

    if (rows.length === 0) {
        return {
            success: false,
            created: 0,
            updated: 0,
            errors: [{ row: 0, sku: '', error: 'Fichier vide ou format invalide' }]
        }
    }

    // Get category mapping
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')

    const categoryMap = new Map<string, string>()
    for (const cat of categories || []) {
        categoryMap.set(cat.name.toLowerCase(), cat.id)
    }

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowNum = i + 2 // Account for header and 0-index

        try {
            // Validate required fields
            if (!row.sku || !row.name || !row.product_type || !row.unit) {
                throw new Error('Champs obligatoires manquants (sku, name, product_type, unit)')
            }

            // Validate product_type
            if (!['finished', 'semi_finished', 'raw_material'].includes(row.product_type)) {
                throw new Error('Type de produit invalide')
            }

            // Get category ID
            let categoryId: string | null = null
            if (row.category) {
                categoryId = categoryMap.get(row.category.toLowerCase()) || null
                if (!categoryId) {
                    // Create category if it doesn't exist
                    const { data: newCat } = await supabase
                        .from('categories')
                        .insert({ name: row.category })
                        .select('id')
                        .single()
                    if (newCat) {
                        categoryId = newCat.id
                        categoryMap.set(row.category.toLowerCase(), categoryId)
                    }
                }
            }

            // Check if product exists
            const { data: existing } = await supabase
                .from('products')
                .select('id')
                .eq('sku', row.sku)
                .single()

            const productData = {
                sku: row.sku,
                name: row.name,
                description: row.description || null,
                category_id: categoryId,
                product_type: row.product_type as 'finished' | 'semi_finished' | 'raw_material',
                unit: row.unit,
                cost_price: parseFloat(row.cost_price) || 0,
                retail_price: parseFloat(row.sale_price) || 0,
                wholesale_price: row.wholesale_price ? parseFloat(row.wholesale_price) : null,
                min_stock_level: row.min_stock_level ? parseFloat(row.min_stock_level) : null,
                current_stock: row.stock_quantity ? parseFloat(row.stock_quantity) : 0,
                is_active: row.is_active !== 'false'
            }

            if (existing) {
                if (options?.updateExisting) {
                    const { error } = await supabase
                        .from('products')
                        .update({
                            ...productData,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existing.id)

                    if (error) throw error
                    result.updated++
                } else {
                    result.errors.push({
                        row: rowNum,
                        sku: row.sku,
                        error: 'Produit existe déjà (activer "Mettre à jour" pour modifier)'
                    })
                }
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert(productData)

                if (error) throw error
                result.created++
            }
        } catch (err) {
            result.errors.push({
                row: rowNum,
                sku: row.sku || '',
                error: err instanceof Error ? err.message : 'Erreur inconnue'
            })

            if (!options?.skipErrors) {
                result.success = false
                break
            }
        }
    }

    if (result.errors.length > 0 && !options?.skipErrors) {
        result.success = false
    }

    return result
}

// Helper functions
function escapeCSV(value: unknown): string {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

function downloadCSV(content: string, filename: string) {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
}
