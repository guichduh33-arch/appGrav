/**
 * Script d'importation de recettes depuis Excel
 * Usage: node scripts/import-recipes.js
 */

import XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const SUPABASE_URL = 'https://ekkrzngauxqruvhhstjw.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVra3J6bmdhdXhxcnV2aGhzdGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1OTAyMzcsImV4cCI6MjA4NTE2NjIzN30.pQIsgG0XhAPTLxHg7Hexjsv61oCLT5L-1ZC88-vVX20'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Génération de SKU unique
function generateSKU(name, prefix, index) {
  const namePart = name
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 3)
    .toUpperCase()
  return `${prefix}-${namePart}-${String(index).padStart(4, '0')}`
}

async function importRecipes() {
  console.log('🧑‍🍳 Début de l\'importation des recettes...\n')

  // 1. Lire le fichier Excel
  const wb = XLSX.readFile('docs/Product Materials-2026-01-01__2026-01-14.xlsx')
  const ws = wb.Sheets[wb.SheetNames[0]]
  const recipes = XLSX.utils.sheet_to_json(ws)
  console.log(`📊 ${recipes.length} lignes de recettes trouvées\n`)

  // 2. Récupérer tous les produits existants
  console.log('📦 Récupération des produits existants...')
  const { data: existingProducts, error: prodError } = await supabase
    .from('products')
    .select('id, name, sku')

  if (prodError) {
    console.error('❌ Erreur:', prodError)
    return
  }

  // Créer un map nom -> id (insensible à la casse)
  const productMap = new Map()
  const skuSet = new Set()
  for (const p of existingProducts || []) {
    productMap.set(p.name.toLowerCase().trim(), p.id)
    skuSet.add(p.sku)
  }
  console.log(`   ${existingProducts?.length || 0} produits en base\n`)

  // 3. Identifier les produits et ingrédients uniques du fichier
  const uniqueProducts = [...new Set(recipes.map(r => r.product?.trim()))]
  const uniqueMaterials = [...new Set(recipes.map(r => r.material?.trim()))]

  // 4. Trouver les ingrédients manquants
  const missingMaterials = uniqueMaterials.filter(m => m && !productMap.has(m.toLowerCase()))

  console.log(`📋 Analyse:`)
  console.log(`   - ${uniqueProducts.length} produits finis`)
  console.log(`   - ${uniqueMaterials.length} ingrédients`)
  console.log(`   - ${missingMaterials.length} ingrédients manquants\n`)

  // 5. Créer les ingrédients manquants
  if (missingMaterials.length > 0) {
    console.log(`📝 Création de ${missingMaterials.length} ingrédients manquants...`)

    // Récupérer la catégorie "Ingrédients" ou la créer
    let ingredientCategoryId = null
    const { data: cats } = await supabase
      .from('categories')
      .select('id, name')
      .ilike('name', '%ingredient%')
      .limit(1)

    if (cats && cats.length > 0) {
      ingredientCategoryId = cats[0].id
    } else {
      // Chercher une catégorie RAW ou créer
      const { data: rawCat } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', '%raw%')
        .limit(1)

      if (rawCat && rawCat.length > 0) {
        ingredientCategoryId = rawCat[0].id
      }
    }

    let skuIndex = existingProducts?.length || 1
    let createdMaterials = 0

    for (const materialName of missingMaterials) {
      // Générer un SKU unique
      let sku = generateSKU(materialName, 'ING', skuIndex)
      while (skuSet.has(sku)) {
        skuIndex++
        sku = generateSKU(materialName, 'ING', skuIndex)
      }
      skuSet.add(sku)
      skuIndex++

      const { data: newProduct, error } = await supabase
        .from('products')
        .insert({
          sku,
          name: materialName,
          product_type: 'raw_material',
          category_id: ingredientCategoryId,
          unit: 'kg',
          cost_price: 0,
          retail_price: 0,
          is_active: true,
          pos_visible: false,
          available_for_sale: false
        })
        .select('id')
        .single()

      if (error) {
        console.error(`   ❌ Erreur création "${materialName}":`, error.message)
      } else {
        productMap.set(materialName.toLowerCase(), newProduct.id)
        createdMaterials++
      }
    }
    console.log(`   ✅ ${createdMaterials} ingrédients créés\n`)
  }

  // 6. Vérifier les produits manquants
  const missingProducts = uniqueProducts.filter(p => p && !productMap.has(p.toLowerCase()))
  if (missingProducts.length > 0) {
    console.log(`⚠️  ${missingProducts.length} produits finis non trouvés:`)
    missingProducts.slice(0, 10).forEach(p => console.log(`   - ${p}`))
    if (missingProducts.length > 10) {
      console.log(`   ... et ${missingProducts.length - 10} autres`)
    }
    console.log()
  }

  // 7. Récupérer les recettes existantes
  console.log('🔍 Vérification des recettes existantes...')
  const { data: existingRecipes } = await supabase
    .from('recipes')
    .select('product_id, material_id')

  const existingRecipeSet = new Set(
    (existingRecipes || []).map(r => `${r.product_id}-${r.material_id}`)
  )
  console.log(`   ${existingRecipes?.length || 0} recettes existantes\n`)

  // 8. Préparer les recettes à importer
  const recipesToInsert = []
  let skipped = 0
  let notFound = 0

  for (const r of recipes) {
    const productName = r.product?.trim()
    const materialName = r.material?.trim()

    if (!productName || !materialName) {
      skipped++
      continue
    }

    const productId = productMap.get(productName.toLowerCase())
    const materialId = productMap.get(materialName.toLowerCase())

    if (!productId || !materialId) {
      notFound++
      continue
    }

    // Vérifier si la recette existe déjà
    const recipeKey = `${productId}-${materialId}`
    if (existingRecipeSet.has(recipeKey)) {
      skipped++
      continue
    }
    existingRecipeSet.add(recipeKey)

    // Calculer la quantité réelle (qty * uom conversion)
    const quantity = (r.qty || 0) * (r['uom conversion'] || 1)

    recipesToInsert.push({
      product_id: productId,
      material_id: materialId,
      quantity: quantity,
      unit: r.uom || 'kg',
      is_active: true
    })
  }

  console.log(`📋 Résumé:`)
  console.log(`   - ${skipped} lignes ignorées (existantes ou vides)`)
  console.log(`   - ${notFound} lignes sans produit/ingrédient trouvé`)
  console.log(`   - ${recipesToInsert.length} recettes à importer\n`)

  if (recipesToInsert.length === 0) {
    console.log('✅ Aucune nouvelle recette à importer!')
    return
  }

  // 9. Insérer les recettes par lots
  const batchSize = 100
  let created = 0
  let errors = 0

  console.log('⏳ Importation en cours...')

  for (let i = 0; i < recipesToInsert.length; i += batchSize) {
    const batch = recipesToInsert.slice(i, i + batchSize)
    const { data, error } = await supabase
      .from('recipes')
      .insert(batch)
      .select('id')

    if (error) {
      console.error(`   ❌ Erreur lot ${Math.floor(i / batchSize) + 1}:`, error.message)
      errors += batch.length
    } else {
      created += data?.length || 0
      process.stdout.write(`\r   ✅ ${created}/${recipesToInsert.length} recettes importées...`)
    }
  }

  console.log('\n')
  console.log('═══════════════════════════════════════')
  console.log('📊 RÉSULTATS DE L\'IMPORTATION')
  console.log('═══════════════════════════════════════')
  console.log(`   ✅ Recettes créées: ${created}`)
  console.log(`   ⏭️  Lignes ignorées: ${skipped}`)
  console.log(`   ⚠️  Non trouvées: ${notFound}`)
  console.log(`   ❌ Erreurs: ${errors}`)
  console.log('═══════════════════════════════════════\n')
}

importRecipes().catch(console.error)
