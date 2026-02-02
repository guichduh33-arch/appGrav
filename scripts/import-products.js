/**
 * Script d'importation de produits depuis Excel
 * Usage: node scripts/import-products.js
 */

import XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const SUPABASE_URL = 'https://ekkrzngauxqruvhhstjw.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVra3J6bmdhdXhxcnV2aGhzdGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1OTAyMzcsImV4cCI6MjA4NTE2NjIzN30.pQIsgG0XhAPTLxHg7Hexjsv61oCLT5L-1ZC88-vVX20'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Mapping des catégories Excel vers types de produits
const RAW_MATERIAL_CATEGORIES = [
  'BEVERAGE', 'CHOCOLAT', 'CLEANING', 'CONDIMENT', 'DAIRY', 'DRY', 'FLOUR',
  'FRUIT', 'KITCHEN SUPLLIES', 'PACKAGING', 'SAUCE', 'SEED', 'VEGETABLE', 'meat'
]

const SEMI_FINISHED_CATEGORIES = ['SFG', 'HASIL BOHEMI']

// Génération de SKU unique
function generateSKU(name, index) {
  const prefix = name
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 3)
    .toUpperCase()
  return `${prefix}-${String(index).padStart(4, '0')}`
}

// Déterminer le type de produit
function getProductType(category) {
  if (RAW_MATERIAL_CATEGORIES.includes(category)) return 'raw_material'
  if (SEMI_FINISHED_CATEGORIES.includes(category)) return 'semi_finished'
  return 'finished'
}

async function importProducts() {
  console.log('📦 Début de l\'importation des produits...\n')

  // 1. Lire le fichier Excel
  const wb = XLSX.readFile('docs/product-1_1000-2025-11-22__.xlsx')
  const ws = wb.Sheets[wb.SheetNames[0]]
  const products = XLSX.utils.sheet_to_json(ws)
  console.log(`📊 ${products.length} produits trouvés dans le fichier Excel\n`)

  // 2. Récupérer les catégories existantes
  console.log('📂 Récupération des catégories existantes...')
  const { data: existingCategories, error: catError } = await supabase
    .from('categories')
    .select('id, name')

  if (catError) {
    console.error('❌ Erreur lors de la récupération des catégories:', catError)
    return
  }

  const categoryMap = new Map()
  for (const cat of existingCategories || []) {
    categoryMap.set(cat.name.toLowerCase(), cat.id)
  }
  console.log(`   ${existingCategories?.length || 0} catégories existantes\n`)

  // 3. Créer les catégories manquantes
  const uniqueCategories = [...new Set(products.map(p => p.category))]
  const missingCategories = uniqueCategories.filter(c => !categoryMap.has(c.toLowerCase()))

  if (missingCategories.length > 0) {
    console.log(`📝 Création de ${missingCategories.length} nouvelles catégories...`)
    for (const catName of missingCategories) {
      const { data: newCat, error } = await supabase
        .from('categories')
        .insert({ name: catName, dispatch_station: 'kitchen' })
        .select('id')
        .single()

      if (error) {
        console.error(`   ❌ Erreur création catégorie "${catName}":`, error.message)
      } else {
        categoryMap.set(catName.toLowerCase(), newCat.id)
        console.log(`   ✅ Catégorie créée: ${catName}`)
      }
    }
    console.log()
  }

  // 4. Récupérer les produits existants (par nom pour éviter les doublons)
  console.log('🔍 Vérification des produits existants...')
  const { data: existingProducts } = await supabase
    .from('products')
    .select('id, name, sku')

  const existingNames = new Set((existingProducts || []).map(p => p.name.toLowerCase()))
  const existingSkus = new Set((existingProducts || []).map(p => p.sku))
  console.log(`   ${existingProducts?.length || 0} produits déjà en base\n`)

  // 5. Préparer les produits à importer
  const productsToInsert = []
  let skipped = 0
  let skuIndex = (existingProducts?.length || 0) + 1

  for (const p of products) {
    // Skip si le produit existe déjà
    if (existingNames.has(p.name.toLowerCase())) {
      skipped++
      continue
    }

    // Générer un SKU unique
    let sku = generateSKU(p.name, skuIndex)
    while (existingSkus.has(sku)) {
      skuIndex++
      sku = generateSKU(p.name, skuIndex)
    }
    existingSkus.add(sku)
    skuIndex++

    const categoryId = categoryMap.get(p.category?.toLowerCase()) || null
    const productType = getProductType(p.category || '')

    productsToInsert.push({
      sku,
      name: p.name,
      category_id: categoryId,
      product_type: productType,
      unit: p.uom || 'pièce',
      cost_price: p.buy_price || 0,
      retail_price: p.pos_sell_price || p.sell_price || 0,
      wholesale_price: p.sell_price !== p.pos_sell_price ? p.sell_price : null,
      current_stock: p.stock_qty || 0,
      min_stock_level: p.low_stock_alert || 5,
      is_active: true,
      pos_visible: p.pos_hidden !== 1,
      available_for_sale: p.published === 1 || (p.pos_sell_price > 0)
    })
  }

  console.log(`📋 Résumé:`)
  console.log(`   - ${skipped} produits ignorés (déjà existants)`)
  console.log(`   - ${productsToInsert.length} produits à importer\n`)

  if (productsToInsert.length === 0) {
    console.log('✅ Aucun nouveau produit à importer!')
    return
  }

  // 6. Insérer les produits par lots de 50
  const batchSize = 50
  let created = 0
  let errors = 0

  console.log('⏳ Importation en cours...')

  for (let i = 0; i < productsToInsert.length; i += batchSize) {
    const batch = productsToInsert.slice(i, i + batchSize)
    const { data, error } = await supabase
      .from('products')
      .insert(batch)
      .select('id')

    if (error) {
      console.error(`   ❌ Erreur lot ${Math.floor(i / batchSize) + 1}:`, error.message)
      errors += batch.length
    } else {
      created += data?.length || 0
      process.stdout.write(`\r   ✅ ${created}/${productsToInsert.length} produits importés...`)
    }
  }

  console.log('\n')
  console.log('═══════════════════════════════════════')
  console.log('📊 RÉSULTATS DE L\'IMPORTATION')
  console.log('═══════════════════════════════════════')
  console.log(`   ✅ Produits créés: ${created}`)
  console.log(`   ⏭️  Produits ignorés: ${skipped}`)
  console.log(`   ❌ Erreurs: ${errors}`)
  console.log('═══════════════════════════════════════\n')
}

importProducts().catch(console.error)
