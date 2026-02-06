/**
 * Recipe Import/Export Service
 *
 * Import and export product recipes from/to CSV
 * Format: product_sku, material_sku, quantity, unit
 */

import { supabase } from '@/lib/supabase'

export interface IRecipeImport {
    product_name?: string    // Product name (priority)
    material_name?: string   // Ingredient name (priority)
    product_sku?: string     // Product SKU (fallback)
    material_sku?: string    // Ingredient SKU (fallback)
    quantity: number         // Required quantity
    unit?: string            // Unit (optional, defaults to material unit)
}

export interface IRecipeImportResult {
    success: boolean
    created: number
    updated: number
    errors: Array<{ row: number; product: string; material: string; error: string }>
}

// Export all recipes to CSV
export async function exportRecipes(): Promise<{ success: boolean; error?: string }> {
    try {
        // Fetch all recipes with product and material details
        const { data: recipes, error } = await supabase
            .from('recipes')
            .select(`
                id,
                quantity,
                unit,
                product:products!recipes_product_id_fkey(sku, name),
                material:products!recipes_material_id_fkey(sku, name, unit)
            `)
            .eq('is_active', true)
            .order('product_id')

        if (error) throw error

        const csvRows = [
            // Header
            'product_sku,product_name,material_sku,material_name,quantity,unit'
        ]

        for (const r of recipes || []) {
            const recipe = r as unknown as {
                quantity: number
                unit: string | null
                product: { sku: string; name: string } | null
                material: { sku: string; name: string; unit: string } | null
            }

            if (!recipe.product || !recipe.material) continue

            const row = [
                escapeCSV(recipe.product.sku),
                escapeCSV(recipe.product.name),
                escapeCSV(recipe.material.sku),
                escapeCSV(recipe.material.name),
                recipe.quantity,
                escapeCSV(recipe.unit || recipe.material.unit || '')
            ].join(',')
            csvRows.push(row)
        }

        const csvContent = csvRows.join('\n')
        downloadCSV(csvContent, `recipes_${new Date().toISOString().split('T')[0]}.csv`)

        return { success: true }
    } catch (err) {
        console.error('Export recipes error:', err)
        return { success: false, error: 'Error during recipe export' }
    }
}

// Download recipe import template
export function downloadRecipeImportTemplate(): void {
    const template = `product_name,material_name,quantity,unit
Croissant,Butter,0.250,kg
Croissant,Flour T45,0.100,kg
Croissant,Yeast,2,piece
Chocolate croissant,Butter,0.200,kg
Chocolate croissant,Dark chocolate,0.050,kg`

    downloadCSV(template, 'recipe_import_template.csv')
}

// Parse CSV file
function parseCSV(content: string): Record<string, string>[] {
    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(' ', '_'))
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

// Import recipes from CSV
export async function importRecipes(
    fileContent: string,
    options?: {
        updateExisting?: boolean
        skipErrors?: boolean
    }
): Promise<IRecipeImportResult> {
    const rows = parseCSV(fileContent)
    const result: IRecipeImportResult = {
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
            errors: [{ row: 0, product: '', material: '', error: 'Empty file or invalid format' }]
        }
    }

    // Get all products for name and SKU lookup
    const { data: products } = await supabase
        .from('products')
        .select('id, sku, name, unit')

    // Create lookup maps (by name and by SKU)
    const productByName = new Map<string, { id: string; unit: string; name: string }[]>()
    const productBySku = new Map<string, { id: string; unit: string; name: string }>()

    for (const p of products || []) {
        const productData = { id: p.id, unit: p.unit || 'pcs', name: p.name }

        // SKU map (unique)
        productBySku.set(p.sku.toLowerCase(), productData)

        // Name map (can have duplicates)
        const nameLower = p.name.toLowerCase().trim()
        if (!productByName.has(nameLower)) {
            productByName.set(nameLower, [])
        }
        productByName.get(nameLower)!.push(productData)
    }

    // Helper to find product by name or SKU
    const findProduct = (name?: string, sku?: string): { id: string; unit: string; name: string } | null => {
        // Try name first (priority)
        if (name) {
            const nameLower = name.toLowerCase().trim()
            const matches = productByName.get(nameLower)
            if (matches && matches.length === 1) {
                return matches[0]
            }
            if (matches && matches.length > 1) {
                throw new Error(`Multiple products found with name "${name}". Use SKU to disambiguate.`)
            }
        }

        // Fallback to SKU
        if (sku) {
            const match = productBySku.get(sku.toLowerCase().trim())
            if (match) return match
        }

        return null
    }

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowNum = i + 2 // Account for header and 0-index

        // Determine product and material identifiers (support both name and sku columns)
        const productName = row.product_name || row.produit || row.product
        const productSku = row.product_sku || row.sku_produit
        const materialName = row.material_name || row.ingredient || row.material || row.materiau
        const materialSku = row.material_sku || row.sku_ingredient || row.sku_materiau

        const productIdentifier = productName || productSku || ''
        const materialIdentifier = materialName || materialSku || ''

        try {
            // Validate required fields
            if ((!productName && !productSku) || (!materialName && !materialSku) || !row.quantity) {
                throw new Error('Missing required fields (product_name/sku, material_name/sku, quantity)')
            }

            // Parse quantity
            const quantity = parseFloat(row.quantity)
            if (isNaN(quantity) || quantity <= 0) {
                throw new Error('Invalid quantity (must be a positive number)')
            }

            // Look up product (finished product)
            const product = findProduct(productName, productSku)
            if (!product) {
                throw new Error(`Product "${productIdentifier}" not found`)
            }

            // Look up material (ingredient)
            const material = findProduct(materialName, materialSku)
            if (!material) {
                throw new Error(`Ingredient "${materialIdentifier}" not found`)
            }

            // Prevent self-reference
            if (product.id === material.id) {
                throw new Error('A product cannot be its own ingredient')
            }

            // Determine unit (use provided or material's default unit)
            const unit = row.unit || row.unite || material.unit

            // Check if recipe already exists (use maybeSingle to avoid 406 error when not found)
            const { data: existing } = await supabase
                .from('recipes')
                .select('id')
                .eq('product_id', product.id)
                .eq('material_id', material.id)
                .maybeSingle()

            if (existing) {
                if (options?.updateExisting) {
                    const { error } = await supabase
                        .from('recipes')
                        .update({
                            quantity,
                            unit,
                            is_active: true,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existing.id)

                    if (error) throw error
                    result.updated++
                } else {
                    result.errors.push({
                        row: rowNum,
                        product: productIdentifier,
                        material: materialIdentifier,
                        error: 'Recipe already exists (enable "Update" to modify)'
                    })
                    continue
                }
            } else {
                const { error } = await supabase
                    .from('recipes')
                    .insert({
                        product_id: product.id,
                        material_id: material.id,
                        quantity,
                        unit,
                        is_active: true
                    })

                if (error) throw error
                result.created++
            }
        } catch (err) {
            result.errors.push({
                row: rowNum,
                product: productIdentifier,
                material: materialIdentifier,
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
