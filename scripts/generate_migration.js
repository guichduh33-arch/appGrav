
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

// Setup
const url = 'https://dzlkcuekwybgvrzutzbb.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bGtjdWVrd3liZ3ZyenV0emJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTg1NTQsImV4cCI6MjA4Mzg3NDU1NH0.I52t1zBWLWlG16pjT9m4YuVBWFJ_lA4s2rMRVSvMXmU'
const supabase = createClient(url, key)

const CSV_PATH = 'CSV Files/Recipe_Master_Data (2).csv'
const OUT_PATH = 'supabase/migrations/010_import_master.sql'

async function generate() {
    console.log('Fetching existing products...')
    // optimized fetch: just name and sku
    let { data: products, error } = await supabase
        .from('products')
        .select('name, sku')

    // Handle potential pagination if > 1000 items (Supabase default limit)
    // For now assuming < 1000 based on previous checks (231 items)

    if (error) {
        console.error('Error fetching products:', error)
        return
    }

    const nameToSku = new Map()
    products.forEach(p => {
        if (p.name) nameToSku.set(p.name.trim().toLowerCase(), p.sku)
    })

    console.log(`Loaded ${nameToSku.size} existing products.`)

    console.log('Reading CSV...')
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    })

    /* 
      Record structure: 
      { Title: '...', Product: '...', Material: '...', 'Materiall: uom': '...', Quantity: '...' }
    */

    const newProducts = new Map() // Name -> { sku, type, unit }
    const recipes = [] // { productVal, materialVal, quantity, unit }

    // Helper to clean numbers (handle "1,234" European style or "1.234")
    const parseQty = (str) => {
        if (!str) return 0
        // Remove quotes if present
        str = str.replace(/"/g, '')
        // Verify format. If it has comma and no dot, assume comma is decimal separator (European)
        // OR if it looks like thousands... context matters. 
        // Based on CSV view: "1,636" for Salt in Ciabatta likely means 1.636 grams? Or 1636?
        // Let's assume European decimal comma for now as "1,636" gr Salt seems precise.
        // But "27,777" Potato for French Fries? Maybe that's large batch?
        // Let's replace comma with dot.
        return parseFloat(str.replace(',', '.'))
    }

    const getOrGenSku = (name, type) => {
        const key = name.trim().toLowerCase()
        if (nameToSku.has(key)) return nameToSku.get(key)
        if (newProducts.has(key)) return newProducts.get(key).sku

        // Generate new SKU
        // Prefix based on type? Or generic?
        // Let's use "GEN-" + random or slug
        const slug = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 10)
        let prefix = type === 'raw_material' ? 'RM-' : 'PR-'
        // Try to guess prefix

        const sku = `${prefix}${slug}-${Math.floor(Math.random() * 1000)}`
        return sku
    }

    // Pass 1: Identify all Products and Materials
    records.forEach(r => {
        const productName = r['Product']
        const materialName = r['Material']

        if (!productName || !materialName) return

        // register Product (Finished Good)
        const pKey = productName.trim().toLowerCase()
        if (!nameToSku.has(pKey) && !newProducts.has(pKey)) {
            newProducts.set(pKey, {
                sku: getOrGenSku(productName, 'finished'),
                name: productName,
                type: 'finished', // assumed (it's the parent of a recipe)
                unit: 'pcs' // default for finished goods
            })
        }

        // register Material (Raw Material)
        const mKey = materialName.trim().toLowerCase()
        if (!nameToSku.has(mKey) && !newProducts.has(mKey)) {
            newProducts.set(mKey, {
                sku: getOrGenSku(materialName, 'raw_material'),
                name: materialName,
                type: 'raw_material',
                unit: r['Materiall: uom']?.toLowerCase() || 'gr'
            })
        }

        recipes.push({
            productName: productName,
            materialName: materialName,
            quantity: parseQty(r['Quantity']),
            unit: r['Materiall: uom']?.toLowerCase() || 'gr'
        })
    })

    console.log(`Found ${newProducts.size} new products to insert.`)
    console.log(`Processing ${recipes.length} recipe lines.`)

    // Generate SQL
    let sql = `-- Auto-generated migration from ${CSV_PATH}\n\n`

    // 1. Insert New Products
    if (newProducts.size > 0) {
        sql += `-- 1. Insert Missing Products\n`
        sql += `INSERT INTO products (sku, name, category_id, product_type, unit, cost_price, current_stock, pos_visible) VALUES\n`

        const values = []
        for (const p of newProducts.values()) {
            // Default category: 'Others' or similar? 
            // We'll use a known generic category ID if possible, or just one of the existing ones.
            // Using ID from 006 'SFG' (c111...50) or others might be risky.
            // Let's pick a safe one or query for one. 
            // For now, hardcode a fallback Category UUID (e.g. the first one found or 'Uncategorized')
            // Using 'c1110000-0000-0000-0000-000000000052' (DRY) as generic safe fallback for RMs

            const catId = 'c1110000-0000-0000-0000-000000000052'
            const price = 0
            const stock = 100 // default dummy stock
            const visible = false

            values.push(`('${p.sku}', '${p.name.replace(/'/g, "''")}', '${catId}', '${p.type}', '${p.unit}', ${price}, ${stock}, ${visible})`)
        }
        sql += values.join(',\n')
        sql += `\nON CONFLICT (sku) DO NOTHING;\n\n`
    }

    // 2. Insert Recipes
    sql += `-- 2. Insert Recipes\n`
    // We use a temp table logic or individual insert-selects. Individual insert-selects are safer for refs.

    for (const r of recipes) {
        // Escape quotes
        const pName = r.productName.replace(/'/g, "''")
        const mName = r.materialName.replace(/'/g, "''")
        const qty = r.quantity
        const unit = r.unit

        sql += `
INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, ${qty}, '${unit}', true
FROM products p, products m
WHERE p.name = '${pName}' AND m.name = '${mName}'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = ${qty}, unit = '${unit}';
`
    }

    fs.writeFileSync(OUT_PATH, sql)
    console.log(`Done. SQL written to ${OUT_PATH}`)
}

generate().catch(console.error)
