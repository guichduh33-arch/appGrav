/**
 * Script d'importation de recettes avec upsert
 * Contourne le RLS en utilisant les fonctions RPC si disponibles
 */

import XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ekkrzngauxqruvhhstjw.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVra3J6bmdhdXhxcnV2aGhzdGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1OTAyMzcsImV4cCI6MjA4NTE2NjIzN30.pQIsgG0XhAPTLxHg7Hexjsv61oCLT5L-1ZC88-vVX20'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
  console.log('📦 Récupération des produits...')
  const { data: products } = await supabase.from('products').select('id, name')
  const productMap = new Map(products.map(p => [p.name.toLowerCase().trim(), p.id]))
  console.log(`   ${products.length} produits`)

  console.log('📊 Lecture du fichier Excel...')
  const wb = XLSX.readFile('docs/Product Materials-2026-01-01__2026-01-14.xlsx')
  const ws = wb.Sheets[wb.SheetNames[0]]
  const recipes = XLSX.utils.sheet_to_json(ws)
  console.log(`   ${recipes.length} lignes`)

  // Check existing recipes
  console.log('🔍 Vérification des recettes existantes...')
  const { data: existing } = await supabase.from('recipes').select('product_id, material_id')
  const existingSet = new Set((existing || []).map(r => `${r.product_id}-${r.material_id}`))
  console.log(`   ${existing?.length || 0} recettes existantes`)

  // Prepare unique recipes
  const toInsert = []
  const seen = new Set()

  for (const r of recipes) {
    const productId = productMap.get(r.product?.toLowerCase().trim())
    const materialId = productMap.get(r.material?.toLowerCase().trim())
    if (!productId || !materialId) continue

    const key = `${productId}-${materialId}`
    if (seen.has(key) || existingSet.has(key)) continue
    seen.add(key)

    toInsert.push({
      product_id: productId,
      material_id: materialId,
      quantity: (r.qty || 0) * (r['uom conversion'] || 1),
      unit: r.uom || 'kg',
      is_active: true
    })
  }

  console.log(`\n📋 ${toInsert.length} nouvelles recettes à importer`)

  if (toInsert.length === 0) {
    console.log('✅ Aucune nouvelle recette!')
    return
  }

  // Try upsert with onConflict
  console.log('⏳ Tentative d\'insertion avec upsert...')

  let created = 0
  let errors = 0
  const batchSize = 50

  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize)

    const { data, error } = await supabase
      .from('recipes')
      .upsert(batch, {
        onConflict: 'product_id,material_id',
        ignoreDuplicates: true
      })
      .select('id')

    if (error) {
      // If RLS blocks, show message once
      if (error.message.includes('row-level security') && errors === 0) {
        console.log('\n⚠️  RLS bloque l\'insertion. Utilisez le fichier SQL généré:')
        console.log('   supabase/migrations/20260203100000_import_recipes.sql')
        console.log('\n   Appliquez-le via le Dashboard Supabase > SQL Editor')
      }
      errors += batch.length
    } else {
      created += data?.length || batch.length
      process.stdout.write(`\r   ✅ ${created} recettes créées...`)
    }
  }

  console.log('\n')
  console.log('═══════════════════════════════════════')
  console.log(`   ✅ Créées: ${created}`)
  console.log(`   ❌ Erreurs: ${errors}`)
  console.log('═══════════════════════════════════════')
}

main().catch(console.error)
