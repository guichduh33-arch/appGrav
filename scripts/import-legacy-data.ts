/**
 * Import Legacy CSV Data to Supabase
 *
 * Usage: npx tsx scripts/import-legacy-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
  console.log('Set them in your .env file or environment')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// CSV Parsing helper
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []

  const headers = parseCSVLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || ''
    })
    rows.push(row)
  }

  return rows
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)

  return result
}

// Category mapping based on CSV data
function mapDispatchStation(category: string): string {
  const lower = category.toLowerCase()
  if (lower.includes('latte') || lower.includes('coffee') || lower.includes('beverage') || lower.includes('tea')) {
    return 'barista'
  }
  if (lower.includes('sandwich') || lower.includes('bagel') || lower.includes('savouries') || lower.includes('quiche')) {
    return 'kitchen'
  }
  if (lower.includes('cake') || lower.includes('pastry') || lower.includes('croissant') || lower.includes('bread') || lower.includes('sourdough')) {
    return 'display'
  }
  return 'none'
}

function determineProductType(row: Record<string, string>): string {
  const category = row.category?.toLowerCase() || ''
  const name = row.name?.toLowerCase() || ''

  // Raw materials
  if (category.includes('condiment') || category.includes('dry') ||
      category.includes('cleaning') || category.includes('packaging') ||
      category.includes('kitchen supllies') || category.includes('supplies')) {
    return 'raw_material'
  }

  // Semi-finished
  if (category === 'sfg' || name.includes('prod') || name.includes('stock') || name.includes('dough')) {
    return 'semi_finished'
  }

  // Default to finished product
  return 'finished'
}

function generateSKU(name: string, index: number): string {
  const prefix = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .slice(0, 3)
    .map(w => w.substring(0, 3).toUpperCase())
    .join('')

  return `${prefix}-${String(index).padStart(4, '0')}`
}

function normalizeUnit(unit: string): string {
  const lower = (unit || 'pcs').toLowerCase()
  if (lower === 'gr' || lower === 'gram' || lower === 'grams') return 'g'
  if (lower === 'kg' || lower === 'kilogram') return 'kg'
  if (lower === 'ml' || lower === 'milliliter') return 'ml'
  if (lower === 'l' || lower === 'liter') return 'L'
  if (lower === 'pcs' || lower === 'piece' || lower === 'pieces') return 'pcs'
  if (lower === 'bag' || lower === 'bags') return 'bag'
  if (lower === 'roll' || lower === 'rolls') return 'roll'
  if (lower === 'cup' || lower === 'cups') return 'cup'
  return lower || 'pcs'
}

async function importData() {
  console.log('='.repeat(60))
  console.log('Legacy Data Import Script')
  console.log('='.repeat(60))

  // Read CSV files
  const rootDir = process.cwd()
  const productsPath = path.join(rootDir, 'data/legacy-csv/product data.csv')
  const recipesPath = path.join(rootDir, 'data/legacy-csv/Recipe_Master_Data (2).csv')

  console.log('\n1. Reading CSV files...')
  const productsCSV = fs.readFileSync(productsPath, 'utf-8')
  const recipesCSV = fs.readFileSync(recipesPath, 'utf-8')

  const productRows = parseCSV(productsCSV)
  const recipeRows = parseCSV(recipesCSV)

  console.log(`   - Products CSV: ${productRows.length} rows`)
  console.log(`   - Recipes CSV: ${recipeRows.length} rows`)

  // Step 1: Extract unique categories
  console.log('\n2. Processing categories...')
  const categoryNames = [...new Set(productRows.map(r => r.category).filter(Boolean))]
  console.log(`   - Found ${categoryNames.length} unique categories`)

  // Fetch existing categories
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('id, name')

  const categoryMap = new Map<string, string>()
  existingCategories?.forEach(c => categoryMap.set(c.name.toLowerCase(), c.id))

  // Create missing categories
  const newCategories = categoryNames.filter(name => !categoryMap.has(name.toLowerCase()))

  if (newCategories.length > 0) {
    console.log(`   - Creating ${newCategories.length} new categories...`)

    const categoriesToInsert = newCategories.map((name, index) => ({
      name,
      dispatch_station: mapDispatchStation(name),
      is_raw_material: ['CONDIMENT', 'DRY', 'CLEANING', 'PACKAGING', 'KITCHEN SUPLLIES'].includes(name.toUpperCase()),
      sort_order: existingCategories?.length || 0 + index,
      is_active: true
    }))

    const { data: insertedCategories, error: catError } = await supabase
      .from('categories')
      .insert(categoriesToInsert)
      .select('id, name')

    if (catError) {
      console.error('   Error creating categories:', catError.message)
    } else {
      insertedCategories?.forEach(c => categoryMap.set(c.name.toLowerCase(), c.id))
      console.log(`   - Created ${insertedCategories?.length || 0} categories`)
    }
  } else {
    console.log('   - All categories already exist')
  }

  // Step 2: Process products (deduplicate by name - keep first occurrence)
  console.log('\n3. Processing products...')

  // Group by base product name (without variant)
  const productMap = new Map<string, Record<string, string>>()
  productRows.forEach(row => {
    const baseName = row.name?.trim()
    if (!baseName) return

    // Keep the first occurrence or the one with the lowest price (base variant)
    if (!productMap.has(baseName)) {
      productMap.set(baseName, row)
    }
  })

  const uniqueProducts = Array.from(productMap.values())
  console.log(`   - ${productRows.length} rows -> ${uniqueProducts.length} unique products`)

  // Fetch existing products
  const { data: existingProducts } = await supabase
    .from('products')
    .select('id, name, sku')

  const existingProductNames = new Set(existingProducts?.map(p => p.name.toLowerCase()) || [])
  const existingSkus = new Set(existingProducts?.map(p => p.sku) || [])

  // Filter new products
  const newProducts = uniqueProducts.filter(p => !existingProductNames.has(p.name.toLowerCase()))
  console.log(`   - ${newProducts.length} new products to import`)

  if (newProducts.length > 0) {
    // Generate SKUs
    let skuIndex = (existingProducts?.length || 0) + 1

    const productsToInsert = newProducts.map(row => {
      let sku = generateSKU(row.name, skuIndex)
      while (existingSkus.has(sku)) {
        skuIndex++
        sku = generateSKU(row.name, skuIndex)
      }
      existingSkus.add(sku)
      skuIndex++

      const categoryId = categoryMap.get(row.category?.toLowerCase())
      const productType = determineProductType(row)
      const sellPrice = parseFloat(row.pos_sell_price) || 0
      const costPrice = parseFloat(row.buy_price) || 0
      const trackInventory = row.track_inventory === '1'
      const stockQty = parseFloat(row.stock_qty) || 0
      const lowStockAlert = parseFloat(row.low_stock_alert) || 5

      return {
        sku,
        name: row.name.trim(),
        description: row.description || null,
        category_id: categoryId || null,
        product_type: productType,
        retail_price: sellPrice,
        wholesale_price: sellPrice * 0.9, // 10% discount for wholesale
        cost_price: costPrice,
        current_stock: trackInventory ? stockQty : 0,
        min_stock_level: lowStockAlert,
        unit: normalizeUnit(row.uom),
        pos_visible: row.published === '1' && row.pos_hidden !== '1',
        available_for_sale: row.published === '1',
        image_url: row.photo_1 || null,
        is_active: true
      }
    })

    // Insert in batches
    const batchSize = 50
    let insertedCount = 0

    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize)
      const { error } = await supabase
        .from('products')
        .insert(batch)

      if (error) {
        console.error(`   Batch ${i / batchSize + 1} error:`, error.message)
      } else {
        insertedCount += batch.length
      }
    }

    console.log(`   - Inserted ${insertedCount} products`)
  }

  // Step 3: Import recipes
  console.log('\n4. Processing recipes...')

  // Fetch all products for mapping
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name')

  const productNameToId = new Map<string, string>()
  allProducts?.forEach(p => productNameToId.set(p.name.toLowerCase(), p.id))

  // Group recipes by product
  const recipeMap = new Map<string, { materialName: string; quantity: number; unit: string }[]>()

  recipeRows.forEach(row => {
    const productName = row.Product?.trim()
    const materialName = row.Material?.trim()
    const quantity = parseFloat(row.Quantity) || 0
    const unit = row['Materiall: uom']?.trim() || 'g'

    if (!productName || !materialName || quantity <= 0) return

    const key = productName.toLowerCase()
    if (!recipeMap.has(key)) {
      recipeMap.set(key, [])
    }

    // Check for duplicates
    const existing = recipeMap.get(key)!
    const alreadyExists = existing.some(
      r => r.materialName.toLowerCase() === materialName.toLowerCase()
    )

    if (!alreadyExists) {
      existing.push({ materialName, quantity, unit })
    }
  })

  console.log(`   - Found ${recipeMap.size} unique product recipes`)

  // Build recipe inserts
  const recipesToInsert: { product_id: string; material_id: string; quantity: number; unit: string }[] = []
  let missingProducts = 0
  let missingMaterials = 0

  for (const [productName, ingredients] of recipeMap) {
    const productId = productNameToId.get(productName)
    if (!productId) {
      missingProducts++
      continue
    }

    for (const ingredient of ingredients) {
      const materialId = productNameToId.get(ingredient.materialName.toLowerCase())
      if (!materialId) {
        missingMaterials++
        continue
      }

      recipesToInsert.push({
        product_id: productId,
        material_id: materialId,
        quantity: ingredient.quantity,
        unit: normalizeUnit(ingredient.unit)
      })
    }
  }

  console.log(`   - ${recipesToInsert.length} recipe ingredients to insert`)
  if (missingProducts > 0) console.log(`   - ${missingProducts} products not found in DB`)
  if (missingMaterials > 0) console.log(`   - ${missingMaterials} materials not found in DB`)

  // Delete existing recipes first (optional - to avoid duplicates)
  console.log('   - Clearing existing recipes...')
  await supabase.from('recipes').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // Insert recipes in batches
  if (recipesToInsert.length > 0) {
    const batchSize = 100
    let insertedCount = 0

    for (let i = 0; i < recipesToInsert.length; i += batchSize) {
      const batch = recipesToInsert.slice(i, i + batchSize)
      const { error } = await supabase
        .from('recipes')
        .insert(batch)

      if (error) {
        console.error(`   Recipe batch ${i / batchSize + 1} error:`, error.message)
      } else {
        insertedCount += batch.length
      }
    }

    console.log(`   - Inserted ${insertedCount} recipe ingredients`)
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('Import Complete!')
  console.log('='.repeat(60))

  // Final counts
  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true })
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
  const { count: recipeCount } = await supabase.from('recipes').select('*', { count: 'exact', head: true })

  console.log(`\nDatabase totals:`)
  console.log(`  - Categories: ${catCount}`)
  console.log(`  - Products: ${prodCount}`)
  console.log(`  - Recipe ingredients: ${recipeCount}`)
}

// Run import
importData().catch(console.error)
