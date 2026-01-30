/**
 * Recipe Import/Export Service
 *
 * Import and export product recipes from/to CSV
 * Format: product_sku, material_sku, quantity, unit
 */

import { supabase } from '@/lib/supabase'

export interface IRecipeImport {
    product_sku: string      // SKU du produit fini
    material_sku: string     // SKU de l'ingrédient
    quantity: number         // Quantité nécessaire
    unit?: string            // Unité (optionnel, utilise l'unité du matériau par défaut)
}

export interface IRecipeImportResult {
    success: boolean
    created: number
    updated: number
    errors: Array<{ row: number; product_sku: string; material_sku: string; error: string }>
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
        downloadCSV(csvContent, `recettes_${new Date().toISOString().split('T')[0]}.csv`)

        return { success: true }
    } catch (err) {
        console.error('Export recipes error:', err)
        return { success: false, error: 'Erreur lors de l\'export des recettes' }
    }
}

// Download recipe import template
export function downloadRecipeImportTemplate(): void {
    const template = `product_sku,material_sku,quantity,unit
PRD-001,ING-001,0.250,kg
PRD-001,ING-002,0.100,kg
PRD-001,ING-003,2,pièce
PRD-002,ING-001,0.500,kg
PRD-002,ING-004,0.050,L`

    downloadCSV(template, 'template_import_recettes.csv')
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
            errors: [{ row: 0, product_sku: '', material_sku: '', error: 'Fichier vide ou format invalide' }]
        }
    }

    // Get all products for SKU lookup
    const { data: products } = await supabase
        .from('products')
        .select('id, sku, unit')

    const productMap = new Map<string, { id: string; unit: string }>()
    for (const p of products || []) {
        productMap.set(p.sku.toLowerCase(), { id: p.id, unit: p.unit || 'pcs' })
    }

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowNum = i + 2 // Account for header and 0-index

        try {
            // Validate required fields
            if (!row.product_sku || !row.material_sku || !row.quantity) {
                throw new Error('Champs obligatoires manquants (product_sku, material_sku, quantity)')
            }

            // Parse quantity
            const quantity = parseFloat(row.quantity)
            if (isNaN(quantity) || quantity <= 0) {
                throw new Error('Quantité invalide (doit être un nombre positif)')
            }

            // Look up product (finished product)
            const product = productMap.get(row.product_sku.toLowerCase())
            if (!product) {
                throw new Error(`Produit fini "${row.product_sku}" non trouvé`)
            }

            // Look up material (ingredient)
            const material = productMap.get(row.material_sku.toLowerCase())
            if (!material) {
                throw new Error(`Ingrédient "${row.material_sku}" non trouvé`)
            }

            // Prevent self-reference
            if (product.id === material.id) {
                throw new Error('Un produit ne peut pas être son propre ingrédient')
            }

            // Determine unit (use provided or material's default unit)
            const unit = row.unit || material.unit

            // Check if recipe already exists
            const { data: existing } = await supabase
                .from('recipes')
                .select('id')
                .eq('product_id', product.id)
                .eq('material_id', material.id)
                .single()

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
                        product_sku: row.product_sku,
                        material_sku: row.material_sku,
                        error: 'Recette existe déjà (activer "Mettre à jour" pour modifier)'
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
                product_sku: row.product_sku || '',
                material_sku: row.material_sku || '',
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
