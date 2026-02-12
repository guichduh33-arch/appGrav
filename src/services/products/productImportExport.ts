/**
 * Product Import/Export Service
 * Epic 10: Stories 10.9, 10.10
 *
 * Import and export products from/to CSV with section support
 */

import { supabase } from '@/lib/supabase'
import { db } from '@/lib/db'

export interface IProductImport {
    sku: string
    name: string
    description?: string
    category?: string
    section?: string // Section slug (e.g., "breakery", "pastry", "warehouse")
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

// Story 10.10: Export products to CSV with sections
export async function exportProducts(): Promise<{ success: boolean; error?: string }> {
    try {
        // Fetch products with category
        const { data: products, error } = await supabase
            .from('products')
            .select(`
                id,
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

        // Fetch product sections with section details
        const { data: productSections } = await supabase
            .from('product_sections')
            .select(`
                product_id,
                is_primary,
                section:sections(slug, name)
            `)

        // Build a map of product_id -> primary section slug
        const sectionMap = new Map<string, string>()
        for (const ps of productSections || []) {
            // Handle Supabase relation which may return array or object
            const sectionRaw = ps.section as unknown
            const section = Array.isArray(sectionRaw) ? sectionRaw[0] : sectionRaw
            if (ps.is_primary && section) {
                sectionMap.set(ps.product_id, (section as { slug: string }).slug)
            }
        }
        // If no primary, use first section found
        for (const ps of productSections || []) {
            const sectionRaw = ps.section as unknown
            const section = Array.isArray(sectionRaw) ? sectionRaw[0] : sectionRaw
            if (!sectionMap.has(ps.product_id) && section) {
                sectionMap.set(ps.product_id, (section as { slug: string }).slug)
            }
        }

        const csvRows = [
            // Header with section
            'sku,name,description,category,section,product_type,unit,cost_price,sale_price,wholesale_price,min_stock_level,stock_quantity,is_active'
        ]

        for (const p of products || []) {
            const product = p as Record<string, unknown>
            const category = product.category as { name: string } | null
            const sectionSlug = sectionMap.get(product.id as string) || ''
            const row = [
                escapeCSV(product.sku || ''),
                escapeCSV(product.name),
                escapeCSV(product.description || ''),
                escapeCSV(category?.name || ''),
                escapeCSV(sectionSlug),
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
        downloadCSV(csvContent, `products_${new Date().toISOString().split('T')[0]}.csv`)

        return { success: true }
    } catch (err) {
        console.error('Export error:', err)
        return { success: false, error: 'Error during export' }
    }
}

// Story 10.10: Export product template for import with sections
export function downloadImportTemplate(): void {
    const template = `sku,name,description,category,section,product_type,unit,cost_price,sale_price,wholesale_price,min_stock_level,stock_quantity,is_active
PRD-001,Chocolate croissant,Chocolate pastry,Pastries,pastry,finished,piece,5000,15000,12000,10,50,true
PRD-002,Traditional baguette,French traditional bread,Breads,breakery,finished,piece,3000,8000,6500,20,100,true
ING-001,Flour T55,Type 55 wheat flour,Ingredients,warehouse,raw_material,kg,15000,0,,50,200,true`

    downloadCSV(template, 'product_import_template.csv')
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

// Story 10.10: Import products from CSV with section support
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
            errors: [{ row: 0, sku: '', error: 'Empty file or invalid format' }]
        }
    }

    // Get category mapping
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')

    const categoryMap = new Map<string, string>()
    for (const cat of categories || []) {
        if (cat.name) {
            categoryMap.set(cat.name.toLowerCase(), cat.id)
        }
    }

    // Get section mapping (only active sections)
    const { data: sections } = await supabase
        .from('sections')
        .select('id, slug, name')
        .eq('is_active', true)

    const sectionMap = new Map<string, string>()
    for (const sec of sections || []) {
        if (sec.slug) {
            sectionMap.set(sec.slug.toLowerCase(), sec.id)
        }
        if (sec.name) {
            sectionMap.set(sec.name.toLowerCase(), sec.id) // Also map by name
        }
    }

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowNum = i + 2 // Account for header and 0-index

        try {
            // Validate required fields
            if (!row.sku || !row.name || !row.product_type || !row.unit) {
                throw new Error('Missing required fields (sku, name, product_type, unit)')
            }

            // Validate product_type
            if (!['finished', 'semi_finished', 'raw_material'].includes(row.product_type)) {
                throw new Error('Invalid product type')
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
                        categoryMap.set(row.category.toLowerCase(), newCat.id)
                    }
                }
            }

            // Get section ID if provided
            let sectionId: string | null = null
            if (row.section) {
                sectionId = sectionMap.get(row.section.toLowerCase()) || null
                if (!sectionId) {
                    // Section not found - add warning but continue
                    console.warn(`Section "${row.section}" not found for SKU ${row.sku}`)
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

            let productId: string | null = null

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
                    productId = existing.id
                    result.updated++
                } else {
                    result.errors.push({
                        row: rowNum,
                        sku: row.sku,
                        error: 'Product already exists (enable "Update" to modify)'
                    })
                    continue
                }
            } else {
                const { data: newProduct, error } = await supabase
                    .from('products')
                    .insert(productData)
                    .select('id')
                    .single()

                if (error) throw error
                productId = newProduct?.id || null
                result.created++
            }

            // Link product to section if both exist
            if (productId && sectionId) {
                // First, remove existing primary section if updating
                if (existing && options?.updateExisting) {
                    await supabase
                        .from('product_sections')
                        .update({ is_primary: false })
                        .eq('product_id', productId)
                        .eq('is_primary', true)
                }

                // Upsert product_section link
                await supabase
                    .from('product_sections')
                    .upsert({
                        product_id: productId,
                        section_id: sectionId,
                        is_primary: true
                    }, {
                        onConflict: 'product_id,section_id'
                    })
            }
        } catch (err) {
            result.errors.push({
                row: rowNum,
                sku: row.sku || '',
                error: err instanceof Error ? err.message : 'Unknown error'
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

/**
 * Push local IndexedDB products and categories to Supabase (Recovery Utility)
 * 
 * Used when products were imported locally but failed to reach the cloud.
 */
export async function pushLocalProductsToCloud(): Promise<IImportResult> {
    const result: IImportResult = {
        success: true,
        created: 0,
        updated: 0,
        errors: []
    }

    try {
        // 1. Get all local data
        const localProducts = await db.offline_products.toArray()
        const localCategories = await db.offline_categories.toArray()

        if (localProducts.length === 0) {
            return {
                success: true,
                created: 0,
                updated: 0,
                errors: [{ row: 0, sku: '', error: 'No local products to synchronize' }]
            }
        }

        // 2. Sync Categories first
        const categoryMap = new Map<string, string>()
        for (const cat of localCategories) {
            try {
                const { data: syncedCat, error: catError } = await supabase
                    .from('categories')
                    .upsert({
                        id: cat.id,
                        name: cat.name,
                        updated_at: new Date().toISOString()
                    })
                    .select('id')
                    .single()

                if (catError) throw catError
                if (syncedCat) categoryMap.set(cat.id, syncedCat.id)
            } catch (err: unknown) {
                result.errors.push({ row: 0, sku: 'CAT', error: `Category ${cat.name}: ${err instanceof Error ? err.message : String(err)}` })
            }
        }

        // 3. Sync Products
        for (const prod of localProducts) {
            try {
                // Map fields from offline format to Supabase format
                // Note: The offline table uses names consistent with Supabase but some fields might be missing
                const { error: prodError } = await supabase
                    .from('products')
                    .upsert({
                        id: prod.id,
                        sku: prod.sku,
                        name: prod.name,
                        category_id: prod.category_id,
                        product_type: prod.product_type,
                        unit: prod.unit,
                        cost_price: prod.cost_price,
                        retail_price: prod.retail_price,
                        wholesale_price: prod.wholesale_price,
                        min_stock_level: prod.min_stock_level,
                        current_stock: prod.current_stock,
                        is_active: prod.is_active,
                        pos_visible: prod.pos_visible,
                        image_url: prod.image_url,
                        updated_at: new Date().toISOString()
                    })

                if (prodError) throw prodError
                result.created++ // Count as created/updated since it's an upsert
            } catch (err: unknown) {
                result.errors.push({ row: 0, sku: prod.sku || 'N/A', error: err instanceof Error ? err.message : String(err) })
            }
        }
    } catch (err: unknown) {
        result.success = false
        result.errors.push({ row: 0, sku: 'GLOBAL', error: err instanceof Error ? err.message : String(err) })
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
